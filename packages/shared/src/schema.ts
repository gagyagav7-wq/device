import { z } from 'zod';
export const SnapshotSchema = z.object({
  timestamp: z.number(), battery: z.any(), memory: z.any(), cpu: z.any(), storage: z.any(), network: z.any(), uptime: z.number()
});
