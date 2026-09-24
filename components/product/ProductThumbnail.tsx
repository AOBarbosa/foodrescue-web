import { Avatar } from "@mui/material";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";

type ProductThumbnailProps = {
  name: string;
  photoUrl: string | null;
  size?: number;
};

/** Product photo, or a neutral icon when there's none (or it fails to load). */
export function ProductThumbnail({ name, photoUrl, size = 40 }: ProductThumbnailProps) {
  return (
    <Avatar
      variant="rounded"
      src={photoUrl ?? undefined}
      alt={name}
      sx={{ width: size, height: size, bgcolor: "action.hover", color: "text.secondary" }}
    >
      <FastfoodOutlinedIcon sx={{ fontSize: size * 0.55 }} />
    </Avatar>
  );
}
