import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { BoardsSidebar } from './components/boards/BoardsSidebar';
import { BoardContent } from './components/boards/BoardContent';
import { Layout } from './components/layout/Layout';
import { AuthGate } from './components/auth/AuthGate';
import { ApprovalResult } from './components/auth/ApprovalResult';
import { useTasksRealtime } from './hooks/useTasksRealtime';
import { useTagStore } from './stores/tag.store';
import { TopLoader } from './components/common/TopLoader';

const AppContent = () => {
  const error = useBoardStore((state) => state.error);
  const boards = useBoardStore((state) => state.boards);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);
  const fetchTags = useTagStore((state) => state.fetchTags);

  useEffect(() => {
    // AuthGate ya ha resuelto la sesión (onAuthStateChange INITIAL_SESSION)
    // antes de montar AppContent, así que la sesión/JWT ya están disponibles.
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (currentBoardId == null) {
      useTagStore.setState({ tags: [], boardId: null, loaded: false, error: null, filterTagIds: [] });
      return;
    }
    void fetchTags(currentBoardId);
  }, [currentBoardId, fetchTags]);

  useTasksRealtime();

  if (error && boards.length === 0) {
    const handleRetry = () => {
      useBoardStore.setState({ error: null });
      fetchBoards();
    };

    return (
      <div className="auth-shell">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-light dark:text-dark">No se pudo cargar</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Error del servidor ({error}). Prueba a recargar; si sigue, cierra sesión y vuelve a
            entrar.
          </p>
          <button type="button" onClick={handleRetry} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <TopLoader />
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

      <div className="flex flex-col p-4 h-full min-h-0 min-w-0 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 min-w-0 overflow-hidden">
          <BoardsSidebar />

          <section id="main-content" className="flex-1 min-w-0 min-h-0 overflow-hidden">
            <BoardContent />
          </section>
        </div>
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
