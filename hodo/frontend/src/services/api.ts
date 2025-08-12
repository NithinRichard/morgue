// API Base URL
const API_BASE_URL = 'http://192.168.50.126:3001/api';

// Generic API helper functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Bodies API
export const bodiesAPI = {
  getAll: () => apiRequest('/bodies'),
  getById: (id: string) => apiRequest(`/bodies/${id}`),
  create: (data: any) => apiRequest('/bodies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/bodies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/bodies/${id}`, {
    method: 'DELETE',
  }),
  verify: (id: string, verifiedBy: string) => apiRequest(`/bodies/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify({ verifiedBy }),
  }),
  logVerification: (id: string, data: any) => apiRequest(`/bodies/${id}/verify-log`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Exit Types API
export const exitTypesAPI = {
  getAll: () => apiRequest('/exit-types'),
};

// Exit Statuses API
export const exitStatusesAPI = {
  getAll: () => apiRequest('/exit-statuses'),
};

// Receiver Types API
export const receiverTypesAPI = {
  getAll: () => apiRequest('/receiver-types'),
};

// ID Proof Types API
export const idProofTypesAPI = {
  getAll: () => apiRequest('/id-proof-types'),
};

// Relationships API
export const relationshipsAPI = {
  getAll: () => apiRequest('/relationships'),
};

// Authorization Levels API
export const authorizationLevelsAPI = {
  getAll: () => apiRequest('/authorization-levels'),
};

// Exit Bodies API
export const exitBodiesAPI = {
  getAll: () => apiRequest('/exit-bodies'),
  getById: (id: string) => apiRequest(`/exit-bodies/${id}`),
  create: (data: any) => apiRequest('/exit-bodies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/exit-bodies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/exit-bodies/${id}`, {
    method: 'DELETE',
  }),
  getReceivers: (id: string) => apiRequest(`/exit-bodies/${id}/receivers`),
  getDocuments: (id: string) => apiRequest(`/exit-bodies/${id}/documents`),
  getClearances: (id: string) => apiRequest(`/exit-bodies/${id}/clearances`),
  getWitnesses: (id: string) => apiRequest(`/exit-bodies/${id}/witnesses`),
  getHandoverItems: (id: string) => apiRequest(`/exit-bodies/${id}/handover-items`),
  getAuditTrail: (id: string) => apiRequest(`/exit-bodies/${id}/audit-trail`),
  completeExit: (id: string, data: any) => apiRequest(`/exit-bodies/${id}/complete-exit`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Legacy Exits API (for backward compatibility)
export const exitsAPI = {
  getAll: () => apiRequest('/exits'),
  create: (bodyId: string, data: any) => apiRequest(`/exits/${bodyId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Storage API
export const storageAPI = {
  getActiveBodies: () => apiRequest('/storage-allocations/active-bodies'),
  getStorageAllocations: () => apiRequest('/storage-allocations'),
  createStorageAllocation: (data: any) => apiRequest('/storage-allocations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStorageAllocationStatus: (id: string, status: string, userId: string) => 
    apiRequest(`/storage-allocations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, userId }),
    }),
  getAvailableStorageUnits: (providerId?: number, outletId?: number) => {
    const params = new URLSearchParams();
    if (providerId) params.append('providerId', providerId.toString());
    if (outletId) params.append('outletId', outletId.toString());
    return apiRequest(`/available-storage-units?${params.toString()}`);
  },
};

// Analytics API
export const analyticsAPI = {
  getAdmissionsCount: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return apiRequest(`/analytics/admissions?${params.toString()}`);
  },
  getReleasesCount: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return apiRequest(`/analytics/releases?${params.toString()}`);
  },
  getAverageStorageDuration: () => apiRequest('/analytics/average-storage-duration'),
  getCapacityUsage: () => apiRequest('/analytics/capacity-usage'),
  getOccupancyTrends: () => apiRequest('/analytics/occupancy-trends'),
  getBodyMovements: () => apiRequest('/analytics/body-movements'),
  getDepartmentDeathLogs: () => apiRequest('/analytics/department-death-logs'),
  getPendingVerifications: () => apiRequest('/analytics/pending-verifications'),
};

export default {
  bodies: bodiesAPI,
  exitTypes: exitTypesAPI,
  exitStatuses: exitStatusesAPI,
  receiverTypes: receiverTypesAPI,
  idProofTypes: idProofTypesAPI,
  relationships: relationshipsAPI,
  authorizationLevels: authorizationLevelsAPI,
  exitBodies: exitBodiesAPI,
  exits: exitsAPI,
  storage: storageAPI,
  analytics: analyticsAPI,
}; 