<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import PopupVideo from "../elements/PopupVideo.vue";
// import BloggerBanner from "../elements/BloggerBanner.vue";
import axios from "axios";
export default {
  name: "VideosPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    SubscribeBlock,
    PopupVideo,
    // BloggerBanner,
  },
  data() {
    return {
      kategoryesThemes: [],
      parrentkategoryes: null,
      selectedCategory: null,
      currentCategories: [],
      videosThemes: [],
      openAudios: [],
      themes: [],
      theme: null,
      iframe: null,
      popupShow: false,
      displayCount: 4,
      displayCountDesktop: 4,
      displayCountMobile: 2,
      incrementCountDesktop: 4,
      incrementCountMobile: 2,
      windowWidth: window.innerWidth,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      bloggers: [],
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
    generateUnikId() {
      return Math.random().toString(36).substring(2, 15);
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    getNews() {
      if (this.displayCount < this.openAudios.length) {
        this.displayCount += this.getIncrementCount;
      }
    },
    sortVideos(sort = false) {
      this.openAudios = [];
      if (this.theme) {
        const theme = this.audioThemes.find((t) => t.theme.name === this.theme);
        if (theme) {
          this.curentTheme = theme;
          this.currentCategories = [];
          for (let a of theme.audios) {
            let idCategory = this.currentCategories.find((c) => c.id === a.category.id);
            if (!idCategory) {
              this.currentCategories.push(a.category);
            }
          }

          this.openAudios = theme.audios
            .filter(
              (audio) =>
                !this.selectedCategory ||
                audio.category.name === this.selectedCategory
            )
            .map((audio) => ({
              ...audio,
              unikId: this.generateUnikId(),
            }));
        }
      } else {
        this.audioThemes.forEach((t) => {
          t.audios.forEach((audio) => {
            this.openAudios.push({ ...audio, unikId: this.generateUnikId() });
          });
        });
      }

      if (sort) {
        this.openAudios = this.openAudios.filter((audio) =>
          audio.kategory.includes(sort)
        );
      }

      this.openAudios.forEach((audio) => {
        audio.displayCount = this.getInitialDisplayCount;
      });
      
    },

    handleSortClick(event) {
      let target = event.currentTarget;
      let sortTheme = target.getAttribute("data-sorttheme");
      this.theme = sortTheme || null;
      this.selectedCategory = null; // сбрасываем выбранную категорию при смене темы
      this.sortVideos();
      let filterText = target
        .closest(".products__sort-rating")
        .querySelector(".sort__text span");
      filterText.textContent = sortTheme || "Все видео";
    },

    sortItem(event) {
      let target = event.currentTarget;
      let category = target.getAttribute("data-sort");
      
      this.selectedCategory = category === "allVideos" ? null : category; // обновляем выбранную категорию
      this.sortVideos(); // пересортировать видео с учетом категории
      if (category === "allVideos") {
        category = 'Все видео';
      }
      const filterText = target
        .closest(".products__sort-rating")
        .querySelector(".sort__text span");
      filterText.textContent = this.truncate(category, 20) || "Все категории";
    },
    fetchVideos() {
      const authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(`${this.apiUrl}api-video/get-list${authGet}&order=sort`)
        .then((response) => {
          this.openAudios = response.data.videos;
          const podkastArray = response.data.videos;
          
          podkastArray.forEach((podcast) => {
            if (
              !this.themes.some((theme) => theme.name === podcast.theme.name)
            ) {
              this.themes.push(podcast.theme);
            }
          });

          this.audioThemes = podkastArray.reduce((acc, podcast) => {
            const themeName = podcast.theme.name;
            let themeEntry = acc.find(
              (entry) => entry.theme.name === themeName
            );

            if (!themeEntry) {
              themeEntry = { theme: podcast.theme, audios: [] };
              acc.push(themeEntry);
            }

            themeEntry.audios.push(podcast);
            return acc;
          }, []);

        })
        .catch((error) => console.error("Error fetching podcasts:", error));
    },
    toggleSort(event) {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        let parent = event.currentTarget;
        let sortText = parent.querySelector(".sort__text");
        let sortRating = parent.querySelector(".sort__rating");

        sortText.classList.toggle("active");
        sortRating.classList.toggle("active");
      } else {
        return;
      }
    },
    enterSort(event) {
      let mobile = window.innerWidth < 1024;
      if (mobile) { return ;}
      let parent = event.currentTarget;
      let sortText = parent.querySelector(".sort__text");
      let sortRating = parent.querySelector(".sort__rating");

      sortText.classList.add("active");
      sortRating.classList.add("active");
    },
    leaveSort(event) {
      let mobile = window.innerWidth < 1024;
      if (mobile) { return ;}
      let parent = event.currentTarget;
      let sortText = parent.querySelector(".sort__text");
      let sortRating = parent.querySelector(".sort__rating");

      sortText.classList.remove("active");
      sortRating.classList.remove("active");
    },
    togglePlay(iframe) {
      
      this.popupShow = true;
      this.iframe = iframe;
    },
    closePopup() {
      this.popupShow = false;
      this.iframe = null;
    },
    truncate(text, maxLength) {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        maxLength = 28;
      }
      if (!text) return "";
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    },
    getBloggers() {
      const authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(`${this.apiUrl}api-blogger/get-list${authGet}`)
        .then((response) => {
          console.log('response', response);
          
          this.bloggers = response.data.bloggers;
        })
        .catch((error) => console.error("Error fetching bloggers:", error));
    }
  },
  mounted() {
    this.fetchVideos();
    this.getBloggers();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<template>
  <HeaderBlock />
    
    <Breadcrumbs :page="[{ name: 'Видео', link: '/videos' }]" :title="'Видео'" :bannerHead="{ name: 'videos', uniq: false }" />
  <div class="videos mBlock">
    <div class="container">
      <div class="videos__content">
        <!-- <BloggerBanner v-for="blogger in bloggers" :key="blogger.id" :btn="true" :item="blogger" />  -->
        <div class="link__filteres">
          <div
            class="products__sort-rating themesFilter"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div class="sort__text">
              <span>Все темы</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.64021 11.7682C9.26936 12.0773 8.73069 12.0773 8.35984 11.7682L2.35984 6.76822C1.93556 6.41466 1.87824 5.78409 2.2318 5.35982C2.58537 4.93554 3.21593 4.87821 3.64021 5.23178L9.00003 9.69829L14.3598 5.23178C14.7841 4.87821 15.4147 4.93554 15.7682 5.35982C16.1218 5.78409 16.0645 6.41466 15.6402 6.76822L9.64021 11.7682Z"
                  fill="#5F22C1"
                />
              </svg>
            </div>
            <div class="sort__rating">
              <div
                v-for="theme in themes"
                :key="theme.id"
                class="sort__rating-item"
                @click="handleSortClick"
                :data-sorttheme="theme.name"
              >
                {{ theme.name }}
              </div>
            </div>
          </div>
          <div
            class="products__sort-rating"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div class="sort__text">
              <span>Дата добавления</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.64021 11.7682C9.26936 12.0773 8.73069 12.0773 8.35984 11.7682L2.35984 6.76822C1.93556 6.41466 1.87824 5.78409 2.2318 5.35982C2.58537 4.93554 3.21593 4.87821 3.64021 5.23178L9.00003 9.69829L14.3598 5.23178C14.7841 4.87821 15.4147 4.93554 15.7682 5.35982C16.1218 5.78409 16.0645 6.41466 15.6402 6.76822L9.64021 11.7682Z"
                  fill="#5F22C1"
                />
              </svg>
            </div>
            <div class="sort__rating">
              <div
                class="sort__rating-item"
                @click="sortItem"
                data-sort="allVideos"
              >
                Все видео
              </div>
              <div
                class="sort__rating-item"
                @click="sortItem"
                data-sort="newVideos"
              >
                Сначала новые
              </div>
              <div
                class="sort__rating-item"
                @click="sortItem"
                data-sort="oldVideos"
              >
                Сначала старые
              </div>
            </div>
          </div>
          <div
            v-if="currentCategories.length > 0"
            class="products__sort-rating katFilteres"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div class="sort__text">
              <span>Категории</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.64021 11.7682C9.26936 12.0773 8.73069 12.0773 8.35984 11.7682L2.35984 6.76822C1.93556 6.41466 1.87824 5.78409 2.2318 5.35982C2.58537 4.93554 3.21593 4.87821 3.64021 5.23178L9.00003 9.69829L14.3598 5.23178C14.7841 4.87821 15.4147 4.93554 15.7682 5.35982C16.1218 5.78409 16.0645 6.41466 15.6402 6.76822L9.64021 11.7682Z"
                  fill="#5F22C1"
                />
              </svg>
            </div>
            <div class="sort__rating">
              <div
                class="sort__rating-item sortKat"
                @click="sortItem"
                data-sort="allVideos"
              >
                Все видео
              </div>
              <div
                v-for="k of currentCategories"
                :key="k.id"
                class="sort__rating-item sortKat"
                :data-sort="k.name"
                @click="sortItem"
              >
                {{ k.name }}
              </div>
            </div>
          </div>
        </div>
        <div class="videos__items">
          <div
            class="post"
            v-for="v in openAudios.slice(0, this.displayCount)"
            :key="v.id"
          >
            <div class="video">
              <div
                :id="'btnVBlock' + v.id"
                class="btn__playVideo"
               @click="togglePlay(v.link)"
              >
                <svg
                  class="playSvg"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M23 12.0002C23 10.9652 22.47 9.93018 21.409 9.35318L8.597 2.38518C6.534 1.26418 4 2.72418 4 5.03318V12.0002H23Z"
                    fill="white"
                  />
                  <path
                    d="M8.597 21.615L21.409 14.647C21.89 14.3924 22.2923 14.0113 22.5727 13.5448C22.8531 13.0784 23.0008 12.5442 23 12H4V18.967C4 21.277 6.534 22.736 8.597 21.615Z"
                    fill="white"
                  />
                </svg>
                <svg
                    class="pauseSvg"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M1.66602 5.00033C1.66602 3.42866 1.66602 2.64366 2.15435 2.15533C2.64268 1.66699 3.42768 1.66699 4.99935 1.66699C6.57102 1.66699 7.35602 1.66699 7.84435 2.15533C8.33268 2.64366 8.33268 3.42866 8.33268 5.00033V15.0003C8.33268 16.572 8.33268 17.357 7.84435 17.8453C7.35602 18.3337 6.57102 18.3337 4.99935 18.3337C3.42768 18.3337 2.64268 18.3337 2.15435 17.8453C1.66602 17.357 1.66602 16.572 1.66602 15.0003V5.00033ZM11.666 5.00033C11.666 3.42866 11.666 2.64366 12.1543 2.15533C12.6427 1.66699 13.4277 1.66699 14.9993 1.66699C16.571 1.66699 17.356 1.66699 17.8443 2.15533C18.3327 2.64366 18.3327 3.42866 18.3327 5.00033V15.0003C18.3327 16.572 18.3327 17.357 17.8443 17.8453C17.356 18.3337 16.571 18.3337 14.9993 18.3337C13.4277 18.3337 12.6427 18.3337 12.1543 17.8453C11.666 17.357 11.666 16.572 11.666 15.0003V5.00033Z"
                      fill="white"
                    />
                  </svg>
              </div>
              <img class="poster" :src="apiDomain + 'web/uploads/' + v.poster" alt="">
             
            </div>
            <div class="post__content">
              <div class="kategory">
                <p class="description-category">
                  {{ v.category.name }}
                </p>
              </div>
              <h3 class="headPost">
                {{ truncate(v.title, 54) }}
              </h3>
              <p class="sub-headPost">
                {{ v.text }}
              </p>
            </div>
          </div>
        </div>
        <a
          v-if="displayCount < openAudios.length"
          @click="getNews(index)"
          class="get__addNews"
        >
          Больше видео
        </a>
      </div>
    </div>
  </div>
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
.description-category {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 26px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}
.products__sort-rating {
  position: relative;
  width: 243px;
}
.sort__rating {
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 19px;
  border: 1px solid #d9d9d9;
  background: #fff;
  padding: 15px;
  z-index: 6;
  margin: 0;
  color: #383838;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
}

.sort__rating.active {
  opacity: 1;
  visibility: visible;
  transition: all 0.3s;
}
.products__sort-rating svg {
  transition: all 0.3s;
}
.products__sort-rating:has(.sort__rating.active) svg {
  transform: rotate(180deg);
}
.sort__text {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
  color: #383838;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px; /* 128.571% */
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #000;
  transition: all 0.3s;
}
.sort__text.active {
  color: #5F22C1;
}
.link__filteres {
  display: flex;
  gap: 14px;
}
.sort__rating-item {
  cursor: pointer;
}
.videos__content {
  display: flex;
  flex-direction: column;
  gap: 42px;
}
.videos__items {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
}
.post {
  position: relative;
  width: calc((100% / 2) - 22px); 
}
.post .poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.post .video {
  width: 100%;
  height: 100%;
  position: relative;
}
.video::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.0001) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  z-index: 1;
}

