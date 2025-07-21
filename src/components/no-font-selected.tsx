import { Logo64 } from "./logo";
import { ShortcutsDialog } from "./shortcuts-dialog";

export const NoFontSelected = () => {
  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="flex flex-col items-center justify-center max-w-[320px] text-center space-y-4 z-10">
        <Logo64 />
        <div>
          <h3 className="text-lg font-medium mb-2 [text-shadow:_0_0.5px_0px_rgba(0,0,0,0.15)]">
            Welcome to FontBook
          </h3>
          <p className="text-sm text-foreground/80 [text-shadow:_0_0.5px_0px_rgba(0,0,0,0.1)]">
            Select a font from the list to preview its styles, glyphs, and
            detailed information.
          </p>
          <p className="text-sm text-foreground/80 mb-4 mt-4 flex gap-1 items-center justify-center [text-shadow:_0_0.5px_0px_rgba(0,0,0,0.1)]">
            Explore the <ShortcutsDialog /> to navigate.
          </p>
        </div>
      </div>
    </div>
  );
};
