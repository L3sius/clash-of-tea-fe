<template>
    <div class="compass-container">
        <!-- Compass outer ring -->
        <div class="compass-ring">
            <!-- Cardinal direction markers -->
            <!-- <div class="cardinal-marker north">N</div>
            <div class="cardinal-marker east">E</div>
            <div class="cardinal-marker south">S</div>
            <div class="cardinal-marker west">W</div> -->

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

            <!-- Curved text navigation options (inside compass ring) -->
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

        </div>
    </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'CompassNavigation',
    setup() {
        const route = useRoute();

        const currentRoute = computed(() => route.path);

        const needleRotation = computed(() => {
            switch (route.path) {
                case '/': return 0;        // North (Map)
                case '/faq': return -90;   // West (F.A.Q)
                case '/rankings': return 90; // East (Rankings)
                default: return 0;
            }
        });

        return {
            currentRoute,
            needleRotation
        };
    }
}
</script>

<style scoped>
.compass-container {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    z-index: 100;
}

.compass-ring {
    position: relative;
    width: 200px;
    height: 200px;
    background: linear-gradient(145deg, #2a2520, #1a1410);
    border: 2px solid #5a4a3a;
    border-radius: 50%;
    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(90, 74, 58, 0.2);
}

.compass-ring::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border: 1px solid rgba(90, 74, 58, 0.15);
    border-radius: 50%;
}

.compass-ring::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent 45%, rgba(90, 74, 58, 0.3) 50%, transparent 55%);
    border-radius: 50%;
    z-index: -1;
}

/* Cardinal direction markers */
.cardinal-marker {
    position: absolute;
    color: #c9b896;
    font-family: 'Georgia', serif;
    font-size: 0.9rem;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    user-select: none;
    z-index: 5;
}

.cardinal-marker.north {
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    color: #f4e4c1;
    font-size: 1rem;
}

.cardinal-marker.south {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
}

.cardinal-marker.east {
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
}

.cardinal-marker.west {
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
}

/* Tick marks */
.tick-marks {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
}

.tick {
    position: absolute;
    top: 15px;
    left: 50%;
    width: 1px;
    height: 8px;
    background: rgba(139, 115, 85, 0.3);
    transform-origin: 0 85px;
}

.tick:nth-child(3n) {
    height: 12px;
    top: 15px;
    background: rgba(139, 115, 85, 0.5);
}

/* Center compass circle */
.compass-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 70px;
    background: radial-gradient(circle, #3a3028, #2a2520);
    border: 1px solid #5a4a3a;
    border-radius: 50%;
    box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.3),
        0 0 8px rgba(0, 0, 0, 0.2);
    z-index: 4;
}

/* Compass needle */
.compass-needle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 55px;
    transform: translate(-50%, -50%);
    transform-origin: center center;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
}

.needle-north {
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 28px solid #d4af37;
    filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.4));
}

.needle-south {
    position: absolute;
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 28px solid #6a5a4a;
    filter: drop-shadow(0 0 2px rgba(106, 90, 74, 0.3));
}

/* Center dot */
.compass-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background: radial-gradient(circle, #d4af37, #b8941f);
    border: 1px solid #5a4a3a;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(212, 175, 55, 0.3);
    z-index: 3;
}

/* Curved text SVG styling */
.curved-text-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
}

.curved-text-svg a {
    pointer-events: all;
    cursor: pointer;
}

.curved-nav-text {
    font-family: 'Georgia', serif;
    font-size: 14px;
    font-weight: 500;
    fill: #c9b896;
    letter-spacing: 2px;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.curved-nav-text:hover {
    fill: #f4e4c1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 10px rgba(244, 228, 193, 0.5));
}

.curved-nav-text.active {
    fill: #f4e4c1;
    font-weight: 600;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 15px rgba(244, 228, 193, 0.6)) drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));
}

/* Responsive design */
@media (max-width: 768px) {
    .compass-container {
        bottom: 1rem;
        left: 1rem;
    }

    .compass-ring {
        width: 160px;
        height: 160px;
    }

    .compass-center {
        width: 56px;
        height: 56px;
    }

    .compass-needle {
        height: 44px;
    }

    .needle-north {
        top: -18px;
        border-left-width: 4px;
        border-right-width: 4px;
        border-bottom-width: 22px;
    }

    .needle-south {
        bottom: -18px;
        border-left-width: 4px;
        border-right-width: 4px;
        border-top-width: 22px;
    }

    .cardinal-marker {
        font-size: 0.75rem;
    }

    .cardinal-marker.north {
        top: 10px;
        font-size: 0.85rem;
    }

    .cardinal-marker.south {
        bottom: 10px;
    }

    .cardinal-marker.east {
        right: 10px;
    }

    .cardinal-marker.west {
        left: 10px;
    }

    .curved-nav-text {
        font-size: 11px;
        letter-spacing: 1px;
    }

    .tick {
        height: 6px;
        transform-origin: 0 68px;
    }

    .tick:nth-child(3n) {
        height: 9px;
    }
}

@media (max-width: 1024px) and (min-width: 769px) {
    .compass-container {
        left: 1.5rem;
    }
}
</style>
