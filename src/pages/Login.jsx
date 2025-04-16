import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CssBaseline,
  Link,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AxiosInstance from '../components/AxiosInstance'; // Import AxiosInstance
import { useNavigate } from 'react-router-dom'; // For navigation

// Custom theme (optional)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#dc004e', // Pink
    },
  },
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await AxiosInstance.post('login/', {
        email: data.email,
        password: data.password,
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      console.log(response);

      // Show success message
      setSnackbarMessage('Login successful! Redirecting to Dashboard...');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Redirect to Dashboard after 2 seconds
      setTimeout(() => {
        navigate('/app/dashboard'); // Redirect to Dashboard route
      }, 2000);
    } catch (error) {
      // Show error message
      setSnackbarMessage('Login failed. Please check your credentials.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);

      console.error('Login failed:', error.response ? error.response.data : error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Login
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
              {/* Email Field */}
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              {/* Password Field */}
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>

              {/* Links for Registration and Password Reset */}
              <Box sx={{ textAlign: 'center' }}>
                <Link href="/register" variant="body2" sx={{ display: 'block', mb: 1 }}>
                  Don't have an account? Sign Up
                </Link>
                <Link href="/request/passworld_reset" variant="body2">
                  Forgot your password? Reset it here
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Login;