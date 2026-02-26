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
                    <div v-if="!currentTeamResources || currentTeamResources.length === 0" class="empty-state">
                        <div class="empty-icon">📦</div>
                        <p>No resources data available</p>
                    </div>
                    <template v-else>
                        <!-- Building Selector -->
                        <div class="building-selector">
                            <button v-for="resource in currentTeamResources" :key="resource.source"
                                class="building-pill" :class="{ active: selectedSource === resource.source }"
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
                    <div class="feed-filter-row">
                        <div class="feed-filter">
                            <button class="filter-pill" :class="{ active: feedTeamFilter === null }"
                                @click="feedTeamFilter = null">All</button>
                            <button v-for="team in teams" :key="team.id" class="filter-pill"
                                :class="{ active: feedTeamFilter === team.name }" @click="feedTeamFilter = team.name">{{
                                    team.name
                                }}</button>
                        </div>
                        <button class="popout-btn" @click="openPopout" title="Open in popup window">⧉</button>
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
                                <span class="feed-player"
                                    @mouseenter="showFeedTooltip($event, entry.player, entry.success ? 'Team: ' + entry.team : null)"
                                    @mouseleave="hideTooltip()">{{ entry.player }}</span>
                                <span v-if="entry.source" class="feed-source"
                                    @mouseenter="showFeedTooltip($event, entry.source, entry.success ? 'Source: ' + entry.monster : null)"
                                    @mouseleave="hideTooltip()">{{ entry.source }}</span>
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

                <!-- Buildings Tab -->
                <div v-show="activeTab === 'buildings'" class="content-section">
                    <div v-if="!buildings || buildings.length === 0" class="empty-state">
                        <div class="empty-icon">🏰</div>
                        <p>No buildings data available</p>
                    </div>
                    <div v-else-if="buildingsForTab.length === 0" class="empty-state">
                        <div class="empty-icon">🏰</div>
                        <p>No buildings for selected team</p>
                    </div>
                    <div v-else class="buildings-tab-list">
                        <div v-for="building in buildingsForTab" :key="building.id ?? building.name"
                            class="building-tab-item">

                            <!-- Building header: name + level -->
                            <div class="building-tab-header">
                                <span class="building-tab-name">{{ building.name }}</span>
                                <span class="building-tab-level"
                                    :class="building.level > 0 ? 'level--upgraded' : 'level--zero'">
                                    Lvl {{ building.level }}
                                </span>
                            </div>

                            <!-- Max level -->
                            <div v-if="!building.upgradable" class="building-tab-maxed">
                                🏆 Max level
                            </div>

                            <!-- Upgrade options with owned/required counts -->
                            <div v-else-if="building.upgradeOptions && building.upgradeOptions.length"
                                class="building-tab-options">
                                <div v-for="option in building.upgradeOptions" :key="option.optionId"
                                    class="building-tab-option"
                                    :class="{ 'option--fulfilled': isTabOptionFulfilled(option, building.teamId) }">
                                    <span class="building-tab-option-label">{{ option.optionId }}</span>
                                    <div class="building-tab-reqs">
                                        <span v-for="(req, i) in option.requirements" :key="i" class="building-tab-req"
                                            :class="isTabReqFulfilled(req, building.teamId) ? 'req--met' : 'req--unmet'">
                                            <span class="req-name">{{ req.name }}</span>
                                            <span class="req-tier" :data-tier="req.tier"
                                                @mouseenter="showTooltip($event, tierLabel(req.tier))"
                                                @mouseleave="hideTooltip()">T{{
                                                req.tier }}</span>
                                            <span class="req-progress">
                                                {{ getOwnedQtyForTab(req, building.teamId) }}/{{ req.quantity }}
                                            </span>
                                            <span v-if="i < option.requirements.length - 1" class="req-sep">+</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="building-tab-no-options">
                                No upgrade path defined
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
        selectedTeamId: { type: Number, default: null },
        teams: { type: Array, required: true },
        startCollapsed: { type: Boolean, default: null },
        teamResources: { type: Array, default: () => [] },
        buildings: { type: Array, default: () => [] },
    },
    data() {
        const isMobile = window.innerWidth <= 768;
        return {
            isCollapsed: this.startCollapsed !== null ? this.startCollapsed : isMobile,
            activeTab: cacheGet('statsActiveTab', 'resources'),
            tabs: [
                { id: 'resources', label: 'Resources', icon: '💎' },
                { id: 'live', label: 'Live Feed', icon: '⚡' },
                { id: 'latest', label: 'Latest', icon: '📜' },
                { id: 'buildings', label: 'Buildings', icon: '🏰' },
            ],
            selectedSource: cacheGet('statsSelectedSource', null),
            liveFeed: [],
            feedTeamFilter: null,
            eventSource: null,
            upgradeFeed: [],
            upgradeTeamFilter: null,
            upgradeEventSource: null,
            tooltip: { visible: false, text: '', x: 0, y: 0 },
        };
    },
    computed: {
        selectedTeamDisplayName() {
            if (!this.selectedTeamId) return 'No Team Selected';
            const team = this.teams.find(t => t.id === this.selectedTeamId);
            return team ? team.name : 'Unknown Team';
        },
        currentTeamResources() {
            if (!this.selectedTeamId) return [];
            const teamData = this.teamResources.find(t => t.teamId === this.selectedTeamId);
            return teamData ? teamData.resources : [];
        },
        selectedResource() {
            if (!this.selectedSource) return null;
            return this.currentTeamResources.find(r => r.source === this.selectedSource) || null;
        },
        filteredFeed() {
            if (!this.feedTeamFilter) return this.liveFeed;
            return this.liveFeed.filter(e => e.team === this.feedTeamFilter);
        },
        filteredUpgrades() {
            if (!this.upgradeTeamFilter) return this.upgradeFeed;
            return this.upgradeFeed.filter(e => e.teamName === this.upgradeTeamFilter);
        },
        buildingsForTab() {
            if (!this.selectedTeamId) return [];
            return this.buildings
                .filter(b => b.teamId === this.selectedTeamId)
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name));
        },
    },
    watch: {
        selectedTeamId: {
            immediate: true,
            handler(newTeamId, oldTeamId) {
                if (!newTeamId) return;
                this.syncSelectedSource();
                if (!oldTeamId) {
                    this.liveFeed = [];
                    this.upgradeFeed = [];
                    this.connectStream();
                    this.connectUpgradeStream();
                }
            },
        },
        currentTeamResources(resources) {
            if (!this.selectedSource || !resources.some(r => r.source === this.selectedSource)) {
                this.syncSelectedSource();
            }
        },
        activeTab(val) {
            cacheSet('statsActiveTab', val);
        },
        selectedSource(val) {
            if (val) cacheSet('statsSelectedSource', val);
        },
    },
    methods: {
        syncSelectedSource() {
            const resources = this.currentTeamResources;
            const cached = cacheGet('statsSelectedSource', null);
            const isValid = cached && resources.some(r => r.source === cached);
            this.selectedSource = isValid ? cached : (resources[0]?.source || null);
        },
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            this.$emit('collapsed-changed', this.isCollapsed);
        },
        showTooltip(event, text) {
            const rect = event.target.getBoundingClientRect();
            this.tooltip = { visible: true, text, x: rect.left + rect.width / 2, y: rect.top };
        },
        showFeedTooltip(event, fullText, fallbackText) {
            const el = event.target;
            if (el.scrollWidth > el.clientWidth) {
                this.showTooltip(event, fullText);
            } else if (fallbackText) {
                this.showTooltip(event, fallbackText);
            }
        },
        hideTooltip() {
            this.tooltip.visible = false;
        },
        showTitleTooltip(event) {
            const el = event.currentTarget;
            if (el.scrollWidth <= el.clientWidth) return;
            const rect = el.getBoundingClientRect();
            this.tooltip = { visible: true, text: this.selectedTeamDisplayName, x: rect.left + rect.width / 2, y: rect.top };
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
        parseMessage(raw) {
            const matches = [...raw.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
            if (matches.length >= 3) {
                const playerMatch = matches[0].match(/^(.+?)\s+\((.+?)\)$/);
                const monsterMatch = matches[1].match(/^(.+?)\s+\((.+?)\)$/);
                const rewards = [];
                for (const rewardStr of matches.slice(2)) {
                    for (const m of [...rewardStr.matchAll(/T(\d+)\s*\(x(\d+)\)/g)]) {
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
            return { player: raw, team: null, monster: null, source: null, rewards: [] };
        },
        connectStream() {
            if (this.eventSource) this.eventSource.close();
            this.eventSource = apiService.getActionStream();

            const handleEvent = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.message) return;
                    const parsed = this.parseMessage(data.message);
                    if (!parsed) return;
                    this.liveFeed.unshift({
                        id: Date.now() + Math.random(),
                        success: data.is_success_action,
                        timestamp: data.timestamp,
                        relativeTime: this.formatRelativeTime(data.timestamp),
                        ...parsed,
                    });
                    if (this.liveFeed.length > 1000) this.liveFeed.pop();
                } catch (e) {
                    console.error('[LiveFeed] Failed to parse SSE message:', e);
                }
            };

            this.eventSource.addEventListener('history', handleEvent);
            this.eventSource.addEventListener('action', handleEvent);
            this.eventSource.onerror = (e) => console.error('[LiveFeed] SSE error:', e);

            if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = setInterval(() => {
                this.liveFeed = this.liveFeed.map(e => ({
                    ...e,
                    relativeTime: this.formatRelativeTime(e.timestamp),
                }));
            }, 30000);
        },
        connectUpgradeStream() {
            if (this.upgradeEventSource) this.upgradeEventSource.close();
            this.upgradeEventSource = apiService.getBuildingUpgradeStream();

            const handleUpgrade = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data.building_name) return;
                    this.upgradeFeed.unshift({
                        id: Date.now() + Math.random(),
                        timestamp: data.timestamp,
                        relativeTime: this.formatRelativeTime(data.timestamp),
                        teamName: data.team_name,
                        buildingName: data.building_name,
                        newLevel: data.new_level,
                    });
                    if (this.upgradeFeed.length > 100) this.upgradeFeed.pop();
                } catch (e) {
                    console.error('[UpgradeFeed] Failed to parse SSE message:', e);
                }
            };

            this.upgradeEventSource.addEventListener('history', handleUpgrade);
            this.upgradeEventSource.addEventListener('upgrade', handleUpgrade);
            this.upgradeEventSource.onerror = (e) => console.error('[UpgradeFeed] SSE error:', e);

            if (this.upgradeTimeInterval) clearInterval(this.upgradeTimeInterval);
            this.upgradeTimeInterval = setInterval(() => {
                this.upgradeFeed = this.upgradeFeed.map(e => ({
                    ...e,
                    relativeTime: this.formatRelativeTime(e.timestamp),
                }));
            }, 30000);
        },

        // ── Live feed popout ──
        openPopout() {
            const team = this.feedTeamFilter ?? '';
            const url = team ? `/live-feed?team=${encodeURIComponent(team)}` : '/live-feed';
            window.open(
                url,
                'liveFeedPopup',
                'width=420,height=700,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
            );
        },

        // ── Buildings tab helpers ──
        getOwnedQtyForTab(req, teamId) {
            const teamIdToUse = teamId ?? this.selectedTeamId;
            const teamData = this.teamResources.find(t => t.teamId === teamIdToUse);
            if (!teamData) return 0;
            const source = teamData.resources.find(
                r => r.source.toLowerCase() === req.name.toLowerCase()
            );
            if (!source) return 0;
            const tierEntry = source.tiers.find(t => t.tier === req.tier);
            return tierEntry ? tierEntry.quantity : 0;
        },
        isTabReqFulfilled(req, teamId) {
            return this.getOwnedQtyForTab(req, teamId) >= req.quantity;
        },
        isTabOptionFulfilled(option, teamId) {
            return option.requirements.every(req => this.isTabReqFulfilled(req, teamId));
        },
    },
    beforeUnmount() {
        if (this.eventSource) this.eventSource.close();
        if (this.upgradeEventSource) this.upgradeEventSource.close();
        if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
        if (this.upgradeTimeInterval) clearInterval(this.upgradeTimeInterval);
    },
};
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