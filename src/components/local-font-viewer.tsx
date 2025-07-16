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
import { HeartFilledIcon, HeartOutlineIcon } from "@/icons/icons";

import { VList, VListHandle } from "virtua";

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
  const {
    supportAndPermissionStatus,
    loadAllFonts,
    clearCache,
    fontWeightLabels,
    parseFontStyleToWeight,
    yfonts,
    ydoc,
  } = useLocalFonts({
    fonts,
    uiState,
    documentName: "local-fonts-viewer",
  });

  const snapshot = useSnapshot(uiState);
  const fontsSnapshot = useSnapshot(fonts);
  const [tab, setTab] = React.useState("all");
  const vlistRef = useRef<VListHandle>(null);

  const filteredFonts =
    tab === "favorites"
      ? fontsSnapshot.filter((font) => font.favorite)
      : fontsSnapshot;

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
            {filteredFonts.length === 0 && <div>No fonts loaded.</div>}
            {filteredFonts.map((font, index) => {
              return (
                <FontMeta
                  key={font.postscriptName + index}
                  font={font}
                  parseFontStyleToWeight={parseFontStyleToWeight}
                  fontWeightLabels={fontWeightLabels}
                  yfonts={yfonts}
                  ydoc={ydoc}
                />
              );
            })}
          </VList>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
};

const FontMeta = React.memo(
  function FontMeta({
    font,
    parseFontStyleToWeight,
    fontWeightLabels,
    yfonts,
    ydoc,
  }: {
    font: FontMeta;
    parseFontStyleToWeight: (style: string) => number;
    fontWeightLabels: Record<string, string>;
    yfonts: Y.Array<FontMeta> | null;
    ydoc: Y.Doc | null;
  }) {
    const weight = parseFontStyleToWeight(font.style);
    const weightLabel = fontWeightLabels[weight] || weight;

    return (
      <div className="border rounded p-2 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <b>PostScript Name:</b> {font.postscriptName}
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
        <div>
          <b>Full Name:</b> {font.fullName}
        </div>
        <div>
          <b>Family:</b> {font.family}
        </div>
        <div>
          <b>Style:</b> {font.style}
        </div>
        <div>
          <b>Weight:</b> {weightLabel} ({weight})
        </div>

        <div className="mt-2 mb-1">
          <div
            style={{
              fontFamily: font.family,
              fontSize: 24,
              border: "1px dashed #ccc",
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
