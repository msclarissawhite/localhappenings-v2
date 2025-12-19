import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";

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

      await notifyOwner({
        title: `Contact Form: ${subject}`,
        content: emailContent,
      });

      return { success: true };
    }),
});
