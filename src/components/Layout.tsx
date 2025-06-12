interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-text dark:bg-background-dark dark:text-text-dark p-4 transition-colors duration-300">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-dark">Task Manager</h1>
      </header>
      {children}
    </div>
  );
};

export default Layout;
