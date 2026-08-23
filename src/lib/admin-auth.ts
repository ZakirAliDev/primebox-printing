import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "pbp_admin";

export function adminSecret() {
  return process.env.ADMIN_PASSWORD || "primebox-admin";
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === adminSecret();
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(password: string) {
  if (password !== adminSecret()) {
    return false;
  }
  const jar = await cookies();
  jar.set(COOKIE, adminSecret(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return true;
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
