import { db } from './db';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  email: string;
  name: string;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}

function getAccounts(): StoredAccount[] {
  return db.get<StoredAccount[]>('accounts', []);
}

function saveAccounts(accounts: StoredAccount[]) {
  db.set('accounts', accounts);
}

export const authService = {
  getState(): AuthState {
    return db.get<AuthState>('auth', { isAuthenticated: false, userId: '', email: '', name: '' });
  },

  login(email: string, password: string): { success: boolean; error?: string; state?: AuthState } {
    const accounts = getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { success: false, error: 'No account found with this email.' };
    }
    if (account.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    const state: AuthState = { isAuthenticated: true, userId: account.id, email: account.email, name: account.name };
    db.set('auth', state);
    return { success: true, state };
  },

  signup(name: string, email: string, password: string): { success: boolean; error?: string; state?: AuthState } {
    if (!name.trim()) return { success: false, error: 'Name is required.' };
    if (!email.trim()) return { success: false, error: 'Email is required.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const accounts = getAccounts();
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newAccount: StoredAccount = {
      id: String(Date.now()),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    saveAccounts([...accounts, newAccount]);

    const state: AuthState = { isAuthenticated: true, userId: newAccount.id, email: newAccount.email, name: newAccount.name };
    db.set('auth', state);
    return { success: true, state };
  },

  logout(): AuthState {
    const state: AuthState = { isAuthenticated: false, userId: '', email: '', name: '' };
    db.set('auth', state);
    return state;
  },

  isLoggedIn(): boolean {
    return this.getState().isAuthenticated;
  }
};