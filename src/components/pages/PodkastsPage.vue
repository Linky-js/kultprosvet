<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import PodkastItemToPage from "../elements/PodkastItemToPage.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import axios from "axios";

export default {
  name: "PodkastsPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    PodkastItemToPage,
    SubscribeBlock,
  },
  data() {
    return {
      kategoryesThemes: [],
      parrentkategoryes: null,
      selectedCategory: null,
      currentCategories: [],
      audioThemes: [],
      openAudios: [],
      curentTheme: null,
      themes: [],
      theme: null,
      incrementCountDesktop: 4,
      incrementCountMobile: 2,
      windowWidth: window.innerWidth,
      isPlaying: false,
      unikId: null,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      displayCount: 5,
    };
  },
  computed: {
    getInitialDisplayCount() {
      return this.windowWidth < 600
        ? this.incrementCountMobile
        : this.incrementCountDesktop;
    },
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
    loadMoreNews() {
      this.displayCount += this.getIncrementCount;
    },
    sortVideos(sort = false) {
      this.openAudios = [];

      if (this.theme) {
        const theme = this.audioThemes.find((t) => t.theme.name === this.theme);

        if (theme) {
          this.curentTheme = theme;
          this.currentCategories = [];

          for (let a of theme.audios) {
            let idCategory = this.currentCategories.find(
              (c) => c.id === a.category.id
            );
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

    handleSortClick(event = false) {
      if (event) {
        let target = event.currentTarget;
        let sortTheme = target.getAttribute("data-sorttheme");

        this.theme = sortTheme || null;
        this.selectedCategory = null; // сбрасываем выбранную категорию при смене темы
        this.sortVideos();
        let filterText = target
          .closest(".products__sort-rating")
          .querySelector(".sort__text span");
        filterText.textContent = sortTheme || "Все аудио";
      } else {
        let sortTheme = "Лайф менеджмент";
        this.theme = sortTheme || null;
        this.selectedCategory = null; // сбрасываем выбранную категорию при смене темы
        this.sortVideos();
        let filterText = document.querySelector("#themesSort__text span");
        filterText.textContent = sortTheme || "Все аудио";
      }
    },
    truncate(text, maxLength) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },
    sortItem(event) {
      let target = event.currentTarget;
      let category = target.getAttribute("data-sort");

      this.selectedCategory = category === "allVideos" ? null : category; // обновляем выбранную категорию
      this.sortVideos(); // пересортировать видео с учетом категории
      if (category === "allVideos") {
        category = "Все аудио";
      }
      const filterText = target
        .closest(".products__sort-rating")
        .querySelector(".sort__text span");
      filterText.textContent = this.truncate(category, 20) || "Все категории";
    },
    fetchPodcasts() {
      const authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(`${this.apiUrl}api-podcast/get-list${authGet}`)
        .then((response) => {
          this.openAudios = response.data.podcasts;
          const podkastArray = response.data.podcasts;

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
          this.handleSortClick();
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
      let parent = event.currentTarget;
      let sortText = parent.querySelector(".sort__text");
      let sortRating = parent.querySelector(".sort__rating");

      sortText.classList.add("active");
      sortRating.classList.add("active");
    },
    leaveSort(event) {
      let parent = event.currentTarget;
      let sortText = parent.querySelector(".sort__text");
      let sortRating = parent.querySelector(".sort__rating");

      sortText.classList.remove("active");
      sortRating.classList.remove("active");
    },
    getPodcasts() {
      if (this.displayCount < this.openAudios.length) {
        this.displayCount += 5;
      }
    },
    
  },
  mounted() {
    this.fetchPodcasts();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>
<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[{ name: 'Подкасты', link: '/podkasts' }]"
    :title="'Подкасты'"
    :bannerHead="{ name: 'podcasts', uniq: false }"
  />
  <div class="podkasts mBlock">
   

    <div class="container">
      <div class="podkasts__content">
        <div class="link__filteres">
          <div
            class="products__sort-rating themesFilter"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div id="themesSort__text" class="sort__text">
              <span>Выберите темы</span>
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
                Все аудио
              </div>
              <div
                v-for="k of currentCategories"
                :key="k.name"
                class="sort__rating-item sortKat"
                :data-sort="k.name"
                @click="sortItem"
              >
                {{ k.name }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="curentTheme" class="pokast__theme">
          <div class="banner">
            <img
              :src="
                apiDomain + 'web/uploads/' + curentTheme.theme.podcast_banner
              "
              alt="banner"
            />
          </div>
        </div>
        <div v-if="curentTheme" class="podkast__body">
          <div class="podkast__body-head">
            <h2 class="podkast__title">{{ curentTheme.theme.name }}</h2>
            <p class="podkast__text">{{ curentTheme.theme.description }}</p>
          </div>
          <div class="podkast__body-items">
            <PodkastItemToPage
              v-for="item in openAudios.slice(0, this.displayCount)"
              :key="item.id"
              :item="item"
            />
          </div>
          <a
            v-if="displayCount < openAudios.length"
            @click="getPodcasts(index)"
            class="get__addNews"
          >
            Больше аудио
          </a>
        </div>
      </div>
    </div>
  </div>
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
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
  color: #5f22c1;
}
.link__filteres {
  display: flex;
  gap: 14px;
}
.sort__rating-item {
  cursor: pointer;
}
.podkasts__content {
  display: flex;
  flex-direction: column;
  gap: 42px;
}
.podkast__body-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.banner {
  width: 100%;
  height: 195px;
  display: flex;
}
.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.podkasts__content {
  display: flex;
  flex-direction: column;
  gap: 46px;
}
.podkast__body {
  max-width: 660px;
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  gap: 50px;
}
.podkast__title {
  color: #333;
  font-family: Onest;
  font-size: 46px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}
.podkast__text {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.get__addNews {
  color: #5f22c1;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 112.5% */
  background: #f0f0f0;
  padding: 15px 20px;
  width: 212px;
  margin-top: 23px;
  transition: all 0.3s;
}
.get__addNews:hover {
  transform: scale(1.05);
}
@media screen and (max-width: 1024px) {
  .podkast__title {
    color: #439563;
    font-family: Onest;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
  }
  .link__filteres {
    flex-direction: column;
  }
}
@media screen and (max-width: 768px) {
  .products__sort-rating {
    width: 100%;
  }
}
</style>