<template>
    <transition name="modal-fade">
        <div v-if="building" class="modal-overlay" @click.self="close">

            <!-- Tier tooltip teleported to body -->
            <Teleport to="body">
                <div v-if="tierTooltip.visible" class="tier-tooltip"
                    :style="{ top: tierTooltip.y + 'px', left: tierTooltip.x + 'px' }">
                    {{ tierTooltip.text }}
                </div>
            </Teleport>
            <div class="modal-content" ref="modalContent"
                :style="swipeDelta > 0 ? { transform: `translateY(${swipeDelta}px)`, transition: 'none' } : {}"
                @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
                <!-- Drag handle -->
                <div class="drag-handle" @touchstart="onTouchStart">
                    <div class="drag-handle-bar"></div>
                </div>

                <!-- Header: title + level only -->
                <div class="modal-header">
                    <div class="header-content">
                        <div class="building-title-block">
                            <h2 class="building-name">{{ building.name }}</h2>
                            <span v-if="building.groupDisplayName" class="building-group-label">{{
                                building.groupDisplayName }}</span>
                        </div>
                        <div class="building-level-badge">Level {{ building.level }}</div>
                    </div>
                    <button class="close-btn" @click="close">✕</button>
                </div>

                <!-- Team Info -->
                <div class="team-info">
                    <span class="team-label">Team:</span>
                    <span class="team-name">{{ building.teamName }}</span>
                </div>

                <!-- Current multiplier breakdown for this building -->
                <div v-if="currentMultipliers" class="modal-section modal-multipliers-block">
                    <h3 class="section-title">✨ Current Multipliers</h3>
                    <div class="modal-multipliers">
                        <span v-for="range in multiplierRanges(currentMultipliers.tierMultipliers)" :key="range.from"
                            class="mult-chip" :class="multiplierClass(range.multiplier)">
                            {{ range.from === range.to ? `T${range.from}` : `T${range.from}-T${range.to}` }}
                            ×{{ range.multiplier }}
                        </span>
                    </div>
                </div>

                <div class="modal-divider"></div>

                <!-- Upgrade Options + Building Image side by side -->
                <div class="modal-section upgrade-image-row">
                    <!-- Left: upgrade paths -->
                    <div class="upgrade-col">
                        <h3 class="section-title">⚡ Upgrade Paths</h3>
                        <div
                            v-if="building.upgradable && building.upgradeOptions && building.upgradeOptions.length > 0">
                            <div v-for="option in building.upgradeOptions" :key="option.optionId" class="upgrade-option"
                                :class="{ 'upgrade-option--fulfilled': isOptionFulfilled(option) }">
                                <div class="option-header">
                                    <span class="option-label">Option {{ option.optionId }}</span>
                                    <button v-if="isOptionFulfilled(option)" class="upgrade-btn"
                                        :disabled="upgradingOptionId === option.optionId"
                                        @click="upgradeOption(option)">
                                        {{ upgradingOptionId === option.optionId ? 'Upgrading…' : '✦ Upgrade' }}
                                    </button>
                                </div>
                                <div v-if="upgradeErrors[option.optionId]" class="upgrade-error">
                                    <p class="upgrade-error__message">{{ upgradeErrors[option.optionId].message }}</p>
                                    <ul v-if="upgradeErrors[option.optionId].missing" class="upgrade-error__missing">
                                        <li v-for="(m, i) in upgradeErrors[option.optionId].missing" :key="i">
                                            {{ m.name }} T{{ m.tier }}: have {{ m.have }}, need {{ m.need }}
                                        </li>
                                    </ul>
                                </div>
                                <div class="requirements-grid">
                                    <div v-for="req in option.requirements" :key="`${req.name}-${req.tier}`"
                                        class="requirement-item"
                                        :class="{ 'requirement-item--fulfilled': isReqFulfilled(req) }">
                                        <div class="requirement-header">
                                            <span class="requirement-building requirement-building--link"
                                                @click="openBuilding(req.name)">
                                                {{ req.name }}
                                            </span>
                                        </div>
                                        <div class="requirement-details">
                                            <span class="tier-badge" :class="`tier-${req.tier}`"
                                                @mouseenter="showTierTooltip($event, req.tier)"
                                                @mouseleave="tierTooltip.visible = false">Tier {{ req.tier }}</span>
                                            <span class="quantity"
                                                :class="isReqFulfilled(req) ? 'quantity--met' : 'quantity--unmet'">
                                                {{ getOwnedQty(req) }}/{{ req.quantity }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="!building.upgradable" class="max-level-message">
                            <span class="trophy-icon">🏆</span>
                            <span>Maximum level reached!</span>
                        </div>
                        <p v-else class="empty-message">No upgrade options available</p>
                    </div>

                    <!-- Right: building image -->
                    <div v-if="building.icon" class="building-image-col">
                        <img :src="building.icon" :alt="building.name" class="building-portrait" />
                    </div>
                </div>

                <div class="modal-divider"></div>

                <!-- Allowed Sources (bottom) -->
                <div class="modal-section">
                    <h3 class="section-title">📜 Allowed Sources</h3>
                    <div v-if="building.allowedSources && building.allowedSources.length > 0" class="sources-grid">
                        <div v-for="source in building.allowedSources" :key="source" class="source-item">
                            <span class="source-icon">▸</span>
                            {{ source }}
                        </div>
                    </div>
                    <p v-else class="empty-message">No specific sources</p>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import apiService from '@/services/apiService';
import { multiplierRanges, multiplierClass } from '@/utils/buildingHelper';

export default {
    name: 'BuildingDetailsModal',
    props: {
        building: {
            type: Object,
            default: null
        },
        teamResources: {
            type: Array,
            default: () => []
        },
        teamMultipliers: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            swipeDelta: 0,
            touchStartY: 0,
            touchStartTime: 0,
            tierTooltip: { visible: false, text: '', x: 0, y: 0 },
            upgradingOptionId: null,
            upgradeErrors: {},
        };
    },
    watch: {
        building(val) {
            if (val) this.swipeDelta = 0;
            this.upgradingOptionId = null;
            this.upgradeErrors = {};
        }
    },
    computed: {
        currentMultipliers() {
            if (!this.building) return null;
            const teamData = this.teamMultipliers.find(t => t.teamId === this.building.teamId);
            if (!teamData) return null;
            return teamData.categoryMultipliers.find(c => c.building === this.building.internalName) || null;
        },
    },
    methods: {
        multiplierRanges,
        multiplierClass,
        close() {
            this.$emit('close');
        },
        async upgradeOption(option) {
            if (this.upgradingOptionId) return;
            this.upgradingOptionId = option.optionId;
            const { [option.optionId]: _dropped, ...rest } = this.upgradeErrors;
            this.upgradeErrors = rest;
            try {
                await apiService.upgradeBuilding(this.building.teamId, this.building.name, option.optionId);
                this.$emit('upgraded');
            } catch (error) {
                this.upgradeErrors = {
                    ...this.upgradeErrors,
                    [option.optionId]: { message: error.message, missing: error.missing },
                };
            } finally {
                this.upgradingOptionId = null;
            }
        },
        getOwnedQty(req) {
            const source = this.teamResources.find(
                r => r.source.toLowerCase() === req.name.toLowerCase()
            );
            if (!source) return 0;
            const tierEntry = source.tiers.find(t => t.tier === req.tier);
            return tierEntry ? tierEntry.quantity : 0;
        },
        isReqFulfilled(req) {
            return this.getOwnedQty(req) >= req.quantity;
        },
        isOptionFulfilled(option) {
            return option.requirements.every(req => this.isReqFulfilled(req));
        },

        // ── Swipe to close ──
        onTouchStart(e) {
            if (e.touches.length !== 1) return;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
            this.swipeDelta = 0;
        },
        onTouchMove(e) {
            if (e.touches.length !== 1) return;
            const delta = e.touches[0].clientY - this.touchStartY;
            this.swipeDelta = Math.max(0, delta);
            if (this.swipeDelta > 0) e.preventDefault();
        },
        onTouchEnd() {
            const elapsed = Date.now() - this.touchStartTime;
            const velocity = this.swipeDelta / elapsed;
            if (this.swipeDelta > 120 || velocity > 0.5) {
                this.close();
            } else {
                this.swipeDelta = 0;
            }
        },
        openBuilding(buildingName) {
            this.$emit('open-building', buildingName);
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
        showTierTooltip(event, tier) {
            const rect = event.target.getBoundingClientRect();
            this.tierTooltip = {
                visible: true,
                text: this.tierLabel(tier),
                x: rect.left + rect.width / 2,
                y: rect.top,
            };
        },
    }
}
</script>

<style scoped src="@/assets/buildingDetailsModal.css"></style>

<!-- Unscoped: targets the teleported tooltip rendered on <body> -->
<style>
.tier-tooltip {
    position: fixed;
    transform: translate(-50%, calc(-100% - 8px));
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(30, 20, 15, 0.98));
    border: 1px solid #8b7355;
    border-radius: 4px;
    padding: 0.4rem 0.7rem;
    color: #f4e4c1;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.75rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 99999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.tier-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #8b7355;
}
</style>