"use client";

import { useActionState } from "react";
import { sendSignInLink, type SignInState } from "@/app/sign-in/actions";

const initialState: SignInState = { status: "idle" };

export function SignInForm() {
  const [state, action, pending] = useActionState(sendSignInLink, initialState);

  if (state.status === "sent") {
    return (
      <p role="status" className="mt-6 rounded-lg border bg-accent p-4">
        Check your email. We sent you a link to sign in.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block font-medium">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={state.status === "error" ? "email-error" : undefined}
          className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3"
        />
        {state.status === "error" && (
          <p id="email-error" role="alert" className="mt-1 text-sm font-medium text-destructive">
            {state.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-md bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Sending..." : "Email me a sign-in link"}
      </button>
    </form>
  );
}
