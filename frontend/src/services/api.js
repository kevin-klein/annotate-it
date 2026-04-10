export const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const api = {
  // Generic POST
  post: (path, data) =>
    fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  // Projects
  getProjects: () => fetch('/api/projects').then(res => res.json()),
  createProject: (data) =>
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  getProject: (id) => fetch(`/api/projects/${id}`).then(res => res.json()),
  updateProject: (id, data) =>
    fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  deleteProject: (id) => fetch(`/api/projects/${id}`, { method: 'DELETE' }).then(res => res.json()),
  getProjectStats: (id) => fetch(`/api/projects/${id}/stats`).then(res => res.json()),
  getProjectAnnotations: (id) => fetch(`/api/projects/${id}/annotations`).then(res => res.json()),

  deleteLabel: (id) => fetch(`/api/labels/${id}`, { method: 'DELETE' }).then(res => res.json()),

  // Datasets
  getDatasets: () => fetch('/api/datasets').then(res => res.json()),
  getDataset: (id) => fetch(`/api/datasets/${id}`).then(res => res.json()),
  createDataset: (data) =>
    fetch('/api/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  updateDataset: (id, data) =>
    fetch(`/api/datasets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  deleteDataset: (id) =>
    fetch(`/api/datasets/${id}`, { method: 'DELETE' }).then(res => res.json()),

  // Images
  getImages: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`/api/images${query ? `?${query}` : ''}`).then(res => res.json());
  },
  getImage: (id) => fetch(`/api/images/${id}`).then(res => res.json()),
  getImageAnnotations: (id, params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`/api/annotations?imageId=${id}${query ? `&${query}` : ''}`).then(res => res.json());
  },
  deleteImage: (id) => fetch(`/api/images/${id}`, { method: 'DELETE' }).then(res => res.json()),

  // Annotations
  getAnnotations: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`/api/annotations${query ? `?${query}` : ''}`).then(res => res.json());
  },
  getAnnotation: (id) => fetch(`/api/annotations/${id}`).then(res => res.json()),
  createAnnotation: (data) =>
    fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  updateAnnotation: (id, data) =>
    fetch(`/api/annotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  deleteAnnotation: (id) =>
    fetch(`/api/annotations/${id}`, { method: 'DELETE' }).then(res => res.json()),

  // Upload
  uploadImage: (file, datasetId) => {
    const formData = new FormData();
    formData.append('image', file);
    if (datasetId) formData.append('datasetId', datasetId);
    return fetch('/api/upload', { method: 'POST', body: formData }).then(res => res.json());
  },

  // Stats
  getStats: () => fetch('/api/images/stats').then(res => res.json()),
};
