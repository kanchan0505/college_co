'use client'

import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  People,
  School,
  Assignment,
  TrendingUp,
  Person,
  BookOutlined
} from '@mui/icons-material'
import DashboardLayout from '../components/Layout/DashboardLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'

function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
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
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

function WelcomeCard({ user }) {
  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {user?.role?.toUpperCase()} Dashboard
            </Typography>
            <Chip 
              label={user?.department_name || 'System Administrator'} 
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderAdminStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Departments"
          value={stats.departments || 0}
          icon={<School />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Faculty"
          value={stats.faculty || 0}
          icon={<People />}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Students"
          value={stats.students || 0}
          icon={<Person />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Subjects"
          value={stats.subjects || 0}
          icon={<BookOutlined />}
          color="warning"
        />
      </Grid>
    </Grid>
  )

  const renderHODStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Department Faculty"
          value={stats.departmentFaculty || 0}
          icon={<People />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Department Students"
          value={stats.departmentStudents || 0}
          icon={<Person />}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Subjects"
          value={stats.departmentSubjects || 0}
          icon={<BookOutlined />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="NBA Compliance"
          value={`${stats.nbaCompliance || 0}%`}
          icon={<TrendingUp />}
          color="warning"
        />
      </Grid>
    </Grid>
  )

  const renderFacultyStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Assigned Subjects"
          value={stats.assignedSubjects || 0}
          icon={<BookOutlined />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={<Person />}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Marks Entered"
          value={`${stats.marksProgress || 0}%`}
          icon={<Assignment />}
          color="success"
        />
      </Grid>
    </Grid>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <WelcomeCard user={user} />
      
      {user?.role === 'admin' && renderAdminStats()}
      {user?.role === 'hod' && renderHODStats()}
      {user?.role === 'faculty' && renderFacultyStats()}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Recent activity will be displayed here...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
