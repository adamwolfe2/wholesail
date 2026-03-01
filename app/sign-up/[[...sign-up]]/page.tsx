import { SignUp } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
      <SignUp
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
