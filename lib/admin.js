import { cookies } from "next/headers";
import { verifyAdminSession, adminCookieName } from "./tokens";

/** Returns true when the request carries a valid admin session cookie. */
export function isAdmin() {
  try {
    const v = cookies().get(adminCookieName())?.value;
    return verifyAdminSession(v);
  } catch {
    return false;
  }
}
