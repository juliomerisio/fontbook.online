import { AnimatedRiveLogo } from "./animated-rive-logo";

export const EmptyStateFavorites = () => {
  return (
    <div className="flex flex-col flex-1  items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="min-w-[300px]  flex h-[300px]">
          <AnimatedRiveLogo src="/logo.riv" />
        </div>
        <div className="text-foreground/60">No favorites</div>
      </div>
    </div>
  );
};
