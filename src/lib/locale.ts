import { cookies } from "next/headers";

export type Locale = "en" | "ar";
export async function getLocale(): Promise<Locale> { return (await cookies()).get("glowy_locale")?.value === "ar" ? "ar" : "en"; }
