import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { SignInButton, SignUpButton, useAuth, useUser } from '@clerk/react';
import imgLogo from '@/assets/buffer-logo.png';

export default function Onboarding() {
  const navigate = useNavigate();

  // isLoaded becomes true once Clerk has resolved the session from its cookie/storage.
  const { isSignedIn, isLoaded } = useAuth();
  // user.unsafeMetadata is set client-side and holds the onboarding_completed flag.
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    // Wait until Clerk has finished loading both the auth state and the user record.
    if (!isLoaded || !userLoaded) return;
    // Only redirect authenticated users — unauthenticated users stay on the entry screen.
    if (!isSignedIn || !user) return;

    // Rule 2: an authenticated user must never see the welcome/entry screen.
    // Rule 3: new user (onboarding_completed not yet true) → onboarding wizard step 1.
    // Rule 4: returning user (onboarding_completed === true) → dashboard.
    const completed = user.unsafeMetadata?.onboarding_completed === true;
    navigate(completed ? '/dashboard' : '/onboarding/flow', { replace: true });
  }, [isLoaded, userLoaded, isSignedIn, user, navigate]);

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
        {/*
          mode="modal" keeps the Clerk UI on-page (no external redirect).
          When the modal closes after a successful sign-up/sign-in, Clerk updates
          its session cookie and isSignedIn flips to true — the useEffect above fires
          immediately and navigates the user forward. Without mode="modal", Clerk performs
          a redirect to its hosted sign-in page and relies on the Clerk dashboard's
          "after sign-in URL" setting, which is not configured here and causes users to
          return to this same entry screen.
        */}
        <SignUpButton mode="modal">
          <button className="w-full bg-black text-white py-3 rounded-[12px] text-[15px] font-semibold hover:bg-gray-800 transition">
            Create account
          </button>
        </SignUpButton>

        <SignInButton mode="modal">
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
