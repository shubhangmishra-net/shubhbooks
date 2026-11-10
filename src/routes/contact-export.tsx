import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const title = "Private Contact Export | Shubhang Mishra";
const description = "A private download page for Shubhang Mishra’s reader contact requests.";

export const Route = createFileRoute("/contact-export")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactExportPage,
});

function ContactExportPage() {
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("downloading");

    try {
      const response = await fetch("/api/public/contact-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      const downloadUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "contact-requests.csv";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setAccessCode("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md border-t border-border px-1 py-8" aria-labelledby="export-title">
        <p className="text-xs font-semibold uppercase text-gold">Shubhang Mishra</p>
        <h1 id="export-title" className="mt-3 font-display text-3xl">Private contact export</h1>
        <p className="mt-2 text-sm text-muted-foreground">Saved reader messages</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="contact-export-code">Private access code</Label>
            <Input
              id="contact-export-code"
              type="password"
              autoComplete="off"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={status === "downloading"}>
            {status === "downloading" ? "Preparing CSV…" : "Download contact CSV"}
          </Button>
          <p className="min-h-5 text-sm text-muted-foreground" role="status" aria-live="polite">
            {status === "success" && "Your CSV download has started."}
            {status === "error" && "The code was not accepted or the download failed. Please try again."}
          </p>
        </form>
      </section>
    </main>
  );
}