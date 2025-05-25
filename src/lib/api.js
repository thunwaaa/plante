const API_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('No authentication token found');
    }
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
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
    // Ensure the image URL is properly formatted
    return data.image_url.startsWith('/') ? data.image_url : `/${data.image_url}`;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const options = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Plant API calls
export const plantApi = {
  // Get all plants for the current user
  getPlants: async () => {
    try {
      const data = await apiCall('/plants/dashboard');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting plants:', error);
      throw error;
    }
  },

  // Get a specific plant
  getPlant: async (plantId) => {
    try {
      const data = await apiCall(`/plants/${plantId}`);
      return data;
    } catch (error) {
      console.error('Error getting plant:', error);
      throw error;
    }
  },

  // Create a new plant
  createPlant: async (plantData) => {
    try {
      const response = await apiCall('/plants/new', 'POST', plantData);
      return response;
    } catch (error) {
      console.error('Error creating plant:', error);
      throw error;
    }
  },

  // Update a plant
  updatePlant: async (plantId, plantData, imageFile = null) => {
    try {
      let finalPlantData = { ...plantData };
      
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        finalPlantData.image_url = imageUrl;
      }

      const response = await apiCall(`/plants/edit/${plantId}`, 'PUT', finalPlantData);
      return response;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  },

  // Delete a plant
  deletePlant: async (plantId) => {
    try {
      const response = await apiCall(`/plants/${plantId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  },

  // Upload image
  uploadImage: async (file) => {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/plants/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.image_url.startsWith('/') ? data.image_url : `/${data.image_url}`;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }
};

// Export API_URL for use in components
export { API_URL }; 