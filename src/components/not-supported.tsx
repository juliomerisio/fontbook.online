import { Logo32 } from "./logo";
import { AnimatedRiveLogo } from "./animated-rive-logo";

export const NotSupported = () => {
  return (
    <div className="flex flex-col h-[100dvh] items-center justify-center bg-background">
      <div className="flex gap-2 absolute top-0 py-2 w-full justify-between items-center bg-background px-4 border-b border-foreground/10 h-[64px]">
        <Logo32 />
        <div className="w-[90px] "></div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="min-w-[300px]  flex h-[300px]">
          <AnimatedRiveLogo src="/logo.riv" />
        </div>
        <div className="text-balance text-center max-w-[300px]">
          Local Font Access API is not supported in this browser.
        </div>
      </div>
    </div>
  );
};
