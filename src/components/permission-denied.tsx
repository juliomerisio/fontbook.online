import { Logo32 } from "./logo";
import { AnimatedRiveLogo } from "./animated-rive-logo";

export const PermissionDenied = ({
  loadAllFonts,
}: {
  loadAllFonts: () => void;
}) => {
  return (
    <div className="flex flex-col h-[100dvh] items-center justify-center bg-background">
      <div className="flex gap-2 absolute top-0 py-2 w-full justify-between items-center bg-background px-4 border-b border-foreground/10 h-[64px]">
        <Logo32 />
        <div className="w-[90px] "></div>
      </div>
      <div className="flex flex-col  items-center justify-center ">
        <div className="min-w-[300px]  flex h-[300px]">
          <AnimatedRiveLogo src="/logo.riv" />
        </div>
        <button
          className="text-balance text-center cursor-pointer gap-2"
          onClick={loadAllFonts}
        >
          <span className="text-shadow-basic group relative isolate inline-flex items-center justify-center overflow-hidden text-left font-medium transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] before:transtion-opacity rounded-md shadow-[0_1px_theme(colors.white/0.07)_inset,0_1px_3px_theme(colors.gray.900/0.2)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-gradient-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-gradient-to-b after:from-white/10 after:from-[46%] after:to-[54%] after:mix-blend-overlay text-sm h-[1.875rem] px-3 ring-1 bg-foreground/80 dark:bg-background/80 text-white dark:ring-background ring-foreground">
            Allow font permissions
          </span>
        </button>
        <span className="text-foreground/60 mt-2">
          to browse your local fonts in your browser
        </span>
      </div>
    </div>
  );
};
