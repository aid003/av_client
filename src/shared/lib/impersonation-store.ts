import { create } from 'zustand';
import {
  clearImpersonationTokenFromStorage,
  getStoredImpersonationToken,
  persistImpersonationToken,
} from './impersonation';

export type ImpersonationEndReason = 'manual' | 'expired' | 'forbidden' | 'invalid' | 'cleared';
export type ImpersonationSource = 'url' | 'storage';
export type ImpersonationStatusLevel = 'info' | 'warning' | 'error';

interface ImpersonationState {
  token: string | null;
  isActive: boolean;
  source: ImpersonationSource | null;
  lastEndReason: ImpersonationEndReason | null;
  statusMessage: string | null;
  statusLevel: ImpersonationStatusLevel;
  activatedAt: number | null;
  setToken: (token: string, source?: ImpersonationSource) => void;
  hydrateFromStorage: () => void;
  exit: (
    reason?: ImpersonationEndReason,
    message?: string,
    level?: ImpersonationStatusLevel
  ) => void;
  clearStatus: () => void;
}

export const useImpersonationStore = create<ImpersonationState>()((set) => ({
  token: null,
  isActive: false,
  source: null,
  lastEndReason: null,
  statusMessage: null,
  statusLevel: 'info',
  activatedAt: null,

  setToken: (token, source = 'storage') => {
    persistImpersonationToken(token);
    set({
      token,
      isActive: true,
      source,
      lastEndReason: null,
      statusMessage: null,
      statusLevel: 'info',
      activatedAt: Date.now(),
    });
  },

  hydrateFromStorage: () => {
    const storedToken = getStoredImpersonationToken();

    if (storedToken) {
      set({
        token: storedToken,
        isActive: true,
        source: 'storage',
        lastEndReason: null,
        statusMessage: null,
        statusLevel: 'info',
        activatedAt: Date.now(),
      });
    }
  },

  exit: (reason = 'cleared', message, level = 'warning') => {
    clearImpersonationTokenFromStorage();
    set({
      token: null,
      isActive: false,
      source: null,
      lastEndReason: reason,
      statusMessage: message ?? null,
      statusLevel: message ? level : 'info',
      activatedAt: null,
    });
  },

  clearStatus: () => set({ statusMessage: null }),
}));

export function handleImpersonationHttpError(status: number, message?: string) {
  const state = useImpersonationStore.getState();

  if (!state.token) {
    return;
  }

  if (status === 401) {
    state.exit('expired', message ?? 'Сессия impersonation истекла', 'warning');
    return;
  }

  if (status === 403) {
    state.exit(
      'forbidden',
      message ?? 'Доступ запрещен. Права администратора отозваны.',
      'error'
    );
    return;
  }

  if (status === 400 && message?.toLowerCase().includes('impersonation')) {
    state.exit('invalid', message, 'error');
  }
}
