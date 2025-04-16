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
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Ícones para mostrar/ocultar senha
import AxiosInstance from '../components/AxiosInstance'; // Importe o AxiosInstance
import { useNavigate, useSearchParams } from 'react-router-dom'; // Para redirecionar e capturar o token

const PasswordResetConfirm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha
  const [dialogOpen, setDialogOpen] = useState(false); // Estado para controlar o diálogo
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para controlar o Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchParams] = useSearchParams(); // Captura a query string
  const token = searchParams.get('token'); // Extrai o token da query string
  const navigate = useNavigate(); // Hook para redirecionamento

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se as senhas coincidem
    if (newPassword !== confirmPassword) {
      setSnackbarMessage('Passwords do not match. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Envia a nova senha para o backend
      const response = await AxiosInstance.post('/api/password_reset/confirm/', {
        token: token,
        password: newPassword,
      });

      console.log('Response:', response.data); // Log da resposta do backend

      // Abre o diálogo de confirmação
      setDialogOpen(true);
    } catch (error) {
      // Exibe mensagem de erro
      setSnackbarMessage('Failed to reset password. Please try again.');
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

  // Função para alternar entre mostrar/ocultar senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            Please enter your new password below.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Campo de Nova Senha */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Campo de Confirmação de Senha */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Botão de Envio */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Reset Password
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Diálogo de Confirmação */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Password Reset Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your password has been successfully reset. You can now log in with your new password.
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

export default PasswordResetConfirm;