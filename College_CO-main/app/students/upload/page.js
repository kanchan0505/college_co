'use client'

import { useState } from 'react'
import {
  Typography,
  Box,
  Alert,
  Snackbar
} from '@mui/material'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import ProtectedRoute from '../../components/ProtectedRoute'
import ExcelUploader from '../../components/StudentUpload/ExcelUploader'

function StudentUpload() {
  const [successMessage, setSuccessMessage] = useState('')

  const handleStudentsUploaded = (result) => {
    setSuccessMessage(`Successfully uploaded ${result.successful} students. ${result.failed} failed.`)
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Upload Students
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload student data from Excel files. Students will be automatically classified by sections and departments.
        </Typography>

        <ExcelUploader onStudentsUploaded={handleStudentsUploaded} />

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  )
}

export default function StudentUploadPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hod']}>
      <StudentUpload />
    </ProtectedRoute>
  )
}
