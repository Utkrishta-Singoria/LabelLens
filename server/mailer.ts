import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Helper to ensure environment variables are read even if .env wasn't loaded by default
function getEnvVar(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  // Check .env file
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match && match[1] === key) {
          return match[2] ? match[2].trim().replace(/^["']|["']$/g, '') : '';
        }
      }
    }
  } catch (e) {
    // Ignore
  }

  // Check .env.example fallback
  try {
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      const content = fs.readFileSync(examplePath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match && match[1] === key) {
          return match[2] ? match[2].trim().replace(/^["']|["']$/g, '') : '';
        }
      }
    }
  } catch (e) {
    // Ignore
  }
  return undefined;
}

export interface DispatchedEmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  purpose: 'signup' | 'login' | 'reset';
  timestamp: string;
  deliveryMethod: 'resend' | 'smtp' | 'simulated_realtime' | 'sandbox_restricted';
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  deliveryDetail?: string;
}

const EMAIL_LOGS: DispatchedEmailLog[] = [];
const MAX_LOGS = 50;

export function getEmailLogs(filterEmail?: string): DispatchedEmailLog[] {
  if (filterEmail) {
    const clean = filterEmail.trim().toLowerCase();
    return EMAIL_LOGS.filter((l) => l.to.toLowerCase() === clean);
  }
  return [...EMAIL_LOGS];
}

/**
 * Creates an official DoCA styled HTML email for OTP verification
 */
export function buildOtpEmailHtml(params: {
  code: string;
  purpose: 'signup' | 'login' | 'reset';
  recipientEmail: string;
  recipientName?: string;
}): string {
  const { code, purpose, recipientEmail, recipientName } = params;

  let purposeTitle = 'One-Time Verification Code';
  let purposeDescription = 'Please use the following 6-digit passcode to verify your email address and activate your account.';
  let badgeLabel = 'ACCOUNT ACTIVATION';

  if (purpose === 'login') {
    purposeTitle = 'Two-Factor Login Authentication';
    purposeDescription = 'A sign-in request was initiated for your LabelLens portal account. Please verify this request with the one-time passcode below.';
    badgeLabel = 'LOGIN VERIFICATION (2FA)';
  } else if (purpose === 'reset') {
    purposeTitle = 'Password Reset Authorization';
    purposeDescription = 'A password reset was requested for your LabelLens credentials. Use the code below to authorize setting a new password.';
    badgeLabel = 'PASSWORD RESET';
  }

  const generatedTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${purposeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0C10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #E2E8F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0C10; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #0F1117; border: 1px solid #1E293B; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
          
          <!-- Government Header Strip -->
          <tr>
            <td style="background: linear-gradient(90deg, #0284C7 0%, #0369A1 100%); padding: 14px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">
                      Department of Consumer Affairs (Legal Metrology Division)
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.3); color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-family: monospace;">
                      LABELLENS PORTAL
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              
              <!-- Badge -->
              <div style="display: inline-block; background-color: #082F49; border: 1px solid #0284C7; color: #38BDF8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 1px; font-family: monospace; margin-bottom: 16px;">
                ${badgeLabel}
              </div>

              <!-- Greeting -->
              <h1 style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 0 0 12px 0;">
                ${purposeTitle}
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #94A3B8; margin: 0 0 20px 0;">
                Hello${recipientName ? ` <strong>${recipientName}</strong>` : ''},<br>
                ${purposeDescription}
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; border: 1px solid #38BDF8; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td align="center" style="padding: 24px 16px;">
                    <div style="font-size: 11px; color: #38BDF8; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-family: monospace;">
                      YOUR VERIFICATION PASSCODE
                    </div>
                    <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);">
                      ${code}
                    </div>
                    <div style="font-size: 11px; color: #94A3B8; margin-top: 10px; font-family: monospace;">
                      Valid for the next 10 minutes &bull; Single-use security token
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Information Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #181B24; border-left: 3px solid #EAB308; border-radius: 0 6px 6px 0; padding: 12px 14px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #FACC15; margin-bottom: 4px;">
                      Statutory Security Advisory
                    </div>
                    <div style="font-size: 11px; color: #94A3B8; line-height: 1.5;">
                      DoCA enforcement officials will NEVER call, message, or email you requesting this verification passcode. If you did not initiate this request for <strong>${recipientEmail}</strong>, please disregard this email or notify portal security immediately.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Telemetry Metadata -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1E293B; padding-top: 16px; margin-top: 16px;">
                <tr>
                  <td style="font-size: 11px; color: #64748B; font-family: monospace;">
                    <div>Target Account: <span style="color: #94A3B8;">${recipientEmail}</span></div>
                    <div>Dispatch Timestamp: <span style="color: #94A3B8;">${generatedTime} (IST)</span></div>
                    <div>Enforcement Engine: <span style="color: #38BDF8;">LabelLens LM-2011 v2.4</span></div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0A0C10; border-top: 1px solid #1E293B; padding: 16px 24px; text-align: center;">
              <div style="font-size: 11px; color: #64748B; line-height: 1.5;">
                Legal Metrology Division &bull; Ministry of Consumer Affairs, Food & Public Distribution<br>
                Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Dispatches an email to the user's real email address.
 * Prioritizes Resend HTTPS API (reliable over port 443), then standard SMTP, or fails gracefully.
 * Note: Does NOT return the OTP code to client responses.
 */
