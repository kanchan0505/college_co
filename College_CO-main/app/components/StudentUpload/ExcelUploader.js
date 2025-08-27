'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  CloudUpload,
  Download,
  CheckCircle,
  Error,
  Visibility
} from '@mui/icons-material'
import { parseStudentExcel, generateStudentTemplate } from '../../lib/excel-parser'

export default function ExcelUploader({ onStudentsUploaded }) {
  const [file, setFile] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          selectedFile.type !== 'application/vnd.ms-excel') {
        setError('Please select a valid Excel file (.xlsx or .xls)')
        return
      }
      setFile(selectedFile)
      setError('')
      parseFile(selectedFile)
    }
  }

  const parseFile = async (file) => {
    setLoading(true)
    setError('')
    
    try {
      const parsedStudents = await parseStudentExcel(file)
      setStudents(parsedStudents)
      
      const validCount = parsedStudents.filter(s => s.isValid).length
      const totalCount = parsedStudents.length
      
      if (validCount === 0) {
        setError('No valid student records found in the file')
      } else if (validCount < totalCount) {
        setError(`${totalCount - validCount} records have errors and will be skipped`)
      }
    } catch (err) {
      setError(err.message)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    const validStudents = students.filter(s => s.isValid)
    if (validStudents.length === 0) {
      setError('No valid students to upload')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/students/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ students: validStudents })
      })

      const result = await response.json()

      if (response.ok) {
        setUploadProgress(100)
        onStudentsUploaded?.(result)
        setFile(null)
        setStudents([])
        setError('')
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const downloadTemplate = () => {
    try {
      const template = generateStudentTemplate()
      const blob = new Blob([template], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'student_template.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download template')
    }
  }

  const validStudents = students.filter(s => s.isValid)
  const invalidStudents = students.filter(s => !s.isValid)

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Students from Excel
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadTemplate}
              sx={{ mr: 2 }}
            >
              Download Template
            </Button>
            
            <input
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              id="excel-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="excel-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
                disabled={loading}
              >
                Select Excel File
              </Button>
            </label>
          </Box>

          {file && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'} 
                            value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing file...'}
              </Typography>
            </Box>
          )}

          {students.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body1">
                  Found {students.length} records
                </Typography>
                <Chip 
                  icon={<CheckCircle />} 
                  label={`${validStudents.length} Valid`} 
                  color="success" 
                  size="small" 
                />
                {invalidStudents.length > 0 && (
                  <Chip 
                    icon={<Error />} 
                    label={`${invalidStudents.length} Invalid`} 
                    color="error" 
                    size="small" 
                  />
                )}
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview
                </Button>
              </Box>

              {validStudents.length > 0 && (
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Upload {validStudents.length} Students
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Student Data Preview
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Roll Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Batch Year</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {student.isValid ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="error" />
                      )}
                    </TableCell>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>{student.batch_year}</TableCell>
                    <TableCell>
                      {student.errors.length > 0 && (
                        <Typography variant="caption" color="error">
                          {student.errors.join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
