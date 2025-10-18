"use client";

import { PropsWithChildren } from "react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

export function RequireAuth({ children }: PropsWithChildren) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/app" />
      </SignedOut>
    </>
  );
}
