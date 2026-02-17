<template>
    <div class="log-page">
        <!-- Main Log Container -->
        <div class="log-container">

            <!-- Left - Teams & Players -->
            <div class="log-section teams-roster">
                <div class="section-header">
                    <h2 class="section-title">🛡️ Teams & Roster</h2>
                </div>
                <div class="section-ornament"></div>

                <div v-if="isLoadingTeams" class="loading-state">
                    <div class="loading-spinner">⏳</div>
                    <p>Loading teams...</p>
                </div>
                <div v-else class="teams-scroll" style="overflow: visible;">
                    <div v-for="team in teams" :key="team.id" class="team-block">
                        <div class="team-header">
                            <div class="team-badge" :style="{ backgroundColor: getTeamColor(team.id) }"></div>
                            <h3 class="team-name">{{ team.name }}</h3>
                            <span class="player-count">{{ getTotalPlayerCount(team) }} explorers</span>
                        </div>
                        <div class="players-list two-column">
                            <div v-for="playerData in getPlayersWithAlts(team)" :key="playerData.main"
                                class="player-group" @mouseenter="handlePlayerHover($event, team.id, playerData.main)"
                                @mouseleave="hideTooltip">
                                <div class="player-item main-player"
                                    :class="{ 'has-alts': playerData.alts.length > 0 }">
                                    <span class="player-marker">▸</span>
                                    <span class="player-name">{{ playerData.main }}</span>
                                    <span v-if="playerData.alts.length > 0" class="alt-badge">{{ playerData.alts.length
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Single tooltip outside the list -->
                        <div v-if="activeTooltip && activeTooltip.teamId === team.id" class="player-tooltip"
                            :style="tooltipStyle">
                            <div class="tooltip-header">Alt Accounts</div>
                            <div class="tooltip-alts">
                                <div v-for="alt in activeTooltip.alts" :key="alt" class="tooltip-alt">
                                    {{ alt }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Center - Player Stats (MVPs) -->
            <div class="log-section player-stats">
                <div class="section-header">
                    <h2 class="section-title">🏆 MVPs</h2>
                </div>
                <div class="section-ornament"></div>

                <!-- Filter Tabs -->
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

                <!-- Sort Toggle -->
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
                            <template v-if="statsFilter === 'value'">
                                {{ formatValue(player.totalValue) }}
                            </template>
                            <template v-else>
                                {{ player.totalDrops }}
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side - Building MVPs -->
            <div class="log-section building-mvps">
                <div class="section-header">
                    <h2 class="section-title">🏰 Building MVPs</h2>
                </div>
                <div class="section-ornament"></div>

                <!-- Filter Tabs -->
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

export default {
    name: 'LogPage',
    data() {
        return {
            isLoadingTeams: true,
            isLoadingActivity: false,
            isLoadingStats: true,
            tooltipStyle: {},
            activeTooltip: null,
            statsFilter: 'value',
            buildingFilter: 'value',
            sortDescending: true,
            playerStats: [],
            activityFeed: [],
            teams: [],
            teamColors: ['#8b5a3c', '#d4af37', '#4a7c8b', '#8b4a4a', '#5a8b5a', '#8b5a8b'],
            eventLog: []
        }
    },
    computed: {
        sortedPlayerStats() {
            const allPlayers = [];

            // Flatten all players from all teams
            this.playerStats.forEach(teamStat => {
                teamStat.players.forEach(player => {
                    allPlayers.push({
                        name: player.name,
                        teamId: teamStat.teamId,
                        teamName: teamStat.teamName,
                        totalDrops: player.totalDrops,
                        totalValue: player.totalValue
                    });
                });
            });

            // Sort based on current filter
            const sorted = allPlayers.sort((a, b) => {
                const valueA = this.statsFilter === 'value' ? a.totalValue : a.totalDrops;
                const valueB = this.statsFilter === 'value' ? b.totalValue : b.totalDrops;

                return this.sortDescending ? valueB - valueA : valueA - valueB;
            });

            return sorted;
        },
        buildingMVPs() {
            // Get all building names from buildingLocations
            const buildings = buildingLocations.map(b => b.name);

            return buildings.map(buildingName => {
                let mvpPlayer = null;
                let maxValue = 0;

                // Loop through all teams and players to find MVP for this building
                this.playerStats.forEach(teamStat => {
                    teamStat.players.forEach(player => {
                        if (!player.breakdown || player.breakdown.length === 0) return;

                        // Calculate total for this building
                        const buildingStats = player.breakdown.filter(b =>
                            this.normalizeBuilding(b.category) === buildingName
                        );

                        if (buildingStats.length === 0) return;

                        // Sum up value or drops based on filter
                        const total = buildingStats.reduce((sum, stat) => {
                            if (this.buildingFilter === 'value') {
                                return sum + (stat.value || 0);
                            } else {
                                return sum + (stat.count || 0);
                            }
                        }, 0);

                        // Check if this player is the MVP for this building
                        if (total > maxValue) {
                            maxValue = total;
                            mvpPlayer = {
                                playerName: player.name,
                                teamId: teamStat.teamId,
                                teamName: teamStat.teamName,
                                value: buildingStats.reduce((sum, s) => sum + (s.value || 0), 0),
                                drops: buildingStats.reduce((sum, s) => sum + (s.count || 0), 0)
                            };
                        }
                    });
                });

                return {
                    name: buildingName,
                    mvp: mvpPlayer
                };
            });
        }
    },
    async created() {
        await this.loadTeams();
        await this.loadPlayerStats();
    },
    methods: {
        async loadTeams() {
            try {
                this.isLoadingTeams = true;
                const data = await apiService.getTeams();

                this.teams = data.teams.map((team) => ({
                    id: team.id,
                    name: team.name,
                    players: team.players
                }));

                console.log('Loaded teams:', this.teams);
            } catch (error) {
                console.error('Failed to load teams:', error);
                this.teams = [];
            } finally {
                this.isLoadingTeams = false;
            }
        },
        async loadPlayerStats() {
            try {
                this.isLoadingStats = true;
                const data = await apiService.getPlayerStats();

                this.playerStats = data.teamStats;

                console.log('Loaded player stats:', this.playerStats);
            } catch (error) {
                console.error('Failed to load player stats:', error);
                this.playerStats = [];
            } finally {
                this.isLoadingStats = false;
            }
        },
        getTeamColor(teamId) {
            return this.teamColors[(teamId - 1) % this.teamColors.length];
        },
        getPlayersWithAlts(team) {
            // Return structured data for players and alts
            return team.players.map(player => ({
                main: player.name,
                alts: player.alts || []
            }));
        },
        getTotalPlayerCount(team) {
            // Count only main players (not alts)
            return team.players.length;
        },
        handlePlayerHover(event, teamId, playerName) {
            const target = event.currentTarget;
            const rect = target.getBoundingClientRect();

            // Find the player's alts from the team
            const team = this.teams.find(t => t.id === teamId);
            if (!team) return;

            const player = team.players.find(p => p.name === playerName);
            if (!player || !player.alts || player.alts.length === 0) return;

            this.activeTooltip = {
                teamId: teamId,
                playerName: playerName,
                alts: player.alts
            };

            // Position tooltip to the right of the player name
            this.tooltipStyle = {
                left: `${rect.right + 10}px`,
                top: `${rect.top}px`
            };
        },
        hideTooltip() {
            this.activeTooltip = null;
        },
        formatValue(value) {
            if (value >= 1000000) {
                return (value / 1000000).toFixed(2) + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            }
            return value.toString();
        },
        formatBuildingName(name) {
            return name.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },
        normalizeBuilding(categoryName) {
            // Convert "Fan Favourites" to "fan_favourites"
            return categoryName.toLowerCase().replace(/\s+/g, '_');
        }
    },
}
</script>

<style scoped src="@/assets/log.css"></style>