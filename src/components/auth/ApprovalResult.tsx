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
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
            ok
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
          }`}
          aria-hidden="true"
        >
          {ok ? '✓' : '✕'}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
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
