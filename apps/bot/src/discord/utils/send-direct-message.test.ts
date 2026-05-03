import { describe, expect, it, vi } from 'vitest';

import { sendDirectMessage } from './send-direct-message.js';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
describe('sendDirectMessage', () => {
  it('retourne delivered: true quand le DM est envoyé', async () => {
    const mockUser = { send: vi.fn().mockResolvedValue(undefined) };
    const mockClient = { users: { fetch: vi.fn().mockResolvedValue(mockUser) } };

    const result = await sendDirectMessage({
      client: mockClient as any,
      discordId: '123456',
      view: { content: 'hello' } as any,
    });

    expect(result).toEqual({ delivered: true });
  });

  it('retourne delivered: false quand fetch throw', async () => {
    const mockClient = { users: { fetch: vi.fn().mockRejectedValue(new Error('User not found')) } };

    const result = await sendDirectMessage({
      client: mockClient as any,
      discordId: '999',
      view: { content: 'hello' } as any,
    });

    expect(result).toEqual({ delivered: false });
  });

  it('retourne delivered: false quand send throw', async () => {
    const mockUser = { send: vi.fn().mockRejectedValue(new Error('Cannot send DM')) };
    const mockClient = { users: { fetch: vi.fn().mockResolvedValue(mockUser) } };

    const result = await sendDirectMessage({
      client: mockClient as any,
      discordId: '123456',
      view: { content: 'hello' } as any,
    });

    expect(result).toEqual({ delivered: false });
  });
});
