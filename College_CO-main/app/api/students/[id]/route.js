
import { query } from "../../../lib/database"
import { verifyToken, getTokenFromRequest } from "../../../lib/auth"
import { NextResponse } from "next/server"


export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!id) return NextResponse.json({ error: "Missing student ID" }, { status: 400 })

    // Expect body to include only: roll_number, name, semester, section, batch_year
    const { roll_number, name, semester, section, batch_year } = await request.json()

    if (!roll_number || !name || !semester || !section || !batch_year) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // If HOD, ensure student belongs to their department
    if (decoded.role === "hod") {
      const student = await query("SELECT department_id FROM students WHERE id = $1", [id])
      if (student.rows.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }
      if (student.rows[0].department_id !== decoded.department_id) {
        return NextResponse.json({ error: "Cannot update student from other departments" }, { status: 403 })
      }
    }

    // Update WITHOUT touching department_id (per your request) and WITHOUT email field
    const result = await query(
      `UPDATE students
       SET roll_number=$1, name=$2, semester=$3, section=$4, batch_year=$5
       WHERE id=$6
       RETURNING *`,
      [roll_number, name, semester, section, batch_year, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Student update error:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract ID from URL (last path segment)
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 })
    }

    // HOD restriction: can only delete students in their own department
    if (decoded.role === "hod") {
      const student = await query("SELECT department_id FROM students WHERE id = $1", [id])
      if (student.rows.length === 0 || student.rows[0].department_id !== decoded.department_id) {
        return NextResponse.json({ error: "Cannot delete student from other departments" }, { status: 403 })
      }
    }

    // Delete student’s marks first (if related table exists)
    await query("DELETE FROM marks WHERE student_id = $1", [id]).catch(() => {})

    // Delete student
    const result = await query("DELETE FROM students WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Student deletion error:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
