"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
  Chip,
} from "@mui/material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Assignment, CheckCircle, Warning } from "@mui/icons-material"
import DashboardLayout from "../components/Layout/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"

function StatCard({ title, value, icon, color = "primary", subtitle, progress }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
        {progress !== undefined && (
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

function Analytics() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchAnalyticsData()
    fetchDepartments()
  }, [selectedDepartment, selectedSemester])

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (selectedDepartment) params.append("department", selectedDepartment)
      if (selectedSemester) params.append("semester", selectedSemester)

      const response = await fetch(`/api/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
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

  // Mock data for charts
  const departmentPerformance = [
    { name: "CSE", students: 120, avgMarks: 78, nbaCompliance: 85 },
    { name: "ECE", students: 95, avgMarks: 75, nbaCompliance: 80 },
    { name: "MECH", students: 110, avgMarks: 72, nbaCompliance: 75 },
    { name: "CIVIL", students: 85, avgMarks: 70, nbaCompliance: 70 },
  ]

  const semesterWisePerformance = [
    { semester: "Sem 1", pass: 85, fail: 15 },
    { semester: "Sem 2", pass: 88, fail: 12 },
    { semester: "Sem 3", pass: 82, fail: 18 },
    { semester: "Sem 4", pass: 90, fail: 10 },
    { semester: "Sem 5", pass: 87, fail: 13 },
    { semester: "Sem 6", pass: 89, fail: 11 },
  ]

  const nbaComplianceData = [
    { name: "Compliant", value: 75, color: "#4caf50" },
    { name: "Non-Compliant", value: 25, color: "#f44336" },
  ]

  const subjectWisePerformance = [
    { subject: "Data Structures", avg: 78, target: 75 },
    { subject: "DBMS", avg: 82, target: 75 },
    { subject: "Networks", avg: 75, target: 75 },
    { subject: "OS", avg: 73, target: 75 },
    { subject: "Algorithms", avg: 80, target: 75 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Box display="flex" gap={2}>
            {(user?.role === "admin" || user?.role === "hod") && (
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Semester</InputLabel>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
                <MenuItem value="">All Semesters</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Overall Performance"
              value="78.5%"
              icon={<TrendingUp />}
              color="primary"
              subtitle="Average across all subjects"
              progress={78.5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="NBA Compliance"
              value="75%"
              icon={<CheckCircle />}
              color="success"
              subtitle="Meeting target thresholds"
              progress={75}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Course Outcomes"
              value="82%"
              icon={<Assignment />}
              color="info"
              subtitle="CO attainment average"
              progress={82}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="At Risk Students"
              value="15%"
              icon={<Warning />}
              color="warning"
              subtitle="Below threshold"
              progress={15}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Department Performance */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department-wise Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgMarks" fill="#8884d8" name="Average Marks" />
                    <Bar dataKey="nbaCompliance" fill="#82ca9d" name="NBA Compliance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* NBA Compliance Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  NBA Compliance Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={nbaComplianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {nbaComplianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Semester-wise Performance */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Semester-wise Pass/Fail Rate
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={semesterWisePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pass" stackId="a" fill="#4caf50" name="Pass %" />
                    <Bar dataKey="fail" stackId="a" fill="#f44336" name="Fail %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject Performance */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subject-wise Performance vs Target
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={subjectWisePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avg" stroke="#8884d8" name="Average Marks" />
                    <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Performance Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Summary by Department
                </Typography>
                <Grid container spacing={2}>
                  {departmentPerformance.map((dept, index) => (
                    <Grid item xs={12} sm={6} md={3} key={dept.name}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">{dept.name}</Typography>
                            <Chip
                              label={dept.nbaCompliance >= 75 ? "Compliant" : "At Risk"}
                              color={dept.nbaCompliance >= 75 ? "success" : "warning"}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Students: {dept.students}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg Marks: {dept.avgMarks}%
                          </Typography>
                          <Box mt={2}>
                            <Typography variant="body2" gutterBottom>
                              NBA Compliance: {dept.nbaCompliance}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={dept.nbaCompliance}
                              color={dept.nbaCompliance >= 75 ? "success" : "warning"}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  )
}
