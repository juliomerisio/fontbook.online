import { useCallback } from "react";
import { FontData, FontMeta } from "../types";

function isSupportQueryLocalFonts(): boolean {
  return typeof window !== "undefined" && "queryLocalFonts" in window;
}

async function checkLocalFontPermission(): Promise<PermissionStatus> {
  return navigator.permissions.query({
    name: "local-fonts" as PermissionName,
  } satisfies PermissionDescriptor);
}

async function queryFontList(options?: {
  postscriptNames: string[];
}): Promise<FontData[]> {
  return window.queryLocalFonts(options);
}

async function queryTargetFontBlob(
  postscriptName: string
): Promise<Blob | null> {
  const [font] = await queryFontList({ postscriptNames: [postscriptName] });
  return font ? await font.blob() : null;
}

function isMonospace(ctx: CanvasRenderingContext2D, fontName: string): boolean {
  const count = (char: string): number => ctx.measureText(char).width;
  ctx.font = `16px ${fontName}`;
  return count("i") === count("M") && count("|") === count("%");
}

export const getFontStyles = (font: Omit<FontMeta, "styles">) => {
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

export interface useLocalFontQueryType {
  loadAllFonts: () => Promise<FontData[]>;
  getFontData: (postscriptName: string) => Promise<Blob>;
  supportAndPermissionStatus: () => Promise<
    "granted" | "denied" | "not-supported" | "prompt"
  >;
  isMonospace: (ctx: CanvasRenderingContext2D, fontName: string) => boolean;
}

export function useLocalFontQuery(): useLocalFontQueryType {
  const loadAllFonts = useCallback(async () => {
    return await queryFontList();
  }, []);

  const getFontData = useCallback(async (postscriptName: string) => {
    const blob = await queryTargetFontBlob(postscriptName);
    if (!blob) throw new Error("Font blob not found");
    return blob;
  }, []);

  const checkSupportAndPermission = useCallback(async () => {
    if (!isSupportQueryLocalFonts()) {
      return "not-supported";
    }

    const permission = await checkLocalFontPermission();
    if (permission.state === "denied") {
      return "denied";
    }
    if (permission.state === "prompt") {
      return "prompt";
    }

    return "granted";
  }, []);

  return {
    loadAllFonts,
    getFontData,
    supportAndPermissionStatus: checkSupportAndPermission,
    isMonospace,
  };
}
