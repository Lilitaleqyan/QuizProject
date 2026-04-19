
const API_URL = import.meta.env.VITE_API_BASE_URL;

const CURRENT_USER_KEY = "library_current_user";


function decodeJwtPayload(token) {
  try {
    const [, payloadBase64] = token.split(".");
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode JWT payload", err);
    return {};
  }
}

export async function registration(player) {
  const response = await fetch(`${API_URL}/api/auth/registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  })
  if (!response.ok) {
    let errorMessage = "Registration failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (err) {
      throw new Error(err);
    }
  }

  try {
    let data = await response.json();
      return data;
  } catch (err) {
    throw new Error(err)
  }


}

export async function signIn(userName, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
    credentials: "include"
  });

  if (!res.ok) {
    let errorMessage = "Invalid username or password";
    console.log(errorMessage)

    try {
      const errorData = await res.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch (err) {
      console.log(err);
    }
    throw new Error(errorMessage);
  }
  const data = await res.json();
  const jwt = data?.jwt;
  const userId = data?.id;
  const responseUsername = data?.userName;
  const responseRole = data?.role;


  if (!jwt) {
    throw new Error("No token received from server");
  }

  const payload = decodeJwtPayload(jwt);

  const resolvedUsername = responseUsername ||
    username ||
    payload?.username ||
    payload?.sub ||
    "user";

  const roleRaw = responseRole ||
    payload?.role ||
    (Array.isArray(payload?.roles) ? payload.roles[0] : undefined) ||
    (typeof payload?.sub === "string" && payload.sub.toLowerCase().includes("admin")
      ? "ADMIN"
      : "USER");

  const finalRole = typeof roleRaw === "string" ? roleRaw : "USER";

  const finalUserId = userId ||
    payload?.id

  localStorage.setItem("jwt_token", jwt);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    id: finalUserId,
    userName: resolvedUsername,
    role: finalRole
  }));
  return data;
}





export function getCurrentUser() {
  if (stored) {
    try {
      const parsed = JSON.parse(CURRENT_USER_KEY);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length) {
        return parsed;
      }
    } catch (_err) {
    }
  }

  const token = localStorage.getItem("jwt_token");
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const username =
    payload?.username ||
    payload?.sub ||
    "user";

  const roleRaw =
    payload?.role ||
    (Array.isArray(payload?.roles) ? payload.roles[0] : undefined) ||
    (typeof payload?.sub === "string" && payload.sub.toLowerCase().includes("admin")
      ? "ADMIN"
      : "USER");

  const role = typeof roleRaw === "string" ? roleRaw : "USER";
  const userId = payload?.id ||
    payload?.userId ||
    payload?.user_id ||
    payload?.sub ||
    payload?.name;

  const reconstructed = { username, role, id: userId };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(reconstructed));
  return reconstructed;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role?.toLowerCase() === "admin";
}



export async function logout() {
  const token = localStorage.getItem("jwt_token");
  try {
  await fetch(`${API_URL}/api/auth/log_out`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    credentials: "include"
  });}
  catch(err) {
    throw(err);
  }

  localStorage.removeItem("jwt_token")
  localStorage.removeItem(CURRENT_USER_KEY);
}
