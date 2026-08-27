class ThemeStore {
  mode = $state<'light' | 'dark'>('light');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fresh-mints-theme');
      if (saved === 'dark' || saved === 'light') {
        this.mode = saved;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.mode = 'dark';
      }
      this.applyToDOM();
    }
  }

  get isDark(): boolean {
    return this.mode === 'dark';
  }

  toggle() {
    this.mode = this.mode === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh-mints-theme', this.mode);
    }
    this.applyToDOM();
  }

  private applyToDOM() {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', this.mode === 'dark');
    document.documentElement.style.colorScheme = this.mode;
  }
}

export const themeStore = new ThemeStore();
