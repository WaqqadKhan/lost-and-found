import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { AuthLayout } from "@/components/auth-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <AuthLayout
      title="Sign in"
      description={
        <>
          Use the email and password you registered with. New here?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
          .
        </>
      }
      footer={
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mx-auto flex w-fit")}>
          Back to home
        </Link>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
