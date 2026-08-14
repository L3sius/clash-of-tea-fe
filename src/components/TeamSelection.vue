<template>
    <div class="legend-container" :class="{ collapsed: isCollapsed }">
        <!-- Collapsed State - Expand Button -->
        <button v-if="isCollapsed" class="expand-btn" @click="toggleCollapse" title="Expand Teams">
            <span class="hamburger-icon">☰</span>
            <span class="expand-label">Teams</span>
        </button>

        <!-- Expanded State - Full Panel -->
        <div v-else class="legend-panel" :class="{ 'legend-panel--wide': soloDuoEventMode }">
            <div class="legend-header">
                <h3 class="legend-title">Teams</h3>
                <button class="collapse-btn" @click="toggleCollapse" title="Collapse">✕</button>
            </div>
            <div class="legend-decoration"></div>

            <!-- Solo/Duo event mode: filter tabs + single-column list so full names
                 show without truncation. Event-specific - see the const above. -->
            <template v-if="soloDuoEventMode">
                <div class="solo-duo-tabs">
                    <button class="solo-duo-tab" :class="{ active: effectiveSoloDuoTab === 'solo' }"
                        @click="soloDuoTab = 'solo'">
                        Solo's
                    </button>
                    <button class="solo-duo-tab" :class="{ active: effectiveSoloDuoTab === 'duo' }"
                        @click="soloDuoTab = 'duo'">
                        Duo's
                    </button>
                </div>
                <div class="legend-content legend-content--single">
                    <div v-for="team in activeSoloDuoTeams" :key="team.id" class="team-item"
                        :class="{ 'selected': selectedTeamId === team.id }" @click="selectTeam(team.id)"
                        @mouseenter="showTooltip($event, team.name)" @mouseleave="hideTooltip">
                        <div class="team-marker"></div>
                        <span class="team-name">{{ team.name }}</span>
                    </div>
                </div>
            </template>

            <!-- Default: 2-column grid, used for normal (non solo/duo) team sizes -->
            <div v-else class="legend-content">
                <div v-for="team in teams" :key="team.id" class="team-item"
                    :class="{ 'selected': selectedTeamId === team.id }" @click="selectTeam(team.id)"
                    @mouseenter="showTooltip($event, team.name)" @mouseleave="hideTooltip">
                    <div class="team-marker"></div>
                    <span class="team-name">{{ team.name }}</span>
                </div>
            </div>
        </div>

        <!-- Custom Tooltip, teleported to body - .legend-panel's backdrop-filter would
             otherwise become the containing block for this fixed-position element,
             misplacing it and causing it to flicker as the mouse moves -->
        <Teleport to="body">
            <div v-if="tooltip.visible" class="team-legend-tooltip"
                :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
                {{ tooltip.text }}
            </div>
        </Teleport>
    </div>
</template>

<script>
// TEMP / event-specific: this CoT edition only has solo (1-player) and duo
// (2-player) teams, so the panel shows them as two filterable single-column
// tabs to keep full names visible (the general 2-column grid truncates
// longer names). Flip to false - or delete this const plus the `v-if
// soloDuoEventMode` template branch and its `v-else` - once a future
// edition goes back to larger, fixed-size teams.
const SOLO_DUO_EVENT_MODE = true;

export default {
    name: 'TeamSelection',
    emits: ['team-selected', 'collapsed-changed'],
    props: {
        teams: {
            type: Array,
            default: () => []
        },
        initialTeamId: {
            type: Number,
            default: 1
        },
        startCollapsed: {
            type: Boolean,
            default: null
        }
    },
    data() {
        const isMobile = window.innerWidth <= 768;
        return {
            selectedTeamId: this.initialTeamId,
            isCollapsed: this.startCollapsed !== null ? this.startCollapsed : isMobile,
            tooltip: {
                visible: false,
                text: '',
                x: 0,
                y: 0
            },
            soloDuoEventMode: SOLO_DUO_EVENT_MODE,
            // null until the user explicitly clicks a tab - until then the active
            // tab auto-follows whichever tab contains the currently selected team.
            soloDuoTab: null,
        }
    },
    computed: {
        soloTeams() {
            return this.teams.filter(t => (t.players?.length || 0) <= 1);
        },
        duoTeams() {
            return this.teams.filter(t => (t.players?.length || 0) >= 2);
        },
        autoSoloDuoTab() {
            const mine = this.teams.find(t => t.id === this.selectedTeamId);
            return mine && (mine.players?.length || 0) <= 1 ? 'solo' : 'duo';
        },
        effectiveSoloDuoTab() {
            return this.soloDuoTab || this.autoSoloDuoTab;
        },
        activeSoloDuoTeams() {
            return this.effectiveSoloDuoTab === 'solo' ? this.soloTeams : this.duoTeams;
        },
    },
    methods: {
        selectTeam(teamId) {
            this.selectedTeamId = teamId;
            this.$emit('team-selected', teamId, true);
        },
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            this.$emit('collapsed-changed', this.isCollapsed);
        },
        showTooltip(event, name) {
            // Bound to the whole row (bigger, more stable hover target - a small
            // text-only target means fast mouse movement briefly crosses several
            // different spans' edges in a row, each firing its own show/hide and
            // producing a flicker), but truncation is still checked against the
            // actual name text, not the row.
            const el = event.currentTarget.querySelector('.team-name');
            if (!el || el.scrollWidth <= el.clientWidth) return;
            const rect = el.getBoundingClientRect();
            this.tooltip = {
                visible: true,
                text: name,
                x: rect.left + rect.width / 2,
                y: rect.top
            };
        },
        hideTooltip() {
            this.tooltip.visible = false;
        }
    },
    mounted() {
        this.$emit('team-selected', this.selectedTeamId, false);
    },
    watch: {
        initialTeamId(val) {
            if (val && !this.selectedTeamId) {
                this.selectedTeamId = val;
            }
        }
    }
}
</script>

<style scoped src="@/assets/teamSelection.css"></style>

<!-- Unscoped: targets the teleported tooltip rendered on <body> -->
<style>
.team-legend-tooltip {
    position: fixed;
    transform: translate(-50%, calc(-100% - 8px));
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(30, 20, 15, 0.98));
    border: 1px solid #8b7355;
    border-radius: 4px;
    padding: 0.4rem 0.7rem;
    color: #f4e4c1;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.85rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 99999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.team-legend-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #8b7355;
}
</style>