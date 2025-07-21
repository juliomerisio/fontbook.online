"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-webgl2";
import { useRef } from "react";

export const AnimatedRiveLogo = ({ src }: { src: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { RiveComponent } = useRive({
    src: src,
    stateMachines: "State Machine 1",
    artboard: "Artboard 2",
    layout: new Layout({
      fit: Fit.FitWidth,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  return (
    <div className="w-full h-full" ref={ref}>
      <RiveComponent />
    </div>
  );
};
