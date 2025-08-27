// Mock data for marks functionality
export const mockSubjects = [
  {
    id: 1,
    name: "Data Structures and Algorithms",
    code: "CS301",
    semester: 3,
    credits: 4,
    sections: ["A", "B"],
    batch_year: 2021,
    department_name: "Computer Science Engineering",
    units: [
      {
        id: 1,
        unit_number: 1,
        unit_name: "Introduction to Data Structures",
        max_mst_marks: 20,
        max_assignment_marks: 10,
      },
      { id: 2, unit_number: 2, unit_name: "Arrays and Linked Lists", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 3, unit_number: 3, unit_name: "Stacks and Queues", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 4, unit_number: 4, unit_name: "Trees and Graphs", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 5, unit_number: 5, unit_name: "Sorting and Searching", max_mst_marks: 20, max_assignment_marks: 10 },
    ],
  },
  {
    id: 2,
    name: "Database Management Systems",
    code: "CS302",
    semester: 3,
    credits: 3,
    sections: ["A"],
    batch_year: 2021,
    department_name: "Computer Science Engineering",
    units: [
      { id: 6, unit_number: 1, unit_name: "Database Fundamentals", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 7, unit_number: 2, unit_name: "ER Modeling", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 8, unit_number: 3, unit_name: "SQL and Queries", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 9, unit_number: 4, unit_name: "Normalization", max_mst_marks: 20, max_assignment_marks: 10 },
      { id: 10, unit_number: 5, unit_name: "Transaction Management", max_mst_marks: 20, max_assignment_marks: 10 },
    ],
  },
]

export const mockStudents = [
  { id: 1, roll_number: "CSE2021001", name: "John Doe", section: "A", email: "john@college.edu" },
  { id: 2, roll_number: "CSE2021002", name: "Jane Smith", section: "A", email: "jane@college.edu" },
  { id: 3, roll_number: "CSE2021003", name: "Bob Johnson", section: "B", email: "bob@college.edu" },
  { id: 4, roll_number: "CSE2021004", name: "Alice Brown", section: "A", email: "alice@college.edu" },
  { id: 5, roll_number: "CSE2021005", name: "Charlie Wilson", section: "B", email: "charlie@college.edu" },
]

export const mockMarks = {
  // student_id_unit_id: { mst_marks, assignment_marks }
  "1_1": { mst_marks: 18, assignment_marks: 9 },
  "1_2": { mst_marks: 16, assignment_marks: 8 },
  "2_1": { mst_marks: 19, assignment_marks: 10 },
  "3_1": { mst_marks: 15, assignment_marks: 7 },
}

export function getMockFacultySubjects(facultyId) {
  return mockSubjects
}

export function getMockSubjectDetails(subjectId) {
  return mockSubjects.find((s) => s.id === Number.parseInt(subjectId))
}

export function getMockStudentsWithMarks(subjectId, unitId) {
  return mockStudents.map((student) => ({
    ...student,
    mst_marks: mockMarks[`${student.id}_${unitId}`]?.mst_marks || null,
    assignment_marks: mockMarks[`${student.id}_${unitId}`]?.assignment_marks || null,
  }))
}
