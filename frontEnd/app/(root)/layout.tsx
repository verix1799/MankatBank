import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import { redirect } from "next/navigation";
import { DEMO_MODE, demoUser } from "@/lib/demo";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const DEMO_MODE = true;

const demoUser = {
  id: "demo-user",
  name: "Vedic",
  email: "demo@bank.com",
  image: "/icons/user.svg",
};

const loggedIn = DEMO_MODE ? demoUser : await getLoggedInUser();

  if (!loggedIn && !DEMO_MODE) redirect("/sign-in");

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image src="/icons/logo.svg" width={30} height={30} alt="logo" />
          <div>
            <MobileNav user={loggedIn} />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
