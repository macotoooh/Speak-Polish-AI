import type { WeaknessTag } from "@/lib/weakness-tags";

export type PracticeRecord = {
  id: string;
  sentence: string;
  correction: string;
  pronunciationScore: number;
  createdAt: string;
  weaknessTags?: WeaknessTag[];
};
