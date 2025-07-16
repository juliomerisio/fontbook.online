"use client";

import { useRef } from "react";
import { useLocalFonts } from "@/hooks/use-local-fonts";
import { fonts, uiState, toggleFavorite } from "@/store/font-store";
import { useSnapshot } from "valtio";
import * as React from "react";
import { Tabs } from "@base-ui-components/react/tabs";
import { Toggle } from "@base-ui-components/react/toggle";
import { type FontMeta } from "@/types";
import * as Y from "yjs";
import { HeartFilledIcon, HeartOutlineIcon, PlusIcon } from "@/icons/icons";

import { VList, VListHandle } from "virtua";
import { Accordion } from "@base-ui-components/react/accordion";

const NotSupported = () => {
  return (
    <div className="text-yellow-600">
      Local Font Access API is not supported in this browser.
    </div>
  );
};

const PermissionDenied = () => {
  return (
    <div className="text-red-600">
      Local Font Access API is denied. Please allow access in your browser.
    </div>
  );
};

export const LocalFontViewer = () => {
  const { supportAndPermissionStatus, loadAllFonts, clearCache, yfonts, ydoc } =
    useLocalFonts({
      fonts,
      uiState,
      documentName: "local-fonts-viewer",
    });

  const snapshot = useSnapshot(uiState);
  const fontsSnapshot = useSnapshot(fonts);
  const [tab, setTab] = React.useState("all");
  const vlistRef = useRef<VListHandle>(null);

  const groupedFonts = React.useMemo(() => {
    const familyMap = new Map<string, FontMeta & { styles: FontMeta[] }>();
    fontsSnapshot.forEach((font) => {
      if (!familyMap.has(font.family)) {
        familyMap.set(font.family, {
          ...font,
          styles: [],
        });
      }
      familyMap.get(font.family)!.styles.push({ ...font, styles: [] });
    });
    familyMap.forEach((value) => {
      value.styles.sort((a, b) => a.style.localeCompare(b.style));
    });
    return Array.from(familyMap.values());
  }, [fontsSnapshot]);

  const filteredGroupedFonts = React.useMemo(() => {
    if (tab === "favorites") {
      return groupedFonts.filter((group) =>
        group.styles.some((style) => style.favorite)
      );
    }
    return groupedFonts;
  }, [groupedFonts, tab]);

  if (snapshot.loading) {
    return (
      <div className="flex gap-2 mb-2">
        <button
          onClick={loadAllFonts}
          disabled={snapshot.loading}
          className="border px-2 py-1 rounded"
        >
          Load All Fonts
        </button>
        <button onClick={clearCache} className="border px-2 py-1 rounded">
          Clear All Fonts
        </button>
      </div>
    );
  }

  if (supportAndPermissionStatus === "not-supported") {
    return <NotSupported />;
  }

  if (supportAndPermissionStatus === "denied") {
    return <PermissionDenied />;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="flex gap-2 mb-2">
        <button
          onClick={loadAllFonts}
          disabled={snapshot.loading}
          className="border px-2 py-1 rounded"
        >
          Load All Fonts
        </button>
        <button onClick={clearCache} className="border px-2 py-1 rounded">
          Clear All Fonts
        </button>
      </div>

      <Tabs.Root
        value={tab}
        onValueChange={setTab}
        className="rounded-md  mt-4"
      >
        <Tabs.List className="relative z-0 flex gap-1 px-1">
          <Tabs.Tab
            value="all"
            className="flex h-8 items-center justify-center border-0 px-2 text-sm font-medium break-keep whitespace-nowrap text-gray-100 outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-white focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:text-gray-900"
          >
            All
          </Tabs.Tab>
          <Tabs.Tab
            value="favorites"
            className="flex h-8 items-center justify-center border-0 px-2 text-sm font-medium break-keep whitespace-nowrap text-gray-100 outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-white focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:text-gray-900"
          >
            Favorites
          </Tabs.Tab>
          <Tabs.Indicator className="absolute top-1/2 left-0 z-[-1] h-6 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] -translate-y-1/2 rounded-sm bg-gray-100 transition-all duration-200 ease-in-out" />
        </Tabs.List>
        <Tabs.Panel
          value={tab}
          className="mt-4 h-full flex flex-col flex-1 min-h-[90vh]"
        >
          <VList ref={vlistRef} style={{ flex: 1 }}>
            {filteredGroupedFonts.length === 0 && <div>No fonts loaded.</div>}
            {filteredGroupedFonts.map((fontGroup, index) => (
              <FontFamilyCard
                key={fontGroup.family + index}
                fontGroup={fontGroup}
                yfonts={yfonts}
                ydoc={ydoc}
                nStyles={1} // Only show the first style
              />
            ))}
          </VList>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
};

const FontFamilyCard = React.memo(
  ({
    fontGroup,
    yfonts,
    ydoc,
  }: {
    fontGroup: FontMeta;
    yfonts: Y.Array<FontMeta> | null;
    ydoc: Y.Doc | null;
    nStyles?: number;
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
      <div className="flex flex-col gap-2 mb-2 w-full">
        <div className="flex flex-col items-center gap-2 w-full">
          {firstStyle && (
            <FontMetaCard font={firstStyle} yfonts={yfonts} ydoc={ydoc} />
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
                  <Accordion.Trigger className="group flex items-center gap-1 bg-transparent p-0 m-0 text-xs text-gray-500 ml-2 hover:underline">
                    +{moreCount} more…
                    <PlusIcon className="size-3 shrink-0 transition-all ease-out group-data-[panel-open]:scale-110 group-data-[panel-open]:rotate-45" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-visible p-0 m-0">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {moreStyles.map((styleFont, idx) => (
                      <FontMetaCard
                        key={styleFont.postscriptName + idx}
                        font={styleFont}
                        yfonts={yfonts}
                        ydoc={ydoc}
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

const FontMetaCard = React.memo(
  function FontMetaCard({
    font,
    yfonts,
    ydoc,
  }: {
    font: FontMeta;
    yfonts: Y.Array<FontMeta> | null;
    ydoc: Y.Doc | null;
  }) {
    return (
      <div className="border rounded p-2 flex flex-col gap-1 min-w-[220px] w-full">
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
            className="flex size-8 items-center justify-center rounded-sm text-gray-100 select-none  focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800  data-[pressed]:text-white"
            render={(props, state) =>
              state.pressed ? (
                <button type="button" {...props}>
                  <HeartFilledIcon className="size-5" />
                </button>
              ) : (
                <button type="button" {...props}>
                  <HeartOutlineIcon className="size-5" />
                </button>
              )
            }
          />
        </div>

        <div className="mt-2 mb-1">
          <div
            style={{
              fontFamily: font.family,
              fontSize: 36,
              padding: 8,
              borderRadius: 4,
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.font.favorite === nextProps.font.favorite;
  }
);
