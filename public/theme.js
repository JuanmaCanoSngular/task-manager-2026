(function () {
  function getInitialTheme() {
    // 1. Verificar localStorage
    const theme = localStorage.getItem('theme-storage');
    if (theme) {
      try {
        const { state } = JSON.parse(theme);
        return state.isDark ? 'dark' : 'light';
      } catch {
        // Si hay error al parsear, continuar con las preferencias del sistema
      }
    }

    // 2. Verificar preferencias del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Aplicar tema inicial
  const theme = getInitialTheme();
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
