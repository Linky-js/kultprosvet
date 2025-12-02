<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import PodkastItemToPage from "../elements/PodkastItemToPage.vue";
import TestItemToPage from "../elements/TestItemToPage.vue";
import PostMini from "../elements/PostMini.vue";
import MaterialMini from "../elements/MaterialMini.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import PopupVideo from "../elements/PopupVideo.vue";
import MiniVideoBlock from "../elements/MiniVideoBlock.vue";
import BookItemToPage from "../elements/BookItemToPage.vue";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { A11y } from "swiper/modules";
import { myMixinColor } from "@/mixin";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default {
  name: "ThemePage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    PodkastItemToPage,
    TestItemToPage,
    Swiper,
    SwiperSlide,
    PostMini,
    MaterialMini,
    SubscribeBlock,
    MiniVideoBlock,
    PopupVideo,
    BookItemToPage,
  },
  mixins: [myMixinColor],
  setup() {
    const swiperActiveIndex = 0; // начальный активный индекс
    const onSwiper = () => {
    };
    return {
      onSwiper,
      swiperActiveIndex,
      modules: [A11y],
    };
  },
  data() {
    return {
      color: null,
      theme: {},
      news: null,
      videos: null,
      materials: null,
      podkasts: null,
      bookThemes: [],
      openlibrary: [],
      tests: null,
      nameTheme: null,
      iframe: null,
      popupShow: false,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  computed: {
    getThemeId() {
      return this.$route.params.id;
    },
  },
  methods: {
    getContent() {
      let theme_id = this.getThemeId;
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-theme/get/" + authGet + "&id=" + theme_id)
        .then((response) => {
          this.theme = response.data.theme;
          this.nameTheme = this.theme.name;
          setTimeout(() => {
            this.animateGo();
          }, 500);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl +
          "api-book/get-list" +
          `&auth=${this.user.username}:${this.user.auth_key}`
        )
        .then((response) => {
          this.openlibrary = response.data.books;
          const libraryArray = response.data.books;

          libraryArray.forEach((book) => {
            if (!this.themes.some((theme) => theme.name === book.theme.name)) {
              this.themes.push(book.theme);
            }
          });

          this.bookThemes = libraryArray.reduce((acc, book) => {
            const themeName = book.theme.name;
            let themeEntry = acc.find(
              (entry) => entry.theme.name === themeName
            );

            if (!themeEntry) {
              themeEntry = { theme: book.theme, books: [] };
              acc.push(themeEntry);
            }

            themeEntry.books.push(book);
            return acc;
          }, []);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl +
          "api-news/get-list/" +
          authGet +
          "&theme_id=" +
          this.$route.params.id
        )
        .then((response) => {
          this.news = response.data.news;
        })
        .catch((error) => {
          console.log(error);
        });
      if (this.$route.params.id == 2) {
        axios
          .get(
            this.apiUrl +
            "api-video/get-list/" +
            authGet +
            "&category_id=26"
          )
          .then((response) => {
            this.videos = response.data.videos;
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        axios
          .get(
            this.apiUrl +
            "api-video/get-list/" +
            authGet +
            "&theme_id=" +
            this.$route.params.id
          )
          .then((response) => {
            this.videos = response.data.videos;
          })
          .catch((error) => {
            console.log(error);
          });
      }

      axios
        .get(
          this.apiUrl +
          "api-material/get-admin-list/" +
          authGet +
          "&theme_id=" +
          this.$route.params.id
        )
        .then((response) => {
          this.materials = response.data.materials;
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl +
          "api-podcast/get-list/" +
          authGet +
          "&theme_id=" +
          this.$route.params.id
        )
        .then((response) => {
          this.podkasts = response.data.podcasts;
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl +
          "api-test/get-list/" +
          authGet +
          "&theme_id=" +
          this.$route.params.id
        )
        .then((response) => {
          this.tests = response.data.tests;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    togglePlay(iframe) {
      this.popupShow = true;
      this.iframe = iframe;
    },
    closePopup() {
      this.popupShow = false;
      this.iframe = null;
    },
    animateGo() {
      gsap.registerPlugin(ScrollTrigger);

      // Получаем элемент с текстом
      const marqueezContent = document.querySelector(".marqueez__content");
      const container = document.querySelector(".marqueez .container");

      // Разбиваем текст на отдельные слова и оборачиваем в span для анимации цвета
      const words = marqueezContent.innerText.split(" ");
      marqueezContent.innerHTML = words
        .map((word) => `<span style="color: #eaeaea">${word}</span>`)
        .join(" ");

      // Получаем ширину текста и контейнера
      const contentWidth = marqueezContent.scrollWidth;
      const containerWidth = container.clientWidth;

      // Создаем анимацию движения текста по горизонтали при скролле страницы
      gsap.fromTo(
        marqueezContent,
        {
          x: 200,
        },
        {
          x: () => -(contentWidth - containerWidth) - 100, // Сдвигаем текст влево на ширину текста минус ширина контейнера
          ease: "none",
          scrollTrigger: {
            trigger: ".marqueez",
            start: "top center+=200", // Анимация начинается, когда блок появляется снизу
            end: "top top+=200", // Анимация заканчивается, когда блок доходит до верха экрана
            scrub: 2, // Двигаем текст синхронно со скроллом
          },
        }
      );

      // Анимация изменения цвета слов
      const spans = marqueezContent.querySelectorAll("span");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".marqueez",
          start: "top center+=100",
          end: "top top+=100",
          scrub: 2,
        },
      });

      spans.forEach((span) => {
        if (span === spans[spans.length - 1]) {
          tl.to(span, { color: this.color, duration: 1, ease: "none" });
        } else {
          tl.to(span, { color: this.color, duration: 1, ease: "none" }).to(
            span,
            { color: "#eaeaea", duration: 1, ease: "none" },
            "+=0.2"
          );
        }
      });
    },
    truncate(text, maxLength) {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        maxLength = 28;
      }
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },
  },
  mounted() {
    this.getContent();
  },
  watch: {
    getThemeId() {
      this.getContent();
    },
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs :page="[{ name: nameTheme, link: '' }]" :bannerHead="{ name: theme.img, uniq: true }"
    :title="theme.name" />
  <div class="bannerPhoto">
    <div class="container">
      <img :src="apiDomain + `web/uploads/` + theme.banner" alt="" class="bannerPhoto__img" />
      <div class="bannerPhoto__content">
        <p><span>Эфективное управление</span> своей жизнью, ресурсами и временем для достижения личных целей и
          обеспечения устойчивого личностного роста</p>
        <div class="bannerPhoto__links">
          <div class="bannerPhoto__links-p">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 6.5H9L10 0.5L2.5 9.5H7L6 15.5L13.5 6.5Z" fill="#5BBA46" />
            </svg>
            Быстрый переход к разделу
          </div>
          <div class="bannerPhoto__links-list">
            <button>Видео</button>
            <button>Подкасты</button>
            <button>Тесты</button>
            <button>Библиотека</button>
            <button>Материалы</button>
            <button>Новости</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="videos != null && videos.length > 0" class="videos" id="theme-videos">
    <div class="container">
      <div class="videos__content">
        <div class="head">
          <div class="head-h2">Видеоматериалы</div>
          <router-link class="link_all" to="/videos">
            <span>Больше видео</span>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
        <Swiper class="videos__items gorizontal" :slidesPerView="'auto'" :spaceBetween="20" :loop="false"
          :modules="modules" :breakpoints="{
            650: {
              slidesPerView: 'auto',
              spaceBetween: 12,
            },
            320: {
              slidesPerView: 1,
              spaceBetween: 12,
            },
          }">
          <SwiperSlide class="videos__slide" v-for="video in videos" :key="video.id">
            <MiniVideoBlock :video="video" @open-video="togglePlay" />
          </SwiperSlide>

        </Swiper>
      </div>
    </div>
  </div>
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
  <div v-if="podkasts != null && podkasts.length > 0" class="podkasts">
    <div class="container">
      <div class="podkasts__content">
        <div class="head">
          <div class="head-h2">Подкасты</div>
          <router-link class="link_all" to="/podcasts">
            <span>Больше подкастов</span>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
        <Swiper class="podkasts__swiper" :slidesPerView="'auto'" :spaceBetween="20" :loop="false" :modules="modules"
          :breakpoints="{
            650: {
              spaceBetween: 20,
            },
            320: {
              spaceBetween: 16,
            },
          }">
          <SwiperSlide v-for="podkast in podkasts.slice(0, 5)" :key="podkast.id">
            <PodkastItemToPage :item="podkast" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
  <div v-if="tests != null && tests.length > 0" class="tests">
    <div class="container">
      <div class="tests__content">
        <div class="head">
          <div class="head-h2">Тесты</div>
          <router-link class="link_all" to="/tests">
            <span>Больше тестов</span>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
        <Swiper class="tests__swiper" :slidesPerView="'auto'" :spaceBetween="20" :loop="false" :modules="modules"
          :breakpoints="{
            650: {
              spaceBetween: 20,
            },
            320: {
              spaceBetween: 16,
            },
          }">
          <SwiperSlide v-for="(test, index) in tests" :key="test.id">
            <TestItemToPage :item="test" :index="index" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
  <div class="quote"
    :style="{ backgroundImage: `url(/img/bg-theme.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
    <div class="container">
      <div class="quote__svg">
        <svg width="409" height="302" viewBox="0 0 409 302" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M310.626 0C364.542 0 408.251 43.7082 408.251 97.625C408.251 137.449 387.52 175.981 356.578 183.416C344.643 186.284 335.138 201.6 337.18 219.085C339.914 242.488 361.078 266.133 402.982 284.766C412.312 288.914 408.405 302.95 398.273 301.681C289.065 288.009 213.365 216.812 213.002 116.082C213.001 46.8076 253.928 0 310.626 0Z"
            fill="url(#paint0_linear_4088_2209)" fill-opacity="0.5" />
          <path
            d="M97.6237 0C151.541 0 195.249 43.7082 195.249 97.625C195.249 137.449 174.518 175.981 143.576 183.416C131.641 186.284 122.136 201.6 124.178 219.085C126.912 242.488 148.076 266.133 189.98 284.766C199.31 288.914 195.403 302.95 185.271 301.681C76.0631 288.009 0.363165 216.812 3.13505e-08 116.082C-0.00130797 46.8076 40.9265 0 97.6237 0Z"
            fill="url(#paint1_linear_4088_2209)" fill-opacity="0.5" />
          <defs>
            <linearGradient id="paint0_linear_4088_2209" x1="310.638" y1="0" x2="310.638" y2="301.762"
              gradientUnits="userSpaceOnUse">
              <stop stop-color="#4E9C3D" />
              <stop offset="1" stop-color="#56AA43" />
            </linearGradient>
            <linearGradient id="paint1_linear_4088_2209" x1="97.6361" y1="0" x2="97.6361" y2="301.762"
              gradientUnits="userSpaceOnUse">
              <stop stop-color="#4E9C3D" />
              <stop offset="1" stop-color="#56AA43" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="quote__text">
        <div class="quote__title"><span>Время</span> - это наш невидимый партнер в каждом деле</div>
        <div class="quote__author">Андрей Платонов</div>
      </div>
      <img class="quote__img" src="/img/boy.png" alt="">
    </div>
  </div>
  <!--<div class="textBanner mBlock" :style="{
    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${apiDomain}web/uploads/${theme.banner_full})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }">
    <div class="container height100">
      <div class="textBanner__content">
        <span class="line"></span>
        <div class="textBanner__text">
          {{ theme.description }}
        </div>
      </div>
    </div>
  </div>-->
  <div class="lib">
    <div class="container">
      <div class="head">
        <div class="head-h2">Библиотека</div>
        <router-link class="link_all" to="/library">
          <span>Больше книг</span>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </router-link>
      </div>
      <Swiper class="lib__swiper" :slidesPerView="'auto'" :spaceBetween="20" :loop="false" :modules="modules">
        <swiper-slide v-for="item in openlibrary" :key="item.id">
          <book-item-to-page :item="item" />
        </swiper-slide>

      </Swiper>
    </div>
  </div>
  <div class="marqueez">
    <div class="container">
      <div class="marqueez__content">
        {{ theme.quote }}
      </div>
    </div>
  </div>
  <div v-if="materials != null && materials.length > 0" class="materials">
    <div class="container">
      <div class="materials__body">
        <div class="head">
          <div class="head-h2">МАТЕРИАЛЫ</div>
          <router-link class="link_all" to="/materials">
            <span>Больше файлов</span>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
        <Swiper class="materials__items" :slidesPerView="'auto'" :spaceBetween="20" :loop="false" :modules="modules">
          <Swiper-slide class="material" v-for="material in materials" :key="material.id">
            <MaterialMini :item="material" />
          </Swiper-slide>
        </Swiper>
      </div>
    </div>
  </div>
  <div v-if="news != null && news.length > 0" class="news">
    <div class="container">
      <div class="news__content">
        <div class="head">
          <div class="head-h2">Новости</div>
          <router-link class="link_all" :to="'/news?theme=' + theme.id + theme.name + '$' + theme.name + theme.id">
            <span>Больше новостей</span>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 21H36.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M31.5 26.25L36.75 21L31.5 15.75" stroke="#333333" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
        <Swiper class="news__body" :slidesPerView="'auto'" :spaceBetween="20" :loop="false">
          <Swiper-slide class="newsPost" v-for="post in news" :key="post.id">
            <PostMini class="postItem" :item="post" />
          </Swiper-slide>
        </Swiper>
      </div>
    </div>
  </div>
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
.link_all {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
  line-height: 129%;
  text-align: center;
  color: #333;
}

.videos__items {
  padding: 32px 0;
  overflow: visible;
}

.videos__slide {
  width: 530px;
}

.videos__slide:deep(.post) {
  max-width: 100%;
  width: 100%;
}


.head-h2 {
  width: 395px;
  max-width: 100%;
}
.podkasts {
  margin-top: 140px;
}
.podkasts__content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.podkasts__swiper {
  overflow: visible;
}

.podkasts__swiper .swiper-slide {
  width: 300px;
}

.bannerPhoto {
  padding-top: 20px;
  padding-bottom: 156px;
}

.bannerPhoto__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  max-width: none;
  border-radius: 28px;
  margin-bottom: 46px;
}

.bannerPhoto__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 30px;
  font-family: "Onest", sans-serif;
}

.bannerPhoto__content p {
  font-weight: 500;
  font-size: 24px;
  line-height: 135%;
  color: #333;
  max-width: 603px;
  width: 100%;
}

.bannerPhoto__content p span {
  color: #5bba46;
}

.bannerPhoto__links {
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bannerPhoto__links-p {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 400;
  font-size: 14px;
  line-height: 135%;
  color: #686868;
}

.bannerPhoto__links-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.bannerPhoto__links-list button {
  font-weight: 600;
  font-size: 13px;
  line-height: 135%;
  color: #464646;
  padding: 10px 16px;
  border: 1px solid #f2f2f2;
  border-radius: 100px;
  text-align: center;
  background: #f5f5f5;
  cursor: pointer;
  transition: .3s all;
}

.bannerPhoto__links-list button:hover {
  background: #5f22c1;
  color: #fff;
}

.textBanner {
  height: 100vh;
}

.height100 {
  height: 100%;
}

.textBanner__text {
  color: #ffffffb0;
  font-family: Onest;
  font-size: 48px;
  font-style: normal;
  font-weight: 300;
  line-height: 48px;
  /* 100% */
  max-width: 690px;
  text-align: center;
  position: relative;
}

.textBanner__text::before {
  content: "";
  width: 56px;
  height: 41px;
  background: url(../../assets/image/kov.svg) no-repeat;
  position: absolute;
  top: -84px;
  left: 40px;
  z-index: 1;
}

.textBanner__content {
  display: flex;
  flex-direction: column;
  justify-content: end;
  gap: 41px;
  height: 100%;
}

.line {
  width: 467px;
  height: 4px;
  background: #ffffffb0;
  max-width: 100%;
}

.newsPost {
  width: max-content;
}

.news {
  margin-bottom: 140px;
  margin-top: 140px;
}
.postItem {
  max-width: 373px;
}

.news__content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.news__body {
  overflow: visible;
}

.swiper {
  width: 100%;
}
.marqueez {
  margin-top: 140px;
}
.marqueez__content {
  color: #eaeaea;
  font-family: Onest;
  font-size: 64px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -1.28px;
  text-transform: uppercase;
  white-space: nowrap;
  will-change: transform;
}

.marqueez .container {
  overflow-x: scroll;
}

.marqueez .container::-webkit-scrollbar {
  display: none;
}

.materials__body {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.material__banner {
  width: 479px;
  max-width: 40%;
  position: relative;
  background: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 304px;
  flex-shrink: 0;
}

.material__linkInfo {
  color: #333;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  /* 128.571% */
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  bottom: 22px;
  right: 20px;
}

.material__banner .head-h2 {
  width: max-content;
}

.materials__items {
  overflow: visible;
}

.material {
  width: max-content;
}

.materials {
  margin-top: 130px;
  margin-bottom: 100px;
}

.materials .linkAll {
  margin-top: 52px;
}

.linksSlide {
  display: flex;
  gap: 20px;
  align-items: center;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.linksSlide div {
  cursor: pointer;
}
.tests {
  margin-top: 140px;
}
.tests__content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.tests__swiper {
  overflow: visible;
}

.tests__swiper .swiper-slide {
  width: 310px;
}

.quote {
  height: 586px;
  font-family: "Onest", sans-serif;
  position: relative;
  padding: 97px 0;
  margin-top: 140px;
}

.quote .container {
  height: 100%;
}

.quote__text {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 17px;
  max-width: 747px;
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
}

.quote__svg {
  left: 15px;
  position: absolute;
  top: 45px;
}

.quote__title {
  font-weight: 600;
  font-size: 48px;
  line-height: 110%;
  color: #fff;
}

.quote__title span {
  color: #1e650e;
}

.quote__img {
  width: 608px;
  height: auto;
  position: absolute;
  object-fit: cover;
  right: 71px;
  bottom: 0;
}

.quote__author {
  font-weight: 500;
  font-size: 21px;
  line-height: 110%;
  color: #1e640e;
}
.lib {
  margin-top: 140px;
}
.lib .head {
  margin-bottom: 22px;
}

@media (max-width: 1200px) {
  .quote__title {
    font-size: 36px;
  }

  .quote {
    height: 450px;
  }

  .quote__img {
    width: 450px;
  }

  .quote__svg svg {
    width: 200px;
    height: auto;
  }
}

@media screen and (max-width: 650px) {
  .post {
    width: inherit;
  }

  .textBanner {
    display: none;
  }
  .podkasts, .tests, .quote, .lib, .marqueez, .materials, .news {
    margin-top: 80px;
  }
  .news {
    margin-bottom: 80px;
  }
  .podkasts__content {
    gap: 8px;
  }
  .lib .head {
    margin-bottom: 8px;
  }
  .tests__content {
    flex-direction: column;
    gap: 8px;
  }
  .materials__body {
    gap: 8px;
  }

  .textBanner__text {
    font-size: 22px;
  }

  .news__content {
    gap: 8px;
  }

  .line {
    width: 135px;
  }

  .textBanner__text::before {
    display: none;
  }

  .link_all {
    span {
      display: none;
    }
  }

  .videos__items {
    padding-top: 8px;
    padding-bottom: 0;
  }

  .marqueez__content {
    font-size: 36px;
  }


  .material__banner {
    width: 100%;
    height: 148px;
    max-width: none;
  }

  .bannerPhoto {
    padding-top: 20px;
    padding-bottom: 80px;
  }

  .bannerPhoto__content {
    flex-direction: column;
    gap: 48px;

    p {
      font-size: 18px;
      line-height: 120%;
    }
  }

  .bannerPhoto__img {
    min-height: 335px;
    margin-bottom: 24px;
    border-radius: 16px;
  }

  .post .post__content {
    left: 20px;
  }

  .podkasts__swiper .swiper-slide {
    width: 248px;
  }

  .quote {
    height: 586px;
    padding-top: 137px;
    padding-bottom: 0;
  }

  .quote__svg {
    top: 26px;
    left: 20px;
  }

  .quote__svg svg {
    width: 213px;
  }

  .quote__text {
    justify-content: flex-start;
    gap: 24px;
  }

  .quote__title {
    font-size: 24px;
  }

  .quote__author {
    font-size: 14px;
  }

  .quote__img {
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    width: 372px;
    height: 350px;
  }
}
</style>