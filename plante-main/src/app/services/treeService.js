const API_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function for API calls
const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Something went wrong');
    }
    return response.json();
};

// Tree services
export const treeService = {
    // Get all trees for the current user
    getAllTrees: async () => {
        return fetchWithAuth(`${API_URL}/trees`);
    },

    // Get a specific tree by ID
    getTree: async (id) => {
        return fetchWithAuth(`${API_URL}/trees/${id}`);
    },

    // Create a new tree
    createTree: async (treeData) => {
        return fetchWithAuth(`${API_URL}/trees`, {
            method: 'POST',
            body: JSON.stringify(treeData)
        });
    },

    // Update a tree
    updateTree: async (id, treeData) => {
        return fetchWithAuth(`${API_URL}/trees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(treeData)
        });
    },

    // Delete a tree
    deleteTree: async (id) => {
        return fetchWithAuth(`${API_URL}/trees/${id}`, {
            method: 'DELETE'
        });
    },

    // Add a growth record to a tree
    addGrowthRecord: async (treeId, recordData) => {
        return fetchWithAuth(`${API_URL}/trees/${treeId}/growth`, {
            method: 'POST',
            body: JSON.stringify(recordData)
        });
    }
}; 