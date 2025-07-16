import { FontData } from "../types";
import { useLocalFontQuery } from "./use-local-font-query";
import { useYjsFontSync } from "./use-yjs-font-sync";

type useLocalFontsType = {
  fontsState: FontData[];
  state: {
    loading: boolean;
    error: string | null;
  };
  documentName: string;
};

export function useLocalFonts({
  fontsState,
  state,
  documentName,
}: useLocalFontsType) {
  const fontQuery = useLocalFontQuery();

  const { loadAllFonts, clearCache, supportAndPermissionStatus } =
    useYjsFontSync({
      fontsState,
      state,
      fontQuery,
      documentName,
    });

  return {
    loadAllFonts,
    clearCache,
    getFontData: fontQuery.getFontData,
    supportAndPermissionStatus,
    isMonospace: fontQuery.isMonospace,
    parseFontStyleToWeight: fontQuery.parseFontStyleToWeight,
    fontWeightLabels: fontQuery.fontWeightLabels,
  };
}
