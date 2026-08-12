import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { AuthLayout } from "@/components/auth-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description={
        <>
          Join to post lost or found items. Already registered?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
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
      <RegisterForm />
    </AuthLayout>
  );
}
