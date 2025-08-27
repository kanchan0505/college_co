import { query } from "../../../lib/database"
import { verifyToken, getTokenFromRequest } from "../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT s.id, s.name, s.code, s.semester, s.credits,
              fs.sections, fs.batch_year,
              d.name as department_name
       FROM subjects s
       JOIN faculty_subjects fs ON s.id = fs.subject_id
       JOIN departments d ON s.department_id = d.id
       WHERE fs.faculty_id = $1
       ORDER BY s.semester, s.name`,
      [decoded.id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Faculty subjects fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
