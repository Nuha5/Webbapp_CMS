// collisionDetection, move helpers

import type { CollisionDetection } from "@dnd-kit/core";
import { pointerWithin, rectIntersection, closestCorners } from "@dnd-kit/core";

export const collisionDetection: CollisionDetection = (args) => {
  // 1) Prioritera det som pekaren är över (fixar off-by-one)
  const pointer = pointerWithin(args);
  if (pointer.length) return pointer;

  // 2) Fallback: rektangel-intersection
  const intersect = rectIntersection(args);
  if (intersect.length) return intersect;

  // 3) Sista fallback: närmast hörn
  return closestCorners(args);
};

