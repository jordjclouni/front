const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export const API_URL = BASE_URL;
export const API_TOPICS = `${BASE_URL}/api/topics`;
export const API_SAFE_CELLS = `${BASE_URL}/api/safeshelves`;
export const API_TEST = `${BASE_URL}/api/test`;
