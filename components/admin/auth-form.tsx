"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useWorkspace } from "../workspace-provider";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const { signIn, signUp } = useWorkspace();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="admin-auth">
      <section className="auth-story">
        <Link href="/" className="auth-brand">
          <BookOpen /> Smart Money Book
        </Link>
        <div>
          <span className="admin-eyebrow">YOUR IDEAS. YOUR LIBRARY.</span>
          <h1>
            A little structure.
            <br />A lot of possibility.
          </h1>
          <p>
            Write the lesson. Share the chart. Build a resource your readers can
            return to.
          </p>
          <div className="auth-steps">
            <span>
              01 <b>Write</b>
            </span>
            <span>
              02 <b>Publish</b>
            </span>
            <span>
              03 <b>Review</b>
            </span>
          </div>
        </div>
        <p className="auth-note">The workspace behind Smart Money Book.</p>
      </section>
      <section className="auth-form-panel">
        <Link className="auth-back" href="/">
          View website <ArrowUpRight size={16} />
        </Link>
        <div className="auth-form-inner">
          <span className="admin-eyebrow">ADMIN WORKSPACE</span>
          <h2>{signup ? "Create your admin account" : "Welcome back."}</h2>
          <p>
            {signup
              ? "Register the designated account for administrator approval."
              : "Sign in to write, organize, and manage your library."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setBusy(true);
              try {
                const form = new FormData(e.currentTarget);
                const normalized = email.trim().toLowerCase();
                if (signup) {
                  const name = String(form.get("name") ?? "").trim();
                  if (!name) throw new Error("Enter your name.");
                  await signUp(name, normalized, password);
                  setError("Account registered. Verify your email and wait for administrator approval, then sign in.");
                  return;
                }
                await signIn(normalized, password);
                router.push("/admin/dashboard");
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Unable to sign in. Please try again.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {signup && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  aria-label="Password"
                  type={show ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={signup ? 8 : 1}
                  required
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? "Please wait…"
                : signup
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>
          <p className="auth-switch">
            {signup ? "Already have an account?" : "New to the workspace?"}{" "}
            <Link href={signup ? "/admin/login" : "/admin/sign-up"}>
              {signup ? "Sign in" : "Create account"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
