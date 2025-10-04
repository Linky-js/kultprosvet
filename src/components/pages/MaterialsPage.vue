<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import MaterialMini from "../elements/MaterialMini.vue";
import axios from "axios";
export default {
  name: "MaterialsPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    SubscribeBlock,
    MaterialMini,
  },
  data() {
    return {
      library: [
      ],
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      kategoryesThemes: [],
      parrentkategoryes: null,
      selectedCategory: null,
      currentCategories: [],
      bookThemes: [],
      openlibrary: [],
      themes: [],
      theme: null,
      curentTheme: null,
      displayCount: 6,
      displayCountDesktop: 6,
      displayCountMobile: 2,
      incrementCountDesktop: 5,
      incrementCountMobile: 2,
      windowWidth: window.innerWidth,
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
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    loadMoreNews() {
      this.displayCount += this.getIncrementCount;
    },
    getLibrary() {
      axios
        .get(
          this.apiUrl +
            "api-material/get-list" +
            `&auth=${this.user.username}:${this.user.auth_key}`
        )
        .then((response) => {
          this.openlibrary = response.data.materials;
          const libraryArray = response.data.materials;
        

          libraryArray.forEach((material) => {
            if (!this.themes.some((theme) => theme.name === material.theme.name)) {
              this.themes.push(material.theme);
            }
          });

          this.bookThemes = libraryArray.reduce((acc, material) => {
            const themeName = material.theme.name;
            let themeEntry = acc.find(
              (entry) => entry.theme.name === themeName
            );

            if (!themeEntry) {
              themeEntry = { theme: material.theme, materials: [] };
              acc.push(themeEntry);
            }

            themeEntry.materials.push(material);
            return acc;
          }, []);

        })
        .catch((error) => {
          console.log(error);
        });
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
    generateUnikId() {
      return Math.random().toString(36).substring(2, 15);
    },
    sortVideos(sort = false) {
      this.openlibrary = [];
      if (this.theme) {
        const theme = this.bookThemes.find((t) => t.theme.name === this.theme);
        if (theme) {
          this.curentTheme = theme;
          this.currentCategories = [];
          for (let a of theme.materials) {
            if (!this.currentCategories.includes(a.category)) {
              this.currentCategories.push(a.category);
            }
          }
          this.openlibrary = theme.materials
            .filter(
              (material) =>
                !this.selectedCategory ||
                material.category.name === this.selectedCategory
            )
            .map((material) => ({
              ...material,
              unikId: this.generateUnikId(),
            }));
        }
      } else {
        this.bookThemes.forEach((t) => {
          t.materials.forEach((material) => {
            this.openlibrary.push({ ...material, unikId: this.generateUnikId() });
          });
        });
      }

      if (sort) {
        this.openlibrary = this.openlibrary.filter((material) =>
          material.kategory.includes(sort)
        );
      }

      this.openlibrary.forEach((material) => {
        material.displayCount = this.getInitialDisplayCount;
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
      filterText.textContent = sortTheme || "Все темы";
    },

    sortItem(event) {
      let target = event.currentTarget;
      let category = target.getAttribute("data-sort");

      this.selectedCategory = category === "allVideos" ? null : category; // обновляем выбранную категорию
      this.sortVideos(); // пересортировать видео с учетом категории
      if (category === "allVideos") {
        category = "Все книги";
      }
      const filterText = target
        .closest(".products__sort-rating")
        .querySelector(".sort__text span");
      filterText.textContent = category || "Все категории";
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
  },
  mounted() {
    this.getLibrary();
  }
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[{ name: 'Материалы', link: '/materials' }]"
    :bannerHead="{ name: 'material', uniq: false }"
    :title="'Материалы'"
  />
  <div class="library mBlock">
    <div class="container">
      <div class="library__content">
        <div class="link__filteres">
          <div
            class="products__sort-rating themesFilter"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div class="sort__text">
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
                  fill="#EC4E44"
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
         
          
        </div>
        <div class="books__items mBlock">
          <MaterialMini
            v-for="item in openlibrary.slice(0, this.displayCount)"
            :key="item.id"
            :item="item"
          />
        </div>
        <a
            v-if="displayCount < openlibrary.length"
            @click="getNews(index)"
            class="get__addNews"
          >
            Больше аудио
          </a>
      </div>
    </div>
  </div>
  <SubscribeBlock />
  <FooterBlock />
</template>

<style scoped>
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
  color: #ec4e44;
}
.link__filteres {
  display: flex;
  gap: 14px;
}
.sort__rating-item {
  cursor: pointer;
}
.books__items{
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>