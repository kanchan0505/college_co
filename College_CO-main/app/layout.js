import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import CustomThemeProvider from './components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'College Marking Portal',
  description: 'Academic evaluation system for colleges',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  )
}
