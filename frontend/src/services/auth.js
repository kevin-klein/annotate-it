// Store authentication token in localStorage
const TOKEN_KEY = 'auth_token';

// Redirect helper (extracted for testability)
export const redirect = (url) => {
  window.location.href = url;
};

// Test injection: allow tests to override the redirect function
let _redirect = redirect;

export const authService = {
  // Request login code
  requestLoginCode: async (email) => {
    const response = await fetch('/api/login_codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send login code');
    }

    return await response.json();
  },

  // Verify login code and get token
  verifyLoginCode: async (email, code) => {
    const response = await fetch('/api/login_codes/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Invalid or expired code');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  // Login user (legacy password-based)
  login: async (email, password) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  // Register new user
  signup: async (email, password, passwordConfirmation) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, password_confirmation: passwordConfirmation }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.join(', ') || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    try {
      await fetch('/api/logout', { method: 'DELETE', headers: authService.getAuthHeader() });
    } catch (e) {
      // Ignore errors during logout — token may already be expired
    }
    _redirect('/login');
  },

  // Get the authentication token
  getToken: () => localStorage.getItem(TOKEN_KEY),

  // Check if user is authenticated
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  // Get authentication header
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export const handleUnauthorized = () => {
  localStorage.removeItem('auth_token');
  _redirect('/login');
};

export const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    handleUnauthorized();
    const error = new Error('Unauthorized');
    error.isUnauthorized = true;
    throw error;
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Update API service to include authentication headers
export const authenticatedApi = {
  // Generic POST with auth
  post: (path, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return safeFetch(path, { method: 'POST', headers, body: JSON.stringify(data) });
  },

  // SWR fetcher
  fetcher: async (url) => safeFetch(url, { headers: authService.getAuthHeader() }),

  // Projects
  getProjects: () => safeFetch('/api/projects', { headers: authService.getAuthHeader() }),
  createProject: (data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return safeFetch('/api/projects', { method: 'POST', headers, body: JSON.stringify(data) });
  },
  getProject: (id) => safeFetch(`/api/projects/${id}`, { headers: authService.getAuthHeader() }),
  updateProject: (id, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return safeFetch(`/api/projects/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
  },
  deleteProject: (id) => safeFetch(`/api/projects/${id}`, { method: 'DELETE', headers: authService.getAuthHeader() }),

  // Labels
  deleteLabel: (id) => safeFetch(`/api/labels/${id}`, { method: 'DELETE', headers: authService.getAuthHeader() }),

  // Images
  getImages: (params) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/api/images${query ? `?${query}` : ''}`, { headers: authService.getAuthHeader() });
  },
  getImage: (id) => safeFetch(`/api/images/${id}`, { headers: authService.getAuthHeader() }),
  deleteImage: (id) => safeFetch(`/api/images/${id}`, { method: 'DELETE', headers: authService.getAuthHeader() }),

  // Annotations
  getAnnotations: (params) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`/api/annotations${query ? `?${query}` : ''}`, { headers: authService.getAuthHeader() });
  },
  getAnnotation: (id) => safeFetch(`/api/annotations/${id}`, { headers: authService.getAuthHeader() }),
  createAnnotation: (data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return safeFetch('/api/annotations', { method: 'POST', headers, body: JSON.stringify(data) });
  },
  updateAnnotation: (id, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return safeFetch(`/api/annotations/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
  },
  deleteAnnotation: (id) => safeFetch(`/api/annotations/${id}`, { method: 'DELETE', headers: authService.getAuthHeader() }),
};

// Test injection exports
export const setRedirectMock = (fn) => { _redirect = fn; };
export const resetRedirectMock = () => { _redirect = redirect; };
