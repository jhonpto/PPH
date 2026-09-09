export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM || 'Data da Virada <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Redefinir sua senha — Data da Virada',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #8f1546;">Redefinir sua senha</h2>
          <p>Clique no link abaixo para escolher uma nova senha. Ele expira em 1 hora.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#c11f5c;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;">Redefinir senha</a></p>
          <p style="color:#666;font-size:13px;">Se você não pediu isso, pode ignorar este e-mail.</p>
        </div>
      `,
    }),
  });

  return response.ok;
}
