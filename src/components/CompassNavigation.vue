<template>
    <div class="compass-container" :class="{ collapsed: isCollapsed }">
        <!-- Collapsed State - Hamburger Button -->
        <button v-if="isCollapsed" class="expand-btn" @click="toggleCollapse" title="Expand Navigation">
            <span class="hamburger-icon">☰</span>
        </button>

        <!-- Expanded State - Full Compass -->
        <div v-else class="compass-ring">
            <!-- Decorative tick marks -->
            <div class="tick-marks">
                <div v-for="i in 12" :key="i" class="tick" :style="{ transform: `rotate(${i * 30}deg)` }"></div>
            </div>

            <!-- Center compass circle -->
            <div class="compass-center">
                <!-- Rotating needle -->
                <div class="compass-needle"
                    :style="{ transform: `translate(-50%, -50%) rotate(${needleRotation}deg)` }">
                    <div class="needle-north"></div>
                    <div class="needle-south"></div>
                </div>

                <!-- Center dot -->
                <div class="compass-dot"></div>
            </div>

            <!-- Curved text navigation options -->
            <!-- North - "Map" -->
            <svg class="curved-text-svg north-text" viewBox="0 0 200 200">
                <defs>
                    <path id="northArc" d="M 40,100 A 60,60 0 0,1 160,100" fill="none" />
                </defs>
                <router-link to="/">
                    <text class="curved-nav-text" :class="{ active: currentRoute === '/' }">
                        <textPath href="#northArc" startOffset="50%" text-anchor="middle">
                            MAP
                        </textPath>
                    </text>
                </router-link>
            </svg>

            <!-- West - "F.A.Q" -->
            <svg class="curved-text-svg west-text" viewBox="0 0 200 200">
                <defs>
                    <path id="westArc" d="M 100,160 A 60,60 0 0,1 100,40" fill="none" />
                </defs>
                <router-link to="/faq">
                    <text class="curved-nav-text" :class="{ active: currentRoute === '/faq' }">
                        <textPath href="#westArc" startOffset="50%" text-anchor="middle">
                            FAQ
                        </textPath>
                    </text>
                </router-link>
            </svg>

            <!-- East - "Log" -->
            <svg class="curved-text-svg east-text" viewBox="0 0 200 200">
                <defs>
                    <path id="eastArc" d="M 100,40 A 60,60 0 0,1 100,160" fill="none" />
                </defs>
                <router-link to="/log">
                    <text class="curved-nav-text" :class="{ active: currentRoute === '/log' }">
                        <textPath href="#eastArc" startOffset="50%" text-anchor="middle">
                            LOG
                        </textPath>
                    </text>
                </router-link>
            </svg>

            <!-- South - Collapse Button -->
            <button class="compass-collapse-btn" @click="toggleCollapse" title="Collapse">
                ✕
            </button>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'CompassNavigation',
    setup() {
        const route = useRoute();
        const isCollapsed = ref(false);

        const currentRoute = computed(() => route.path);

        const needleRotation = computed(() => {
            switch (route.path) {
                case '/': return 0;        // North (Map)
                case '/faq': return -90;   // West (F.A.Q)
                case '/log': return 90;    // East (Log)
                default: return 0;
            }
        });

        const toggleCollapse = () => {
            isCollapsed.value = !isCollapsed.value;
        };

        return {
            currentRoute,
            needleRotation,
            isCollapsed,
            toggleCollapse
        };
    }
}
</script>

<style scoped src="@/assets/compassNavigation.css"></style>