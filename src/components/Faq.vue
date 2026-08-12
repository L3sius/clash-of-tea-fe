<template>
    <div class="faq-page">
        <!-- Ornate Book Container -->
        <div class="book-container">
            <!-- Left Page - Navigation -->
            <div class="book-page left-page">
                <div class="page-ornament top"></div>

                <h2 class="page-title">Adventurer Handbook</h2>

                <nav class="chapter-nav">
                    <button v-for="chapter in chapters" :key="chapter.id" class="chapter-link"
                        :class="{ active: activeChapter === chapter.id }" @click="setChapter(chapter.id)">
                        <span class="chapter-number">{{ chapter.number }}</span>
                        <span class="chapter-name">{{ chapter.name }}</span>
                    </button>
                </nav>

                <div class="page-ornament bottom"></div>
            </div>

            <!-- Right Page - Content -->
            <div class="book-page right-page">
                <div class="page-ornament top"></div>

                <div class="page-content">
                    <!-- Mandatory Preparations -->
                    <div v-show="activeChapter === 'preparations'" class="chapter-content">
                        <h2 class="chapter-title">Mandatory Preparations</h2>

                        <div class="content-block">
                            <h3 class="block-title">Import Dink Settings</h3>
                            <ul class="instruction-list">
                                <li>Install <em>Dink</em> from the Plugin Hub</li>
                                <li>Open <em>Dink Settings → Advanced</em></li>
                                <li>Paste the dynamic config URL:</li>
                            </ul>
                            <div class="code-scroll">
                                <code>https://api.tea-osrs.com/config</code>
                            </div>
                            <ul class="instruction-list">
                                <li>Set <em>Import policy</em> → <em>Overwrite Webhooks</em></li>
                                <li>Turn dink plugin off, then back on</li>
                                <li>Close the plugin by clicking the '&lt;' arrow</li>
                            </ul>
                            <p class="note-text">⚠ Manually changing Dink settings may cause tasks to be tracked
                                incorrectly.</p>
                        </div>
                    </div>

                    <!-- How It Works -->
                    <div v-show="activeChapter === 'how-to-play'" class="chapter-content">
                        <h2 class="chapter-title">How to play CoT?</h2>
                        <p class="intro-text">Clash of Tea is a unique team-based OSRS competition where drops are
                            converted into resources to upgrade buildings:</p>

                        <div class="mechanics-section">
                            <div class="mechanic-card">
                                <h3 class="mechanic-title">📊 Drop Conversion System</h3>
                                <p class="mechanic-text">
                                    All drops are automatically classified into <strong>tiers based on their GP
                                        value</strong> and
                                    <strong>categorized by the monster source</strong>.
                                </p>
                                <div class="example-box">
                                    <strong>Example:</strong> An Armadyl helmet (~8M GP) dropped from Kree'arra becomes
                                    a
                                    <span class="highlight">GWD Tier 7</span> resource.
                                </div>
                                <p class="mechanic-note">
                                    → See <em>"Tier Thresholds"</em> section below for complete conversion rates
                                </p>
                            </div>

                            <div class="mechanic-card">
                                <h3 class="mechanic-title">🏗️ Building Upgrades</h3>
                                <p class="mechanic-text">
                                    Buildings are upgraded using collected resources. Each upgrade requires specific
                                    tiers and categories of resources.
                                </p>
                                <ul class="mechanic-list">
                                    <li>Buildings start at <strong>Level 0</strong> and can be upgraded to <strong>Level
                                            9</strong></li>
                                    <li>Click on any building to view its upgrade costs and requirements</li>
                                    <li>Teams choose their own upgrade paths strategically</li>
                                    <li>Once an option's requirements are fully met, its badge turns into an
                                        <strong>✦ Upgrade</strong> button — click it and the upgrade happens
                                        instantly, no admin needed</li>
                                    <li>Buildings can have multiple upgrade options; if more than one is ready,
                                        pick whichever you prefer</li>
                                </ul>
                            </div>

                            <div class="mechanic-card">
                                <h3 class="mechanic-title">🎯 Building Categories</h3>
                                <p class="mechanic-text">
                                    Each building is associated with specific monsters/bosses. Drops from these sources
                                    provide resources for that building.
                                </p>
                                <p class="mechanic-note">
                                    → Click on buildings on the map or see <em>"Building Sources"</em> section for
                                    complete monster
                                    lists
                                </p>
                            </div>

                            <div class="mechanic-card important">
                                <h3 class="mechanic-title">⚡ Multiplier System</h3>
                                <div class="multiplier-section">
                                    <div class="multiplier-rule">
                                        <span class="multiplier-icon">✨</span>
                                        <div>
                                            <strong>Building Multiplier (×2)</strong>
                                            <p>Your drops with tier equal to or below the building level are
                                                multiplied by 2.</p>
                                            <div class="example-box">
                                                <strong>Example:</strong> GWD Level 3 means all drops from GWD at
                                                tier 3 or below are multiplied by 2.
                                            </div>
                                        </div>
                                    </div>
                                    <div class="multiplier-rule">
                                        <span class="multiplier-icon">🌟</span>
                                        <div>
                                            <strong>Group Multiplier (×2)</strong>
                                            <p>Each building belongs to a group. Your drops with tier equal to or
                                                below the minimum building level in the group are also multiplied
                                                by 2.</p>
                                            <div class="example-box">
                                                <strong>Example:</strong> All 3 Raids buildings (CoX, ToB, ToA) at
                                                Level 5 means drops from CoX, ToB, or ToA at tier 5 or below are
                                                multiplied by 2.
                                            </div>
                                        </div>
                                    </div>
                                    <p class="multiplier-note">
                                        <strong>💡 Multipliers stack!</strong> A drop that qualifies for both gets
                                        ×2 × ×2 = ×4 total.
                                    </p>
                                </div>
                            </div>

                            <div class="mechanic-card victory">
                                <h3 class="mechanic-title">🏆 Victory Conditions</h3>
                                <ul class="victory-list">
                                    <li><strong>Instant Win:</strong> First team to reach Level 9 on ALL buildings</li>
                                    <li><strong>Time-based Win:</strong> After 2 weeks, the team with the highest total
                                        building levels wins</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Tier Thresholds -->
                    <div v-show="activeChapter === 'thresholds'" class="chapter-content">
                        <h2 class="chapter-title">Tier Thresholds</h2>
                        <p class="intro-text">Drop values are converted to tiers based on their Grand Exchange price:
                        </p>

                        <div class="threshold-table-container">
                            <table class="threshold-table">
                                <thead>
                                    <tr>
                                        <th>Tier</th>
                                        <th>Minimum Value</th>
                                        <th>Maximum Value</th>
                                        <th>Examples</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="tier-row tier-1">
                                        <td class="tier-badge">Tier 1</td>
                                        <td>1,000 GP</td>
                                        <td>9,999 GP</td>
                                        <td>Dragon bones, Adamant items</td>
                                    </tr>
                                    <tr class="tier-row tier-2">
                                        <td class="tier-badge">Tier 2</td>
                                        <td>10,000 GP</td>
                                        <td>24,999 GP</td>
                                        <td>Ancient ceremonial boots</td>
                                    </tr>
                                    <tr class="tier-row tier-3">
                                        <td class="tier-badge">Tier 3</td>
                                        <td>25,000 GP</td>
                                        <td>49,999 GP</td>
                                        <td>Seercull</td>
                                    </tr>
                                    <tr class="tier-row tier-4">
                                        <td class="tier-badge">Tier 4</td>
                                        <td>50,000 GP</td>
                                        <td>99,999 GP</td>
                                        <td>Dragon med helm</td>
                                    </tr>
                                    <tr class="tier-row tier-5">
                                        <td class="tier-badge">Tier 5</td>
                                        <td>100,000 GP</td>
                                        <td>249,999 GP</td>
                                        <td>Dragon platelegs, Verac's helm</td>
                                    </tr>
                                    <tr class="tier-row tier-6">
                                        <td class="tier-badge">Tier 6</td>
                                        <td>250,000 GP</td>
                                        <td>999,999 GP</td>
                                        <td>Hueycoatl hide, Bandos boots</td>
                                    </tr>
                                    <tr class="tier-row tier-7">
                                        <td class="tier-badge">Tier 7</td>
                                        <td>1,000,000 GP</td>
                                        <td>9,999,999 GP</td>
                                        <td>Odium shard, Dragon harpoon</td>
                                    </tr>
                                    <tr class="tier-row tier-8">
                                        <td class="tier-badge">Tier 8</td>
                                        <td>10,000,000 GP</td>
                                        <td>49,999,999 GP</td>
                                        <td>Primordial crystal</td>
                                    </tr>
                                    <tr class="tier-row tier-9">
                                        <td class="tier-badge">Tier 9</td>
                                        <td>50,000,000 GP</td>
                                        <td>999,999,999,999 GP</td>
                                        <td>Twisted bow, Scythe of Vitur</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="threshold-notes">
                            <p class="note-item">💡 <strong>Note:</strong> Prices are based on Grand Exchange values at
                                the time of the drop</p>
                            <p class="note-item">📊 <strong>Tip:</strong> Higher tier drops are exponentially more
                                valuable for building upgrades</p>
                        </div>
                    </div>

                    <!-- Building Sources -->
                    <div v-show="activeChapter === 'sources'" class="chapter-content">
                        <h2 class="chapter-title">Building Sources</h2>
                        <p class="intro-text">Each building is associated with specific monsters and bosses. Drops from
                            these sources provide resources for their respective building:</p>

                        <div v-if="isLoadingBuildingSources" class="loading-state">
                            <div class="loading-spinner">⏳</div>
                            <p>Loading...</p>
                        </div>
                        <div v-else class="sources-grid">
                            <div v-for="b in buildingSources" :key="b.name" class="source-category">
                                <h3 class="category-title">{{ b.icon }} {{ b.building }}</h3>
                                <p class="category-group">Group: {{ b.groupDisplayName }}</p>
                                <ul v-if="b.allowedSources.length" class="source-list">
                                    <li v-for="src in b.allowedSources" :key="src">{{ src }}</li>
                                </ul>
                                <p v-else class="category-desc">The catch-all category — any drop that doesn't
                                    match one of the other buildings' sources counts toward this one instead.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Support -->
                    <div v-show="activeChapter === 'support'" class="chapter-content">
                        <h2 class="chapter-title">Support</h2>

                        <div class="support-grid">
                            <div class="support-card tasks">
                                <div class="support-icon">📋</div>
                                <h3 class="support-role">Task Questions</h3>
                                <p class="support-name">Solo H</p>
                            </div>

                            <div class="support-card technical">
                                <div class="support-icon">⚙️</div>
                                <h3 class="support-role">Technical Support</h3>
                                <p class="support-name">L3sius</p>
                                <p class="support-name">Vyturys</p>
                                <p class="support-name">Solo H</p>
                            </div>

                            <div class="support-card creative">
                                <div class="support-icon">🎨</div>
                                <h3 class="support-role">Creative Content</h3>
                                <p class="support-desc">News, memes, illustrations, banter</p>
                                <p class="support-name">ReaperS0raka</p>
                            </div>
                        </div>
                    </div>

                    <!-- FAQ -->
                    <div v-show="activeChapter === 'faq'" class="chapter-content">
                        <h2 class="chapter-title">Frequently Asked Questions</h2>

                        <div class="faq-list">
                            <div class="faq-card">
                                <div class="faq-q">❓ Can I play on mobile?</div>
                                <div class="faq-a">Technically, yes! Get proof of completion and contact admins to
                                    add the received resource.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ How do I verify Dink is configured?</div>
                                <div class="faq-a">Check the Log page for your name in <em>Latest Activity</em>.
                                    Kill a Lumbridge goblin to test.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ Do I need to pick up loot?</div>
                                <div class="faq-a">No, as long as you receive the loot in your name - it will count.
                                    However, stay close
                                    to the loot and avoid spamming actions as dink has in-built limitations.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ How to check building level?</div>
                                <div class="faq-a">Hover over the building or click on it to see its current level and
                                    required resources for future upgrade. To compare every team's building levels
                                    side by side at once, check the <em>Building Levels</em> table on the Log
                                    page.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ How do I actually upgrade a building?</div>
                                <div class="faq-a">Click the building, then look at its upgrade options. Once you
                                    have enough of every required resource for an option, its badge turns into an
                                    <em>✦ Upgrade</em> button — click it and the upgrade happens immediately. The
                                    building's level and next requirements update on their own, no page refresh
                                    needed.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ Where can I see my current multipliers?</div>
                                <div class="faq-a">Open the Buildings tab in the Team Stats panel — each group
                                    header shows the tier it has unlocked, and each building shows its own
                                    tier-by-tier multiplier breakdown.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ How do I see my team's resources?</div>
                                <div class="faq-a">Team resources are listed in the Map page. To see your team's
                                    resources, make sure your team is selected in the Teams panel.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ The map is barely visible?</div>
                                <div class="faq-a">Use your scrollwheel to zoom in and hover over the buildings.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ Page refresh didn't work, why?</div>
                                <div class="faq-a">
                                    If page refresh did not help, try the following:
                                    <ul class="compact-list">
                                        <li>CTRL+SHIFT+R (Hard reload)</li>
                                        <li>F12 -> Application -> Storage -> Clear site data</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="page-ornament bottom"></div>
            </div>
        </div>
    </div>
