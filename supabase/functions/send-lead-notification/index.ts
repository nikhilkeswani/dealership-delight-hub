import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface LeadNotification {
  dealer_email: string;
  dealer_name: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  lead_message?: string;
  vehicle_info?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dealer_email, dealer_name, lead_name, lead_email, lead_phone, lead_message, vehicle_info }: LeadNotification = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🚗 New Lead Alert</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Lead Information</h3>
          <p><strong>Name:</strong> ${lead_name}</p>
          <p><strong>Email:</strong> <a href="mailto:${lead_email}">${lead_email}</a></p>
          ${lead_phone ? `<p><strong>Phone:</strong> <a href="tel:${lead_phone}">${lead_phone}</a></p>` : ""}
          ${vehicle_info ? `<p><strong>Interested Vehicle:</strong> ${vehicle_info}</p>` : ""}
          ${lead_message ? `<p><strong>Message:</strong> ${lead_message}</p>` : ""}
        </div>

        <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Quick Actions:</strong></p>
          <p style="margin: 5px 0 0 0;">
            <a href="mailto:${lead_email}" style="color: #2563eb; text-decoration: none;">📧 Reply via Email</a> | 
            ${lead_phone ? `<a href="tel:${lead_phone}" style="color: #2563eb; text-decoration: none;">📞 Call Now</a>` : ""}
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This notification was sent from your dealer website. 
          <br>Respond quickly to increase your conversion rate!
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DealerDelight <noreply@dealerdelight.com>",
        to: [dealer_email],
        subject: `🚗 New Lead: ${lead_name} is interested in your vehicles`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending lead notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});