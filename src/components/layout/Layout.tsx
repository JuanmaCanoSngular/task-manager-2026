import { useBoardStore } from '../../stores/board.store';
import { ErrorBanner } from '../common/ErrorBanner';
import { BrandLockup } from '../brand/BrandLockup';
import { UserMenu } from '../auth/UserMenu';
import { ToggleTheme } from './ToggleTheme';
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
    <div className="h-screen flex flex-col text-light dark:text-dark overflow-hidden">
      <header className="flex-shrink-0 grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-start">
          <ToggleTheme />
        </div>

        <h1 className="flex justify-center min-w-0">
          <button
            onClick={handleLogoClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="inline-flex items-center rounded-xl px-1 py-1 sm:px-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:focus:ring-offset-[var(--app-bg)] max-w-full"
            aria-label={`Ir al inicio — ${BRAND_NAME}`}
          >
            <BrandLockup markSize={32} wordmarkClassName="truncate text-sm sm:text-[1.25rem]" />
          </button>
        </h1>

        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
          <UserMenu />
        </div>
      </header>

      <ErrorBanner />

      <main className="flex-1 min-h-0 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
};
