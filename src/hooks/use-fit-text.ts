import {
  useCallback,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";

export type UseFitTextOptions = {
  minFontSize?: number;
  maxFontSize?: number;
  boxMultiplier?: [number, number];
  debug?: boolean;
  deps?: unknown[];
};

export type UseFitTextResult = {
  textRef: (el: HTMLElement | null) => void;
  containerRef: (el: HTMLElement | null) => void;
  fontSize: number;
  fitting: boolean;
};

const DEFAULT_MIN = 10;
const DEFAULT_BOX_MULTIPLIER: [number, number] = [1, 1];
const ORIGINAL_TEXT_KEY = Symbol("fitTextOriginalText");
const LRU_CACHE_SIZE = 100;

// Simple LRU cache for font sizes
const fontSizeCache: Map<string, number> = new Map();
function getCacheKey({
  text,
  fontFamily,
  width,
  height,
  scaleWidth,
  minFontSize,
  maxFontSize,
}: {
  text: string;
  fontFamily: string;
  width: number;
  height: number;
  scaleWidth: boolean;
  minFontSize: number;
  maxFontSize: number;
}): string {
  return [
    text,
    fontFamily,
    width,
    height,
    scaleWidth ? 1 : 0,
    minFontSize,
    maxFontSize,
  ].join("|");
}

function setFontSizeCache(key: string, value: number) {
  if (fontSizeCache.has(key)) fontSizeCache.delete(key);
  fontSizeCache.set(key, value);
  if (fontSizeCache.size > LRU_CACHE_SIZE) {
    // Remove oldest
    const firstKey = fontSizeCache.keys().next().value;
    if (firstKey) fontSizeCache.delete(firstKey);
  }
}

// Helpers for sessionStorage cache
function getViewportWidth() {
  if (typeof window !== "undefined") {
    return window.innerWidth;
  }
  return 0;
}

function getSessionCacheKey(fontFamily: string, viewportWidth: number) {
  return `fitTextCache:${fontFamily}:${viewportWidth}`;
}

function getSessionFontSizeCache(
  fontFamily: string,
  viewportWidth: number
): Record<string, number> {
  if (typeof window === "undefined" || !window.sessionStorage) return {};
  try {
    const key = getSessionCacheKey(fontFamily, viewportWidth);
    const raw = window.sessionStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return {};
}

function setSessionFontSizeCache(
  fontFamily: string,
  viewportWidth: number,
  cache: Record<string, number>
) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const key = getSessionCacheKey(fontFamily, viewportWidth);
    window.sessionStorage.setItem(key, JSON.stringify(cache));
  } catch (e) {
    // ignore
  }
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

type FitTextHTMLElement = HTMLElement & { [ORIGINAL_TEXT_KEY]?: string };

export default function useFitText({
  minFontSize = DEFAULT_MIN,
  maxFontSize,
  boxMultiplier = DEFAULT_BOX_MULTIPLIER,
  debug = false,
  deps = [],
}: UseFitTextOptions = {}): UseFitTextResult {
  const [fontSize, setFontSize] = useState<number>(maxFontSize || 16);
  const [fitting, setFitting] = useState(false);
  const textElRef = useRef<FitTextHTMLElement | null>(null);
  const containerElRef = useRef<HTMLElement | null>(null);

  const fit = useCallback(() => {
    const el = textElRef.current;
    const box = containerElRef.current || el;
    if (!el || !box) return;

    // Restore original text if needed
    if (!el[ORIGINAL_TEXT_KEY]) {
      el[ORIGINAL_TEXT_KEY] = el.innerHTML;
    } else {
      el.innerHTML = el[ORIGINAL_TEXT_KEY] as string;
    }

    el.style.removeProperty("font-size");

    const maxW = box.offsetWidth * boxMultiplier[0];
    const maxH = box.offsetHeight * boxMultiplier[1];
    const style = window.getComputedStyle(el);
    const fontFamily = style.fontFamily || el.style.fontFamily || "";
    const text = el.innerHTML;
    const scaleWidth = el.dataset.scaleWidth === "true";
    const maxFont =
      maxFontSize || Math.round(Number(style.fontSize.replace("px", "")));
    const cacheKey = getCacheKey({
      text,
      fontFamily,
      width: Math.round(maxW),
      height: Math.round(maxH),
      scaleWidth,
      minFontSize,
      maxFontSize: maxFont,
    });

    // Session storage cache logic
    const viewportWidth = getViewportWidth();
    const sessionCache = getSessionFontSizeCache(fontFamily, viewportWidth);
    if (sessionCache[cacheKey]) {
      const cached = sessionCache[cacheKey];
      el.style.fontSize = `${cached}px`;
      setFontSize(cached);
      setFitting(true);
      if (debug) {
        console.log("[fitText] sessionStorage cache hit", { cacheKey, cached });
      }
      return;
    }

    // Check in-memory cache as fallback
    if (fontSizeCache.has(cacheKey)) {
      const cached = fontSizeCache.get(cacheKey)!;
      el.style.fontSize = `${cached}px`;
      setFontSize(cached);
      setFitting(true);
      if (debug) {
        console.log("[fitText] memory cache hit", { cacheKey, cached });
      }
      return;
    }

    // Special scaleWidth logic
    if (scaleWidth) {
      el.style.fontSize = "300px";
      while (el.scrollWidth > maxW) {
        el.style.fontSize = parseInt(el.style.fontSize) - 1 + "px";
      }
      while (el.scrollWidth < maxW * 0.98) {
        el.style.fontSize = parseInt(el.style.fontSize) + 1 + "px";
      }
      el.style.fontSize = parseInt(el.style.fontSize) - 1 + "px";
      const result = parseInt(el.style.fontSize);
      setFontSize(result);
      setFitting(true);
      setFontSizeCache(cacheKey, result);
      // Update sessionStorage cache
      sessionCache[cacheKey] = result;
      setSessionFontSizeCache(fontFamily, viewportWidth, sessionCache);
      if (debug) {
        console.log({
          maxW,
          el,
          scaleWidth: true,
          fontSize: el.style.fontSize,
        });
      }
      return;
    }

    // Default: binary search for best fit
    let low = minFontSize;
    let high = maxFont;
    let best = minFontSize;
    let iterations = 0;
    while (low <= high && iterations < 20) {
      const mid = Math.floor((low + high) / 2);
      el.style.fontSize = `${mid}px`;
      if (el.scrollWidth <= maxW && el.offsetHeight <= maxH) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
      iterations++;
    }
    el.style.fontSize = `${best}px`;
    setFontSize(best);
    setFitting(true);
    setFontSizeCache(cacheKey, best);
    // Update sessionStorage cache
    sessionCache[cacheKey] = best;
    setSessionFontSizeCache(fontFamily, viewportWidth, sessionCache);
    if (debug) {
      console.log({ maxW, maxH, best, el, box });
    }
  }, [minFontSize, maxFontSize, boxMultiplier, debug]);

  const debouncedFitRef = useRef<ReturnType<typeof debounce> | null>(null);
  if (!debouncedFitRef.current) {
    debouncedFitRef.current = debounce(fit, 100); // 100ms debounce
  }

  useLayoutEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, ...(deps || [])]);

  useEffect(() => {
    const container = containerElRef.current;
    if (!container) return;
    const handleResize = () => {
      if (debouncedFitRef.current) {
        debouncedFitRef.current();
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (debouncedFitRef.current && debouncedFitRef.current.cancel) {
        debouncedFitRef.current.cancel();
      }
    };
  }, [fit]);

  const textRef = useCallback(
    (node: HTMLElement | null) => {
      textElRef.current = node as FitTextHTMLElement;
      if (node) fit();
    },
    [fit]
  );

  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      containerElRef.current = node;
      if (textElRef.current) fit();
    },
    [fit]
  );

  return { textRef, containerRef, fontSize, fitting };
}
