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

    let whereClause = ""
    let params = []

    // Filter based on user role
    if (decoded.role === "hod") {
      whereClause = "WHERE s.department_id = $1"
      params = [decoded.department_id]
    } else if (decoded.role === "faculty") {
      whereClause = `WHERE s.id IN (
        SELECT subject_id FROM faculty_subjects WHERE faculty_id = $1
      )`
      params = [decoded.id]
    }

    const result = await query(
      `SELECT s.*, d.name as department_name,
              u.name as faculty_name
       FROM subjects s 
       LEFT JOIN departments d ON s.department_id = d.id 
       LEFT JOIN faculty_subjects fs ON s.id = fs.subject_id
       LEFT JOIN users u ON fs.faculty_id = u.id
       ${whereClause}
       ORDER BY s.department_id, s.semester, s.name`,
      params,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Subjects fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, code, department_id, semester, credits } = await request.json()

    // Check if HOD is trying to add subject to their department
    if (decoded.role === "hod" && department_id !== decoded.department_id) {
      return NextResponse.json({ error: "Cannot add subject to other departments" }, { status: 403 })
    }

    const result = await query(
      `INSERT INTO subjects (name, code, department_id, semester, credits)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, code, department_id, semester, credits],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Subject creation error:", error)
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
  }
}
