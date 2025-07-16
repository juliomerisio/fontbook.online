import { z } from "zod";

declare global {
  interface Window {
    queryLocalFonts(options?: {
      postscriptNames?: string[];
    }): Promise<FontData[]>;
  }
}

export const FontMetaSchema = z.object({
  postscriptName: z.string(),
  fullName: z.string(),
  family: z.string(),
  style: z.string(),
});
export type FontMeta = z.infer<typeof FontMetaSchema>;

export interface FontData extends FontMeta {
  blob: () => Promise<Blob>;
}


export type FontPermissionStatus = "granted" | "denied" | "not-supported";
