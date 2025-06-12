interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <main className="min-h-screen bg-background text-light dark:bg-background-dark dark:text-dark p-4 transition-colors duration-300">
      <header className="flex justify-center my-6">
        <h1 className="text-3xl font-bold">
          <span className="text-light dark:text-dark">Tasks </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Manager App
          </span>
        </h1>
      </header>
      {children}
    </main>
  );
};
