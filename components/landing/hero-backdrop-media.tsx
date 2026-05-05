"use client";

import Image from "next/image";
import { isPublicUploadPath } from "@/lib/nextImage";

/** Full-bleed hero layer: looping muted video or optimized image (matches admin focal `object-position`). */
export function HeroBackdropMedia(props: {
  src: string;
  objectPosition: string;
  isVideo: boolean;
}) {
  const { src, objectPosition, isVideo } = props;

  if (isVideo) {
    return (
      <video
        src={src}
        className="absolute inset-0 h-full w-full object-cover motion-safe:scale-[1.04] motion-reduce:scale-100"
        style={{ objectPosition }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      priority
      sizes="100vw"
      quality={82}
      className="object-cover motion-safe:scale-[1.04] motion-reduce:scale-100"
      style={{ objectPosition }}
      unoptimized={isPublicUploadPath(src)}
    />
  );
}
