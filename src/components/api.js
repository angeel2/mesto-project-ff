const apiConfig = {
  baseUrl: 'https://nomoreparties.co/v1/wff-cohort-42',
  headers: {
    authorization: '7696ee24-0ffa-43ba-9ef5-e8fa7c29fb61',
    'Content-Type': 'application/json'
  }
};

const makeRequest = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: apiConfig.headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Ошибка запроса ${method} ${endpoint}:`, error);
    throw error;
  }
};

export const getProfileInfo = () => makeRequest('/users/me');
export const updateProfileInfo = (name, about) => 
  makeRequest('/users/me', 'PATCH', { name, about });
export const updateProfileAvatar = (avatarUrl) => 
  makeRequest('/users/me/avatar', 'PATCH', { avatar: avatarUrl });

export const getInitialCards = () => makeRequest('/cards');
export const addNewCard = (name, link) => 
  makeRequest('/cards', 'POST', { name, link });
export const deleteCard = (cardId) => 
  makeRequest(`/cards/${cardId}`, 'DELETE');

export const addLike = (cardId) => 
  makeRequest(`/cards/likes/${cardId}`, 'PUT');
export const removeLike = (cardId) => 
  makeRequest(`/cards/likes/${cardId}`, 'DELETE');