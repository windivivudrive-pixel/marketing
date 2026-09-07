import {Img, OffthreadVideo, staticFile} from "remotion";
import type {MediaAsset} from "../types";

export const Media = ({asset, style}: {asset?: MediaAsset; style?: React.CSSProperties}) => {
  if (!asset?.src) return null;
  if (asset.kind === "video") {
    return <OffthreadVideo muted src={staticFile(asset.src)} style={style} />;
  }
  return <Img src={staticFile(asset.src)} alt={asset.alt} style={style} />;
};

