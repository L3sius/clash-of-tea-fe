<template>
    <div class="legend-container">
        <div class="legend-header">
            <h3 class="legend-title">Teams</h3>
            <div class="legend-decoration"></div>
        </div>

        <div class="legend-content">
            <div v-for="team in teams" :key="team.id" class="team-item"
                :class="{ 'selected': selectedTeamId === team.id }" @click="selectTeam(team.id)">
                <div class="team-marker"></div>
                <span class="team-name">{{ team.name }}</span>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'TeamSelection',
    props: {
        teams: {
            type: Array,
            default: () => [
                { id: 1, name: 'Crimson Raiders' },
                { id: 2, name: 'Azure Kingdom' },
                { id: 3, name: 'Golden Empire' },
                { id: 4, name: 'Shadow Legion' }
            ]
        },
        initialTeamId: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            selectedTeamId: this.initialTeamId
        }
    },
    methods: {
        selectTeam(teamId) {
            this.selectedTeamId = teamId;
            this.$emit('team-selected', teamId);
        }
    },
    mounted() {
        this.$emit('team-selected', this.selectedTeamId);
    }
}
</script>

<style scoped src="@/assets/teamSelection.css"></style>