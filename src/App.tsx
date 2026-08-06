import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { BoardsList } from './components/boards/BoardsList';
import { BoardContent } from './components/boards/BoardContent';
import { Layout } from './components/layout/Layout';
import { ToggleTheme } from './components/layout/ToggleTheme';
import { AuthGate } from './components/auth/AuthGate';
import { ApprovalResult } from './components/auth/ApprovalResult';
import { useTasksRealtime } from './hooks/useTasksRealtime';
import { useTagStore } from './stores/tag.store';

const AppContent = () => {
  const error = useBoardStore((state) => state.error);
  const boards = useBoardStore((state) => state.boards);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);
  const fetchTags = useTagStore((state) => state.fetchTags);

  useEffect(() => {
    fetchBoards();
    fetchTags();
  }, [fetchBoards, fetchTags]);

  useTasksRealtime();
  // Solo pantalla completa si falló la carga inicial (sin tableros).
  // Los fallos de escritura se muestran en ErrorBanner dentro del Layout.
  if (error && boards.length === 0) {
    return (
      <div className="auth-shell">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <Layout>
      {/* Skip links for keyboard navigation */}
      <div className="absolute -top-40 left-4 z-50 focus-within:top-4">
        <a
          href="#main-content"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#boards-list"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg ml-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Skip to boards list
        </a>
      </div>

      <div className="flex flex-col p-4 h-full">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <aside id="boards-list" className="flex-shrink-0 md:w-64 md:flex md:flex-col">
            <BoardsList />
          </aside>

          <section id="main-content" className="flex-1">
            <BoardContent />
          </section>
        </div>

        <footer className="flex-shrink-0 md:hidden mt-4">
          <ToggleTheme />
        </footer>
      </div>
    </Layout>
  );
};

// Acceso restringido detrás de login/aprobación. Con el flag desactivado la app
// funciona sin auth (comportamiento actual). Se lee en render para poder testear
// ambos modos con independencia del entorno.
const App = () => {
  // Página de confirmación de aprobación (redirigida desde approve-access).
  const params = new URLSearchParams(window.location.search);
  const approved = params.get('approved');
  if (approved) {
    return <ApprovalResult result={approved} email={params.get('email')} />;
  }

  const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';
  return authEnabled ? (
    <AuthGate>
      <AppContent />
    </AuthGate>
  ) : (
    <AppContent />
  );
};

export default App;
