<template>
    <div class="map-container" style="background-image: url('/images/water.png');">
        <!-- Loading indicator -->
        <div v-if="!imageLoaded || isLoadingTeams" class="loading-overlay">
            <div class="loading-text">{{ loadingMessage }}</div>
        </div>

        <!-- Map wrapper - with zoom functionality -->
        <div class="map-wrapper">
            <div class="map-scene" ref="mapScene">
                <img :src="mapImageUrl" alt="Map" class="map-image" @load="onImageLoad" draggable="false" />

                <div class="buildings-layer">
                    <BuildingMarker v-for="building in visibleBuildings" :key="building.id" :building="building"
                        :is-selected="selectedBuildingId === building.id"
                        :style="{ left: building.x + '%', top: building.y + '%' }"
                        @click="handleBuildingClick(building)" />
                </div>
            </div>
        </div>

        <!-- Building Details Modal -->
        <BuildingDetailsModal :building="selectedBuilding" @close="closeModal" />

        <!-- Team Stats Panel - TOP LEFT -->
        <TeamStats :selectedTeamId="selectedTeamId" :teams="teams" />

        <!-- Team Selection - BOTTOM RIGHT -->
        <TeamSelection :teams="teams" @team-selected="handleTeamSelected" />

        <!-- Zoom controls -->
        <div class="zoom-controls">
            <button @click="handleZoomIn" class="zoom-btn" title="Zoom In">+</button>
            <button @click="handleZoomOut" class="zoom-btn" title="Zoom Out">−</button>
            <button @click="handleResetZoom" class="zoom-btn" title="Reset">⟲</button>
        </div>
    </div>
</template>

<script>
import { useMapZoom } from '@/utils/useMapZoom';
import TeamSelection from './TeamSelection.vue';
import TeamStats from './TeamStats.vue';
import BuildingMarker from './BuildingMarker.vue';
import buildingLocations from '@/data/buildingLocations.json';
import BuildingDetailsModal from './BuildingDetailsModal.vue';
import { parseBackendBuildings } from '@/utils/buildingHelper';
import apiService from '@/services/apiService';

export default {
    name: 'Map',
    components: {
        TeamSelection,
        TeamStats,
        BuildingMarker,
        BuildingDetailsModal
    },
    data() {
        return {
            imageLoaded: false,
            isLoadingTeams: true,
            mapImageUrl: '/images/map.png',
            mapZoom: null,
            teams: [],
            buildings: [],
            selectedTeamId: null,
            selectedBuildingId: null,
            selectedBuilding: null,
        }
    },
    computed: {
        visibleBuildings() {
            if (!this.selectedTeamId) return [];
            return this.buildings.filter(building => building.teamId === this.selectedTeamId);
        },
        loadingMessage() {
            if (!this.imageLoaded) return 'Loading map...';
            if (this.isLoadingTeams) return 'Loading teams...';
            return 'Loading...';
        }
    },
    async created() {
        this.mapZoom = useMapZoom();
        await this.loadTeams();
        await this.loadBuildings();
    },
    methods: {
        async loadTeams() {
            try {
                this.isLoadingTeams = true;
                const data = await apiService.getTeams();

                // Transform backend response to match component structure
                this.teams = data.teams.map((team) => ({
                    id: team.id,
                    name: team.name,
                    players: team.players.map(player => ({
                        name: player.name,
                        alts: player.alts
                    }))
                }));

                console.log('Loaded teams:', this.teams);
            } catch (error) {
                console.error('Failed to load teams:', error);
                // Optionally set fallback teams or show error message
                this.teams = [];
            } finally {
                this.isLoadingTeams = false;
            }
        },
        async loadBuildings() {
            try {
                // Simulate backend API call
                // In production, replace with: const data = await apiService.getBuildings();
                const backendData = {
                    "teamsBuildings": [
                        {
                            "teamId": 1,
                            "buildings": [
                                {
                                    "building": "Wilderness",
                                    "buildingLevel": 2,
                                    "currentUpgrades": "Unlocked Artio. Twice as much resources from wilderness",
                                    "nextUpgrade": "Unlocks Vet'ion. Three times as much resources",
                                    "resourcesForNextUpgrade": {
                                        "minerals": [
                                            { "name": "Gold", "quantity": 5000 },
                                            { "name": "Bones", "quantity": 10000 }
                                        ],
                                        "items": [
                                            { "name": "Blood Shard", "quantity": 2 },
                                            { "name": "Ancient emblem", "quantity": 2 }
                                        ]
                                    }
                                },
                                {
                                    "building": "Mine",
                                    "buildingLevel": 5,
                                    "currentUpgrades": "Increased mining speed",
                                    "nextUpgrade": "Advanced mining tools",
                                    "resourcesForNextUpgrade": {
                                        "minerals": [
                                            { "name": "Iron", "quantity": 3000 }
                                        ],
                                        "items": []
                                    }
                                }
                            ]
                        },
                        {
                            "teamId": 2,
                            "buildings": [
                                {
                                    "building": "Castle",
                                    "buildingLevel": 8,
                                    "currentUpgrades": "Fortified walls",
                                    "nextUpgrade": "Maximum defense",
                                    "resourcesForNextUpgrade": {
                                        "minerals": [
                                            { "name": "Stone", "quantity": 15000 }
                                        ],
                                        "items": [
                                            { "name": "Dragon Scale", "quantity": 1 }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                };

                this.buildings = parseBackendBuildings(backendData.teamsBuildings, buildingLocations);
            } catch (error) {
                console.error('Failed to load buildings:', error);
                this.buildings = [];
            }
        },
        onImageLoad() {
            this.imageLoaded = true;
            this.$nextTick(() => {
                this.mapZoom.initialize(this.$refs.mapScene);
            });
        },
        handleZoomIn() {
            this.mapZoom.zoomIn(this.$refs.mapScene);
        },
        handleZoomOut() {
            this.mapZoom.zoomOut(this.$refs.mapScene);
        },
        handleResetZoom() {
            this.mapZoom.resetZoom();
        },
        handleTeamSelected(teamId) {
            this.selectedTeamId = teamId;
            this.selectedBuildingId = null;
            console.log('Selected team:', teamId);
        },
        handleBuildingClick(building) {
            this.selectedBuildingId = building.id;
            this.selectedBuilding = building;
        },
        closeModal() {
            this.selectedBuilding = null;
            this.selectedBuildingId = null;
        }
    },
    beforeUnmount() {
        this.mapZoom.dispose();
    }
}
</script>

<style scoped src="@/assets/map.css"></style>