import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { uploadRouter } from "./upload-router";
import { imageLibraryRouter } from "./image-library-router";
import { eventTemplatesRouter } from "./event-templates-router";
import { eventsRouter } from "./events-router";
import { contactRouter } from "./contact-router";
import { organizerRouter } from "./organizer-router";
import { savedLocationsRouter } from "./saved-locations-router";
import { savedEventsRouter } from "./saved-events-router";
import { featureRequestsRouter } from "./feature-requests-router";
import { userAuthRouter } from "./user-auth-router";
import { donationsRouter } from "./donations-router";
import { feedbackRouter } from "./feedback-router";
import { organizerAnalyticsRouter } from "./organizer-analytics-router";
import { claimRouter } from "./claim-router";
import { collectionsRouter } from "./collections-router";
import { bannerRouter } from "./banner-router";
import { homepageFeaturedRouter } from "./homepage-featured-router";
import { contactTemplatesRouter } from "./contact-templates-router";
import { seriesRouter } from "./series-router";
import { eventTypeMigrationRouter } from "./event-type-migration-router";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  upload: uploadRouter,
  imageLibrary: imageLibraryRouter,
  eventTemplates: eventTemplatesRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  events: eventsRouter,
  contact: contactRouter,
  organizer: organizerRouter,
  userAuth: userAuthRouter,
  savedLocations: savedLocationsRouter,
  savedEvents: savedEventsRouter,
  series: seriesRouter,
  featureRequests: featureRequestsRouter,
  donations: donationsRouter,
  feedback: feedbackRouter,
  organizerAnalytics: organizerAnalyticsRouter,
  claim: claimRouter,
  collections: collectionsRouter,
  banner: bannerRouter,
  homepageFeatured: homepageFeaturedRouter,
  contactTemplates: contactTemplatesRouter,
  eventTypeMigration: eventTypeMigrationRouter,
});

export type AppRouter = typeof appRouter;
