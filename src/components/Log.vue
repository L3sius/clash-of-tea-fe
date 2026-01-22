<template>
    <div class="log-page">
        <!-- Main Log Container -->
        <div class="log-container">
            <!-- Left Side - Activity Stream -->
            <div class="log-section activity-stream">
                <div class="section-header">
                    <h2 class="section-title">⚡ Live Activity Feed</h2>
                    <div class="pulse-indicator"></div>
                </div>
                <div class="section-ornament"></div>

                <div class="activity-scroll">
                    <div v-for="activity in activityFeed" :key="activity.id" class="activity-item"
                        :class="activity.type">
                        <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
                        <div class="activity-content">
                            <div class="activity-player">{{ activity.player }}</div>
                            <div class="activity-message">{{ activity.message }}</div>
                            <div class="activity-time">{{ activity.time }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Center - Teams & Players -->
            <div class="log-section teams-roster">
                <div class="section-header">
                    <h2 class="section-title">🛡️ Teams & Roster</h2>
                </div>
                <div class="section-ornament"></div>

                <div class="teams-scroll">
                    <div v-for="team in teams" :key="team.id" class="team-block">
                        <div class="team-header">
                            <div class="team-badge" :style="{ backgroundColor: team.color }"></div>
                            <h3 class="team-name">{{ team.name }}</h3>
                            <span class="player-count">{{ team.players.length }} explorers</span>
                        </div>
                        <div class="players-list">
                            <div v-for="player in team.players" :key="player" class="player-item">
                                <span class="player-marker">▸</span>
                                <span class="player-name">{{ player }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side - Event Log -->
            <div class="log-section event-log">
                <div class="section-header">
                    <h2 class="section-title">📜 Event Chronicle</h2>
                </div>
                <div class="section-ornament"></div>

                <div class="events-scroll">
                    <div v-for="event in eventLog" :key="event.id" class="event-item" :class="event.category">
                        <div class="event-timestamp">{{ event.timestamp }}</div>
                        <div class="event-content">
                            <div class="event-team" :style="{ color: event.teamColor }">
                                {{ event.team }}
                            </div>
                            <div class="event-description">{{ event.description }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LogPage',
    data() {
        return {
            activityFeed: [
                { id: 1, player: 'L3sius', message: 'Killed Giant Mole', type: 'boss', time: '2s ago' },
                { id: 2, player: 'Vyturys', message: 'Opened Elite Clue worth 3.2M', type: 'clue', time: '5s ago' },
                { id: 3, player: 'Solo H', message: 'Completed Handyman CA', type: 'achievement', time: '12s ago' },
                { id: 4, player: 'Hannah', message: 'Received Twisted Bow drop', type: 'loot', time: '18s ago' },
                { id: 5, player: 'Angry', message: 'Obtained Olmlet pet', type: 'pet', time: '25s ago' },
                { id: 6, player: 'Gandalf', message: 'Completed Vannaka slayer task', type: 'slayer', time: '31s ago' },
                { id: 7, player: 'ReaperS0raka', message: 'Killed Zulrah in 45 seconds', type: 'boss', time: '40s ago' },
                { id: 8, player: 'No drop toe', message: 'Got Ranger Boots', type: 'clue', time: '52s ago' },
            ],
            teams: [
                {
                    id: 1,
                    name: 'Tea Explorers',
                    color: '#8b5a3c',
                    players: ['L3sius', 'Vyturys', 'Solo H', 'Player4', 'Player5']
                },
                {
                    id: 2,
                    name: 'Chicken Voyagers',
                    color: '#d4af37',
                    players: ['Hannah', 'Angry', 'Gandalf', 'No drop toe', 'Player9']
                },
                {
                    id: 3,
                    name: 'Azure Navigators',
                    color: '#4a7c8b',
                    players: ['Player10', 'Player11', 'Player12', 'Player13', 'Player14']
                },
                {
                    id: 4,
                    name: 'Crimson Seekers',
                    color: '#8b4a4a',
                    players: ['Player15', 'Player16', 'Player17', 'Player18', 'Player19']
                }
            ],
            eventLog: [
                { id: 1, team: 'Tea Explorers', teamColor: '#8b5a3c', description: 'Completed tile: Kill Giant Mole 100 times', category: 'completion', timestamp: '10:45 AM' },
                { id: 2, team: 'Chicken Voyagers', teamColor: '#d4af37', description: 'Used Snare on tile #42', category: 'powerup', timestamp: '10:38 AM' },
                { id: 3, team: 'Azure Navigators', teamColor: '#4a7c8b', description: 'Reached checkpoint: 25 tiles completed', category: 'milestone', timestamp: '10:22 AM' },
                { id: 4, team: 'Tea Explorers', teamColor: '#8b5a3c', description: 'Used Corrupt on tile #15', category: 'powerup', timestamp: '10:15 AM' },
                { id: 5, team: 'Crimson Seekers', teamColor: '#8b4a4a', description: 'Completed tile: Get Twisted Bow', category: 'completion', timestamp: '10:08 AM' },
                { id: 6, team: 'Chicken Voyagers', teamColor: '#d4af37', description: 'Used Temptation - SUCCESS! Gained 2 points', category: 'powerup', timestamp: '09:55 AM' },
                { id: 7, team: 'Azure Navigators', teamColor: '#4a7c8b', description: 'Completed tile: Open 100 Master Clues', category: 'completion', timestamp: '09:42 AM' },
            ]
        }
    },
    methods: {
        getActivityIcon(type) {
            const icons = {
                boss: '⚔️',
                clue: '🗺️',
                achievement: '🏆',
                loot: '💎',
                pet: '🐾',
                slayer: '🎯'
            };
            return icons[type] || '⚡';
        }
    },
    mounted() {
        // Simulate real-time activity updates
        setInterval(() => {
            const newActivity = {
                id: Date.now(),
                player: 'Player' + Math.floor(Math.random() * 20),
                message: 'Completed a task',
                type: ['boss', 'clue', 'achievement', 'loot', 'pet', 'slayer'][Math.floor(Math.random() * 6)],
                time: 'Just now'
            };
            this.activityFeed.unshift(newActivity);
            if (this.activityFeed.length > 50) {
                this.activityFeed.pop();
            }
        }, 5000); // New activity every 5 seconds
    }
}
</script>

<style scoped src="@/assets/log.css"></style>