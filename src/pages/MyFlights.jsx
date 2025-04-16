import React, { useState, useEffect } from "react";
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
  TextField,
  TablePagination,
  useMediaQuery
} from "@mui/material";
import Chip from "@mui/material/Chip";
import PreviewIcon from '@mui/icons-material/Preview';
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import { Tooltip, IconButton, Fade } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AxiosInstance from "../components/AxiosInstance";
import dayjs from "dayjs";

const MyFlights = () => {
  const [flights, setFlights] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detecta telas pequenas

  // Buscar os voos do usuário
  useEffect(() => {
    AxiosInstance.get("/myflights/")
      .then((response) => {
        // Ordena os voos pela data de registro (do mais recente para o mais antigo)
        const sortedFlights = response.data.sort(
          (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
        );
        setFlights(sortedFlights);
      })
      .catch((error) => console.error("Erro ao carregar voos:", error));
  }, []);

  // Filtragem pelo campo de pesquisa
  const filteredFlights = flights.filter((flight) =>
    flight.flight_number.toLowerCase().includes(search.toLowerCase())
  );

  // Paginação
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg"> {/* Ajusta para "lg" para melhor layout em telas grandes */}
      <Typography variant="h4" sx={{ my: 3, textAlign: "center" }}>
        My Flights
      </Typography>

      {/* Campo de Pesquisa */}
      <TextField
        label="Pesquisar por Flight ICAO"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Tabela Responsiva */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Flight</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Dep</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Arr</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
              {!isMobile && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Network</TableCell>}
              {!isMobile && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Duration</TableCell>}
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Aircraft</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredFlights
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {flight.flight_icao} {flight.flight_number}
                  </TableCell>
                  <TableCell>{flight.departure_airport}</TableCell>
                  <TableCell>{flight.arrival_airport}</TableCell>
                  <TableCell>{dayjs(flight.registration_date).format("MM/DD/YYYY")}</TableCell>
                  {!isMobile && <TableCell><Chip label={flight.network || "N/A"} color="primary" /></TableCell>}
                  {!isMobile && <TableCell>{flight.flight_duration}</TableCell>}
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

                    {/* Se o status for 'Rejected', exibe o ícone com Tooltip */}
                    {flight.status === "Rejected" && (
                     <Tooltip title={flight.observation || "No observation available"}  placement="top" arrow>
                        <AssignmentLateIcon
                          sx={{ ml: 1, color: "#0066cc", verticalAlign: "middle" }} // Espaçamento e cor vermelha
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title="Review flight log" 
                      placement="top"
                      arrow
                      TransitionComponent={Fade} // Aplica o efeito de fade-in
                      TransitionProps={{ timeout: 500 }} // Tempo da animação
                      PopperProps={{
                        modifiers: [
                          {
                            name: "preventOverflow",
                            options: { boundary: "window" },
                          },
                          {
                            name: "offset",
                            options: { offset: [0, 10] }, // Move o tooltip para baixo
                          },
                        ],
                      }}
                    >
                      <IconButton component="a"  href={`/app/briefing/${flight.id}`}> 
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={filteredFlights.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default MyFlights;
