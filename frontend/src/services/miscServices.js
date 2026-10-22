import API from './api';

export const messageService = {
  getChatHistory: async (requestId) => {
    const response = await API.get(`/messages/${requestId}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await API.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await API.put(`/messages/${id}`);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await API.delete(`/messages/${id}`);
    return response.data;
  }
};

export const ratingService = {
  postRating: async (ratingData) => {
    const response = await API.post('/ratings', ratingData);
    return response.data;
  },

  getUserRatings: async (userId) => {
    const response = await API.get(`/ratings/user/${userId}`);
    return response.data;
  },

  updateRating: async (id, ratingData) => {
    const response = await API.put(`/ratings/${id}`, ratingData);
    return response.data;
  },

  deleteRating: async (id) => {
    const response = await API.delete(`/ratings/${id}`);
    return response.data;
  }
};

export const adminService = {
  getUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },

  getResources: async () => {
    try {
      const response = await API.get('/admin/resources');
      return response.data.content || response.data;
    } catch (e) {
      if (e.response?.status === 404) {
        const fallback = await API.get('/resources');
        return fallback.data.content || fallback.data;
      }
      throw e;
    }
  },

  getSkills: async () => {
    try {
      const response = await API.get('/admin/skills');
      return response.data.content || response.data;
    } catch (e) {
      if (e.response?.status === 404) {
        const fallback = await API.get('/skills');
        return fallback.data.content || fallback.data;
      }
      throw e;
    }
  },

  approveResource: async (id) => {
    const response = await API.put(`/admin/resources/${id}/approve`);
    return response.data;
  },

  rejectResource: async (id) => {
    const response = await API.put(`/admin/resources/${id}/reject`);
    return response.data;
  },

  deleteResource: async (id) => {
    const response = await API.delete(`/admin/resources/${id}`);
    return response.data;
  },

  approveSkill: async (id) => {
    const response = await API.put(`/admin/skills/${id}/approve`);
    return response.data;
  },

  rejectSkill: async (id) => {
    const response = await API.put(`/admin/skills/${id}/reject`);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await API.delete(`/admin/skills/${id}`);
    return response.data;
  },

  suspendUser: async (userId, data = {}) => {
    const response = await API.post(`/admin/users/${userId}/suspend`, data);
    return response.data;
  },

  unsuspendUser: async (userId) => {
    const response = await API.post(`/admin/users/${userId}/unsuspend`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await API.delete(`/admin/resources/${postId}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  }
};

export const statsService = {
  getLiveStats: async () => {
    try {
      const response = await API.get('/stats');
      return response.data;
    } catch (e) {
      // Fallback to /admin/stats if public /stats is not yet deployed on server
      try {
        const adminRes = await API.get('/admin/stats');
        const data = adminRes.data || {};
        return {
          activeStudents: data.totalUsers || 0,
          totalUsers: data.totalUsers || 0,
          resourcesShared: data.approvedResources || data.totalResources || 0,
          totalResources: data.totalResources || 0,
          skillsOffered: data.approvedSkills || data.totalSkills || 0,
          skillSessions: data.approvedSkills || data.totalSkills || 0,
          totalSkills: data.totalSkills || 0,
        };
      } catch (err) {
        return null;
      }
    }
  }
};
