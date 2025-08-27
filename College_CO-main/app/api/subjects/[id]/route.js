import { query } from "../../../lib/database";
import { verifyToken, getTokenFromRequest } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code, department_id, semester, credits } = await request.json();

    // Ensure HOD can only update within their department
    if (decoded.role === "hod" && department_id !== decoded.department_id) {
      return NextResponse.json({ error: "Cannot update subject in other departments" }, { status: 403 });
    }

    const result = await query(
      `UPDATE subjects 
       SET name = $1, code = $2, department_id = $3, semester = $4, credits = $5
       WHERE id = $6
       RETURNING *`,
      [name, code, department_id, semester, credits,  params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Subject update error:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjectId = params.id;

    // HOD can only delete subjects in their department
    if (decoded.role === "hod") {
      const subjectResult = await query("SELECT department_id FROM subjects WHERE id = $1", [subjectId]);
      if (!subjectResult.rows[0] || subjectResult.rows[0].department_id !== decoded.department_id) {
        return NextResponse.json({ error: "Cannot delete subject in other departments" }, { status: 403 });
      }
    }

    // Delete dependent rows first
    await query("DELETE FROM faculty_subjects WHERE subject_id = $1", [subjectId]);
    await query("DELETE FROM units WHERE subject_id = $1", [subjectId]);

    // Delete the subject
    await query("DELETE FROM subjects WHERE id = $1", [subjectId]);

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Subject deletion error:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}