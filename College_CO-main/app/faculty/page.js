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
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { Add, Edit, Delete, Search, AssignmentInd } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function Faculty() {
  const { user } = useAuth()
  const [faculty, setFaculty] = useState([])
  const [subjects, setSubjects] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
  })

  const [assignmentData, setAssignmentData] = useState({
    subject_id: "",
    semester: 1,
    batch_year: new Date().getFullYear(),
    sections: ["A"],
  })

  useEffect(() => {
    fetchFaculty()
    fetchSubjects()
    fetchDepartments()
  }, [])

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/faculty", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setFaculty(data)
      }
    } catch (error) {
      console.error("Failed to fetch faculty:", error)
    } finally {
      setLoading(false)
    }
  }

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
    const url = "/api/faculty";
const method = editingFaculty ? "PUT" : "POST";

const response = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ id: editingFaculty?.id, ...formData, role: "faculty" }),
})


      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Faculty ${editingFaculty ? "updated" : "created"} successfully`,
          severity: "success",
        })
        fetchFaculty()
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

  const handleAssignSubject = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/faculty/assign-subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faculty_id: selectedFaculty.id,
          ...assignmentData,
        }),
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Subject assigned successfully",
          severity: "success",
        })
        fetchFaculty()
        setOpenAssignDialog(false)
      } else {
        const error = await response.json()
        setSnackbar({
          open: true,
          message: error.error || "Assignment failed",
          severity: "error",
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Assignment failed",
        severity: "error",
      })
    }
  }

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty)
    setFormData({
      name: faculty.name,
      email: faculty.email,
      password: "",
      department_id: faculty.department_id,
    })
    setOpenDialog(true)
  }

  const handleAssign = (faculty) => {
    setSelectedFaculty(faculty)
    setAssignmentData({
      subject_id: "",
      semester: 1,
      batch_year: new Date().getFullYear(),
      sections: ["A"],
    })
    setOpenAssignDialog(true)
  }

  const handleDelete = async (facultyId) => {
  if (!confirm("Are you sure you want to delete this faculty member?")) return

  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/faculty`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: facultyId }),
    })

    if (response.ok) {
      setSnackbar({
        open: true,
        message: "Faculty deleted successfully",
        severity: "success",
      })
      fetchFaculty()
    } else {
      const error = await response.json()
      setSnackbar({
        open: true,
        message: error.error || "Failed to delete faculty",
        severity: "error",
      })
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: "Failed to delete faculty",
      severity: "error",
    })
  }
}

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingFaculty(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      department_id: "",
    })
  }

  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !selectedDepartment || member.department_id === selectedDepartment

    return matchesSearch && matchesDepartment
  })

  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => <Avatar sx={{ width: 32, height: 32 }}>{params.row.name.charAt(0)}</Avatar>,
    },
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "department_name", headerName: "Department", width: 200 },
    {
      field: "assigned_subjects",
      headerName: "Assigned Subjects",
      width: 150,
      renderCell: (params) => <Chip label={`${params.row.subject_count || 0} Subjects`} color="primary" size="small" />,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button
            size="small"
            startIcon={<AssignmentInd />}
            onClick={() => handleAssign(params.row)}
            sx={{ mr: 1 }}
            color="secondary"
          >
            Assign
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
            Faculty Management
          </Typography>
          {(user?.role === "admin" || user?.role === "hod") && (
            <Button variant="contained" startIcon={<Add />} onClick={() => {
              setFormData({
                name: "",
                email: "",
                password: "",
                department_id: user.role === "hod" ? user.department_id : "",
              })
              setOpenDialog(true)
            }}>
              Add Faculty
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search faculty..."
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

            </Box>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <CardContent>
            <DataGrid
              rows={filteredFaculty}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              autoHeight
              disableSelectionOnClick
            />
          </CardContent>
        </Card>

        {/* Add/Edit Faculty Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingFaculty ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label={editingFaculty ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingFaculty}
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

            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingFaculty ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Subject Assignment Dialog */}
        <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Assign Subject to {selectedFaculty?.name}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={assignmentData.subject_id}
                  onChange={(e) => setAssignmentData({ ...assignmentData, subject_id: e.target.value })}
                  label="Subject"
                >
                 {subjects
  .filter((subject) => 
    subject.department_id === selectedFaculty?.department_id &&
    !selectedFaculty.assignments?.some(a => a.subject_id === subject.id)
  )
  .map((subject) => (
    <MenuItem key={subject.id} value={subject.id}>
      {subject.name} ({subject.code})
    </MenuItem>
  ))}

                </Select>
              </FormControl>
              <Box display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={assignmentData.semester}
                    onChange={(e) => setAssignmentData({ ...assignmentData, semester: e.target.value })}
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
                  label="Batch Year"
                  type="number"
                  value={assignmentData.batch_year}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, batch_year: Number.parseInt(e.target.value) })
                  }
                  fullWidth
                />
              </Box>
              <FormControl fullWidth>
                <InputLabel>Sections</InputLabel>
                <Select
                  multiple
                  value={assignmentData.sections}
                  onChange={(e) => setAssignmentData({ ...assignmentData, sections: e.target.value })}
                  label="Sections"
                  renderValue={(selected) => selected.join(", ")}
                >
                  {["A", "B", "C", "D"].map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Current Assignments */}
              {selectedFaculty?.assignments && selectedFaculty.assignments.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Current Assignments
                  </Typography>
                  <List>
                    {selectedFaculty.assignments.map((assignment, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={assignment.subject_name}
                          secondary={`Semester ${assignment.semester} | Sections: ${assignment.sections.join(", ")} | Batch: ${assignment.batch_year}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" color="error">
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignSubject} variant="contained">
              Assign Subject
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

export default function FacultyPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "hod"]}>
      <Faculty />
    </ProtectedRoute>
  )
}