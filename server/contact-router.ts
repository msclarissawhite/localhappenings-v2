import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { sendEmail } from "./_core/resend-email";
import { ENV } from "./_core/env";

export const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, subject, message } = input;

      // Send notification to owner
      const emailContent = `
**New Contact Form Submission**

**From:** ${name} (${email})
**Subject:** ${subject}

**Message:**
${message}

---
Reply directly to: ${email}
      `.trim();

      // Send notification to owner via Manus platform
      await notifyOwner({
        title: `Contact Form: ${subject}`,
        content: emailContent,
      });

      // Forward to personal email
      try {
        await sendEmail({
          to: "clarissa@clarissawhite.com",
          subject: `[Local Happenings] Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><em>Reply directly to: ${email}</em></p>
          `,
        });
      } catch (error) {
        console.error("Failed to send contact form email:", error);
      }

      // Sync to ClickUp
      try {
        const clickupResponse = await fetch(
          `https://api.clickup.com/api/v2/list/${ENV.CLICKUP_LIST_ID}/task`,
          {
            method: "POST",
            headers: {
              "Authorization": ENV.CLICKUP_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `Contact Form: ${subject}`,
              description: `**From:** ${name}\n**Email:** ${email}\n**Subject:** ${subject}\n\n**Message:**\n${message}\n\n---\n*Submitted: ${new Date().toISOString()}*`,
              markdown_description: `**From:** ${name}\n**Email:** ${email}\n**Subject:** ${subject}\n\n**Message:**\n${message}\n\n---\n*Submitted: ${new Date().toISOString()}*`,
            }),
          }
        );

        if (!clickupResponse.ok) {
          const errorText = await clickupResponse.text();
          console.error("Failed to sync to ClickUp:", errorText);
        } else {
          console.log("Contact form synced to ClickUp successfully");
        }
      } catch (error) {
        console.error("Failed to sync contact form to ClickUp:", error);
      }

      return { success: true };
    }),
});
