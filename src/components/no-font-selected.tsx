import { Logo64 } from "./logo";
import { ShortcutsDialog } from "./shortcuts-dialog";

export const NoFontSelected = () => {
  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="flex flex-col items-center justify-center max-w-[320px] text-center space-y-4 z-10">
        <Logo64 />
        <div>
          <h3 className="text-lg font-medium mb-2 text-shadow-basic">
            Welcome to FontBook
          </h3>
          <p className="text-sm text-foreground/80 text-shadow-basic">
            Select a font from the list to preview its styles, glyphs, and
            detailed information.
          </p>
          <p className="text-sm text-foreground/80 mb-4 mt-4 flex gap-1 items-center justify-center text-shadow-basic">
            Explore the <ShortcutsDialog /> to navigate.
          </p>
        </div>
      </div>
    </div>
  );
};
