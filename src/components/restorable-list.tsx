import { VList, VListHandle } from "virtua";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useMergeRefs } from "@/hooks/use-merge-refs";

type RestorableListProps<T> = {
  id: string;
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  style?: React.CSSProperties;
  overscan?: number;
  className?: string;
  vlistRef?: React.RefObject<VListHandle | null>;
};

export function RestorableList<T>(props: RestorableListProps<T>) {
  const { id, data, renderRow, style, overscan, className, vlistRef } = props;

  const cacheKey = "list-cache-" + id;

  const ref = useRef<VListHandle>(null);
  const mergedRef = useMergeRefs([vlistRef, ref]);

  const [offset, cache] = useMemo(() => {
    if (typeof window === "undefined") return [undefined, undefined];
    const serialized = sessionStorage.getItem(cacheKey);
    if (!serialized) return [undefined, undefined];
    try {
      const parsed = JSON.parse(serialized);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "number") return [parsed, undefined];
      return [undefined, undefined];
    } catch {
      return [undefined, undefined];
    }
  }, [cacheKey]);

  useLayoutEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    const handle = currentRef;
    if (offset !== undefined) {
      handle.scrollTo(offset);
    }
    return () => {
      if (currentRef) {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify([currentRef.scrollOffset, currentRef.cache])
        );
      }
    };
  }, [offset, cacheKey]);

  useEffect(() => {
    const currentRef = ref.current;

    const handleBeforeUnload = () => {
      if (currentRef) {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify([currentRef.scrollOffset, currentRef.cache])
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cacheKey]);

  return (
    <VList
      ref={mergedRef}
      cache={cache}
      style={style}
      overscan={overscan}
      className={className}
    >
      {data.map(renderRow)}
    </VList>
  );
}
