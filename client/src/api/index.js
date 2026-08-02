const API_URL = 'http://localhost:5000/api';

// Helper to set headers with JWT
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('carepulse_token');
  const headers = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Handle response errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Public
  submitLead: async (leadData) => {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });
    return handleResponse(response);
  },

  // Auth
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('carepulse_token', data.token);
      localStorage.setItem('carepulse_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('carepulse_token');
    localStorage.removeItem('carepulse_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('carepulse_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('carepulse_token');
  },

  // Protected Lead Routes
  getLeads: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.service) query.append('service', params.service);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    const url = `${API_URL}/leads?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getLeadById: async (id) => {
    const response = await fetch(`${API_URL}/leads/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateLeadStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  addLeadNote: async (id, text) => {
    const response = await fetch(`${API_URL}/leads/${id}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    return handleResponse(response);
  },

  // Analytics
  getAnalytics: async () => {
    const response = await fetch(`${API_URL}/analytics`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};
