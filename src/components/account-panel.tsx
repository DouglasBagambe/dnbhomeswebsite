"use client";
import { BrandLoading } from "./brand-loading";
import Link from "next/link";
import { config } from "@/lib/config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RecentHomes } from "./recent-homes";
import { SocialAuth } from "./social-auth";
import { accountAction, accountRead, useConsumer } from "./consumer-provider";

type Mode = "welcome" | "register" | "signin" | "verify" | "forgot" | "reset";
type LinkedAccount = { id: string; providerId: string };

export function AccountPanel() {
  const account = useConsumer();
  const accountUser = account?.user ?? null;
  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [linked, setLinked] = useState<LinkedAccount[]>([]);

  const loadLinked = useCallback(async () => {
    if (!accountUser) return [];
    try {
      const result = await accountRead("auth/list-accounts");
      const items = (result.data?.accounts ?? []).filter((item: LinkedAccount) => item.id && item.providerId);
      setLinked(items);
      return items;
    } catch {
      setLinked([]);
      return [];
    }
  }, [accountUser]);

  useEffect(() => {
    let cancelled = false;
    if (!accountUser) return;
    void accountRead("auth/list-accounts").then(result => {
      if (!cancelled) setLinked((result.data?.accounts ?? []).filter((item: LinkedAccount) => item.id && item.providerId));
    }).catch(() => {
      if (!cancelled) setLinked([]);
    });
    return () => { cancelled = true; };
  }, [accountUser]);

  const hasCredential = useMemo(() => linked.some(item => item.providerId === "credential"), [linked]);
  const socialReady = Boolean(account?.capabilities?.providers.google && config.googleClientId || account?.capabilities?.providers.apple && config.appleClientId);
  const linkedProviders = useMemo(() => new Set(linked.map(item => item.providerId)), [linked]);

  function changeMode(next: Mode) { setMode(next); setError(""); setMessage(""); }

  async function perform(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Please retry."); }
    finally { setBusy(false); }
  }

  async function submit(form: FormData) {
    await perform(async () => {
      const values = Object.fromEntries(form);
      if (mode === "register") {
        await accountAction("auth/sign-up/email", values);
        setEmail(String(values.email));
        setMode("verify");
        setMessage("We sent a six-digit verification code. It expires in 10 minutes.");
      } else if (mode === "signin") {
        setEmail(String(values.email));
        await accountAction("auth/sign-in/email", values);
        await account?.refresh(true);
      } else if (mode === "verify") {
        await accountAction("auth/email-otp/verify-email", { email, otp: values.otp });
        await account?.refresh(true); setMessage("");
      } else if (mode === "forgot") {
        await accountAction("auth/email-otp/request-password-reset", { email: values.email });
        setEmail(String(values.email)); setMode("reset");
        setMessage("If this email has a Homes account, a reset code is on its way.");
      } else if (mode === "reset") {
        await accountAction("auth/email-otp/reset-password", { email, otp: values.otp, password: values.password });
        setMode("signin"); setMessage("Password updated. Sign in with your new password.");
      }
    });
  }

  if (!account || account.loading) {
    return <section className="account-panel account-state" aria-live="polite">
      <BrandLoading label="Restoring your account and saved homes" />
    </section>;
  }

  if (account.capabilities && !account.capabilities.accounts) {
    return <section className="account-panel account-state">
      <span className="eyebrow">Your Homes</span>
      <h1>Accounts are coming soon.</h1>
      <p className="account-lead">You can still explore, save and compare homes on this device, and request viewings as a guest.</p>
      <div className="account-benefits">
        <div><strong>Browse freely</strong><span>No account required.</span></div>
        <div><strong>Keep choosing</strong><span>Your guest selections stay on this device.</span></div>
      </div>
      <Link className="button" href="/discover">Continue as guest</Link>
    </section>;
  }

  if (accountUser) {
    const user = accountUser;
    return <section className="account-panel account-signed-in">
      <div className="account-hero">
        <div><span className="eyebrow">Your Homes</span><h1>Welcome, {user.name.split(" ")[0]}.</h1>
          <p className="account-lead">Your saved homes, comparisons, recent activity and viewing requests stay with you across supported Homes devices.</p>
        </div>
        <span className="account-sync-badge">Synced</span>
      </div>

      {account.feedback && <p role="status" className="account-note">{account.feedback}</p>}
      {error && <p role="alert" className="account-error">{error}</p>}
      {message && <p role="status" className="account-success">{message}</p>}

      <div className="account-dashboard">
        <Link href="/favorites"><strong>Saved</strong><span>Your favourites across devices</span></Link>
        <Link href="/discover"><strong>Compare</strong><span>Return to Discover to review your shortlist</span></Link>
        <Link href="/bookings"><strong>Viewings</strong><span>Requests and live statuses</span></Link>
      </div>

      <div className="account-settings">
      <div className="account-card">
        <div className="account-card-heading"><div><span className="eyebrow">Profile</span><h2>Your details</h2></div></div>
        <form action={form => perform(async () => {
          await accountAction("auth/update-user", Object.fromEntries(form));
          await account.refresh(true); setMessage("Your contact details are updated.");
        })}>
          <div className="field"><label htmlFor="profile-name">Full name</label><input id="profile-name" name="name" defaultValue={user.name} autoComplete="name" minLength={2} maxLength={100} required /></div>
          <div className="field"><label htmlFor="profile-email">Verified email</label><input id="profile-email" value={user.email} readOnly type="email" /><span className="muted">Used for account security and viewing communication.</span></div>
          <div className="field"><label htmlFor="profile-phone">Phone (optional)</label><input id="profile-phone" name="phone" defaultValue={user.phone} type="tel" autoComplete="tel" maxLength={30} placeholder="+256…" /><span className="muted">We can reuse this when you request a viewing.</span></div>
          <button className="button" disabled={busy}>Save details</button>
        </form>
      </div>

      <div className="account-card">
        <span className="eyebrow">Security</span><h2>Sign-in methods</h2>
        <div className="linked-methods">
          {linked.map(item => <div className="linked-method" key={item.id}>
            <div><strong>{item.providerId === "credential" ? "Email & password" : item.providerId === "google" ? "Google" : item.providerId === "apple" ? "Apple" : item.providerId}</strong><span>Connected</span></div>
            {item.providerId !== "credential" && linked.length > 1 && <button className="text-link" disabled={busy} onClick={() => perform(async () => {
              await accountAction("auth/unlink-account", { accountId: item.id });
              await loadLinked(); setMessage("Sign-in method disconnected.");
            })}>Disconnect</button>}
          </div>)}
        </div>
        {(account.capabilities?.providers.google && !linkedProviders.has("google") || account.capabilities?.providers.apple && !linkedProviders.has("apple")) &&
          <><p className="muted">Connect another trusted sign-in method so you have a second way back into Homes.</p>
          <SocialAuth capabilities={{
            ...account.capabilities!,
            providers: {
              google: Boolean(account.capabilities?.providers.google && !linkedProviders.has("google")),
              apple: Boolean(account.capabilities?.providers.apple && !linkedProviders.has("apple")),
            }
          }} mode="link" disabled={busy} onSuccess={async () => { await loadLinked(); await account.refresh(true); setMessage("Sign-in method connected."); }} onError={setError} /></>}

        {hasCredential && <details><summary>Change password</summary>
          <form action={form => perform(async () => {
            await accountAction("auth/change-password", { ...Object.fromEntries(form), revokeOtherSessions: true });
            setMessage("Password changed. Other devices are signed out.");
          })}>
            <div className="field"><label htmlFor="old-password">Current password</label><input id="old-password" name="currentPassword" type="password" autoComplete="current-password" required /></div>
            <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></div>
            <button className="button secondary" disabled={busy}>Change password</button>
          </form>
        </details>}

        <div className="account-actions">
          <button className="button secondary" disabled={busy} onClick={() => perform(async () => { await account.signOut(); setMode("welcome"); })}>Sign out</button>
          <button className="text-link" disabled={busy} onClick={() => perform(async () => { await account.signOut(true); setMode("welcome"); })}>Sign out all devices</button>
        </div>
      </div>

      <div className="account-card">
        <span className="eyebrow">Preferences</span><h2>Viewing updates</h2>
        <form action={form => perform(async () => {
          await accountAction("preferences", { viewingUpdates: form.get("viewingUpdates") === "on", searchAlerts: false });
          await account.refresh(true); setMessage("Preferences saved.");
        })}>
          <label className="filter-check"><input type="checkbox" name="viewingUpdates" defaultChecked={account.notifications.viewingUpdates} />Keep viewing-status updates enabled</label>
          <p className="muted">Your live status remains available in Viewings whenever you sign in.</p>
          <button className="button secondary" disabled={busy}>Save preference</button>
        </form>
      </div>

      </div>
      <RecentHomes />

      <div className="account-card account-danger">
        <details><summary>Delete account</summary>
          <p>Deleting your account removes your profile, sessions, Saved homes, Compare list and recent activity. Operational viewing records may remain only in anonymized form.</p>
          <form action={form => perform(async () => {
            const body = hasCredential ? { password: form.get("password") } : {};
            await accountAction("auth/delete-user", body);
            await account.refresh(true); setMode("welcome"); setMessage("Your Homes account has been deleted.");
          })}>
            {hasCredential && <div className="field"><label htmlFor="delete-password">Confirm your password</label><input id="delete-password" name="password" type="password" autoComplete="current-password" required /></div>}
            {!hasCredential && <p className="muted">For social-only accounts, deletion requires a recently authenticated session. If your session is no longer fresh, sign out and sign back in first.</p>}
            <label className="filter-check"><input type="checkbox" required />I understand this cannot be undone</label>
            <button className="button secondary" disabled={busy}>Delete my account</button>
          </form>
        </details>
      </div>
    </section>;
  }

  return <section className="account-panel account-entry">
    <div className="account-intro">
    <span className="eyebrow">Your Homes</span>
    <h1>{({ welcome: "Let's find you a home.", register: "Create your Homes account.", signin: "Welcome back.", verify: "Check your inbox.", forgot: "Reset your password.", reset: "Choose a new password." })[mode]}</h1>
    <p className="account-lead">{mode === "welcome" ? "A little less searching. A clearer way home." : mode === "register" ? "Just the essentials to make Homes yours. Add a phone number when you need a viewing." : mode === "signin" ? "Your saved places and next steps, right where you left them." : "A secure next step for your Homes account."}</p>
    <ul className="account-benefit-list" aria-label="Account benefits">
      <li><span><strong>Save once</strong> · Homes across your devices</span></li><li><span><strong>Compare anywhere</strong> · Keep your shortlist together</span></li><li><span><strong>Manage viewings</strong> · Continue where you left off</span></li>
    </ul>
    </div>
    <div className="account-entry-actions">

    {error && <p role="alert" className="account-error">{error}</p>}
    {message && <p role="status" className="account-success">{message}</p>}
    {account.feedback && <p role="status" className="account-note">{account.feedback}</p>}

    {mode === "welcome" ? <>
      <SocialAuth capabilities={account.capabilities} disabled={busy} onSuccess={async () => { await account.refresh(true); }} onError={setError} />
      {socialReady && <div className="account-divider"><span>or use email</span></div>}
      <div className="account-welcome">
        <button className="button" onClick={() => changeMode("register")}>Create account</button>
        <button className="button secondary" onClick={() => changeMode("signin")}>Sign in with email</button>
        <Link className="text-link account-guest" href="/discover">Continue as guest</Link>
      </div>
    </> : <>
      <form onSubmit={event => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }}>
        {mode === "register" && <div className="field"><label htmlFor="account-name">Full name</label><input id="account-name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div>}
        {["register", "signin", "forgot"].includes(mode) && <div className="field"><label htmlFor="account-email">Email</label><input id="account-email" name="email" type="email" autoComplete="email" defaultValue={email} required maxLength={254} /></div>}
        {["register", "signin", "reset"].includes(mode) && <div className="field"><label htmlFor="account-password">{mode === "reset" ? "New password" : "Password"}</label><input id="account-password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={mode === "signin" ? 1 : 12} maxLength={128} required />{mode !== "signin" && <span className="muted">Use at least 12 characters. A memorable passphrase works well.</span>}</div>}
        {mode === "verify" && <div className="field"><label htmlFor="verification-email">Email</label><input id="verification-email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} /></div>}
        {["verify", "reset"].includes(mode) && <><p className="muted">Enter the six-digit code sent to {email}. It expires in 10 minutes.</p><div className="field"><label htmlFor="account-code">Six-digit code</label><input id="account-code" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></div></>}
        <button className="button" disabled={busy}>{busy ? <BrandLoading inline label="Processing your account request" /> : ({ register: "Create account", signin: "Sign in", verify: "Verify email", forgot: "Send reset code", reset: "Update password", welcome: "Continue" })[mode]}</button>
      </form>
      <div className="account-shortcuts">
        {mode === "signin" && <><button className="text-link" onClick={() => changeMode("forgot")}>Forgot password?</button><button className="text-link" onClick={() => { changeMode("verify"); }}>Verify your email</button></>}
        {mode === "verify" && <button className="text-link" disabled={busy || !email.includes("@")} onClick={() => perform(async () => { await accountAction("auth/email-otp/send-verification-otp", { email, type: "email-verification" }); setMessage("If your account needs verification, a fresh code is on its way."); })}>Send another code</button>}
        <button className="text-link" disabled={busy} onClick={() => { changeMode(mode === "signin" ? "register" : "signin"); }}>{mode === "signin" ? "Create account" : "Back to sign in"}</button>
        <Link className="text-link" href="/discover">Continue as guest</Link>
      </div>
    </>}
    </div>
  </section>;
}
