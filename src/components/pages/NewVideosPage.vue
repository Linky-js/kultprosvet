<script setup>
import HeaderBlock from '../blocks/HeaderBlock.vue';
import NewVideoBanner from '../elements/NewVideoBanner.vue';
import Bloggers from '../elements/Bloggers.vue';
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;
const themes = ref([]);
const banners = ref([]);
const bloggers = ref([]);
// const apiDomain = store.getters.getApiDomain;
// const videos = ref([]);
// const popupShow = ref(false);
// const iframe = ref(null);

async function getThemes() {
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await fetch(`${apiUrl}api-theme/get-list${authGet}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const data = await response.json();
    themes.value = data.themes;
    console.log('themes', themes.value);
  } catch (error) {
    console.error('Ошибка при загрузке тем:', error);
  }
}
async function getBanners() {
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await fetch(`${apiUrl}api-video-banner/get-list${authGet}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const data = await response.json();
    banners.value = data.video_banners;
    console.log('data', data);
  } catch (error) {
    console.error('Ошибка при загрузке тем:', error);
  }
}
async function getBloggers() {
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await fetch(`${apiUrl}api-blogger/get-list${authGet}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const data = await response.json();
    bloggers.value = data.bloggers;
  } catch (error) {
    console.error('Ошибка при загрузке тем:', error);
  }
}

onMounted(() => {
  getThemes();
  getBanners();
  getBloggers();
})

</script>
<template>
  <HeaderBlock />
  <div class="videos mBlock">
    <div class="container">
      <div class="search_block">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 9.21054 14.4274 10.7873 13.4633 12.0491L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L12.0491 13.4633C10.7873 14.4274 9.21054 15 7.5 15ZM7.5 13C10.5376 13 13 10.5376 13 7.5C13 4.46243 10.5376 2 7.5 2C4.46243 2 2 4.46243 2 7.5C2 10.5376 4.46243 13 7.5 13Z"
            fill="#737373" />
        </svg>
        <input type="text" class="search" placeholder="Поиск по видео">
      </div>
      <div v-if="themes.length > 0" class="themes">
        <div v-for="theme in themes" :key="theme.id" class="themes__item" :class="theme.name" @click="getSearch(theme)">
          {{ theme.name }}
        </div>
      </div>
      <NewVideoBanner :banners="banners" />
      <Bloggers :bloggers="bloggers" />
    </div>
  </div>
</template>
<style scoped>
.videos {
  margin-top: 87px;
}

.search {
  border-radius: 100px;
  border: 1px solid #F0F0F0;
  background: #F5F5F5;
  padding: 16px 16px 16px 50px;
  color: #737373;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  width: 100%;
}

.search_block {
  position: relative;
  width: 100%;
}

.icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
}

.themes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;

}

.themes__item {
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 120%;
  /* 15.6px */
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid;
  width: max-content;
  white-space: nowrap;
}

.менеджмент {
  color: #439563;
  border-color: #439563;
}

.Литература {
  color: #ef8933;
  border-color: #ef8933;
}

.Музыка {
  color: #5f22c1;
  border-color: #5f22c1;
}

.История {
  color: #C17979;
  border-color: #C17979;
}

.Спорт {
  color: #43C7FF;
  border-color: #43C7FF;
}

.Мода {
  color: #f092f9;
  border-color: #f092f9;
}

.Кино {
  color: #E90037;
  border-color: #E90037;
}

.Наука {
  color: #2971eb;
  border-color: #2971eb;
}

.Архитектура {
  color: #717786;
  border-color: #717786;
}

.Живопись {
  color: #F0A942;
  border-color: #F0A942;
}

.Философия {
  color: #4B69D4;
  border-color: #4B69D4;
}

.Урбанистика {
  color: #416B71;
  border-color: #416B71;
}
.bloggers {

}
</style>