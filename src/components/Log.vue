<template>
    <div class="log-page">
        <div class="log-container">

            <!-- Left - Teams & Players / Buildings -->
            <div class="log-section teams-roster">
                <div class="section-header">
                    <h2 class="section-title">🛡️ Teams & Roster</h2>
                </div>
                <div class="section-ornament"></div>

                <!-- Players / Buildings toggle -->
                <div class="stats-filter-tabs">
                    <button class="filter-tab" :class="{ active: rosterView === 'players' }"
                        @click="rosterView = 'players'">
                        ⚔️ Players
                    </button>
                    <button class="filter-tab" :class="{ active: rosterView === 'buildings' }"
                        @click="rosterView = 'buildings'">
                        🏰 Buildings
                    </button>
                </div>

                <div v-if="isLoadingTeams || isLoadingBuildings" class="loading-state">
                    <div class="loading-spinner">⏳</div>
                    <p>Loading...</p>
                </div>
                <div v-else class="teams-scroll">
                    <div v-for="team in teams" :key="team.id" class="team-block">
                        <div class="team-header">
                            <div class="team-badge" :style="{ backgroundColor: getTeamColor(team.id) }"></div>
                            <h3 class="team-name">{{ team.name }}</h3>
                            <span class="player-count">
                                <template v-if="rosterView === 'players'">
                                    {{ getTotalPlayerCount(team) }} explorers
                                </template>
                                <template v-else>
                                    {{ getTeamBuildings(team.id).length }} buildings
                                </template>
                            </span>
                        </div>

                        <!-- Players view -->
                        <template v-if="rosterView === 'players'">
                            <div class="players-list two-column">
                                <div v-for="playerData in getPlayersWithAlts(team)" :key="playerData.main"
                                    class="player-group"
                                    @mouseenter="handlePlayerHover($event, team.id, playerData.main)"
                                    @mouseleave="hideTooltip">
                                    <div class="player-item main-player"
                                        :class="{ 'has-alts': playerData.alts.length > 0 }">
                                        <span class="player-marker">▸</span>
                                        <span class="player-name">{{ playerData.main }}</span>
                                        <span v-if="playerData.alts.length > 0" class="alt-badge">{{
                                            playerData.alts.length }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Tooltip for alts -->
                            <div v-if="activeTooltip && activeTooltip.teamId === team.id" class="player-tooltip"
                                :style="tooltipStyle">
                                <div class="tooltip-header">Alt Accounts</div>
                                <div class="tooltip-alts">
                                    <div v-for="alt in activeTooltip.alts" :key="alt" class="tooltip-alt">
                                        {{ alt }}
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Buildings view -->
                        <template v-else>
                            <div class="buildings-list">
                                <div v-for="building in getTeamBuildings(team.id)" :key="building.name"
                                    class="building-row">
                                    <span class="building-row__name">{{ building.name }}</span>
                                    <span class="building-row__level"
                                        :class="building.level > 0 ? 'level--upgraded' : 'level--zero'">
                                        Lvl {{ building.level }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Center - Player Stats (MVPs) -->
            <div class="log-section player-stats">
                <div class="section-header">
                    <h2 class="section-title">🏆 MVPs</h2>
                </div>
                <div class="section-ornament"></div>

                <div class="stats-filter-tabs">
                    <button class="filter-tab" :class="{ active: statsFilter === 'value' }"
                        @click="statsFilter = 'value'">
                        💰 Total Value
                    </button>
                    <button class="filter-tab" :class="{ active: statsFilter === 'drops' }"
                        @click="statsFilter = 'drops'">
                        📦 Total Drops
                    </button>
                </div>

                <div class="sort-toggle">
                    <button class="sort-btn" :class="{ active: sortDescending }"
                        @click="sortDescending = !sortDescending" title="Toggle sort order">
                        {{ sortDescending ? '↓ Highest First' : '↑ Lowest First' }}
                    </button>
                </div>

                <div v-if="isLoadingStats" class="loading-state">
                    <div class="loading-spinner">⏳</div>
                    <p>Loading stats...</p>
                </div>
                <div v-else class="stats-scroll">
                    <div v-for="(player, index) in sortedPlayerStats" :key="`${player.teamId}-${player.name}`"
                        class="stat-item" :class="{ 'top-three': index < 3 }">
                        <div class="stat-rank">{{ index + 1 }}</div>
                        <div class="stat-content">
                            <div class="stat-player-name">{{ player.name }}</div>
                            <div class="stat-team-name" :style="{ color: getTeamColor(player.teamId) }">
                                {{ player.teamName }}
                            </div>
                        </div>
                        <div class="stat-value">
                            <template v-if="statsFilter === 'value'">{{ formatValue(player.totalValue) }}</template>
                            <template v-else>{{ player.totalDrops }}</template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right - Building MVPs -->
            <div class="log-section building-mvps">
                <div class="section-header">
                    <h2 class="section-title">🏰 Building MVPs</h2>
                </div>
                <div class="section-ornament"></div>

                <div class="stats-filter-tabs">
                    <button class="filter-tab" :class="{ active: buildingFilter === 'value' }"
                        @click="buildingFilter = 'value'">
                        💰 By Value
                    </button>
                    <button class="filter-tab" :class="{ active: buildingFilter === 'drops' }"
                        @click="buildingFilter = 'drops'">
                        📦 By Drops
                    </button>
                </div>

                <div v-if="isLoadingStats" class="loading-state">
                    <div class="loading-spinner">⏳</div>
                    <p>Loading building stats...</p>
                </div>
                <div v-else class="building-mvp-scroll">
                    <div v-for="building in buildingMVPs" :key="building.name" class="building-mvp-item">
                        <span class="building-name">{{ formatBuildingName(building.name) }}</span>
                        <template v-if="building.mvp">
                            <span class="player-name">{{ building.mvp.playerName }}</span>
                            <span class="mvp-team" :style="{ color: getTeamColor(building.mvp.teamId) }">{{
                                building.mvp.teamName }}</span>
                            <span class="mvp-value">
                                <template v-if="buildingFilter === 'value'">{{ formatValue(building.mvp.value)
                                }}</template>
                                <template v-else>{{ building.mvp.drops }} drops</template>
                            </span>
                        </template>
                        <span v-else class="no-mvp">No activity yet</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import apiService from '@/services/apiService';
import buildingLocations from '@/data/buildingLocations.json';
import { parseBackendBuildings } from '@/utils/buildingHelper';

export default {
    name: 'LogPage',
    data() {
        return {
            isLoadingTeams: true,
            isLoadingBuildings: true,
            isLoadingStats: true,
            tooltipStyle: {},
            activeTooltip: null,
            rosterView: 'players',
            statsFilter: 'value',
            buildingFilter: 'value',
            sortDescending: true,
            playerStats: [],
            teams: [],
            buildings: [],
            teamColors: ['#8b5a3c', '#d4af37', '#4a7c8b', '#8b4a4a', '#5a8b5a', '#8b5a8b'],
        };
    },
    computed: {
        sortedPlayerStats() {
            const allPlayers = [];
            this.playerStats.forEach(teamStat => {
                teamStat.players.forEach(player => {
                    allPlayers.push({
                        name: player.name,
                        teamId: teamStat.teamId,
                        teamName: teamStat.teamName,
                        totalDrops: player.totalDrops,
                        totalValue: player.totalValue,
                    });
                });
            });
            return allPlayers.sort((a, b) => {
                const valA = this.statsFilter === 'value' ? a.totalValue : a.totalDrops;
                const valB = this.statsFilter === 'value' ? b.totalValue : b.totalDrops;
                return this.sortDescending ? valB - valA : valA - valB;
            });
        },
        buildingMVPs() {
            return buildingLocations.map(b => b.name).map(buildingName => {
                let mvpPlayer = null;
                let maxValue = 0;

                this.playerStats.forEach(teamStat => {
                    teamStat.players.forEach(player => {
                        if (!player.breakdown?.length) return;
                        const buildingStats = player.breakdown.filter(
                            b => this.normalizeBuilding(b.category) === buildingName
                        );
                        if (!buildingStats.length) return;

                        const total = buildingStats.reduce((sum, stat) => {
                            return sum + (this.buildingFilter === 'value' ? (stat.value || 0) : (stat.count || 0));
                        }, 0);

                        if (total > maxValue) {
                            maxValue = total;
                            mvpPlayer = {
                                playerName: player.name,
                                teamId: teamStat.teamId,
                                teamName: teamStat.teamName,
                                value: buildingStats.reduce((sum, s) => sum + (s.value || 0), 0),
                                drops: buildingStats.reduce((sum, s) => sum + (s.count || 0), 0),
                            };
                        }
                    });
                });

                return { name: buildingName, mvp: mvpPlayer };
            });
        },
    },
    async created() {
        await this.loadTeams();
        await Promise.all([this.loadBuildings(), this.loadPlayerStats()]);
    },
    methods: {
        async loadTeams() {
            try {
                this.isLoadingTeams = true;
                const data = await apiService.getTeams();
                this.teams = data.teams.map(team => ({
                    id: team.id,
                    name: team.name,
                    players: team.players,
                }));
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
        async loadPlayerStats() {
            try {
                this.isLoadingStats = true;
                const data = await apiService.getPlayerStats();
                this.playerStats = data.teamStats;
            } catch (error) {
                console.error('Failed to load player stats:', error);
                this.playerStats = [];
            } finally {
                this.isLoadingStats = false;
            }
        },
        getTeamBuildings(teamId) {
            return this.buildings
                .filter(b => b.teamId === teamId)
                .sort((a, b) => a.name.localeCompare(b.name));
        },
        getTeamColor(teamId) {
            return this.teamColors[(teamId - 1) % this.teamColors.length];
        },
        getPlayersWithAlts(team) {
            return team.players.map(player => ({
                main: player.name,
                alts: player.alts || [],
            }));
        },
        getTotalPlayerCount(team) {
            return team.players.length;
        },
        handlePlayerHover(event, teamId, playerName) {
            const team = this.teams.find(t => t.id === teamId);
            if (!team) return;
            const player = team.players.find(p => p.name === playerName);
            if (!player?.alts?.length) return;

            const rect = event.currentTarget.getBoundingClientRect();
            this.activeTooltip = { teamId, playerName, alts: player.alts };
            this.tooltipStyle = { left: `${rect.right + 10}px`, top: `${rect.top}px` };
        },
        hideTooltip() {
            this.activeTooltip = null;
        },
        formatValue(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value.toString();
        },
        formatBuildingName(name) {
            return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        },
        normalizeBuilding(categoryName) {
            return categoryName.toLowerCase().replace(/\s+/g, '_');
        },
    },
};
</script>

<style scoped src="@/assets/log.css"></style>