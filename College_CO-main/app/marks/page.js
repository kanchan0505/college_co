"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Snackbar,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material"
import { Save, BookOutlined, CheckCircle, Warning, Upload, Download } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function EnterMarks() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [units, setUnits] = useState([])
  const [subjectDetails, setSubjectDetails] = useState(null)

  useEffect(() => {
    fetchFacultySubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectDetails()
      fetchStudentsAndMarks()
    }
  }, [selectedSubject, selectedUnit])

  const fetchFacultySubjects = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/faculty/my-subjects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Token being sent:", token)

      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    }
  }

  const fetchSubjectDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/subjects/${selectedSubject}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSubjectDetails(data)
        setUnits(data.units || [])
      }
    } catch (error) {
      console.error("Failed to fetch subject details:", error)
    }
  }

  const fetchStudentsAndMarks = async () => {
    if (!selectedSubject) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/marks/students?subject_id=${selectedSubject}&unit_id=${selectedUnit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)

        // Initialize marks state
        const marksData = {}
        data.students.forEach((student) => {
          marksData[student.id] = {
            mst_marks: student.mst_marks || "",
            assignment_marks: student.assignment_marks || "",
          }
        })
        setMarks(marksData)
      }
    } catch (error) {
      console.error("Failed to fetch students and marks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkChange = (studentId, markType, value) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [markType]: value,
      },
    }))
  }

  const saveMarks = async () => {
    if (!selectedSubject || !selectedUnit) {
      setSnackbar({
        open: true,
        message: "Please select subject and unit",
        severity: "error",
      })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const marksToSave = Object.entries(marks).map(([studentId, studentMarks]) => ({
        student_id: Number.parseInt(studentId),
        unit_id: Number.parseInt(selectedUnit),
        mst_marks: studentMarks.mst_marks ? Number.parseFloat(studentMarks.mst_marks) : null,
        assignment_marks: studentMarks.assignment_marks ? Number.parseFloat(studentMarks.assignment_marks) : null,
      }))

      const response = await fetch("/api/marks/bulk-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ marks: marksToSave }),
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Marks saved successfully",
          severity: "success",
        })
        fetchStudentsAndMarks() // Refresh data
      } else {
        throw new Error("Failed to save marks")
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save marks",
        severity: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const calculateTotal = (studentId) => {
    const studentMarks = marks[studentId]
    if (!studentMarks) return 0

    const mst = Number.parseFloat(studentMarks.mst_marks) || 0
    const assignment = Number.parseFloat(studentMarks.assignment_marks) || 0
    return mst + assignment
  }

  const calculatePercentage = (studentId) => {
    const selectedUnitData = units.find((u) => u.id === Number.parseInt(selectedUnit))
    if (!selectedUnitData) return 0

    const total = calculateTotal(studentId)
    const maxMarks = selectedUnitData.max_mst_marks + selectedUnitData.max_assignment_marks
    return maxMarks > 0 ? (total / maxMarks) * 100 : 0
  }

  const getSelectedUnitData = () => {
    return units.find((u) => u.id === Number.parseInt(selectedUnit))
  }

  const selectedUnitData = getSelectedUnitData()

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Enter Marks
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Upload />} disabled>
              Import Excel
            </Button>
            <Button variant="outlined" startIcon={<Download />} disabled>
              Export Marks
            </Button>
          </Box>
        </Box>

        {/* Subject and Unit Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Subject</InputLabel>
                  <Select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value)
                      setSelectedUnit("")
                    }}
                    label="Select Subject"
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <BookOutlined />
                          <Box>
                            <Typography variant="body1">{subject.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {subject.code} | Semester {subject.semester} | Sections: {subject.sections?.join(", ")}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!selectedSubject}>
                  <InputLabel>Select Unit</InputLabel>
                  <Select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} label="Select Unit">
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        <Box>
                          <Typography variant="body1">
                            Unit {unit.unit_number}: {unit.unit_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            MST: {unit.max_mst_marks} | Assignment: {unit.max_assignment_marks}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {subjectDetails && selectedUnitData && (
              <Box mt={3} p={2} bgcolor="primary.50" borderRadius={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Subject
                    </Typography>
                    <Typography variant="h6">{subjectDetails.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Unit
                    </Typography>
                    <Typography variant="h6">Unit {selectedUnitData.unit_number}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Max MST Marks
                    </Typography>
                    <Typography variant="h6">{selectedUnitData.max_mst_marks}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Max Assignment Marks
                    </Typography>
                    <Typography variant="h6">{selectedUnitData.max_assignment_marks}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Marks Entry Table */}
        {selectedSubject && selectedUnit && (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Students List ({students.length} students)</Typography>
                <Button variant="contained" startIcon={<Save />} onClick={saveMarks} disabled={saving || loading}>
                  {saving ? "Saving..." : "Save All Marks"}
                </Button>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <LinearProgress sx={{ width: "100%" }} />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell align="center">Roll Number</TableCell>
                        <TableCell align="center">Section</TableCell>
                        <TableCell align="center">
                          MST Marks
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            (Max: {selectedUnitData?.max_mst_marks})
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          Assignment Marks
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            (Max: {selectedUnitData?.max_assignment_marks})
                          </Typography>
                        </TableCell>
                        <TableCell align="center">Total</TableCell>
                        <TableCell align="center">Percentage</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => {
                        const total = calculateTotal(student.id)
                        const percentage = calculatePercentage(student.id)
                        const isPassing = percentage >= 50

                        return (
                          <TableRow key={student.id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ width: 32, height: 32 }}>{student.name.charAt(0)}</Avatar>
                                <Typography variant="body2">{student.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={student.roll_number} size="small" />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={student.section} size="small" color="primary" />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={marks[student.id]?.mst_marks || ""}
                                onChange={(e) => handleMarkChange(student.id, "mst_marks", e.target.value)}
                                inputProps={{
                                  min: 0,
                                  max: selectedUnitData?.max_mst_marks,
                                  step: 0.5,
                                }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={marks[student.id]?.assignment_marks || ""}
                                onChange={(e) => handleMarkChange(student.id, "assignment_marks", e.target.value)}
                                inputProps={{
                                  min: 0,
                                  max: selectedUnitData?.max_assignment_marks,
                                  step: 0.5,
                                }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold">
                                {total.toFixed(1)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={isPassing ? "success.main" : "error.main"}
                              >
                                {percentage.toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={isPassing ? "Passing" : "Below 50%"}>
                                <IconButton size="small">
                                  {isPassing ? <CheckCircle color="success" /> : <Warning color="error" />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {students.length > 0 && (
                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="h6" gutterBottom>
                    Class Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Students
                      </Typography>
                      <Typography variant="h6">{students.length}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Marks Entered
                      </Typography>
                      <Typography variant="h6">
                        {Object.values(marks).filter((m) => m.mst_marks || m.assignment_marks).length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Passing Students
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {students.filter((s) => calculatePercentage(s.id) >= 50).length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Class Average
                      </Typography>
                      <Typography variant="h6">
                        {students.length > 0
                          ? (students.reduce((sum, s) => sum + calculatePercentage(s.id), 0) / students.length).toFixed(
                              1,
                            )
                          : 0}
                        %
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedSubject && (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <BookOutlined sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a Subject to Start Entering Marks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a subject and unit from the dropdowns above to begin entering student marks.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

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

export default function EnterMarksPage() {
  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <EnterMarks />
    </ProtectedRoute>
  )
}
