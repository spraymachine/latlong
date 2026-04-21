import { redirect } from "next/navigation";

export default function DashboardNewVoyageRedirectPage() {
  redirect("/voyages/new");
}
