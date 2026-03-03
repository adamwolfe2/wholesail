import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Partner Portal",
  description: "Sign in to your wholesale partner portal.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E5E1DB] px-6 py-4">
        <Link
          href="/"
          className="font-serif font-bold text-xl text-[#0A0A0A] tracking-tight hover:opacity-70 transition-opacity"
        >
          Wholesail
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-normal text-[#0A0A0A] mb-2">
              Partner Portal
            </h1>
            <p className="text-sm text-[#0A0A0A]/50">
              Sign in to manage your orders, invoices, and account.
            </p>
          </div>

          <SignIn
            fallbackRedirectUrl="/auth/redirect"
            signUpUrl="/sign-up"
            appearance={{
              layout: {
                logoPlacement: "none",
                socialButtonsVariant: "blockButton",
              },
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none border border-[#E5E1DB] bg-white rounded-none p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-[#E5E1DB] bg-white hover:bg-[#F9F7F4] text-[#0A0A0A] text-sm font-normal rounded-none h-10 transition-colors",
                dividerLine: "bg-[#E5E1DB]",
                dividerText: "text-[#0A0A0A]/40 text-xs",
                formFieldLabel: "text-xs font-medium text-[#0A0A0A]/70 mb-1",
                formFieldInput:
                  "border border-[#E5E1DB] bg-white focus:border-[#0A0A0A] focus:ring-0 rounded-none h-10 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/30",
                formButtonPrimary:
                  "bg-[#0A0A0A] hover:bg-[#0A0A0A]/80 text-[#F9F7F4] rounded-none h-10 text-sm font-medium transition-colors",
                footerActionLink: "text-[#0A0A0A] underline underline-offset-2 hover:opacity-70",
                identityPreviewEditButton: "text-[#0A0A0A] underline underline-offset-2",
                otpCodeFieldInput: "border border-[#E5E1DB] rounded-none text-[#0A0A0A]",
                alertText: "text-sm",
                formFieldErrorText: "text-xs text-red-600",
              },
            }}
          />

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-[#0A0A0A]/40">
            Not a partner yet?{" "}
            <Link href="/partner" className="text-[#0A0A0A] underline underline-offset-2 hover:opacity-70">
              Apply for wholesale access
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <footer className="border-t border-[#E5E1DB] px-6 py-3">
        <p className="text-[11px] text-[#0A0A0A]/30 text-center">
          Wholesail &mdash; Wholesale Portal
        </p>
      </footer>
    </div>
  );
}
