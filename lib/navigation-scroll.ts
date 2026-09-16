const SCROLL_RESET_PATH_KEY = "fasthaus-scroll-reset-path";

export function requestNavigationScrollReset(path: string) {
  if (window.location.pathname === path) {
    window.sessionStorage.removeItem(SCROLL_RESET_PATH_KEY);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return;
  }

  window.sessionStorage.setItem(SCROLL_RESET_PATH_KEY, path);
}

export function resetNavigationScrollIfRequested(pathname: string) {
  if (window.sessionStorage.getItem(SCROLL_RESET_PATH_KEY) !== pathname) return;

  window.sessionStorage.removeItem(SCROLL_RESET_PATH_KEY);
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
