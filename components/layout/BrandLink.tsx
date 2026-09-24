"use client";

import Link from "next/link";
import { Stack, Typography } from "@mui/material";
import SpaIcon from "@mui/icons-material/Spa";

export function BrandLink({ href = "/" }: { href?: string }) {
  return (
    <Stack
      component={Link}
      href={href}
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", color: "primary.main", textDecoration: "none" }}
    >
      <SpaIcon />
      <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
        FoodRescue
      </Typography>
    </Stack>
  );
}
