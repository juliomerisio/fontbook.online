import { LocalFontViewer } from "@/components/local-font-viewer";
import { Suspense } from "react";

export default function Home() {
return (
    <div className="w-full root">
      <Suspense fallback={null}>
        <LocalFontViewer />
      </Suspense>
    </div>
  );
}
