export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'rep' | 'user';
  roles: string[];
  registeredAt?: number;
}

class AuthStore {
  user = $state<AuthUser | null>(null);
  isLoggedIn = $state<boolean>(false);
  isLoading = $state<boolean>(true);
  errorMessage = $state<string | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAuth();
    } else {
      this.isLoading = false;
    }
  }

  private getWpSettings() {
    if (typeof window === 'undefined') return null;
    return (window as any).wpApiSettings || null;
  }

  initAuth() {
    const wp = this.getWpSettings();
    if (wp && wp.currentUser && wp.userId > 0) {
      this.user = {
        id: wp.currentUser.id || `wp-${wp.userId}`,
        username: wp.currentUser.username || 'admin',
        email: wp.currentUser.email || '',
        fullName: wp.currentUser.fullName || wp.currentUser.username || 'Administrator',
        avatarUrl: wp.currentUser.avatarUrl || '',
        role: wp.currentUser.role || 'admin',
        roles: wp.currentUser.roles || ['administrator'],
        registeredAt: wp.currentUser.registeredAt,
      };
      this.isLoggedIn = true;
      this.isLoading = false;
      return;
    }

    // Check local session storage fallback (for standalone dev mode)
    const stored = localStorage.getItem('freshmints_auth_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) {
          this.user = parsed;
          this.isLoggedIn = true;
        }
      } catch (e) {
        localStorage.removeItem('freshmints_auth_user');
      }
    }

    this.isLoading = false;
  }

  async login(username: string, password: string, remember: boolean = true): Promise<boolean> {
    this.isLoading = true;
    this.errorMessage = null;

    const wp = this.getWpSettings();
    const root = wp?.root || '/wp-json/';

    try {
      const res = await fetch(`${root}xophz-freshmints/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wp?.nonce || '',
        },
        body: JSON.stringify({ username, password, remember }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        this.user = data.user;
        this.isLoggedIn = true;
        if (wp && data.nonce) {
          wp.nonce = data.nonce;
        }
        localStorage.setItem('freshmints_auth_user', JSON.stringify(data.user));
        this.isLoading = false;
        return true;
      } else {
        // Fallback for standalone Vite dev environment if backend not reachable
        if (username.trim() && password.trim() && !res.ok && res.status === 404) {
          const devUser: AuthUser = {
            id: 'rep-demo-1',
            username: username.trim(),
            email: `${username.trim()}@mycompass.local`,
            fullName: username.charAt(0).toUpperCase() + username.slice(1),
            role: username.toLowerCase().includes('admin') ? 'admin' : 'rep',
            roles: [username.toLowerCase().includes('admin') ? 'administrator' : 'freshmints_rep'],
          };
          this.user = devUser;
          this.isLoggedIn = true;
          localStorage.setItem('freshmints_auth_user', JSON.stringify(devUser));
          this.isLoading = false;
          return true;
        }

        this.errorMessage = data.message || 'Invalid username or password. Please try again.';
        this.isLoading = false;
        return false;
      }
    } catch (err: any) {
      // Local dev offline fallback
      if (username.trim() && password.trim()) {
        const devUser: AuthUser = {
          id: 'rep-demo-1',
          username: username.trim(),
          email: `${username.trim()}@mycompass.local`,
          fullName: username.charAt(0).toUpperCase() + username.slice(1),
          role: username.toLowerCase().includes('admin') ? 'admin' : 'rep',
          roles: [username.toLowerCase().includes('admin') ? 'administrator' : 'freshmints_rep'],
        };
        this.user = devUser;
        this.isLoggedIn = true;
        localStorage.setItem('freshmints_auth_user', JSON.stringify(devUser));
        this.isLoading = false;
        return true;
      }

      this.errorMessage = 'Network connection error. Please check your connection.';
      this.isLoading = false;
      return false;
    }
  }

  async logout(): Promise<void> {
    this.isLoading = true;
    const wp = this.getWpSettings();
    const root = wp?.root || '/wp-json/';

    try {
      await fetch(`${root}xophz-freshmints/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wp?.nonce || '',
        },
      });
    } catch (e) {
      // Ignore network errors on logout
    }

    this.user = null;
    this.isLoggedIn = false;
    this.errorMessage = null;
    localStorage.removeItem('freshmints_auth_user');
    this.isLoading = false;
  }
}

export const authStore = new AuthStore();