.post .post__content {
  position: absolute;
  left: 44px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2;
}
.post:nth-of-type(1),
.post:nth-of-type(2) {
  width: calc((100% / 2) - 22px);
}
.headPost {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 122.222% */
}
.sub-headPost {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 302px;
}
.btn__playVideo {
  position: absolute;
  top: 43px;
  right: 43px;
  z-index: 2;
  cursor: pointer;
  border-radius: 90px;
  background: rgba(111, 111, 111, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  width: 50px;
  height: 50px;
  z-index: 2;
}
.kategory span {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px; /* 183.333% */
  text-transform: uppercase;
  
}
.kategory {
  border-bottom: 1px solid #b9b9b9;
  width: 100%;
  max-width: 322px;
  padding-bottom: 10px;
}
.get__addNews {
  color: #5F22C1;
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
.get__addNews:hover{
  transform: scale(1.05);
}
@media screen and (max-width: 1024px) {
  .posts {
    display: flex;
    flex-direction: column;
  }
  .post {
    position: relative;
    max-width: 100%;
  }
  .post:nth-of-type(1),
  .post:nth-of-type(2) {
    max-width: 100%;
  }
  .link__filteres{
    flex-direction: column;
  }
  .videos__items{
    flex-direction: column;
  }
  .videos__items .post{
    width: 100%;
  }
  .post .post__content{
    left: 20px;
  }
  .btn__playVideo {
    top: 20px;
    right: 20px;
    width: 30px;
    height: 30px;
    padding: 6px;
  }
}
@media screen and (max-width: 768px) {
  .products__sort-rating{
    width: 100%;
  }
  
}
</style>