</template>

<script>
import apiService from '@/services/apiService';

// Purely cosmetic per-building icon - not game data, so it's fine to keep this
// as the one hardcoded piece; everything else here now comes from /getBuildings.
const BUILDING_ICONS = {
    slayer_tower: '🗼',
    cox: '⚔️',
    theatre: '🎭',
    tombs: '🏺',
    minigames: '🎮',
    misc: '🎲',
    dt2: '💀',
    gwd: '⚡',
    classics: '👴',
    fortis: '🌙',
    noob_friendly: '🌱',
    fan_favourites: '⭐',
    wilderness: '💀',
    skilling: '⛏️',
    town_hall: '🏠',
};

export default {
    name: 'FaqPage',
    data() {
        return {
            activeChapter: 'preparations',
            chapters: [
                { id: 'preparations', number: 'I', name: 'Preparations' },
                { id: 'how-to-play', number: 'II', name: 'How to play?' },
                { id: 'thresholds', number: 'III', name: 'Tier thresholds' },
                { id: 'sources', number: 'IV', name: 'Building Sources' },
                { id: 'support', number: 'V', name: 'Support' },
                { id: 'faq', number: 'VI', name: 'FAQ' }
            ],
            buildingSources: [],
            isLoadingBuildingSources: true,
        }
    },
    async created() {
        try {
            const data = await apiService.getBuildings();
            // allowedSources/group are identical for every team - any one team's
            // copy is the canonical list of all 15 buildings.
            const buildings = data.teamsBuildings?.[0]?.buildings || [];
            this.buildingSources = buildings
                .map(b => ({
                    name: b.name,
                    building: b.building,
                    groupDisplayName: b.groupDisplayName,
                    allowedSources: b.allowedSources || [],
                    icon: BUILDING_ICONS[b.name] || '🏰',
                }))
                .sort((a, b) => a.building.localeCompare(b.building));
        } catch (error) {
            console.error('Failed to load building sources:', error);
            this.buildingSources = [];
        } finally {
            this.isLoadingBuildingSources = false;
        }
    },
    methods: {
        setChapter(chapterId) {
            this.activeChapter = chapterId;
        }
    }
}
</script>

<style scoped src="@/assets/faq.css"></style>