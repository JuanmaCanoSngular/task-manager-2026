interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Task Manager</h1>
      </header>
      {children}
    </div>
  );
};

export default Layout;
