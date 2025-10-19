"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { buttonClassName } from "@/lib/buttonStyles";

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/app", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/60 text-white backdrop-blur transition-colors duration-300">
      <div className="flex w-full flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
          AuraGrid
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold text-white/85">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative transition-colors duration-200 ${
                "hover:text-white"
              } ${
                pathname === link.href
                  ? "text-white after:absolute after:-bottom-1 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:bg-white"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className={buttonClassName("secondary")}
            >
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
