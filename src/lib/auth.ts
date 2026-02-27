import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "nebula_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;
const ISSUER = "nebula-notes";

export type AdminSession = {
  email: string;
};

function getRequiredEnv(name: "AUTH_SECRET") {
  const value = process.env[name];
  return value?.trim() ? value : null;
}

function getSecretKey() {
  const secret = getRequiredEnv("AUTH_SECRET");
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured() {
  return Boolean(getRequiredEnv("AUTH_SECRET"));
}

export async function createAdminSession(email: string) {
  const secretKey = getSecretKey();

  if (!secretKey) {
    throw new Error("AUTH_SECRET is missing.");
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: ISSUER,
    });

    if (typeof payload.email !== "string") {
      return null;
    }

    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
