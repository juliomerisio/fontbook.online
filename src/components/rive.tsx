"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-webgl2";
import { useRef } from "react";

const RiveImpl = ({ src }: { src: string }) => {
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
  

  return <RiveComponent />;
};

export const Rive = ({ src }: { src: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-full" ref={ref}>
      <RiveImpl src={src} />
    </div>
  );
};
