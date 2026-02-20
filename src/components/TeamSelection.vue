<template>
    <div class="legend-container" :class="{ collapsed: isCollapsed }">
        <!-- Collapsed State - Expand Button -->
        <button v-if="isCollapsed" class="expand-btn" @click="toggleCollapse" title="Expand Teams">
            <span class="hamburger-icon">☰</span>
            <span class="expand-label">Teams</span>
        </button>

        <!-- Expanded State - Full Panel -->
        <div v-else class="legend-panel">
            <div class="legend-header">
                <h3 class="legend-title">Teams</h3>
                <button class="collapse-btn" @click="toggleCollapse" title="Collapse">✕</button>
            </div>
            <div class="legend-decoration"></div>

            <div class="legend-content">
                <div v-for="team in teams" :key="team.id" class="team-item"
                    :class="{ 'selected': selectedTeamId === team.id }" @click="selectTeam(team.id)">
                    <div class="team-marker"></div>
                    <span class="team-name">{{ team.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TeamSelection',
    emits: ['team-selected', 'collapsed-changed'],
    props: {
        teams: {
            type: Array,
            default: () => []
        },
        initialTeamId: {
            type: Number,
            default: 1
        },
        startCollapsed: {
            type: Boolean,
            default: null
        }
    },
    data() {
        const isMobile = window.innerWidth <= 768;
        return {
            selectedTeamId: this.initialTeamId,
            isCollapsed: this.startCollapsed !== null ? this.startCollapsed : isMobile
        }
    },
    methods: {
        selectTeam(teamId) {
            this.selectedTeamId = teamId;
            this.$emit('team-selected', teamId, true);
        },
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            this.$emit('collapsed-changed', this.isCollapsed);
        }
    },
    mounted() {
        this.$emit('team-selected', this.selectedTeamId, false);
    },
    watch: {
        initialTeamId(val) {
            if (val && !this.selectedTeamId) {
                this.selectedTeamId = val;
            }
        }
    }
}
</script>

<style scoped src="@/assets/teamSelection.css"></style>