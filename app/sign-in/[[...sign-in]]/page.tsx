import { SignIn } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
      <SignIn
        fallbackRedirectUrl="/admin"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border border-[#E5E1DB]",
          },
        }}
      />
    </div>
  );
}
