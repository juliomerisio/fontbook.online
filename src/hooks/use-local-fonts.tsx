import { FontData } from "../types";
import { useLocalFontQuery } from "./use-local-font-query";
import { useYjsFontSync } from "./use-yjs-font-sync";

type useLocalFontsType = {
  fonts: FontData[];
  uiState: {
    loading: boolean;
    error: string | null;
  };
  documentName: string;
};

export function useLocalFonts({
  fonts,
  uiState,
  documentName,
}: useLocalFontsType) {
  const fontQuery = useLocalFontQuery();

  const { loadAllFonts, clearCache, supportAndPermissionStatus, yfonts, ydoc } =
    useYjsFontSync({
      fonts,
      uiState,
      fontQuery,
      documentName,
    });

  return {
    loadAllFonts,
    clearCache,
    supportAndPermissionStatus,
    yfonts,
    ydoc,
  };
}
