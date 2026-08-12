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
            @open-building="onOpenBuilding" @upgraded="refreshBuildingsAfterUpgrade" />

        <!-- Team Stats Panel - TOP LEFT -->
        <TeamStats :selectedTeamId="selectedTeamId" :teams="teams" :start-collapsed="teamStatsCollapsed"
            :team-resources="teamResources" :buildings="buildings" :team-multipliers="teamMultipliers"
            @collapsed-changed="onTeamStatsCollapsed" />

        <!-- Team Selection - BOTTOM RIGHT -->
        <TeamSelection :teams="teams" :initial-team-id="selectedTeamId" :start-collapsed="teamSelCollapsed"
            @team-selected="handleTeamSelected" @collapsed-changed="onTeamSelCollapsed" />
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
import { parseBackendBuildings, getBuildingImagePath, resolveDisplayName } from '@/utils/buildingHelper';
import apiService from '@/services/apiService';
import easterEggLocations from '@/data/easterEggLocations.json';
import { cacheGet, cacheSet } from '@/utils/useCache';
import { playRandomUpgradeSound } from '@/utils/useSound';

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
            teamMultipliers: [],
            easterEggs: easterEggLocations,
            selectedTeamId: cacheGet('selectedTeamId', null),
            selectedBuildingId: null,
            selectedBuilding: null,
            isMobile: window.innerWidth <= 768,
            showScrollHint: false,
            scrollHintFading: false,
            teamStatsCollapsed: cacheGet('panel:teamStats', window.innerWidth <= 768),
            teamSelCollapsed: cacheGet('panel:teamSelection', window.innerWidth <= 768),
            resourceChangeEventSource: null,
            buildingUpgradeEventSource: null,
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
        await this.loadMultipliers();
        this.connectResourceChangeStream();
        this.connectBuildingUpgradeStream();
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
        async loadMultipliers() {
            try {
                const data = await apiService.getMultipliers();
                this.teamMultipliers = data.teamMultipliers;
            } catch (error) {
                console.error('Failed to load multipliers:', error);
                this.teamMultipliers = [];
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
                        const displayName = resolveDisplayName(incomingSource.source);
                        const existingSource = teamEntry.resources.find(r => r.source === displayName);
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
        connectBuildingUpgradeStream() {
            if (this.buildingUpgradeEventSource) {
                this.buildingUpgradeEventSource.close();
            }

            this.buildingUpgradeEventSource = apiService.getBuildingUpgradeStream();

            // Lightweight live patch: the stream only carries {team_name, building_name,
            // new_level}, not the new upgradeOptions — enough to keep level badges/icons
            // live everywhere (map markers, tabs, Log page) for every team's upgrades,
            // but not enough to refresh "what's needed next". That part is handled by
            // refreshBuildingsAfterUpgrade(), called only after the current user's own
            // successful upgrade.
            const handleUpgrade = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.team_name || !data.building_name) return;

                    const team = this.teams.find(t => t.name === data.team_name);
                    if (!team) return;

                    const buildingDisplayName = resolveDisplayName(data.building_name);
                    const building = this.buildings.find(
                        b => b.teamId === team.id && b.name === buildingDisplayName
                    );
                    if (!building) return;

                    building.level = data.new_level;
                    building.icon = getBuildingImagePath(building.name, data.new_level);

                    if (this.selectedBuilding && this.selectedBuilding.teamId === building.teamId
                        && this.selectedBuilding.name === building.name) {
                        this.selectedBuilding = { ...building, teamName: this.selectedBuilding.teamName };
                    }
                } catch (e) {
                    console.error('[BuildingUpgradeStream] Failed to parse SSE message:', e);
                }
            };

            this.buildingUpgradeEventSource.addEventListener('history', handleUpgrade);
            this.buildingUpgradeEventSource.addEventListener('upgrade', handleUpgrade);

            // Only on genuinely live events, not the 'history' replay on connect - otherwise
            // reloading the page would blast through every past upgrade's sound/refresh at once.
            this.buildingUpgradeEventSource.addEventListener('upgrade', (event) => {
                playRandomUpgradeSound();
                try {
                    const data = JSON.parse(event.data);
                    const team = this.teams.find(t => t.name === data.team_name);
                    // Multipliers are server-derived (no cheap client-side patch) and only
                    // ever shown for the currently selected team, so only refetch when
                    // this event is actually about that team.
                    if (team && team.id === this.selectedTeamId) {
                        this.refreshMultipliers();
                    }
                } catch (e) {
                    // handleUpgrade() above already logs parse failures for this same event.
                }
            });

            this.buildingUpgradeEventSource.onerror = (e) => {
                console.error('[BuildingUpgradeStream] SSE error:', e);
            };
        },
        // Called after the current user's own successful upgrade — the stream can't
        // supply the new upgradeOptions, so this is the "quick and dumb" refresh for that.
        async refreshBuildingsAfterUpgrade() {
            try {
                const data = await apiService.getBuildings();
                this.buildings = parseBackendBuildings(data.teamsBuildings, buildingLocations);
            } catch (error) {
                console.error('Failed to refresh buildings after upgrade:', error);
                return;
            }

            // Buildings are re-parsed with fresh sequential ids, so re-match the open
            // modal's building by its stable (teamId, name) key rather than by id.
            if (this.selectedBuilding) {
                const fresh = this.buildings.find(
                    b => b.teamId === this.selectedBuilding.teamId && b.name === this.selectedBuilding.name
                );
                if (fresh) this.selectedBuilding = { ...fresh, teamName: this.selectedBuilding.teamName };
            }

            this.refreshMultipliers();
        },
        async refreshMultipliers() {
            try {
                const data = await apiService.getMultipliers();
                this.teamMultipliers = data.teamMultipliers;
            } catch (error) {
                console.error('Failed to refresh multipliers:', error);
            }
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
        if (this.buildingUpgradeEventSource) this.buildingUpgradeEventSource.close();
        window.removeEventListener('resize', this.onResize);
    }
}
</script>

<style scoped src="@/assets/map.css"></style>