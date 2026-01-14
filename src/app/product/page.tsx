import { redirect, RedirectType } from "next/navigation";

export default function ProductsRedirectPage() {
  redirect("/catalog", RedirectType.replace);
  return <></>;
}
