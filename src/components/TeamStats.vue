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
                <h2 class="panel-title">{{ selectedTeamDisplayName }}</h2>
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
                    <div v-if="isLoadingResources" class="loading-state">
                        <div class="loading-spinner">⏳</div>
                        <p>Loading resources...</p>
                    </div>
                    <div v-else-if="!teamResources || teamResources.length === 0" class="empty-state">
                        <div class="empty-icon">📦</div>
                        <p>No resources data available</p>
                    </div>
                    <template v-else>
                        <!-- Building Selector -->
                        <div class="building-selector">
                            <button v-for="resource in teamResources" :key="resource.source" class="building-pill"
                                :class="{ active: selectedSource === resource.source }"
                                @click="selectedSource = resource.source">
                                {{ resource.source }}
                            </button>
                        </div>

                        <!-- Inventory Grid -->
                        <div v-if="selectedResource" class="inventory-grid">
                            <div v-for="tier in selectedResource.tiers" :key="tier.tier" class="tier-card"
                                :class="{ empty: tier.quantity === 0 }">
                                <span class="tier-card__label">Tier {{ tier.tier }}</span>
                                <span class="tier-card__value">{{ tier.quantity }}</span>
                            </div>
                        </div>
                    </template>
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
import apiService from '@/services/apiService';
import { cacheGet, cacheSet } from '@/utils/useCache';

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
            activeTab: cacheGet('statsActiveTab', 'resources'),
            isLoadingResources: false,
            tabs: [
                { id: 'resources', label: 'Resources', icon: '💎' },
                { id: 'live', label: 'Live Feed', icon: '⚡' },
                { id: 'latest', label: 'Latest', icon: '📜' }
            ],
            teamResources: [],
            selectedSource: cacheGet('statsSelectedSource', null),
            liveFeed: [],
            latestActivity: []
        }
    },
    computed: {
        selectedTeamDisplayName() {
            if (!this.selectedTeamId) return 'No Team Selected';
            const team = this.teams.find(t => t.id === this.selectedTeamId);
            return team ? team.name : 'Unknown Team';
        },
        selectedResource() {
            if (!this.selectedSource) return null;
            return this.teamResources.find(r => r.source === this.selectedSource) || null;
        }
    },
    watch: {
        selectedTeamId: {
            immediate: true,
            handler(newTeamId) {
                if (newTeamId) {
                    this.loadTeamData();
                }
            }
        },
        activeTab(val) {
            cacheSet('statsActiveTab', val);
        },
        selectedSource(val) {
            if (val) cacheSet('statsSelectedSource', val);
        }
    },
    methods: {
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
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
        async loadTeamData() {
            if (!this.selectedTeamId) return;

            try {
                this.isLoadingResources = true;
                const data = await apiService.getTeamsResources();

                const teamData = data.teamResources.find(tr => tr.teamId === this.selectedTeamId);

                if (teamData && teamData.resources) {
                    this.teamResources = teamData.resources;
                    // Restore cached source if it exists in this team's resources,
                    // otherwise fall back to the first available building
                    const cachedSource = cacheGet('statsSelectedSource', null);
                    const isValid = cachedSource && this.teamResources.some(r => r.source === cachedSource);
                    this.selectedSource = isValid ? cachedSource : (this.teamResources[0]?.source || null);
                } else {
                    this.teamResources = [];
                    this.selectedSource = null;
                }

                console.log('Loaded resources for team ID:', this.selectedTeamId, this.teamResources);
            } catch (error) {
                console.error('Failed to load team resources:', error);
                this.teamResources = [];
                this.selectedSource = null;
            } finally {
                this.isLoadingResources = false;
            }

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

            this.startLiveFeedUpdates();
        },
        startLiveFeedUpdates() {
            if (this.feedInterval) {
                clearInterval(this.feedInterval);
            }
            this.feedInterval = setInterval(() => {
                const newActivity = {
                    id: Date.now(),
                    player: 'Player' + Math.floor(Math.random() * 20),
                    message: 'Completed a task',
                    type: ['boss', 'clue', 'achievement', 'loot', 'pet', 'slayer'][Math.floor(Math.random() * 6)],
                    time: 'Just now'
                };
                this.liveFeed.unshift(newActivity);
                if (this.liveFeed.length > 20) this.liveFeed.pop();
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