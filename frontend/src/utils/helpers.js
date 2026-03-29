import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateBBox = (points) => {
  if (!points || points.length === 0) return null;
  
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
};

export const calculateArea = (points) => {
  if (!points || points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area / 2);
};

export const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
};

export const centroid = (points) => {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  
  const x = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const y = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  
  return { x, y };
};

export const pointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > point[1]) !== (yj > point[1]))
      && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  return inside;
};

export const scalePoints = (points, scale) => {
  return points.map(p => p.map(v => v * scale));
};

export const translatePoints = (points, dx, dy) => {
  return points.map(p => p.map((v, i) => v + (i === 0 ? dx : dy)));
};

export const exportAnnotations = (annotations) => {
  return JSON.stringify(annotations, null, 2);
};

export const importAnnotations = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse annotations:', e);
    return [];
  }
};
