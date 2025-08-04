import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";

export async function GET() {
  await connectDB();

  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    return NextResponse.json({ message: "Użytkownik już istnieje" });
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.create({
    username: "admin",
    email: "admin@example.com",
    password: hashedPassword,
  });

  return NextResponse.json({ message: "Użytkownik admin utworzony" });
}
