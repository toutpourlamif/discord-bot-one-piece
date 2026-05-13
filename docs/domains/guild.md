# Domaine : guild

## Concept

Une **guild** = un serveur Discord où le bot tourne. Chaque fois que le bot reçoit un message, on save la guilde (le serveur) pour pouvoir lui rattacher des préférences (langue, préfixe). Aussi ça peut permettre de dire qu'un Joueur X est issu du bot Y. (exemple: Ilyess a été créé sur le serveur X).

## Table

| Colonne    | Type           | Note                                                        |
| ---------- | -------------- | ----------------------------------------------------------- |
| `id`       | `varchar(32)`  | PK — l'ID Discord du serveur                                |
| `name`     | `varchar(200)` | Nom du serveur, rafraîchi à chaque action depuis ce serveur |
| `language` | `varchar(8)`   | Langue préférée du serveur, défaut `fr`                     |
| `prefix`   | `varchar(8)`   | Préfixe des commandes, défaut `!`                           |

## Refresh du nom

Le nom d'un serveur est rafraîchi **opportunément** : à chaque fois quele bot est appelé depuis un serveur, le router fait un upsert. (Upsert = Insert ou Update => donc si la guilde n'existe pas, on la créé, sinon on update son NOM avec le nom actuel (au cas où ça a changé))
