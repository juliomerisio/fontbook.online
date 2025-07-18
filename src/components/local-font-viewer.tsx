"use client";

import {
  useRef,
  useMemo,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { useLocalFonts } from "@/hooks/use-local-fonts";
import { fonts, uiState, toggleFavorite } from "@/store/font-store";
import { useSnapshot } from "valtio";
import * as React from "react";
import { Tabs } from "@base-ui-components/react/tabs";
import { type FontMeta } from "@/types";
import { useQueryState, parseAsString } from "nuqs";

import { VList, VListHandle } from "virtua";
import { useMousetrap } from "@/hooks/use-mouse-trap";
import { ExtendedKeyboardEvent } from "mousetrap";
import { FontFamilyCard, FontMetaCard } from "./font-meta-card";
import { useMergeRefs } from "@/hooks/use-merge-refs";

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

export function RestorableList<T>({
  id,
  data,
  renderRow,
  style,
  overscan = 10,
  className,
  vlistRef,
}: {
  id: string;
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  style?: React.CSSProperties;
  overscan?: number;
  className?: string;
  vlistRef?: React.RefObject<VListHandle | null>;
}) {
  const cacheKey = "list-cache-" + id;

  const ref = useRef<VListHandle>(null);
  const mergedRef = useMergeRefs([vlistRef, ref]);

  const [offset, cache] = useMemo(() => {
    if (typeof window === "undefined") return [undefined, undefined];
    const serialized = sessionStorage.getItem(cacheKey);
    if (!serialized) return [undefined, undefined];
    try {
      const parsed = JSON.parse(serialized);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "number") return [parsed, undefined];
      return [undefined, undefined];
    } catch {
      return [undefined, undefined];
    }
  }, [cacheKey]);

  useLayoutEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    const handle = currentRef;
    if (offset !== undefined) {
      console.log("[RestorableList] Applying offset:", offset);
      handle.scrollTo(offset);
    }
    return () => {
      if (currentRef) {
        console.log(
          "[RestorableList] Cleanup: Saving offset:",
          currentRef.scrollOffset
        );
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify([currentRef.scrollOffset, currentRef.cache])
        );
      }
    };
  }, [offset, cacheKey]);

  // Save offset before leaving page
  useEffect(() => {
    // Capture ref.current in closure
    const currentRef = ref.current;

    const handleBeforeUnload = () => {
      if (currentRef) {
        console.log(
          "[RestorableList] beforeunload: Saving offset:",
          currentRef.scrollOffset
        );
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify([currentRef.scrollOffset, currentRef.cache])
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cacheKey]);

  return (
    <VList
      ref={mergedRef}
      cache={cache}
      style={style}
      overscan={overscan}
      className={className}
    >
      {data.map(renderRow)}
    </VList>
  );
}

export const LocalFontViewer = () => {
  const { supportAndPermissionStatus, loadAllFonts, clearCache, yfonts, ydoc } =
    useLocalFonts({
      fonts,
      uiState,
      documentName: "local-fonts-viewer",
    });

  const snapshot = useSnapshot(uiState);
  const fontsSnapshot = useSnapshot(fonts);
  const [tab, setTab] = useQueryState("tab", parseAsString.withDefault("all"));

  const normalizeFontMeta = useCallback((font: FontMeta): FontMeta => {
    return {
      ...font,
      styles: Array.isArray(font.styles)
        ? font.styles.map((s) =>
            // @ts-expect-error - styles is optional
            normalizeFontMeta({ ...s, styles: s.styles ?? [] })
          )
        : [],
    };
  }, []);
  const normalizedFontsSnapshot = React.useMemo(
    () =>
      fontsSnapshot.map((f) =>
        // @ts-expect-error - styles is optional
        normalizeFontMeta({ ...f, styles: f.styles ?? [] })
      ),
    [fontsSnapshot, normalizeFontMeta]
  );

  const groupedFonts = React.useMemo(() => {
    const familyMap = new Map<string, FontMeta & { styles: FontMeta[] }>();
    normalizedFontsSnapshot.forEach((font) => {
      const styleFont: FontMeta = normalizeFontMeta(font);
      if (!familyMap.has(font.family)) {
        familyMap.set(font.family, { ...styleFont, styles: [styleFont] });
      } else {
        familyMap.get(font.family)!.styles.push(styleFont);
      }
    });
    familyMap.forEach((value) => {
      value.styles.sort((a, b) => a.style.localeCompare(b.style));
    });
    return Array.from(familyMap.values());
  }, [normalizedFontsSnapshot, normalizeFontMeta]);

  const favoritesList = React.useMemo(() => {
    if (tab !== "favorites") return [];
    return groupedFonts
      .flatMap((group) => group.styles.filter((style) => style.favorite))
      .map((font) => ({ ...font, styles: [] }));
  }, [groupedFonts, tab]);

  const filteredGroupedFonts = React.useMemo(() => {
    if (tab === "favorites") {
      return groupedFonts.filter((group) =>
        group.styles.some((style) => style.favorite)
      );
    }
    return groupedFonts;
  }, [groupedFonts, tab]);

  const cardRefs = React.useMemo(
    () => filteredGroupedFonts.map(() => React.createRef<HTMLDivElement>()),
    [filteredGroupedFonts]
  );

  const favoritesCardRefs = React.useMemo(
    () => favoritesList.map(() => React.createRef<HTMLDivElement>()),
    [favoritesList]
  );

  // Throttle for navigation keys
  const THROTTLE_MS = 80;
  const lastNavRef = React.useRef(0);

  const currentList =
    tab === "favorites" ? favoritesList : filteredGroupedFonts;
  const currentRefs = tab === "favorites" ? favoritesCardRefs : cardRefs;

  const lastFocusedIndexRef = React.useRef<{ [key: string]: number }>({
    all: 0,
    favorites: 0,
  });

  // Persist last focused index per tab in sessionStorage
  const FOCUS_KEY_PREFIX = "last-focused-index-";
  const saveLastFocusedIndex = (tab: string, idx: number) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`${FOCUS_KEY_PREFIX}${tab}`, JSON.stringify(idx));
    }
  };

  const loadLastFocusedIndex = (tab: string, max: number) => {
    if (typeof window === "undefined") return 0;
    const raw = sessionStorage.getItem(`${FOCUS_KEY_PREFIX}${tab}`);
    let idx = 0;
    if (raw) {
      try {
        idx = JSON.parse(raw);
      } catch {}
    }
    if (typeof idx !== "number" || isNaN(idx)) idx = 0;
    if (idx >= max) idx = max - 1;
    if (idx < 0) idx = 0;
    return idx;
  };

  const allVListRef = React.useRef<VListHandle | null>(null);
  const favVListRef = React.useRef<VListHandle | null>(null);

  useMousetrap([
    //TODO: this still not 100% - need further debugging
    // Navigation: ArrowDown, j, J
    {
      keys: ["down", "j"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastNavRef.current < THROTTLE_MS) return;
        lastNavRef.current = now;
        const currentIndex = currentRefs.findIndex(
          (ref) => ref.current === document.activeElement
        );
        // If nothing is focused, focus the first visible card
        if (currentIndex === -1) {
          const vlistRef = tab === "favorites" ? favVListRef : allVListRef;
          const firstVisible = vlistRef.current?.findStartIndex() ?? 0;
          if (currentRefs[firstVisible]?.current) {
            currentRefs[firstVisible].current.focus();
          }
          return;
        }

        const next = Math.min(currentList.length - 1, currentIndex + 1);
        if (next !== currentIndex) {
          currentRefs[next]?.current?.focus();
        }
      },
    },
    // Navigation: ArrowUp, k, K
    {
      keys: ["up", "k"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastNavRef.current < THROTTLE_MS) return;
        lastNavRef.current = now;
        const currentIndex = currentRefs.findIndex(
          (ref) => ref.current === document.activeElement
        );
        if (currentIndex === -1) {
          const vlistRef = tab === "favorites" ? favVListRef : allVListRef;
          const firstVisible = vlistRef.current?.findEndIndex() ?? 0;
          if (currentRefs[firstVisible]?.current) {
            currentRefs[firstVisible].current.focus();
          }
          return;
        }
        const prev = Math.max(0, currentIndex - 1);
        if (prev !== currentIndex) {
          currentRefs[prev]?.current?.focus();
        }
      },
    },
    // Toggle favorite
    {
      keys: ["f"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();
        const currentIndex = currentRefs.findIndex(
          (ref) => ref.current === document.activeElement
        );
        const fontGroup = currentList[currentIndex];
        if (
          fontGroup &&
          yfonts &&
          ydoc &&
          (tab === "favorites" ? fontGroup : fontGroup.styles[0])
        ) {
          toggleFavorite({
            yfonts,
            ydoc,
            font: tab === "favorites" ? fontGroup : fontGroup.styles[0],
          });

          const nextIndex = Math.min(currentRefs.length - 1, currentIndex + 1);
          const prevIndex = Math.max(0, currentIndex - 1);

          if (tab === "favorites") {
            if (nextIndex !== currentIndex) {
              currentRefs[nextIndex]?.current?.focus();
            } else if (prevIndex !== currentIndex) {
              currentRefs[prevIndex]?.current?.focus();
            }
          }
        }
      },
    },
    // Toggle tabs
    {
      keys: ["t"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();
        setTab((prev) => (prev === "all" ? "favorites" : "all"));
      },
    },
  ]);

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
      <Tabs.Root
        value={tab}
        onValueChange={(v) => {
          // Save last focused index for previous tab
          const prevTab = tab;
          const prevRefs =
            prevTab === "favorites" ? favoritesCardRefs : cardRefs;
          const prevIndex = prevRefs.findIndex(
            (ref) => ref.current === document.activeElement
          );
          if (prevIndex !== -1) {
            lastFocusedIndexRef.current[prevTab] = prevIndex;
            saveLastFocusedIndex(prevTab, prevIndex);
            console.log(
              "[Focus Debug] Saved last focused index",
              prevTab,
              prevIndex
            );
          }
          setTab(v);

          const idx = loadLastFocusedIndex(
            v,
            v === "favorites"
              ? favoritesList.length
              : filteredGroupedFonts.length
          );

          lastFocusedIndexRef.current[v] = idx;
        }}
        className="rounded-md relative"
      >
        <div className="flex gap-2 absolute top-0">
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
        </div>

        <Tabs.Panel
          value="all"
          className="h-full flex flex-col flex-1 min-h-[100vh] pt-10"
        >
          <RestorableList
            id="all-fonts"
            data={filteredGroupedFonts}
            renderRow={(fontGroup, index) => (
              <div
                key={fontGroup.family + index}
                ref={cardRefs[index]}
                tabIndex={0}
                className="font-card"
              >
                <FontFamilyCard
                  fontGroup={fontGroup}
                  yfonts={yfonts}
                  ydoc={ydoc}
                />
              </div>
            )}
            style={{ flex: 1, scrollbarWidth: "none", msOverflowStyle: "none" }}
            overscan={5}
            className="overflow-x-hidden"
            vlistRef={allVListRef}
          />
        </Tabs.Panel>

        <Tabs.Panel
          value="favorites"
          className="h-full flex flex-col flex-1 min-h-[100vh] pt-10"
        >
          <RestorableList
            id="favorites-fonts"
            data={favoritesList}
            renderRow={(font, index) => (
              <div
                key={font.postscriptName}
                ref={favoritesCardRefs[index]}
                tabIndex={0}
                className="font-card"
              >
                <FontMetaCard font={font} yfonts={yfonts} ydoc={ydoc} />
              </div>
            )}
            style={{ flex: 1, scrollbarWidth: "none", msOverflowStyle: "none" }}
            overscan={5}
            className="overflow-x-hidden"
            vlistRef={favVListRef}
          />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
};
