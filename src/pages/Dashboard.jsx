import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Fade,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlightIcon from "@mui/icons-material/Flight";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Trophy icon
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import AxiosInstance from "../components/AxiosInstance";
import dayjs from "dayjs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [flights, setFlights] = useState([]); // State for flights data
  const [topDuration, setTopDuration] = useState([]); // State for top duration rankings
  const [topFlights, setTopFlights] = useState([]); // State for top flights rankings
  const [openDialog, setOpenDialog] = useState(false); // State for delete confirmation dialog
  const [selectedFlightId, setSelectedFlightId] = useState(null); // State for selected flight ID
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // State for table sorting
  const navigate = useNavigate();

  // Fetch flights and rankings on component mount
  useEffect(() => {
    fetchFlights();
    fetchRankings();
  }, []);

  // Fetch flights data from the API
  const fetchFlights = async () => {
    try {
      const response = await AxiosInstance.get("/dashboard/");
      const sortedFlights = response.data.sort(
        (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
      );
      setFlights(sortedFlights);
    } catch (error) {
      console.error("Error fetching flights:", error);
    }
  };

  // Fetch rankings data from the API
  const fetchRankings = async () => {
    try {
      const response = await AxiosInstance.get("/dashboard/rankings/");
      setTopDuration(response.data.top_duration);
      setTopFlights(response.data.top_flights);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  // Handle table column sorting
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sortedFlights = [...flights].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFlights(sortedFlights);
  };

  // Navigate to edit flight page
  const handleEdit = (flightId) => {
    navigate(`/app/edit-pirep/${flightId}`);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (flightId) => {
    setSelectedFlightId(flightId);
    setOpenDialog(true);
  };

  // Confirm flight deletion
  const handleConfirmDelete = async () => {
    if (selectedFlightId) {
      try {
        await AxiosInstance.delete(`/pirepsflight/${selectedFlightId}/`);
        setFlights(flights.filter((flight) => flight.id !== selectedFlightId));
      } catch (error) {
        console.error("Error deleting flight:", error);
      } finally {
        setOpenDialog(false);
        setSelectedFlightId(null);
      }
    }
  };

  // Calculate total duration in HH:MM format
  const sumDurations = (durations) => {
    let totalMinutes = durations.reduce((acc, duration) => {
      if (!duration) return acc;
      const [hours, minutes] = duration.split(":");
      return acc + parseInt(hours) * 60 + parseInt(minutes);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Get the latest flight
  const lastFlight = flights.length > 0 ? flights[0] : null;

  // Calculate total approved flight duration
  const totalDuration = sumDurations(
    flights
      .filter((flight) => flight.status === "Approved")
      .map((flight) => flight.flight_duration)
  );

  // Calculate total approved flights
  const totalFlights = flights.filter(
    (flight) => flight.status === "Approved"
  ).length;

  // Filter flights from the last 30 days with status "Approved"
  const flightsLast30Days = flights.filter((flight) => {
    const flightDate = dayjs(flight.registration_date);
    const today = dayjs();
    return (
      today.diff(flightDate, "day") <= 30 && flight.status === "Approved"
    );
  });

  // Group flights by day for the bar chart
  const flightsByDay = flightsLast30Days.reduce((acc, flight) => {
    const date = dayjs(flight.registration_date).format("YYYY-MM-DD");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Bar chart data
  const barChartData = {
    labels: Object.keys(flightsByDay),
    datasets: [
      {
        label: "Voos por Dia (Aprovados)",
        data: Object.values(flightsByDay),
        backgroundColor: "#1976d2",
      },
    ],
  };

  // Group flights by aircraft type for the doughnut chart
  const aircraftCount = flightsLast30Days.reduce((acc, flight) => {
    acc[flight.aircraft] = (acc[flight.aircraft] || 0) + 1;
    return acc;
  }, {});

  // Doughnut chart data
  const doughnutChartData = {
    labels: Object.keys(aircraftCount),
    datasets: [
      {
        label: "Tipos de Aeronave (Aprovados)",
        data: Object.values(aircraftCount),
        backgroundColor: [
          "#1976d2",
          "#ff9800",
          "#4caf50",
          "#f44336",
          "#9c27b0",
        ],
      },
    ],
  };

  // Format duration from seconds to HH:MM
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const barChartOptions = {
    responsive: false, // Evita o problema do "limbo"
    maintainAspectRatio: false, // Permite definir altura customizada
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const doughnutChartOptions = {
    responsive: false, // Evita bug de redimensionamento infinito
    maintainAspectRatio: false,
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 3, textAlign: "center" }}>
        My Flights
      </Typography>

      {/* Info Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Latest Flight Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <AirplanemodeActiveIcon sx={{ fontSize: 40, color: "#1976d2" }} />
            <CardContent>
              <Typography variant="h6">Latest Flight Plan</Typography>
              <Typography variant="h5">
                {lastFlight
                  ? `${lastFlight.departure_airport} ✈ ${lastFlight.arrival_airport}`
                  : "Nenhum voo"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Hours Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 40, color: "#ff9800" }} />
            <CardContent>
              <Typography variant="h6">Total Hours</Typography>
              <Typography variant="h5">{totalDuration}h</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Flights Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <FlightIcon sx={{ fontSize: 40, color: "#1976d2" }} />
            <CardContent>
              <Typography variant="h6">Total Flights</Typography>
              <Typography variant="h5">{totalFlights}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flights Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              {[
                "Flight",
                "Dep",
                "Arr",
                "Date",
                "Network",
                "Duration",
                "Aircraft",
                "Status",
                "Action",
              ].map((header, index) => (
                <TableCell
                  key={index}
                  sx={{ color: "#fff", fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => handleSort(header.toLowerCase())}
                >
                  {header} {sortConfig.key === header.toLowerCase() && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.slice(0, 5).map((flight) => (
              <TableRow key={flight.id}>
                <TableCell>{flight.flight_icao} {flight.flight_number}</TableCell>
                <TableCell>{flight.departure_airport}</TableCell>
                <TableCell>{flight.arrival_airport}</TableCell>
                <TableCell>{dayjs(flight.registration_date).format("MM/DD/YYYY")}</TableCell>
                <TableCell><Chip label={flight.network || "N/A"} color="primary" /></TableCell>
                <TableCell>{flight.flight_duration}</TableCell>
                <TableCell>{flight.aircraft}</TableCell>
                <TableCell>
                  <Chip
                    label={flight.status || "Scheduled"}
                    color={
                      flight.status === "Approved"
                        ? "success"
                        : flight.status === "Rejected"
                        ? "error"
                        : "warning"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Review flight log" placement="top" arrow>
                    <IconButton component="a"  href={`/app/briefing/${flight.id}`}>
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit" placement="top" arrow>
                    <IconButton
                      onClick={() => handleEdit(flight.id)}
                      disabled={flight.status === "Approved" || flight.status === "Rejected"}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" placement="top" arrow>
                    <IconButton
                      color="error"
                      disabled={flight.status === "Approved"}
                      onClick={() => handleDeleteClick(flight.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>  
            Flights per Day (Last 30 Days)
            </Typography>
            <Bar data={barChartData} options={barChartOptions} width={400} height={300} />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
            Aircraft Types (Last 30 Days)
            </Typography>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} width={400} height={300} />
          </Card>
        </Grid>
      </Grid>

      {/* Rankings Cards */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {/* Top 5 Flight Duration */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
              Top 5 Best Flight Times
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Piloto</TableCell>
                      <TableCell>Tempo Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topDuration.map((user, index) => (
                      <TableRow key={user.pilot__first_name}>
                        <TableCell>
                          {index === 0 && <EmojiEventsIcon sx={{ color: "gold" }} />}
                          {index === 1 && <EmojiEventsIcon sx={{ color: "silver" }} />}
                          {index === 2 && <EmojiEventsIcon sx={{ color: "brown" }} />}
                          {index > 2 && <Typography>{index + 1}</Typography>}
                        </TableCell>
                        <TableCell>{`${user.pilot__first_name} ${user.pilot__last_name}`}</TableCell>
                        <TableCell>{formatDuration(user.total_duration)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 5 Total Flights */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
              Top 5 Total Flights
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Piloto</TableCell>
                      <TableCell>Total de Voos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topFlights.map((user, index) => (
                      <TableRow key={user.pilot__first_name}>
                        <TableCell>
                          {index === 0 && <EmojiEventsIcon sx={{ color: "gold" }} />}
                          {index === 1 && <EmojiEventsIcon sx={{ color: "silver" }} />}
                          {index === 2 && <EmojiEventsIcon sx={{ color: "brown" }} />}
                          {index > 2 && <Typography>{index + 1}</Typography>}
                        </TableCell>
                        <TableCell>{`${user.pilot__first_name} ${user.pilot__last_name}`}</TableCell>
                        <TableCell>{user.total_flights}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza de que deseja excluir este voo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;