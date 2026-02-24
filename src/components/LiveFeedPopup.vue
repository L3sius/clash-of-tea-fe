<template>
    <div class="popup-root">
        <div class="popup-header">
            <span class="popup-title">⚡ Live Feed</span>
            <span class="popup-count">{{ filteredFeed.length }} events</span>
        </div>

        <div class="popup-filters">
            <button class="popup-pill" :class="{ active: teamFilter === null }" @click="teamFilter = null">All</button>
            <button v-for="team in teams" :key="team.id" class="popup-pill"
                :class="{ active: teamFilter === team.name }" @click="teamFilter = team.name">
                {{ team.name }}
            </button>
        </div>

        <div v-if="filteredFeed.length === 0" class="popup-empty">
            <span class="popup-empty-icon">📡</span>
            <p>{{ liveFeed.length === 0 ? 'Waiting for activity...' : 'No activity for this team' }}</p>
        </div>
        <div v-else class="popup-feed" ref="feedEl">
            <div v-for="entry in filteredFeed" :key="entry.id" class="popup-item"
                :class="entry.success ? 'item-success' : 'item-fail'">
                <div class="item-dot" :class="entry.success ? 'dot-success' : 'dot-fail'"></div>
                <div class="item-body">
                    <div class="item-line">
                        <span class="item-player">{{ entry.player }}</span>
                        <span v-if="entry.source" class="item-source">{{ entry.source }}</span>
                    </div>
                    <div class="item-meta">
                        <span v-if="entry.rewards.length" class="item-rewards">
                            <span v-for="r in entry.rewards" :key="r.tier" class="item-tier" :data-tier="r.tier">
                                T{{ r.tier }} <span class="item-qty">(×{{ r.qty }})</span>
                            </span>
                        </span>
                        <span class="item-time">{{ entry.relativeTime }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import apiService from '@/services/apiService';

export default {
    name: 'LiveFeedPopup',
    data() {
        return {
            teams: [],
            teamFilter: null,
            liveFeed: [],
            eventSource: null,
            timeUpdateInterval: null,
        };
    },
    computed: {
        filteredFeed() {
            if (!this.teamFilter) return this.liveFeed;
            return this.liveFeed.filter(e => e.team === this.teamFilter);
        },
    },
    async created() {
        // Read pre-selected team from query param
        const params = new URLSearchParams(window.location.search);
        const teamParam = params.get('team');

        try {
            const data = await apiService.getTeams();
            this.teams = data.teams.map(t => ({ id: t.id, name: t.name }));
            // Apply filter only if the team actually exists
            if (teamParam && this.teams.some(t => t.name === teamParam)) {
                this.teamFilter = teamParam;
            }
        } catch (e) {
            console.error('[LiveFeedPopup] Failed to load teams:', e);
        }

        this.connectStream();

        // Set window title dynamically
        document.title = this.teamFilter ? `Live Feed — ${this.teamFilter}` : 'Live Feed';
    },
    beforeUnmount() {
        if (this.eventSource) this.eventSource.close();
        if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    },
    methods: {
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
                    console.error('[LiveFeedPopup] Failed to parse SSE message:', e);
                }
            };

            this.eventSource.addEventListener('history', handleEvent);
            this.eventSource.addEventListener('action', handleEvent);
            this.eventSource.onerror = (e) => console.error('[LiveFeedPopup] SSE error:', e);

            this.timeUpdateInterval = setInterval(() => {
                this.liveFeed = this.liveFeed.map(e => ({
                    ...e,
                    relativeTime: this.formatRelativeTime(e.timestamp),
                }));
            }, 30000);
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
        formatRelativeTime(timestamp) {
            const diff = Math.floor(Date.now() / 1000) - timestamp;
            if (diff < 60) return `${diff}s ago`;
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            return `${Math.floor(diff / 3600)}h ago`;
        },
    },
};
</script>

<style>
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html,
body {
    height: 100%;
    background: #1a1208;
    color: #f4e4c1;
    font-family: 'Georgia', 'Times New Roman', serif;
    overflow: hidden;
}

.popup-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(160deg, rgba(40, 30, 20, 0.98), rgba(20, 14, 8, 1));
}

/* ── Header ── */
.popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem 0.6rem;
    border-bottom: 2px solid rgba(139, 115, 85, 0.35);
    flex-shrink: 0;
    background: rgba(20, 14, 8, 0.6);
}

.popup-title {
    font-size: 1.05rem;
    font-weight: bold;
    color: #f4e4c1;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.popup-count {
    font-size: 0.72rem;
    color: #6b5744;
    font-style: italic;
}

