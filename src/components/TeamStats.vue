<template>
    <div class="team-stats-container" :class="{ collapsed: isCollapsed }">
        <!-- Tooltip teleported to body - fully escapes all stacking contexts -->
        <Teleport to="body">
            <div v-if="tooltip.visible" class="teamstats-tooltip"
                :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">{{ tooltip.text }}</div>
        </Teleport>

        <!-- Mobile tab dropdown menu, teleported so it escapes the panel's overflow:hidden -->
        <Teleport to="body">
            <div v-if="tabDropdownOpen" class="tab-dropdown-menu" :style="{
                top: tabDropdownPos.top + 'px',
                left: tabDropdownPos.left + 'px',
                width: tabDropdownPos.width + 'px'
            }">
                <button v-for="tab in tabs" :key="tab.id" class="tab-dropdown-option"
                    :class="{ active: activeTab === tab.id }" @click="selectTab(tab.id)">
                    <span class="tab-icon">{{ tab.icon }}</span>
                    <span>{{ tab.label }}</span>
                </button>
            </div>
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

            <!-- Tab Navigation (desktop: button row) -->
            <div class="tab-nav">
                <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }"
                    @click="activeTab = tab.id">
                    <span class="tab-icon">{{ tab.icon }}</span>
                    <span class="tab-label">{{ tab.label }}</span>
                </button>
            </div>

            <!-- Tab Navigation (mobile: dropdown, hidden on desktop via CSS) -->
            <button class="tab-dropdown-trigger" :class="{ open: tabDropdownOpen }" @click="toggleTabDropdown($event)">
                <span class="tab-icon">{{ activeTabInfo.icon }}</span>
                <span class="tab-label">{{ activeTabInfo.label }}</span>
                <span class="dropdown-caret">▾</span>
            </button>

            <!-- Tab Content -->
            <div class="tab-content">

                <!-- Resources Tab -->
                <div v-show="activeTab === 'resources'" class="content-section">
                    <div v-if="!currentTeamResources || currentTeamResources.length === 0" class="empty-state">
                        <div class="empty-icon">📦</div>
                        <p>No resources data available</p>
                    </div>
                    <template v-else>
                        <!-- Resource Table: buildings as rows, tiers as columns -->
                        <div class="resource-table-wrap">
                            <table class="resource-table">
                                <thead>
                                    <tr>
                                        <th class="resource-table__name-col">Building</th>
                                        <th v-for="n in 9" :key="n" :data-tier="n"
                                            @mouseenter="showTooltip($event, tierLabel(n))" @mouseleave="hideTooltip()">
                                            T{{ n }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="resource in currentTeamResources" :key="resource.source">
                                        <td class="resource-table__name-col">{{ resource.source }}</td>
                                        <td v-for="tier in resource.tiers" :key="tier.tier" :data-tier="tier.tier"
                                            :class="{ empty: tier.quantity === 0 }"
                                            @mouseenter="showQtyTooltip($event, tier.quantity)" @mouseleave="hideTooltip()">
                                            {{ formatQty(tier.quantity) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
                    <div v-else class="building-groups-list">
                        <div v-for="group in groupedBuildingsForTab" :key="group.key || 'ungrouped'"
                            class="building-group">
                            <div class="building-group__header">
                                <span class="building-group__name">{{ group.displayName }}</span>
                                <span v-if="group.unlockedTier != null" class="building-group__tier"
                                    @mouseenter="showTooltip($event, tierLabel(group.unlockedTier))"
                                    @mouseleave="hideTooltip()">
                                    Tier {{ group.unlockedTier }} unlocked
                                </span>
                            </div>

                            <div class="buildings-tab-list">
                                <div v-for="building in group.buildings" :key="building.id ?? building.name"
                                    class="building-tab-item">

                                    <!-- Building header: name + level -->
                                    <div class="building-tab-header">
                                        <span class="building-tab-name">{{ building.name }}</span>
                                        <span class="building-tab-level"
                                            :class="building.level > 0 ? 'level--upgraded' : 'level--zero'">
                                            Lvl {{ building.level }}
                                        </span>
                                    </div>

                                    <!-- Multiplier breakdown, collapsed into tier ranges -->
                                    <div v-if="building.tierMultipliers" class="building-tab-multipliers">
                                        <span v-for="range in multiplierRanges(building.tierMultipliers)"
                                            :key="range.from" class="mult-chip" :class="multiplierClass(range.multiplier)">
                                            {{ range.from === range.to ? `T${range.from}` : `T${range.from}-T${range.to}` }}
                                            ×{{ range.multiplier }}
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
                                                <span v-for="(req, i) in option.requirements" :key="i"
                                                    class="building-tab-req"
                                                    :class="isTabReqFulfilled(req, building.teamId) ? 'req--met' : 'req--unmet'">
                                                    <span class="req-name">{{ req.name }}</span>
                                                    <span class="req-tier" :data-tier="req.tier"
                                                        @mouseenter="showTooltip($event, tierLabel(req.tier))"
                                                        @mouseleave="hideTooltip()">T{{
                                                        req.tier }}</span>
                                                    <span class="req-progress">
                                                        {{ getOwnedQtyForTab(req, building.teamId) }}/{{ req.quantity }}
                                                    </span>
                                                    <span v-if="i < option.requirements.length - 1"
                                                        class="req-sep">+</span>
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
        </div>
    </div>
</template>

<script>
import apiService from '@/services/apiService';
import { cacheGet, cacheSet } from '@/utils/useCache';
import { resolveDisplayName, multiplierRanges, multiplierClass } from '@/utils/buildingHelper';

export default {
    name: 'TeamStats',
    emits: ['collapsed-changed'],
    props: {
        selectedTeamId: { type: Number, default: null },
        teams: { type: Array, required: true },
        startCollapsed: { type: Boolean, default: null },
        teamResources: { type: Array, default: () => [] },
        buildings: { type: Array, default: () => [] },
        teamMultipliers: { type: Array, default: () => [] },
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
            liveFeed: [],
            feedTeamFilter: null,
            eventSource: null,
            upgradeFeed: [],
            upgradeTeamFilter: null,
            upgradeEventSource: null,
            tooltip: { visible: false, text: '', x: 0, y: 0 },
            tabDropdownOpen: false,
            tabDropdownPos: { top: 0, left: 0, width: 0 },
        };
    },
    computed: {
        activeTabInfo() {
            return this.tabs.find(t => t.id === this.activeTab) || this.tabs[0];
        },
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
        currentTeamMultipliers() {
            if (!this.selectedTeamId) return null;
            return this.teamMultipliers.find(t => t.teamId === this.selectedTeamId) || null;
        },
        // Buildings grouped for display, each carrying its own tierMultipliers and
        // its group's unlockedTier - both come from /getMultipliers, joined against
        // /getBuildings via the internalName field both responses share.
        groupedBuildingsForTab() {
            const multData = this.currentTeamMultipliers;
            const categoryMap = new Map();
            const groupInfoMap = new Map();
            if (multData) {
                multData.categoryMultipliers.forEach(c => categoryMap.set(c.building, c));
                multData.groupMultipliers.forEach(g => groupInfoMap.set(g.group, g));
            }

            const groups = new Map();
            this.buildingsForTab.forEach(building => {
                const mult = categoryMap.get(building.internalName);
                const groupKey = building.group || '';
                if (!groups.has(groupKey)) {
                    const info = groupInfoMap.get(groupKey);
                    groups.set(groupKey, {
                        key: groupKey,
                        displayName: building.groupDisplayName || info?.displayName || 'Ungrouped',
                        unlockedTier: info ? info.unlockedTier : null,
                        buildings: [],
                    });
                }
                groups.get(groupKey).buildings.push({
                    ...building,
                    tierMultipliers: mult ? mult.tierMultipliers : null,
                });
            });

            return [...groups.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
        },
    },
    watch: {
        selectedTeamId: {
            immediate: true,
            handler(newTeamId, oldTeamId) {
                if (!newTeamId) return;
                if (!oldTeamId) {
                    this.liveFeed = [];
                    this.upgradeFeed = [];
                    this.connectStream();
                    this.connectUpgradeStream();
                }
            },
        },
        activeTab(val) {
            cacheSet('statsActiveTab', val);
        },
    },
    methods: {
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            this.$emit('collapsed-changed', this.isCollapsed);
        },
        toggleTabDropdown(event) {
            if (this.tabDropdownOpen) {
                this.tabDropdownOpen = false;
                return;
            }
            const rect = event.currentTarget.getBoundingClientRect();
            this.tabDropdownPos = { top: rect.bottom + 6, left: rect.left, width: rect.width };
            this.tabDropdownOpen = true;
        },
        selectTab(tabId) {
            this.activeTab = tabId;
            this.tabDropdownOpen = false;
        },
        handleOutsideTabDropdownClick(event) {
            if (!this.tabDropdownOpen) return;
            const target = event.target;
            if (target.closest('.tab-dropdown-menu') || target.closest('.tab-dropdown-trigger')) return;
            this.tabDropdownOpen = false;
        },
        showTooltip(event, text) {
            const rect = event.target.getBoundingClientRect();
            this.tooltip = { visible: true, text, x: rect.left + rect.width / 2, y: rect.top };
        },
        formatQty(qty) {
            if (qty < 1000) return qty;
            return `${Math.round(qty / 1000)}K`;
        },
        showQtyTooltip(event, qty) {
            if (qty < 1000) return;
            this.showTooltip(event, qty.toLocaleString('en-US'));
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
                        buildingName: resolveDisplayName(data.building_name),
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
        multiplierRanges,
        multiplierClass,
    },
    mounted() {
        document.addEventListener('click', this.handleOutsideTabDropdownClick);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleOutsideTabDropdownClick);
        if (this.eventSource) this.eventSource.close();
        if (this.upgradeEventSource) this.upgradeEventSource.close();
        if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
        if (this.upgradeTimeInterval) clearInterval(this.upgradeTimeInterval);
    },
};
</script>

<style scoped src="@/assets/teamStats.css"></style>

<!-- Unscoped: targets teleported content rendered on <body> -->
<style>
.tab-dropdown-menu {
    position: fixed;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.4rem;
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(25, 18, 12, 0.99));
    border: 1px solid #8b7355;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.tab-dropdown-option {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.6rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #c9b896;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
}

.tab-dropdown-option:hover {
    background: rgba(139, 115, 85, 0.2);
    color: #f4e4c1;
}

.tab-dropdown-option.active {
    background: rgba(212, 175, 55, 0.15);
    color: #d4af37;
    font-weight: bold;
}

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