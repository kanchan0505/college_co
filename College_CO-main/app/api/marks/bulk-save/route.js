import { query } from "../../../lib/database"
import { verifyToken, getTokenFromRequest } from "../../../lib/auth"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { marks } = await request.json()

    if (!marks || !Array.isArray(marks)) {
      return NextResponse.json({ error: "Invalid marks data" }, { status: 400 })
    }

    let successful = 0
    let failed = 0
    const errors = []

    for (const mark of marks) {
      try {
        const { student_id, unit_id, mst_marks, assignment_marks } = mark

        // Verify faculty has permission to enter marks for this unit
        if (decoded.role === "faculty") {
          const permissionCheck = await query(
            `SELECT 1 FROM units u
             JOIN subjects s ON u.subject_id = s.id
             JOIN faculty_subjects fs ON s.id = fs.subject_id
             WHERE u.id = $1 AND fs.faculty_id = $2`,
            [unit_id, decoded.id],
          )

          if (permissionCheck.rows.length === 0) {
            failed++
            errors.push(`No permission to enter marks for unit ${unit_id}`)
            continue
          }
        }

        // Insert or update marks
        await query(
          `INSERT INTO student_marks (student_id, unit_id, mst_marks, assignment_marks, faculty_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (student_id, unit_id)
           DO UPDATE SET 
             mst_marks = EXCLUDED.mst_marks,
             assignment_marks = EXCLUDED.assignment_marks,
             faculty_id = EXCLUDED.faculty_id,
             updated_at = CURRENT_TIMESTAMP`,
          [student_id, unit_id, mst_marks, assignment_marks, decoded.id],
        )

        successful++
      } catch (error) {
        failed++
        errors.push(`Failed to save marks for student ${mark.student_id}: ${error.message}`)
      }
    }

    return NextResponse.json({
      successful,
      failed,
      errors: errors.slice(0, 10), // Limit error messages
    })
  } catch (error) {
    console.error("Bulk marks save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
