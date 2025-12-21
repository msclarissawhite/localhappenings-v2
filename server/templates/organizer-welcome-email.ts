/**
 * Welcome email template for new organizers
 * Sent after first successful magic link login
 */

export interface OrganizerWelcomeEmailData {
  organizerEmail: string;
  dashboardUrl: string;
  quickstartGuideUrl: string;
  submitEventUrl: string;
  contactUrl: string;
}

export function getOrganizerWelcomeEmail(data: OrganizerWelcomeEmailData) {
  const { organizerEmail, dashboardUrl, quickstartGuideUrl, submitEventUrl, contactUrl } = data;

  const subject = "Welcome to Local Happenings! 🎉";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Local Happenings</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Local Happenings!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for joining our community of event organizers</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
    
    <p style="font-size: 16px;">
      Welcome to <strong>Local Happenings</strong>! We're excited to have you as an event organizer. Your account (<strong>${organizerEmail}</strong>) is now active and ready to use.
    </p>

    <p style="font-size: 16px;">
      Local Happenings helps families discover accessible, family-friendly events across Nova Scotia. As an organizer, you play a vital role in connecting families with meaningful experiences in their communities.
    </p>

    <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #667eea;">🚀 Quick Start Guide</h3>
      <p style="margin: 0; font-size: 15px;">
        New to the platform? Check out our comprehensive <a href="${quickstartGuideUrl}" style="color: #667eea; text-decoration: none; font-weight: 600;">Organizer Quickstart Guide</a> to learn how to:
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 15px;">
        <li>Submit your first event</li>
        <li>Save frequently used venues</li>
        <li>Use time-saving features like "Copy from Previous Event"</li>
        <li>Provide comprehensive accessibility information</li>
      </ul>
    </div>

    <h3 style="font-size: 20px; margin: 30px 0 15px 0; color: #111827;">What You Can Do Now</h3>

    <div style="margin: 20px 0;">
      <a href="${submitEventUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Submit Your First Event</a>
    </div>

    <div style="margin: 20px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Visit Your Dashboard</a>
    </div>

    <h3 style="font-size: 20px; margin: 30px 0 15px 0; color: #111827;">Tips for Great Event Listings</h3>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 600; color: #92400e;">💡 Pro Tip: Accessibility Matters</p>
      <p style="margin: 0; font-size: 15px; color: #78350f;">
        The more detailed your accessibility information, the more families can confidently plan to attend. Take a few extra minutes to confirm details like wheelchair access, change tables, and parking—it makes a huge difference!
      </p>
    </div>

    <ul style="font-size: 15px; line-height: 1.8; color: #4b5563;">
      <li><strong>Be specific:</strong> Instead of "Unknown" for wheelchair access, confirm the details and select "Yes" or "No"</li>
      <li><strong>Use clear titles:</strong> Include age groups and location (e.g., "Toddler Storytime at Halifax Library")</li>
      <li><strong>Write engaging descriptions:</strong> Tell families what makes your event special and what to expect</li>
      <li><strong>Save your venues:</strong> Use the Saved Locations feature to reuse venue details across multiple events</li>
    </ul>

    <h3 style="font-size: 20px; margin: 30px 0 15px 0; color: #111827;">Becoming a Verified Organizer</h3>

    <p style="font-size: 15px; color: #4b5563;">
      After you've submitted a few high-quality events, you may be eligible for <strong>verification</strong>. Verified organizers get a green badge next to their name and their events <strong>publish instantly</strong> without admin review. Keep submitting great events and you'll be on your way!
    </p>

    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #065f46;">
        <strong>✅ What happens after you submit an event?</strong><br>
        Your event will be reviewed by our admin team (usually within 24-48 hours). You'll receive an email when it's published or if we need clarification on any details.
      </p>
    </div>

    <h3 style="font-size: 20px; margin: 30px 0 15px 0; color: #111827;">Need Help?</h3>

    <p style="font-size: 15px; color: #4b5563;">
      We're here to support you! If you have questions or run into any issues:
    </p>

    <ul style="font-size: 15px; line-height: 1.8; color: #4b5563;">
      <li>📖 Read the <a href="${quickstartGuideUrl}" style="color: #667eea; text-decoration: none;">Organizer Quickstart Guide</a></li>
      <li>💬 <a href="${contactUrl}" style="color: #667eea; text-decoration: none;">Contact us</a> with questions or feedback</li>
      <li>💡 Submit feature requests and vote on ideas at the Feature Requests page</li>
    </ul>

    <div style="margin: 40px 0 20px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 15px; color: #6b7280; margin: 0;">
        Thank you for being part of Local Happenings and helping families discover accessible, inclusive events in Nova Scotia!
      </p>
      <p style="font-size: 15px; color: #6b7280; margin: 15px 0 0 0;">
        Best regards,<br>
        <strong>The Local Happenings Team</strong>
      </p>
    </div>

  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af;">
    <p style="margin: 5px 0;">
      You're receiving this email because you created an organizer account at Local Happenings.
    </p>
    <p style="margin: 5px 0;">
      <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none;">Visit Your Dashboard</a> | 
      <a href="${contactUrl}" style="color: #667eea; text-decoration: none;">Contact Us</a>
    </p>
  </div>

</body>
</html>
  `;

  const text = `
Welcome to Local Happenings!

Hi there,

Welcome to Local Happenings! We're excited to have you as an event organizer. Your account (${organizerEmail}) is now active and ready to use.

Local Happenings helps families discover accessible, family-friendly events across Nova Scotia. As an organizer, you play a vital role in connecting families with meaningful experiences in their communities.

QUICK START GUIDE
New to the platform? Check out our comprehensive Organizer Quickstart Guide to learn how to:
- Submit your first event
- Save frequently used venues
- Use time-saving features like "Copy from Previous Event"
- Provide comprehensive accessibility information

Quickstart Guide: ${quickstartGuideUrl}

WHAT YOU CAN DO NOW
- Submit Your First Event: ${submitEventUrl}
- Visit Your Dashboard: ${dashboardUrl}

TIPS FOR GREAT EVENT LISTINGS
- Be specific: Instead of "Unknown" for wheelchair access, confirm the details and select "Yes" or "No"
- Use clear titles: Include age groups and location (e.g., "Toddler Storytime at Halifax Library")
- Write engaging descriptions: Tell families what makes your event special and what to expect
- Save your venues: Use the Saved Locations feature to reuse venue details across multiple events

Pro Tip: The more detailed your accessibility information, the more families can confidently plan to attend. Take a few extra minutes to confirm details like wheelchair access, change tables, and parking—it makes a huge difference!

BECOMING A VERIFIED ORGANIZER
After you've submitted a few high-quality events, you may be eligible for verification. Verified organizers get a green badge next to their name and their events publish instantly without admin review. Keep submitting great events and you'll be on your way!

What happens after you submit an event?
Your event will be reviewed by our admin team (usually within 24-48 hours). You'll receive an email when it's published or if we need clarification on any details.

NEED HELP?
We're here to support you! If you have questions or run into any issues:
- Read the Organizer Quickstart Guide: ${quickstartGuideUrl}
- Contact us: ${contactUrl}
- Submit feature requests and vote on ideas at the Feature Requests page

Thank you for being part of Local Happenings and helping families discover accessible, inclusive events in Nova Scotia!

Best regards,
The Local Happenings Team

---
You're receiving this email because you created an organizer account at Local Happenings.
Visit Your Dashboard: ${dashboardUrl}
Contact Us: ${contactUrl}
  `;

  return { subject, html, text };
}
