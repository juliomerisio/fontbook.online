import * as React from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import { ShortcutsProvider, KeyCombo, Keys } from "./shortcuts-ui";
import { parseAsString, useQueryState } from "nuqs";

const SHORTCUTS = [
  {
    keys: [Keys.ArrowDown],
    alt: ["j"],
    description: "Move focus to next font",
  },
  {
    keys: [Keys.ArrowUp],
    alt: ["k"],
    description: "Move focus to previous font",
  },
  {
    keys: ["f"],
    description: "Toggle favorite for focused font",
  },
  {
    keys: ["t"],
    description: "Toggle between All and Favorites tabs",
  },
];

export default function ShortcutsDialog() {
  const [showShortcuts, setShowShortcuts] = useQueryState(
    "shortcuts",
    parseAsString.withDefault("closed")
  );

  const handleOpenChange = (open: boolean) => {
    setShowShortcuts(open ? "open" : "closed");
  };

  return (
    <Dialog.Root
      open={showShortcuts === "open"}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Trigger className="group relative isolate inline-flex items-center justify-center overflow-hidden text-left font-medium transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] before:transtion-opacity rounded-md shadow-[0_1px_theme(colors.white/0.07)_inset,0_1px_3px_theme(colors.gray.900/0.2)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-gradient-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-gradient-to-b after:from-white/10 after:from-[46%] after:to-[54%] after:mix-blend-overlay text-sm h-[1.875rem] px-3 ring-1 bg-gray-900 text-white ring-gray-900">
        Shortcuts
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/10 backdrop-blur transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 text-foreground outline outline-1 outline-foreground/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
          <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium text-foreground">
            Keyboard Shortcuts
          </Dialog.Title>
          <Dialog.Description className="mb-6 text-base text-foreground/60">
            Use these shortcuts to navigate and manage your local fonts
            efficiently.
          </Dialog.Description>
          <Dialog.Close
            tabIndex={0}
            className="absolute right-2 top-2 hover:bg-foreground/5  flex p-2 rounded-full items-center justify-center  border border-foreground/10 bg-background  text-base font-medium text-foreground select-none  focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-background/60"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Dialog.Close>
          <ShortcutsProvider os="mac">
            <div className="mb-6">
              <table className="w-full text-left text-sm">
                <tbody>
                  {SHORTCUTS.map((shortcut, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-foreground/80">
                        {shortcut.description}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <div className="flex gap-2 items-center justify-end">
                          <KeyCombo keyNames={shortcut.keys} />
                          {shortcut.alt && (
                            <>
                              <span className="text-foreground/40 text-xs">
                                or
                              </span>
                              <KeyCombo keyNames={shortcut.alt} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ShortcutsProvider>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
