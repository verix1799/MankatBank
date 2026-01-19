import RootShell from "@/components/RootShell";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootShell>{children}</RootShell>;
}
