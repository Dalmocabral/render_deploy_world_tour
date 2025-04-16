import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../components/AxiosInstance";
import {
  TextField,
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import aircraftChoices from "../data/aircraftChoices";

const EditPirep = () => {
  const { id } = useParams(); // Captura o ID da URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    flight_icao: "",
    flight_number: "",
    departure_airport: "",
    arrival_airport: "",
    aircraft: "",
    flight_duration: dayjs("2022-04-17T00:00"), // Valor inicial para o TimeField
    network: "",
    status: "",
    observation: "",
  });

  // Carrega os dados do PIREP ao montar o componente
  useEffect(() => {
    AxiosInstance.get(`/pirepsflight/${id}/`)
      .then((response) => {
        // Atualiza o estado com os dados do PIREP
        setFormData({
          ...response.data,
          flight_duration: dayjs(response.data.flight_duration, "HH:mm:ss"), // Converte a duração para o formato do TimeField
        });
      })
      .catch((error) => console.error("Erro ao carregar o PIREP:", error));
  }, [id]);

  // Função para atualizar o estado dos campos
  const handleChange = (event) => {
    const { name, value } = event.target;
  
    setFormData({
      ...formData,
      [name]: name === "flight_icao" ? value.toUpperCase() : value, // Transforma apenas flight_icao em maiúsculas
      [name]: name === "Departure Airport" ? value.toUpperCase() : value, // Transforma apenas flight_icao em maiúsculas
      [name]: name === "Arrival Airport" ? value.toUpperCase() : value, // Transforma apenas flight_icao em maiúsculas
    });
  };

  // Função para atualizar o estado do TimeField
  const handleTimeChange = (newValue) => {
    setFormData({ ...formData, flight_duration: newValue });
  };

  // Função para enviar os dados atualizados
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const formattedDuration = formData.flight_duration.format("HH:mm:ss");
  
    const updatedData = {
      ...formData,
      flight_duration: formattedDuration,
    };
  
    try {
      await AxiosInstance.patch(`/pirepsflight/${id}/`, updatedData);
      navigate("/app/dashboard"); // ✅ Corrigido para redirecionar corretamente
    } catch (error) {
      console.error("Erro ao editar PIREP:", error);
    }
  };
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Editar PIREP
          </Typography>
          <Typography variant="body1" gutterBottom>
            Edite os dados do voo abaixo:
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Flight ICAO */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight ICAO"
                  name="flight_icao"
                  value={formData.flight_icao}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              {/* Flight Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight Number"
                  name="flight_number"
                  value={formData.flight_number}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              {/* Departure Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Airport"
                  name="departure_airport"
                  value={formData.departure_airport}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              {/* Arrival Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Airport"
                  name="arrival_airport"
                  value={formData.arrival_airport}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              {/* Aircraft */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Aircraft</InputLabel>
                  <Select
                    name="aircraft"
                    value={formData.aircraft}
                    onChange={handleChange}
                    label="Aircraft"
                  >
                    {aircraftChoices.map((choice) => (
                      <MenuItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Flight Duration */}
              <Grid item xs={12} sm={6}>
                <TimeField
                  label="Flight Duration (HH:mm)"
                  value={formData.flight_duration}
                  onChange={handleTimeChange}
                  format="HH:mm"
                  fullWidth
                />
              </Grid>

              {/* Network */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Network</InputLabel>
                  <Select
                    name="network"
                    value={formData.network}
                    onChange={handleChange}
                    label="Network"
                  >
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Training">Training</MenuItem>
                    <MenuItem value="Expert">Expert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Botão de Enviar */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Salvar Alterações
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default EditPirep;