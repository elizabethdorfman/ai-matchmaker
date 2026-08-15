import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/** Product image with a graceful fallback — a dead image is a dead comparison. */
export default function DressImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-black/5 text-xs opacity-40 dark:bg-white/10 ${className}`}
      >
        image unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
