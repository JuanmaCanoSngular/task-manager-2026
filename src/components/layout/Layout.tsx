import { useBoardStore } from '../../stores/board.store';
import { ErrorBanner } from '../common/ErrorBanner';
import { BrandLockup } from '../brand/BrandLockup';
import { SignOutButton } from '../auth/SignOutButton';
import { BRAND_NAME } from '../../brand';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const handleLogoClick = () => {
    useBoardStore.setState({ currentBoardId: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <div className="h-screen flex flex-col text-light dark:text-dark transition-colors duration-300">
      <header className="relative flex-shrink-0 flex items-center justify-center p-4">
        <h1 className="text-center">
          <button
            onClick={handleLogoClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="inline-flex items-center rounded-xl px-2 py-1 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:focus:ring-offset-[var(--app-bg)]"
            aria-label={`Ir al inicio — ${BRAND_NAME}`}
          >
            <BrandLockup markSize={36} />
          </button>
        </h1>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <SignOutButton />
        </div>
      </header>

      <ErrorBanner />

      <main className="flex-1">{children}</main>
    </div>
  );
};
