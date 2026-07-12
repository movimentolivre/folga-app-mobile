import Link from "next/link";
import { signOut } from "@/actions/folgas";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 print:hidden">
        <h1 className="text-lg font-bold text-primary">Folga App</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm text-gray-500 underline">
            Sair
          </button>
        </form>
      </header>

      <main className="flex-1 p-4">{children}</main>

      <nav className="sticky bottom-0 flex border-t bg-white print:hidden">
        <Link href="/" className="flex-1 py-3 text-center text-sm font-medium">
          Marcar Folga
        </Link>
        <Link href="/historico" className="flex-1 py-3 text-center text-sm font-medium">
          Histórico
        </Link>
      </nav>
    </div>
  );
}
