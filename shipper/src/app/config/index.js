export const mockMode = true;

export function buildRouteTitle(pathname) {
  return pathname.replace('/', '').replace(/-/g, ' ') || 'home';
}
