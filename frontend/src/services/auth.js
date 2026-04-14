// Store authentication token in localStorage
const TOKEN_KEY = 'auth_token';

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
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    return fetch('/api/logout', { method: 'DELETE' });
  },

  // Get current authentication token
  getToken: () => localStorage.getItem(TOKEN_KEY),

  // Check if user is authenticated
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  // Get authentication header
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Update API service to include authentication headers
export const authenticatedApi = {
  // Generic POST with auth
  post: (path, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },

  fetcher: async (url) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Projects
  getProjects: () => fetch('/api/projects', { headers: authService.getAuthHeader() }).then(res => res.json()),
  createProject: (data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch('/api/projects', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
  getProject: (id) => fetch(`/api/projects/${id}`, { headers: authService.getAuthHeader() }).then(res => res.json()),
  updateProject: (id, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
  deleteProject: (id) => fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: authService.getAuthHeader()
  }).then(res => res.json()),
  getProjectStats: (id) => fetch(`/api/projects/${id}/stats`, { headers: authService.getAuthHeader() }).then(res => res.json()),
  getProjectAnnotations: (id) => fetch(`/api/projects/${id}/annotations`, { headers: authService.getAuthHeader() }).then(res => res.json()),

  // Labels
  deleteLabel: (id) => fetch(`/api/labels/${id}`, {
    method: 'DELETE',
    headers: authService.getAuthHeader()
  }).then(res => res.json()),

  // Datasets
  getDatasets: () => fetch('/api/datasets', { headers: authService.getAuthHeader() }).then(res => res.json()),
  getDataset: (id) => fetch(`/api/datasets/${id}`, { headers: authService.getAuthHeader() }).then(res => res.json()),
  createDataset: (data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch('/api/datasets', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
  updateDataset: (id, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch(`/api/datasets/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
  deleteDataset: (id) => fetch(`/api/datasets/${id}`, {
    method: 'DELETE',
    headers: authService.getAuthHeader()
  }).then(res => res.json()),

  // Images
  getImages: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`/api/images${query ? `?${query}` : ''}`, { headers: authService.getAuthHeader() }).then(res => res.json());
  },
  getImage: (id) => fetch(`/api/images/${id}`, { headers: authService.getAuthHeader() }).then(res => res.json()),
  getImageAnnotations: (id, params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`/api/annotations?imageId=${id}${query ? `&${query}` : ''}`, { headers: authService.getAuthHeader() }).then(res => res.json());
  },
  deleteImage: (id) => fetch(`/api/images/${id}`, {
    method: 'DELETE',
    headers: authService.getAuthHeader()
  }).then(res => res.json()),

  // Annotations
  getAnnotations: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`/api/annotations${query ? `?${query}` : ''}`, { headers: authService.getAuthHeader() }).then(res => res.json());
  },
  getAnnotation: (id) => fetch(`/api/annotations/${id}`, { headers: authService.getAuthHeader() }).then(res => res.json()),
  createAnnotation: (data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch('/api/annotations', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
  updateAnnotation: (id, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
    return fetch(`/api/annotations/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
  deleteAnnotation: (id) => fetch(`/api/annotations/${id}`, {
    method: 'DELETE',
    headers: authService.getAuthHeader()
  }).then(res => res.json()),

  // Upload
  uploadImage: (file, datasetId) => {
    const formData = new FormData();
    formData.append('image', file);
    if (datasetId) formData.append('datasetId', datasetId);
    const headers = authService.getAuthHeader();
    return fetch('/api/upload', { method: 'POST', body: formData, headers }).then(res => res.json());
  },

  // Stats
  getStats: () => fetch('/api/images/stats', { headers: authService.getAuthHeader() }).then(res => res.json()),
};
