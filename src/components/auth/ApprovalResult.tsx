import { BrandLockup } from '../brand/BrandLockup';

interface ApprovalResultProps {
  result: string | null;
  email: string | null;
}

// Confirmación de la aprobación de acceso. La abre el owner desde el enlace del
// email; approve-access redirige aquí con el resultado en la query.
export const ApprovalResult = ({ result, email }: ApprovalResultProps) => {
  const who = email ? ` de ${email}` : '';

  const message =
    result === 'ok'
      ? `Acceso aprobado${who}. Ya puede entrar en la app.`
      : result === 'already'
        ? `El acceso${who} ya estaba aprobado.`
        : result === 'denied'
          ? `Has denegado la solicitud${who}.`
          : result === 'error'
            ? 'No se pudo completar la operación. Inténtalo de nuevo.'
            : 'Enlace inválido o ya utilizado.';

  const ok = result === 'ok' || result === 'already';
  const title =
    result === 'denied' ? 'Solicitud denegada' : ok ? 'Aprobación completada' : 'Operación no válida';

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-5">
        <BrandLockup markSize={40} stacked />
        <div className="space-y-2">
          <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
