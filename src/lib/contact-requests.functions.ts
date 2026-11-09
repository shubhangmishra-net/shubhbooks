import { createServerFn } from "@tanstack/react-start";

import { contactRequestSchema } from "@/lib/contact-request.schema";

export const saveContactRequest = createServerFn({ method: "POST" })
  .inputValidator((data) => contactRequestSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true, recorded: false };

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("contact_requests").insert({
        name: data.name,
        email: data.email,
        message: data.message,
      });

      if (error) {
        console.error("Contact request storage failed");
        return { ok: false, recorded: false };
      }

      return { ok: true, recorded: true };
    } catch {
      console.error("Contact request storage failed");
      return { ok: false, recorded: false };
    }
  });