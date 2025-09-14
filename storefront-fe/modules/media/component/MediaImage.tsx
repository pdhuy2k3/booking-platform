type Props = {
  src: string
  alt: string
  className?: string
}

export function MediaImage({ src, alt, className }: Props) {
  return <img src={src} alt={alt} className={className} />
}

