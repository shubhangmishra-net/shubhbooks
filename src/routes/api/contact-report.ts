import { createFileRoute } from "@tanstack/react-router";

import { contactReportKeyMatches, contactRowsToCsv } from "@/lib/contact-report";

export const Route = createFileRoute("/api/contact-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response("Not found", { status: 404 });
        }

        const accessCode =
          typeof payload === "object" && payload !== null && "accessCode" in payload
            ? payload.accessCode
            : undefined;
        if (typeof accessCode !== "string" || accessCode.length > 512) {
          return new Response("Not found", { status: 404 });
        }

        const expectedCode = process.env["CONTACT_REPORT_KEY"];
        if (!(await contactReportKeyMatches(accessCode, expectedCode))) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("contact_requests")
          .select("created_at,name,email,message")
          .order("created_at", { ascending: false })
          .limit(5000);

        if (error) {
          console.error("Private contact report could not be generated");
          return new Response("The private download is temporarily unavailable.", {
            status: 500,
            headers: { "Cache-Control": "no-store, private" },
          });
        }

        return new Response(contactRowsToCsv(data ?? []), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="contact-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
            "Cache-Control": "no-store, private",
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});