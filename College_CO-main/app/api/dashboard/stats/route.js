import { query } from '../../../lib/database'
import { verifyToken, getTokenFromRequest } from '../../../lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let stats = {}

    if (decoded.role === 'admin') {
      // Admin stats
      const departmentsResult = await query('SELECT COUNT(*) FROM departments')
      const facultyResult = await query("SELECT COUNT(*) FROM users WHERE role = 'faculty'")
      const studentsResult = await query('SELECT COUNT(*) FROM students')
      const subjectsResult = await query('SELECT COUNT(*) FROM subjects')

      stats = {
        departments: parseInt(departmentsResult.rows[0].count),
        faculty: parseInt(facultyResult.rows[0].count),
        students: parseInt(studentsResult.rows[0].count),
        subjects: parseInt(subjectsResult.rows[0].count)
      }
    } else if (decoded.role === 'hod') {
      // HOD stats for their department
      const facultyResult = await query(
        "SELECT COUNT(*) FROM users WHERE role = 'faculty' AND department_id = $1",
        [decoded.department_id]
      )
      const studentsResult = await query(
        'SELECT COUNT(*) FROM students WHERE department_id = $1',
        [decoded.department_id]
      )
      const subjectsResult = await query(
        'SELECT COUNT(*) FROM subjects WHERE department_id = $1',
        [decoded.department_id]
      )

      stats = {
        departmentFaculty: parseInt(facultyResult.rows[0].count),
        departmentStudents: parseInt(studentsResult.rows[0].count),
        departmentSubjects: parseInt(subjectsResult.rows[0].count),
        nbaCompliance: 75 // Mock data
      }
    } else if (decoded.role === 'faculty') {
      // Faculty stats
      const subjectsResult = await query(
        'SELECT COUNT(*) FROM faculty_subjects WHERE faculty_id = $1',
        [decoded.id]
      )
      
      const studentsResult = await query(
        `SELECT COUNT(DISTINCT s.id) 
         FROM students s 
         JOIN faculty_subjects fs ON s.department_id = (
           SELECT department_id FROM subjects WHERE id = fs.subject_id
         )
         WHERE fs.faculty_id = $1`,
        [decoded.id]
      )

      stats = {
        assignedSubjects: parseInt(subjectsResult.rows[0].count),
        totalStudents: parseInt(studentsResult.rows[0].count),
        marksProgress: 65 // Mock data
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
