export function isAdmin(req) {
  return req.headers.cookie?.includes('dashboard_auth=ok');
}

export function getUserFromCookie(req) {
  const match = req.headers.cookie?.match(/user_auth=([^;]+)/);
  return match ? match[1] : null;
}
