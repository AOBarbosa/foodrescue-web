import { redirect } from "next/navigation";
import { ESTABLISHMENT_HOME_PATH } from "@/lib/auth/constants";

export default function DashboardPage() {
  redirect(ESTABLISHMENT_HOME_PATH);
}
