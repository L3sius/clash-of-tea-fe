<template>
    <transition name="modal-fade">
        <div v-if="building" class="modal-overlay" @click.self="closeModal">
            <div class="modal-container">
                <!-- Header -->
                <div class="modal-header">
                    <h2 class="building-title">{{ formatBuildingName(building.name) }}</h2>
                    <div class="level-display">Level {{ building.level }}</div>
                    <button class="close-btn" @click="closeModal">×</button>
                </div>

                <!-- Divider -->
                <div class="decorative-divider"></div>

                <!-- Current Upgrades Section -->
                <div class="modal-section">
                    <h3 class="section-title">
                        <span class="title-icon">⚡</span>
                        Current Upgrades
                    </h3>
                    <div class="upgrade-content current">
                        <p>{{ building.currentUpgrades }}</p>
                    </div>
                </div>

                <!-- Next Upgrade Section -->
                <div class="modal-section">
                    <h3 class="section-title">
                        <span class="title-icon">🔮</span>
                        Next Upgrade
                    </h3>
                    <div class="upgrade-content next">
                        <p>{{ building.nextUpgrade }}</p>
                    </div>
                </div>

                <!-- Resources Required Section -->
                <div class="modal-section">
                    <h3 class="section-title">
                        <span class="title-icon">💎</span>
                        Resources Required
                    </h3>

                    <!-- Minerals -->
                    <div v-if="building.resourcesForNextUpgrade.minerals.length > 0" class="resource-group">
                        <h4 class="resource-category">Minerals</h4>
                        <div class="resource-list">
                            <div v-for="mineral in building.resourcesForNextUpgrade.minerals" :key="mineral.name"
                                class="resource-item">
                                <span class="resource-name">{{ mineral.name }}</span>
                                <span class="resource-quantity">{{ formatNumber(mineral.quantity) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Items -->
                    <div v-if="building.resourcesForNextUpgrade.items.length > 0" class="resource-group">
                        <h4 class="resource-category">Items</h4>
                        <div class="resource-list">
                            <div v-for="item in building.resourcesForNextUpgrade.items" :key="item.name"
                                class="resource-item">
                                <span class="resource-name">{{ item.name }}</span>
                                <span class="resource-quantity">{{ formatNumber(item.quantity) }}</span>
                            </div>
                        </div>
                    </div>
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
        closeModal() {
            this.$emit('close');
        },
        handleUpgrade() {
            this.$emit('upgrade', this.building);
            // You can add upgrade logic here
        },
        formatBuildingName(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        formatNumber(num) {
            return num.toLocaleString();
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
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-container {
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(30, 20, 15, 0.98));
    border: 4px solid #8b7355;
    border-radius: 12px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.9),
        inset 0 2px 0 rgba(139, 115, 85, 0.4),
        0 0 40px rgba(139, 115, 85, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    padding: 2rem;
    font-family: 'Georgia', 'Times New Roman', serif;
    position: relative;
}

.modal-container::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background: linear-gradient(45deg, #6b5744, #8b7355, #6b5744);
    border-radius: 12px;
    z-index: -1;
    opacity: 0.6;
}

/* Header */
.modal-header {
    position: relative;
    text-align: center;
    margin-bottom: 1.5rem;
}

.building-title {
    font-size: 2rem;
    color: #f4e4c1;
    margin: 0 0 0.5rem 0;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
    letter-spacing: 2px;
}

.level-display {
    display: inline-block;
    background: linear-gradient(135deg, #d4af37, #8b7355);
    border: 2px solid #f4e4c1;
    border-radius: 20px;
    padding: 0.4rem 1.2rem;
    font-size: 0.9rem;
    font-weight: bold;
    color: #1a1410;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.close-btn {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    width: 40px;
    height: 40px;
    background: rgba(139, 115, 85, 0.9);
    border: 2px solid #f4e4c1;
    border-radius: 50%;
    color: #f4e4c1;
    font-size: 1.8rem;
    line-height: 1;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.close-btn:hover {
    background: rgba(244, 228, 193, 0.9);
    color: #1a1410;
    transform: rotate(90deg);
}

/* Decorative Divider */
.decorative-divider {
    height: 3px;
    background: linear-gradient(90deg, transparent, #8b7355, transparent);
    margin: 1.5rem 0;
    position: relative;
}

.decorative-divider::before,
.decorative-divider::after {
    content: '◆';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #d4af37;
    font-size: 0.8rem;
}

.decorative-divider::before {
    left: 10px;
}

.decorative-divider::after {
    right: 10px;
}

/* Sections */
.modal-section {
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 1.3rem;
    color: #d4af37;
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.title-icon {
    font-size: 1.2rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
}

.upgrade-content {
    background: rgba(20, 15, 10, 0.6);
    border: 2px solid rgba(139, 115, 85, 0.4);
    border-radius: 8px;
    padding: 1rem;
    color: #c9b896;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.upgrade-content.current {
    border-left: 4px solid #4ade80;
}

.upgrade-content.next {
    border-left: 4px solid #60a5fa;
}

.upgrade-content p {
    margin: 0;
}

/* Resources */
.resource-group {
    margin-top: 1rem;
}

.resource-category {
    font-size: 1rem;
    color: #f4e4c1;
    margin: 0 0 0.5rem 0;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.resource-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.resource-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(20, 15, 10, 0.4);
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    /* transition: all 0.3s ease; */
}

.resource-item:hover {
    background: rgba(40, 30, 20, 0.6);
    border-color: rgba(139, 115, 85, 0.5);
}

.resource-name {
    color: #f4e4c1;
    font-weight: 500;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.resource-quantity {
    color: #d4af37;
    font-weight: bold;
    font-size: 1.1rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Footer */
.modal-footer {
    margin-top: 2rem;
    text-align: center;
}

.btn-icon {
    font-size: 1.2rem;
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

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
    transform: scale(0.9);
}

/* Scrollbar styling */
.modal-container::-webkit-scrollbar {
    width: 8px;
}

.modal-container::-webkit-scrollbar-track {
    background: rgba(20, 15, 10, 0.4);
    border-radius: 4px;
}

.modal-container::-webkit-scrollbar-thumb {
    background: #8b7355;
    border-radius: 4px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
    background: #a08060;
}

/* Responsive */
@media (max-width: 768px) {
    .modal-container {
        padding: 1.5rem;
        max-height: 90vh;
    }

    .building-title {
        font-size: 1.5rem;
    }

    .section-title {
        font-size: 1.1rem;
    }

    .upgrade-btn {
        width: 100%;
        padding: 0.9rem 1.5rem;
    }
}
</style>