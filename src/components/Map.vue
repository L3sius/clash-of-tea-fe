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
            </div>
        </div>

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

export default {
    name: 'Map',
    components: {
        TeamSelection
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
            selectedTeamId: null
        }
    },
    created() {
        this.mapZoom = useMapZoom();
    },
    methods: {
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
            console.log('Selected team:', teamId);
            // Later: load team buildings, stats, etc.
        }
    },
    beforeUnmount() {
        this.mapZoom.dispose();
    }
}
</script>

<style scoped src="@/assets/map.css"></style>