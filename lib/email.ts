import nodemailer from "nodemailer"

// ─── Transport ───────────────────────────────────────────────────────────────

// Singleton transport — reuses the SMTP connection across emails instead of
// opening a new connection on every send (which caused multi-second delays).
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
})

// SMTP_FROM already contains the full address e.g. "K2 Climbers <user@gmail.com>"
// so use it directly — do NOT wrap it again in another "Name <...>" template.
const FROM = process.env.SMTP_FROM ?? '"K2 Climbers" <noreply@k2climbers.com>'
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://www.k2climbers.com"

// ─── Shared layout ───────────────────────────────────────────────────────────

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>K2 Climbers</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:28px 32px;border-bottom:2px solid #f97316;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;">K2 CLIMBERS</span><br/>
                    <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Climb Beyond Limits</span>
                  </td>
                  <td align="right">
                    <div style="width:12px;height:12px;background:#f97316;display:inline-block;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#161616;padding:36px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#111111;padding:20px 32px;border-top:1px solid #262626;">
              <p style="margin:0;font-size:11px;color:#666666;text-align:center;">
                K2 Climbers &bull; Office No 226, 2nd Floor, Dubai Plaza, 6th Road, Rawalpindi 46000<br/>
                <a href="tel:+923355428818" style="color:#f97316;text-decoration:none;">+92 335 5428818</a> &bull;
                <a href="mailto:info@k2climbers.com" style="color:#f97316;text-decoration:none;">info@k2climbers.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:14px;padding:12px 28px;text-decoration:none;letter-spacing:0.02em;">${text}</a>`
}

function divider() {
  return `<div style="height:1px;background:#262626;margin:24px 0;"></div>`
}

function labelRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#666666;width:140px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#e5e5e5;">${value}</td>
  </tr>`
}

// ─── Email senders ────────────────────────────────────────────────────────────

/** 1. Welcome email — sent after signup */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;">Welcome</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Welcome to<br/>K2 Climbers</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">Hi ${name || "Climber"}, your account has been created. You can now book expeditions, track your summit records, and join our community of mountaineers conquering Pakistan's greatest peaks.</p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${labelRow("Email", to)}
      ${labelRow("Role", "Climber")}
    </table>
    ${btn("Explore Expeditions", `${BASE_URL}/expeditions`)}
    <p style="margin:20px 0 0;font-size:12px;color:#666666;">Questions? Email us at <a href="mailto:info@k2climbers.com" style="color:#f97316;">info@k2climbers.com</a></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: "Welcome to K2 Climbers 🏔️",
    html,
  })
}

/** 2. Booking confirmation email */
export async function sendBookingConfirmationEmail(opts: {
  to: string
  name: string
  bookingId: string
  expeditionTitle: string
  expeditionSlug: string
  numberOfPeople: number
  totalAmount: number
  slotStartDate?: string
  slotEndDate?: string
  slotLabel?: string
}) {
  const {
    to, name, bookingId, expeditionTitle, expeditionSlug,
    numberOfPeople, totalAmount, slotStartDate, slotEndDate, slotLabel,
  } = opts

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  const slotRow = slotStartDate && slotEndDate
    ? labelRow("Dates", `${formatDate(slotStartDate)} – ${formatDate(slotEndDate)}${slotLabel ? ` (${slotLabel})` : ""}`)
    : ""

  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;">Booking Confirmed</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Your Booking<br/>is Confirmed</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">Hi ${name || "Climber"}, your booking for <strong style="color:#ffffff;">${expeditionTitle}</strong> has been received. Our team will review it and reach out within 24 hours.</p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;">
      ${labelRow("Booking Ref", bookingId.slice(0, 8).toUpperCase())}
      ${labelRow("Expedition", expeditionTitle)}
      ${slotRow}
      ${labelRow("Participants", String(numberOfPeople))}
      ${labelRow("Total Amount", `PKR ${Math.round(totalAmount).toLocaleString("en-PK")}`)}
    </table>
    ${btn("View Booking", `${BASE_URL}/bookings/${bookingId}`)}
    <p style="margin:20px 0 0;font-size:12px;color:#666666;">Need to make changes? Contact us at <a href="mailto:booking@k2climbers.com" style="color:#f97316;">booking@k2climbers.com</a></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Booking Confirmed — ${expeditionTitle}`,
    html,
  })
}

/** 3. Certificate issued email */
export async function sendCertificateEmail(opts: {
  to: string
  name: string
  certificateId: string
  verificationCode: string
  expeditionTitle: string
  peakName: string
  altitude: number
  summitDate: string
}) {
  const { to, name, certificateId, verificationCode, expeditionTitle, peakName, altitude, summitDate } = opts

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;">Certificate Issued</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Summit<br/>Certificate</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">Congratulations, <strong style="color:#ffffff;">${name || "Climber"}</strong>! Your summit certificate for <strong style="color:#ffffff;">${peakName}</strong> has been issued.</p>
    <div style="background:#0a0a0a;border:1px solid #262626;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#666666;">Summit Achievement</p>
      <p style="margin:0 0 16px;font-size:24px;font-weight:900;color:#f97316;">${peakName}</p>
      <p style="margin:0;font-size:13px;color:#999999;">${altitude.toLocaleString()}m &bull; ${formatDate(summitDate)}</p>
    </div>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;">
      ${labelRow("Expedition", expeditionTitle)}
      ${labelRow("Peak", peakName)}
      ${labelRow("Altitude", `${altitude.toLocaleString()}m`)}
      ${labelRow("Summit Date", formatDate(summitDate))}
      ${labelRow("Verify Code", verificationCode)}
    </table>
    ${btn("View Certificate", `${BASE_URL}/certificates/${verificationCode}`)}
    <p style="margin:20px 0 0;font-size:12px;color:#666666;">Share your achievement or verify it at <a href="${BASE_URL}/certificates/${verificationCode}" style="color:#f97316;">${BASE_URL}/certificates/${verificationCode}</a></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: `🏔️ Summit Certificate — ${peakName}`,
    html,
  })
}

