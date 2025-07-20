import * as React from "react";
import { FontMeta } from "@/types";
import { ScrollArea } from "@base-ui-components/react/scroll-area";
import ShortcutsDialog from "./shortcuts-dialog";
import { Radio } from "@base-ui-components/react/radio";
import { RadioGroup } from "@base-ui-components/react/radio-group";
import { useMousetrap } from "@/hooks/use-mouse-trap";
import { GradientAnimationShader } from "./shader";

const getFontStyles = (font: Omit<FontMeta, "styles">) => {
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

export function FontPreviewPanel({ font }: { font: FontMeta | null }) {
  const [selectedStyle, setSelectedStyle] = React.useState<string | null>(null);

  // Get all unique styles
  const allStyles = React.useMemo(() => {
    if (!font) return [];

    const styles = new Set<string>();
    styles.add(font.style);
    font.styles?.forEach((s) => styles.add(s.style));

    return Array.from(styles)
      .sort()
      .map((style) => {
        if (style === font.style) return font;
        const styleFont = font.styles?.find((s) => s.style === style);
        return styleFont || font; // Fallback to main font if style not found
      });
  }, [font]);

  React.useEffect(() => {
    // Reset selected style when font changes
    if (font) {
      setSelectedStyle(font.style);
    }
  }, [font]);

  useMousetrap([
    {
      keys: ["r"],
      callback: () => {
        // Shuffle font styles
        if (allStyles.length > 1) {
          const currentIndex = allStyles.findIndex(
            (s) => s.style === selectedStyle
          );
          const nextIndex = (currentIndex + 1) % allStyles.length;
          setSelectedStyle(allStyles[nextIndex].style);
        }
      },
    },
  ]);

  if (!font) {
    return (
      <div
        className="hidden xl:flex w-[420px] min-w-[320px] max-w-[480px] bg-background text-foreground flex-col h-[100dvh] overflow-hidden relative"
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <GradientAnimationShader />

        <div className="flex items-center justify-end h-[65px] border-b border-l border-foreground/10 px-4 z-10 "></div>
        <div className="flex-1 w-full h-full border-l border-foreground/10 flex items-center justify-center z-10">
          <div className="flex flex-col items-center justify-center max-w-[320px] text-center space-y-4">
            <div className="w-16 h-16 rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] group isolate before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] before:transition-opacity before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-gradient-to-b before:from-white/20 before:opacity-50 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:bg-gradient-to-b after:from-[#FFC61F]/50 after:from-[46%] after:to-[84%] after:mix-blend-overlay shadow-[0_1px_rgba(255,193,31,0.07)_inset,0_1px_3px_rgba(252,208,86,0.2)] bg-[var(--accent)] ring-1 ring-[var(--accent)] relative flex items-center justify-center">
              <div className="absolute inset-0 -z-20 rounded-md bg-[var(--accent)] opacity-20 blur-[16px]" />
              <svg
                viewBox="0 0 180 126"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="p-2"
              >
                <path
                  style={{
                    mixBlendMode: "screen",
                  }}
                  d="M162.8.405h12.437a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-7.93a4.507 4.507 0 00-4.507 4.507v96.038a4.51 4.51 0 004.507 4.507h7.93a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-35.04a4.507 4.507 0 01-4.507-4.507v-1.152a4.51 4.51 0 014.507-4.507h7.93a4.507 4.507 0 004.507-4.507V15.078a4.507 4.507 0 00-4.507-4.507h-7.93a4.507 4.507 0 01-4.507-4.507V4.912a4.51 4.51 0 014.507-4.507H162.8z"
                  fill="url(#paint0_linear_55_114)"
                />
                <path
                  style={{
                    mixBlendMode: "color",
                  }}
                  d="M162.8.405h12.437a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-7.93a4.507 4.507 0 00-4.507 4.507v96.038a4.51 4.51 0 004.507 4.507h7.93a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-35.04a4.507 4.507 0 01-4.507-4.507v-1.152a4.51 4.51 0 014.507-4.507h7.93a4.507 4.507 0 004.507-4.507V15.078a4.507 4.507 0 00-4.507-4.507h-7.93a4.507 4.507 0 01-4.507-4.507V4.912a4.51 4.51 0 014.507-4.507H162.8z"
                  fill="url(#paint1_linear_55_114)"
                />
                <path
                  d="M162.8.405h12.437a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-7.93a4.507 4.507 0 00-4.507 4.507v96.038a4.51 4.51 0 004.507 4.507h7.93a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-35.04a4.507 4.507 0 01-4.507-4.507v-1.152a4.51 4.51 0 014.507-4.507h7.93a4.507 4.507 0 004.507-4.507V15.078a4.507 4.507 0 00-4.507-4.507h-7.93a4.507 4.507 0 01-4.507-4.507V4.912a4.51 4.51 0 014.507-4.507H162.8z"
                  fill="#E8E8E8"
                />
                <path
                  d="M162.8.405h12.437a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-7.93a4.507 4.507 0 00-4.507 4.507v96.038a4.51 4.51 0 004.507 4.507h7.93a4.507 4.507 0 014.507 4.507v1.152a4.507 4.507 0 01-4.507 4.507h-35.04a4.507 4.507 0 01-4.507-4.507v-1.152a4.51 4.51 0 014.507-4.507h7.93a4.507 4.507 0 004.507-4.507V15.078a4.507 4.507 0 00-4.507-4.507h-7.93a4.507 4.507 0 01-4.507-4.507V4.912a4.51 4.51 0 014.507-4.507H162.8z"
                  fill="#F79E16"
                  fillOpacity={0.196078}
                />
                <path
                  style={{
                    mixBlendMode: "screen",
                  }}
                  d="M27.617 54.001h13.102l27.092 70.34H54.61l-6.6-18.619H19.931l-6.6 18.619H.623l26.994-70.34zm-4.335 42.362h21.476l-10.54-30.244h-.296l-10.64 30.244z"
                  fill="url(#paint2_linear_55_114)"
                />
                <path
                  style={{
                    mixBlendMode: "color",
                  }}
                  d="M27.617 54.001h13.102l27.092 70.34H54.61l-6.6-18.619H19.931l-6.6 18.619H.623l26.994-70.34zm-4.335 42.362h21.476l-10.54-30.244h-.296l-10.64 30.244z"
                  fill="url(#paint3_linear_55_114)"
                />
                <path
                  d="M27.617 54.001h13.102l27.092 70.34H54.61l-6.6-18.619H19.931l-6.6 18.619H.623l26.994-70.34zm-4.335 42.362h21.476l-10.54-30.244h-.296l-10.64 30.244z"
                  fill="#E8E8E8"
                />
                <path
                  d="M27.617 54.001h13.102l27.092 70.34H54.61l-6.6-18.619H19.931l-6.6 18.619H.623l26.994-70.34zm-4.335 42.362h21.476l-10.54-30.244h-.296l-10.64 30.244z"
                  fill="#F79E16"
                  fillOpacity={0.196078}
                />
                <path
                  d="M27.617 54.001h13.102l27.092 70.34H54.61l-6.6-18.619H19.931l-6.6 18.619H.623l26.994-70.34zm-4.335 42.362h21.476l-10.54-30.244h-.296l-10.64 30.244z"
                  fill="#1C1C1C"
                />
                <path
                  style={{
                    mixBlendMode: "screen",
                  }}
                  d="M115.59 113.012c0 1.379.164 2.364.492 2.956.394.591 1.117.886 2.167.886h1.183c.459 0 .985-.065 1.576-.197v7.783c-.394.131-.92.262-1.576.394-.591.197-1.215.361-1.872.492-.657.132-1.314.23-1.97.296-.657.065-1.215.098-1.675.098-2.299 0-4.203-.459-5.714-1.379-1.511-.919-2.496-2.528-2.956-4.827-2.233 2.167-4.991 3.743-8.275 4.729-3.218.985-6.338 1.477-9.359 1.477-2.298 0-4.499-.328-6.6-.985-2.102-.591-3.974-1.478-5.616-2.66-1.576-1.248-2.857-2.791-3.842-4.63-.92-1.904-1.379-4.105-1.379-6.6 0-3.153.558-5.714 1.675-7.684 1.182-1.971 2.693-3.514 4.531-4.63 1.905-1.117 4.007-1.905 6.306-2.365a66.565 66.565 0 017.093-1.182 49.064 49.064 0 015.812-.788c1.839-.197 3.448-.493 4.827-.887 1.445-.394 2.562-.985 3.35-1.773.854-.854 1.28-2.102 1.28-3.744 0-1.445-.361-2.627-1.083-3.546a6.085 6.085 0 00-2.562-2.07c-.985-.525-2.101-.853-3.35-.984a22.784 22.784 0 00-3.546-.296c-3.152 0-5.746.657-7.782 1.97-2.036 1.314-3.186 3.35-3.448 6.108H72.046c.197-3.283.985-6.009 2.364-8.176 1.38-2.168 3.12-3.908 5.222-5.222 2.167-1.313 4.597-2.233 7.29-2.758a43.112 43.112 0 018.275-.788c2.496 0 4.959.263 7.389.788 2.43.525 4.597 1.38 6.502 2.561 1.97 1.182 3.546 2.726 4.728 4.63 1.182 1.84 1.774 4.105 1.774 6.798v26.205zm-11.231-14.186c-1.708 1.116-3.809 1.806-6.305 2.069a72.95 72.95 0 00-7.487.985 20.34 20.34 0 00-3.448.887c-1.117.328-2.102.82-2.956 1.477-.854.591-1.543 1.412-2.069 2.463-.46.985-.69 2.2-.69 3.645 0 1.248.362 2.299 1.085 3.153a8.693 8.693 0 002.56 2.069 14.14 14.14 0 003.35.985c1.248.197 2.365.295 3.35.295 1.248 0 2.594-.164 4.039-.492a12.853 12.853 0 004.04-1.675c1.313-.788 2.396-1.773 3.25-2.956.854-1.247 1.281-2.758 1.281-4.531v-8.374z"
                  fill="url(#paint4_linear_55_114)"
                />
                <path
                  style={{
                    mixBlendMode: "color",
                  }}
                  d="M115.59 113.012c0 1.379.164 2.364.492 2.956.394.591 1.117.886 2.167.886h1.183c.459 0 .985-.065 1.576-.197v7.783c-.394.131-.92.262-1.576.394-.591.197-1.215.361-1.872.492-.657.132-1.314.23-1.97.296-.657.065-1.215.098-1.675.098-2.299 0-4.203-.459-5.714-1.379-1.511-.919-2.496-2.528-2.956-4.827-2.233 2.167-4.991 3.743-8.275 4.729-3.218.985-6.338 1.477-9.359 1.477-2.298 0-4.499-.328-6.6-.985-2.102-.591-3.974-1.478-5.616-2.66-1.576-1.248-2.857-2.791-3.842-4.63-.92-1.904-1.379-4.105-1.379-6.6 0-3.153.558-5.714 1.675-7.684 1.182-1.971 2.693-3.514 4.531-4.63 1.905-1.117 4.007-1.905 6.306-2.365a66.565 66.565 0 017.093-1.182 49.064 49.064 0 015.812-.788c1.839-.197 3.448-.493 4.827-.887 1.445-.394 2.562-.985 3.35-1.773.854-.854 1.28-2.102 1.28-3.744 0-1.445-.361-2.627-1.083-3.546a6.085 6.085 0 00-2.562-2.07c-.985-.525-2.101-.853-3.35-.984a22.784 22.784 0 00-3.546-.296c-3.152 0-5.746.657-7.782 1.97-2.036 1.314-3.186 3.35-3.448 6.108H72.046c.197-3.283.985-6.009 2.364-8.176 1.38-2.168 3.12-3.908 5.222-5.222 2.167-1.313 4.597-2.233 7.29-2.758a43.112 43.112 0 018.275-.788c2.496 0 4.959.263 7.389.788 2.43.525 4.597 1.38 6.502 2.561 1.97 1.182 3.546 2.726 4.728 4.63 1.182 1.84 1.774 4.105 1.774 6.798v26.205zm-11.231-14.186c-1.708 1.116-3.809 1.806-6.305 2.069a72.95 72.95 0 00-7.487.985 20.34 20.34 0 00-3.448.887c-1.117.328-2.102.82-2.956 1.477-.854.591-1.543 1.412-2.069 2.463-.46.985-.69 2.2-.69 3.645 0 1.248.362 2.299 1.085 3.153a8.693 8.693 0 002.56 2.069 14.14 14.14 0 003.35.985c1.248.197 2.365.295 3.35.295 1.248 0 2.594-.164 4.039-.492a12.853 12.853 0 004.04-1.675c1.313-.788 2.396-1.773 3.25-2.956.854-1.247 1.281-2.758 1.281-4.531v-8.374z"
                  fill="url(#paint5_linear_55_114)"
                />
                <path
                  d="M115.59 113.012c0 1.379.164 2.364.492 2.956.394.591 1.117.886 2.167.886h1.183c.459 0 .985-.065 1.576-.197v7.783c-.394.131-.92.262-1.576.394-.591.197-1.215.361-1.872.492-.657.132-1.314.23-1.97.296-.657.065-1.215.098-1.675.098-2.299 0-4.203-.459-5.714-1.379-1.511-.919-2.496-2.528-2.956-4.827-2.233 2.167-4.991 3.743-8.275 4.729-3.218.985-6.338 1.477-9.359 1.477-2.298 0-4.499-.328-6.6-.985-2.102-.591-3.974-1.478-5.616-2.66-1.576-1.248-2.857-2.791-3.842-4.63-.92-1.904-1.379-4.105-1.379-6.6 0-3.153.558-5.714 1.675-7.684 1.182-1.971 2.693-3.514 4.531-4.63 1.905-1.117 4.007-1.905 6.306-2.365a66.565 66.565 0 017.093-1.182 49.064 49.064 0 015.812-.788c1.839-.197 3.448-.493 4.827-.887 1.445-.394 2.562-.985 3.35-1.773.854-.854 1.28-2.102 1.28-3.744 0-1.445-.361-2.627-1.083-3.546a6.085 6.085 0 00-2.562-2.07c-.985-.525-2.101-.853-3.35-.984a22.784 22.784 0 00-3.546-.296c-3.152 0-5.746.657-7.782 1.97-2.036 1.314-3.186 3.35-3.448 6.108H72.046c.197-3.283.985-6.009 2.364-8.176 1.38-2.168 3.12-3.908 5.222-5.222 2.167-1.313 4.597-2.233 7.29-2.758a43.112 43.112 0 018.275-.788c2.496 0 4.959.263 7.389.788 2.43.525 4.597 1.38 6.502 2.561 1.97 1.182 3.546 2.726 4.728 4.63 1.182 1.84 1.774 4.105 1.774 6.798v26.205zm-11.231-14.186c-1.708 1.116-3.809 1.806-6.305 2.069a72.95 72.95 0 00-7.487.985 20.34 20.34 0 00-3.448.887c-1.117.328-2.102.82-2.956 1.477-.854.591-1.543 1.412-2.069 2.463-.46.985-.69 2.2-.69 3.645 0 1.248.362 2.299 1.085 3.153a8.693 8.693 0 002.56 2.069 14.14 14.14 0 003.35.985c1.248.197 2.365.295 3.35.295 1.248 0 2.594-.164 4.039-.492a12.853 12.853 0 004.04-1.675c1.313-.788 2.396-1.773 3.25-2.956.854-1.247 1.281-2.758 1.281-4.531v-8.374z"
                  fill="#E8E8E8"
                />
                <path
                  d="M115.59 113.012c0 1.379.164 2.364.492 2.956.394.591 1.117.886 2.167.886h1.183c.459 0 .985-.065 1.576-.197v7.783c-.394.131-.92.262-1.576.394-.591.197-1.215.361-1.872.492-.657.132-1.314.23-1.97.296-.657.065-1.215.098-1.675.098-2.299 0-4.203-.459-5.714-1.379-1.511-.919-2.496-2.528-2.956-4.827-2.233 2.167-4.991 3.743-8.275 4.729-3.218.985-6.338 1.477-9.359 1.477-2.298 0-4.499-.328-6.6-.985-2.102-.591-3.974-1.478-5.616-2.66-1.576-1.248-2.857-2.791-3.842-4.63-.92-1.904-1.379-4.105-1.379-6.6 0-3.153.558-5.714 1.675-7.684 1.182-1.971 2.693-3.514 4.531-4.63 1.905-1.117 4.007-1.905 6.306-2.365a66.565 66.565 0 017.093-1.182 49.064 49.064 0 015.812-.788c1.839-.197 3.448-.493 4.827-.887 1.445-.394 2.562-.985 3.35-1.773.854-.854 1.28-2.102 1.28-3.744 0-1.445-.361-2.627-1.083-3.546a6.085 6.085 0 00-2.562-2.07c-.985-.525-2.101-.853-3.35-.984a22.784 22.784 0 00-3.546-.296c-3.152 0-5.746.657-7.782 1.97-2.036 1.314-3.186 3.35-3.448 6.108H72.046c.197-3.283.985-6.009 2.364-8.176 1.38-2.168 3.12-3.908 5.222-5.222 2.167-1.313 4.597-2.233 7.29-2.758a43.112 43.112 0 018.275-.788c2.496 0 4.959.263 7.389.788 2.43.525 4.597 1.38 6.502 2.561 1.97 1.182 3.546 2.726 4.728 4.63 1.182 1.84 1.774 4.105 1.774 6.798v26.205zm-11.231-14.186c-1.708 1.116-3.809 1.806-6.305 2.069a72.95 72.95 0 00-7.487.985 20.34 20.34 0 00-3.448.887c-1.117.328-2.102.82-2.956 1.477-.854.591-1.543 1.412-2.069 2.463-.46.985-.69 2.2-.69 3.645 0 1.248.362 2.299 1.085 3.153a8.693 8.693 0 002.56 2.069 14.14 14.14 0 003.35.985c1.248.197 2.365.295 3.35.295 1.248 0 2.594-.164 4.039-.492a12.853 12.853 0 004.04-1.675c1.313-.788 2.396-1.773 3.25-2.956.854-1.247 1.281-2.758 1.281-4.531v-8.374z"
                  fill="#F79E16"
                  fillOpacity={0.196078}
                />
                <path
                  d="M115.59 113.012c0 1.379.164 2.364.492 2.956.394.591 1.117.886 2.167.886h1.183c.459 0 .985-.065 1.576-.197v7.783c-.394.131-.92.262-1.576.394-.591.197-1.215.361-1.872.492-.657.132-1.314.23-1.97.296-.657.065-1.215.098-1.675.098-2.299 0-4.203-.459-5.714-1.379-1.511-.919-2.496-2.528-2.956-4.827-2.233 2.167-4.991 3.743-8.275 4.729-3.218.985-6.338 1.477-9.359 1.477-2.298 0-4.499-.328-6.6-.985-2.102-.591-3.974-1.478-5.616-2.66-1.576-1.248-2.857-2.791-3.842-4.63-.92-1.904-1.379-4.105-1.379-6.6 0-3.153.558-5.714 1.675-7.684 1.182-1.971 2.693-3.514 4.531-4.63 1.905-1.117 4.007-1.905 6.306-2.365a66.565 66.565 0 017.093-1.182 49.064 49.064 0 015.812-.788c1.839-.197 3.448-.493 4.827-.887 1.445-.394 2.562-.985 3.35-1.773.854-.854 1.28-2.102 1.28-3.744 0-1.445-.361-2.627-1.083-3.546a6.085 6.085 0 00-2.562-2.07c-.985-.525-2.101-.853-3.35-.984a22.784 22.784 0 00-3.546-.296c-3.152 0-5.746.657-7.782 1.97-2.036 1.314-3.186 3.35-3.448 6.108H72.046c.197-3.283.985-6.009 2.364-8.176 1.38-2.168 3.12-3.908 5.222-5.222 2.167-1.313 4.597-2.233 7.29-2.758a43.112 43.112 0 018.275-.788c2.496 0 4.959.263 7.389.788 2.43.525 4.597 1.38 6.502 2.561 1.97 1.182 3.546 2.726 4.728 4.63 1.182 1.84 1.774 4.105 1.774 6.798v26.205zm-11.231-14.186c-1.708 1.116-3.809 1.806-6.305 2.069a72.95 72.95 0 00-7.487.985 20.34 20.34 0 00-3.448.887c-1.117.328-2.102.82-2.956 1.477-.854.591-1.543 1.412-2.069 2.463-.46.985-.69 2.2-.69 3.645 0 1.248.362 2.299 1.085 3.153a8.693 8.693 0 002.56 2.069 14.14 14.14 0 003.35.985c1.248.197 2.365.295 3.35.295 1.248 0 2.594-.164 4.039-.492a12.853 12.853 0 004.04-1.675c1.313-.788 2.396-1.773 3.25-2.956.854-1.247 1.281-2.758 1.281-4.531v-8.374z"
                  fill="#1C1C1C"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_55_114"
                    x1={206.888}
                    y1={87.0673}
                    x2={166.386}
                    y2={245.265}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#BCBCBC" />
                    <stop offset={0.100586} stopColor="#BCBCBC" />
                    <stop offset={0.764579} stopColor="#343434" />
                    <stop offset={1} stopColor="#343434" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_55_114"
                    x1={206.888}
                    y1={87.0673}
                    x2={166.386}
                    y2={245.265}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FDDA97" />
                    <stop offset={0.763393} stopColor="#F3A25B" />
                    <stop offset={1} stopColor="#F3A25B" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear_55_114"
                    x1={109.209}
                    y1={102.618}
                    x2={47.4388}
                    y2={191.365}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#BCBCBC" />
                    <stop offset={0.100586} stopColor="#BCBCBC" />
                    <stop offset={0.764579} stopColor="#343434" />
                    <stop offset={1} stopColor="#343434" />
                  </linearGradient>
                  <linearGradient
                    id="paint3_linear_55_114"
                    x1={109.209}
                    y1={102.618}
                    x2={47.4388}
                    y2={191.365}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FDDA97" />
                    <stop offset={0.763393} stopColor="#F3A25B" />
                    <stop offset={1} stopColor="#F3A25B" />
                  </linearGradient>
                  <linearGradient
                    id="paint4_linear_55_114"
                    x1={152.33}
                    y1={109.139}
                    x2={105.595}
                    y2={176.88}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#BCBCBC" />
                    <stop offset={0.100586} stopColor="#BCBCBC" />
                    <stop offset={0.764579} stopColor="#343434" />
                    <stop offset={1} stopColor="#343434" />
                  </linearGradient>
                  <linearGradient
                    id="paint5_linear_55_114"
                    x1={152.33}
                    y1={109.139}
                    x2={105.595}
                    y2={176.88}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FDDA97" />
                    <stop offset={0.763393} stopColor="#F3A25B" />
                    <stop offset={1} stopColor="#F3A25B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 [text-shadow:_0_0.5px_0px_rgba(0,0,0,0.15)]">
                Welcome to FontBook
              </h3>
              <p className="text-sm text-foreground/60 [text-shadow:_0_0.5px_0px_rgba(0,0,0,0.1)]">
                Select a font from the list to preview its styles, glyphs, and
                detailed information.
              </p>
              <p className="text-sm text-foreground/60 mb-4 mt-4 flex gap-1 items-center justify-center [text-shadow:_0_0.5px_0px_rgba(0,0,0,0.1)]">
                Explore the <ShortcutsDialog /> to navigate.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pangram = "Sphinx of black quartz, judge my vow.";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const symbols = "0123456789!@#$%^&*()_+-={}[]:;";

  // Find the current style object
  const currentStyle =
    selectedStyle === font.style
      ? font
      : font.styles?.find((s) => s.style === selectedStyle) || font;

  const fontStyles = getFontStyles(currentStyle);

  const handleValueChange = (value: unknown) => {
    if (typeof value === "string") {
      setSelectedStyle(value);
    }
  };

  return (
    <div
      className="hidden xl:flex border-l border-foreground/10 w-[420px] min-w-[320px] max-w-[480px] bg-background text-foreground  flex-col h-[100dvh] overflow-hidden relative"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <GradientAnimationShader />

      <div className="flex flex-col border-b shrink-0 border-foreground/10 z-10">
        <div className="flex items-center justify-between h-[64px] px-4">
          <div className="flex flex-col">
            <h2 className="text-md font-mono font-medium truncate text-foreground">
              {font.family}
            </h2>
            <span className="text-xs opacity-60">{currentStyle.style}</span>
          </div>
          <ShortcutsDialog />
        </div>
      </div>

      <div className="py-4 z-10">
        {(font.styles?.length ?? 0) > 0 && (
          <div className="px-4 pb-4">
            <RadioGroup
              value={selectedStyle || font.style}
              onValueChange={handleValueChange}
              className="flex flex-wrap gap-2"
            >
              {allStyles.map((style) => (
                <label key={style.style} className="flex items-center gap-2">
                  <Radio.Root
                    value={style.style}
                    className="flex size-4 items-center justify-center rounded-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-foreground data-[unchecked]:border data-[unchecked]:border-foreground/20"
                  >
                    <Radio.Indicator className="flex before:size-1.5 before:rounded-full before:bg-background data-[unchecked]:hidden" />
                  </Radio.Root>
                  <span className="text-xs leading-none">{style.style}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>
      <ScrollArea.Root className="flex-1 w-full h-full">
        <ScrollArea.Viewport className="h-full w-full p-4 pb-40">
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              <div className="flex w-full items-center">
                <div
                  style={{
                    ...fontStyles,
                    whiteSpace: "nowrap",
                    display: "block",
                    fontSize: "24px",
                  }}
                >
                  {uppercase}
                </div>
              </div>
              <div className="flex w-full items-center">
                <div
                  style={{
                    ...fontStyles,
                    whiteSpace: "nowrap",
                    display: "block",
                    fontSize: "24px",
                  }}
                >
                  {lowercase}
                </div>
              </div>
              <div className="flex w-full items-center">
                <div
                  style={{
                    ...fontStyles,
                    whiteSpace: "nowrap",
                    display: "block",
                    fontSize: "24px",
                  }}
                >
                  {symbols}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8 border-t -mx-4 px-4 border-dashed border-b border-foreground/10 pt-4">
              <h3 className="text-sm font-medium opacity-60">Preview</h3>
              <div className="space-y-4">
                <div className="bg-foreground text-background flex items-center -mx-4 px-4 py-4">
                  <div
                    style={{
                      ...fontStyles,
                      whiteSpace: "nowrap",
                      display: "block",
                      fontSize: "24px",
                    }}
                  >
                    {pangram}
                  </div>
                </div>
                <div className="bg-accent text-foreground dark:text-background flex items-center -mx-4 px-4 py-4">
                  <div
                    style={{
                      ...fontStyles,
                      whiteSpace: "nowrap",
                      display: "block",
                      fontSize: "24px",
                    }}
                  >
                    {pangram}
                  </div>
                </div>
                <div className="bg-background text-foreground flex items-center -mx-4 px-4 py-4">
                  <div
                    style={{
                      ...fontStyles,
                      whiteSpace: "nowrap",
                      display: "block",
                      fontSize: "24px",
                    }}
                  >
                    {pangram}
                  </div>
                </div>
              </div>
            </div>

            {/* Style Showcase */}
            <div className="flex flex-col gap-4 ">
              <h3 className="text-sm font-medium opacity-60">Style Showcase</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="flex items-center justify-center bg-foreground text-background text-4xl aspect-square"
                  style={fontStyles}
                >
                  Bl
                </div>
                <div
                  className="flex items-center justify-center bg-foreground text-background text-4xl aspect-square"
                  style={fontStyles}
                >
                  09
                </div>
                <div
                  className="flex items-center justify-center bg-background text-foreground text-4xl aspect-square border border-foreground/10"
                  style={fontStyles}
                >
                  09
                </div>
                <div
                  className="flex items-center justify-center bg-background text-foreground text-4xl aspect-square border border-foreground/10"
                  style={fontStyles}
                >
                  Bl
                </div>
              </div>
            </div>

            {/* Font Information */}
            <div className="flex flex-col gap-4 mt-8">
              <h3 className="text-sm font-medium opacity-60">
                Font Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="opacity-60">PostScript Name:</span>{" "}
                  {font.postscriptName}
                </p>
                <p>
                  <span className="opacity-60">Style:</span> {font.style}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="m-2 flex w-1 justify-center rounded bg-foreground/10 opacity-0 transition-opacity delay-300 data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[hovering]:duration-75 data-[scrolling]:opacity-100 data-[scrolling]:delay-0 data-[scrolling]:duration-75"
        >
          <ScrollArea.Thumb className="w-full rounded bg-foreground/50  dark:mix-blend-difference" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
