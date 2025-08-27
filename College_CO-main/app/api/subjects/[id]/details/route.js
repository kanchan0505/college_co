import { query } from "../../../../lib/database";
import { verifyToken, getTokenFromRequest } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    // Allow admin, hod, and faculty
    if (!decoded || !["admin", "hod", "faculty"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { units } = await request.json(); // Only expecting units for this route

    // HOD: ensure they can only update subjects in their department
    if (decoded.role === "hod") {
      const subjectCheck = await query(
        "SELECT department_id FROM subjects WHERE id = $1",
        [params.id]
      );
      if (!subjectCheck.rows[0] || subjectCheck.rows[0].department_id !== decoded.department_id) {
        return NextResponse.json({ error: "Cannot update units for subjects outside your department" }, { status: 403 });
      }
    }

    // Faculty: ensure they can only update units for assigned subjects
    if (decoded.role === "faculty") {
      const check = await query(
        "SELECT 1 FROM faculty_subjects WHERE faculty_id = $1 AND subject_id = $2",
        [decoded.id, params.id]
      );
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Cannot update units for unassigned subject" }, { status: 403 });
      }
    }

    // Update or insert units for the subject
    for (const unit of units) {
      await query(
        `INSERT INTO units (subject_id, unit_number, unit_name, max_mst_marks, max_assignment_marks)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (subject_id, unit_number) 
         DO UPDATE SET unit_name = $3, max_mst_marks = $4, max_assignment_marks = $5`,
        [params.id, unit.unit_number, unit.unit_name, unit.max_mst_marks, unit.max_assignment_marks]
      );
    }

    return NextResponse.json({ message: "Units updated successfully" });
  } catch (error) {
    console.error("Units update error:", error);
    return NextResponse.json({ error: "Failed to update units" }, { status: 500 });
  }
}


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