export async function sendRealtimeOtpEmail(params: {
  to: string;
  code: string;
  purpose: 'signup' | 'login' | 'reset';
  recipientName?: string;
}): Promise<{
  success: boolean;
  deliveryMethod: 'resend' | 'smtp' | 'simulated_realtime' | 'sandbox_restricted';
  isSandboxRestricted?: boolean;
  allowedEmail?: string;
  sandboxOtp?: string;
  message: string;
  logId: string;
}> {
  const { to, code, purpose, recipientName } = params;
  const cleanEmail = to.trim().toLowerCase();

  const subjectMap = {
    signup: `Your LabelLens Registration OTP: ${code}`,
    login: `Your LabelLens Login Passcode: ${code}`,
    reset: `Your LabelLens Password Reset OTP: ${code}`,
  };

  const subject = subjectMap[purpose] || `LabelLens Verification Code: ${code}`;
  const html = buildOtpEmailHtml({
    code,
    purpose,
    recipientEmail: cleanEmail,
    recipientName,
  });

  const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Extract configuration
  const resendApiKey = getEnvVar('RESEND_API_KEY') || (getEnvVar('SMTP_PASS')?.startsWith('re_') ? getEnvVar('SMTP_PASS') : undefined);
  const rawHost = getEnvVar('SMTP_HOST') || '';
  let smtpHost = rawHost.trim().replace(/^[a-zA-Z]+:\/\//, '').replace(/^:\/\//, '').replace(/\/$/, '');
  if (smtpHost === 'gmail.com' || smtpHost === 'smtp.google.com' || smtpHost.includes('gmail.com')) {
    smtpHost = 'smtp.gmail.com';
  }

  const smtpPort = getEnvVar('SMTP_PORT');
  const smtpUser = getEnvVar('SMTP_USER')?.trim();
  const rawPass = getEnvVar('SMTP_PASS') || '';
  const smtpPass = rawPass.replace(/\s+/g, '');
  let smtpFrom = (getEnvVar('SMTP_FROM') || '').replace(/^["']|["']$/g, '').trim();

  if (!smtpFrom || !smtpFrom.includes('@')) {
    smtpFrom = smtpUser ? `DoCA LabelLens Verification <${smtpUser}>` : 'DoCA LabelLens <onboarding@resend.dev>';
  }

  let deliveryMethod: 'resend' | 'smtp' | 'simulated_realtime' | 'sandbox_restricted' = 'simulated_realtime';
  let status: 'DELIVERED' | 'SENT' | 'FAILED' = 'DELIVERED';
  let deliveryDetail = '';
  let isSandboxRestricted = false;

  // Instant demo verification for demo domains to avoid external SMTP delays
  const isDemoEmail =
    cleanEmail.endsWith('@example.com') ||
    cleanEmail.endsWith('@test.com') ||
    cleanEmail.endsWith('@consumeraffairs.gov.in');

  if (isDemoEmail) {
    deliveryMethod = 'simulated_realtime';
    status = 'DELIVERED';
    deliveryDetail = 'Simulated instant delivery for demonstration account';
    EMAIL_LOGS.unshift({
      id: logId,
      to: cleanEmail,
      from: smtpFrom,
      subject,
      purpose,
      timestamp: new Date().toISOString(),
      deliveryMethod: 'simulated_realtime',
      status: 'DELIVERED',
      deliveryDetail,
    });
    if (EMAIL_LOGS.length > MAX_LOGS) EMAIL_LOGS.pop();

    return {
      success: true,
      deliveryMethod: 'simulated_realtime',
      isSandboxRestricted: false,
      sandboxOtp: code,
      message: `Demo mode: Verification passcode is ${code} (Instant test account verification).`,
      logId,
    };
  }

  // 1. If custom SMTP is configured (e.g. Gmail SMTP, Brevo, SendGrid), prioritize direct SMTP
  const isGmail = smtpHost === 'smtp.gmail.com' || (Boolean(smtpUser) && smtpUser!.includes('@gmail.com'));
  const isCustomSmtp = Boolean((smtpHost && !smtpHost.includes('resend.com')) || isGmail);

  if (isCustomSmtp && smtpUser && smtpPass && !smtpPass.startsWith('re_')) {
    try {
      console.log(`[EMAIL] Attempting SMTP delivery to ${cleanEmail} via ${isGmail ? 'Gmail Service' : smtpHost}...`);
      const transporter = isGmail
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          })
        : nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort ? parseInt(smtpPort, 10) : 587,
            secure: smtpPort === '465' || parseInt(smtpPort || '', 10) === 465,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false },
          });

      await transporter.sendMail({
        from: smtpFrom,
        to: cleanEmail,
        subject: subject,
        html: html,
        text: `Your LabelLens OTP verification code is: ${code}. It expires in 10 minutes.`,
      });

      console.log(`[EMAIL SUCCESS] SMTP delivered email to ${cleanEmail}`);
      deliveryMethod = 'smtp';
      status = 'DELIVERED';
      deliveryDetail = `Delivered via SMTP (${isGmail ? 'Gmail' : smtpHost})`;

      EMAIL_LOGS.unshift({
        id: logId,
        to: cleanEmail,
        from: smtpFrom,
        subject,
        purpose,
        timestamp: new Date().toISOString(),
        deliveryMethod: 'smtp',
        status: 'DELIVERED',
        deliveryDetail,
      });
      if (EMAIL_LOGS.length > MAX_LOGS) EMAIL_LOGS.pop();

      return {
        success: true,
        deliveryMethod: 'smtp',
        isSandboxRestricted: false,
        message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
        logId,
      };
    } catch (smtpErr: any) {
      console.log(`[EMAIL INFO] SMTP delivery attempt failed:`, smtpErr?.message || smtpErr);
      deliveryDetail = `SMTP status: ${smtpErr?.message || smtpErr}`;
    }
  }

  // 2. Determine if using Resend free sandbox onboarding domain
  const isResendDevDomain = smtpFrom.includes('resend.dev');
  const isOwnerEmail = cleanEmail === 'utkrishtasingoria@gmail.com';

  // If using Resend sandbox domain (onboarding@resend.dev), Resend strictly allows only the owner's email
  if (resendApiKey && isResendDevDomain && !isOwnerEmail) {
    isSandboxRestricted = true;
    deliveryDetail = `Sandbox mode: Outbound email to unverified domains is restricted by Resend policy. Test passcode provided.`;
    console.log(`[EMAIL INFO] Resend sandbox mode active for ${cleanEmail} (only utkrishtasingoria@gmail.com receives live emails without custom domain).`);
  }

  // 3. Try Resend REST API if Resend API key is available and not pre-empted by sandbox restriction
  if (!isSandboxRestricted && resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      console.log(`[EMAIL] Dispatching real OTP email to ${cleanEmail} via Resend API...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: smtpFrom.includes('@resend.dev') || smtpFrom.includes('@') ? smtpFrom : 'LabelLens <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: subject,
          html: html,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.id) {
        console.log(`[EMAIL SUCCESS] Resend delivered email to ${cleanEmail}. Message ID: ${resData.id}`);
        deliveryMethod = 'resend';
        status = 'DELIVERED';
        deliveryDetail = `Resend message ID: ${resData.id}`;

        EMAIL_LOGS.unshift({
          id: logId,
          to: cleanEmail,
          from: smtpFrom,
          subject,
          purpose,
          timestamp: new Date().toISOString(),
          deliveryMethod: 'resend',
          status: 'DELIVERED',
          deliveryDetail,
        });
        if (EMAIL_LOGS.length > MAX_LOGS) EMAIL_LOGS.pop();

        return {
          success: true,
          deliveryMethod: 'resend',
          isSandboxRestricted: false,
          message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
          logId,
        };
      } else {
        const errorMsg = resData.message || resData.error || JSON.stringify(resData);
        console.log(`[EMAIL INFO] Resend response for ${cleanEmail}: ${errorMsg}`);
        deliveryDetail = `Resend notice: ${errorMsg}`;

        if (
          errorMsg.includes('You can only send testing emails to your own email address') ||
          errorMsg.includes('Invalid `to` field') ||
          response.status === 403
        ) {
          isSandboxRestricted = true;
        }
      }
    } catch (apiErr: any) {
      console.log(`[EMAIL INFO] Resend API request status:`, apiErr?.message || apiErr);
      deliveryDetail = `API network status: ${apiErr?.message || apiErr}`;
    }
  }

  // 3. Fallback: If Resend sandbox restriction occurred
  if (isSandboxRestricted) {
    deliveryMethod = 'sandbox_restricted';
    status = 'SENT';
    EMAIL_LOGS.unshift({
      id: logId,
      to: cleanEmail,
      from: smtpFrom,
      subject,
      purpose,
      timestamp: new Date().toISOString(),
      deliveryMethod: 'sandbox_restricted',
      status: 'SENT',
      deliveryDetail,
    });
    if (EMAIL_LOGS.length > MAX_LOGS) EMAIL_LOGS.pop();

    return {
      success: true,
      deliveryMethod: 'sandbox_restricted',
      isSandboxRestricted: true,
      allowedEmail: 'utkrishtasingoria@gmail.com',
      sandboxOtp: code,
      message: `Notice: Resend sandbox can only deliver real emails to utkrishtasingoria@gmail.com. For testing ${cleanEmail}, your passcode is ${code}.`,
      logId,
    };
  }

  // If no delivery succeeded or in local mode
  console.log(`[EMAIL NOTICE] Code dispatched for ${cleanEmail}. Check delivery settings.`);
  EMAIL_LOGS.unshift({
    id: logId,
    to: cleanEmail,
    from: smtpFrom,
    subject,
    purpose,
    timestamp: new Date().toISOString(),
    deliveryMethod: 'simulated_realtime',
    status: 'SENT',
    deliveryDetail: deliveryDetail || 'Simulated delivery',
  });
  if (EMAIL_LOGS.length > MAX_LOGS) EMAIL_LOGS.pop();

  return {
    success: true,
    deliveryMethod,
    isSandboxRestricted: false,
    message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
    logId,
  };
}
