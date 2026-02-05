"use client";

import { useState } from "react";

interface BookingImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function BookingImage({ src, alt, className }: BookingImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc('https://images.unsplash.com/photo-1566073771259-6a8506099945');
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
