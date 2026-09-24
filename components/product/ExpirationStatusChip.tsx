import { Chip, type ChipProps } from "@mui/material";
import { getExpirationStatus, type ExpirationStatus } from "@/lib/product/expiration";

const APPEARANCE: Record<ExpirationStatus, { label: string; color: ChipProps["color"] }> = {
  none: { label: "Sem validade", color: "default" },
  expired: { label: "Vencido", color: "error" },
  expiring: { label: "Vence em breve", color: "warning" },
  ok: { label: "No prazo", color: "success" },
};

export function ExpirationStatusChip({ expirationDate }: { expirationDate: string | null }) {
  const { label, color } = APPEARANCE[getExpirationStatus(expirationDate)];
  return <Chip size="small" label={label} color={color} variant={color === "default" ? "outlined" : "filled"} />;
}
