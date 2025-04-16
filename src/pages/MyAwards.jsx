import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import AxiosInstance from '../components/AxiosInstance';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Typography,
  Avatar,
  Button,
} from '@mui/material';

const MyAwards = () => {
  const [awards, setAwards] = useState([]);
  const [userAwards, setUserAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obter a lista de prêmios
        const awardsResponse = await AxiosInstance.get('/awards/');
        setAwards(awardsResponse.data);

        // Obter a lista de prêmios do usuário
        const userAwardsResponse = await AxiosInstance.get('/user-awards/');
        setUserAwards(userAwardsResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combinar os dados dos prêmios com os dados de progresso do usuário
  const combinedData = awards.map((award) => {
    const userAward = userAwards.find((ua) => ua.award === award.id);
    return {
      ...award,
      progress: userAward ? userAward.progress : 0,
      start_date: userAward ? userAward.start_date : null,
      end_date: userAward ? userAward.end_date : null,
    };
  });

  // Filtrar apenas os prêmios com progresso maior que 0
  const filteredData = combinedData.filter((award) => award.progress > 0);

  // Função para navegar para a página de detalhes de um prêmio
  const handleDetailsClick = (award) => {
    navigate(`/app/awards/awardDetail/${award.id}`, { state: { award } }); // Passa os dados do prêmio
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" align="center" style={{ marginTop: '20px' }}>
        Error: {error}
      </Typography>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        My World Tour
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Start</strong></TableCell>
            <TableCell><strong>End</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Details</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((award) => (
            <TableRow key={award.id}>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={award.link_image}
                    alt={award.name}
                    style={{ marginRight: '10px', width: '50px', height: '50px' }}
                  />
                  <Typography variant="body1">{award.name}</Typography>
                </div>
              </TableCell>
              <TableCell>
                {award.start_date ? new Date(award.start_date).toLocaleDateString() : 'Not started'}
              </TableCell>
              <TableCell>
                {award.end_date ? new Date(award.end_date).toLocaleDateString() : 'In progress'}
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100px',
                      height: '10px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '5px',
                      marginRight: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: `${award.progress}%`,
                        height: '100%',
                        backgroundColor: '#76c7c0',
                        borderRadius: '5px',
                      }}
                    />
                  </div>
                  <span>{award.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDetailsClick(award)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default MyAwards;