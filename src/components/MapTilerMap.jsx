import React, { useEffect, useRef } from 'react';
import { Map } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';


const MapTilerMap = ({ departureAirport, arrivalAirport, alternateAirport, onDistanceCalculated }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!map.current) {
      map.current = new Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/basic/style.json',
        center: [-53.51511964322111, -12.163200486951586],
        zoom: 8,
        apiKey: 'oLMznTPIDCPrc3mGZdoh',
      });

      map.current.on('load', async () => {
        const airportsData = await fetchAirports();

        const depAirport = airportsData[departureAirport];
        const arrAirport = airportsData[arrivalAirport];
        const altAirport = airportsData[alternateAirport];

        if (depAirport) {
          new window.maptilersdk.Marker({ color: '#FF0000' })
            .setLngLat([depAirport.lon, depAirport.lat])
            .setPopup(new window.maptilersdk.Popup().setHTML(`<strong>${depAirport.icao}</strong>`))
            .addTo(map.current);
        }

        if (arrAirport) {
          new window.maptilersdk.Marker({ color: '#00FF00' })
            .setLngLat([arrAirport.lon, arrAirport.lat])
            .setPopup(new window.maptilersdk.Popup().setHTML(`<strong>${arrAirport.icao}</strong>`))
            .addTo(map.current);
        }

        if (altAirport) {
          new window.maptilersdk.Marker({ color: '#0000FF' })
            .setLngLat([altAirport.lon, altAirport.lat])
            .setPopup(new window.maptilersdk.Popup().setHTML(`<strong>${altAirport.icao}</strong>`))
            .addTo(map.current);
        }

        if (depAirport && arrAirport) {
          const latLngs = [
            [depAirport.lon, depAirport.lat],
            [arrAirport.lon, arrAirport.lat],
          ];
          new window.maptilersdk.Polyline({
            coordinates: latLngs,
            color: '#000',
          }).addTo(map.current);

          const distance = calculateDistance(depAirport.lat, depAirport.lon, arrAirport.lat, arrAirport.lon);
          onDistanceCalculated(distance.toFixed(0)); // Chama a função de callback com a distância
        }

        if (depAirport && arrAirport) {
          const bounds = new window.maptilersdk.LngLatBounds();
          bounds.extend([depAirport.lon, depAirport.lat]);
          bounds.extend([arrAirport.lon, arrAirport.lat]);
          if (altAirport) bounds.extend([altAirport.lon, altAirport.lat]);
          map.current.fitBounds(bounds, { padding: 50 });
        }
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [departureAirport, arrivalAirport, alternateAirport, onDistanceCalculated]);

  const fetchAirports = async () => {
    const response = await fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json');
    return await response.json();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Raio da Terra em km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.539957; // Converte km para milhas náuticas (nm)
  };

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default MapTilerMap;
