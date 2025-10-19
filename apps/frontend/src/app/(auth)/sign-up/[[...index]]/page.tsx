import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <SignUp appearance={{ variables: { colorPrimary: "#0ea5e9" } }} routing="path" signInUrl="/sign-in" />
    </div>
  );
}