/* ── Team filters ── */
.popup-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid rgba(139, 115, 85, 0.2);
    flex-shrink: 0;
}

.popup-pill {
    padding: 0.25rem 0.65rem;
    background: rgba(20, 15, 10, 0.5);
    border: 1px solid rgba(139, 115, 85, 0.35);
    border-radius: 20px;
    color: #c9b896;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.popup-pill:hover {
    border-color: rgba(139, 115, 85, 0.7);
    color: #f4e4c1;
}

.popup-pill.active {
    background: linear-gradient(135deg, rgba(139, 115, 85, 0.35), rgba(139, 115, 85, 0.15));
    border-color: #d4af37;
    color: #f4e4c1;
    box-shadow: 0 0 6px rgba(212, 175, 55, 0.2);
}

/* ── Empty state ── */
.popup-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: #6b5744;
}

.popup-empty-icon {
    font-size: 2.5rem;
    opacity: 0.5;
}

.popup-empty p {
    font-size: 0.9rem;
    font-style: italic;
}

/* ── Feed scroll area ── */
.popup-feed {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.popup-feed::-webkit-scrollbar {
    width: 6px;
}

.popup-feed::-webkit-scrollbar-track {
    background: rgba(20, 15, 10, 0.4);
}

.popup-feed::-webkit-scrollbar-thumb {
    background: rgba(139, 115, 85, 0.4);
    border-radius: 3px;
}

.popup-feed::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 115, 85, 0.65);
}

/* ── Feed item ── */
.popup-item {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    padding: 0.4rem 0.55rem;
    border-radius: 5px;
    border-left: 3px solid transparent;
    animation: slideIn 0.25s ease;
}

.item-success {
    border-left-color: rgba(74, 222, 128, 0.6);
    background: rgba(74, 222, 128, 0.04);
}

.item-fail {
    border-left-color: rgba(248, 113, 113, 0.6);
    background: rgba(248, 113, 113, 0.04);
}

.item-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
}

.dot-success {
    background: #4ade80;
    box-shadow: 0 0 4px rgba(74, 222, 128, 0.6);
}

.dot-fail {
    background: #f87171;
    box-shadow: 0 0 4px rgba(248, 113, 113, 0.6);
}

.item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.item-line {
    display: flex;
    gap: 0.35rem;
    align-items: baseline;
    flex-wrap: nowrap;
    min-width: 0;
}

.item-player {
    color: #f4e4c1;
    font-weight: bold;
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-source {
    color: #c9b896;
    font-size: 0.78rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
}

.item-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: nowrap;
    min-width: 0;
}

.item-rewards {
    display: inline-flex;
    gap: 0.2rem;
    flex-wrap: nowrap;
}

.item-tier {
    font-size: 0.68rem;
    font-weight: bold;
    padding: 0.08rem 0.28rem;
    border-radius: 3px;
    white-space: nowrap;
    background: rgba(212, 175, 55, 0.12);
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: #d4af37;
}

.item-tier[data-tier="1"] {
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.35);
}

.item-tier[data-tier="2"] {
    color: #67e8f9;
    background: rgba(103, 232, 249, 0.12);
    border-color: rgba(103, 232, 249, 0.35);
}

.item-tier[data-tier="3"] {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.12);
    border-color: rgba(74, 222, 128, 0.35);
}

.item-tier[data-tier="4"] {
    color: #86efac;
    background: rgba(134, 239, 172, 0.12);
    border-color: rgba(134, 239, 172, 0.35);
}

.item-tier[data-tier="5"] {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.12);
    border-color: rgba(251, 191, 36, 0.35);
}

.item-tier[data-tier="6"] {
    color: #fb923c;
    background: rgba(251, 146, 60, 0.12);
    border-color: rgba(251, 146, 60, 0.35);
}

.item-tier[data-tier="7"] {
    color: #f87171;
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.35);
}

.item-tier[data-tier="8"] {
    color: #c084fc;
    background: rgba(192, 132, 252, 0.12);
    border-color: rgba(192, 132, 252, 0.35);
}

.item-tier[data-tier="9"] {
    color: #ffd700;
    background: rgba(255, 215, 0, 0.12);
    border-color: rgba(255, 215, 0, 0.40);
}

.item-qty {
    opacity: 0.65;
    font-weight: normal;
}

.item-time {
    color: #6b5744;
    font-size: 0.68rem;
    font-style: italic;
    flex-shrink: 0;
    margin-left: auto;
    white-space: nowrap;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-8px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>