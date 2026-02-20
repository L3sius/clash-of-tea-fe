<template>
    <div class="team-stats-container" :class="{ collapsed: isCollapsed }">
        <!-- Tooltip teleported to body - fully escapes all stacking contexts -->
        <Teleport to="body">
            <div v-if="tooltip.visible" class="teamstats-tooltip"
                :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">{{ tooltip.text }}</div>
        </Teleport>
        <button v-if="isCollapsed" class="expand-btn" @click="toggleCollapse" title="Expand Team Stats">
            <span class="hamburger-icon">☰</span>
            <span class="expand-label">Team Stats</span>
        </button>

        <!-- Expanded State - Full Panel -->
        <div v-else class="stats-panel">
            <!-- Header -->
            <div class="panel-header">
                <h2 class="panel-title" @mouseenter="showTitleTooltip($event)" @mouseleave="hideTooltip">
                    {{ selectedTeamDisplayName }}
                </h2>
                <div class="header-actions">
                    <button class="collapse-btn" @click="toggleCollapse" title="Collapse">✕</button>
                </div>
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
                    <div v-if="isLoadingResources && !teamResources.length" class="loading-state">
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
                                :class="{ empty: tier.quantity === 0 }" :data-tier="tier.tier"
                                @mouseenter="showTooltip($event, tierLabel(tier.tier))" @mouseleave="hideTooltip()">
                                <span class="tier-card__label">Tier {{ tier.tier }}</span>
                                <span class="tier-card__value">{{ tier.quantity }}</span>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Live Feed Tab -->
                <div v-show="activeTab === 'live'" class="content-section">
                    <!-- Team Filter -->
                    <div class="feed-filter">
                        <button class="filter-pill" :class="{ active: feedTeamFilter === null }"
                            @click="feedTeamFilter = null">All</button>
                        <button v-for="team in teams" :key="team.id" class="filter-pill"
                            :class="{ active: feedTeamFilter === team.name }" @click="feedTeamFilter = team.name">{{
                                team.name
                            }}</button>
                    </div>

                    <div v-if="filteredFeed.length === 0" class="empty-state">
                        <div class="empty-icon">📡</div>
                        <p>{{ liveFeed.length === 0 ? 'Waiting for activity...' : 'No activity for this team' }}</p>
                    </div>
                    <div v-else class="activity-feed">
                        <div v-for="entry in filteredFeed" :key="entry.id" class="feed-item"
                            :class="entry.success ? 'feed-success' : 'feed-fail'">
                            <div class="feed-status-dot" :class="entry.success ? 'dot-success' : 'dot-fail'"></div>
                            <div class="feed-line">
                                <!-- Player: shows full name if truncated, team if not truncated (success only) -->
                                <span class="feed-player"
                                    @mouseenter="showFeedTooltip($event, entry.player, entry.success ? 'Team: ' + entry.team : null)"
                                    @mouseleave="hideTooltip()">{{ entry.player }}</span>

                                <!-- Source: shows full monster name if truncated -->
                                <span v-if="entry.source" class="feed-source"
                                    @mouseenter="showFeedTooltip($event, entry.source, entry.success ? 'Source: ' + entry.monster : null)"
                                    @mouseleave="hideTooltip()">{{ entry.source }}</span>

                                <!-- Rewards — data-tier drives the per-tier colour in CSS -->
                                <span v-if="entry.rewards.length" class="feed-rewards">
                                    <span v-for="r in entry.rewards" :key="r.tier" class="feed-tier"
                                        :data-tier="r.tier">
                                        T{{ r.tier }} <span class="feed-qty">(x{{ r.qty }})</span>
                                    </span>
                                </span>

                                <span class="feed-time">{{ entry.relativeTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Latest Activity Tab -->
                <div v-show="activeTab === 'latest'" class="content-section">
                    <!-- Team Filter -->
                    <div class="feed-filter">
                        <button class="filter-pill" :class="{ active: upgradeTeamFilter === null }"
                            @click="upgradeTeamFilter = null">All</button>
                        <button v-for="team in teams" :key="team.id" class="filter-pill"
                            :class="{ active: upgradeTeamFilter === team.name }"
                            @click="upgradeTeamFilter = team.name">{{ team.name
                            }}</button>
                    </div>

                    <div v-if="filteredUpgrades.length === 0" class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>{{ upgradeFeed.length === 0 ? 'Waiting for upgrades...' : 'No upgrades for this team' }}</p>
                    </div>
                    <div v-else class="activity-feed">
                        <div v-for="entry in filteredUpgrades" :key="entry.id" class="feed-item upgrade-item">
                            <div class="feed-line">
                                <span class="upgrade-building">{{ entry.buildingName }}</span>
                                <span class="upgrade-level">Lvl {{ entry.newLevel - 1 }}</span>
                                <span class="upgrade-arrow">→</span>
                                <span class="upgrade-level">Lvl {{ entry.newLevel }}</span>
                                <span class="upgrade-team">{{ entry.teamName }}</span>
                                <span class="feed-time">{{ entry.relativeTime }}</span>
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
    emits: ['collapsed-changed'],
    props: {
        selectedTeamId: {
            type: Number,
            default: null
        },
        teams: {
            type: Array,
            required: true
        },
        startCollapsed: {
            type: Boolean,
            default: null
        }
    },
    data() {
        const isMobile = window.innerWidth <= 768;
        return {
            isCollapsed: this.startCollapsed !== null ? this.startCollapsed : isMobile,
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
            feedTeamFilter: null,
            eventSource: null,
            upgradeFeed: [],
            upgradeTeamFilter: null,
            upgradeEventSource: null,
            resourceChangeEventSource: null,
            tooltip: { visible: false, text: '', x: 0, y: 0 },
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
        },
        filteredFeed() {
            if (!this.feedTeamFilter) return this.liveFeed;
            return this.liveFeed.filter(e => e.team === this.feedTeamFilter);
        },
        filteredUpgrades() {
            if (!this.upgradeTeamFilter) return this.upgradeFeed;
            return this.upgradeFeed.filter(e => e.teamName === this.upgradeTeamFilter);
        }
    },
    watch: {
        selectedTeamId: {
            immediate: true,
            handler(newTeamId, oldTeamId) {
                if (newTeamId) {
                    this.loadTeamData(!!oldTeamId);
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
            this.$emit('collapsed-changed', this.isCollapsed);
        },
        showTooltip(event, text) {
            const rect = event.target.getBoundingClientRect();
            this.tooltip = {
                visible: true,
                text,
                x: rect.left + rect.width / 2,
                y: rect.top,
            };
        },
        showFeedTooltip(event, fullText, fallbackText) {
            const el = event.target;
            const isTruncated = el.scrollWidth > el.clientWidth;
            if (isTruncated) {
                this.showTooltip(event, fullText);
            } else if (fallbackText) {
                this.showTooltip(event, fallbackText);
            }
        },
        hideTooltip() {
            this.tooltip.visible = false;
        },
        tierLabel(tier) {
            const ranges = {
                1: '1K - 10K GP',
                2: '10K - 25K GP',
                3: '25K - 50K GP',
                4: '50K - 100K GP',
                5: '100K - 250K GP',
                6: '250K - 1M GP',
                7: '1M - 10M GP',
                8: '10M - 50M GP',
                9: '50M+ GP',
            };
            return ranges[tier] ?? `Tier ${tier}`;
        },
        formatRelativeTime(timestamp) {
            const diff = Math.floor(Date.now() / 1000) - timestamp;
            if (diff < 60) return `${diff}s ago`;
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            return `${Math.floor(diff / 3600)}h ago`;
        },
        applyFullResourceSnapshot(data) {
            const teamData = data.teamResources?.find(tr => tr.teamId === this.selectedTeamId);
            if (!teamData) return;

            this.teamResources = teamData.resources;
            const cachedSource = cacheGet('statsSelectedSource', null);
            const isValid = cachedSource && this.teamResources.some(r => r.source === cachedSource);
            this.selectedSource = isValid ? cachedSource : (this.teamResources[0]?.source || null);
        },
        applyResourceDelta(data) {
            const incoming = data.team_resources;
            if (!incoming || incoming.teamId !== this.selectedTeamId) return;

            for (const incomingSource of incoming.resources) {
                const existingSource = this.teamResources.find(r => r.source === incomingSource.source);
                if (!existingSource) continue;

                for (const incomingTier of incomingSource.tiers) {
                    const existingTier = existingSource.tiers.find(t => t.tier === incomingTier.tier);
                    if (existingTier) {
                        existingTier.quantity += incomingTier.quantity;
                    }
                }
            }

            this.teamResources = [...this.teamResources];
        },
        async loadInitialResources() {
            if (!this.selectedTeamId) return;
            this.isLoadingResources = true;
            try {
                const data = await apiService.getTeamsResources();
                this.applyFullResourceSnapshot(data);
            } catch (error) {
                console.error('Failed to load resources:', error);
            } finally {
                this.isLoadingResources = false;
            }
        },
        connectResourceChangeStream() {
            if (this.resourceChangeEventSource) {
                this.resourceChangeEventSource.close();
            }

            this.resourceChangeEventSource = apiService.getResourcesChangeStream();

            const handleChange = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.applyResourceDelta(data);
                } catch (e) {
                    console.error('[ResourceStream] Failed to parse SSE message:', e);
                }
            };

            this.resourceChangeEventSource.addEventListener('resource_change', handleChange);

            this.resourceChangeEventSource.onerror = (e) => {
                console.error('[ResourceStream] SSE error:', e);
            };
        },
        parseMessage(raw) {
            const matches = [...raw.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
            if (matches.length >= 3) {
                const playerMatch = matches[0].match(/^(.+?)\s+\((.+?)\)$/);
                const monsterMatch = matches[1].match(/^(.+?)\s+\((.+?)\)$/);

                const rewards = [];
                for (const rewardStr of matches.slice(2)) {
                    const rewardMatches = [...rewardStr.matchAll(/T(\d+)\s*\(x(\d+)\)/g)];
                    for (const m of rewardMatches) {
                        rewards.push({ tier: parseInt(m[1]), qty: parseInt(m[2]) });
                    }
                }

                return {
                    player: playerMatch?.[1]?.trim() ?? matches[0],
                    team: playerMatch?.[2]?.trim() ?? '?',
                    monster: monsterMatch?.[1]?.trim() ?? matches[1],
                    source: monsterMatch?.[2]?.trim() ?? '?',
                    rewards,
                };
            }

            return {
                player: raw,
                team: null,
                monster: null,
                source: null,
                rewards: [],
            };
        },
        connectStream() {
            if (this.eventSource) {
                this.eventSource.close();
            }

            this.eventSource = apiService.getActionStream();

            const handleEvent = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.message) return;
                    const parsed = this.parseMessage(data.message);
                    if (!parsed) return;

                    const entry = {
                        id: Date.now() + Math.random(),
                        success: data.is_success_action,
                        timestamp: data.timestamp,
                        relativeTime: this.formatRelativeTime(data.timestamp),
                        ...parsed,
                    };

                    this.liveFeed.unshift(entry);
                    if (this.liveFeed.length > 100) this.liveFeed.pop();
                } catch (e) {
                    console.error('[LiveFeed] Failed to parse SSE message:', e);
                }
            };

            this.eventSource.addEventListener('history', handleEvent);
            this.eventSource.addEventListener('action', handleEvent);

            this.eventSource.onerror = (e) => {
                console.error('[LiveFeed] SSE error:', e);
            };

            if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = setInterval(() => {
                this.liveFeed = this.liveFeed.map(e => ({
                    ...e,
                    relativeTime: this.formatRelativeTime(e.timestamp)
                }));
            }, 30000);
        },
        connectUpgradeStream() {
            if (this.upgradeEventSource) {
                this.upgradeEventSource.close();
            }

            this.upgradeEventSource = apiService.getBuildingUpgradeStream();

            const handleUpgrade = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.building_name) return;

                    const entry = {
                        id: Date.now() + Math.random(),
                        timestamp: data.timestamp,
                        relativeTime: this.formatRelativeTime(data.timestamp),
                        teamName: data.team_name,
                        buildingName: data.building_name,
                        newLevel: data.new_level,
                    };

                    this.upgradeFeed.unshift(entry);
                    if (this.upgradeFeed.length > 100) this.upgradeFeed.pop();
                } catch (e) {
                    console.error('[UpgradeFeed] Failed to parse SSE message:', e);
                }
            };

            this.upgradeEventSource.addEventListener('history', handleUpgrade);
            this.upgradeEventSource.addEventListener('upgrade', handleUpgrade);

            this.upgradeEventSource.onerror = (e) => {
                console.error('[UpgradeFeed] SSE error:', e);
            };

            if (this.upgradeTimeInterval) clearInterval(this.upgradeTimeInterval);
            this.upgradeTimeInterval = setInterval(() => {
                this.upgradeFeed = this.upgradeFeed.map(e => ({
                    ...e,
                    relativeTime: this.formatRelativeTime(e.timestamp)
                }));
            }, 30000);
        },
        async loadTeamData(isTeamSwitch = false) {
            if (!this.selectedTeamId) return;

            // On team switch, reload resources from REST — streams are global and stay open
            if (isTeamSwitch) {
                await this.loadInitialResources();
                return;
            }

            // First load — clear stale data and open all three streams fresh
            this.liveFeed = [];
            this.upgradeFeed = [];

            await this.loadInitialResources();

            this.connectStream();
            this.connectUpgradeStream();
            this.connectResourceChangeStream();
        },
        showTitleTooltip(event) {
            const el = event.currentTarget;
            // Only show if text is actually truncated
            if (el.scrollWidth <= el.clientWidth) return;
            const rect = el.getBoundingClientRect();
            this.tooltip = {
                visible: true,
                text: this.selectedTeamDisplayName,
                x: rect.left + rect.width / 2,
                y: rect.top,
            };
        }
    },
    beforeUnmount() {
        if (this.eventSource) this.eventSource.close();
        if (this.upgradeEventSource) this.upgradeEventSource.close();
        if (this.resourceChangeEventSource) this.resourceChangeEventSource.close();
        if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
        if (this.upgradeTimeInterval) clearInterval(this.upgradeTimeInterval);
    }
}
</script>

<style scoped src="@/assets/teamStats.css"></style>

<!-- Unscoped: targets the teleported tooltip rendered on <body> -->
<style>
.teamstats-tooltip {
    position: fixed;
    transform: translate(-50%, calc(-100% - 8px));
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(30, 20, 15, 0.98));
    border: 1px solid #8b7355;
    border-radius: 4px;
    padding: 0.4rem 0.7rem;
    color: #f4e4c1;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.75rem;
    white-space: pre-line;
    text-align: center;
    pointer-events: none;
    z-index: 99999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.teamstats-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #8b7355;
}
</style>