import { query } from "../../../lib/database"
import { verifyToken, getTokenFromRequest } from "../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get("subject_id")
    const unitId = searchParams.get("unit_id")

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 })
    }

    // Get students for this subject based on department and semester
    let studentsQuery = `
      SELECT st.id, st.roll_number, st.name, st.section, st.email,
             sm.mst_marks, sm.assignment_marks
      FROM students st
      LEFT JOIN student_marks sm ON st.id = sm.student_id AND sm.unit_id = $2
      WHERE st.department_id = (SELECT department_id FROM subjects WHERE id = $1)
      AND st.semester = (SELECT semester FROM subjects WHERE id = $1)
    `

    // If faculty, filter by assigned sections
    if (decoded.role === "faculty") {
      studentsQuery += `
        AND st.section = ANY(
          SELECT unnest(sections) 
          FROM faculty_subjects 
          WHERE faculty_id = $3 AND subject_id = $1
        )
      `
    }

    studentsQuery += ` ORDER BY st.roll_number`

    const params = unitId
      ? [subjectId, unitId, ...(decoded.role === "faculty" ? [decoded.id] : [])]
      : [subjectId, null, ...(decoded.role === "faculty" ? [decoded.id] : [])]

    const result = await query(studentsQuery, params)

    return NextResponse.json({
      students: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error("Students fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
