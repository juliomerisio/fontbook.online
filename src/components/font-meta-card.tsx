import * as Y from "yjs";
import * as React from "react";
import { FontMeta } from "@/types";
import { toggleFavorite } from "@/store/font-store";
import { Toggle } from "@base-ui-components/react/toggle";
import { BookmarkFilledIcon, BookmarkIcon } from "@/icons/icons";
import { getFontStyles } from "@/hooks/use-local-font-query";

export const FontMetaCard = React.memo(
  function FontMetaCard({
    font,
    yfonts,
    ydoc,
    moreCount = 0,
  }: {
    font: FontMeta;
    yfonts: Y.Array<FontMeta>;
    ydoc: Y.Doc;
    moreCount?: number;
  }) {
    const fontStyles = getFontStyles(font);

    const moreLabel =
      moreCount > 0
        ? `+${moreCount} ${moreCount > 1 ? "styles" : "style"}`
        : "";

    return (
      <div className="border-b-[0.5px] border-foreground/10 p-4 flex flex-col gap-1 min-w-[220px] w-full group relative">
        <div className="flex items-center gap-2 justify-between">
          <div className="text-xs opacity-80 truncate gap-2 flex items-center">
            {font.fullName}
            {moreCount > 0 && (
              <span className="opacity-90 bg-accent/20 px-1.5 py-0.5 rounded-md border border-foreground/10">
                {moreLabel}
              </span>
            )}
          </div>
          <Toggle
            aria-label="Favorite"
            pressed={font.favorite ?? false}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onToggle={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onPressedChange={() => {
              toggleFavorite({ yfonts, ydoc, font });
            }}
            className="outline-none absolute top-2 right-2 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer size-8 flex items-center justify-center rounded-md text-foreground/40 select-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[pressed]:text-foreground"
            render={(props, state) =>
              state.pressed ? (
                <button
                  type="button"
                  {...props}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    props.onClick?.(e);
                  }}
                >
                  <span className="sr-only">Remove from favorites</span>
                  <BookmarkFilledIcon className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  {...props}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    props.onClick?.(e);
                  }}
                >
                  <span className="sr-only">Add to favorites</span>
                  <BookmarkIcon className="size-4" />
                </button>
              )
            }
          />
        </div>

        <div
          className="flex-1 w-full"
          style={{
            containerType: "inline-size",
          }}
        >
          <div
            className="text-xl"
            style={{
              whiteSpace: "nowrap",
              display: "block",
              ...fontStyles,
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
          <div className="text-xs opacity-60 flex justify-between items-center">
            <span>{font.style}</span>
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
  }: {
    fontGroup: FontMeta;
    yfonts: Y.Array<FontMeta>;
    ydoc: Y.Doc;
  }) => {
    const firstStyle = fontGroup.styles[0]
      ? { ...fontGroup.styles[0], styles: [] }
      : undefined;
    const moreCount = fontGroup.styles.length - 1;

    return (
      <div className="flex flex-col gap-2 w-full relative">
        <div className="flex flex-col items-center w-full">
          {firstStyle && (
            <FontMetaCard
              font={firstStyle}
              yfonts={yfonts}
              ydoc={ydoc}
              moreCount={moreCount}
            />
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
