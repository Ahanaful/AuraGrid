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
  const activeIndex = Math.max(
    navLinks.findIndex((link) => link.href === pathname),
    0,
  );
  const highlightStyle = {
    transform: `translateX(${activeIndex * 100}%)`,
  };

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
              className="logo-bolt relative h-6 w-6 fill-[#4f8bdc]"
              aria-hidden="true"
            >
              <path d="M38 0 14 34h20l-10 30 32-38H34L38 0Z" />
            </svg>
          </span>
          <span>AuraGrid</span>
        </Link>

        <div className="flex flex-1 justify-center -translate-x-6 sm:-translate-x-16 lg:-translate-x-12">
          <div className="group relative inline-flex w-full max-w-[18rem] items-center overflow-hidden rounded-full border-[2.25px] border-[rgba(120,168,255,0.28)] bg-[rgba(10,28,62,0.6)] p-1 text-sm font-semibold tracking-tight text-white shadow-[0_10px_30px_rgba(66,182,255,0.16)] transition-transform duration-300 backdrop-blur group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_36px_rgba(73,197,255,0.35)]">
            <span
              aria-hidden="true"
              style={highlightStyle}
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[linear-gradient(140deg,rgba(79,205,255,0.95),rgba(156,227,255,0.88))] opacity-100 transition-transform duration-500 ease-out group-hover:shadow-[0_12px_28px_rgba(73,197,255,0.4)]"
            />
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-pressed={isActive}
                  className={`relative z-10 flex flex-1 items-center justify-center rounded-full px-4 py-2 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                    isActive ? "text-slate-950" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

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
