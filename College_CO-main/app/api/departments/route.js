import { query } from "../../lib/database"
import { verifyToken, getTokenFromRequest } from "../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT d.*, u.name as hod_name,
              (SELECT COUNT(*) FROM users WHERE department_id = d.id AND role = 'faculty') as faculty_count,
              (SELECT COUNT(*) FROM students WHERE department_id = d.id) as student_count
       FROM departments d 
       LEFT JOIN users u ON d.hod_id = u.id 
       ORDER BY d.name`,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Departments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, code, hod_id, nba_threshold } = await request.json()

    const result = await query(
      `INSERT INTO departments (name, code, hod_id, nba_threshold)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, code, hod_id || null, nba_threshold],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Department creation error:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
