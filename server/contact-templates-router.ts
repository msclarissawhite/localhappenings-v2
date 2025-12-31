import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";

export const contactTemplatesRouter = router({
  // Get all contact templates for the logged-in organizer
  list: protectedProcedure.query(async ({ ctx }) => {
    const { getContactTemplatesByOrganizerId } = await import("./contact-templates-db");
    return await getContactTemplatesByOrganizerId(ctx.user.id);
  }),

  // Create a new contact template
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Template name is required"),
        contactName: z.string().min(1, "Contact name is required"),
        contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
        contactPhone: z.string().optional(),
        contactWebsite: z.string().optional(),
        displayPublicly: z.boolean().default(true),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { createContactTemplate } = await import("./contact-templates-db");
      
      const template = await createContactTemplate({
        organizerId: ctx.user.id,
        name: input.name,
        contactName: input.contactName,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        contactWebsite: input.contactWebsite || null,
        displayPublicly: input.displayPublicly ? 1 : 0,
        isDefault: input.isDefault ? 1 : 0,
      });

      return template;
    }),

  // Update an existing contact template
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Template name is required"),
        contactName: z.string().min(1, "Contact name is required"),
        contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
        contactPhone: z.string().optional(),
        contactWebsite: z.string().optional(),
        displayPublicly: z.boolean().default(true),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { updateContactTemplate } = await import("./contact-templates-db");
      
      const updated = await updateContactTemplate(input.id, ctx.user.id, {
        name: input.name,
        contactName: input.contactName,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        contactWebsite: input.contactWebsite || null,
        displayPublicly: input.displayPublicly ? 1 : 0,
        isDefault: input.isDefault ? 1 : 0,
      });

      return updated;
    }),

  // Delete a contact template
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { deleteContactTemplate } = await import("./contact-templates-db");
      await deleteContactTemplate(input.id, ctx.user.id);
      return { success: true };
    }),

  // Set a template as default
  setDefault: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { setDefaultContactTemplate } = await import("./contact-templates-db");
      await setDefaultContactTemplate(input.id, ctx.user.id);
      return { success: true };
    }),
});
