"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Avatar,
} from "@mui/material"
import { Save, Security, Notifications, School } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function Settings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    // General Settings
    instituteName: "College of Engineering",
    instituteCode: "COE",
    academicYear: "2023-24",
    currentSemester: 3,

    // NBA Settings
    nbaThreshold: 52.0,
    coAttainmentThreshold: 60.0,
    poAttainmentThreshold: 50.0,

    // Notification Settings
    emailNotifications: true,
    markEntryReminders: true,
    nbaComplianceAlerts: true,

    // Security Settings
    sessionTimeout: 30,
    passwordPolicy: "medium",
    twoFactorAuth: false,

    // System Settings
    backupFrequency: "daily",
    maintenanceMode: false,
    debugMode: false,
  })

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSettings((prev) => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const handleSave = async (section) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section, settings }),
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Settings saved successfully",
          severity: "success",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save settings",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Configure system settings and preferences
        </Typography>

        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <School sx={{ mr: 1 }} />
                  <Typography variant="h6">General Settings</Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Institute Name"
                    value={settings.instituteName}
                    onChange={(e) => handleInputChange("instituteName", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Institute Code"
                    value={settings.instituteCode}
                    onChange={(e) => handleInputChange("instituteCode", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Academic Year"
                    value={settings.academicYear}
                    onChange={(e) => handleInputChange("academicYear", e.target.value)}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Current Semester</InputLabel>
                    <Select
                      value={settings.currentSemester}
                      onChange={(e) => handleInputChange("currentSemester", e.target.value)}
                      label="Current Semester"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <MenuItem key={sem} value={sem}>
                          {sem}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => handleSave("general")}
                    disabled={loading}
                  >
                    Save General Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* NBA Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  NBA Configuration
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="NBA Threshold (%)"
                    type="number"
                    value={settings.nbaThreshold}
                    onChange={(e) => handleInputChange("nbaThreshold", Number.parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    fullWidth
                    helperText="Minimum percentage of students that should achieve target marks"
                  />
                  <TextField
                    label="CO Attainment Threshold (%)"
                    type="number"
                    value={settings.coAttainmentThreshold}
                    onChange={(e) => handleInputChange("coAttainmentThreshold", Number.parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    fullWidth
                    helperText="Course Outcome attainment threshold"
                  />
                  <TextField
                    label="PO Attainment Threshold (%)"
                    type="number"
                    value={settings.poAttainmentThreshold}
                    onChange={(e) => handleInputChange("poAttainmentThreshold", Number.parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    fullWidth
                    helperText="Program Outcome attainment threshold"
                  />
                  <Button variant="contained" startIcon={<Save />} onClick={() => handleSave("nba")} disabled={loading}>
                    Save NBA Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Notifications sx={{ mr: 1 }} />
                  <Typography variant="h6">Notification Settings</Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleInputChange("emailNotifications", e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.markEntryReminders}
                        onChange={(e) => handleInputChange("markEntryReminders", e.target.checked)}
                      />
                    }
                    label="Mark Entry Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.nbaComplianceAlerts}
                        onChange={(e) => handleInputChange("nbaComplianceAlerts", e.target.checked)}
                      />
                    }
                    label="NBA Compliance Alerts"
                  />
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => handleSave("notifications")}
                    disabled={loading}
                  >
                    Save Notification Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Security sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Settings</Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Session Timeout (minutes)"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange("sessionTimeout", Number.parseInt(e.target.value))}
                    inputProps={{ min: 5, max: 120 }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Password Policy</InputLabel>
                    <Select
                      value={settings.passwordPolicy}
                      onChange={(e) => handleInputChange("passwordPolicy", e.target.value)}
                      label="Password Policy"
                    >
                      <MenuItem value="low">Low (6+ characters)</MenuItem>
                      <MenuItem value="medium">Medium (8+ chars, mixed case)</MenuItem>
                      <MenuItem value="high">High (12+ chars, symbols)</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleInputChange("twoFactorAuth", e.target.checked)}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => handleSave("security")}
                    disabled={loading}
                  >
                    Save Security Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Settings - Admin Only */}
          {user?.role === "admin" && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Backup Frequency</InputLabel>
                        <Select
                          value={settings.backupFrequency}
                          onChange={(e) => handleInputChange("backupFrequency", e.target.value)}
                          label="Backup Frequency"
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                          />
                        }
                        label="Maintenance Mode"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.debugMode}
                            onChange={(e) => handleInputChange("debugMode", e.target.checked)}
                          />
                        }
                        label="Debug Mode"
                      />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={() => handleSave("system")}
                      disabled={loading}
                    >
                      Save System Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Profile Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Settings
                </Typography>
                <Box display="flex" alignItems="center" gap={3} mb={3}>
                  <Avatar sx={{ width: 80, height: 80 }}>{user?.name?.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="h6">{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role: {user?.role?.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Full Name" defaultValue={user?.name} fullWidth />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Email" defaultValue={user?.email} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="New Password"
                      type="password"
                      fullWidth
                      helperText="Leave blank to keep current password"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Confirm Password" type="password" fullWidth />
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => handleSave("profile")}
                    disabled={loading}
                  >
                    Update Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  )
}
