<template>
    <transition name="modal-fade">
        <div v-if="building" class="modal-overlay" @click.self="close">
            <div class="modal-content" ref="modalContent"
                :style="swipeDelta > 0 ? { transform: `translateY(${swipeDelta}px)`, transition: 'none' } : {}"
                @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
                <!-- Drag handle -->
                <div class="drag-handle" @touchstart="onTouchStart">
                    <div class="drag-handle-bar"></div>
                </div>

                <!-- Header -->
                <div class="modal-header">
                    <div class="header-content">
                        <h2 class="building-name">{{ building.name }}</h2>
                        <div class="building-level-badge">Level {{ building.level }}</div>
                    </div>
                    <button class="close-btn" @click="close">✕</button>
                </div>

                <!-- Team Info -->
                <div class="team-info">
                    <span class="team-label">Team:</span>
                    <span class="team-name">{{ building.teamName }}</span>
                </div>

                <div class="modal-divider"></div>

                <!-- Allowed Sources -->
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

                <div class="modal-divider"></div>

                <!-- Upgrade Options -->
                <div class="modal-section">
                    <h3 class="section-title">⚡ Upgrade Paths</h3>
                    <div v-if="building.upgradable && building.upgradeOptions && building.upgradeOptions.length > 0">
                        <div v-for="option in building.upgradeOptions" :key="option.optionId" class="upgrade-option"
                            :class="{ 'upgrade-option--fulfilled': isOptionFulfilled(option) }">
                            <div class="option-header">
                                <span class="option-label">Option {{ option.optionId }}</span>
                                <span v-if="isOptionFulfilled(option)" class="fulfilled-badge">
                                    ✦ Ready to upgrade
                                </span>
                            </div>
                            <div class="requirements-grid">
                                <div v-for="req in option.requirements" :key="`${req.name}-${req.tier}`"
                                    class="requirement-item"
                                    :class="{ 'requirement-item--fulfilled': isReqFulfilled(req) }">
                                    <div class="requirement-header">
                                        <span class="requirement-building">{{ req.name }}</span>
                                    </div>
                                    <div class="requirement-details">
                                        <span class="tier-badge" :class="`tier-${req.tier}`">Tier {{ req.tier }}</span>
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
            </div>
        </div>
    </transition>
</template>

<script>
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
        }
    },
    data() {
        return {
            swipeDelta: 0,
            touchStartY: 0,
            touchStartTime: 0,
        };
    },
    watch: {
        // Reset swipe state whenever modal opens
        building(val) {
            if (val) this.swipeDelta = 0;
        }
    },
    methods: {
        close() {
            this.$emit('close');
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
            // Only handle single-finger touches
            if (e.touches.length !== 1) return;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
            this.swipeDelta = 0;
        },
        onTouchMove(e) {
            if (e.touches.length !== 1) return;
            const delta = e.touches[0].clientY - this.touchStartY;
            // Only track downward movement, clamp at 0 so it can't drag up
            this.swipeDelta = Math.max(0, delta);
            // Prevent page scroll while dragging the sheet
            if (this.swipeDelta > 0) e.preventDefault();
        },
        onTouchEnd() {
            const elapsed = Date.now() - this.touchStartTime;
            const velocity = this.swipeDelta / elapsed; // px/ms

            // Close if dragged > 120px OR flicked fast (>0.5px/ms)
            if (this.swipeDelta > 120 || velocity > 0.5) {
                this.close();
            } else {
                // Snap back
                this.swipeDelta = 0;
            }
        },
    }
}
</script>

<style scoped src="@/assets/buildingDetailsModal.css"></style>