<template>
    <div class="map-container" style="background-image: url('/images/water.png');">
        <!-- Loading indicator -->
        <div v-if="!imageLoaded || isLoadingTeams || isLoadingBuildings" class="loading-overlay">
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
            isLoadingBuildings: true,
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
            if (this.isLoadingBuildings) return 'Loading buildings...';
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
                this.teams = [];
            } finally {
                this.isLoadingTeams = false;
            }
        },
        async loadBuildings() {
            try {
                this.isLoadingBuildings = true;
                const data = await apiService.getBuildings();

                // Use the helper function from utils
                this.buildings = parseBackendBuildings(data.teamsBuildings, buildingLocations);

                console.log('Loaded buildings:', this.buildings);
            } catch (error) {
                console.error('Failed to load buildings:', error);
                this.buildings = [];
            } finally {
                this.isLoadingBuildings = false;
            }
        },
        onImageLoad() {
            this.imageLoaded = true;
            this.$nextTick(() => {
                this.mapZoom.initialize(this.$refs.mapScene);
            });
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