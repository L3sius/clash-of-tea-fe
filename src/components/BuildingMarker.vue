<template>
    <div class="building-marker" :class="{ 'selected': isSelected }" @click="handleClick"
        :title="`${building.name} (Level ${building.level})`">
        <img :src="building.icon" :alt="building.name" class="building-image" @error="handleImageError" />
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
    width: 250px;
    height: 273px;
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

@media (max-width: 768px) {
    .building-marker {
        width: 125px;
        height: 136.5px;
    }
}
</style>