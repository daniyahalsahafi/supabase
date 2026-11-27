import { beforeEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { voteInput } from '@/lib/vote-input';

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), session: { data: { voterId: 'server-created-voter' }, update: vi.fn() } }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let validate: { parse: (input: unknown) => unknown } | undefined;
    const chain = {
      middleware: () => chain,
      inputValidator: (schema: typeof validate) => { validate = schema; return chain; },
      handler: (handler: (input: { data: unknown }) => unknown) =>
        (input: { data: unknown }) => handler({ data: validate ? validate.parse(input.data) : input.data }),
    };
    return chain;
  },
}));
vi.mock('@tanstack/react-start/server', () => ({ useSession: async () => mocks.session, setResponseHeader: vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { rpc: mocks.rpc } }));

import { castVote } from '@/lib/platform.functions';

const input = { matchId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', phase: 'pre' as const, choiceClubId: '11111111-1111-4111-8111-111111111111' };
describe('Guest voting without attendance requirements', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', webcrypto);
    vi.stubEnv('VOTING_SESSION_SECRET', 'test-only-secret-with-at-least-thirty-two-characters');
    mocks.rpc.mockReset();
    mocks.rpc.mockResolvedValue({ error: null });
  });

  it('accepts a vote without location or an attendance code', async () => {
    expect(voteInput.parse(input)).toEqual(input);
    await expect(castVote({ data: input })).resolves.toEqual({ success: true });
    expect(mocks.rpc).toHaveBeenCalledWith('accept_match_vote', {
      p_match: input.matchId, p_phase: 'pre', p_choice: input.choiceClubId,
      p_voter: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it('uses the same server identity on repeat submissions and reports database deduplication', async () => {
    await castVote({ data: input });
    mocks.rpc.mockResolvedValueOnce({ error: { code: '23505' } });
    await expect(castVote({ data: input })).rejects.toThrow('سبق تسجيل صوتك لهذه المسابقة والمرحلة');
    const first = mocks.rpc.mock.calls[0]?.[1] as { p_voter: string };
    const second = mocks.rpc.mock.calls[1]?.[1] as { p_voter: string };
    expect(first.p_voter).toHaveLength(64);
    expect(second.p_voter).toBe(first.p_voter);
  });

  it('keeps the identity stable while sending the post phase independently', async () => {
    await castVote({ data: input });
    await castVote({ data: { ...input, phase: 'post' } });
    const first = mocks.rpc.mock.calls[0]?.[1] as { p_voter: string };
    expect(mocks.rpc).toHaveBeenLastCalledWith('accept_match_vote', expect.objectContaining({ p_phase: 'post', p_voter: first.p_voter }));
  });

  it('rejects a visitor-supplied voter identity', () => {
    expect(voteInput.safeParse({ ...input, voterToken: 'forged-voter' }).success).toBe(false);
  });
});