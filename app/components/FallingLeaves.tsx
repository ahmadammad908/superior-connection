"use client";

import { FallingLeaves } from "falling-leaves/react";

export default function FallingLeavesEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      <FallingLeaves
        fullScreen
        shapes={['maple', 'ginkgo', 'oak', 'birch']}
        count={30}
        speed={[0.6, 1.5]}
        wind={[-1, 1]}
        opacity={0.8}
      />
    </div>
  );
}