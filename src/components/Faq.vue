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
                                        <span class="multiplier-icon">🌟</span>
                                        <div>
                                            <strong>Global Multiplier (×2)</strong>
                                            <p>If ALL buildings are at level X or higher, ALL drops of tier X and below
                                                are multiplied by 2.</p>
                                            <div class="example-box">
                                                <strong>Example:</strong> All buildings at Level 2+ → Tier 1 and Tier 2
                                                drops are ×2 for all buildings
                                            </div>
                                        </div>
                                    </div>
                                    <div class="multiplier-rule">
                                        <span class="multiplier-icon">✨</span>
                                        <div>
                                            <strong>Building-Specific Multiplier (×2)</strong>
                                            <p>If a specific building is at level X, drops from that building's monsters
                                                of tier X and below are multiplied by 2.</p>
                                            <div class="example-box">
                                                <strong>Example:</strong> GWD building at Level 3 → All GWD drops of
                                                Tier 1-3 are ×2
                                            </div>
                                        </div>
                                    </div>
                                    <p class="multiplier-note">
                                        <strong>💡 These multipliers stack!</strong> A tier 2 drop from a level 3
                                        building when all buildings are level 2+ gets ×4 total.
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

                        <div class="sources-grid">
                            <!-- Slayer Tower -->
                            <div class="source-category">
                                <h3 class="category-title">🗼 Slayer Tower</h3>
                                <ul class="source-list">
                                    <li>Grotesque Guardians</li>
                                    <li>Unsired</li>
                                    <li>Dusk</li>
                                    <li>Dawn</li>
                                    <li>Abyssal Sire</li>
                                    <li>Kraken</li>
                                    <li>Cave kraken</li>
                                    <li>Cerberus</li>
                                    <li>Araxxor</li>
                                    <li>Thermonuclear smoke devil</li>
                                    <li>Alchemical Hydra</li>
                                    <li>Shellbane Gryphon</li>
                                </ul>
                            </div>

                            <!-- Chambers of Xeric -->
                            <div class="source-category">
                                <h3 class="category-title">⚔️ Chambers of Xeric</h3>
                                <ul class="source-list">
                                    <li>Chambers of Xeric</li>
                                    <li>Chambers of Xeric: Challenge Mode</li>
                                </ul>
                            </div>

                            <!-- Theatre of Blood -->
                            <div class="source-category">
                                <h3 class="category-title">🎭 Theatre of Blood</h3>
                                <ul class="source-list">
                                    <li>Theatre of Blood</li>
                                    <li>Theatre of Blood: Hard Mode</li>
                                </ul>
                            </div>

                            <!-- Tombs of Amascut -->
                            <div class="source-category">
                                <h3 class="category-title">🏺 Tombs of Amascut</h3>
                                <ul class="source-list">
                                    <li>Tombs of Amascut</li>
                                    <li>Tombs of Amascut: Expert Mode</li>
                                </ul>
                            </div>

                            <!-- Minigames -->
                            <div class="source-category">
                                <h3 class="category-title">🎮 Minigames</h3>
                                <ul class="source-list">
                                    <li>The Mimic</li>
                                    <li>Hespori</li>
                                    <li>Skotizo</li>
                                    <li>Fortis Colosseum</li>
                                    <li>Gauntlet</li>
                                    <li>Corrupted Gauntlet</li>
                                    <li>Spoils of war</li>
                                </ul>
                            </div>

                            <!-- Misc -->
                            <div class="source-category">
                                <h3 class="category-title">🎲 Misc</h3>
                                <ul class="source-list">
                                    <li>Sarachnis</li>
                                    <li>Deranged Archaeologist</li>
                                    <li>The Nightmare</li>
                                    <li>Phosani's Nightmare</li>
                                    <li>Phantom Muspah</li>
                                    <li>Mad Angel</li>
                                    <li>Maggot King</li>
                                </ul>
                            </div>

                            <!-- DT2 -->
                            <div class="source-category">
                                <h3 class="category-title">💀 Desert Treasure 2</h3>
                                <ul class="source-list">
                                    <li>Duke Sucellus</li>
                                    <li>The Leviathan</li>
                                    <li>The Whisperer</li>
                                    <li>Vardorvis</li>
                                </ul>
                            </div>

                            <!-- God Wars Dungeon -->
                            <div class="source-category">
                                <h3 class="category-title">⚡ God Wars Dungeon</h3>
                                <ul class="source-list">
                                    <li>Kree'arra</li>
                                    <li>Commander Zilyana</li>
                                    <li>General Graardor</li>
                                    <li>K'ril Tsutsaroth</li>
                                    <li>Nex</li>
                                    <li>Sergeant Strongstack</li>
                                    <li>Sergeant Steelwill</li>
                                    <li>Sergeant Grimspike</li>
                                    <li>Balfrug Kreeyath</li>
                                    <li>Tstanon Karlak</li>
                                    <li>Zakl'n Gritch</li>
                                    <li>Flight Kilisa</li>
                                    <li>Wingman Skree</li>
                                    <li>Flockleader Geerin</li>
                                    <li>Starlight</li>
                                    <li>Bree</li>
                                    <li>Growler</li>
                                </ul>
                            </div>

                            <!-- Classics -->
                            <div class="source-category">
                                <h3 class="category-title">👴 Classics</h3>
                                <ul class="source-list">
                                    <li>Dagannoth Supreme</li>
                                    <li>Dagannoth Rex</li>
                                    <li>Dagannoth Prime</li>
                                    <li>Corporeal Beast</li>
                                    <li>Kalphite Queen</li>
                                    <li>Barrows</li>
                                </ul>
                            </div>

                            <!-- Fortis -->
                            <div class="source-category">
                                <h3 class="category-title">🌙 Fortis</h3>
                                <ul class="source-list">
                                    <li>The Hueycoatl</li>
                                    <li>Amoxliatl</li>
                                    <li>Lunar Chest</li>
                                </ul>
                            </div>

                            <!-- Noob Friendly -->
                            <div class="source-category">
                                <h3 class="category-title">🌱 Noob-Friendly</h3>
                                <ul class="source-list">
                                    <li>Brutus</li>
                                    <li>Scurrius</li>
                                    <li>Giant Mole</li>
                                    <li>Obor</li>
                                    <li>Bryophyta</li>
                                </ul>
                            </div>

                            <!-- Fan Favourites -->
                            <div class="source-category">
                                <h3 class="category-title">⭐ Fan Favourites</h3>
                                <ul class="source-list">
                                    <li>Zulrah</li>
                                    <li>Vorkath</li>
                                    <li>Yama</li>
                                    <li>Doom of Mokhaiotl</li>
                                </ul>
                            </div>

                            <!-- Wilderness -->
                            <div class="source-category">
                                <h3 class="category-title">💀 Wilderness</h3>
                                <ul class="source-list">
                                    <li>Chaos Fanatic</li>
                                    <li>Crazy archaeologist</li>
                                    <li>Scorpia</li>
                                    <li>King Black Dragon</li>
                                    <li>Chaos Elemental</li>
                                    <li>Revenant imp</li>
                                    <li>Revenant goblin</li>
                                    <li>Revenant pyrefiend</li>
                                    <li>Revenant hobgoblin</li>
                                    <li>Revenant cyclops</li>
                                    <li>Revenant hellhound</li>
                                    <li>Revenant demon</li>
                                    <li>Revenant ork</li>
                                    <li>Revenant dark beast</li>
                                    <li>Revenant knight</li>
                                    <li>Revenant dragon</li>
                                    <li>Revenant maledictus</li>
                                    <li>Vet'ion</li>
                                    <li>Calvar'ion</li>
                                    <li>Venenatis</li>
                                    <li>Spindel</li>
                                    <li>Callisto</li>
                                    <li>Artio</li>
                                </ul>
                            </div>

                            <!-- Skilling -->
                            <div class="source-category">
                                <h3 class="category-title">⛏️ Skilling</h3>
                                <ul class="source-list">
                                    <li>Wintertodt</li>
                                    <li>Tempoross</li>
                                    <li>Zalcano</li>
                                    <li>Guardians of the Rift</li>
                                    <li>Bird nest</li>
                                    <li>Small salvage</li>
                                    <li>Fishy salvage</li>
                                    <li>Barracuda salvage</li>
                                    <li>Large salvage</li>
                                    <li>Plundered salvage</li>
                                    <li>Martial salvage</li>
                                    <li>Fremennik salvage</li>
                                    <li>Opulent salvage</li>
                                    <li>Seed pack</li>
                                    <li>Herbiboar</li>
                                </ul>
                            </div>

                            <!-- Town Hall -->
                            <div class="source-category">
                                <h3 class="category-title">🏠 Town Hall</h3>
                                <p class="category-desc">The catch-all category — any drop that doesn't match one
                                    of the other buildings' sources counts toward Town Hall instead.</p>
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
            ]
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