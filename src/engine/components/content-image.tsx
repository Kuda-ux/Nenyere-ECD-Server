/**
 * ContentImage — wrapper around next/image for content-driven images.
 * Activity images come from Supabase Storage with unknown dimensions,
 * so we use fill mode with a sized container.
 */
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
};

export function ContentImage({
  src,
  alt,
  className,
  containerClassName,
  priority,
}: Props) {
  return (
    <div className={`relative overflow-hidden ${containerClassName ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className={`object-contain ${className ?? ""}`}
        priority={priority}
        unoptimized
      />
    </div>
  );
}
