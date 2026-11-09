import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { contactRequestSchema } from "@/lib/contact-request.schema";
import { saveContactRequest } from "@/lib/contact-requests.functions";

export function ContactForm() {
  const saveRequest = useServerFn(saveContactRequest);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const parsed = contactRequestSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      website: formData.get("website"),
    });

    if (!parsed.success) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveRequest({ data: parsed.data });
      if (!result.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
      if (result.recorded) {
        trackEvent("contact_request_submitted", { form_id: "homepage_contact" });
        window.__lovableEvents?.track?.("project.contact_request_submitted");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="mx-auto w-full max-w-3xl border-t border-border px-6 py-10"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-xl">
        <p className="text-center text-[11px] font-semibold uppercase text-gold">Get in touch</p>
        <h2 id="contact-heading" className="mt-2 text-center font-display text-2xl">
          Write to Shubhang
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
          Share a question or a note about the stories. Messages are saved for Shubhang to review
          and reply to personally.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="sr-only" aria-hidden="true">
            <Label htmlFor="contact-website">Website</Label>
            <Input
              id="contact-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              maxLength={200}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your name</Label>
              <Input id="contact-name" name="name" autoComplete="name" maxLength={100} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email address</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={255}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              maxLength={2000}
              required
              placeholder="Write your message here…"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Send message"}
            </Button>
            <p className="min-h-5 text-sm text-muted-foreground" role="status" aria-live="polite">
              {status === "success" && "Thanks — your message has been saved."}
              {status === "error" && "Your message could not be saved. Please try again."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}