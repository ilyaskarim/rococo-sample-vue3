import apiClient from 'config/axios'

class UserService {
  async updateProfile(userData) {
    const response = await apiClient.put('/person/me', {
      first_name: userData.first_name,
      last_name: userData.last_name,
    })
    return response.data
  }

  async getProfile() {
    const response = await apiClient.get('/person/me')
    return response.data
  }
}

export default new UserService()
