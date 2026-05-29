# Onboarding

L'onboarding est le parcours guidé d'un nouveau joueur. Tant qu'il dure, le moteur du monde est en pause (aucun event probabiliste généré) et le gate intercepte toute commande hors whitelist.

## État

L'état tient dans un seul champ :

```ts
player.onboarding_step;
```

- `null` → le joueur est libre, le monde tourne ;
- sinon → contient l'id du step courant. Le `default` DB est la première étape.

À la création du joueur, **aucun message n'est envoyé**. Le joueur tape (ou se cogne contre) le gate, qui lui affiche l'embed de l'étape avec un bouton « Continuer ».

---

## Script

Le parcours est déclaré dans `onboarding/script.ts` — un tableau ordonné. La transition vers le step suivant est implicite (élément suivant du tableau).

Deux types de steps :

### `scene`

Un embed scripté affiché tel quel, avec un bouton « Continuer ». Le clic appelle `advanceOnboarding` puis re-render le message avec la vue du step suivant (ou la vue de fin si c'était le dernier).

Chaque page de narration = un step à part entière (ex : `gold-roger-1`, `gold-roger-2`...). Pas de moteur d'event derrière : juste un embed + un bouton avec customId `onb-next:<stepId>`.

```ts
{ id: 'intro', type: 'scene', embed: buildIntroEmbed }
```

### `mission`

Une commande riggée attendue. Le step déclare :

- `expects` → le nom de la commande attendue ;
- `run` → le handler riggé exécuté à la place du vrai (a accès à `tx`) ;
- `reminder` → l'embed affiché quand le joueur tape autre chose.

Le gate exécute `run` **et** `advanceOnboarding` dans la même transaction, puis poste la suite (vue du step suivant ou completed).

```ts
{ id: 'fish-mission', type: 'mission', expects: 'fish', run: runFishStep, reminder: buildFishReminder }
```

---

## Vue partagée

`buildOnboardingView(player)` est synchrone, consommée par :

- le gate (commande bloquée, y compris `!recap`) ;
- le button handler `onb-next` (après advance).

Comportement :

- scene → embed + bouton Continuer ;
- mission → `step.reminder(player)`.

`buildOnboardingCompletedView()` est la vue affichée à la fin du parcours.

---

## Gate

`interceptOnboardingCommand` est appelé par le router avant l'auto-sync.

- la commande a `requiresOnboardingFinished: false` → pass-through (`!info`, `!recap`, `_dev`). Le défaut est `true` (gated) ; `!intro` n'opt-out pas car c'est la commande attendue par la 1ʳᵉ mission ;
- step `scene` → tout est bloqué, on renvoie `buildOnboardingView` ;
- step `mission` → seul `expects` passe → `run` + `advanceOnboarding` en tx, puis on poste la suite ; tout le reste → `step.reminder`.

Pendant la mission, on prend un `FOR UPDATE` sur le player et on re-vérifie la step avant d'exécuter : deux commandes simultanées ne peuvent pas avancer deux fois.

---

## Button `onb-next`

Le clic sur Continuer fait :

1. `deferUpdate` ;
2. lock du player + re-check `onboardingStep === <stepId du customId>` ;
3. si match → `advanceOnboarding` en tx ;
4. si pas match → clic obsolète, on re-render simplement la vue courante.

Côté UX, si le joueur a plusieurs messages anciens avec un bouton Continuer obsolète, cliquer met le message à jour avec son état actuel (jamais d'avance accidentelle).

---

## World engine

`synchronizePlayer` early-return tant que `onboardingStep !== null`. Aucun event random n'est tiré pendant l'onboarding.

À la fin, `advanceOnboarding` repositionne `last_processed_bucket_id` au bucket courant pour éviter de rejouer tout l'historique d'un coup.

---

## Traçabilité

Chaque transition écrit dans `history` :

- `onboarding.stepCompleted` → payload `{ step }` ;
- `onboarding.completed` → fin de parcours.

---

## Ajouter ou réordonner une étape

1. Ajouter l'id dans `ONBOARDING_STEP_IDS` (package `db`) + migration enum PostgreSQL.
2. Selon le type :
   - `scene` → fonction `(player) => EmbedBuilder` dans `script.ts`, déclarer le step.
   - `mission` → module `steps/step-<nom>.ts` qui exporte `run` + `reminder`.
3. Insérer le step dans `ONBOARDING_SCRIPT`. Le script `throw` au boot si un id de l'enum n'a pas de step ou si des ids sont dupliqués.
