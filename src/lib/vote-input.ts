import { z } from 'zod';

export const phaseInput = z.object({ matchId: z.string().uuid(), phase: z.enum(['pre', 'post']) });
export const voteInput = phaseInput.extend({ choiceClubId: z.string().uuid() }).strict();