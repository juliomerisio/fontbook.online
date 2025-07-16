import { useEffect, useRef, useCallback } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { FontData, FontMeta, FontPermissionStatus } from "../types";
import { bind } from "valtio-yjs-read-only";
import { useLocalFontQueryType } from "./use-local-font-query";

type useYjsFontSyncType = {
  documentName: string;
  initialFonts?: FontMeta[];
  fontsState: FontData[];
  state: {
    loading: boolean;
    error: string | null;
  };
  fontQuery: useLocalFontQueryType;
};

export function useYjsFontSync(props: useYjsFontSyncType) {
  const { fontsState, state, fontQuery, documentName } = props;

  const ydocRef = useRef<Y.Doc | null>(null);
  const yfontsRef = useRef<Y.Array<FontMeta> | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const supportAndPermissionStatusRef =
    useRef<FontPermissionStatus>("not-supported");

  const persistFontsToYjs = useCallback((fontsToPersist: FontData[]) => {
    if (yfontsRef.current && fontsToPersist.length > 0) {
      yfontsRef.current.delete(0, yfontsRef.current.length);
      yfontsRef.current.push(
        fontsToPersist.map((f) => ({
          postscriptName: f.postscriptName,
          fullName: f.fullName,
          family: f.family,
          style: f.style,
        }))
      );
    }
  }, []);

  const fontState = useRef(fontsState);
  const stateRef = useRef(state);

  fontState.current = fontsState;
  stateRef.current = state;

  const loadAllFonts = useCallback(async () => {
    stateRef.current.loading = true;
    stateRef.current.error = null;
    try {
      if (supportAndPermissionStatusRef.current === "granted") {
        const fontList = await fontQuery.loadAllFonts();
        persistFontsToYjs(fontList);
      }
    } catch (err: unknown) {
      stateRef.current.error =
        err instanceof Error ? err.message : "Unknown error";
    } finally {
      stateRef.current.loading = false;
    }
  }, [fontQuery, persistFontsToYjs]);

  const fontQueryRef = useRef(fontQuery);
  const loadAllFontsRef = useRef(loadAllFonts);

  fontQueryRef.current = fontQuery;
  loadAllFontsRef.current = loadAllFonts;

  useEffect(() => {
    const checkSupportAndPermission = async () => {
      const status = await fontQueryRef.current.supportAndPermissionStatus();
      supportAndPermissionStatusRef.current = status;
    };

    checkSupportAndPermission();

    const { ydoc, yfonts, persistence } = createYjsFontDoc(documentName);
    ydocRef.current = ydoc;
    yfontsRef.current = yfonts;
    persistenceRef.current = persistence;

    persistence.on("synced", async () => {
      const yFontsArr = yfonts.toArray();

      if (yFontsArr.length > 0) {
        stateRef.current.loading = false;
        return;
      }

      loadAllFontsRef.current();
    });

    const unbind = bind(fontState.current, yfonts);

    return () => {
      ydoc.destroy();
      unbind();
    };
  }, [documentName]);

  const clearCache = useCallback(() => {
    if (yfontsRef.current)
      yfontsRef.current.delete(0, yfontsRef.current.length);
  }, []);

  return {
    supportAndPermissionStatus: supportAndPermissionStatusRef.current,
    clearCache,
    loadAllFonts,
    persistFontsToYjs,
    ydoc: ydocRef.current,
    yfonts: yfontsRef.current,
    persistence: persistenceRef.current,
  };
}

function createYjsFontDoc(documentName: string): {
  ydoc: Y.Doc;
  yfonts: Y.Array<FontMeta>;
  persistence: IndexeddbPersistence;
} {
  const ydoc = new Y.Doc();
  const yfonts = ydoc.getArray<FontMeta>("fonts");
  const persistence = new IndexeddbPersistence(documentName, ydoc);
  return { ydoc, yfonts, persistence };
}
