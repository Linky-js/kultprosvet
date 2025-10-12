<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { myMixin2 } from "@/mixin";
import PostMini from "../elements/PostMini.vue";
import axios from "axios";
export default {
  name: "homeNewsBlock",
  components: {
    Swiper,
    SwiperSlide,
    PostMini
  },
  mixins: [myMixin2],
  data() {
    return {
      newsArray: [],
      allVideos: [],
      allCount: null,
      themes: [],
      displayCountDesktop: 6,
      displayCountMobile: 2,
      incrementCountDesktop: 6,
      incrementCountMobile: 2,
      windowWidth: window.innerWidth,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  setup() {
    const swiperActiveIndex = 0; // начальный активный индекс
    const onSwiper = (swiper) => {
      console.log(swiper.activeIndex);
    };
    return {
      onSwiper,
      swiperActiveIndex,
      modules: [Navigation, Pagination, Scrollbar, A11y],
    };
  },

  methods: {
    getTotalaNews() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-news/get-list" + authGet + "&limit=20")
        .then((response) => {
          this.allVideos = response.data.news;
          const newsArray = response.data.news;
          response.data.news.forEach((newsItem) => {
            newsItem.displayCount = this.getInitialDisplayCount;

            // Проверяем, существует ли уже тема с таким именем
            if (
              !this.themes.some((theme) => theme.name === newsItem.theme.name)
            ) {
              this.themes.push(newsItem.theme);
            }
          });

          const sortedNewsByThemes = newsArray.reduce((acc, newsItem) => {
            const themeName = newsItem.theme.name;

            // Проверяем, есть ли уже такая тема в аккумуляторе
            let themeEntry = acc.find(
              (entry) => entry.theme.name === themeName
            );

            if (!themeEntry) {
              // Если темы нет, создаем новую запись с пустым массивом новостей
              themeEntry = { theme: newsItem.theme, news: [] };
              acc.push(themeEntry);
            }

            // Добавляем новость в массив новостей для этой темы
            themeEntry.news.push(newsItem);

            return acc;
          }, []);

          // Преобразуем объект в массив
          this.newsArray = Object.values(sortedNewsByThemes);
          setTimeout(() => {
            this.toggleNews("allVideosItems", "allVideosBtn");
          }, 500);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    toggleNews(id, btn) {
      let btns = document.querySelectorAll(".news__tabs__item");
      btns.forEach((item) => {
        item.classList.remove("active");
      });
      document.getElementById(btn).classList.add("active");
      let news = document.querySelectorAll(".news__items");
      news.forEach((item) => {
        item.classList.remove("active");
      });
      document.getElementById(id).classList.add("active");
    },
  },
  mounted() {
    this.getTotalaNews();
  },
};
</script>


<template>
  <div class="news mBlock">
    <div class="container">
      <div class="news__content">
        <div class="news__head">
          <div class="head-h1">Новости</div>
          <router-link to="/news"><span>Больше новостей</span>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
        <div class="news__body">
          <div class="news__tabs">
            <div class="news__tabs__item" :id="'allVideosBtn'" @click="toggleNews('allVideosItems', 'allVideosBtn')">
              Все новости
            </div>
            <div class="news__tabs__item" v-for="theme in themes" :key="theme.id" :id="theme.name + theme.id"
              @click="toggleNews(theme.id + theme.name, theme.name + theme.id)" :class="getThemeClass(theme.name)">
              {{ theme.name }}
            </div>
          </div>
          <div class="news__wrap">
            <Swiper class="news__items" :id="'allVideosItems'" :slidesPerView="'auto'" :spaceBetween="20" :loop="false"
              :modules="modules" :breakpoints="{
                1600: {
                  spaceBetween: 20,
                },
                1440: {
                  spaceBetween: 20,
                },
                1280: {
                  spaceBetween: 20,
                },
                1024: {
                  spaceBetween: 15,
                },
                768: {
                  spaceBetween: 15,
                },
                320: {
                  spaceBetween: 15,
                },

              }">
              <Swiper-slide v-for="item in allVideos" :key="item.id" :to="'post/' + item.id" class="slide">
                <PostMini :item="item" />
              </Swiper-slide>
            </Swiper>
            <Swiper class="news__items" v-for="news in newsArray" :key="news.id" :id="news.theme.id + news.theme.name"
              :slidesPerView="'auto'" :spaceBetween="20" :loop="false" :modules="modules" :breakpoints="{
                1600: {
                  spaceBetween: 20,
                },
                1440: {
                  spaceBetween: 20,
                },
                1280: {
                  spaceBetween: 20,
                },
                1024: {
                  spaceBetween: 15,
                },
                768: {
                  spaceBetween: 15,
                },
                320: {
                  spaceBetween: 15,
                },

              }">
              <Swiper-slide v-for="item in news.news" :key="item.id" :to="item.link" class="slide">
                <PostMini class="news__item" :item="item" />
              </Swiper-slide>
            </Swiper>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.news {
  margin-top: 180px;
}

.news__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}
.news__head a {
  color: rgba(51, 51, 51, 1);
  font-size: 14px;
  line-height: 18px;
  font-family: 'Proxima Nova';
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.news__content {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.news__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

.slide {
  width: max-content;
  height: auto;
}

.news__tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 853px;
}

.news__tabs__item {
  text-align: center;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  padding: 8px 26px;
  border-radius: 137px;
}

.news__wrap {
  position: relative;
}

.news__wrap {
  position: relative;
}

.news__items {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  overflow: visible;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s, visibility 0.5s;
}

.news__items.active {
  opacity: 1;
  visibility: visible;
  position: relative;
}


.news__item--text {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 20px;
}

.news__item__date {
  color: rgba(255, 255, 255, 0.34);
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.news__item__title {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  /* 122.222% */
  letter-spacing: -0.36px;
}

.news__item__subtitle {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

@media screen and (max-width: 600px) {
  .news {
    margin-top: 60px;
  }
  .news__head a span {
    display: none;
  }
  .news__content {
    gap: 4px;
  }

  .news__body {
    gap: 36px;
  }

  .news__tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .news__tabs::-webkit-scrollbar {
    display: none;
  }

  .news__tabs__item {
    white-space: nowrap;
    flex-shrink: 0;
  }

}
</style>