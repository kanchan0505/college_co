import { verifyToken, getTokenFromRequest } from "../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const semester = searchParams.get("semester")

    // Mock analytics data for now
    const analyticsData = {
      overallPerformance: 78.5,
      nbaCompliance: 75,
      courseOutcomes: 82,
      atRiskStudents: 15,
      departmentPerformance: [
        { name: "CSE", students: 120, avgMarks: 78, nbaCompliance: 85 },
        { name: "ECE", students: 95, avgMarks: 75, nbaCompliance: 80 },
        { name: "MECH", students: 110, avgMarks: 72, nbaCompliance: 75 },
        { name: "CIVIL", students: 85, avgMarks: 70, nbaCompliance: 70 },
      ],
      semesterWisePerformance: [
        { semester: "Sem 1", pass: 85, fail: 15 },
        { semester: "Sem 2", pass: 88, fail: 12 },
        { semester: "Sem 3", pass: 82, fail: 18 },
        { semester: "Sem 4", pass: 90, fail: 10 },
      ],
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
