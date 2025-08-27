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
  Grid,
  Chip,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { Add, Edit, Delete, Search, Assignment } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function Subjects() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openUnitsDialog, setOpenUnitsDialog] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department_id: "",
    semester: 1,
    credits: 3,
  
  })

  const [units, setUnits] = useState([
    { unit_number: 1, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
    { unit_number: 2, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
    { unit_number: 3, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
    { unit_number: 4, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
    { unit_number: 5, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
  ])

  useEffect(() => {
    fetchSubjects()
    fetchDepartments()
  }, [])

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
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
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : "/api/subjects"
      const method = editingSubject ? "PUT" : "POST"

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
          message: `Subject ${editingSubject ? "updated" : "created"} successfully`,
          severity: "success",
        })
        fetchSubjects()
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

const handleSaveUnits = async () => {
  try {
    const token = localStorage.getItem("token")
    const fixedUnits = units.map((u, index) => ({
      ...u,
      unit_number: index + 1,
      max_mst_marks: 20,
      max_assignment_marks: 10,
    }))

    const response = await fetch(`/api/subjects/${selectedSubject.id}/details`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ units: fixedUnits }),
    })

    if (response.ok) {
      setSnackbar({
        open: true,
        message: "Units updated successfully",
        severity: "success",
      })
      setOpenUnitsDialog(false)
      fetchSubjects()
    } else {
      const error = await response.json()
      setSnackbar({
        open: true,
        message: error.error || "Failed to update units",
        severity: "error",
      })
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: "Failed to update units",
      severity: "error",
    })
  }
}


  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      department_id: subject.department_id,
      semester: subject.semester,
      credits: subject.credits,
   
    })
    setOpenDialog(true)
  }

  const handleManageUnits = (subject) => {
    setSelectedSubject(subject)
    if (subject.units && subject.units.length > 0) {
      setUnits(subject.units)
    } else {
      setUnits([
        { unit_number: 1, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
        { unit_number: 2, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
        { unit_number: 3, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
        { unit_number: 4, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
        { unit_number: 5, unit_name: "", max_mst_marks: 20, max_assignment_marks: 10 },
      ])
    }
    setOpenUnitsDialog(true)
  }

  const handleDelete = async (subjectId) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Subject deleted successfully",
          severity: "success",
        })
        fetchSubjects()
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete subject",
        severity: "error",
      })
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSubject(null)
    setFormData({
      name: "",
      code: "",
      department_id: "",
      semester: 1,
      credits: 3,
      
    })
  }

  const updateUnit = (index, field, value) => {
    const updatedUnits = [...units]
    updatedUnits[index] = { ...updatedUnits[index], [field]: value }
    setUnits(updatedUnits)
  }

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !selectedDepartment || subject.department_id === selectedDepartment
    const matchesSemester = !selectedSemester || subject.semester === selectedSemester

    return matchesSearch && matchesDepartment && matchesSemester
  })

  const columns = [
    { field: "code", headerName: "Code", width: 120 },
    { field: "name", headerName: "Subject Name", width: 300 },
    { field: "department_name", headerName: "Department", width: 200 },
    {
      field: "semester",
      headerName: "Semester",
      width: 100,
      renderCell: (params) => <Chip label={params.value} color="primary" size="small" />,
    },
    {
      field: "credits",
      headerName: "Credits",
      width: 100,
      renderCell: (params) => <Chip label={params.value} color="secondary" size="small" />,
    },
    {
      field: "faculty_assigned",
      headerName: "Faculty",
      width: 150,
      renderCell: (params) => params.row.faculty_name || "Not Assigned",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button
            size="small"
            startIcon={<Assignment />}
            onClick={() => handleManageUnits(params.row)}
            sx={{ mr: 1 }}
            color="secondary"
          >
            Units
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
            Subjects Management
          </Typography>
          {(user?.role === "admin" || user?.role === "hod") && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              Add Subject
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search subjects..."
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

            {/* Department Filter - only show for Admin */}
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
            </Box>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <CardContent>
            <DataGrid
              rows={filteredSubjects}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              autoHeight
              disableSelectionOnClick
            />
          </CardContent>
        </Card>

        {/* Add/Edit Subject Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Subject Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Subject Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                fullWidth
              />
             {/* Department field */}
<FormControl fullWidth required>
  <InputLabel>Department</InputLabel>
  {user?.role === "admin" ? (
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
  ) : (
    <TextField
      value={departments.find((d) => d.id === user?.department_id)?.name || ""}
      disabled
      fullWidth
    />
  )}
</FormControl>

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
                <TextField
                  label="Credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number.parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 6 }}
                  fullWidth
                />
              </Box>
             
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingSubject ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Units Management Dialog */}
        <Dialog open={openUnitsDialog} onClose={() => setOpenUnitsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Manage Units - {selectedSubject?.name}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure the 5 units for this subject with their respective marking schemes.
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
             {units.map((unit, index) => (
  <Card key={`${unit.unit_number}-${index}`} variant="outlined">

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Unit {unit.unit_number}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Unit Name"
                          value={unit.unit_name}
                          onChange={(e) => updateUnit(index, "unit_name", e.target.value)}
                          fullWidth
                          required
                        />
                      </Grid>
                     <Grid item xs={12} md={3}>
  <TextField
    label="MST Marks"
    value={20}
    disabled
    fullWidth
  />
</Grid>
<Grid item xs={12} md={3}>
  <TextField
    label="Assignment Marks"
    value={10}
    disabled
    fullWidth
  />
</Grid>

                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUnitsDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveUnits} variant="contained">
              Save Units
            </Button>
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

export default function SubjectsPage() {
  return (
    <ProtectedRoute>
      <Subjects />
    </ProtectedRoute>
  )
}
