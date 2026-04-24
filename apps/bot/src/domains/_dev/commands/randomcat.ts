import type { Command } from '../../../shared/command.js';

export const randomCatCommand: Command = {
  name: 'randomcat',
  async handler(message, args) {
    console.log('randomcat command received with command:', args);
    const catImages = ['https://i.imgur.com/xJ4oIrC.jpeg', 'https://i.imgur.com/g2BEPjU.jpeg', 'https://i.imgur.com/c7FhEn6.png'];

    const randomUrl = catImages[Math.floor(Math.random() * catImages.length)];

    if (!randomUrl) return;

    console.log('Random cat URL:', randomUrl);
    await message.reply({
      content: 'UN CHAT 🐱 !:',
      embeds: [{ image: { url: randomUrl } }],
    });
    return;
  },
};
