import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { Command } from '../../../shared/command.js';
import { DISCORD_ACTION_ROW_MAX_BUTTONS } from '../../../shared/constants.js';

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntegersExcluding(count: number, excludedNumbers: Array<number>): Array<number> {
  const results: Array<number> = [];

  while (results.length < count) {
    const randomNumber = getRandomInteger(0, 100);

    if (excludedNumbers.includes(randomNumber) || results.includes(randomNumber)) {
      continue;
    }

    results.push(randomNumber);
  }

  return results;
}

function shuffleNumbers(numbers: Array<number>): Array<number> {
  return numbers.sort(() => Math.random() - 0.5);
}

export const nombreCommand: Command = {
  name: 'nombre',
  async handler(message, args) {
    const rawNumber = args[0];

    if (!rawNumber) {
      await message.reply('Tu dois donner un nombre.');
      return;
    }

    const number = Number(rawNumber);

    if (!Number.isFinite(number)) {
      await message.reply('Tu dois donner un nombre valide.');
      return;
    }

    if (!Number.isInteger(number)) {
      await message.reply('Tu dois donner un nombre entier.');
      return;
    }

    const randomNumbers = getRandomIntegersExcluding(DISCORD_ACTION_ROW_MAX_BUTTONS - 1, [number]);
    const numbers = [number, ...randomNumbers];

    const shuffledNumbers = shuffleNumbers(numbers);

    const buttons = shuffledNumbers.map((value) =>
      new ButtonBuilder().setCustomId(`nombre:${value}`).setLabel(String(value)).setStyle(ButtonStyle.Secondary),
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    await message.reply({
      content: 'Choisis le bon nombre :',
      components: [row],
    });
  },
};
