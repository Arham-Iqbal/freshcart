import { Image, type ImageProps } from "expo-image";
import { resolveImage, BLURHASH, type ImageInput } from "../lib/images";

interface Props extends Omit<ImageProps, "source"> {
  source: ImageInput;
}

/** expo-image wrapper: bundled-key-then-remote resolution, blurhash, caching. */
export function SmartImage({ source, ...rest }: Props) {
  return (
    <Image
      source={resolveImage(source) as any}
      placeholder={BLURHASH}
      contentFit="cover"
      transition={250}
      cachePolicy="memory-disk"
      {...rest}
    />
  );
}
