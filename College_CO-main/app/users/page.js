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
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  VisibilityOff,
  Person,
  AdminPanelSettings,
  School,
} from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty",
    department_id: "",
  })

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
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
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

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
          message: `User ${editingUser ? "updated" : "created"} successfully`,
          severity: "success",
        })
        fetchUsers()
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

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department_id: user.department_id || "",
    })
    setOpenDialog(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        })
        fetchUsers()
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error",
      })
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "faculty",
      department_id: "",
    })
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings />
      case "hod":
        return <School />
      default:
        return <Person />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error"
      case "hod":
        return "warning"
      default:
        return "primary"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !selectedRole || user.role === selectedRole

    return matchesSearch && matchesRole
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
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getRoleIcon(params.value)}
          label={params.value.toUpperCase()}
          color={getRoleColor(params.value)}
          size="small"
        />
      ),
    },
    { field: "department_name", headerName: "Department", width: 200 },
    {
      field: "created_at",
      headerName: "Created",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          {params.row.id !== user?.id && (
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
            Users Management
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Add User
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search users..."
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

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Role">
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="hod">HOD</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <CardContent>
            <DataGrid
              rows={filteredUsers}
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
          <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
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
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="hod">HOD</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                </Select>
              </FormControl>
              {(formData.role === "hod" || formData.role === "faculty") && (
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
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? "Update" : "Create"}
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

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Users />
    </ProtectedRoute>
  )
}
