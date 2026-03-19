import { Link } from "react-router";
import { SignInButton, SignUpButton } from "@clerk/react";
import imgLogo from "@/assets/buffer-logo.png";

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <img src={imgLogo} alt="Buffer" className="h-[28px] w-auto mb-10" />

      <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-center mb-2">
        Welcome to Buffer
      </h1>
      <p className="text-[15px] text-gray-500 text-center mb-10">
        Create an account or sign in to continue.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[340px]">
        <SignUpButton>
          <button className="w-full bg-black text-white py-3 rounded-[12px] text-[15px] font-semibold hover:bg-gray-800 transition">
            Create account
          </button>
        </SignUpButton>

        <SignInButton>
          <button className="w-full border border-black text-black py-3 rounded-[12px] text-[15px] font-medium hover:bg-gray-50 transition">
            Sign in
          </button>
        </SignInButton>
      </div>

      <Link to="/" className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition">
        Back to home
      </Link>
    </div>
  );
}
