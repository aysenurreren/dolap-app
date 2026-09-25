import { z } from 'zod';

export const saveOutfitSchema = z.object({
  clothingItemIds: z.array(z.string().uuid()).min(2).max(5),
});

export type SaveOutfitInput = z.infer<typeof saveOutfitSchema>;