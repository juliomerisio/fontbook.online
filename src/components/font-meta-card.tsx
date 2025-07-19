import useFitText from "@/hooks/use-fit-text";
import * as Y from "yjs";
import * as React from "react";
import { FontMeta } from "@/types";
import { toggleFavorite } from "@/store/font-store";
import { Toggle } from "@base-ui-components/react/toggle";
import { BookmarkFilledIcon, BookmarkIcon } from "@/icons/icons";
import { Accordion } from "@base-ui-components/react/accordion";

export const FontMetaCard = React.memo(
  function FontMetaCard({
    font,
    yfonts,
    ydoc,
    fontWeightLabels,
    parseFontStyleToWeight,
  }: {
    font: FontMeta;
    yfonts: Y.Array<FontMeta> | null;
    ydoc: Y.Doc | null;
    fontWeightLabels: Record<string, string>;
    parseFontStyleToWeight: (style: string) => number;
  }) {
    const { textRef, containerRef, fontSize } = useFitText({
      minFontSize: 10,
      deps: [font.family],
    });
    return (
      <div
        className="border-b-[0.5px] border-foreground/10  p-2 flex flex-col gap-1 min-w-[220px] w-full min-h-[226px]"
        ref={containerRef}
      >
        <div className="flex items-center gap-2 justify-between">
          <div className="text-xs opacity-80">{font.fullName}</div>
          <Toggle
            aria-label="Favorite"
            pressed={font.favorite ?? false}
            onPressedChange={() => {
              if (yfonts && ydoc) {
                toggleFavorite({ yfonts, ydoc, font });
              }
            }}
            className="flex cursor-pointer size-8 items-center justify-center rounded-sm text-foreground/40 select-none   hover:text-foreground focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800  data-[pressed]:text-foreground"
            render={(props, state) =>
              state.pressed ? (
                <button type="button" {...props}>
                  <BookmarkFilledIcon className="size-5" />
                </button>
              ) : (
                <button type="button" {...props}>
                  <BookmarkIcon className="size-5" />
                </button>
              )
            }
          />
        </div>

        <div
          className="mt-2 mb-1"
          style={{
            containerType: "inline-size",
          }}
        >
          <div
            ref={textRef}
            data-scale-width="true"
            style={{
              whiteSpace: "nowrap",
              display: "block",
              fontFamily: font.family,
              fontSize: fontSize ? `${fontSize}px` : undefined,
              padding: 8,
              borderRadius: 4,
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
          <div className="mt-2 text-xs opacity-50">
            {fontWeightLabels[parseFontStyleToWeight(font.style)] ??
              parseFontStyleToWeight(font.style)}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.font.favorite === nextProps.font.favorite;
  }
);

export const FontFamilyCard = React.memo(
  ({
    fontGroup,
    yfonts,
    ydoc,
    fontWeightLabels,
    parseFontStyleToWeight,
  }: {
    fontGroup: FontMeta;
    yfonts: Y.Array<FontMeta> | null;
    ydoc: Y.Doc | null;
    fontWeightLabels: Record<string, string>;
    parseFontStyleToWeight: (style: string) => number;
  }) => {
    const firstStyle = fontGroup.styles[0]
      ? { ...fontGroup.styles[0], styles: [] }
      : undefined;
    const moreCount = fontGroup.styles.length - 1;
    const moreStyles = fontGroup.styles
      .slice(1)
      .map((s) => ({ ...s, styles: [] }));
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex flex-col gap-2 w-full min-h-[175px] relative">
        <div className="flex flex-col items-center w-full">
          {firstStyle && (
            <FontMetaCard
              font={firstStyle}
              yfonts={yfonts}
              ydoc={ydoc}
              fontWeightLabels={fontWeightLabels}
              parseFontStyleToWeight={parseFontStyleToWeight}
            />
          )}
          {moreCount > 0 && (
            <Accordion.Root
              value={open ? ["more"] : []}
              onValueChange={(v) =>
                setOpen(Array.isArray(v) && v.includes("more"))
              }
              className="flex-1 w-full"
            >
              <Accordion.Item value="more" className="border-0 p-0 m-0 w-full">
                <Accordion.Header className="p-0 m-0">
                  <Accordion.Trigger className="cursor-pointer absolute bottom-5 left-1/2 -translate-x-1/2 group flex items-center gap-1 bg-transparent p-0 m-0 text-xs hover:underline text-foreground/40 before:absolute before:inset-0 before:content-['']">
                    {open
                      ? "Collapse" + " " + fontGroup.family
                      : `+${moreCount} ${moreCount > 1 ? "styles" : "style"}`}
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-visible p-0 m-0">
                  <div className="flex flex-wrap">
                    {moreStyles.map((styleFont, idx) => (
                      <FontMetaCard
                        key={styleFont.postscriptName + idx}
                        font={styleFont}
                        yfonts={yfonts}
                        ydoc={ydoc}
                        fontWeightLabels={fontWeightLabels}
                        parseFontStyleToWeight={parseFontStyleToWeight}
                      />
                    ))}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if favorites have changed
    const prevFavorites = new Set(
      prevProps.fontGroup.styles.map((s) => s.favorite)
    );
    const nextFavorites = new Set(
      nextProps.fontGroup.styles.map((s) => s.favorite)
    );
    return (
      prevFavorites.size === nextFavorites.size &&
      Array.from(prevFavorites).every((f) => nextFavorites.has(f))
    );
  }
);

FontFamilyCard.displayName = "FontFamilyCard";
