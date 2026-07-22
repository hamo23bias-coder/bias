import nodemailer from "nodemailer";
import { logger } from "./logger";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@bias.tech";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@bias.tech";

function createTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendProjectRequestConfirmation(to: string, name: string, projectType: string) {
  const transport = createTransport();
  if (!transport) {
    logger.warn("SMTP not configured — skipping confirmation email");
    return;
  }
  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: "✅ تم استلام طلبك | Bias Tech",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">شكراً ${name}!</h2>
          <p>تم استلام طلبك بخصوص <strong>${projectType}</strong> بنجاح.</p>
          <p>سيتواصل معك فريقنا خلال 24-48 ساعة.</p>
          <hr/>
          <p style="color: #888; font-size: 12px;">فريق Bias Tech</p>
        </div>
      `,
    });
    logger.info({ to }, "Confirmation email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send confirmation email");
  }
}

export async function notifyAdminNewLead(leadId: number, name: string, email: string, projectType: string) {
  const transport = createTransport();
  if (!transport) return;
  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `🔔 طلب جديد #${leadId}: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>طلب مشروع جديد</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td><strong>الاسم:</strong></td><td>${name}</td></tr>
            <tr><td><strong>الإيميل:</strong></td><td>${email}</td></tr>
            <tr><td><strong>نوع المشروع:</strong></td><td>${projectType}</td></tr>
          </table>
          <a href="${process.env.ADMIN_DASHBOARD_URL ?? '#'}/leads/${leadId}" 
             style="display:inline-block; margin-top:16px; padding:10px 20px; background:#6366f1; color:#fff; text-decoration:none; border-radius:6px;">
            عرض الطلب في لوحة التحكم
          </a>
        </div>
      `,
    });
    logger.info({ leadId }, "Admin notification sent");
  } catch (err) {
    logger.error({ err, leadId }, "Failed to send admin notification");
  }
}

export async function sendFollowUpEmail(to: string, name: string, leadId: number) {
  const transport = createTransport();
  if (!transport) return;
  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: "هل أنت بخير؟ لازلنا هنا | Bias Tech",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">مرحباً ${name}</h2>
          <p>لاحظنا أنك تقدمت بطلب مشروع قبل يومين ولم نتواصل معك بعد.</p>
          <p>نعتذر عن التأخير! يمكنك التواصل معنا مباشرة على البريد الإلكتروني أو من خلال الموقع.</p>
          <hr/>
          <p style="color: #888; font-size: 12px;">فريق Bias Tech | رقم الطلب #${leadId}</p>
        </div>
      `,
    });
    logger.info({ leadId, to }, "Follow-up email sent");
  } catch (err) {
    logger.error({ err, leadId }, "Failed to send follow-up email");
  }
}
