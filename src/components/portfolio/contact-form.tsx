"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/constants";
import { isEmail } from "@/lib/utils";

const EMPTY_FORM = { sender_name: "", sender_email: "", subject: "", message: "" };
const MIN_MESSAGE_LENGTH = 10;

type Errors = Partial<Record<keyof typeof EMPTY_FORM, string>>;

export function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof EMPTY_FORM) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  function validate(): boolean {
    const next: Errors = {};

    if (form.sender_name.trim().length < 2) {
      next.sender_name = "Please enter at least 2 characters.";
    }
    if (!isEmail(form.sender_email)) {
      next.sender_email = "Enter a valid email address.";
    }
    if (form.subject.trim().length > 200) {
      next.subject = "Subject must be 200 characters or fewer.";
    }
    if (form.message.trim().length < MIN_MESSAGE_LENGTH) {
      next.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: form.sender_name.trim(),
          sender_email: form.sender_email.trim(),
          subject: form.subject.trim() || null,
          message: form.message.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        errors?: Errors;
      };

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors);
        toast.error(payload.error ?? "Message could not be sent. Please try again.");
        return;
      }

      toast.success("Message sent", {
        description: "Thanks — I usually reply within a couple of days.",
      });
      setForm(EMPTY_FORM);
      setErrors({});
    } catch {
      toast.error("Network error. Please check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{"// contact"}</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Let&apos;s build something
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-fg-muted">
                Available for freelance projects, contract work and full-time roles. Tell me what
                you are building and I will get back to you.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-edge bg-surface/60 p-5 font-mono text-xs">
              <Row label="email" value={SITE.email} />
              <Row label="domain" value={SITE.domain} />
              <Row label="location" value={SITE.location} />
              <Row label="status" value={SITE.availability} accent />
            </div>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              Messages are stored in the Supabase <code className="text-accent-soft">messages</code>{" "}
              table and appear in the admin inbox.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 rounded-xl border border-edge bg-surface p-5 sm:p-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="sender_name" error={errors.sender_name}>
                <Input
                  id="sender_name"
                  name="sender_name"
                  value={form.sender_name}
                  onChange={update("sender_name")}
                  placeholder="Your name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.sender_name)}
                  required
                />
              </Field>

              <Field label="Email" htmlFor="sender_email" error={errors.sender_email}>
                <Input
                  id="sender_email"
                  name="sender_email"
                  type="email"
                  value={form.sender_email}
                  onChange={update("sender_email")}
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.sender_email)}
                  required
                />
              </Field>
            </div>

            <Field label="Subject" htmlFor="subject" error={errors.subject} optional>
              <Input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={update("subject")}
                placeholder="Project inquiry"
                aria-invalid={Boolean(errors.subject)}
              />
            </Field>

            <Field
              label="Message"
              htmlFor="message"
              error={errors.message}
              hint={`${form.message.trim().length}/${MIN_MESSAGE_LENGTH} min`}
            >
              <Textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={update("message")}
                placeholder="Tell me about the project, timeline and budget…"
                aria-invalid={Boolean(errors.message)}
                className="min-h-32"
                required
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="font-mono text-[0.7rem] text-fg-subtle">
                Validated client-side, stored server-side.
              </p>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>

            {Object.keys(errors).length > 0 && (
              <p className="flex items-center gap-2 text-xs text-danger">
                <AlertCircle className="size-3.5" />
                Some fields need attention.
              </p>
            )}

            {submitting && (
              <p className="flex items-center gap-2 text-xs text-fg-subtle">
                <CheckCircle2 className="size-3.5" />
                Posting to /api/messages…
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {optional && <span className="ml-1.5 text-fg-subtle/70 normal-case">(optional)</span>}
        </Label>
        {hint && <span className="font-mono text-[0.65rem] text-fg-subtle">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-edge pb-2.5 last:border-0 last:pb-0">
      <span className="text-fg-subtle">{label}</span>
      <span className={accent ? "text-emerald-400" : "text-fg-muted"}>{value}</span>
    </div>
  );
}
