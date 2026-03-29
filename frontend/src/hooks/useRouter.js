/**
 * useRouter Hook
 * Wrapper around Wouter's hooks for consistent API.
 * 
 * @example
 * ```js
 * const { route, navigate, match, getParam } = useRouter();
 * 
 * // Navigate
 * navigate('/project/:id/images', { id: project.id });
 * 
 * // Check route
 * if (match('/project/:id/annotate')) {
 *   const id = getParam('id');
 * }
 * ```
 */

import { useLocation, useParams } from 'wouter';

export const useRouter = () => {
  const [location, navigate] = useLocation();
  const params = useParams();

  return {
    route: {
      path: location,
      params: params,
    },
    navigate,
    goBack: () => window.history.back(),
    goHome: () => navigate('/'),
    match: (pattern) => {
      // Wouter's useLocation returns the raw path
      // We need to manually match against the pattern
      const patternParts = pattern.split('/').filter(Boolean);
      const routeParts = location.split('/').filter(Boolean);

      if (patternParts.length !== routeParts.length) {
        return false;
      }

      return patternParts.every((part, index) => {
        if (part.startsWith(':')) {
          const paramName = part.slice(1);
          return routeParts[index] !== undefined;
        }
        return part === routeParts[index];
      });
    },
    getParam: (name) => params[name] || null,
    getParams: () => ({ ...params }),
  };
};

export default useRouter;
