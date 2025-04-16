import React, { useEffect, useState } from 'react';
import AxiosInstance from '../components/AxiosInstance';
import { 
  Card, CardContent, Typography, Grid, CircularProgress, Box, 
  Divider
} from '@mui/material';
import Gravatar from '../components/Gravatar';
import { Link } from 'react-router-dom'; // Importe o componente Link

const Members = () => {
  const [myData, setMyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const GetData = () => {
    AxiosInstance.get('users/')
      .then((res) => {
        setMyData(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar os dados:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    GetData();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {myData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              {/* Transforma o Card em um link clicável */}
              <Link 
                to={`/app/userdetail/${item.id}`} // Redireciona para a página de detalhes do membro
                style={{ textDecoration: 'none' }} // Remove o sublinhado do link
              >
                <Card 
                  sx={{ 
                    width: '100%',
                    boxShadow: 3, 
                    textAlign: 'center', 
                    borderRadius: 2, 
                    p: 1, // Reduz o padding
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, box-shadow 0.2s', // Adiciona transição suave
                    '&:hover': {
                      transform: 'scale(1.05)', // Efeito de zoom ao passar o mouse
                      boxShadow: 6, // Aumenta a sombra ao passar o mouse
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mt: 1 // Reduz o margin-top
                  }}>
                    <Gravatar
                      email={item.email} 
                      size={60} // Reduz o tamanho do Gravatar
                      alt={`Imagem de perfil de ${item.first_name} ${item.last_name}`} 
                      style={{ borderRadius: '50%' }} 
                    />
                  </Box>
                  <CardContent sx={{ p: 1 }}>
                    <Divider />
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mt: 1 }}>
                      {item.first_name} {item.last_name}
                    </Typography>
                    {/* Exibe a bandeira */}
                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                      <img
                        src={`https://flagcdn.com/w320/${item.country ? item.country.toLowerCase() : ''}.png`}
                        alt={item.country || 'País não informado'}
                        style={{ width: '24px', height: 'auto' }} // Ajusta o tamanho da bandeira
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Members;