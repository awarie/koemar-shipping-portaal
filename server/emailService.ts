import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: Transporter | null = null;
let lastConfigFetch = 0;
const CONFIG_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const now = Date.now();
    if (transporter && (now - lastConfigFetch) < CONFIG_CACHE_TIME) {
      return null; // Use cached transporter
    }

    console.log("Fetching SMTP configuration from suripost.nl/mail.php...");
    const response = await fetch('https://suripost.nl/mail.php');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SMTP config: ${response.status}`);
    }
    
    const config = await response.json();
    lastConfigFetch = now;
    
    return {
      host: config.host,
      port: config.port,
      secure: config.secure || false,
      user: config.user,
      password: config.password
    };
  } catch (error) {
    console.error('Error fetching SMTP configuration:', error);
    return null;
  }
}

async function createTransporter(): Promise<Transporter | null> {
  try {
    const config = await getSmtpConfig();
    if (!config) {
      console.error("No SMTP configuration available");
      return null;
    }

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    // Test the connection
    if (transporter) {
      await transporter.verify();
    }
    console.log("SMTP connection verified successfully");
    return transporter;
  } catch (error) {
    console.error('Error creating SMTP transporter:', error);
    return null;
  }
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    if (!transporter) {
      transporter = await createTransporter();
    }
    
    if (!transporter) {
      console.error("Cannot send email: SMTP transporter not available");
      return false;
    }

    const mailOptions = {
      from: '"Koemar Shipping" <info@suripost.nl>',
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} via info@suripost.nl`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Reset transporter on error to force reconfiguration on next attempt
    transporter = null;
    return false;
  }
}

export function generatePasswordResetEmailHtml(newPassword: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Wachtwoord Gewijzigd</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Koemar Shipping Pakket Portaal</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin-top: 0;">Wachtwoord Gewijzigd</h2>
          <p>Uw wachtwoord voor het Koemar Shipping Pakket Portaal is gewijzigd door een beheerder.</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Uw nieuwe wachtwoord is:</strong></p>
            <p style="font-family: monospace; font-size: 18px; background: #e5e7eb; padding: 10px; border-radius: 4px; letter-spacing: 1px;">
              ${newPassword}
            </p>
          </div>
          
          <p style="color: #dc2626;"><strong>Belangrijk:</strong></p>
          <ul style="color: #dc2626;">
            <li>Bewaar dit wachtwoord op een veilige plaats</li>
            <li>Log in met dit nieuwe wachtwoord</li>
            <li>We raden aan om uw wachtwoord te wijzigen na de eerste login</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Dit bericht is automatisch gegenereerd. Reageer niet op deze e-mail.
          </p>
          <p style="color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} Koemar Shipping Pakket Portaal
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}