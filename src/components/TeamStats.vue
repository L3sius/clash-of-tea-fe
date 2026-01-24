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
                    <div v-else-if="!sortedResources || sortedResources.length === 0" class="empty-state">
                        <div class="empty-icon">📦</div>
                        <p>No resources data available</p>
                    </div>
                    <div v-else class="resources-list">
                        <div v-for="(resource, index) in sortedResources" :key="resource.source" class="resource-block"
                            :class="{ dragging: draggedIndex === index }" draggable="true"
                            @dragstart="handleDragStart(index, $event)" @dragend="handleDragEnd"
                            @dragover.prevent="handleDragOver(index, $event)" @drop="handleDrop(index)">

                            <div class="resource-header" @click="toggleResourceExpanded(resource.source)">
                                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                                <span class="resource-icon">🏰</span>
                                <h3 class="resource-title">{{ formatBuildingName(resource.source) }}</h3>
                                <span class="expand-arrow" :class="{ expanded: isResourceExpanded(resource.source) }">
                                    ▼
                                </span>
                            </div>

                            <transition name="expand">
                                <div v-show="isResourceExpanded(resource.source)" class="tiers-grid">
                                    <div v-for="tier in resource.tiers" :key="tier.tier" class="tier-item">
                                        <span class="tier-label">Tier {{ tier.tier }}:</span>
                                        <span class="tier-value">{{ tier.quantity }}</span>
                                    </div>
                                </div>
                            </transition>
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
import apiService from '@/services/apiService';

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
            isLoadingResources: false,
            tabs: [
                { id: 'resources', label: 'Resources', icon: '💎' },
                { id: 'live', label: 'Live Feed', icon: '⚡' },
                { id: 'latest', label: 'Latest', icon: '📜' }
            ],
            teamResources: [],
            resourceOrder: [],
            expandedResources: [],
            draggedIndex: null,
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
        sortedResources() {
            if (!this.teamResources || this.teamResources.length === 0) return [];

            // If no custom order exists, return original order
            if (this.resourceOrder.length === 0) {
                return this.teamResources;
            }

            // Sort based on custom order
            const sorted = [...this.teamResources].sort((a, b) => {
                const indexA = this.resourceOrder.indexOf(a.source);
                const indexB = this.resourceOrder.indexOf(b.source);

                // If both are in the order array, sort by their position
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }

                // If only A is in order, put it first
                if (indexA !== -1) return -1;

                // If only B is in order, put it first
                if (indexB !== -1) return 1;

                // If neither is in order, maintain original order
                return 0;
            });

            return sorted;
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
        toggleResourceExpanded(source) {
            const index = this.expandedResources.indexOf(source);
            if (index === -1) {
                this.expandedResources.push(source);
            } else {
                this.expandedResources.splice(index, 1);
            }
        },
        isResourceExpanded(source) {
            return this.expandedResources.includes(source);
        },
        handleDragStart(index, event) {
            this.draggedIndex = index;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', event.target.innerHTML);
            event.target.style.opacity = '0.5';
        },
        handleDragEnd(event) {
            event.target.style.opacity = '';
            this.draggedIndex = null;
        },
        handleDragOver(index, event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        handleDrop(dropIndex) {
            if (this.draggedIndex === null || this.draggedIndex === dropIndex) return;

            const resources = [...this.sortedResources];
            const draggedResource = resources[this.draggedIndex];

            // Remove from old position
            resources.splice(this.draggedIndex, 1);

            // Insert at new position
            resources.splice(dropIndex, 0, draggedResource);

            // Update the order array
            this.resourceOrder = resources.map(r => r.source);

            console.log('New resource order:', this.resourceOrder);
        },
        async loadTeamData() {
            if (!this.selectedTeamId) return;

            try {
                this.isLoadingResources = true;
                const data = await apiService.getTeamsResources();

                // Find the resources for the selected team
                const teamData = data.teamResources.find(tr => tr.teamId === this.selectedTeamId);

                if (teamData && teamData.resources) {
                    this.teamResources = teamData.resources;

                    // Initialize resource order if empty
                    if (this.resourceOrder.length === 0) {
                        this.resourceOrder = this.teamResources.map(r => r.source);
                    }
                } else {
                    this.teamResources = [];
                    this.resourceOrder = [];
                }

                // Clear expanded resources when switching teams
                this.expandedResources = [];

                console.log('Loaded resources for team ID:', this.selectedTeamId, this.teamResources);
            } catch (error) {
                console.error('Failed to load team resources:', error);
                this.teamResources = [];
                this.resourceOrder = [];
            } finally {
                this.isLoadingResources = false;
            }

            // Mock data for live feed (replace with actual API call later)
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