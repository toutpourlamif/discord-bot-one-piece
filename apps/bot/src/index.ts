import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';

import { findOrCreatePlayer, getKarmaGrade } from './domains/player/index.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN manquant dans apps/bot/.env.local');
}

const prefix = process.env.COMMAND_PREFIX;
if (!prefix) {
  throw new Error('COMMAND_PREFIX manquant dans apps/bot/.env.local');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot connecté : ${c.user.tag}`);
});

// TODO: supprimer avant la PROD (j'ai fussioner les 2 tests)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.startsWith(prefix)) return;

  const withoutPrefix = content.slice(prefix.length).trim();
  const normalized = withoutPrefix.toLowerCase();

  if (normalized === 'one piece') {
    await message.reply('hello everyone');
    return;
  }

  const [command, ...args] = withoutPrefix.split(/\s+/);

  if (command?.toLowerCase() === 'repeat') {
    const repeatText = args.join(' ');

    if (!repeatText) {
      await message.reply('Tu dois fournir un texte.');
      return;
    }

    await message.reply(repeatText);
  }
  // TODO: supprimer en prod
  if (command === 'debug') {
    const { player, created } = await findOrCreatePlayer(
      message.author.id,
      message.author.username,
    );
    await message.reply(
      `${created ? '🆕 Player créé' : '✅ Player existant'}\n\`\`\`json\n${JSON.stringify(player, null, 2)}\n\`\`\``,
    );
  }

  // TODO: supprimer avant la PROD - commande debug karma
  if (command === 'karma') {
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);

    const grade = getKarmaGrade(player.karma);

    await message.reply(`Karma: ${grade} (${player.karma})`);
    return;
  }

  if (command?.toLowerCase() === 'embed') {
    const dateUnix = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Author: name (cliquable)',
        iconURL: 'https://placehold.co/64x64/5865F2/FFFFFF.png?text=A',
        url: 'https://x.com/402rayan_',
      })
      .setTitle('Title: title (cliquable)')
      .setURL('https://x.com/402rayan_')
      .setColor(0x5865f2)
      .setDescription(
        [
          'Description: description',
          '',
          'Color: color — barre verticale à gauche (`setColor(0x5865F2)`)',
          '',
          '**gras** `**x**` — *italique* `*x*` — ***gras italique*** `***x***`',
          '__souligné__ `__x__` — ~~barré~~ `~~x~~`',
          '`code inline` — ||spoiler|| — [lien markdown](https://discord.com)',
          '-# Subtext `-# x`',
          '',
          '# Header 1 `# x`',
          '## Header 2 `## x`',
          '### Header 3 `### x`',
          '',
          'Listes `- x` :',
          '- item 1',
          '- item 2',
          '  - sous-item (2 espaces)',
          '',
          'Liste numérotée `1. x` :',
          '1. item',
          '2. item',
          '',
          '> Blockquote simple `> x`',
          '',
          `Timestamp relatif \`<t:UNIX:R>\` : <t:${dateUnix}:R>`,
          `Timestamp complet \`<t:UNIX:F>\` : <t:${dateUnix}:F>`,
          `Timestamp date \`<t:UNIX:D>\` : <t:${dateUnix}:D>`,
          `Timestamp heure \`<t:UNIX:T>\` : <t:${dateUnix}:T>`,
        ].join('\n'),
      )
      .setThumbnail('https://placehold.co/128x128/5865F2/FFFFFF.png?text=Thumbnail')
      .setImage(
        'https://altselection.ouest-france.fr/wp-content/uploads/2025/09/One-Piece-Luffy-pourrait-voir-sa-prime-finale-atteindre-56-milliards-de-berries.jpg',
      )
      .addFields(
        { name: 'Field name 1 (inline)', value: 'Field value', inline: true },
        { name: 'Field name 2 (inline)', value: 'Field value', inline: true },
        { name: 'Field name 3 (inline)', value: 'Field value', inline: true },
        {
          name: 'Field name 4 (non-inline)',
          value: 'Field value — prend toute la largeur',
          inline: false,
        },
        {
          name: 'Field — blockquote multi-ligne `>>>`',
          value: '>>> Ligne 1\nLigne 2\nLigne 3',
          inline: false,
        },
        {
          name: 'Field — bloc de code avec coloration',
          value: '```ts\nconst foo: string = "bar";\n```',
          inline: false,
        },
      )
      .setFooter({
        text: 'Footer: footer (la date après • vient de setTimestamp)',
        iconURL: 'https://placehold.co/32x32/5865F2/FFFFFF.png?text=F',
      })
      .setTimestamp(new Date());

    await message.reply({ embeds: [embed] });
    return;
  }
});

await client.login(token);
