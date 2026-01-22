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
                            <h3 class="block-title">1. Import Dink Settings</h3>
                            <ul class="instruction-list">
                                <li>Install <em>Dink</em> from the Plugin Hub</li>
                                <li>Open <em>Dink Settings → Advanced</em></li>
                                <li>Paste the dynamic config URL:</li>
                            </ul>
                            <div class="code-scroll">
                                <code>https://tea-chicken-bingo-backend-xsspy.ondigitalocean.app/dink/config</code>
                            </div>
                            <ul class="instruction-list">
                                <li>Set <em>Import policy</em> → <em>Overwrite Webhooks</em></li>
                                <li>Turn dink plugin off, then back on</li>
                                <li>Close the plugin by clicking the '&lt;' arrow</li>
                            </ul>
                            <p class="note-text">⚠ Manually changing Dink settings may cause tasks to be tracked
                                incorrectly.</p>
                        </div>

                        <div class="content-block">
                            <h3 class="block-title">2. Enable Combat Achievement Tasks</h3>
                            <p>In OSRS settings, turn on <em>Combat Achievement Tasks and allow repeat completion</em>.
                            </p>
                            <p class="note-text">⚠ Required for dink to resend combat achievement completions.</p>
                        </div>

                        <div class="content-block">
                            <h3 class="block-title">3. Enable Clan Chat</h3>
                            <p>Make sure clan chat is enabled.</p>
                            <p class="note-text">⚠ Pet related tasks might not count if clan chat is turned off.</p>
                        </div>
                    </div>

                    <!-- Task Types -->
                    <div v-show="activeChapter === 'tasks'" class="chapter-content">
                        <h2 class="chapter-title">Task Types</h2>
                        <p class="intro-text">During this bingo, you'll complete various OSRS-related tasks in order to
                            upgrade your buildings:</p>

                        <div class="task-grid">
                            <div class="task-card">
                                <h3 class="task-card-title">🏹 Item Tasks</h3>
                                <p class="task-example">"Get all 4 DK rings"</p>
                                <p class="task-example">"Get any CoX prayer scroll"</p>
                                <p class="task-example">"Get a Twisted Bow"</p>
                            </div>

                            <div class="task-card">
                                <h3 class="task-card-title">💎 Resource Tasks</h3>
                                <p class="task-example">"Collect 5000 gold"</p>
                                <p class="task-example">"Collect 10000 bones"</p>
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
                                    offered bonuses.</div>
                            </div>

                            <div class="faq-card">
                                <div class="faq-q">❓ How do I see my team's resources?</div>
                                <div class="faq-a">Team resources are listed in the Map page. To see your teams
                                    resources, make sure your team is selected in Map legend area.</div>
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
                { id: 'tasks', number: 'II', name: 'Task Types' },
                { id: 'support', number: 'III', name: 'Support' },
                { id: 'faq', number: 'IV', name: 'FAQ' }
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