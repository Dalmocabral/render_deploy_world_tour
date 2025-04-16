import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AxiosInstance from '../components/AxiosInstance';
import { Container, Grid, Card, CardContent, Typography, Divider, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Briefing = () => {
  const { id } = useParams(); // Capture the flight ID from the URL
  const [flightData, setFlightData] = useState(null); // State to store flight data
  const mapContainer = useRef(null); // Reference for the map container
  const map = useRef(null); // Reference for the map instance

  // Fetch flight details when the component mounts
  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await AxiosInstance.get(`/pirepsflight/${id}/`);
        setFlightData(response.data);
      } catch (error) {
        console.error('Error fetching flight details:', error);
      }
    };

    fetchFlightDetails();
  }, [id]);

  useEffect(() => {
    if (flightData && !map.current) {
      // Initialize the map
      map.current = L.map(mapContainer.current).setView([-12.163200486951586, -53.51511964322111], 8);

      // Add the tile layer (MapTiler)
      L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh', {
        attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(map.current);

      // Fetch airport data
      const fetchAirports = async () => {
        const response = await fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json');
        return await response.json();
      };

      // Add markers and polylines after the map loads
      fetchAirports().then((airportsData) => {
        // Get departure, arrival, and alternate airport data
        const depAirport = airportsData[flightData.departure_airport];
        const arrAirport = airportsData[flightData.arrival_airport];
        const altAirport = airportsData[flightData.alternate_airport];

        // Add markers and popups
        if (depAirport) {
          L.marker([depAirport.lat, depAirport.lon])
            .addTo(map.current)
            .bindPopup(`<strong>${depAirport.icao}</strong>`);
        }

        if (arrAirport) {
          L.marker([arrAirport.lat, arrAirport.lon])
            .addTo(map.current)
            .bindPopup(`<strong>${arrAirport.icao}</strong>`);
        }

        if (altAirport) {
          L.marker([altAirport.lat, altAirport.lon])
            .addTo(map.current)
            .bindPopup(`<strong>${altAirport.icao}</strong>`);
        }

        // Draw a line between departure and arrival airports
        if (depAirport && arrAirport) {
          const latLngs = [
            [depAirport.lat, depAirport.lon],
            [arrAirport.lat, arrAirport.lon],
          ];
          L.polyline(latLngs, { color: '#000' }).addTo(map.current);

          // Calculate the distance between airports
          const distance = calculateDistance(depAirport.lat, depAirport.lon, arrAirport.lat, arrAirport.lon);
          console.log(distance);
          document.getElementById('distance').innerText = `${distance.toFixed(0)} nm`;
        }

        // Adjust the map's zoom and center to include all airports
        if (depAirport && arrAirport) {
          const bounds = L.latLngBounds(
            [depAirport.lat, depAirport.lon],
            [arrAirport.lat, arrAirport.lon]
          );
          if (altAirport) bounds.extend([altAirport.lat, altAirport.lon]);
          map.current.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    }

    // Cleanup when the component unmounts
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [flightData]);

  // Function to calculate the distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.539957; // Convert km to nautical miles (nm)
  };

  if (!flightData) {
    return <Typography>Loading...</Typography>; // Display a loading message while fetching data
  }

  return (
    <Container maxWidth="xl" style={{ padding: '20px', height: '100vh' }}>
      <Grid container spacing={3} style={{ height: '100%' }}>
        {/* Information Column with Scrollbar */}
        <Grid item xs={12} md={6} style={{ height: '100%', overflow: 'auto' }}>
          <Card style={{ backgroundColor: '#292b30', color: '#fff', marginBottom: '20px' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">
                  <i className="fa-solid fa-circle-info"></i> This briefing was generated on: {flightData.registration_date}
                </Typography>
                <IconButton size="small" style={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Flight Information
              </Typography>
              <Divider style={{ marginBottom: '20px' }} />

              {/* First row of information */}
              <Box display="flex" justifyContent="space-between" marginBottom="20px">
                <Box textAlign="center">
                  <Typography variant="subtitle1">Flight Number</Typography>
                  <Typography variant="body1">{flightData.flight_number || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Callsign</Typography>
                  <Typography variant="body1">{flightData.flight_icao || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Departure</Typography>
                  <Typography variant="body1">{flightData.departure_airport || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Arrival</Typography>
                  <Typography variant="body1">{flightData.arrival_airport || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Alternate</Typography>
                  <Typography variant="body1">{flightData.alternate_airport || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Aircraft</Typography>
                  <Typography variant="body1">{flightData.aircraft || '--- / ---'}</Typography>
                  <Divider />
                </Box>
              </Box>

              {/* Second row of information */}
              <Box display="flex" justifyContent="space-between">
                <Box textAlign="center">
                  <Typography variant="subtitle1">Departure Date</Typography>
                  <Typography variant="body1">
                    {new Date(flightData.registration_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Dep Time</Typography>
                  <Typography variant="body1">--- / ---</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Arr Time</Typography>
                  <Typography variant="body1">--- / ---</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Route Distance</Typography>
                  <Typography variant="body1" id="distance">
                    {/* Calculated distance will appear here */}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Cruise</Typography>
                  <Typography variant="body1">--- / ---</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Status</Typography>
                  <Typography variant="body1">{flightData.status}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Route
              </Typography>
              <Divider style={{ marginBottom: '20px' }} />
              <Box style={{ backgroundColor: '#ccc', height: '100px', padding: '20px' }}>
                {/* Route content here */}
              </Box>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Dispatch Notes
              </Typography>
              <Divider style={{ marginBottom: '20px' }} />
              <Box style={{ backgroundColor: '#ccc', height: '100px', padding: '20px' }}>
                {/* Dispatch notes content here */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fixed Map Column */}
        <Grid item xs={12} md={6} style={{ height: '100%' }}>
          <Card style={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flex: 1, padding: 0 }}>
              <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Briefing;