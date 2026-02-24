import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Faq from '@/components/Faq.vue';
import Log from '@/components/Log.vue';
import LiveFeedPopup from '@/components/LiveFeedPopup.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/faq', name: 'FAQ', component: Faq},
  { path: '/log', name: 'Log', component: Log},
  { path: '/live-feed', name: 'LiveFeed', component: LiveFeedPopup }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router
