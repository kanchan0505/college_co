"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
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
  Avatar,
  Chip,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { Add, Edit, Delete, School, Person, TrendingUp } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function StatCard({ title, value, icon, color = "primary" }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

function Departments() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [stats, setStats] = useState({})

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hod_id: "",
    nba_threshold: 52.0,
  })

  useEffect(() => {
    fetchDepartments()
    fetchUsers()
    fetchStats()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users?role=hod", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/departments/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      const url = editingDepartment ? `/api/departments/${editingDepartment.id}` : "/api/departments"
      const method = editingDepartment ? "PUT" : "POST"

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
          message: `Department ${editingDepartment ? "updated" : "created"} successfully`,
          severity: "success",
        })
        fetchDepartments()
        fetchStats()
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

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      hod_id: department.hod_id || "",
      nba_threshold: department.nba_threshold,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (departmentId) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Department deleted successfully",
          severity: "success",
        })
        fetchDepartments()
        fetchStats()
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete department",
        severity: "error",
      })
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingDepartment(null)
    setFormData({
      name: "",
      code: "",
      hod_id: "",
      nba_threshold: 52.0,
    })
  }

  const columns = [
    { field: "code", headerName: "Code", width: 100 },
    { field: "name", headerName: "Department Name", width: 300 },
    { field: "hod_name", headerName: "HOD", width: 200 },
    {
      field: "nba_threshold",
      headerName: "NBA Threshold (%)",
      width: 150,
      renderCell: (params) => <Chip label={`${params.value}%`} color="info" size="small" />,
    },
    { field: "faculty_count", headerName: "Faculty", width: 100 },
    { field: "student_count", headerName: "Students", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          {user?.role === "admin" && (
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
            Departments Management
          </Typography>
          {user?.role === "admin" && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              Add Department
            </Button>
          )}
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Departments" value={stats.totalDepartments || 0} icon={<School />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Faculty" value={stats.totalFaculty || 0} icon={<Person />} color="secondary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Students" value={stats.totalStudents || 0} icon={<Person />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg NBA Compliance"
              value={`${stats.avgNbaCompliance || 0}%`}
              icon={<TrendingUp />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Data Grid */}
        <Card>
          <CardContent>
            <DataGrid
              rows={departments}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              autoHeight
              disableSelectionOnClick
            />
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Department Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Department Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Head of Department</InputLabel>
                <Select
                  value={formData.hod_id}
                  onChange={(e) => setFormData({ ...formData, hod_id: e.target.value })}
                  label="Head of Department"
                >
                  <MenuItem value="">No HOD Assigned</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="NBA Threshold (%)"
                type="number"
                value={formData.nba_threshold}
                onChange={(e) => setFormData({ ...formData, nba_threshold: Number.parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingDepartment ? "Update" : "Create"}
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

export default function DepartmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Departments />
    </ProtectedRoute>
  )
}
