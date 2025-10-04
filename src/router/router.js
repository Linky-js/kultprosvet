
import { createRouter, createWebHistory } from 'vue-router';
import emitter from '@/eventBus.js';
import LoginPage from '@/components/pages/LoginPage.vue';
import RegisterSuccess from '@/components/pages/RegisterSuccess.vue';
import HomePage from '@/components/pages/HomePage.vue';
import NewsPage from '@/components/pages/NewsPage.vue';
import PostPage from '@/components/pages/PostPage.vue';
import ErrorPage from '@/components/pages/ErrorPage.vue';
import VideosPage from '@/components/pages/VideosPage.vue';
import PodkastsPage from '@/components/pages/PodkastsPage.vue';
import ThemePage from '@/components/pages/ThemePage.vue';
import ContactsPage from '@/components/pages/ContactsPage.vue';
import AcoountPage from '@/components/pages/AcoountPage.vue';
import AdminPage from '@/components/pages/AdminPage.vue';
import LibraryPage from '@/components/pages/LibraryPage.vue';
import BookPage from '@/components/pages/BookPage.vue';
import TestsPage from '@/components/pages/TestsPage.vue';
import TestPage from '@/components/pages/TestPage.vue';
import AboutPage from '@/components/pages/AboutPage.vue';
import AfishaPage from '@/components/pages/AfishaPage.vue';
import PodkastPage from '@/components/pages/PodkastPage.vue';
import EventPage from '@/components/pages/EventPage.vue';
import MaterialsPage from '@/components/pages/MaterialsPage.vue';
import BloggerPage from '@/components/pages/BloggerPage.vue';


const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/success',
    name: 'RegisterSuccess',
    component: RegisterSuccess
  },
  {
    path: '/news',
    name: 'NewsPage',
    component: NewsPage
  },
  {
    name: 'PostPage',
    path: '/post/:id', 

    component: PostPage,
  },
  {
    name: 'EventPage',
    path: '/event/:id', 
    component: EventPage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'ErrorPage',
    component: ErrorPage
  },
  {
    path: '/videos',
    name: 'VideosPage',
    component: VideosPage
  },
  {
    path: '/podcasts',
    name: 'PodkastsPage',
    component: PodkastsPage
  },
  {
    path: '/theme/:id',
    name: 'ThemePage',
    component: ThemePage
  },
  {
    path: '/contacts',
    name: 'ContactsPage',
    component: ContactsPage
  },
  {
    path: '/account',
    name: 'AcoountPage',
    component: AcoountPage
  },
  {
    path: '/theBestAdmin',
    name: 'AdminPage',
    component: AdminPage
  },
  {
    path: '/library',
    name: 'LibraryPage',
    component: LibraryPage
  },
  {
    path: '/materials',
    name: 'MaterialsPage',
    component: MaterialsPage
  },
  {
    path: '/book/:id',
    name: 'BookPage',
    component: BookPage
  },
  {
    path: '/tests',
    name: 'TestsPage',
    component: TestsPage
  },
  {
    path: '/test/:id',
    name: 'TestPage',
    component: TestPage
  },
  {
    path: '/podcast/:id',
    name: 'PodkastPage',
    component: PodkastPage
  },
  {
    path: '/about',
    name: 'AboutPage',
    component: AboutPage
  },
  {
    path: '/afisha',
    name: 'AfishaPage',
    component: AfishaPage
  },
  {
    path: '/blogger/:id',
    name: 'BloggerPage',
    component: BloggerPage
  },
  {
    path: '/objects',
    name: 'ObjectsPage',
    component: () => import('@/components/pages/ObjectsPage.vue')
  },
  

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  }
});

router.beforeEach((to, from, next) => {
  // Вызываем событие показа прелоудера
  emitter.emit('show-preloader');
  next();
});

router.afterEach(() => {
  // Вызываем событие скрытия прелоудера
  emitter.emit('hide-preloader');
});
export default router;
