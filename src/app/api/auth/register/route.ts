import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/validators/register.schema";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse request body
    const body = await req.json();

    // 2️⃣ Validate input (Zod)
    const validatedData = registerSchema.parse(body);

    const { name, email, password, role } = validatedData;

    // 3️⃣ Connect to DB
    await connectDB();

    // 4️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 } // Conflict
      );
    }

    // 5️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 6️⃣ Create user
    await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    // 7️⃣ Success response
    return NextResponse.json(
      { message: "Account created successfully. Please log in." },
      { status: 201 }
    );
  } catch (error: any) {
    // Zod validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}