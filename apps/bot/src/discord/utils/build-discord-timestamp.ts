import { time, TimestampStyles, type TimestampStylesString } from 'discord.js';

/** Construit un timestamp Discord `<t:TIMESTAMP:STYLE>` */
export function buildDiscordTimestamp(date: Date, style: TimestampStylesString = TimestampStyles.RelativeTime): string {
  return time(date, style);
}
