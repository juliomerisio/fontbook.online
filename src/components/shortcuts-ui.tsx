import * as React from "react";
import { Tooltip } from "@base-ui-components/react/tooltip";
import defaultsDeep from "lodash.defaultsdeep";
import { cn } from "../utils";

export enum Keys {
  Enter = "Enter",
  Space = "Space",
  Control = "Control",
  Shift = "Shift",
  Alt = "Alt",
  Escape = "Escape",
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  Backspace = "Backspace",
  Tab = "Tab",
  CapsLock = "CapsLock",
  Fn = "Fn",
  Command = "Command",
  Insert = "Insert",
  Delete = "Delete",
  Home = "Home",
  End = "End",
  PageUp = "PageUp",
  PageDown = "PageDown",
  PrintScreen = "PrintScreen",
  Pause = "Pause",
}

export const DEFAULT_KEY_MAPPINGS = {
  [Keys.Enter]: {
    symbols: { mac: "↩", default: "↵" },
    label: "Enter",
  },
  [Keys.Space]: {
    symbols: { default: "␣" },
    label: "Space",
  },
  [Keys.Control]: {
    symbols: { mac: "⌃", default: "Ctrl" },
    label: "Control",
  },
  [Keys.Shift]: {
    symbols: { mac: "⇧", default: "Shift" },
    label: "Shift",
  },
  [Keys.Alt]: {
    symbols: { mac: "⌥", default: "Alt" },
    label: "Alt/Option",
  },
  [Keys.Escape]: {
    symbols: { mac: "⎋", default: "Esc" },
    label: "Escape",
  },
  [Keys.ArrowUp]: {
    symbols: { default: "↑" },
    label: "Arrow Up",
  },
  [Keys.ArrowDown]: {
    symbols: { default: "↓" },
    label: "Arrow Down",
  },
  [Keys.ArrowLeft]: {
    symbols: { default: "←" },
    label: "Arrow Left",
  },
  [Keys.ArrowRight]: {
    symbols: { default: "→" },
    label: "Arrow Right",
  },
  [Keys.Backspace]: {
    symbols: { mac: "⌫", default: "⟵" },
    label: "Backspace",
  },
  [Keys.Tab]: {
    symbols: { mac: "⇥", default: "⭾" },
    label: "Tab",
  },
  [Keys.CapsLock]: {
    symbols: { default: "⇪" },
    label: "Caps Lock",
  },
  [Keys.Fn]: {
    symbols: { default: "Fn" },
    label: "Fn",
  },
  [Keys.Command]: {
    symbols: { mac: "⌘", windows: "⊞ Win", default: "Command" },
    label: "Command",
  },
  [Keys.Insert]: {
    symbols: { default: "Ins" },
    label: "Insert",
  },
  [Keys.Delete]: {
    symbols: { mac: "⌦", default: "Del" },
    label: "Delete",
  },
  [Keys.Home]: {
    symbols: { mac: "↖", default: "Home" },
    label: "Home",
  },
  [Keys.End]: {
    symbols: { mac: "↘", default: "End" },
    label: "End",
  },
  [Keys.PageUp]: {
    symbols: { mac: "⇞", default: "PgUp" },
    label: "Page Up",
  },
  [Keys.PageDown]: {
    symbols: { mac: "⇟", default: "PgDn" },
    label: "Page Down",
  },
  [Keys.PrintScreen]: {
    symbols: { default: "PrtSc" },
    label: "Print Screen",
  },
  [Keys.Pause]: {
    symbols: { mac: "⎉", default: "Pause" },
    label: "Pause/Break",
  },
};

interface KeyData {
  symbols: {
    mac?: string;
    windows?: string;
    default: string;
  };
  label: string;
}

interface ShortcutsContextData {
  keyMappings: Record<string, KeyData>;
  os: "mac" | "windows";
}

const ShortcutsContext = React.createContext<ShortcutsContextData>({
  keyMappings: DEFAULT_KEY_MAPPINGS,
  os: "mac",
});

export const useShortcutsContext = () => React.useContext(ShortcutsContext);

interface ShortcutsProviderProps {
  children: React.ReactNode;
  keyMappings?: Record<string, KeyData>;
  os?: ShortcutsContextData["os"];
}

export const ShortcutsProvider = ({
  children,
  keyMappings = {},
  os = "mac",
}: ShortcutsProviderProps) => {
  const keyMappingsWithDefaults = defaultsDeep(
    {},
    keyMappings,
    DEFAULT_KEY_MAPPINGS
  );
  return (
    <Tooltip.Provider>
      <ShortcutsContext.Provider
        value={{ keyMappings: keyMappingsWithDefaults, os }}
      >
        {children}
      </ShortcutsContext.Provider>
    </Tooltip.Provider>
  );
};

interface KeySymbolProps extends React.HTMLProps<HTMLDivElement> {
  keyName: string;
  disableTooltip?: boolean;
}

export const KeySymbol = ({
  keyName,
  disableTooltip = false,
  className,
  ...otherProps
}: KeySymbolProps) => {
  const { keyMappings, os } = useShortcutsContext();
  const keyData = keyMappings[keyName] || {
    symbols: { default: keyName },
    label: keyName,
  };
  const symbol = keyData.symbols[os] || keyData.symbols.default || keyName;
  const label = keyData.label || keyName;

  const keyContent = (
    <div
      className={cn(
        "flex items-center justify-center h-5 min-w-[1.25rem] px-1 w-fit border text-xs rounded-md text-center bg-accent/5",
        className
      )}
      style={{
        color: "var(--foreground)",
        borderColor: "color-mix(in srgb, var(--accent) 20%, #7e7e7eae)",
      }}
      {...otherProps}
    >
      <span className="w-full text-center font-mono">{symbol}</span>
    </div>
  );

  if (disableTooltip || label === symbol) return keyContent;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger className="ring-0">{keyContent}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={10}>
          <Tooltip.Popup className="flex z-50 origin-[var(--transform-origin)] flex-col rounded-md px-2 py-1 text-sm bg-background text-foreground border border-foreground/10 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

interface KeyComboProps extends React.HTMLProps<HTMLDivElement> {
  keyNames: string[];
  disableTooltips?: boolean;
}

export const KeyCombo = ({
  keyNames,
  disableTooltips = false,
  className,
  ...otherProps
}: KeyComboProps) => {
  return (
    <div className={cn("flex gap-1", className)} {...otherProps}>
      {keyNames.map((keyName, i) => (
        <KeySymbol
          key={keyName + i}
          keyName={keyName}
          disableTooltip={disableTooltips}
        />
      ))}
    </div>
  );
};
