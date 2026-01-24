<template>
    <transition name="modal-fade">
        <div v-if="building" class="modal-overlay" @click.self="close">
            <div class="modal-content">
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
                    <p v-else class="empty-message">No specific sources (Town Hall)</p>
                </div>

                <div class="modal-divider"></div>

                <!-- Upgrade Options -->
                <div class="modal-section">
                    <h3 class="section-title">⚡ Upgrade Paths</h3>
                    <div v-if="building.upgradable && building.upgradeOptions && building.upgradeOptions.length > 0">
                        <div v-for="option in building.upgradeOptions" :key="option.optionId" class="upgrade-option">
                            <div class="option-header">
                                <span class="option-label">Option {{ option.optionId }}</span>
                            </div>
                            <div class="requirements-grid">
                                <div v-for="req in option.requirements" :key="`${req.name}-${req.tier}`"
                                    class="requirement-item">
                                    <div class="requirement-header">
                                        <span class="building-icon">🏰</span>
                                        <span class="requirement-building">{{ req.name }}</span>
                                    </div>
                                    <div class="requirement-details">
                                        <span class="tier-badge" :class="`tier-${req.tier}`">Tier {{ req.tier }}</span>
                                        <span class="quantity">{{ req.quantity }}x</span>
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
        }
    },
    methods: {
        close() {
            this.$emit('close');
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 2rem;
}

.modal-content {
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(30, 20, 15, 1));
    border: 3px solid #8b7355;
    border-radius: 12px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(139, 115, 85, 0.3),
        0 0 20px rgba(139, 115, 85, 0.2);
    font-family: 'Georgia', 'Times New Roman', serif;
}

.modal-content::-webkit-scrollbar {
    width: 8px;
}

.modal-content::-webkit-scrollbar-track {
    background: rgba(20, 15, 10, 0.4);
    border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
    background: rgba(139, 115, 85, 0.5);
    border-radius: 4px;
}

/* Header */
.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid rgba(139, 115, 85, 0.3);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.building-name {
    color: #f4e4c1;
    font-size: 1.8rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.building-level-badge {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1));
    border: 2px solid #d4af37;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    color: #f4e4c1;
    font-size: 0.9rem;
    font-weight: 600;
}

.close-btn {
    width: 36px;
    height: 36px;
    background: rgba(20, 15, 10, 0.4);
    border: 2px solid rgba(139, 115, 85, 0.3);
    border-radius: 4px;
    color: #c9b896;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: rgba(40, 30, 20, 0.6);
    border-color: #d4af37;
    color: #f4e4c1;
    transform: rotate(90deg);
}

/* Team Info */
.team-info {
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.team-label {
    color: #a89070;
    font-size: 0.9rem;
}

.team-name {
    color: #f4e4c1;
    font-size: 1.1rem;
    font-weight: 600;
}

/* Divider */
.modal-divider {
    height: 2px;
    background: linear-gradient(90deg, transparent, #8b7355, transparent);
    margin: 0 2rem;
}

/* Sections */
.modal-section {
    padding: 1.5rem 2rem;
}

.section-title {
    color: #f4e4c1;
    font-size: 1.3rem;
    margin: 0 0 1rem 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Sources Grid */
.sources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
}

.source-item {
    background: rgba(20, 15, 10, 0.4);
    border: 1px solid rgba(139, 115, 85, 0.3);
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    color: #c9b896;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.source-icon {
    color: #d4af37;
}

/* Upgrade Options */
.upgrade-option {
    background: rgba(20, 15, 10, 0.4);
    border: 2px solid rgba(139, 115, 85, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.upgrade-option:last-child {
    margin-bottom: 0;
}

.option-header {
    margin-bottom: 0.75rem;
}

.option-label {
    color: #f4e4c1;
    font-size: 1.1rem;
    font-weight: 600;
}

.requirements-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.requirement-item {
    background: rgba(0, 0, 0, 0.3);
    border-left: 3px solid #d4af37;
    padding: 0.75rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.requirement-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.building-icon {
    font-size: 1.2rem;
}

.requirement-building {
    color: #f4e4c1;
    font-weight: 600;
}

.requirement-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.tier-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid;
}

.tier-badge.tier-1 {
    background: rgba(148, 163, 184, 0.2);
    color: #94a3b8;
    border-color: #94a3b8;
}

.tier-badge.tier-2 {
    background: rgba(103, 232, 249, 0.2);
    color: #67e8f9;
    border-color: #67e8f9;
}

.tier-badge.tier-3 {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
    border-color: #4ade80;
}

.tier-badge.tier-4 {
    background: rgba(134, 239, 172, 0.2);
    color: #86efac;
    border-color: #86efac;
}

.tier-badge.tier-5 {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    border-color: #fbbf24;
}

.tier-badge.tier-6 {
    background: rgba(251, 146, 60, 0.2);
    color: #fb923c;
    border-color: #fb923c;
}

.tier-badge.tier-7 {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
    border-color: #f87171;
}

.tier-badge.tier-8 {
    background: rgba(192, 132, 252, 0.2);
    color: #c084fc;
    border-color: #c084fc;
}

.tier-badge.tier-9 {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    border-color: #ffd700;
}

.quantity {
    color: #d4af37;
    font-size: 1rem;
    font-weight: 700;
}

/* Empty States */
.empty-message {
    color: #a89070;
    font-style: italic;
    text-align: center;
    padding: 1rem;
}

.max-level-message {
    background: rgba(255, 215, 0, 0.1);
    border: 2px solid rgba(255, 215, 0, 0.3);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    color: #ffd700;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.trophy-icon {
    font-size: 2rem;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
    transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 1rem;
    }

    .modal-header,
    .team-info,
    .modal-section {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }

    .building-name {
        font-size: 1.5rem;
    }

    .sources-grid {
        grid-template-columns: 1fr;
    }

    .requirement-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
}
</style>