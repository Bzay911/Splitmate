// export const API_BASE_URL = "https://splitmate-backend-6vlo.vercel.app";
export const API_BASE_URL = "http://192.168.1.239:3000";
// Helper function to build API URLs
export function apiUrl(path: string): string {
  // Make sure path doesn't start with a slash when we concatenate
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE_URL}/${normalizedPath}`;
} 