import { Logo32 } from "./logo";

export const Loading = () => {
  return (
    <div className="min-h-[100dvh] flex flex-row">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex gap-2 absolute top-0 py-2 w-full justify-between items-center bg-background px-4 border-b border-foreground/10 h-16">
          <Logo32 />
          <div className="w-[90px] "></div>
        </div>
      </div>
    </div>
  );
};
