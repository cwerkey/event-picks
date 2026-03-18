
const API = "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");

export const apiFetch = async (url, options = {}) => {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.json();
};
