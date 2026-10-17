"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, KeyRound, Loader2, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isEmail } from "@/lib/utils";

interface LoginFormProps {
  mode: "supabase" | "local";
  hintEmail: string;
}

export function LoginForm({ mode, hintEmail }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(mode === "local" ? hintEmail : "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/admin";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        errors?: typeof errors;
      };

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors);
        toast.error(payload.error ?? "Sign-in failed.");
        return;
      }

      toast.success("Signed in", { description: "Redirecting to the dashboard…" });
      router.replace(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
      router.refresh();
    } catch {
      toast.error("Network error. Please retry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="admin@example.com"
            aria-invalid={Boolean(errors.email)}
            className="pl-9"
            required
          />
        </div>
        {errors.email && <p className="text-xs text-danger">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className="pl-9"
            required
          />
        </div>
        {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Authenticating…
          </>
        ) : (
          <>
            <LogIn className="size-4" />
            Sign in
          </>
        )}
      </Button>

      {mode === "local" && (
        <div className="flex items-start gap-2 rounded-lg border border-edge bg-elevated/60 p-3 text-xs leading-relaxed text-fg-subtle">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-accent" />
          <span>
            Supabase env values are still placeholders, so the app is running against the local
            fallback store. Local credentials: <span className="text-accent-soft">{hintEmail}</span> /
            the value of <code className="text-accent-soft">LOCAL_ADMIN_PASSWORD</code> in{" "}
            <code className="text-accent-soft">.env.local</code>.
          </span>
        </div>
      )}
    </form>
  );
}
