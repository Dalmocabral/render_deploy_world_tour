import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Grid,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert, // Importe o componente Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import dayjs from 'dayjs';
import AxiosInstance from '../components/AxiosInstance';
import aircraftChoices from '../data/aircraftChoices';

const PirepsFlights = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { leg } = location.state || {};

  const [flightIcao, setFlightIcao] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState(leg?.from_airport || '');
  const [arrivalAirport, setArrivalAirport] = useState(leg?.to_airport || '');
  const [aircraft, setAircraft] = useState('');
  const [network, setNetwork] = useState('');
  const [flightDuration, setFlightDuration] = useState(dayjs('2022-04-17T00:00'));

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('success');

  useEffect(() => {
    if (leg) {
      setDepartureAirport(leg.from_airport);
      setArrivalAirport(leg.to_airport);
    }
  }, [leg]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (dialogType === 'success') {
      navigate('/app/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedDuration = flightDuration.format('HH:mm:ss');

    const formData = {
      flight_icao: flightIcao,
      flight_number: flightNumber,
      departure_airport: departureAirport,
      arrival_airport: arrivalAirport,
      aircraft: aircraft,
      flight_duration: formattedDuration,
      network: network,
    };

    try {
      await AxiosInstance.post('pirepsflight/', formData);
      setDialogMessage('Pireps saved successfully!');
      setDialogType('success');
      setOpenDialog(true);

      setFlightIcao('');
      setFlightNumber('');
      setDepartureAirport('');
      setArrivalAirport('');
      setAircraft('');
      setFlightDuration(dayjs('2022-04-17T00:00'));
    } catch (error) {
      console.error('Error saving Pireps:', error.response ? error.response.data : error.message);
      setDialogMessage('Error saving Pireps. Please check the data and try again.');
      setDialogType('error');
      setOpenDialog(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Pireps Flights
          </Typography>
          <Typography variant="body1" gutterBottom>
            Fill in the flight details below:
          </Typography>

          {/* Alerta em vermelho */}
          <Alert severity="warning" sx={{ mb: 3 }}>
            Due to high demand, flight approval may take up to 3 days. Thank you for your patience.
          </Alert>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Leg Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Leg Number"
                  value={leg?.leg_number || ''}
                  fullWidth
                  disabled
                />
              </Grid>

              {/* Flight ICAO */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight ICAO"
                  value={flightIcao}
                  onChange={(e) => setFlightIcao(e.target.value ? e.target.value.toUpperCase() : '')}
                  fullWidth
                  required
                />
              </Grid>

              {/* Flight Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight Number"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              {/* Departure Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Airport"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value ? e.target.value.toUpperCase() : '')}
                  fullWidth
                  required
                />
              </Grid>

              {/* Arrival Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Airport"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value ? e.target.value.toUpperCase() : '')}
                  fullWidth
                  required
                />
              </Grid>

              {/* Aircraft */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Aircraft</InputLabel>
                  <Select
                    value={aircraft}
                    onChange={(e) => setAircraft(e.target.value)}
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
                  value={flightDuration}
                  onChange={(newValue) => setFlightDuration(newValue)}
                  format="HH:mm"
                  fullWidth
                />
              </Grid>

              {/* Network */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Network</InputLabel>
                  <Select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
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
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>

      {/* Dialog de Sucesso ou Erro */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogType === 'success' ? 'Success' : 'Error'}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PirepsFlights;