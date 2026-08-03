// Plantillas de email compartidas por las Edge Functions y el script de preview
// (scripts/preview-emails.mjs). Fuente única del diseño de los correos.
// JS/ESM plano para poder importarse tanto desde Deno como desde Node.

const BRAND = 'Gestión de tareas';

export function button(href, label, color = '#6366f1') {
  return `<a href="${href}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:${color};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">${label}</a>`;
}

export function layout(heading, bodyHtml) {
  return `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,.10)">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:26px 32px">
          <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.3px">${BRAND}</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#0f172a">${heading}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #e2e8f0">
          <p style="margin:0;font-size:12px;color:#94a3b8">Mensaje automático de ${BRAND}. Si no reconoces esta actividad, ignóralo.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

// Aviso al owner de una nueva solicitud, con botones aprobar/denegar.
export function ownerRequestEmail(requesterEmail, approveUrl, denyUrl) {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569">
      Has recibido una nueva solicitud de acceso a <strong>${BRAND}</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border-radius:12px;margin:0 0 20px">
      <tr><td style="padding:14px 16px;font-size:14px;color:#0f172a">Solicitante: <strong>${requesterEmail}</strong></td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:4px">
      <tr>
        <td>${button(approveUrl, 'Aprobar acceso', '#16a34a')}</td>
        <td style="width:12px"></td>
        <td>${button(denyUrl, 'Denegar', '#dc2626')}</td>
      </tr>
    </table>`;
  return { subject: `Solicitud de acceso: ${requesterEmail}`, html: layout('Nueva solicitud de acceso', body) };
}

// Confirmación al solicitante de que su petición se ha recibido.
export function requestReceivedEmail() {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569">
      Hemos recibido tu solicitud de acceso a <strong>${BRAND}</strong>. La revisaremos y te
      avisaremos por email en cuanto haya una respuesta.
    </p>
    <p style="margin:0;font-size:14px;color:#94a3b8">No necesitas hacer nada más por ahora.</p>`;
  return { subject: 'Hemos recibido tu solicitud de acceso', html: layout('Solicitud recibida', body) };
}

// Aviso al usuario de que su acceso ha sido aprobado, con CTA a la app.
export function approvedEmail(appUrl) {
  const body =
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569">
       Tu acceso a <strong>${BRAND}</strong> ha sido aprobado. Ya puedes entrar y empezar a
       organizar tus tableros.
     </p>` + (appUrl ? button(appUrl, 'Entrar en la app') : '');
  return { subject: 'Tu acceso ha sido aprobado', html: layout('¡Acceso aprobado!', body) };
}

// Aviso al usuario de que su solicitud no ha sido aprobada.
export function deniedEmail() {
  const body = `
    <p style="margin:0;font-size:15px;line-height:1.6;color:#475569">
      Tu solicitud de acceso a <strong>${BRAND}</strong> no ha sido aprobada. Si crees que se trata
      de un error, contacta con el administrador.
    </p>`;
  return { subject: 'Sobre tu solicitud de acceso', html: layout('Solicitud no aprobada', body) };
}
