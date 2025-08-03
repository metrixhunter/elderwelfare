'use client';
import SignupPage from './page';

export default function SignupWrapper() {
  // No longer need to patch handleSignup, logic is in SignupPage itself.
  return <SignupPage />;
}