export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper function to get auth token
const getAuthToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // Store current URL before redirecting
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
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

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`Attempt ${retryCount + 1} of ${maxRetries} to upload image`);
      const response = await fetch(`${API_URL}/api/plants/upload`, {
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
        
        // If it's a server error (5xx) or connection error, retry
        if (response.status >= 500 || response.status === 0) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Retrying upload in ${retryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
        }
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      return data.image_url;
    } catch (error) {
      console.error(`Upload attempt ${retryCount + 1} failed:`, error);
      
      // If it's a connection error or network error, retry
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying upload in ${retryCount * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          continue;
        }
      }
      
      // If we've exhausted retries or it's not a retryable error, throw
      if (retryCount >= maxRetries - 1) {
        throw new Error(`Failed to upload image after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }

  throw new Error(`Failed to upload image after ${maxRetries} attempts`);
};

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

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
      // Store current URL before redirecting
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
    if (error.message === 'No authentication token found' || 
        error.message === 'Session expired. Please login again.') {
      throw error; // Let the dashboard handle these specific errors
    }
    console.error('API call error:', error);
    throw error;
  }
};

// Plant API calls
export const plantApi = {
  // Get all plants for the current user
  getPlants: async () => {
    try {
      const data = await apiCall('/api/plants/dashboard');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting plants:', error);
      throw error;
    }
  },

  // Get a specific plant
  getPlant: async (plantId) => {
    try {
      const data = await apiCall(`/api/plants/${plantId}`);
      return data;
    } catch (error) {
      console.error('Error getting plant:', error);
      throw error;
    }
  },

  // Create a new plant
  createPlant: async (plantData) => {
    try {
      // Upload image first if exists
      let imageUrl = plantData.image_url;
      if (plantData.imageFile) {
        imageUrl = await uploadImage(plantData.imageFile);
      }

      // Create plant with image URL using apiCall helper
      const data = await apiCall('/api/plants/new', 'POST', {
        ...plantData,
        image_url: imageUrl,
      });

      return data;
    } catch (error) {
      console.error('Error creating plant:', error);
      throw error;
    }
  },

  // Update a plant
  updatePlant: async (plantId, plantData, imageFile) => {
    try {
      // Upload new image if exists
      let imageUrl = plantData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Update plant with new image URL using apiCall helper
      const data = await apiCall(`/api/plants/edit/${plantId}`, 'PUT', {
        ...plantData,
        image_url: imageUrl,
      });

      return data;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  },

  // Delete a plant
  deletePlant: async (plantId) => {
    try {
      const response = await apiCall(`/api/plants/${plantId}`, 'DELETE');
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
    return uploadImage(file);
  },

  // Add a growth record to a plant
  addGrowthRecord: async (plantId, growthData) => {
    try {
      const data = await apiCall(`/api/plants/${plantId}/growth`, 'POST', growthData);
      return data;
    } catch (error) {
      console.error('Error adding growth record:', error);
      throw error;
    }
  },

  // Update a growth record
  updateGrowthRecord: async (plantId, recordId, growthData) => {
    try {
      const data = await apiCall(`/api/plants/${plantId}/growth/${recordId}`, 'PUT', growthData);
      return data;
    } catch (error) {
      console.error('Error updating growth record:', error);
      throw error;
    }
  },

  // Delete a growth record
  deleteGrowthRecord: async (plantId, recordId) => {
    try {
      const data = await apiCall(`/api/plants/${plantId}/growth/${recordId}`, 'DELETE');
      return data;
    } catch (error) {
      console.error('Error deleting growth record:', error);
      throw error;
    }
  }
}; 