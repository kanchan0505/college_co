import { query } from "../../lib/database";
import { verifyToken, getTokenFromRequest } from "../../lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let whereClause = "";
    let params = [];

    if (role) {
      whereClause = "WHERE u.role = $1";
      params = [role];
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.created_at, d.name as department_name
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       ${whereClause}
       ORDER BY u.created_at DESC`,
      params
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role, department_id } = await request.json();

    // Hash the password with bcrypt (salt rounds = 10 for security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department_id, created_at`,
      [name, email, hashedPassword, role, department_id || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
