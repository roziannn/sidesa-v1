import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    const data = await resend.emails.send({
      from: 'Layanan Desa <noreply@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Email berhasil dikirim:', data);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return { success: false, error };
  }
}