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
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[rgba(255, 255, 255, 0.9)] text-white backdrop-blur transition-colors duration-300">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[rgba(120,168,255,0.18)]">
            <svg
              className="absolute inset-0 h-full w-full logo-ring"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(144,190,255,0.95)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              className="logo-bolt relative h-6 w-6 fill-[#9ac4ff]"
              aria-hidden="true"
            >
              <path d="M38 0 14 34h20l-10 30 32-38H34L38 0Z" />
            </svg>
          </span>
          <span>AuraGrid</span>
        </Link>

        <nav className="flex flex-1 justify-center gap-0 text-sm font-semibold text-white/85 -translate-x-6 sm:-translate-x-16 lg:-translate-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex h-9 items-center justify-center px-2 text-center leading-none transition-colors duration-200 hover:text-white ${
                pathname === link.href
                  ? "text-white after:absolute after:-bottom-1 after:left-1/2 after:h-0.5 after:w-8 after:-translate-x-1/2 after:bg-white"
                  : "text-white/70"
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
            <Link href="/sign-in" className={buttonClassName("secondary")}>
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
