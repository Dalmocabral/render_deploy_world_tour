// Verifica se o token está presente e é válido
export const isAuthenticated = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false; // Não há token
  }

  try {
    // Faz uma requisição ao backend para validar o token
    const response = await fetch('/api/validate-token/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true; // Token válido
    } else {
      localStorage.removeItem('token'); // Remove o token inválido
      return false;
    }
  } catch (error) {
    console.error('Erro ao validar token:', error);
    localStorage.removeItem('token'); // Remove o token em caso de erro
    return false;
  }
};

// Faz logout do usuário
export const logout = () => {
  localStorage.removeItem('token'); // Remove o token do localStorage
  window.location.href = '/login'; // Redireciona para a página de login
};