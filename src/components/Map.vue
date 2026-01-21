<template>
    <div class="map-container" style="background-image: url('/images/water.png');">
        <!-- Loading indicator -->
        <div v-if="!imageLoaded" class="loading-overlay">
            <div class="loading-text">Loading map...</div>
        </div>

        <!-- Map wrapper - with zoom functionality -->
        <div class="map-wrapper">
            <div class="map-scene" ref="mapScene">
                <img :src="mapImageUrl" alt="Map" class="map-image" @load="onImageLoad" draggable="false" />

                <div class="buildings-layer">
                    <BuildingMarker v-for="building in visibleBuildings" :key="building.id" :building="building"
                        :is-selected="selectedBuildingId === building.id"
                        :style="{ left: building.x + '%', top: building.y + '%' }" @click="handleBuildingClick" />
                </div>
            </div>
        </div>

        <!-- Building Details Modal -->
        <BuildingDetailsModal :building="selectedBuilding" @close="closeModal" @upgrade="handleUpgrade" />

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
import BuildingMarker from './BuildingMarker.vue';
import buildingLocations from '@/data/buildingLocations.json';
import BuildingDetailsModal from './BuildingDetailsModal.vue';
import { parseBackendBuildings } from '@/utils/buildingHelper';

export default {
    name: 'Map',
    components: {
        TeamSelection,
        BuildingMarker,
        BuildingDetailsModal
    },
    data() {
        return {
            imageLoaded: false,
            mapImageUrl: '/images/map.png',
            mapZoom: null,
            teams: [
                { id: 1, name: 'Crimson Raiders' },
                { id: 2, name: 'Azure Kingdom' },
                { id: 3, name: 'Golden Empire' },
                { id: 4, name: 'Shadow Legion' }
            ],
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
        }
    },
    created() {
        this.mapZoom = useMapZoom();
        this.loadBuildings();
    },
    methods: {
        async loadBuildings() {
            // Simulate backend API call
            // In production, replace with: const response = await fetch('/api/buildings');
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