"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@mui/material";

type LinkButtonProps = Omit<ButtonProps<"a">, "href" | "component"> & { href: string };

/**
 * MUI `Button` rendered as a Next `Link`. Server components cannot pass
 * `component={Link}` themselves (a function can't cross the client boundary).
 */
export function LinkButton(props: LinkButtonProps) {
  return <Button component={Link} {...props} />;
}