/** 4. Booking status confirmed email */
export async function sendBookingConfirmedEmail(opts: {
  to: string
  name: string
  bookingId: string
  expeditionTitle: string
  expeditionSlug: string
  numberOfPeople: number
  totalAmount: number
  slotStartDate?: string
  slotEndDate?: string
  slotLabel?: string
}) {
  const {
    to, name, bookingId, expeditionTitle, expeditionSlug,
    numberOfPeople, totalAmount, slotStartDate, slotEndDate, slotLabel,
  } = opts

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  const slotRow = slotStartDate && slotEndDate
    ? labelRow("Dates", `${formatDate(slotStartDate)} – ${formatDate(slotEndDate)}${slotLabel ? ` (${slotLabel})` : ""}`)
    : ""

  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#22c55e;">Booking Confirmed</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Your Booking<br/>is Confirmed!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">Great news, ${name || "Climber"}! Your booking for <strong style="color:#ffffff;">${expeditionTitle}</strong> has been reviewed and confirmed by our team. Get ready for the adventure!</p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;">
      ${labelRow("Booking Ref", bookingId.slice(0, 8).toUpperCase())}
      ${labelRow("Expedition", expeditionTitle)}
      ${slotRow}
      ${labelRow("Participants", String(numberOfPeople))}
      ${labelRow("Total Amount", `PKR ${Math.round(totalAmount).toLocaleString("en-PK")}`)}
    </table>
    ${btn("View Booking", `${BASE_URL}/bookings/${bookingId}`)}
    <p style="margin:20px 0 0;font-size:12px;color:#666666;">Questions? Contact us at <a href="mailto:booking@k2climbers.com" style="color:#f97316;">booking@k2climbers.com</a></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: `✅ Booking Confirmed — ${expeditionTitle}`,
    html,
  })
}

/** 5. Booking cancelled email */
export async function sendBookingCancelledEmail(opts: {
  to: string
  name: string
  bookingId: string
  expeditionTitle: string
  cancelledBy: "user" | "admin"
}) {
  const { to, name, bookingId, expeditionTitle, cancelledBy } = opts

  const reason = cancelledBy === "admin"
    ? "Our team has cancelled your booking. If you believe this is a mistake or would like to rebook, please contact us."
    : "You have successfully cancelled your booking. If you change your mind, you are welcome to book again at any time."

  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#ef4444;">Booking Cancelled</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Booking<br/>Cancelled</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">Hi ${name || "Climber"}, ${reason}</p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;">
      ${labelRow("Booking Ref", bookingId.slice(0, 8).toUpperCase())}
      ${labelRow("Expedition", expeditionTitle)}
      ${labelRow("Status", "Cancelled")}
    </table>
    ${btn("Browse Expeditions", `${BASE_URL}/expeditions`)}
    <p style="margin:20px 0 0;font-size:12px;color:#666666;">Need help? Contact us at <a href="mailto:booking@k2climbers.com" style="color:#f97316;">booking@k2climbers.com</a></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Booking Cancelled — ${expeditionTitle}`,
    html,
  })
}

/** 6. Certificate revoked email */
export async function sendCertificateRevokedEmail(opts: {
  to: string
  name: string
  peakName: string
  expeditionTitle: string
  altitude: number
}) {
  const { to, name, peakName, expeditionTitle, altitude } = opts

  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#ef4444;">Certificate Revoked</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Summit Certificate<br/>Revoked</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">Hi ${name || "Climber"}, your summit certificate for <strong style="color:#ffffff;">${peakName}</strong> has been revoked by the K2 Climbers team. The verification link is no longer valid.</p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;">
      ${labelRow("Peak", peakName)}
      ${labelRow("Altitude", `${altitude.toLocaleString()}m`)}
      ${labelRow("Expedition", expeditionTitle)}
    </table>
    <p style="margin:0 0 24px;font-size:13px;color:#999999;line-height:1.7;">If you believe this was done in error, please contact our team and we will review your case.</p>
    ${btn("Contact Us", `${BASE_URL}/contact`)}
    <p style="margin:20px 0 0;font-size:12px;color:#666666;">Reach us at <a href="mailto:info@k2climbers.com" style="color:#f97316;">info@k2climbers.com</a></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Certificate Revoked — ${peakName}`,
    html,
  })
}

/** 7. Password reset email */
export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${resetToken}`

  const html = layout(`
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;">Password Reset</p>
    <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.1;">Reset Your<br/>Password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#999999;line-height:1.7;">We received a request to reset the password for your K2 Climbers account. Click the button below to set a new password. This link expires in <strong style="color:#ffffff;">1 hour</strong>.</p>
    ${btn("Reset Password", resetUrl)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#666666;">If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <p style="margin:12px 0 0;font-size:11px;color:#444444;">Link not working? Copy and paste this URL into your browser:<br/><span style="color:#f97316;word-break:break-all;">${resetUrl}</span></p>
  `)

  await transport.sendMail({
    from: FROM,
    to,
    subject: "Reset your K2 Climbers password",
    html,
  })
}
