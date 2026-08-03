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
        : result === 'error'
          ? 'No se pudo completar la aprobación. Inténtalo de nuevo.'
          : 'Enlace inválido o ya utilizado.';

  const ok = result === 'ok' || result === 'already';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
            ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
          aria-hidden="true"
        >
          {ok ? '✓' : '!'}
        </div>
        <h1 className="text-2xl font-bold">{ok ? 'Aprobación completada' : 'Aprobación no válida'}</h1>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};
