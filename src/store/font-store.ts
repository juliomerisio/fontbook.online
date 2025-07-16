import { proxy } from "valtio";
import { FontData, FontMeta } from "../types";
import * as Y from "yjs";

export const uiState = proxy({
  loading: true,
  error: null as string | null,
});

export const fonts = proxy<FontData[]>([]);

export function toggleFavorite({
  yfonts,
  ydoc,
  font,
}: {
  yfonts: Y.Array<FontMeta>;
  ydoc: Y.Doc;
  font: FontMeta;
}) {
  if (yfonts && ydoc) {
    const index = yfonts
      .toArray()
      .findIndex((f: FontMeta) => f.postscriptName === font.postscriptName);
    if (index !== -1) {
      ydoc.transact(() => {
        yfonts.delete(index, 1);
        yfonts.insert(index, [
          {
            postscriptName: font.postscriptName,
            fullName: font.fullName,
            family: font.family,
            style: font.style,
            favorite: !font.favorite,
            styles: font.styles,
          },
        ]);
      });
    }
  }
}
