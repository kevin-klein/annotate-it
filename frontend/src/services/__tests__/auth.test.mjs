import { jest } from '@jest/globals';
import { setRedirectMock, resetRedirectMock } from '../auth.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch globally
global.fetch = jest.fn();

// Import the actual auth module (no mocking needed since we use setRedirectMock)
import * as authModule from '../auth.js';

const { handleUnauthorized, safeFetch, authenticatedApi, authService } = authModule;

describe('handleUnauthorized', () => {
  let redirectCalls = [];
  
  beforeEach(() => {
    localStorageMock.clear();
    redirectCalls = [];
    setRedirectMock((url) => { redirectCalls.push(url); });
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetRedirectMock();
  });

  test('should remove auth_token from localStorage', () => {
    localStorageMock.setItem('auth_token', 'some-token');
    handleUnauthorized();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  test('should redirect to /login', () => {
    handleUnauthorized();
    expect(redirectCalls).toEqual(['/login']);
  });
});

describe('safeFetch', () => {
  let redirectCalls = [];
  
  beforeEach(() => {
    redirectCalls = [];
    setRedirectMock((url) => { redirectCalls.push(url); });
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetRedirectMock();
  });

  test('should return parsed JSON on successful response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' })
    });

    const result = await safeFetch('/api/test');
    expect(result).toEqual({ data: 'test' });
  });

  test('should call handleUnauthorized and throw on 401 response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Session expired', session_expired: true })
    });

    await expect(safeFetch('/api/test')).rejects.toThrow('Unauthorized');

    // Verify handleUnauthorized was called
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(redirectCalls).toEqual(['/login']);
  });

  test('should throw with error message from response body on non-401 error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' })
    });

    await expect(safeFetch('/api/test')).rejects.toThrow('Server error');
  });

  test('should throw with default message when response body has no error field', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ message: 'Service unavailable' })
    });

    await expect(safeFetch('/api/test')).rejects.toThrow('HTTP error! status: 503');
  });

  test('should handle empty response body on error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => { throw new Error('empty'); }
    });

    await expect(safeFetch('/api/test')).rejects.toThrow('HTTP error! status: 502');
  });

  test('should pass options to fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' })
    });

    await safeFetch('/api/test', { method: 'POST', headers: { 'X-Custom': 'value' }, body: JSON.stringify({ key: 'val' }) });
    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'X-Custom': 'value' },
      body: JSON.stringify({ key: 'val' })
    });
  });
});

describe('authService', () => {
  let redirectCalls = [];
  
  beforeEach(() => {
    localStorageMock.clear();
    redirectCalls = [];
    setRedirectMock((url) => { redirectCalls.push(url); });
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetRedirectMock();
  });

  test('getToken should return token from localStorage', () => {
    localStorageMock.setItem('auth_token', 'my-token');
    expect(authService.getToken()).toBe('my-token');
  });

  test('getToken should return null when no token', () => {
    expect(authService.getToken()).toBeNull();
  });

  test('isAuthenticated should return true when token exists', () => {
    localStorageMock.setItem('auth_token', 'my-token');
    expect(authService.isAuthenticated()).toBe(true);
  });

  test('isAuthenticated should return false when no token', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  test('getAuthHeader should return Authorization header when token exists', () => {
    localStorageMock.setItem('auth_token', 'my-token');
    expect(authService.getAuthHeader()).toEqual({ Authorization: 'Bearer my-token' });
  });

  test('getAuthHeader should return empty object when no token', () => {
    expect(authService.getAuthHeader()).toEqual({});
  });

  test('logout should remove token and redirect to /login', async () => {
    localStorageMock.setItem('auth_token', 'my-token');
    global.fetch.mockResolvedValueOnce({ ok: true });

    await authService.logout();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(redirectCalls).toEqual(['/login']);
  });

  test('logout should redirect to /login even when fetch fails', async () => {
    localStorageMock.setItem('auth_token', 'my-token');
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await authService.logout();

    expect(redirectCalls).toEqual(['/login']);
  });

  test('logout should redirect to /login even when fetch returns 401', async () => {
    localStorageMock.setItem('auth_token', 'my-token');
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await authService.logout();

    expect(redirectCalls).toEqual(['/login']);
  });
});

describe('authenticatedApi', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('auth_token', 'test-token');
    jest.clearAllMocks();
  });

  test('post should call safeFetch with correct parameters', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    await authenticatedApi.post('/api/projects', { name: 'Test' });
    expect(global.fetch).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      body: JSON.stringify({ name: 'Test' })
    }));
  });

  test('getProjects should call safeFetch with auth header', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ projects: [] })
    });

    await authenticatedApi.getProjects();
    expect(global.fetch).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
      headers: { Authorization: 'Bearer test-token' }
    }));
  });

  test('createAnnotation should call safeFetch with auth header and body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 })
    });

    await authenticatedApi.createAnnotation({ image_id: 1, label_id: 2, data: [[0, 0], [1, 1]] });
    expect(global.fetch).toHaveBeenCalledWith('/api/annotations', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      body: JSON.stringify({ image_id: 1, label_id: 2, data: [[0, 0], [1, 1]] })
    }));
  });

  test('deleteProject should call safeFetch with DELETE method', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    await authenticatedApi.deleteProject(42);
    expect(global.fetch).toHaveBeenCalledWith('/api/projects/42', expect.objectContaining({
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-token' }
    }));
  });

  test('getImages should include query parameters', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ images: [] })
    });

    await authenticatedApi.getImages({ project_id: '123' });
    expect(global.fetch).toHaveBeenCalledWith('/api/images?project_id=123', expect.any(Object));
  });
});
