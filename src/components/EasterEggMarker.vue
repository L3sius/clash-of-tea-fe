<template>
    <div class="easter-egg-marker" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <div class="easter-egg-tooltip" :class="{ 'has-image': hasImage }">
            <img v-if="hasImage" :src="`/images/easter_eggs/${egg.image}`" class="tooltip-image" draggable="false" />
            <span class="tooltip-description">{{ egg.description }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'EasterEggMarker',
    props: {
        egg: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isHovered: false,
        };
    },
    computed: {
        hasImage() {
            return !!this.egg.image;
        }
    }
};
</script>

<style scoped>
.easter-egg-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: default;
    z-index: 50;
    width: 40px;
    height: 40px;
}

.easter-egg-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
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

.easter-egg-tooltip.has-image {
    white-space: normal;
    max-width: 180px;
    width: max-content;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.easter-egg-tooltip.has-image .tooltip-description {
    padding: 8px 12px;
}

.easter-egg-marker:hover .easter-egg-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(-4px);
}

.easter-egg-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #8b7355;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.tooltip-image {
    display: block;
    width: 100%;
    max-width: 240px;
    max-height: 180px;
    height: auto;
    object-fit: contain;
    border-bottom: 2px solid #8b7355;
    border-radius: 4px 4px 0 0;
    user-select: none;
}

.tooltip-description {
    font-size: 0.9rem;
    font-style: italic;
    color: #f4e4c1;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    letter-spacing: 0.3px;
}

@media (max-width: 768px) {
    .easter-egg-tooltip {
        padding: 6px 10px;
        margin-bottom: 6px;
    }

    .easter-egg-tooltip.has-image {
        width: 150px;
        padding: 0;
    }

    .easter-egg-tooltip.has-image .tooltip-description {
        padding: 6px 10px;
    }

    .tooltip-image {
        height: 90px;
    }

    .tooltip-description {
        font-size: 0.8rem;
    }

    .easter-egg-tooltip::after {
        border-left-width: 6px;
        border-right-width: 6px;
        border-top-width: 6px;
    }
}
</style>