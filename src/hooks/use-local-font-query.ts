import { useCallback } from "react";
import { FontData } from "../types";

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

function parseFontStyleToWeight(style: string): number {
  style = style.toLowerCase().replace(/[\s\-_]/g, "");
  switch (true) {
    case style.includes("thin"):
      return 100;
    case style.includes("extralight"):
      return 200;
    case style.includes("light"):
      return 300;
    case style.includes("medium"):
      return 500;
    case style.includes("semibold"):
      return 600;
    case style.includes("extrabold"):
      return 800;
    case style.includes("black"):
    case style.includes("ultrabold"):
      return 900;
    case style.includes("bold"):
      return 700;
    default:
      return 400;
  }
}

const fontWeightLabels: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

export interface useLocalFontQueryType {
  loadAllFonts: () => Promise<FontData[]>;
  getFontData: (postscriptName: string) => Promise<Blob>;
  supportAndPermissionStatus: () => Promise<
    "granted" | "denied" | "not-supported"
  >;
  isMonospace: (ctx: CanvasRenderingContext2D, fontName: string) => boolean;
  parseFontStyleToWeight: (style: string) => number;
  fontWeightLabels: Record<number, string>;
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
    return "granted";
  }, []);

  return {
    loadAllFonts,
    getFontData,
    supportAndPermissionStatus: checkSupportAndPermission,
    isMonospace,
    parseFontStyleToWeight,
    fontWeightLabels,
  };
}
