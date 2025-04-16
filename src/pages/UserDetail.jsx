import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AxiosInstance from '../components/AxiosInstance';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress as Spinner,
  CardMedia,
  Pagination,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
} from '@mui/material';
import Gravatar from '../components/Gravatar';
import FlightIcon from '@mui/icons-material/Flight';
import PublicIcon from '@mui/icons-material/Public';
import PreviewIcon from '@mui/icons-material/Preview';
import { Tooltip, IconButton, Fade } from "@mui/material";
import { Badge } from '@mui/material';
import { Chip } from "@mui/material";

const UserDetail = () => {
  const { id } = useParams(); // Pega o ID do usuário da URL
  const [user, setUser] = useState(null);
  const [ifcData, setIfcData] = useState(null); // Dados do Infinite Flight
  const [userMetrics, setUserMetrics] = useState(null); // Dados das métricas do usuário
  const [loading, setLoading] = useState(true);
  const [userAwards, setUserAwards] = useState([]);
  const [awards, setAwards] = useState([]);
  const [approvedFlights, setApprovedFlights] = useState([]); // Voos aprovados
  const [error, setError] = useState(null); // Estado para erros
  const [awardsPage, setAwardsPage] = useState(1); // Paginação de prêmios
  const [flightsPage, setFlightsPage] = useState(1); // Paginação de voos
  const itemsPerPage = 6; // Número de itens por página (prêmios)
  const rowsPerPage = 5; // Número de linhas por página (voos)

  // Buscar prêmios e prêmios do usuário
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [awardsResponse, userAwardsResponse] = await Promise.all([
          AxiosInstance.get('/awards/'),
          AxiosInstance.get(`/user-awards/?user=${id}`),
        ]);

        setAwards(awardsResponse.data);
        setUserAwards(userAwardsResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar prêmios.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Combinar os dados de prêmios com os dados do usuário
  const combinedAwards = userAwards.map((userAward) => {
    const awardData = awards.find((award) => award.id === userAward.award);
    return {
      id: userAward.id,
      name: awardData ? awardData.name : 'Desconhecido',
      image: awardData ? awardData.link_image : '',
      progress: userAward.progress,
      end_date: userAward.end_date,
    };
  });

  // Lógica de paginação para prêmios
  const paginatedAwards = combinedAwards.slice((awardsPage - 1) * itemsPerPage, awardsPage * itemsPerPage);

  // Busca os dados do usuário
  useEffect(() => {
    AxiosInstance.get(`users/${id}/`)
      .then((res) => {
        setUser(res.data);
        fetchInfiniteFlightData(res.data.usernameIFC); // Busca dados do Infinite Flight
        fetchUserMetrics(res.data.id); // Busca as métricas do usuário
        fetchApprovedFlights(res.data.id); // Busca os voos aprovados do usuário
      })
      .catch((error) => {
        console.error('Erro ao buscar os dados do usuário:', error);
        setError('Erro ao carregar dados do usuário.');
        setLoading(false);
      });
  }, [id]);

  // Busca os dados do Infinite Flight
  const fetchInfiniteFlightData = async (username) => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const params = { discourseNames: [username] };
      const headers = { 'Content-type': 'application/json', Accept: 'text/plain' };
      const url = 'https://api.infiniteflight.com/public/v2/user/stats?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw';

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers,
      });

      const data = await response.json();
      if (data.errorCode === 0 && data.result.length > 0) {
        setIfcData(data.result[0]); // Armazena os dados do Infinite Flight
      }
    } catch (error) {
      console.error('Erro ao buscar dados do Infinite Flight:', error);
      setError('Erro ao carregar dados do Infinite Flight.');
    } finally {
      setLoading(false);
    }
  };

  // Busca as métricas do usuário
  const fetchUserMetrics = async (userId) => {
    try {
      const response = await AxiosInstance.get(`user-metrics/${userId}/`);
      setUserMetrics(response.data); // Armazena as métricas do usuário
    } catch (error) {
      console.error('Erro ao buscar métricas do usuário:', error);
      setError('Erro ao carregar métricas do usuário.');
    }
  };

  // Busca os voos aprovados do usuário
  const fetchApprovedFlights = async (userId) => {
    try {
      const response = await AxiosInstance.get(`user-approved-flights/${userId}/`);
      setApprovedFlights(response.data); // Armazena os voos aprovados do usuário
    } catch (error) {
      console.error('Erro ao buscar voos aprovados:', error);
      setError('Erro ao carregar voos aprovados.');
    }
  };

  // Ordenar os voos aprovados pela data (do mais recente para o mais antigo)
  const sortedFlights = approvedFlights.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Ordena do mais recente para o mais antigo
  });

  // Aplicar a paginação aos voos ordenados
  const paginatedFlights = sortedFlights.slice((flightsPage - 1) * rowsPerPage, flightsPage * rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner />
      </Box>
    );
  }

  if (!user) {
    return <Typography>User not found.</Typography>;
  }

  // Format duration from seconds to HH:MM
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };


  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      {/* Gravatar no centro */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Gravatar
          email={user.email}
          size={120}
          alt={`Imagem de perfil de ${user.first_name} ${user.last_name}`}
          style={{ borderRadius: '50%' }}
        />
      </Box>

      {/* Cards lado a lado */}
      <Grid container spacing={4} justifyContent="center">
        {/* Card do Sistema World Tour */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
            <PublicIcon
              sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                fontSize: 300,
                color: 'rgba(0, 0, 0, 0.1)',
              }}
            />
            <CardContent sx={{ textAlign: 'left', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Sistema World Tour
                </Typography>
                <Typography variant="body1">
                  Name: {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body1">
                  Country: <img
                    src={`https://flagcdn.com/w320/${user.country ? user.country.toLowerCase() : ''}.png`}
                    alt={user.country || 'País não informado'}
                    style={{ width: '24px', height: 'auto' }}
                  />
                </Typography>
                {userMetrics ? (
                  <>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Total Flights: {userMetrics.total_flights}
                    </Typography>
                    <Typography variant="body1">
                      Total Hours: {userMetrics.total_flight_time}h
                    </Typography>
                    <Typography variant="body1">
                      Total Flights (Last 30 Days): {userMetrics.total_flights_last_30_days}
                    </Typography>
                    <Typography variant="body1">
                      Total Hours (Last 30 Days): {userMetrics.total_flight_time_last_30_days}h
                    </Typography>
                    <Typography variant="body1">
                      Average Flights (Last 30 Days): {userMetrics.average_flights_per_day.toFixed(2)} flights/day
                    </Typography>
                    <Typography variant="body1">
                      Average Hours (Last 30 Days): {userMetrics.average_flight_time_per_day.toFixed(2)} hours/day
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No metrics available.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card do Infinite Flight */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
            <FlightIcon
              sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                fontSize: 300,
                color: 'rgba(0, 0, 0, 0.1)',
              }}
            />
            <CardContent sx={{ textAlign: 'left', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Infinite Flight
                </Typography>
                {ifcData ? (
                  <>
                    <Typography variant="body1">
                      Flights Online: {ifcData.onlineFlights}
                    </Typography>
                    <Typography variant="body1">
                      XP: {ifcData.xp}
                    </Typography>
                    <Typography variant="body1">
                      Time flight: {ifcData.flightTime} minutos
                    </Typography>
                    <Typography variant="body1">
                      Level: {ifcData.grade}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No data available.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção de Prêmios */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          World Tour Awards Achieved
        </Typography>
        {/* Contêiner com barra de rolagem */}
        <Box
          sx={{
            maxHeight: '400px', // Altura máxima para exibir a barra de rolagem
            overflowY: 'auto', // Habilita a rolagem vertical
            p: 1, // Adiciona um pequeno padding
          }}
        >
          <Grid container spacing={2} justifyContent="center">
            {combinedAwards.length > 0 ? (
              combinedAwards.map((award) => (
                <Grid
                  item
                  xs={6}
                  sm={4}
                  md={3}
                  key={award.id}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    {/* Card do Prêmio */}
                    <Card
                      sx={{
                        boxShadow: 3,
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={award.image}
                        alt={award.name}
                        sx={{ width: '80px', height: '80px', borderRadius: '50%' }}
                      />
                    </Card>
                    {/* Nome do Prêmio */}
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {award.name}
                    </Typography>
                    {/* Barra de Progresso */}
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress variant="determinate" value={award.progress} />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {award.progress}% Completed
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No awards won yet.
              </Typography>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Tabela de voos aprovados */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Flights
        </Typography>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {approvedFlights.length > 0 ? (

          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Flight</TableCell>
                    <TableCell>Dep</TableCell>
                    <TableCell>Arr</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Network</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Aircraft</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFlights.map((flight) => (

                    <TableRow key={flight.id}>
                      <TableCell>{flight.flight}</TableCell>
                      <TableCell>{flight.dep}</TableCell>
                      <TableCell>{flight.arr}</TableCell>
                      <TableCell>{new Date(flight.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          color={flight.network === 'Expert' ? 'success' : 'primary'}
                          badgeContent={flight.network}
                        />
                      </TableCell>
                      <TableCell>{formatDuration(flight.duration)}</TableCell>
                      <TableCell>{flight.aircraft}</TableCell>
                      <TableCell>
                        <Chip
                          label={flight.status}
                          color={
                            flight.status === "Pending"
                              ? "warning"
                              : flight.status === "Approved"
                                ? "success"
                                : flight.status === "Rejected"
                                  ? "error"
                                  : "default"
                          }
                          variant="outlined" // Ou remova para um fundo sólido
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton component="a" href={`/app/briefing/${flight.id}`}>
                          <PreviewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={Math.ceil(approvedFlights.length / rowsPerPage)}
                page={flightsPage}
                onChange={(event, value) => setFlightsPage(value)}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum voo aprovado encontrado.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserDetail;