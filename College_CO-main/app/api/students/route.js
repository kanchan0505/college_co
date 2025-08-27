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
      whereClause = "WHERE s.department_id = $1"
      params = [decoded.department_id]
    }

    const result = await query(
      `SELECT s.*, d.name as department_name 
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.id 
       ${whereClause}
       ORDER BY s.roll_number`,
      params,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Students fetch error:", error)
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

    const { roll_number, name,  department_id, semester, section, batch_year } = await request.json()

    // Check if HOD is trying to add student to their department
    if (decoded.role === "hod" && department_id !== decoded.department_id) {
      return NextResponse.json({ error: "Cannot add student to other departments" }, { status: 403 })
    }

    const result = await query(
      `INSERT INTO students (roll_number, name,  department_id, semester, section, batch_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [roll_number, name,  department_id, semester, section, batch_year],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Student creation error:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
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
