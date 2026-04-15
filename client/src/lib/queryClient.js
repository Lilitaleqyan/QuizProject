
import { QueryClient } from "@tanstack/react-query";


const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8181";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method, url, data) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    
  });
  
  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = ({ on401 }) => async ({ queryKey }) => {
  const token =localStorage.getItem("jwt_token")
  const url = `${API_URL}${queryKey[0]}`;
  const res = await fetch(url, {
    headers: token?{ Authorization: `Bearer ${token}`} : {},
     credentials: "include" });

  if (on401 === "returnNull" && res.status === 401) {
    return null;
  }

  await throwIfResNotOk(res);
  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({on401: "throw"})
     
    },
  },
});
