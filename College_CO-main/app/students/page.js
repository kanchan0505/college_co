"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { Search, Add, Edit, Delete, Upload, Assignment, ExpandMore, BookOutlined } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function Students() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const [formData, setFormData] = useState({
    roll_number: "",
    name: "",
   
    department_id: "",
    semester: 1,
    section: "A",
    batch_year: new Date().getFullYear(),
  })

  const [openMarksDialog, setOpenMarksDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentMarks, setStudentMarks] = useState([])
  const [loadingMarks, setLoadingMarks] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchDepartments()
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students"
      const method = editingStudent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Student ${editingStudent ? "updated" : "created"} successfully`,
          severity: "success",
        })
        fetchStudents()
        handleCloseDialog()
      } else {
        const error = await response.json()
        setSnackbar({
          open: true,
          message: error.error || "Operation failed",
          severity: "error",
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Operation failed",
        severity: "error",
      })
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      roll_number: student.roll_number,
      name: student.name,
     
      department_id: student.department_id,
      semester: student.semester,
      section: student.section,
      batch_year: student.batch_year,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Student deleted successfully",
          severity: "success",
        })
        fetchStudents()
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete student",
        severity: "error",
      })
    }
  }

  const handleViewMarks = async (student) => {
    setSelectedStudent(student)
    setLoadingMarks(true)
    setOpenMarksDialog(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/students/${student.id}/marks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStudentMarks(data)
      }
    } catch (error) {
      console.error("Failed to fetch student marks:", error)
    } finally {
      setLoadingMarks(false)
    }
  }

  const handleSaveMarks = async (subjectId, unitId, markType, value) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/students/${selectedStudent.id}/marks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          unit_id: unitId,
          [markType]: value,
        }),
      })

      if (response.ok) {
        // Update local state
        setStudentMarks((prev) =>
          prev.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  units: subject.units.map((unit) => (unit.id === unitId ? { ...unit, [markType]: value } : unit)),
                }
              : subject,
          ),
        )

        setSnackbar({
          open: true,
          message: "Marks updated successfully",
          severity: "success",
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update marks",
        severity: "error",
      })
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingStudent(null)
    setFormData({
      roll_number: "",
      name: "",
     
      department_id: "",
      semester: 1,
      section: "A",
      batch_year: new Date().getFullYear(),
    })
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !selectedDepartment || student.department_id === selectedDepartment
    const matchesSemester = !selectedSemester || student.semester === selectedSemester
    const matchesSection = !selectedSection || student.section === selectedSection

    return matchesSearch && matchesDepartment && matchesSemester && matchesSection
  })

  const columns = [
    { field: "roll_number", headerName: "Roll Number", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
 
    { field: "department_name", headerName: "Department", width: 200 },
    { field: "semester", headerName: "Semester", width: 100 },
    {
      field: "section",
      headerName: "Section",
      width: 100,
      renderCell: (params) => <Chip label={params.value} size="small" color="primary" />,
    },
    { field: "batch_year", headerName: "Batch Year", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            startIcon={<Assignment />}
            onClick={() => handleViewMarks(params.row)}
            sx={{ mr: 1 }}
            color="primary"
          >
            Marks
          </Button>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          {(user?.role === "admin" || user?.role === "hod") && (
            <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(params.row.id)}>
              Delete
            </Button>
          )}
        </Box>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Students Management
          </Typography>
          <Box display="flex" gap={2}>
            {(user?.role === "admin" || user?.role === "hod") && (
              <>
                <Button variant="outlined" startIcon={<Upload />} href="/students/upload">
                  Upload Excel
                </Button>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                  Add Student
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />

             {user?.role === "admin" && (
  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel>Department</InputLabel>
    <Select
      value={selectedDepartment}
      onChange={(e) => setSelectedDepartment(e.target.value)}
      label="Department"
    >
      <MenuItem value="">All Departments</MenuItem>
      {departments.map((dept) => (
        <MenuItem key={dept.id} value={dept.id}>
          {dept.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)}


              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Semester</InputLabel>
                <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
                  <MenuItem value="">All</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Section</InputLabel>
                <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} label="Section">
                  <MenuItem value="">All</MenuItem>
                  {["A", "B", "C", "D"].map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <CardContent>
            <DataGrid
              rows={filteredStudents}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              autoHeight
              disableSelectionOnClick
              sx={{
                "& .MuiDataGrid-cell:hover": {
                  color: "primary.main",
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Roll Number"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
         {user?.role === "admin" ? (
  <FormControl fullWidth required>
    <InputLabel>Department</InputLabel>
    <Select
      value={formData.department_id}
      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
      label="Department"
    >
      {departments.map((dept) => (
        <MenuItem key={dept.id} value={dept.id}>
          {dept.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
) : (
  <TextField
    label="Department"
    value={departments.find(d => d.id === user.department_id)?.name || ""}
    disabled
    fullWidth
  />
)}

              <Box display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    label="Semester"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    label="Section"
                  >
                    {["A", "B", "C", "D"].map((section) => (
                      <MenuItem key={section} value={section}>
                        {section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Batch Year"
                  type="number"
                  value={formData.batch_year}
                  onChange={(e) => setFormData({ ...formData, batch_year: Number.parseInt(e.target.value) })}
                  fullWidth
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingStudent ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Marks Entry Dialog */}
        <Dialog open={openMarksDialog} onClose={() => setOpenMarksDialog(false)} maxWidth="xl" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">
                Marks Entry - {selectedStudent?.name} ({selectedStudent?.roll_number})
              </Typography>
              <Chip
                label={`${selectedStudent?.department_name} | Sem ${selectedStudent?.semester} | Section ${selectedStudent?.section}`}
                color="primary"
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingMarks ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {studentMarks.length === 0 ? (
                  <Alert severity="info">No subjects assigned to this student yet.</Alert>
                ) : (
                  studentMarks.map((subject) => (
                    <Accordion key={subject.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <BookOutlined />
                          <Typography variant="h6">{subject.name}</Typography>
                          <Chip label={subject.code} size="small" />
                          <Chip
                            label={`Faculty: ${subject.faculty_name || "Not Assigned"}`}
                            size="small"
                            color="secondary"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {subject.units.map((unit) => (
                            <Grid item xs={12} key={unit.id}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Unit {unit.unit_number}: {unit.unit_name}
                                  </Typography>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={4}>
                                      <TextField
                                        label={`MST Marks (Max: ${unit.max_mst_marks})`}
                                        type="number"
                                        value={unit.mst_marks || ""}
                                        onChange={(e) => {
                                          const value = Math.min(Number(e.target.value), unit.max_mst_marks)
                                          handleSaveMarks(subject.id, unit.id, "mst_marks", value)
                                        }}
                                        inputProps={{
                                          min: 0,
                                          max: unit.max_mst_marks,
                                          step: 0.5,
                                        }}
                                        fullWidth
                                        size="small"
                                      />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                      <TextField
                                        label={`Assignment Marks (Max: ${unit.max_assignment_marks})`}
                                        type="number"
                                        value={unit.assignment_marks || ""}
                                        onChange={(e) => {
                                          const value = Math.min(Number(e.target.value), unit.max_assignment_marks)
                                          handleSaveMarks(subject.id, unit.id, "assignment_marks", value)
                                        }}
                                        inputProps={{
                                          min: 0,
                                          max: unit.max_assignment_marks,
                                          step: 0.5,
                                        }}
                                        fullWidth
                                        size="small"
                                      />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Total: {((unit.mst_marks || 0) + (unit.assignment_marks || 0)).toFixed(1)} /{" "}
                                          {unit.max_mst_marks + unit.max_assignment_marks}
                                        </Typography>
                                        <LinearProgress
                                          variant="determinate"
                                          value={
                                            (((unit.mst_marks || 0) + (unit.assignment_marks || 0)) /
                                              (unit.max_mst_marks + unit.max_assignment_marks)) *
                                            100
                                          }
                                          sx={{ mt: 1 }}
                                        />
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Subject Summary */}
                        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                          <Typography variant="h6" gutterBottom>
                            Subject Summary
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">
                                Total MST
                              </Typography>
                              <Typography variant="h6">
                                {subject.units.reduce((sum, unit) => sum + (unit.mst_marks || 0), 0).toFixed(1)} /{" "}
                                {subject.units.reduce((sum, unit) => sum + unit.max_mst_marks, 0)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">
                                Total Assignment
                              </Typography>
                              <Typography variant="h6">
                                {subject.units.reduce((sum, unit) => sum + (unit.assignment_marks || 0), 0).toFixed(1)}{" "}
                                / {subject.units.reduce((sum, unit) => sum + unit.max_assignment_marks, 0)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">
                                Overall Total
                              </Typography>
                              <Typography variant="h6">
                                {subject.units
                                  .reduce((sum, unit) => sum + (unit.mst_marks || 0) + (unit.assignment_marks || 0), 0)
                                  .toFixed(1)}{" "}
                                /{" "}
                                {subject.units.reduce(
                                  (sum, unit) => sum + unit.max_mst_marks + unit.max_assignment_marks,
                                  0,
                                )}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">
                                Percentage
                              </Typography>
                              <Typography
                                variant="h6"
                                color={
                                  (subject.units.reduce(
                                    (sum, unit) => sum + (unit.mst_marks || 0) + (unit.assignment_marks || 0),
                                    0,
                                  ) /
                                    subject.units.reduce(
                                      (sum, unit) => sum + unit.max_mst_marks + unit.max_assignment_marks,
                                      0,
                                    )) *
                                    100 >=
                                  50
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {(
                                  (subject.units.reduce(
                                    (sum, unit) => sum + (unit.mst_marks || 0) + (unit.assignment_marks || 0),
                                    0,
                                  ) /
                                    subject.units.reduce(
                                      (sum, unit) => sum + unit.max_mst_marks + unit.max_assignment_marks,
                                      0,
                                    )) *
                                  100
                                ).toFixed(1)}
                                %
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMarksDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  )
}

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <Students />
    </ProtectedRoute>
  )
}
