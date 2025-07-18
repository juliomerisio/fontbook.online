"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-webgl2";
import { useRef } from "react";

const RiveImpl = ({ src }: { src: string }) => {
  const { RiveComponent } = useRive({
    // Load a local riv `clean_the_car.riv` or upload your own!
    src: src,
    // Be sure to specify the correct state machine (or animation) name
    stateMachines: "State Machine 1",
    artboard: "Artboard 2",
    // This is optional.Provides additional layout control.
    layout: new Layout({
      fit: Fit.FitWidth, // Change to: rive.Fit.Contain, or Cover
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
