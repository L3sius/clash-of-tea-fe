<template>
    <div class="map-container" style="background-image: url('/images/water.png');">
        <!-- Loading indicator -->
        <div v-if="!imageLoaded || isLoadingTeams || isLoadingBuildings" class="loading-overlay">
            <div class="loading-text">{{ loadingMessage }}</div>
        </div>

        <!-- Map wrapper - horizontal scroll on mobile, zoom on desktop -->
        <div class="map-wrapper" ref="mapWrapper">
            <div class="map-scene" ref="mapScene">
                <img :src="mapImageUrl" alt="Map" class="map-image" @load="onImageLoad" draggable="false" />

                <div class="buildings-layer">
                    <BuildingMarker v-for="building in visibleBuildings" :key="building.id" :building="building"
                        :is-selected="selectedBuildingId === building.id"
                        :style="{ left: building.x + '%', top: building.y + '%' }"
                        @click="handleBuildingClick(building)" />

                    <!-- Easter egg markers -->
                    <EasterEggMarker v-for="(egg, index) in easterEggs" :key="'egg-' + index" :egg="egg"
                        :style="{ left: egg.x + '%', top: egg.y + '%' }" />
                </div>
            </div>
        </div>

        <!-- Mobile scroll hint -->
        <div v-if="isMobile && imageLoaded && showScrollHint" class="mobile-scroll-hint"
            :class="{ 'fade-out': scrollHintFading }">
            ← scroll to explore map →
        </div>

        <!-- Building Details Modal -->
        <BuildingDetailsModal :building="selectedBuilding" :team-resources="selectedTeamResources" @close="closeModal"
            @open-building="onOpenBuilding" />

        <!-- Team Stats Panel - TOP LEFT -->
        <TeamStats :selectedTeamId="selectedTeamId" :teams="teams" :start-collapsed="teamStatsCollapsed"
            :team-resources="teamResources" @collapsed-changed="onTeamStatsCollapsed" />

        <!-- Team Selection - BOTTOM RIGHT -->
        <TeamSelection :teams="teams" :initial-team-id="selectedTeamId" :start-collapsed="teamSelCollapsed"
            @team-selected="handleTeamSelected" @collapsed-changed="onTeamSelCollapsed" />

        <!-- Compass Navigation - BOTTOM LEFT -->
        <CompassNavigation :start-collapsed="compassCollapsed" />
    </div>
</template>

<script>
import { useMapZoom } from '@/utils/useMapZoom';
import TeamSelection from './TeamSelection.vue';
import TeamStats from './TeamStats.vue';
import BuildingMarker from './BuildingMarker.vue';
import buildingLocations from '@/data/buildingLocations.json';
import BuildingDetailsModal from './BuildingDetailsModal.vue';
import EasterEggMarker from './EasterEggMarker.vue';
import { parseBackendBuildings } from '@/utils/buildingHelper';
import apiService from '@/services/apiService';
import easterEggLocations from '@/data/easterEggLocations.json';
import { cacheGet, cacheSet } from '@/utils/useCache';

