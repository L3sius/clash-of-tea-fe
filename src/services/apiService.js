const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
    async getTeams() {
        try {
            const response = await fetch(`${API_BASE_URL}/getTeams`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error;
        }
    }

    async getBuildings() {
        try {
            const response = await fetch(`${API_BASE_URL}/getBuildings`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching buildings:', error);
            throw error;
        }
    }

    async getBuildings() {
        try {
            const response = await fetch(`${API_BASE_URL}/getBuildings`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching buildings:', error);
            throw error;
        }
    }

    async getTeamsResources() {
        try {
            const response = await fetch(`${API_BASE_URL}/getTeamsResources`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching teams resources:', error);
            throw error;
        }
    }

    async getPlayerStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/getPlayerStats`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            throw error;
        }
    }
}

export default new ApiService();