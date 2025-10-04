<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import PostMini from "../elements/PostMini.vue";
import axios from "axios";
import { myMixin2 } from "@/mixin";
export default {
  name: "NewsPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    PostMini,
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
  computed: {
    // Определяем начальный лимит отображаемых новостей в зависимости от ширины экрана
    getInitialDisplayCount() {
      return this.windowWidth < 600
        ? this.displayCountMobile
        : this.displayCountDesktop;
    },
    // Определяем шаг для подгрузки новостей в зависимости от ширины экрана
    getIncrementCount() {
      return this.windowWidth < 600
        ? this.incrementCountMobile
        : this.incrementCountDesktop;
    },
  },
  methods: {
    widthWindow() {
      if (window.innerWidth < 600) {
        this.allCount = this.displayCountMobile;
      } else {
        this.allCount = this.displayCountDesktop;
      }
    },
    // Метод для подгрузки новостей
    getNews(index, all = false) {
      if (all) {
        if (this.allCount < this.allVideos.length) {
          this.allCount += this.getIncrementCount;
        }
      } else {
        const newsItem = this.newsArray[index];
        if (newsItem.displayCount < newsItem.news.length) {
          newsItem.displayCount += this.getIncrementCount;
        }
      }
    },
    // Метод для обновления ширины окна при изменении размера экрана
    handleResize() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth < 600) {
        this.allCount = this.displayCountMobile;
      } else {
        this.allCount = this.displayCountDesktop;
      }
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
    getTotalaNews() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-news/get-list" + authGet)
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
            const themeId = this.$route.query.theme;

            if (themeId) {
              const [idName, nameId] = themeId.split("$");

              // Декодируем параметры для замены %20 на пробелы
              const decodedIdName = decodeURIComponent(idName);
              const decodedNameId = decodeURIComponent(nameId);

              this.toggleNews(decodedIdName, decodedNameId);
            } else {
              this.toggleNews("allVideosItems", "allVideosBtn");
            }
          }, 500);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    sortNewsByTheme(array) {
      let themes = this.themes;
      themes.forEach((theme) => {
        let news = array.filter((item) => item.theme === theme);
        this.newsArray.push({ theme: theme, news: news });
      });
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.widthWindow();
    this.getTotalaNews();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[{ name: 'Новости', link: 'news' }]"
    :bannerHead="{ name: 'news', uniq: false }"
    :title="'Новости'"
  />
  <div class="news mBlock">
    <div class="container">
      <div class="news__content">
        <div class="news__body">
          <div class="news__tabs">
            <div
              class="news__tabs__item"
              :id="'allVideosBtn'"
              @click="toggleNews('allVideosItems', 'allVideosBtn')"
            >
              Все новости
            </div>
            <div
              class="news__tabs__item"
              v-for="theme in themes"
              :key="theme.id"
              :id="theme.name + theme.id"
              @click="toggleNews(theme.id + theme.name, theme.name + theme.id)"
              :class="getThemeClass(theme.name)"
            >
              {{ theme.name }}
            </div>
          </div>
          <div class="news__wrap">
            <div class="news__items" :id="'allVideosItems'">
              <PostMini
                v-for="item in allVideos.slice(0, allCount)"
                :key="item.id"
                :item="item"
              />

              <a
                v-if="allCount < allVideos.length"
                @click="getNews(index, true)"
                class="get__addNews"
              >
                Больше новостей
              </a>
            </div>
            <div
              class="news__items"
              v-for="(news, index) in newsArray"
              :key="news.id"
              :id="news.theme.id + news.theme.name"
            >
              <PostMini
                v-for="item in news.news.slice(0, news.displayCount)"
                :key="item.id"
                :item="item"
              />

              <a
                v-if="news.displayCount < allVideos.length"
                @click="getNews(index)"
                class="get__addNews"
              >
                Больше новостей
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FooterBlock />
</template>

<style scoped>
.news {
  overflow: hidden;
}
.news__content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.news__body {
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
}
.news__tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 853px;
}
.news__tabs__item {
  color: #515151;
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
.news__items {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s, visibility 0.5s;
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
}
.news__items.active {
  opacity: 1;
  visibility: visible;
  position: relative;
}

.get__addNews {
  color: #ec4e44;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 112.5% */
  background: #f0f0f0;
  padding: 15px 20px;
  width: 212px;
  margin: 0 auto;
  margin-top: 23px;
  transition: all 0.3s;
}
.get__addNews:hover {
  transform: scale(1.05);
}
@media screen and (max-width: 600px) {
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
  .news__item {
    width: auto;
    max-width: 100%;
  }
}
</style>
