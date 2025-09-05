"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export default function SafeImage({ src, alt, fallbackSrc = "/file.svg", ...rest }: Props) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      unoptimized
      onError={() => setCurrent(fallbackSrc)}
    />
  );
}

