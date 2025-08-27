import { query } from '../../../lib/database'
import { verifyToken, getTokenFromRequest } from '../../../lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // ✅ Get token and verify
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !['admin', 'hod'].includes(decoded.role)) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { students } = await request.json()

    if (!students || !Array.isArray(students)) {
      console.log('Invalid student data received:', students)
      return NextResponse.json({ error: 'Invalid student data' }, { status: 400 })
    }

    console.log(`Starting upload of ${students.length} students by ${decoded.role}`)

    let successful = 0
    let failed = 0
    const errors = []

    // Get department mappings
    const departmentResult = await query('SELECT id, name FROM departments')
    const departmentMap = {}
    departmentResult.rows.forEach(dept => {
      departmentMap[dept.name.toLowerCase()] = dept.id
    })

    console.log('Department mappings:', departmentMap)

    for (const student of students) {
      try {
        console.log('Processing student:', student)

        // Map department name to ID
        const departmentId = departmentMap[student.department.toLowerCase()]
        if (!departmentId) {
          failed++
          const msg = `Department "${student.department}" not found for ${student.roll_number}`
          errors.push(msg)
          console.error(msg)
          continue
        }

        // HOD cannot upload students outside their department
        if (decoded.role === 'hod' && departmentId !== decoded.department_id) {
          failed++
          const msg = `HOD cannot upload student ${student.roll_number} - not in your department`
          errors.push(msg)
          console.error(msg)
          continue
        }

        // ✅ Insert student
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
        console.log(`Successfully inserted/updated student: ${student.roll_number}`)
      } catch (error) {
        failed++
        const msg = `Failed to insert ${student.roll_number}: ${error.message}`
        errors.push(msg)
        console.error(msg, error)
      }
    }

    console.log(`Upload finished. Successful: ${successful}, Failed: ${failed}`)

    return NextResponse.json({
      successful,
      failed,
      errors: errors.slice(0, 20) // return first 20 errors
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
