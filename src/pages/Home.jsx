import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FlightStats from "../components/FlightStats"; // Importando o componente
import AxiosInstance from "../components/AxiosInstance"; // Importando AxiosInstance
import videoFile from "../assets/videos/video.mp4";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Box,
} from "@mui/material";
import { Flight, Schedule } from "@mui/icons-material"; // Ícones do Material-UI
import "./Home.css"; // Importando o CSS

const Home = () => {
  const [stats, setStats] = useState({ total_flights: 0, total_hours: 0 });

  useEffect(() => {
    AxiosInstance.get("/flight-stats/")
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Error fetching flight stats:", error);
      });
  }, []);

  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token"); // Verifica se o usuário está logado

  const handleLoginClick = (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    if (isAuthenticated) {
      navigate("/app/dashboard"); // Redireciona para o Dashboard se estiver logado
    } else {
      navigate("/login"); // Caso contrário, vai para a página de Login
    }
  };

  return (
    <Box className="home">
      {/* Navbar com Material-UI */}
      <AppBar position="fixed" sx={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Infinite World Tour
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/register">
            Sign Up
          </Button>
          <Button color="inherit" onClick={handleLoginClick}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Vídeo de fundo */}
      <Box className="video-background">
        <video autoPlay loop muted className="video">
          <source src={videoFile} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      </Box>

      {/* Conteúdo principal */}
      <Container className="content">
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 600, textTransform: "uppercase" }}>
          Infinite World Tour
        </Typography>
        <Typography variant="h5" component="p" gutterBottom sx={{ lineHeight: 1.8, mb: 4 }}>
          Welcome to the Infinite World Tour System, your gateway to exploring the virtual world of aviation in the Infinite Flight simulator! Here, you will find a unique experience filled with exciting challenges, incredible rewards, and the opportunity to connect with a global community of virtual pilots. Get ready to take off on an epic journey where every flight counts and every achievement is celebrated!
        </Typography>

        {/* Estatísticas */}
        <Grid container spacing={4} justifyContent="center" className="stats-section">
          <Grid item>
            <FlightStats
              label="Total Flights"
              value={stats.total_flights}
              icon={<Flight fontSize="large" />} // Ícone de avião
            />
          </Grid>
          <Grid item>
            <FlightStats
              label="Total Hours"
              value={stats.total_hours}
              icon={<Schedule fontSize="large" />} // Ícone de relógio
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;