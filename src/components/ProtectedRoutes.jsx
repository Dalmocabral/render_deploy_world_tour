import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth"; // Importa a função de validação de token

const ProtectedRoutes = () => {
  const [isValidToken, setIsValidToken] = useState(null); // Estado para armazenar a validade do token

  useEffect(() => {
    const validateToken = async () => {
      const isValid = await isAuthenticated(); // Valida o token
      setIsValidToken(isValid);
    };

    validateToken(); // Chama a função de validação ao montar o componente
  }, []);

  if (isValidToken === null) {
    return <div>Carregando...</div>; // Exibe um loader enquanto valida o token
  }

  return isValidToken ? <Outlet /> : <Navigate to="/login" />; // Redireciona para /login se o token for inválido
};

export default ProtectedRoutes;