export default {
    name: 'Map',
    components: {
        TeamSelection,
        TeamStats,
        BuildingMarker,
        BuildingDetailsModal,
        EasterEggMarker,
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
            teamResources: [],
            easterEggs: easterEggLocations,
            selectedTeamId: cacheGet('selectedTeamId', null),
            selectedBuildingId: null,
            selectedBuilding: null,
            isMobile: window.innerWidth <= 768,
            showScrollHint: false,
            scrollHintFading: false,
            teamStatsCollapsed: cacheGet('panel:teamStats', window.innerWidth <= 768),
            teamSelCollapsed: cacheGet('panel:teamSelection', window.innerWidth <= 768),
            compassCollapsed: cacheGet('panel:compass', window.innerWidth <= 768),
            resourceChangeEventSource: null,
        }
    },
    computed: {
        visibleBuildings() {
            if (!this.selectedTeamId) return [];
            return this.buildings.filter(building => building.teamId === this.selectedTeamId);
        },
        selectedTeamResources() {
            if (!this.selectedTeamId) return [];
            const teamData = this.teamResources.find(t => t.teamId === this.selectedTeamId);
            return teamData ? teamData.resources : [];
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
        await this.loadResources();
        this.connectResourceChangeStream();
        window.addEventListener('resize', this.onResize);
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

                if (!this.selectedTeamId && this.teams.length > 0) {
                    this.handleTeamSelected(this.teams[0].id, false);
                }
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
                this.buildings = parseBackendBuildings(data.teamsBuildings, buildingLocations);
            } catch (error) {
                console.error('Failed to load buildings:', error);
                this.buildings = [];
            } finally {
                this.isLoadingBuildings = false;
            }
        },
        async loadResources() {
            try {
                const data = await apiService.getTeamsResources();
                this.teamResources = data.teamResources;
            } catch (error) {
                console.error('Failed to load resources:', error);
                this.teamResources = [];
            }
        },
        connectResourceChangeStream() {
            if (this.resourceChangeEventSource) {
                this.resourceChangeEventSource.close();
            }

            this.resourceChangeEventSource = apiService.getResourcesChangeStream();

            this.resourceChangeEventSource.addEventListener('resource_change', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const incoming = data.team_resources;
                    if (!incoming) return;

                    const teamEntry = this.teamResources.find(t => t.teamId === incoming.teamId);
                    if (!teamEntry) return;

                    for (const incomingSource of incoming.resources) {
                        const existingSource = teamEntry.resources.find(r => r.source === incomingSource.source);
                        if (!existingSource) continue;

                        for (const incomingTier of incomingSource.tiers) {
                            const existingTier = existingSource.tiers.find(t => t.tier === incomingTier.tier);
                            if (existingTier) {
                                existingTier.quantity += incomingTier.quantity;
                            }
                        }
                    }

                    this.teamResources = [...this.teamResources];
                } catch (e) {
                    console.error('[ResourceStream] Failed to parse SSE message:', e);
                }
            });

            this.resourceChangeEventSource.onerror = (e) => {
                console.error('[ResourceStream] SSE error:', e);
            };
        },
        onImageLoad() {
            this.imageLoaded = true;
            this.$nextTick(() => {
                if (this.isMobile) {
                    this.centerMapScroll();
                    this.showMobileScrollHint();
                } else {
                    this.mapZoom.initialize(this.$refs.mapScene);
                }
            });
        },
        centerMapScroll() {
            const wrapper = this.$refs.mapWrapper;
            const scene = this.$refs.mapScene;
            if (!wrapper || !scene) return;
            wrapper.scrollLeft = (scene.scrollWidth - wrapper.clientWidth) / 2;
        },
        showMobileScrollHint() {
            this.showScrollHint = true;
            setTimeout(() => {
                this.scrollHintFading = true;
                setTimeout(() => { this.showScrollHint = false; }, 1000);
            }, 2500);
        },
        onResize() {
            this.isMobile = window.innerWidth <= 768;
        },
        handleTeamSelected(teamId, isUserInteraction = false) {
            this.selectedTeamId = teamId;
            if (isUserInteraction) cacheSet('selectedTeamId', teamId);
            this.selectedBuildingId = null;
        },
        handleBuildingClick(building) {
            this.selectedBuildingId = building.id;
            const team = this.teams.find(t => t.id === building.teamId);
            this.selectedBuilding = { ...building, teamName: team?.name ?? building.teamName };
        },
        closeModal() {
            this.selectedBuilding = null;
            this.selectedBuildingId = null;
        },
        onTeamStatsCollapsed(val) { this.teamStatsCollapsed = val; cacheSet('panel:teamStats', val) },
        onTeamSelCollapsed(val) { this.teamSelCollapsed = val; cacheSet('panel:teamSelection', val) },
        onOpenBuilding(buildingName) {
            const target = this.buildings.find(
                b => b.name.toLowerCase() === buildingName.toLowerCase()
                    && b.teamId === this.selectedTeamId
            );
            if (target) {
                const team = this.teams.find(t => t.id === target.teamId);
                this.selectedBuilding = { ...target, teamName: team?.name ?? target.teamName };
            }
        },
    },
    beforeUnmount() {
        this.mapZoom.dispose();
        if (this.resourceChangeEventSource) this.resourceChangeEventSource.close();
        window.removeEventListener('resize', this.onResize);
    }
}
</script>

<style scoped src="@/assets/map.css"></style>