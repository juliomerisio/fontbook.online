const ORIGINAL_TEXT_KEY = Symbol("fitTextOriginalText");

type FitTextHTMLElement = HTMLElement & { [ORIGINAL_TEXT_KEY]?: string };

type FitTextOptions = {
  el: FitTextHTMLElement;
  box?: HTMLElement | null;
  minFontSize?: number;
  boxMultiplier?: [number, number];
  debug?: boolean;
};

type FitTextResult = {
  text: string;
  fontSize: number;
};

export default function fitText({
  el,
  box = null,
  minFontSize = 10,
  boxMultiplier = [1, 1],
  debug = false,
}: FitTextOptions): FitTextResult {
  if (!el) throw new Error("param `el` is missed for FitText");
  if (!(el instanceof HTMLElement))
    throw new Error("param `el` must be an instance of HTMLElement");
  if (box && !(box instanceof HTMLElement))
    throw new Error("param `box` must be an instance of HTMLElement");
  if (Array.isArray(boxMultiplier) && boxMultiplier.length !== 2)
    throw new Error("param `boxMultiplier` must be an array of two numbers");

  el.style.removeProperty("font-size");

  if (!el[ORIGINAL_TEXT_KEY]) {
    el[ORIGINAL_TEXT_KEY] = el.innerHTML;
  } else {
    el.innerHTML = el[ORIGINAL_TEXT_KEY];
  }

  const maxWidth = box ? box.offsetWidth * boxMultiplier[0] : el.offsetWidth;
  const maxHeight = box ? box.offsetHeight * boxMultiplier[1] : el.offsetHeight;

  const style = window.getComputedStyle(el);
  const maxFontSize = Math.round(Number(style.fontSize.replace("px", "")));

  if (el.dataset.scaleWidth === "true") {
    el.style.fontSize = "300px";
    while (el.scrollWidth > maxWidth) {
      el.style.fontSize = parseInt(el.style.fontSize) - 1 + "px";
    }
    while (el.scrollWidth < maxWidth * 0.98) {
      el.style.fontSize = parseInt(el.style.fontSize) + 1 + "px";
    }
    el.style.fontSize = parseInt(el.style.fontSize) - 1 + "px";
    return {
      text: el.innerHTML,
      fontSize: parseInt(el.style.fontSize),
    };
  }

  let testFitting = 0;
  const fitting = (): boolean => {
    testFitting++;
    if (testFitting > 2000) {
      return true;
    }
    if (debug) {
      console.log(
        `maxWidth: ${maxWidth}`,
        `maxHeight: ${maxHeight}`,
        `width: ${el.offsetWidth}`,
        `scrollWidth: ${el.scrollWidth}`,
        `height: ${el.offsetHeight}`,
        `scrollHeight: ${el.scrollHeight}`,
        maxFontSize,
        minFontSize,
        el
      );
    }
    return el.scrollWidth <= maxWidth && el.offsetHeight <= maxHeight;
  };

  if (fitting()) {
    return {
      text: el[ORIGINAL_TEXT_KEY] || el.innerHTML,
      fontSize: maxFontSize,
    };
  }

  let fontSizeTry = maxFontSize - 1;
  while (!fitting() && fontSizeTry > minFontSize) {
    el.style.fontSize = `${fontSizeTry}px`;
    fontSizeTry -= 1;
  }
  if (fitting()) {
    return {
      text: el[ORIGINAL_TEXT_KEY] || el.innerHTML,
      fontSize: fontSizeTry + 1,
    };
  }

  return {
    text: el.innerHTML,
    fontSize: fontSizeTry + 1,
  };
}
