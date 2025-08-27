import { query } from '../../../lib/database'
import { verifyToken, getTokenFromRequest } from '../../../lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)
    
    if (!decoded || !['admin', 'hod'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { students } = await request.json()

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid student data' }, { status: 400 })
    }

    let successful = 0
    let failed = 0
    const errors = []

    // Get department mappings
    const departmentResult = await query('SELECT id, name FROM departments')
    const departmentMap = {}
    departmentResult.rows.forEach(dept => {
      departmentMap[dept.name.toLowerCase()] = dept.id
    })

    for (const student of students) {
      try {
        // Map department name to ID
        const departmentId = departmentMap[student.department.toLowerCase()]
        
        if (!departmentId) {
          failed++
          errors.push(`Department "${student.department}" not found for ${student.roll_number}`)
          continue
        }

        // Check if HOD is trying to upload students outside their department
        if (decoded.role === 'hod' && departmentId !== decoded.department_id) {
          failed++
          errors.push(`Cannot upload student ${student.roll_number} - not in your department`)
          continue
        }

        // ✅ Insert student (email removed)
        await query(
          `INSERT INTO students (roll_number, name, department_id, semester, section, batch_year)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (roll_number) DO UPDATE SET
           name = EXCLUDED.name,
           department_id = EXCLUDED.department_id,
           semester = EXCLUDED.semester,
           section = EXCLUDED.section,
           batch_year = EXCLUDED.batch_year`,
          [
            student.roll_number,
            student.name,
            departmentId,
            student.semester,
            student.section,
            student.batch_year
          ]
        )

        successful++
      } catch (error) {
        failed++
        errors.push(`Failed to insert ${student.roll_number}: ${error.message}`)
      }
    }

    return NextResponse.json({
      successful,
      failed,
      errors: errors.slice(0, 10) // Return first 10 errors
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
