import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TrashPage from './pages/TrashPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Create theme based on style guide
const theme = createTheme({
  palette: {
    primary: {
      main: '#00C73C', // Primary Green from style guide
    },
    secondary: {
      main: '#5B5FED', // Blue from style guide
    },
    error: {
      main: '#FF5B5B', // Red from style guide
    },
    warning: {
      main: '#FF9500', // Orange from style guide
    },
    background: {
      default: '#F8F9FA', // Gray 50 from style guide
    },
    text: {
      primary: '#212529', // Gray 900 from style guide
      secondary: '#868E96', // Gray 600 from style guide
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Noto Sans KR"',
      '"Malgun Gothic"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: 24,
      fontWeight: 700,
    },
    h2: {
      fontSize: 20,
      fontWeight: 700,
    },
    h3: {
      fontSize: 16,
      fontWeight: 700,
    },
    body1: {
      fontSize: 14,
      fontWeight: 400,
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trash"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TrashPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;