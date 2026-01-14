import { LandingContent } from "@/components/home/LandingContent";
import { dictionaries } from "@/i18n/dictionaries";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/actions/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const dict = dictionaries[locale as keyof typeof dictionaries] || dictionaries.en;
  const currentUser = await getCurrentUser();

  return <LandingContent dict={dict} currentUser={currentUser} />;
}
