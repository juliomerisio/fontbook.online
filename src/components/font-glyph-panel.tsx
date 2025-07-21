import * as React from "react";
import { FontMeta } from "@/types";
import { ScrollArea } from "@base-ui-components/react/scroll-area";
import ShortcutsDialog from "./shortcuts-dialog";
import { Radio } from "@base-ui-components/react/radio";
import { RadioGroup } from "@base-ui-components/react/radio-group";
import { useMousetrap } from "@/hooks/use-mouse-trap";

const getFontStyles = (font: Omit<FontMeta, "styles">) => {
  const style = font.style.toLowerCase();

  return {
    // Try PostScript name first, then family name
    fontFamily: `"${font.postscriptName}", "${font.family}", sans-serif`,
    // Use the exact font style from the font metadata
    fontWeight: style.includes("narrow")
      ? 400 // Regular weight for Narrow
      : style.includes("bold")
      ? 700
      : style.includes("medium")
      ? 500
      : style.includes("light")
      ? 300
      : style.includes("black")
      ? 900
      : 400, // Default to regular
    fontStyle:
      style.includes("italic") || style.includes("oblique")
        ? "italic"
        : "normal",
    fontStretch: style.includes("narrow")
      ? "condensed"
      : style.includes("condensed")
      ? "condensed"
      : style.includes("extended") || style.includes("expanded")
      ? "expanded"
      : "normal",
    fontFeatureSettings: '"kern" 1',
    fontVariantLigatures: "common-ligatures",
  };
};

