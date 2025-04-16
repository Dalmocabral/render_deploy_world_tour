import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AxiosInstance from "../components/AxiosInstance";
import ReactFlagsSelect from "react-flags-select";
import { debounce } from "lodash"; // Importa o debounce do lodash

const Register = () => {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [usernameValid, setUsernameValid] = useState(false); // Estado para verificar se o nome de usuário é válido
  const [usernameLoading, setUsernameLoading] = useState(false); // Estado para indicar carregamento durante a verificação

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      usernameIFC: "",
      email: "",
      country: "",
      password1: "",
      password2: "",
    },
  });

  const navigate = useNavigate();

  // Função para verificar o nome de usuário IFC
  const checkUsernameIFC = async (username) => {
    try {
      // Prepare request parameters
      const params = { discourseNames: [username] };
      const headers = { 'Content-type': 'application/json', 'Accept': 'text/plain' };
      const url = 'https://api.infiniteflight.com/public/v2/user/stats?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw';

      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers,
      });

      // Check if the response is OK (status code 200)
      if (!response.ok) {
        return response.status; // Retorna o código de erro (401, 404, etc.)
      }

      // Convert the response to JSON
      const data = await response.json();

      // Verifica se o array result não está vazio e se o primeiro elemento possui userId
      if (data.result && data.result.length > 0 && data.result[0].userId) {
        return 200; // Nome de usuário válido
      } else {
        return 404; // Nome de usuário não encontrado
      }
    } catch (error) {
      console.error("Error checking username IFC:", error);
      return 500; // Erro interno do servidor
    }
  };

  // Função com debounce para verificar o nome de usuário
  const checkUsernameDebounced = debounce(async (username) => {
    if (username) {
      setUsernameLoading(true); // Ativa o estado de carregamento
      const statusCode = await checkUsernameIFC(username);
      setUsernameValid(statusCode === 200); // Atualiza o estado de validação
      setUsernameLoading(false); // Desativa o estado de carregamento

      // Exibe feedback visual para o usuário
      if (statusCode === 200) {
        setSnackbarMessage("Username IFC is valid.");
        setSnackbarSeverity("success");
      } else if (statusCode === 404) {
        setSnackbarMessage("Invalid IFC username. Please enter a valid username.");
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Error verifying IFC username. Please try again.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    }
  }, 500); // 500ms de debounce

  const submission = async (data) => {
    try {
      const response = await AxiosInstance.post(`register/`, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        usernameIFC: data.usernameIFC,
        country: data.country, // Inclui o país no envio dos dados
        password: data.password1,
        confirm_password: data.password2,
      });

      // Exibe mensagem de sucesso
      setSnackbarMessage("Registration successful! Redirecting to login...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      console.log("Registration successful:", response.data);

      // Limpa os campos do formulário
      reset();

      // Redireciona para a página de login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      // Exibe mensagem de erro
      setSnackbarMessage("Registration failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);

      console.error("Registration failed:", error.response ? error.response.data : error.message);
    }
  };
  const onSubmit = async (data) => {
    console.log("Form submitted", data);

    // Verifica se o nome de usuário IFC é válido
    if (usernameValid) {
      submission(data);
    } else {
      setSnackbarMessage("Invalid IFC username. Please enter a valid username.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Campo First Name */}
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="First Name"
                margin="normal"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value.charAt(0).toUpperCase() + value.slice(1));
                }}
              />
            )}
          />

          {/* Campo Last Name */}
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Last Name"
                margin="normal"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value.charAt(0).toUpperCase() + value.slice(1));
                }}
              />
            )}
          />

          {/* Campo Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* Campo usernameIFC */}
          <Controller
            name="usernameIFC"
            control={control}
            rules={{ required: "Username IFC is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Username IFC"
                margin="normal"
                error={!!errors.usernameIFC}
                helperText={errors.usernameIFC?.message}
                onBlur={(e) => checkUsernameDebounced(e.target.value)}
                InputProps={{
                  endAdornment: usernameLoading ? (
                    <Typography variant="body2">Checking...</Typography>
                  ) : usernameValid ? (
                    <Typography variant="body2" color="success.main">Valid</Typography>
                  ) : (
                    <Typography variant="body2" color="error.main">Invalid</Typography>
                  ),
                }}
              />
            )}
          />

          {/* Campo Country */}
          <Controller
            name="country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <ReactFlagsSelect
                selected={selectedCountry}
                onSelect={(countryCode) => {
                  setSelectedCountry(countryCode);
                  setValue("country", countryCode);
                }}
                searchable
                placeholder="Select Country"
                fullWidth
                className="country-select"
              />
            )}
          />

          {/* Campo Password */}
          <Controller
            name="password1"
            control={control}
            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
                type={showPassword1 ? "text" : "password"}
                margin="normal"
                error={!!errors.password1}
                helperText={errors.password1?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword1(!showPassword1)}>
                        {showPassword1 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo Confirm Password */}
          <Controller
            name="password2"
            control={control}
            rules={{
              required: "Confirm password is required",
              validate: (value) => value === watch("password1") || "Passwords do not match",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirm Password"
                type={showPassword2 ? "text" : "password"}
                margin="normal"
                error={!!errors.password2}
                helperText={errors.password2?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword2(!showPassword2)}>
                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Botão de Submit */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!usernameValid} // Desabilita o botão se o nome de usuário não for válido
          >
            Register
          </Button>
        </form>
      </Box>

      {/* Snackbar para feedback */}
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
    </Container>
  );
};

export default Register;