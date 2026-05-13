import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env.js';

let transporter: Transporter | null = null;

function get_transporter(): Transporter | null {
	if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
		return null;
	}
	if (transporter) return transporter;

	transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS,
		},
	});
	return transporter;
}

export type NewContactMessage = {
	name: string;
	email: string;
	message: string;
	ip: string | null;
};

function escape_html(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export async function notify_new_message(msg: NewContactMessage): Promise<void> {
	const t = get_transporter();
	if (!t || !env.NOTIFY_EMAIL) {
		console.log('[mailer] SMTP yapılandırılmamış, e-posta gönderilmedi.');
		return;
	}

	const safe_name = escape_html(msg.name);
	const safe_email = escape_html(msg.email);
	const safe_message = escape_html(msg.message).replace(/\n/g, '<br />');

	const admin_url = `${env.PUBLIC_BASE_URL}/admin/messages`;

	try {
		await t.sendMail({
			from: env.SMTP_FROM || env.SMTP_USER,
			to: env.NOTIFY_EMAIL,
			replyTo: msg.email,
			subject: `Yeni iletişim mesajı — ${msg.name}`,
			html: `
				<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 1rem;">
					<h2 style="color: #1d1d1f; margin: 0 0 1rem 0;">📬 Yeni Mesaj Geldi</h2>
					<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
						<tr>
							<td style="padding: 0.5rem 0; color: #6e6e73; width: 100px;">Kimden</td>
							<td style="padding: 0.5rem 0; font-weight: 500;">${safe_name}</td>
						</tr>
						<tr>
							<td style="padding: 0.5rem 0; color: #6e6e73;">E-posta</td>
							<td style="padding: 0.5rem 0;"><a href="mailto:${safe_email}" style="color: #667eea;">${safe_email}</a></td>
						</tr>
						${msg.ip ? `<tr><td style="padding: 0.5rem 0; color: #6e6e73;">IP</td><td style="padding: 0.5rem 0; color: #6e6e73; font-size: 0.85rem;">${escape_html(msg.ip)}</td></tr>` : ''}
					</table>
					<div style="background: #f5f5f7; padding: 1rem 1.2rem; border-radius: 0.5rem; line-height: 1.6;">
						${safe_message}
					</div>
					<a href="${admin_url}" style="display: inline-block; margin-top: 1.2rem; padding: 0.6rem 1.2rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 0.4rem; font-weight: 500;">
						Admin panelinde aç →
					</a>
				</div>
			`,
		});
		console.log('[mailer] Bildirim e-postası gönderildi.');
	} catch (err) {
		console.error('[mailer] E-posta gönderilemedi:', err);
	}
}
