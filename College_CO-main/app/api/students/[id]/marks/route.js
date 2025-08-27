import { query } from "../../../../lib/database"
import { verifyToken, getTokenFromRequest } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = params.id

    // Get student's subjects with units and marks
    const result = await query(
      `SELECT s.id, s.name, s.code, s.credits,
              u.name as faculty_name,
              json_agg(
                json_build_object(
                  'id', un.id,
                  'unit_number', un.unit_number,
                  'unit_name', un.unit_name,
                  'max_mst_marks', un.max_mst_marks,
                  'max_assignment_marks', un.max_assignment_marks,
                  'mst_marks', sm.mst_marks,
                  'assignment_marks', sm.assignment_marks
                ) ORDER BY un.unit_number
              ) as units
       FROM subjects s
       JOIN units un ON s.id = un.subject_id
       LEFT JOIN student_marks sm ON un.id = sm.unit_id AND sm.student_id = $1
       LEFT JOIN faculty_subjects fs ON s.id = fs.subject_id
       LEFT JOIN users u ON fs.faculty_id = u.id
       WHERE s.department_id = (SELECT department_id FROM students WHERE id = $1)
       AND s.semester = (SELECT semester FROM students WHERE id = $1)
       GROUP BY s.id, s.name, s.code, s.credits, u.name
       ORDER BY s.name`,
      [studentId],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Student marks fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = params.id
    const { unit_id, mst_marks, assignment_marks } = await request.json()

    // Check if faculty is authorized to enter marks for this unit
    if (decoded.role === "faculty") {
      const authCheck = await query(
        `SELECT 1 FROM units u
         JOIN subjects s ON u.subject_id = s.id
         JOIN faculty_subjects fs ON s.id = fs.subject_id
         WHERE u.id = $1 AND fs.faculty_id = $2`,
        [unit_id, decoded.id],
      )

      if (authCheck.rows.length === 0) {
        return NextResponse.json({ error: "Not authorized to enter marks for this subject" }, { status: 403 })
      }
    }

    const result = await query(
      `INSERT INTO student_marks (student_id, unit_id, mst_marks, assignment_marks, faculty_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, unit_id)
       DO UPDATE SET 
         mst_marks = COALESCE(EXCLUDED.mst_marks, student_marks.mst_marks),
         assignment_marks = COALESCE(EXCLUDED.assignment_marks, student_marks.assignment_marks),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [studentId, unit_id, mst_marks, assignment_marks, decoded.id],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Marks update error:", error)
    return NextResponse.json({ error: "Failed to update marks" }, { status: 500 })
  }
}
