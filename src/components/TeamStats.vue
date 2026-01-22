<template>
    <div class="team-stats-container" :class="{ collapsed: isCollapsed }">
        <!-- Collapsed State - Hamburger Button -->
        <button v-if="isCollapsed" class="expand-btn" @click="toggleCollapse" title="Expand Team Stats">
            <span class="hamburger-icon">☰</span>
            <span class="expand-label">Team Stats</span>
        </button>

        <!-- Expanded State - Full Panel -->
        <div v-else class="stats-panel">
            <!-- Header -->
            <div class="panel-header">
                <h2 class="panel-title">{{ selectedTeamName }}</h2>
                <button class="collapse-btn" @click="toggleCollapse" title="Collapse">✕</button>
            </div>
            <div class="header-ornament"></div>

            <!-- Tab Navigation -->
            <div class="tab-nav">
                <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }"
                    @click="activeTab = tab.id">
                    <span class="tab-icon">{{ tab.icon }}</span>
                    <span class="tab-label">{{ tab.label }}</span>
                </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <!-- Resources Tab -->
                <div v-show="activeTab === 'resources'" class="content-section">
                    <div v-if="!teamResources || Object.keys(teamResources).length === 0" class="empty-state">
                        <div class="empty-icon">📦</div>
                        <p>No resources data available</p>
                    </div>
                    <div v-else class="resources-list">
                        <div v-for="(tiers, buildingName) in teamResources" :key="buildingName" class="resource-block">
                            <div class="resource-header">
                                <span class="resource-icon">🏰</span>
                                <h3 class="resource-title">{{ formatBuildingName(buildingName) }}</h3>
                            </div>
                            <div class="tiers-grid">
                                <div v-for="(value, tier) in tiers" :key="tier" class="tier-item">
                                    <span class="tier-label">{{ formatTierName(tier) }}:</span>
                                    <span class="tier-value">{{ value }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live Feed Tab -->
                <div v-show="activeTab === 'live'" class="content-section">
                    <div v-if="liveFeed.length === 0" class="empty-state">
                        <div class="empty-icon">📡</div>
                        <p>No live activity</p>
                    </div>
                    <div v-else class="activity-feed">
                        <div v-for="activity in liveFeed" :key="activity.id" class="feed-item" :class="activity.type">
                            <div class="feed-icon">{{ getActivityIcon(activity.type) }}</div>
                            <div class="feed-content">
                                <div class="feed-player">{{ activity.player }}</div>
                                <div class="feed-message">{{ activity.message }}</div>
                                <div class="feed-time">{{ activity.time }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Latest Activity Tab -->
                <div v-show="activeTab === 'latest'" class="content-section">
                    <div v-if="latestActivity.length === 0" class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>No recent activity</p>
                    </div>
                    <div v-else class="activity-feed">
                        <div v-for="activity in latestActivity" :key="activity.id" class="feed-item"
                            :class="activity.type">
                            <div class="feed-icon">{{ getActivityIcon(activity.type) }}</div>
                            <div class="feed-content">
                                <div class="feed-player">{{ activity.player }}</div>
                                <div class="feed-message">{{ activity.message }}</div>
                                <div class="feed-time">{{ activity.time }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TeamStats',
    props: {
        selectedTeamId: {
            type: Number,
            default: null
        },
        teams: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            isCollapsed: false,
            activeTab: 'resources',
            tabs: [
                { id: 'resources', label: 'Resources', icon: '💎' },
                { id: 'live', label: 'Live Feed', icon: '⚡' },
                { id: 'latest', label: 'Latest', icon: '📜' }
            ],
            teamResources: {},
            liveFeed: [],
            latestActivity: []
        }
    },
    computed: {
        selectedTeamName() {
            if (!this.selectedTeamId) return 'No Team Selected';
            const team = this.teams.find(t => t.id === this.selectedTeamId);
            return team ? team.name : 'Unknown Team';
        }
    },
    watch: {
        selectedTeamId: {
            immediate: true,
            handler(newTeamId) {
                if (newTeamId) {
                    this.loadTeamData(newTeamId);
                }
            }
        }
    },
    methods: {
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
        },
        formatBuildingName(name) {
            return name.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },
        formatTierName(tier) {
            return tier.charAt(0).toUpperCase() + tier.slice(1);
        },
        getActivityIcon(type) {
            const icons = {
                boss: '⚔️',
                clue: '🗺️',
                achievement: '🏆',
                loot: '💎',
                pet: '🐾',
                slayer: '🎯'
            };
            return icons[type] || '⚡';
        },
        async loadTeamData(teamId) {
            // Simulate API calls - replace with actual backend calls
            // const response = await fetch(`/api/teams/${teamId}/resources`);

            // Mock data for resources
            this.teamResources = {
                wilderness: { tier1: 50, tier2: 25, tier3: 10 },
                slayer_tower: { tier1: 30, tier2: 15 },
                cox: { tier1: 100, tier2: 50, tier3: 25, tier4: 5 },
                town_hall: { tier1: 200, tier2: 100 }
            };

            // Mock data for live feed
            this.liveFeed = [
                { id: 1, player: 'Player1', message: 'Killed Giant Mole', type: 'boss', time: '2s ago' },
                { id: 2, player: 'Player2', message: 'Opened Elite Clue worth 3.2M', type: 'clue', time: '5s ago' },
                { id: 3, player: 'Player3', message: 'Completed Handyman CA', type: 'achievement', time: '12s ago' },
                { id: 4, player: 'Player4', message: 'Received Twisted Bow drop', type: 'loot', time: '18s ago' },
            ];

            // Mock data for latest activity
            this.latestActivity = [
                { id: 1, player: 'Player5', message: 'Obtained Olmlet pet', type: 'pet', time: '25s ago' },
                { id: 2, player: 'Player6', message: 'Completed Vannaka slayer task', type: 'slayer', time: '31s ago' },
                { id: 3, player: 'Player7', message: 'Killed Zulrah in 45 seconds', type: 'boss', time: '40s ago' },
            ];

            // Simulate live feed updates
            this.startLiveFeedUpdates();
        },
        startLiveFeedUpdates() {
            // Clear existing interval if any
            if (this.feedInterval) {
                clearInterval(this.feedInterval);
            }

            // Update live feed every 5 seconds
            this.feedInterval = setInterval(() => {
                const newActivity = {
                    id: Date.now(),
                    player: 'Player' + Math.floor(Math.random() * 20),
                    message: 'Completed a task',
                    type: ['boss', 'clue', 'achievement', 'loot', 'pet', 'slayer'][Math.floor(Math.random() * 6)],
                    time: 'Just now'
                };
                this.liveFeed.unshift(newActivity);
                if (this.liveFeed.length > 20) {
                    this.liveFeed.pop();
                }
            }, 5000);
        }
    },
    beforeUnmount() {
        if (this.feedInterval) {
            clearInterval(this.feedInterval);
        }
    }
}
</script>

<style scoped src="@/assets/teamStats.css"></style>