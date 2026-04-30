export type HistoryTargetType =
  | 'character_instance'
  | 'character_template'
  | 'devil_fruit_instance'
  | 'devil_fruit_template'
  | 'player'
  | 'resource_instance'
  | 'resource_template'
  | 'ship';

export type HistoryTarget = { type: HistoryTargetType; id: number };

export type HistorySource = 'discord_button' | 'discord_command' | 'cron' | 'admin';
