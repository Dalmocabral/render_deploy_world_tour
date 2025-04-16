import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker"; // Certifique-se de instalar esta biblioteca
import ApiService from "../components/ApiService"; // Ajuste o caminho conforme necessário
import airplaneUserIcon from "../assets/image/airplane_user.png"; // Caminho da imagem do avião
import axios from "axios"; // Importe o axios

const sessions = {
  training: { id: "9ed5512e-b6eb-401f-bab8-42bdbdcf2bab", name: "Training Server" },
  casual: { id: "7e4681bf-9fee-4c68-ba62-eda1f2f0e780", name: "Casual Server" },
  expert: { id: "9bdfef34-f03b-4413-b8fa-c29949bb18f8", name: "Expert Server" },
};

const MapWithFlights = ({ darkMode }) => {
  const [selectedSession, setSelectedSession] = useState(
    localStorage.getItem("lastSession") || sessions.training.id
  );

  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null); // Armazena o voo selecionado
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersLayer = useRef(null);
  const tileLayer = useRef(null);
  const polylineLayer = useRef(null); // Camada para a trajetória atual
  const routeLayer = useRef(null); // Camada para a rota planejada

  // Inicializa o mapa
  useEffect(() => {
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([-12.1632, -53.5151], 3);

      // Adiciona a camada de tiles inicial (claro ou escuro)
      tileLayer.current = L.tileLayer(
        darkMode
          ? "https://api.maptiler.com/maps/dark-v2/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh" // Tema escuro
          : "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh", // Tema claro
        {
          attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }
      ).addTo(map.current);

      markersLayer.current = L.layerGroup().addTo(map.current);
      polylineLayer.current = L.layerGroup().addTo(map.current); // Inicializa a camada da trajetória atual
      routeLayer.current = L.layerGroup().addTo(map.current); // Inicializa a camada da rota planejada
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [darkMode]);

  // Atualiza os dados dos voos a cada 10 segundos
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await ApiService.getFlightData(selectedSession);
        setFlights(data);
      } catch (error) {
        console.error("Error fetching flight data:", error);
      }
    };

    fetchFlights(); // Busca os dados imediatamente ao carregar ou mudar a sessão

    const interval = setInterval(fetchFlights, 10000); // Atualiza os dados a cada 10 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [selectedSession]);

  // Atualiza os marcadores no mapa quando os dados dos voos mudam
  useEffect(() => {
    if (!map.current || !markersLayer.current) return;

    markersLayer.current.clearLayers(); // Limpa os marcadores antigos

    flights.forEach((flight) => {
      if (!flight.latitude || !flight.longitude || flight.heading === undefined) return;

      const marker = createRotatedMarker(flight);
      marker.addTo(markersLayer.current);

      // Adiciona evento de clique para exibir a rota
      marker.on("click", async () => {
        setSelectedFlight(flight); // Define o voo selecionado

        // Busca a rota planejada
        const route = await ApiService.getRoute(selectedSession, flight.flightId);
        if (route) {
          const coordinates = route.map((point) => [point.latitude, point.longitude]);

          // Desenha a rota planejada (linha pontilhada preta)
          if (routeLayer.current) {
            routeLayer.current.clearLayers();
            const dashedPolyline = L.polyline(coordinates, {
              color: "#000000", // Cor preta
              weight: 2,
              dashArray: "5, 10", // Linha pontilhada
            }).addTo(routeLayer.current);
          }
        }

        // Busca o plano de voo para obter aeroportos de origem e destino
        const flightPlan = await fetchFlightPlan(flight.flightId);
        if (flightPlan) {
          const polyline = L.polyline(
            [
              [flightPlan.origin.lat, flightPlan.origin.lon], // Aeroporto de origem
              [flight.latitude, flight.longitude], // Posição atual da aeronave
              [flightPlan.destination.lat, flightPlan.destination.lon], // Aeroporto de destino
            ],
            { color: "#0000FF", weight: 2 } // Linha contínua azul
          );
          if (polylineLayer.current) {
            polylineLayer.current.clearLayers();
            polyline.addTo(polylineLayer.current);
          }
        }
      });
    });
  }, [flights, selectedSession]);

  // Função para criar um marcador rotacionado
  const createRotatedMarker = (flight) => {
    const airplaneIcon = L.icon({
      iconUrl: airplaneUserIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 16], // Centro do ícone para rotação correta
      popupAnchor: [0, -16],
    });

    const marker = L.marker([flight.latitude, flight.longitude], {
      icon: airplaneIcon,
      rotationAngle: flight.heading, // Define o ângulo de rotação baseado no heading
      rotationOrigin: "center",
    }).bindPopup(`
      <b>${flight.username}</b><br>
      Callsign: ${flight.callsign}<br>
      Altitude: ${flight.altitude.toFixed(2)} ft
    `);

    return marker;
  };

  // Função para buscar o plano de voo
  const fetchFlightPlan = async (flightId) => {
    try {
      const response = await axios.get(
        `https://api.infiniteflight.com/public/v2/sessions/${selectedSession}/flights/${flightId}/flightplan?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw`
      );
      const flightPlanData = response.data.result.flightPlanItems;

      // Filtra itens com coordenadas válidas
      const validItems = flightPlanData.filter(
        (item) => item.location.latitude !== 0 && item.location.longitude !== 0
      );

      // O primeiro item válido é o aeroporto de origem
      const origin = validItems[0];

      // O último item válido é o aeroporto de destino
      const destination = validItems[validItems.length - 1];

      return {
        origin: {
          lat: origin.location.latitude,
          lon: origin.location.longitude,
        },
        destination: {
          lat: destination.location.latitude,
          lon: destination.location.longitude,
        },
      };
    } catch (error) {
      console.error("Error fetching flight plan data:", error);
      return null;
    }
  };

  // Atualiza o tema do mapa quando o dark mode muda
  useEffect(() => {
    if (!map.current || !tileLayer.current) return;

    // Remove a camada de tiles atual
    tileLayer.current.remove();

    // Adiciona a nova camada de tiles com base no tema
    tileLayer.current = L.tileLayer(
      darkMode
        ? "https://api.maptiler.com/maps/dark-v2/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh" // Tema escuro
        : "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh", // Tema claro
      {
        attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }
    ).addTo(map.current);
  }, [darkMode]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}>
      {/* Dropdown para selecionar a sessão */}
      <select
        value={selectedSession}
        onChange={(e) => {
          const sessionId = e.target.value;
          setSelectedSession(sessionId); // Atualiza o estado
          localStorage.setItem("lastSession", sessionId); // Salva no localStorage
        }}
        style={{
          position: "absolute",
          top: "13%",
          left: "18%",
          transform: "translate(-50%, -50%)",
          zIndex: 1050,
          backgroundColor: darkMode ? "#333" : "white",
          color: darkMode ? "white" : "black",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {Object.entries(sessions).map(([key, session]) => (
          <option key={key} value={session.id}>
            {session.name}
          </option>
        ))}
      </select>

      {/* Contêiner do mapa */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapWithFlights;