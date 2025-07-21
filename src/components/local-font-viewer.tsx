"use client";

import { useCallback } from "react";
import { useLocalFonts } from "@/hooks/use-local-fonts";
import {
  fonts,
  uiState,
  toggleFavorite,
  persistFavoriteOrder,
} from "@/store/font-store";
import { useSnapshot } from "valtio";
import * as React from "react";
import { Tabs } from "@base-ui-components/react/tabs";
import { type FontMeta } from "@/types";
import { useQueryState, parseAsString } from "nuqs";

import { VListHandle } from "virtua";
import { useMousetrap } from "@/hooks/use-mouse-trap";
import { ExtendedKeyboardEvent } from "mousetrap";
import { FontFamilyCard, FontMetaCard } from "./font-meta-card";
import { FontPreviewPanel } from "./font-preview-panel";
import { Logo32 } from "./logo";
import { NotSupported } from "./not-supported";
import { PermissionDenied } from "./permission-denied";
import { RestorableList } from "./restorable-list";
import { EmptyStateFavorites } from "./empty-state-favorites";
import { Loading } from "./loading";

export const LocalFontViewer = () => {
  const { supportAndPermissionStatus, loadAllFonts, clearCache, yfonts, ydoc } =
    useLocalFonts({
      fonts,
      uiState,
      documentName: "local-fonts-viewer",
    });

  const snapshot = useSnapshot(uiState);
  const fontsSnapshot = useSnapshot(fonts);

  const allVListRef = React.useRef<VListHandle | null>(null);
  const favVListRef = React.useRef<VListHandle | null>(null);

  const [tab, setTab] = useQueryState("tab", parseAsString.withDefault("all"));
  const [activeFontPSName, setActiveFontPSName] = useQueryState(
    "glyphPanel",
    parseAsString.withDefault("")
  );

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [sortMode, setSortMode] = React.useState(false);
  const [sortingIndex, setSortingIndex] = React.useState<number | null>(null);

  const normalizeFontMeta = useCallback((font: FontMeta): FontMeta => {
    return {
      ...font,
      styles: Array.isArray(font.styles)
        ? font.styles.map((s) => normalizeFontMeta({ ...s, styles: [] }))
        : [],
    };
  }, []);

  const normalizedFontsSnapshot = React.useMemo(
    () => fontsSnapshot.map((f) => normalizeFontMeta({ ...f, styles: [] })),
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
      .map((font) => ({ ...font, styles: [] }))
      .sort((a, b) => {
        if (a.favoriteOrder != null && b.favoriteOrder != null) {
          return a.favoriteOrder - b.favoriteOrder;
        }
        if (a.favoriteOrder != null) return -1;
        if (b.favoriteOrder != null) return 1;
        return 0;
      });
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

  const currentList =
    tab === "favorites" ? favoritesList : filteredGroupedFonts;
  const currentRefs = tab === "favorites" ? favoritesCardRefs : cardRefs;

  const lastFocusedIndexRef = React.useRef<{ [key: string]: number }>({
    all: 0,
    favorites: 0,
  });

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

  const handleSort = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!yfonts || !ydoc) return;
      const newOrder = [...favoritesList];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      persistFavoriteOrder(newOrder, yfonts, ydoc);

      // Ensure focus follows the item and stays in view
      requestAnimationFrame(() => {
        // TODO: current is null here
        currentRefs[toIndex]?.current?.focus();
        setActiveFontPSName(currentList[toIndex]?.postscriptName ?? "");
        if (tab === "favorites") {
          favVListRef.current?.scrollToIndex(toIndex, { align: "nearest" });
        }
      });
    },
    [
      yfonts,
      ydoc,
      favoritesList,
      currentRefs,
      setActiveFontPSName,
      currentList,
      tab,
    ]
  );

  useMousetrap([
    {
      keys: ["command+backspace"],
      callback: () => {
        clearCache();
      },
    },
    {
      keys: ["escape"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();
        if (sortMode) {
          setSortMode(false);
          setSortingIndex(null);
          // Keep focus on the current item when exiting sort mode
          const currentIndex = currentRefs.findIndex(
            (ref) => ref.current === document.activeElement
          );
          if (currentIndex !== -1) {
            setActiveFontPSName(
              currentList[currentIndex]?.postscriptName ?? ""
            );
          }
        } else {
          setActiveFontPSName("");
        }
      },
    },
    {
      keys: ["space"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();
        if (tab === "favorites") {
          if (sortMode) {
            // Exit sort mode
            setSortMode(false);
            setSortingIndex(null);
            // Keep focus on current item
            const currentIndex = currentRefs.findIndex(
              (ref) => ref.current === document.activeElement
            );
            if (currentIndex !== -1) {
              setActiveFontPSName(
                currentList[currentIndex]?.postscriptName ?? ""
              );
            }
          } else {
            // Enter sort mode
            const currentIndex = currentRefs.findIndex(
              (ref) => ref.current === document.activeElement
            );
            if (currentIndex !== -1) {
              setSortMode(true);
              setSortingIndex(currentIndex);
              setActiveFontPSName(
                currentList[currentIndex]?.postscriptName ?? ""
              );
            }
          }
        }
      },
    },
    // Navigation: ArrowDown, j, J
    {
      keys: ["down", "j"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();

        if (sortMode && tab === "favorites") {
          const currentIndex = sortingIndex ?? -1;
          if (currentIndex === -1) return;

          const nextIndex = Math.min(currentList.length - 1, currentIndex + 1);
          if (nextIndex !== currentIndex) {
            handleSort(currentIndex, nextIndex);
            setSortingIndex(nextIndex);
          }
          return;
        }

        const currentIndex = currentRefs.findIndex(
          (ref) => ref.current === document.activeElement
        );

        // If nothing is focused, focus the first visible card
        if (currentIndex === -1) {
          const vlistRef = tab === "favorites" ? favVListRef : allVListRef;
          const firstVisible = vlistRef.current?.findStartIndex() ?? 0;
          if (currentRefs[firstVisible]?.current) {
            currentRefs[firstVisible].current.focus();
            setActiveFontPSName(
              currentList[firstVisible]?.postscriptName ?? ""
            );
            vlistRef.current?.scrollToIndex(firstVisible, { align: "start" });
          }
          return;
        }

        const next = Math.min(currentList.length - 1, currentIndex + 1);
        if (next !== currentIndex) {
          currentRefs[next]?.current?.focus();
          setActiveFontPSName(currentList[next]?.postscriptName ?? "");
          const vlistRef = tab === "favorites" ? favVListRef : allVListRef;
          vlistRef.current?.scrollToIndex(next, { align: "nearest" });
        }
      },
    },
    // Navigation: ArrowUp, k, K
    {
      keys: ["up", "k"],
      callback: (e: ExtendedKeyboardEvent) => {
        e.preventDefault();

        if (sortMode && tab === "favorites") {
          const currentIndex = sortingIndex ?? -1;
          if (currentIndex === -1) return;

          const prevIndex = Math.max(0, currentIndex - 1);
          if (prevIndex !== currentIndex) {
            handleSort(currentIndex, prevIndex);
            setSortingIndex(prevIndex);
          }
          return;
        }

        const currentIndex = currentRefs.findIndex(
          (ref) => ref.current === document.activeElement
        );

        if (currentIndex === -1) {
          const vlistRef = tab === "favorites" ? favVListRef : allVListRef;
          const firstVisible = vlistRef.current?.findEndIndex() ?? 0;
          if (currentRefs[firstVisible]?.current) {
            currentRefs[firstVisible].current.focus();
            setActiveFontPSName(
              currentList[firstVisible]?.postscriptName ?? ""
            );
            vlistRef.current?.scrollToIndex(firstVisible, { align: "end" });
          }
          return;
        }
        const prev = Math.max(0, currentIndex - 1);
        if (prev !== currentIndex) {
          currentRefs[prev]?.current?.focus();
          setActiveFontPSName(currentList[prev]?.postscriptName ?? "");
          const vlistRef = tab === "favorites" ? favVListRef : allVListRef;
          vlistRef.current?.scrollToIndex(prev, { align: "nearest" });
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

  const currentSelectedFont = React.useMemo(() => {
    return activeFontPSName
      ? filteredGroupedFonts.find(
          (g) =>
            g.postscriptName === activeFontPSName ||
            g.styles.some((s) => s.postscriptName === activeFontPSName)
        ) || null
      : null;
  }, [activeFontPSName, filteredGroupedFonts]);

  const scrollToTop = useCallback(() => {
    allVListRef.current?.scrollTo(0);
    favVListRef.current?.scrollTo(0);
  }, []);

  if (snapshot.loading || !yfonts || !ydoc) {
    return <Loading />;
  }

  if (supportAndPermissionStatus === "not-supported") {
    return <NotSupported />;
  }

  if (supportAndPermissionStatus === "denied") {
    return <PermissionDenied loadAllFonts={loadAllFonts} />;
  }

  if (snapshot.error) {
    return <PermissionDenied loadAllFonts={loadAllFonts} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-row">
      <div className="flex-1 min-w-0 flex flex-col">
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
          <div className="flex gap-2 absolute top-0 py-2 w-full justify-between items-center bg-background px-4 border-b border-foreground/10">
            <Logo32 onClick={scrollToTop} />

            <Tabs.List className="relative z-0 flex justify-center gap-1 items-center  w-fit  border border-foreground/10 rounded-md px-2 py-2 bg-accent/5">
              <Tabs.Tab
                value="all"
                className="text-shadow-basic flex h-[30px] w-[76px] items-center justify-center border-0 px-2 text-sm font-medium break-keep whitespace-nowrap text-foreground/80 outline-none select-none before:inset-x-0 before:inset-0 before:rounded-sm before:outline-offset-0 before:outline-blue-800 hover:text-foreground focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:text-foreground data-[selected]:dark:text-background"
              >
                All
              </Tabs.Tab>
              <Tabs.Tab
                value="favorites"
                className="text-shadow-basic flex h-[30px] w-[76px] items-center justify-center border-0 px-2 text-sm font-medium break-keep whitespace-nowrap text-foreground/80 outline-none select-none before:inset-x-0 before:inset-0 before:rounded-sm before:outline-offset-0 before:outline-blue-800 hover:text-foreground focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:text-foreground data-[selected]:dark:text-background"
              >
                Favorites
              </Tabs.Tab>

              <Tabs.Indicator className="drop-shadow-2xl absolute top-1/2 left-0 z-[-1] h-8 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] -translate-y-1/2 rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] group  isolate before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] before:transition-opacity before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-gradient-to-b before:from-white/20 before:opacity-50 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-gradient-to-b after:from-[#FFC61F]/50 after:from-[46%] after:to-[84%] after:mix-blend-overlay shadow-[0_1px_rgba(255,193,31,0.07)_inset,0_1px_3px_rgba(252,208,86,0.2)] bg-[var(--accent)] ring-1 ring-[var(--accent)]">
                <div className="absolute inset-0 -z-20 rounded-md bg-[var(--accent)] opacity-20 blur-[16px]" />
              </Tabs.Indicator>
            </Tabs.List>

            <div className="w-[90px]"></div>
          </div>

          <Tabs.Panel
            value="all"
            tabIndex={-1}
            className="h-full flex flex-col flex-1 min-h-[100dvh] pt-[66px]  mx-auto  border-[color:var(--border-dashed)] "
          >
            <RestorableList
              id="all-fonts"
              data={filteredGroupedFonts}
              renderRow={(fontGroup, index) => (
                <div
                  key={fontGroup.family + index}
                  ref={cardRefs[index]}
                  tabIndex={0}
                  className="outline-none    group focus-visible:bg-foreground/5"
                  onFocus={() => {
                    lastFocusedIndexRef.current[tab] = index;
                    setActiveFontPSName(fontGroup.postscriptName);
                  }}
                >
                  <FontFamilyCard
                    fontGroup={fontGroup}
                    yfonts={yfonts}
                    ydoc={ydoc}
                  />
                </div>
              )}
              style={{
                flex: 1,
                display: "flex",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              className="overflow-x-hidden"
              vlistRef={allVListRef}
            />
          </Tabs.Panel>

          <Tabs.Panel
            value="favorites"
            tabIndex={-1}
            className="h-full flex flex-col flex-1 min-h-[100dvh] pt-[66px] mx-auto   border-foreground/10  "
          >
            {favoritesList.length > 0 && (
              <RestorableList
                id="favorites-fonts"
                data={favoritesList}
                renderRow={(font, index) => (
                  <div
                    key={font.postscriptName}
                    ref={favoritesCardRefs[index]}
                    tabIndex={0}
                    className={`outline-none group focus-visible:bg-foreground/5 cursor-grab ${
                      draggedIndex === index ? "opacity-50" : ""
                    } ${
                      dragOverIndex === index ? "ring-2 ring-blue-400" : ""
                    } ${
                      sortMode && sortingIndex === index
                        ? "ring-2 ring-accent"
                        : ""
                    }`}
                    onFocus={() => {
                      lastFocusedIndexRef.current[tab] = index;
                      setActiveFontPSName(font.postscriptName);
                    }}
                    draggable
                    onDragStart={() => {
                      setDraggedIndex(index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={() => {
                      if (draggedIndex == null || draggedIndex === index)
                        return;
                      const newOrder = [...favoritesList];
                      const [removed] = newOrder.splice(draggedIndex, 1);
                      newOrder.splice(index, 0, removed);
                      if (yfonts && ydoc) {
                        persistFavoriteOrder(newOrder, yfonts, ydoc);
                      }
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                  >
                    <FontMetaCard font={font} yfonts={yfonts} ydoc={ydoc} />
                  </div>
                )}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                className="flex-1 overflow-x-hidden"
                vlistRef={favVListRef}
              />
            )}
            {favoritesList.length === 0 && <EmptyStateFavorites />}
          </Tabs.Panel>
        </Tabs.Root>
      </div>

      <FontPreviewPanel font={currentSelectedFont} />
    </div>
  );
};
