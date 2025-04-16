import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Button, Grid, Typography, Container, TextField } from '@mui/material';
import AxiosInstance from '../components/AxiosInstance';
import { Chip } from "@mui/material";

const Awards = () => {
  const [awards, setAwards] = React.useState([]); // Estado para armazenar os prêmios
  const [searchTerm, setSearchTerm] = React.useState(''); // Estado para o termo de pesquisa
  const navigate = useNavigate(); // Hook para navegação

  // Função para buscar os prêmios da API
  const fetchAwards = async () => {
    try {
      const response = await AxiosInstance.get('/awards/'); // Faz a requisição GET
      setAwards(response.data); // Atualiza o estado com os dados recebidos
    } catch (error) {
      console.error('Erro ao buscar prêmios:', error);
    }
  };

  // Efeito para buscar os prêmios quando o componente é montado
  React.useEffect(() => {
    fetchAwards();
  }, []);

  // Função para navegar para a página de detalhes de um prêmio
  const handleDetailsClick = (award) => {
    navigate(`/app/awards/awardDetail/${award.id}`, { state: { award } }); // Passa os dados do prêmio
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center" }}>
        List World Tour
      </Typography>
      <Typography paragraph sx={{ textAlign: "center" }}>
        Here you can see all the available World Tours.
      </Typography>

      {/* Campo de pesquisa */}
      <TextField
        fullWidth
        label="Search by award name"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={3}>
        {awards
          .filter((award) =>
            award.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((award) => (
            <Grid item key={award.id} xs={9} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={award.link_image}
                  alt={award.name}
                  sx={{ height: 200, objectFit: "contain", backgroundColor: "#f0f0f0" }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    {award.name}
                  </Typography>
                  {/* Exibe o total de pernas */}
                  {/* Exibe o total de pernas */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 1 }}
                  >
                    <Chip label={`Total Legs: ${award.total_legs}`} />
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleDetailsClick(award)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export default Awards;