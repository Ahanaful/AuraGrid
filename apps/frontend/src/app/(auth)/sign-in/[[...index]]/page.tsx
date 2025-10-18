import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <SignIn appearance={{ variables: { colorPrimary: "#0ea5e9" } }} routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
