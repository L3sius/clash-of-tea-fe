const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
    async getTeams() {
        try {
            const response = await fetch(`${API_BASE_URL}/getTeams`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error;
        }
    }

    async getBuildings() {
        try {
            const response = await fetch(`${API_BASE_URL}/getBuildings`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching buildings:', error);
            throw error;
        }
    }

    async getMultipliers() {
        try {
            const response = await fetch(`${API_BASE_URL}/getMultipliers`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching multipliers:', error);
            throw error;
        }
    }

    async getTeamsResources() {
        try {
            const response = await fetch(`${API_BASE_URL}/getTeamsResources`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching teams resources:', error);
            throw error;
        }
    }

    async getPlayerStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/getPlayerStats`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching player stats:', error);
            throw error;
        }
    }

    // Throws an Error with `.status` and (for 409 insufficient-drops) `.missing`
    // attached, so callers can distinguish failure reasons.
    async upgradeBuilding(teamId, building, optionId) {
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/upgradeBuilding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId, building, optionId }),
            });
        } catch (error) {
            console.error('Error upgrading building:', error);
            throw error;
        }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.error || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.missing = data.missing;
            throw error;
        }
        return data;
    }

    // Returns an EventSource for the live action stream.
    // Caller is responsible for closing it (eventSource.close()).
    getActionStream() {
        return new EventSource(`${API_BASE_URL}/getActionStream`);
    }

    getBuildingUpgradeStream() {
        return new EventSource(`${API_BASE_URL}/getBuildingUpgradeStream`);
    }

    getResourcesChangeStream() {
        return new EventSource(`${API_BASE_URL}/getResourcesChangeStream`);
    }
}

export default new ApiService();