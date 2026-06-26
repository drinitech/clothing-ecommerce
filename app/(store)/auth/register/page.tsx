import RegisterForm from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create Account" }

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-muted-foreground mt-2">Join StyleHub and start shopping</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
