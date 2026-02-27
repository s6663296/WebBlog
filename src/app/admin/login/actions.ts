"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminSession, isAuthConfigured } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().trim().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

export async function loginAction(formData: FormData) {
  if (!isAuthConfigured()) {
    redirect("/admin/login?error=config");
  }

  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    redirect("/admin/login?error=no_admin");
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  const valid = adminUser
    ? await bcrypt.compare(parsed.data.password, adminUser.passwordHash)
    : false;

  if (!valid) {
    redirect("/admin/login?error=credentials");
  }

  await createAdminSession(normalizedEmail);
  redirect("/admin");
}
