import { z } from 'zod';

export const BatterySchema = z.object({
  level: z.number(),
  status: z.string(),
  temp: z.number(), // Celsius
  voltage: z.number(), // V
  current: z.number(), // mA
  power: z.number(), // W
  plugged: z.boolean(),
});

export const MemorySchema = z.object({
  total: z.number(),
  used: z.number(),
  free: z.number(),
  available: z.number(),
});

export const CPUSchema = z.object({
  load: z.number(), // Percentage
  temp: z.number().optional(),
});

export const StorageSchema = z.object({
  total: z.number(),
  used: z.number(),
  free: z.number(),
});

export const NetworkSchema = z.object({
  rxDelta: z.number(),
  txDelta: z.number(),
  ip: z.string(),
});

export const SnapshotSchema = z.object({
  timestamp: z.number(),
  battery: BatterySchema,
  memory: MemorySchema,
  cpu: CPUSchema,
  storage: StorageSchema,
  network: NetworkSchema,
  uptime: z.number(),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
