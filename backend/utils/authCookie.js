const isProduction = process.env.NODE_ENV === "production";

const cookieName = process.env.COOKIE_NAME || "wavebuy_token";

export const setAuthCookie = (res, token) => {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};