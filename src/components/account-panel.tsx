"use client";
import Link from "next/link";
import { useState } from "react";
import { RecentHomes } from "./recent-homes";
import { accountAction, useConsumer } from "./consumer-provider";

type Mode = "welcome" | "register" | "signin" | "verify" | "forgot" | "reset";
export function AccountPanel() {
  const account = useConsumer();
  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function perform(action: () => Promise<void>) {
    if (busy) return; setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Please retry."); } finally { setBusy(false); }
  }
  async function submit(form: FormData) {
    await perform(async () => {
      const values = Object.fromEntries(form);
      if (mode === "register") {
        await accountAction("auth/sign-up/email", values); setEmail(String(values.email)); setMode("verify"); setMessage("Check your inbox for your six-digit Homes code.");
      } else if (mode === "signin") {
        await accountAction("auth/sign-in/email", values); await account?.refresh(true);
      } else if (mode === "verify") {
        await accountAction("auth/email-otp/verify-email", { email, otp: values.otp }); await account?.refresh(true);
      } else if (mode === "forgot") {
        await accountAction("auth/email-otp/request-password-reset", { email: values.email }); setEmail(String(values.email)); setMode("reset"); setMessage("If this email has a Homes account, a reset code is on its way.");
      } else if (mode === "reset") {
        await accountAction("auth/email-otp/reset-password", { email, otp: values.otp, password: values.password }); setMode("signin"); setMessage("Password updated. Sign in with your new password.");
      }
    });
  }
  if (account?.loading) return <div className="account-panel" role="status">Getting your Homes account ready…</div>;
  if (account?.user) {
    const user = account.user;
    return <section className="account-panel"><span className="eyebrow">Your Homes</span><h1>Welcome, {user.name.split(" ")[0]}</h1><p className="muted">Saved homes and viewing requests follow you across your devices.</p>{account.feedback && <p role="status">{account.feedback}</p>}{error && <p role="alert" className="account-error">{error}</p>}{message && <p role="status">{message}</p>}
      <div className="account-shortcuts"><Link className="button secondary" href="/favorites">Saved homes</Link><Link className="button secondary" href="/bookings">Your viewings</Link><button className="button secondary" disabled={busy} onClick={() => perform(async () => { setMessage(""); await account.refresh(); })}>Refresh sync</button></div>
      <form action={form => perform(async () => { await accountAction("auth/update-user", Object.fromEntries(form)); await account.refresh(); setMessage("Your contact details are updated."); })}>
        <h2>Your details</h2><div className="field"><label htmlFor="profile-name">Full name</label><input id="profile-name" name="name" defaultValue={user.name} autoComplete="name" minLength={2} maxLength={100} required /></div>
        <div className="field"><label htmlFor="profile-email">Verified email</label><input id="profile-email" value={user.email} readOnly type="email" /><span className="muted">Email ownership is verified before it is used for your account.</span></div>
        <div className="field"><label htmlFor="profile-phone">Phone</label><input id="profile-phone" name="phone" defaultValue={user.phone} type="tel" autoComplete="tel" maxLength={30} /></div><button className="button" disabled={busy}>Save details</button>
      </form>
      <form action={form => perform(async () => { await accountAction("preferences", { viewingUpdates: form.get("viewingUpdates") === "on", searchAlerts: false }); await account.refresh(); setMessage("Preferences saved. Property alerts are not available yet."); })}><h2>Preferences</h2><label className="filter-check"><input type="checkbox" name="viewingUpdates" defaultChecked={account.notifications.viewingUpdates} />Viewing updates</label><p className="muted">Your live viewing status is always available in Viewings. Property email alerts are coming later.</p><button className="button secondary" disabled={busy}>Save preferences</button></form>
      <details><summary>Change password</summary><form action={form => perform(async () => { await accountAction("auth/change-password", { ...Object.fromEntries(form), revokeOtherSessions: true }); setMessage("Password changed. Other devices are signed out."); })}><h2>Security</h2><div className="field"><label htmlFor="old-password">Current password</label><input id="old-password" name="currentPassword" type="password" autoComplete="current-password" required /></div><div className="field"><label htmlFor="new-password">New password</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></div><button className="button secondary" disabled={busy}>Change password</button></form></details>
      <div className="account-shortcuts"><button className="button secondary" disabled={busy} onClick={() => perform(async () => { await account.signOut(); setMode("welcome"); })}>Sign out</button><button className="button secondary" disabled={busy} onClick={() => perform(async () => { await account.signOut(true); setMode("welcome"); })}>Sign out all devices</button></div>
      <RecentHomes /><details><summary>Delete account</summary><p>Your account, Saved list and profile will be removed. Operational viewing records are retained without your account contact details.</p><form action={form => perform(async () => { await accountAction("auth/delete-user", { password: form.get("password") }); await account.refresh(); setMode("welcome"); setMessage("Your Homes account has been deleted."); })}><div className="field"><label htmlFor="delete-password">Confirm your password</label><input id="delete-password" name="password" type="password" autoComplete="current-password" required /></div><label className="filter-check"><input type="checkbox" required />I understand this cannot be undone</label><button className="button secondary" disabled={busy}>Delete my account</button></form></details>
    </section>;
  }
  return <section className="account-panel"><span className="eyebrow">Make yourself at home</span><h1>{({ welcome: "Welcome to Homes", register: "Your next place starts here", signin: "Welcome back", verify: "Check your inbox", forgot: "Reset your password", reset: "Choose a new password" })[mode]}</h1><p className="muted">Explore freely. An account keeps your Saved homes and viewings together across devices.</p>{error && <p role="alert" className="account-error">{error}</p>}{message && <p role="status">{message}</p>}{account?.feedback && <p role="status" className="muted">{account.feedback}</p>}
    {mode === "welcome" ? <div className="account-welcome"><Link className="button secondary" href="/discover">Continue as guest</Link><button className="button" onClick={() => setMode("register")}>Create account</button><button className="text-link" onClick={() => setMode("signin")}>Sign in</button></div> : <>
      <form action={submit}>
        {mode === "register" && <><div className="field"><label htmlFor="account-name">Full name</label><input id="account-name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div><div className="field"><label htmlFor="account-phone">Phone (optional)</label><input id="account-phone" name="phone" autoComplete="tel" type="tel" maxLength={30} /></div></>}
        {["register", "signin", "forgot"].includes(mode) && <div className="field"><label htmlFor="account-email">Email</label><input id="account-email" name="email" type="email" autoComplete="email" defaultValue={email} required maxLength={254} /></div>}
        {["register", "signin", "reset"].includes(mode) && <div className="field"><label htmlFor="account-password">{mode === "reset" ? "New password" : "Password"}</label><input id="account-password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={mode === "signin" ? 1 : 12} maxLength={128} required />{mode !== "signin" && <span className="muted">Use at least 12 characters. A memorable passphrase works well.</span>}</div>}
        {["verify", "reset"].includes(mode) && <><p className="muted">Enter the code sent to {email}. It expires in 10 minutes.</p><div className="field"><label htmlFor="account-code">Six-digit code</label><input id="account-code" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></div></>}
        <button className="button" disabled={busy}>{busy ? "Please wait…" : ({ register: "Create account", signin: "Sign in", verify: "Verify email", forgot: "Send reset code", reset: "Update password", welcome: "Continue" })[mode]}</button>
      </form>
      <div className="account-shortcuts">{mode === "signin" && <><button className="text-link" onClick={() => setMode("forgot")}>Forgot password?</button><button className="text-link" onClick={() => { setMode("verify"); setMessage("Enter your email below if you still need to verify it."); }}>Verify your email</button></>}{mode === "verify" && <><div className="field"><label htmlFor="verification-address">Email for verification</label><input id="verification-address" type="email" value={email} onChange={event => setEmail(event.target.value)} /></div><button className="button secondary" disabled={busy || !email.includes("@")} onClick={() => perform(async () => { await accountAction("auth/email-otp/send-verification-otp", { email, type: "email-verification" }); setMessage("If your account needs verification, a new code is on its way."); })}>Send another code</button></>}<button className="text-link" disabled={busy} onClick={() => { setMode(mode === "signin" ? "register" : "signin"); setError(""); }}>{mode === "signin" ? "Create account" : "Back to sign in"}</button><Link className="text-link" href="/discover">Continue as guest</Link></div>
    </>}
  </section>;
}
