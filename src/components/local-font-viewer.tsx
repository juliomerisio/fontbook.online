"use client";

import React, { useRef, useState } from "react";
import { useLocalFonts } from "@/hooks/use-local-fonts";
import { fontsState, state } from "@/store/font-store";
import { useSnapshot } from "valtio";

const NotSupported = () => {
  return (
    <div className="text-yellow-600">
      Local Font Access API is not supported in this browser.
    </div>
  );
};

const PermissionDenied = () => {
  return (
    <div className="text-red-600">
      Local Font Access API is denied. Please allow access in your browser.
    </div>
  );
};

export const LocalFontViewer = () => {
  const {
    supportAndPermissionStatus,
    loadAllFonts,
    clearCache,
    getFontData,
    fontWeightLabels,
    parseFontStyleToWeight,
    isMonospace,
  } = useLocalFonts({
    fontsState,
    state,
    documentName: "local-fonts-viewer",
  });

  const [blobInfo, setBlobInfo] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshot = useSnapshot(state);
  const fonts = useSnapshot(fontsState);

  if (snapshot.loading) {
    return null;
  }

  if (supportAndPermissionStatus === "not-supported") {
    return <NotSupported />;
  }

  if (supportAndPermissionStatus === "denied") {
    return <PermissionDenied />;
  }

  if (snapshot.error) {
    return <div className="text-red-500">Error: {snapshot.error}</div>;
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={loadAllFonts}
          disabled={snapshot.loading}
          className="border px-2 py-1 rounded"
        >
          {snapshot.loading ? "Loading..." : "Load All Fonts"}
        </button>
        <button onClick={clearCache} className="border px-2 py-1 rounded">
          Clear All Fonts
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={40}
        style={{ display: "none" }}
      />
      <div className="flex flex-col gap-2 mt-5">
        {fonts.length === 0 && <div>No fonts loaded.</div>}
        {fonts.map((font) => {
          const weight = parseFontStyleToWeight(font.style);
          const weightLabel = fontWeightLabels[weight] || weight;
          let mono = false;
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              mono = isMonospace(ctx, font.family);
            }
          }
          return (
            <div
              key={font.postscriptName}
              className="border rounded p-2 flex flex-col gap-1"
            >
              <div>
                <b>PostScript Name:</b> {font.postscriptName}
              </div>
              <div>
                <b>Full Name:</b> {font.fullName}
              </div>
              <div>
                <b>Family:</b> {font.family}
              </div>
              <div>
                <b>Style:</b> {font.style}
              </div>
              <div>
                <b>Weight:</b> {weightLabel} ({weight})
              </div>
              <div>
                <b>Monospace:</b> {mono ? "Yes" : "No"}
              </div>
              <div className="mt-2 mb-1">
                <div
                  style={{
                    fontFamily: font.family,
                    fontSize: 24,
                    border: "1px dashed #ccc",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
              <button
                className="border px-2 py-1 rounded w-fit mt-1"
                onClick={async () => {
                  try {
                    const blob = await getFontData(font.postscriptName);
                    setBlobInfo((prev) => ({
                      ...prev,
                      [font.postscriptName]: `Blob size: ${blob.size} bytes`,
                    }));
                  } catch (e) {
                    setBlobInfo((prev) => ({
                      ...prev,
                      [font.postscriptName]: `Error: ${(e as Error).message}`,
                    }));
                  }
                }}
              >
                Get Blob
              </button>
              {blobInfo[font.postscriptName] && (
                <div className="text-xs text-gray-600">
                  {blobInfo[font.postscriptName]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
