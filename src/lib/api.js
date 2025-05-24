const API_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
  return token;
};

// Helper function to upload an image
const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  console.log('Uploading file:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    console.log('Making upload request to:', `${API_URL}/plants/upload`);
    const response = await fetch(`${API_URL}/plants/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return data.image_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Making authenticated request to:', `${API_URL}${endpoint}`);
  } else {
    console.log('Making unauthenticated request to:', `${API_URL}${endpoint}`);
  }

  const options = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log('Request options:', {
      method,
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : undefined },
      endpoint: `${API_URL}${endpoint}`
    });

    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Plant API calls
export const plantApi = {
  // Get all plants for the current user
  getPlants: () => apiCall('/plants/dashboard'),

  // Get a specific plant
  getPlant: (plantId) => apiCall(`/plants/${plantId}`),

  // Create a new plant
  createPlant: (plantData) => apiCall('/plants/new', 'POST', plantData),

  // Update a plant
  updatePlant: async (plantId, plantData, imageFile = null) => {
    try {
      let finalPlantData = { ...plantData };
      
      // If there's a new image file, upload it first
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        finalPlantData.image_url = imageUrl;
      }

      return await apiCall(`/plants/edit/${plantId}`, 'PUT', finalPlantData);
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  },

  // Delete a plant
  deletePlant: (plantId) => apiCall(`/plants/${plantId}`, 'DELETE'),
}; 