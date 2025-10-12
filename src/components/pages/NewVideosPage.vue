<script setup>
import HeaderBlock from '../blocks/HeaderBlock.vue';
import NewVideoBanner from '../elements/NewVideoBanner.vue';
import Bloggers from '../elements/BloggersBlock.vue';
import HomeVideoBlock from '../blocks/HomeVideoBlock.vue';
import SubscribeBlock from '../blocks/SubscribeBlock.vue';
import FooterBlock from '../blocks/FooterBlock.vue';
import MiniVideoBlock from '../elements/MiniVideoBlock.vue';
import PopupVideo from "../elements/PopupVideo.vue";
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;
const themes = ref([]);
const banners = ref([]);
const bloggers = ref([]);
const showReset = ref(false);
const categoryName = ref('');
// const apiDomain = store.getters.getApiDomain;
const videos = ref([]);
const popupShow = ref(false);
const iframe = ref(null);
const searchinput = ref(null);

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
function goReset() {
  showReset.value = false;
  searchinput.value.value = '';
  categoryName.value = '';
  videos.value = [];
}
const searchFlag = ref(false);
async function getSearch(search = false) {
  console.log('search', search);
  if (search === false) {
    search = searchinput.value.value
  } else {
    searchinput.value.value = search
  }
  if (search === '' || search.length < 3) {
    searchFlag.value = false
    return
  }
  showReset.value = true;
  searchFlag.value = true;
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await fetch(`${apiUrl}api-video/get-list${authGet}&universal_name=${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const data = await response.json();
    videos.value = data.videos;
    console.log('videos', videos.value);
  } catch (error) {
    console.error('Ошибка при загрузке тем:', error);
  }
}
async function getSearchByCategoryTheme(item, type) {

  if (type === 'theme' || item.type === 'theme') {
    item.theme_id = item.id
  }
  if (type === 'category' || item.type === 'category') {
    item.category_id = item.id
  }
  if (type === 'blogger' || item.type === 'blogger') {
    item.blogger_id = item.id
  }
  console.log('item', item);
  let themeLink = '';
  if (item.theme_id && item.theme_id > 0) {
    categoryName.value += item.name ? item.name + ' ' : item.title + ' ';
    themeLink += `&theme_id=${item.theme_id}`;
  }
  if (item.category_id && item.category_id > 0) {
    themeLink += `&category_id=${item.category_id}`;
    categoryName.value += item.name ? item.name + ' ' : item.title + ' ';
  }
  if (item.blogger_id && item.blogger_id > 0) {
    themeLink += `&blogger_id=${item.blogger_id}`;
    categoryName.value += item.name ? item.name + ' ' : item.title + ' ';
  }

  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await fetch(`${apiUrl}api-video/get-list${authGet}${themeLink}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const data = await response.json();
    videos.value = data.videos;
    console.log('videos', videos.value);
    showReset.value = true;
    searchFlag.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Ошибка при загрузке тем:', error);
  }
}
function openVideo(video) {
  iframe.value.src = video;
  popupShow.value = true;
}
const closePopup = () => {
  popupShow.value = false;
  iframe.value = null;
};

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
        <input @input="getSearch($event.target)" ref="searchinput" type="text" class="search"
          placeholder="Поиск по видео">
        <div @click="goReset" class="reset" :class="{ show: showReset }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.26683 12.6654L3.3335 11.732L7.06683 7.9987L3.3335 4.26536L4.26683 3.33203L8.00016 7.06536L11.7335 3.33203L12.6668 4.26536L8.9335 7.9987L12.6668 11.732L11.7335 12.6654L8.00016 8.93203L4.26683 12.6654Z"
              fill="#696969" />
          </svg>
        </div>
      </div>
      <transition>
        <div v-show="showReset" class="search_content">
          <div v-if="categoryName != ''" class="title">{{ categoryName }}</div>
          <div v-if="!videos.length || videos.length === 0" class="descrition">
            К сожалению мы не смогли найти видео с подоходящим запросом. Измените запрос и тогда магия может произойти
          </div>
          <div v-if="!videos.length || videos.length === 0" class="oups">

            <svg width="324" height="324" viewBox="0 0 324 324" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M295.656 70.5068C293.678 67.6254 289.74 66.8939 286.858 68.8706C283.977 70.8485 283.245 74.7872 285.222 77.668C325.853 136.862 318.427 216.732 267.568 267.581C209.345 325.793 114.613 325.793 56.3907 267.581C28.1868 239.384 12.6546 201.893 12.6546 162.015C12.6546 122.137 28.1868 84.6464 56.39 56.4476C107.199 5.64899 187.036 -1.81024 246.222 38.7135C249.105 40.6863 253.042 39.9511 255.017 37.0671C256.991 34.1838 256.254 30.2463 253.37 28.2722C189.162 -15.6904 102.557 -7.60541 47.4426 47.4995C16.8489 78.0875 0 118.757 0 162.015C0 205.273 16.8489 245.943 47.4426 276.53C78.0363 307.119 118.713 323.965 161.978 323.965C205.244 323.965 245.921 307.119 276.514 276.531C331.684 221.371 339.735 134.726 295.656 70.5068Z"
                fill="#DBDBDB" />
              <path
                d="M268.157 58.6895C270.388 60.1745 273.392 60.0803 275.522 58.4497C277.525 56.9154 278.442 54.232 277.78 51.7934C277.072 49.1809 274.719 47.2574 272.011 47.1106C269.325 46.9644 266.775 48.6051 265.79 51.1056C264.71 53.8466 265.702 57.0514 268.157 58.6895Z"
                fill="#DBDBDB" />
              <path
                d="M118.559 237.165C142.585 213.144 181.678 213.144 205.704 237.165C206.939 238.4 208.559 239.018 210.178 239.018C211.797 239.018 213.417 238.4 214.652 237.164C217.122 234.693 217.122 230.687 214.651 228.215C185.691 199.262 138.57 199.261 109.61 228.216C107.139 230.686 107.139 234.693 109.61 237.164C112.081 239.634 116.087 239.636 118.559 237.165Z"
                fill="#DBDBDB" />
              <path
                d="M203.099 145.244C200.629 142.772 196.622 142.773 194.151 145.245C191.68 147.715 191.68 151.722 194.152 154.193C203.57 163.61 215.939 168.317 228.311 168.317C240.68 168.317 253.053 163.608 262.47 154.193C264.941 151.722 264.942 147.716 262.471 145.245C260.001 142.774 255.994 142.774 253.523 145.244C239.622 159.143 217.001 159.143 203.099 145.244Z"
                fill="#DBDBDB" />
              <path
                d="M130.373 145.245C127.902 142.773 123.896 142.772 121.425 145.244C107.524 159.142 84.9024 159.144 71.0001 145.244C68.5292 142.772 64.5228 142.774 62.052 145.245C59.5812 147.715 59.5818 151.722 62.0526 154.193C71.4702 163.609 83.8413 168.317 96.2124 168.317C108.583 168.317 120.955 163.609 130.372 154.193C132.844 151.722 132.844 147.716 130.373 145.245Z"
                fill="#DBDBDB" />
            </svg>

          </div>
          <div class="search_content-list">
            <MiniVideoBlock class="search_content-item" v-for="video in videos" :key="video.id" :video="video"
              @open-video="openVideo" />
          </div>
        </div>
      </transition>
    </div>
    <transition>
      <div v-show="!showReset" class="content">
        <div class="container">
          <div v-if="themes.length > 0" class="themes">
            <div v-for="theme in themes" :key="theme.id" class="themes__item" :class="theme.name"
              @click="getSearchByCategoryTheme(theme, 'theme')">
              {{ theme.name }}
            </div>
          </div>
        </div>
        <NewVideoBanner :banners="banners" @searchvideobytheme="getSearchByCategoryTheme" />
        <Bloggers :bloggers="bloggers" @searchvideobyblogger="getSearchByCategoryTheme" />
        <HomeVideoBlock @searchvideobytheme="getSearchByCategoryTheme"
          :category="{ id: 21, name: 'Наука для всех', type: 'category' }" />
        <HomeVideoBlock @searchvideobytheme="getSearchByCategoryTheme"
          :category="{ id: 1, name: 'Лайф менеджмент', type: 'theme' }" />
      </div>
    </transition>

  </div>
  <SubscribeBlock />
  <FooterBlock />
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
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
  cursor: pointer;
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

.bloggers {}

.reset {
  position: absolute;
  top: 50%;
  right: 9px;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
  transition: 0.25s opacity, 0.25s visibility;
  display: flex;
  width: 32px;
  height: 32px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  border: 1px solid #DBDBDB;
  background: #EBECF0;
  cursor: pointer;
}

.reset.show {
  opacity: 1;
  visibility: visible;
}

.oups {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
}

.search_content {

  margin-top: 20px;
}

.search_content-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.search_content-item {
  width: 100%;
}

.descrition {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  /* 17.6px */
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.title {
  color: #333;
  font-family: Onest;
  font-size: 50px;
  font-style: normal;
  font-weight: 600;
  margin-bottom: 36px;
}
@media screen and (max-width: 1024px) {
  .videos {
    margin-top: 57px;
  }
  .themes {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .themes::-webkit-scrollbar {
    display: none;
  }
  .search_content-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .title {
    font-size: 26px;
    margin-bottom: 24px;
  }
  .descrition {
    text-align: center;
  }
  .oups {
    padding: 88px 0;
  }
  .oups svg {
    width: 204px;
    height: 204px;
  }
}
@media screen and (max-width: 650px) {
  .search_content-list {
    grid-template-columns: repeat(1, 1fr);
  }
} 
</style>