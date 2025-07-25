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
  favorite: z.boolean().optional().default(false),
  favoriteOrder: z.number().optional(),
  styles: z
    .array(
      z.object({
        postscriptName: z.string(),
        fullName: z.string(),
        family: z.string(),
        style: z.string(),
        favorite: z.boolean().optional().default(false),
        favoriteOrder: z.number().optional(),
      })
    )
    .optional()
    .default([]),
});
export type FontMeta = z.infer<typeof FontMetaSchema>;

export interface FontData extends FontMeta {
  blob: () => Promise<Blob>;
}

export type FontPermissionStatus =
  | "granted"
  | "denied"
  | "not-supported"
  | "prompt";

export type FavoritesState = Record<string, boolean>;
