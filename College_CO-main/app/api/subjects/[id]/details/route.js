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

    const subjectId = params.id

    // Get subject details
    const subjectResult = await query(
      `SELECT s.*, d.name as department_name
       FROM subjects s
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [subjectId],
    )

    if (subjectResult.rows.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Get units for this subject
    const unitsResult = await query(
      `SELECT * FROM units 
       WHERE subject_id = $1 
       ORDER BY unit_number`,
      [subjectId],
    )

    const subject = subjectResult.rows[0]
    subject.units = unitsResult.rows

    return NextResponse.json(subject)
  } catch (error) {
    console.error("Subject details fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { units } = await request.json()
    const subjectId = params.id

    if (!units || !Array.isArray(units)) {
      return NextResponse.json({ error: "Invalid units data" }, { status: 400 })
    }

    // Remove old units
    await query("DELETE FROM units WHERE subject_id = $1", [subjectId])

    // Insert new units
    for (const unit of units) {
      await query(
        `INSERT INTO units (subject_id, unit_number, unit_name, max_mst_marks, max_assignment_marks)
         VALUES ($1, $2, $3, $4, $5)`,
        [subjectId, unit.unit_number, unit.unit_name, unit.max_mst_marks, unit.max_assignment_marks]
      )
    }

    return NextResponse.json({ message: "Units updated successfully" })
  } catch (error) {
    console.error("Update units error:", error)
    return NextResponse.json({ error: "Failed to update units" }, { status: 500 })
  }
}
