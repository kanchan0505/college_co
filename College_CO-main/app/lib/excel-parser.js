import * as XLSX from 'xlsx'

export function parseStudentExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // Process and validate student data
        const students = jsonData.map((row, index) => {
          // ✅ Expected columns: Roll Number, Name, Department, Semester, Section, Batch Year
          const student = {
            roll_number: row['Roll Number'] || row['roll_number'] || '',
            name: row['Name'] || row['name'] || '',
            department: row['Department'] || row['department'] || '',
            semester: parseInt(row['Semester'] || row['semester'] || 1),
            section: row['Section'] || row['section'] || 'A',
            batch_year: parseInt(row['Batch Year'] || row['batch_year'] || new Date().getFullYear()),
            rowIndex: index + 2 // Excel row number (starting from 2)
          }
          
          // Validation
          const errors = []
          if (!student.roll_number) errors.push('Roll Number is required')
          if (!student.name) errors.push('Name is required')
          if (!student.department) errors.push('Department is required')
          if (isNaN(student.semester)) errors.push('Invalid semester')
          if (isNaN(student.batch_year)) errors.push('Invalid batch year')
          
          return {
            ...student,
            errors,
            isValid: errors.length === 0
          }
        })
        
        resolve(students)
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error.message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

export function generateStudentTemplate() {
  // ✅ Removed Email from template
  const template = [
    {
      'Roll Number': 'CSE2021001',
      'Name': 'John Doe',
      'Department': 'Computer Science Engineering',
      'Semester': 3,
      'Section': 'A',
      'Batch Year': 2021
    },
    {
      'Roll Number': 'CSE2021002',
      'Name': 'Jane Smith',
      'Department': 'Computer Science Engineering',
      'Semester': 3,
      'Section': 'B',
      'Batch Year': 2021
    }
  ]
  
  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
}
