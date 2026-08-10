import { redirect } from "next/navigation";

/** Legacy path — empty onboarding now lives on `/`. */
export default function EmptyRoutinePage() {
  redirect("/");
}
