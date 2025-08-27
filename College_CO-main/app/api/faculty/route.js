import { query } from "../../lib/database";
import { verifyToken, getTokenFromRequest } from "../../lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Number of salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = "WHERE u.role = 'faculty'";
    let params = [];

    // Filter based on user role
    if (decoded.role === "hod") {
      whereClause += " AND u.department_id = $1";
      params = [decoded.department_id];
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.department_id, u.created_at, 
              d.name as department_name,
              (SELECT COUNT(*) FROM faculty_subjects fs WHERE fs.faculty_id = u.id) as subject_count
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       ${whereClause}
       ORDER BY u.name`,
      params,
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Faculty fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, department_id } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !department_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if HOD is trying to add faculty to their department
    if (decoded.role === "hod" && department_id !== decoded.department_id) {
      return NextResponse.json({ error: "Cannot add faculty to other departments" }, { status: 403 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, 'faculty', $4)
       RETURNING id, name, email, role, department_id, created_at`,
      [name, email, hashedPassword, department_id],
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Faculty creation error:", error);
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, email, password, department_id } = await request.json();

    // Validate required fields
    if (!id || !name || !email || !department_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if HOD is trying to edit faculty in their department
    if (decoded.role === "hod") {
      const faculty = await query("SELECT department_id FROM users WHERE id = $1 AND role = 'faculty'", [id]);
      if (faculty.rows.length === 0 || faculty.rows[0].department_id !== decoded.department_id) {
        return NextResponse.json({ error: "Cannot edit faculty from other departments" }, { status: 403 });
      }
    }

    // Prepare query and values
    let queryStr = `UPDATE users SET name = $1, email = $2, department_id = $3`;
    const values = [name, email, department_id];

    // Handle password update if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      queryStr += `, password_hash = $${values.length + 1}`;
      values.push(hashedPassword);
    }

    queryStr += ` WHERE id = $${values.length + 1} AND role = 'faculty' RETURNING id, name, email, role, department_id, created_at`;
    values.push(id);

    const result = await query(queryStr, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Faculty update error:", error);
    return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 });
  }
}
export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing faculty ID" }, { status: 400 });
    }

    // Check if HOD is trying to delete faculty from their department
    if (decoded.role === "hod") {
      const faculty = await query("SELECT department_id FROM users WHERE id = $1 AND role = 'faculty'", [id]);
      if (faculty.rows.length === 0 || faculty.rows[0].department_id !== decoded.department_id) {
        return NextResponse.json({ error: "Cannot delete faculty from other departments" }, { status: 403 });
      }
    }

    // Delete associated faculty subjects first
    await query("DELETE FROM faculty_subjects WHERE faculty_id = $1", [id]);

    // Delete the faculty
    const result = await query(
      "DELETE FROM users WHERE id = $1 AND role = 'faculty' RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Faculty deletion error:", error);
    return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 });
  }
}