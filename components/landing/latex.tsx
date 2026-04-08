"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

interface LatexProps {
  math: string;
  display?: boolean;
  className?: string;
}

export function Latex({ math, display = false, className }: LatexProps) {
  const html = useMemo(
    () =>
      katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      }),
    [math, display]
  );

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
