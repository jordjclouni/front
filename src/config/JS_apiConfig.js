const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000"; // Fallback для локальной разработки

export const API_TOPICS = `${API_URL}/api/topics`;
export const API_SAFE_CELLS = `${API_URL}/api/safeshelves`;
export const API_TEST = `${API_URL}/api/test`;