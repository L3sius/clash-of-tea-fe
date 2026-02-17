<template>
    <div class="building-marker" :class="{ 'selected': isSelected }" @click="handleClick">
        <img :src="building.icon" :alt="building.name" class="building-image" @error="handleImageError" />

        <!-- Custom tooltip -->
        <div class="building-tooltip">
            <div class="tooltip-name">{{ formatBuildingName(building.name) }}</div>
            <div class="tooltip-level">Level {{ building.level }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BuildingMarker',
    props: {
        building: {
            type: Object,
            required: true
        },
        isSelected: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick() {
            this.$emit('click', this.building);
        },
        handleImageError(e) {
            console.log("Image not found:", this.building.name);
            console.log("test:", this.building.icon);
        },
        formatBuildingName(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    }
}
</script>

<style scoped>
.building-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 10;
    width: 8.138vw;
    height: 8.893vw;
    max-width: 250px;
    max-height: 273px;
    transition: all 0.3s ease;
}

.building-marker:hover {
    z-index: 20;
    transform: translate(-50%, -50%) scale(1.1);
}

.building-marker.selected {
    z-index: 30;
}

.building-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
}

/* Custom Tooltip — appears below the building */
.building-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(40, 30, 20, 0.98), rgba(30, 20, 15, 0.98));
    border: 2px solid #8b7355;
    border-radius: 6px;
    box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.7),
        inset 0 1px 0 rgba(139, 115, 85, 0.3),
        0 0 12px rgba(139, 115, 85, 0.3);
    font-family: 'Georgia', 'Times New Roman', serif;
    text-align: center;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 100;
}

.building-marker:hover .building-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(4px);
}

/* Tooltip arrow — points up toward the building */
.building-tooltip::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #8b7355;
    filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.3));
}

.tooltip-name {
    font-size: 0.95rem;
    font-weight: bold;
    color: #f4e4c1;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    letter-spacing: 0.5px;
}

.tooltip-level {
    font-size: 0.75rem;
    color: #d4af37;
    margin-top: 3px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

@media (max-width: 1024px) {
    .building-marker {
        width: 8vw;
        height: 9.55vw;
        max-width: 150px;
        max-height: 163.8px;
    }
}

@media (max-width: 768px) {
    .building-marker {
        width: 29vw;
        height: 34.3vw;
        max-width: 200px;
        max-height: 216px;
    }

    .building-tooltip {
        padding: 6px 10px;
        margin-top: 6px;
    }

    .tooltip-name {
        font-size: 0.85rem;
    }

    .tooltip-level {
        font-size: 0.7rem;
    }

    .building-tooltip::after {
        border-left-width: 6px;
        border-right-width: 6px;
        border-bottom-width: 6px;
    }
}
</style>