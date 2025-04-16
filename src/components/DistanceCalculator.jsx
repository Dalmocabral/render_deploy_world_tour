import React from 'react';

// Função para calcular a distância entre dois pontos (Haversine)
const DistanceCalculator = ({ fromAirport, toAirport, airportsData, showTime = false }) => {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Implementação existente do cálculo de distância
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  };

  const calculateFlightTime = (distance) => {
    const averageSpeed = distance < 500 ? 460 : 850; // 460 km/h para voos curtos, 850 para longos
    const flightTimeHours = distance / averageSpeed;
    
    // Converter para horas e minutos
    const hours = Math.floor(flightTimeHours);
    const minutes = Math.round((flightTimeHours - hours) * 60);
    
    return `${hours}h ${minutes}m`;
  };

  if (!fromAirport || !toAirport || !airportsData[fromAirport] || !airportsData[toAirport]) {
    return <span>N/A</span>;
  }

  const from = airportsData[fromAirport];
  const to = airportsData[toAirport];
  const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);

  if (showTime) {
    return <span>{calculateFlightTime(distance)}</span>;
  }

  return <span>{distance.toFixed(0)} km</span>;
};
export default DistanceCalculator;