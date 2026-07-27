"use client";

import { shouldUseUnoptimizedImageForSupabaseStorage } from "@/lib/supabaseStorageImage";
import { UserIcon } from "@heroicons/react/16/solid";
import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

type FotoPerfilImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackIconClassName?: string;
} & (
  | { fill: true; width?: never; height?: never }
  | { fill?: false; width: number; height: number }
);

export default function FotoPerfilImage({
  src,
  alt,
  className = "object-cover",
  sizes,
  priority,
  fallbackIconClassName = "h-6 w-6",
  fill,
  width,
  height,
}: FotoPerfilImageProps) {
  const [fotoFallo, setFotoFallo] = useState(false);

  useEffect(() => {
    setFotoFallo(false);
  }, [src]);

  const imagenSinOptimizar = useMemo(
    () => shouldUseUnoptimizedImageForSupabaseStorage(src),
    [src],
  );

  const mostrarFoto = Boolean(src?.trim()) && !fotoFallo;

  if (!mostrarFoto) {
    return (
      <span className="flex h-full w-full items-center justify-center overflow-hidden text-gray-600">
        <UserIcon className={fallbackIconClassName} aria-hidden />
      </span>
    );
  }

  const imageProps: ImageProps = {
    src,
    alt,
    className,
    sizes,
    priority,
    unoptimized: imagenSinOptimizar,
    onError: () => setFotoFallo(true),
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return <Image {...imageProps} width={width!} height={height!} />;
}
