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

export const persistFavoriteOrder = (
  newOrder: FontMeta[],
  yfonts: Y.Array<FontMeta>,
  ydoc: Y.Doc
) => {
  if (!yfonts || !ydoc) return;
  const orderMap = new Map(
    newOrder.map((font, idx) => [font.postscriptName, idx])
  );
  ydoc.transact(() => {
    for (let i = 0; i < yfonts.length; i++) {
      const font = yfonts.get(i);
      if (font.favorite) {
        const newOrderIdx = orderMap.get(font.postscriptName);
        if (newOrderIdx !== undefined && font.favoriteOrder !== newOrderIdx) {
          yfonts.delete(i, 1);
          yfonts.insert(i, [{ ...font, favoriteOrder: newOrderIdx }]);
        }
      }
    }
  });
};
