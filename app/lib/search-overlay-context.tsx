import { createContext, useContext, type ReactNode } from "react";

type SearchOverlayValue = {
  openSearch: () => void;
};

const SearchOverlayContext = createContext<SearchOverlayValue | null>(null);

export function SearchOverlayProvider({
  children,
  openSearch,
}: {
  children: ReactNode;
  openSearch: () => void;
}) {
  return (
    <SearchOverlayContext.Provider value={{ openSearch }}>
      {children}
    </SearchOverlayContext.Provider>
  );
}

export function useOpenSearch(): (() => void) | undefined {
  return useContext(SearchOverlayContext)?.openSearch;
}
