import { createRouter, createWebHistory } from 'vue-router'
import ProjectsView from '@/views/ProjectsView.vue'
import WizardView from '@/views/WizardView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'projects', component: ProjectsView },
    { path: '/wizard/:id?', name: 'wizard', component: WizardView },
    { path: '/thermal', name: 'thermal', component: () => import('@/views/ThermalView.vue') },
  ],
})