export function FontGlyphPanel({ font }: { font: FontMeta | null }) {
  const [selectedStyle, setSelectedStyle] = React.useState<string | null>(null);

  // Get all unique styles
  const allStyles = React.useMemo(() => {
    if (!font) return [];

    const styles = new Set<string>();
    styles.add(font.style);
    font.styles?.forEach((s) => styles.add(s.style));

    return Array.from(styles)
      .sort()
      .map((style) => {
        if (style === font.style) return font;
        const styleFont = font.styles?.find((s) => s.style === style);
        return styleFont || font; // Fallback to main font if style not found
      });
  }, [font]);

  React.useEffect(() => {
    // Reset selected style when font changes
    if (font) {
      setSelectedStyle(font.style);
    }
  }, [font]);

  useMousetrap([
    {
      keys: ["r"],
      callback: () => {
        // Shuffle font styles
        if (allStyles.length > 1) {
          const currentIndex = allStyles.findIndex(
            (s) => s.style === selectedStyle
          );
          const nextIndex = (currentIndex + 1) % allStyles.length;
          setSelectedStyle(allStyles[nextIndex].style);
        }
      },
    },
  ]);

  if (!font) {
    return (
      <div
        className="hidden xl:flex w-[420px] min-w-[320px] max-w-[480px] bg-background text-foreground  flex-col h-[100dvh] overflow-hidden relative"
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        aria-label="Font Glyph Panel"
      >
        <div className="flex items-center justify-end h-[65px] border-b border-foreground/10 px-4">
          <ShortcutsDialog />
        </div>
        <div className="flex-1 w-full h-full border-l border-foreground/10"></div>
      </div>
    );
  }

  const pangram = "Sphinx of black quartz, judge my vow.";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const symbols = "0123456789!@#$%^&*()_+-={}[]:;";

  // Find the current style object
  const currentStyle =
    selectedStyle === font.style
      ? font
      : font.styles?.find((s) => s.style === selectedStyle) || font;

  const fontStyles = getFontStyles(currentStyle);

  const handleValueChange = (value: unknown) => {
    if (typeof value === "string") {
      setSelectedStyle(value);
    }
  };

  return (
    <div
      className="hidden xl:flex border-l border-foreground/10 w-[420px] min-w-[320px] max-w-[480px] bg-background text-foreground  flex-col h-[100dvh] overflow-hidden relative"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      aria-label="Font Glyph Panel"
    >
      <div className="flex flex-col border-b shrink-0 border-foreground/10">
        <div className="flex items-center justify-between h-[65px] px-4">
          <div className="flex flex-col">
            <h2 className="text-md font-mono font-medium truncate text-foreground">
              {font.family}
            </h2>
            <span className="text-xs opacity-60">{currentStyle.style}</span>
          </div>
          <ShortcutsDialog />
        </div>
      </div>

      <div className="py-4">
        {(font.styles?.length ?? 0) > 0 && (
          <div className="px-4 pb-4">
            <RadioGroup
              value={selectedStyle || font.style}
              onValueChange={handleValueChange}
              className="flex flex-wrap gap-2"
            >
              {allStyles.map((style) => (
                <label key={style.style} className="flex items-center gap-2">
                  <Radio.Root
                    value={style.style}
                    className="flex size-4 items-center justify-center rounded-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-foreground data-[unchecked]:border data-[unchecked]:border-foreground/20"
                  >
                    <Radio.Indicator className="flex before:size-1.5 before:rounded-full before:bg-background data-[unchecked]:hidden" />
                  </Radio.Root>
                  <span className="text-xs leading-none">{style.style}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>
      <ScrollArea.Root className="flex-1 w-full h-full">
        <ScrollArea.Viewport className="h-full w-full p-4 pb-40">
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              <div className="flex w-full items-center">
                <div
                  style={{
                    ...fontStyles,
                    whiteSpace: "nowrap",
                    display: "block",
                    fontSize: "24px",
                  }}
                >
                  {uppercase}
                </div>
              </div>
              <div className="flex w-full items-center">
                <div
                  style={{
                    ...fontStyles,
                    whiteSpace: "nowrap",
                    display: "block",
                    fontSize: "24px",
                  }}
                >
                  {lowercase}
                </div>
              </div>
              <div className="flex w-full items-center">
                <div
                  style={{
                    ...fontStyles,
                    whiteSpace: "nowrap",
                    display: "block",
                    fontSize: "24px",
                  }}
                >
                  {symbols}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8 border-t -mx-4 px-4 border-dashed border-b border-foreground/10 pt-4">
              <h3 className="text-sm font-medium opacity-60">Preview</h3>
              <div className="space-y-4">
                <div className="bg-foreground text-background flex items-center -mx-4 px-4 py-4">
                  <div
                    style={{
                      ...fontStyles,
                      whiteSpace: "nowrap",
                      display: "block",
                      fontSize: "24px",
                    }}
                  >
                    {pangram}
                  </div>
                </div>
                <div className="bg-accent text-foreground dark:text-background flex items-center -mx-4 px-4 py-4">
                  <div
                    style={{
                      ...fontStyles,
                      whiteSpace: "nowrap",
                      display: "block",
                      fontSize: "24px",
                    }}
                  >
                    {pangram}
                  </div>
                </div>
                <div className="bg-background text-foreground flex items-center -mx-4 px-4 py-4">
                  <div
                    style={{
                      ...fontStyles,
                      whiteSpace: "nowrap",
                      display: "block",
                      fontSize: "24px",
                    }}
                  >
                    {pangram}
                  </div>
                </div>
              </div>
            </div>

            {/* Style Showcase */}
            <div className="flex flex-col gap-4 ">
              <h3 className="text-sm font-medium opacity-60">Style Showcase</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="flex items-center justify-center bg-foreground text-background text-4xl aspect-square"
                  style={fontStyles}
                >
                  Bl
                </div>
                <div
                  className="flex items-center justify-center bg-foreground text-background text-4xl aspect-square"
                  style={fontStyles}
                >
                  09
                </div>
                <div
                  className="flex items-center justify-center bg-background text-foreground text-4xl aspect-square border border-foreground/10"
                  style={fontStyles}
                >
                  09
                </div>
                <div
                  className="flex items-center justify-center bg-background text-foreground text-4xl aspect-square border border-foreground/10"
                  style={fontStyles}
                >
                  Bl
                </div>
              </div>
            </div>

            {/* Font Information */}
            <div className="flex flex-col gap-4 mt-8">
              <h3 className="text-sm font-medium opacity-60">
                Font Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="opacity-60">PostScript Name:</span>{" "}
                  {font.postscriptName}
                </p>
                <p>
                  <span className="opacity-60">Style:</span> {font.style}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="m-2 flex w-1 justify-center rounded bg-foreground/10 opacity-0 transition-opacity delay-300 data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[hovering]:duration-75 data-[scrolling]:opacity-100 data-[scrolling]:delay-0 data-[scrolling]:duration-75"
        >
          <ScrollArea.Thumb className="w-full rounded bg-foreground/50  dark:mix-blend-difference" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
