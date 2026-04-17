import { AuthGuard } from "@/components/auth-guard";

export default function TesteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
