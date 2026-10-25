import { Vote } from "../models/Vote";

export async function getPairCounts(
  pairId: string,
  leftId: string,
  rightId: string
) {
  const [left, right] = await Promise.all([
    Vote.countDocuments({ pairId, selectedStudentId: leftId }),
    Vote.countDocuments({ pairId, selectedStudentId: rightId }),
  ]);
  return { left, right };
}