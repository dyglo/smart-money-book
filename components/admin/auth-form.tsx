"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useWorkspace } from "../workspace-provider";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/workspace";
async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const { setSession } = useWorkspace();
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
          <h2>{signup ? "Create your demo account" : "Welcome back."}</h2>
          <p>
            {signup
              ? "Try the publishing workspace with a device-local demo account."
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
                  const name = String(form.get("name")).trim();
                  if (!name) throw new Error("Enter your name.");
                  if (normalized === DEMO_EMAIL)
                    throw new Error(
                      "Use the demo login for this email, or choose another email.",
                    );
                  localStorage.setItem(
                    "smb-demo-account",
                    JSON.stringify({
                      name,
                      email: normalized,
                      passwordHash: await hash(password),
                    }),
                  );
                  setSession({ name, email: normalized });
                } else {
                  let name = "Admin";
                  if (!(
                    normalized === DEMO_EMAIL && password === DEMO_PASSWORD
                  )) {
                    const saved = localStorage.getItem("smb-demo-account");
                    const account = saved ? JSON.parse(saved) : null;
                    if (
                      !account ||
                      account.email !== normalized ||
                      account.passwordHash !== (await hash(password))
                    )
                      throw new Error(
                        "Email or password is incorrect. Use the demo credentials below.",
                      );
                    name = account.name;
                  }
                  setSession({ name, email: normalized });
                }
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
                  ? "Create Demo Account"
                  : "Sign In"}
            </button>
          </form>
          <p className="auth-switch">
            {signup ? "Already have an account?" : "New to the workspace?"}{" "}
            <Link href={signup ? "/admin/login" : "/admin/sign-up"}>
              {signup ? "Sign in" : "Create demo account"}
            </Link>
          </p>
          <div className="demo-credentials">
            <strong>Try the demo</strong>
            <span>{DEMO_EMAIL}</span>
            <span>{DEMO_PASSWORD}</span>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
              }}
            >
              Use demo credentials
            </button>
          </div>
          <p className="auth-disclosure">
            Demo access only. Content is stored in this browser; this is not
            secure production authentication.
          </p>
        </div>
      </section>
    </main>
  );
}
