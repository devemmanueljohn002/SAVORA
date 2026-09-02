import { create } from "zustand";

const MAX_RECENT = 8;

interface RecentSearchesState {
  terms: string[];
  add: (term: string) => void;
  remove: (term: string) => void;
  clear: () => void;
}

/**
 * In-memory only for Phase 3 — resets on app restart. Persisting this
 * (AsyncStorage or a `/users/me/search-history` endpoint) is a Phase 9
 * hardening task, not required for the browsing experience to work.
 */
export const useRecentSearchesStore = create<RecentSearchesState>((set) => ({
  terms: [],
  add: (term) =>
    set((state) => {
      const trimmed = term.trim();
      if (!trimmed) return state;
      const withoutDuplicate = state.terms.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
      return { terms: [trimmed, ...withoutDuplicate].slice(0, MAX_RECENT) };
    }),
  remove: (term) => set((state) => ({ terms: state.terms.filter((t) => t !== term) })),
  clear: () => set({ terms: [] }),
}));
