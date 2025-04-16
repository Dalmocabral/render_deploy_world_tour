import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import AxiosInstance from '../components/AxiosInstance'; // Importe o AxiosInstance
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false); // Estado para controlar o diálogo
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para controlar o Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate(); // Hook para redirecionamento

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Envia a solicitação de reset de senha para o backend
      await AxiosInstance.post('/api/password_reset/', {
        email: email,
      });

      // Abre o diálogo de confirmação
      setDialogOpen(true);
    } catch (error) {
      // Exibe mensagem de erro
      setSnackbarMessage('Failed to send password reset request. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    navigate('/login'); // Redireciona para a página de login
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <CssBaseline />
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
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Reset Your Password
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email address below, and we'll send you instructions to reset your password.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Campo de E-mail */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Botão de Envio */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Send Reset Instructions
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Diálogo de Confirmação */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Password Reset Request Sent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please check your email inbox (and spam folder) for instructions on how to reset your password.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para Feedback */}
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
    </Box>
  );
};

export default PasswordResetRequest;