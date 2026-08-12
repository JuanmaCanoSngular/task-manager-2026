import { useBoardStore } from '../../stores/board.store';
import { ErrorBanner } from '../common/ErrorBanner';
import { BrandLockup } from '../brand/BrandLockup';
import { UserMenu } from '../auth/UserMenu';
import { TelegramLinkButton } from '../auth/TelegramLinkButton';
import { TagsManagerButton } from '../tags/TagsManagerButton';
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
      <header className="relative flex-shrink-0 flex items-center justify-center p-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <ToggleTheme />
        </div>
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <TagsManagerButton />
          <TelegramLinkButton />
          <UserMenu />
        </div>
      </header>

      <ErrorBanner />

      <main className="flex-1 min-h-0 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
};
