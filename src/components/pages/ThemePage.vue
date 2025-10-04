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

import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
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
    PopupVideo,
  },
  mixins: [myMixinColor],
  setup() {
    const swiperActiveIndex = 0; // начальный активный индекс
    const onSwiper = () => {
    };
    return {
      onSwiper,
      swiperActiveIndex,
      modules: [Navigation, Pagination, Scrollbar, A11y],
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
          this.updateColorBar();
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
    updateColorBar() {
      this.color = this.getColorClass(this.theme.name);
     

      let spans = document.querySelectorAll(
        ".swiper-pagination-progressbar-fill"
      );
      spans.forEach((span) => {
        span.style.backgroundColor = this.color;
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
  <Breadcrumbs
    :page="[{ name: nameTheme, link: '' }]"
    :bannerHead="{ name: theme.img, uniq: true }"
    :title="theme.name"
  />
  <div class="theme mBlock">
    <div class="container">
      <img
        :src="apiDomain + `web/uploads/` + theme.banner"
        alt=""
        class="bannerPhoto"
      />
    </div>
  </div>
  <div v-if="videos != null && videos.length > 0" class="videos">
    <div class="container">
      <div class="videos__content">
        <div class="head">
          <div class="head-h2">Видеоматериалы</div>
          <div class="linksSlide">
            <div class="prevSlide">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="42"
                height="42"
                viewBox="0 0 42 42"
                fill="none"
              >
                <path
                  d="M36.75 21H5.25"
                  stroke="#333333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.5 26.25L5.25 21L10.5 15.75"
                  stroke="#333333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="nextSlide">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="42"
                height="42"
                viewBox="0 0 42 42"
                fill="none"
              >
                <path
                  d="M5.25 21H36.75"
                  stroke="#333333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M31.5 26.25L36.75 21L31.5 15.75"
                  stroke="#333333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <Swiper
          class="videos__items gorizontal"
          @swiper="updateColorBar()"
          :slidesPerView="'auto'"
          :spaceBetween="20"
          :loop="false"
          :modules="modules"
          :navigation="{
            enabled: true,
            prevEl: '.prevSlide',
            nextEl: '.nextSlide',
          }"
          :pagination="{
            type: 'progressbar',
          }"
          :breakpoints="{
              1600: {
                slidesPerView: 'auto',
                spaceBetween: 20,
              },
              1440: {
                slidesPerView: 'auto',
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 'auto',
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 'auto',
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 1,
                spaceBetween: 12,
              },
              320: {
                slidesPerView: 1,
                spaceBetween: 12,
              },
            }"
        >
          <swiper-slide class="post" v-for="v in videos" :key="v.id">
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
              <img
                class="poster"
                :src="apiDomain + 'web/uploads/' + v.poster"
                alt=""
              />
            </div>
            <div class="post__content">
              <div class="kategory">
                <p class="description-category">
                  {{ v.category.name }}
                </p>
              </div>
              <h3 class="headPost">
                {{ truncate(v.title, 44) }}
              </h3>
              <p class="sub-headPost">
                {{ v.text }}
              </p>
            </div>
          </swiper-slide>
        </Swiper>
      </div>
    </div>
  </div>
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
  <div v-if="podkasts != null && podkasts.length > 0" class="podkasts mBlock">
    <div class="container">
      <div class="podkasts__content">
        <div class="head-h2">Подкасты</div>
        <div class="podkasts__items">
          <PodkastItemToPage
            v-for="podkast in podkasts.slice(0, 5)"
            :key="podkast.id"
            :item="podkast"
          />
        </div>
      </div>
      <router-link to="/podcasts" class="linkAll"
        >Больше подкастов
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <path
            d="M5.25 21H36.75"
            stroke="#333333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M31.5 26.25L36.75 21L31.5 15.75"
            stroke="#333333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>
    </div>
  </div>
  <div v-if="tests != null && tests.length > 0" class="tests mBlock">
    <div class="container">
      <div class="tests__content">
        <div class="head-h2">Тесты</div>
        <div class="tests__items">
          <TestItemToPage
            v-for="test in tests"
            :key="test.id"
            :item="test"
          />
        </div>
      </div>
      <router-link to="/tests" class="linkAll"
        >Больше тестов
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <path
            d="M5.25 21H36.75"
            stroke="#333333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M31.5 26.25L36.75 21L31.5 15.75"
            stroke="#333333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>
    </div>
  </div>
  <div
    class="textBanner mBlock"
    :style="{
      background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${apiDomain}web/uploads/${theme.banner_full})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }"
  >
    <div class="container height100">
      <div class="textBanner__content">
        <span class="line"></span>
        <div class="textBanner__text">
          {{ theme.description }}
        </div>
      </div>
    </div>
  </div>
  <div v-if="news != null && news.length > 0" class="news mBlock">
    <div class="container">
      <div class="news__content">
        <div class="head-h2">Новости</div>
        <Swiper
          class="news__body"
          :slidesPerView="'auto'"
          :spaceBetween="20"
          :loop="false"
        >
          <Swiper-slide class="newsPost" v-for="post in news" :key="post.id">
            <PostMini class="postItem" :item="post" />
          </Swiper-slide>
        </Swiper>
        <router-link
          :to="
            '/news?theme=' + theme.id + theme.name + '$' + theme.name + theme.id
          "
          class="linkAll"
          >Больше новостей
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
          >
            <path
              d="M5.25 21H36.75"
              stroke="#333333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M31.5 26.25L36.75 21L31.5 15.75"
              stroke="#333333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </router-link>
      </div>
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
        <div class="material__banner">
          <div class="head-h2">МАТЕРИАЛЫ</div>
          <div class="material__linkInfo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 42 42"
              fill="none"
            >
              <path
                d="M36.75 21H5.25"
                stroke="#333333"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10.5 26.25L5.25 21L10.5 15.75"
                stroke="#333333"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Двигайте
          </div>
        </div>
        <Swiper
          class="materials__items"
          @swiper="updateColorBar()"
          :slidesPerView="'auto'"
          :spaceBetween="20"
          :loop="false"
          :modules="modules"
          :navigation="{
            enabled: true,
            prevEl: '.arrow-prev',
            nextEl: '.arrow-next',
          }"
          :pagination="{
            type: 'progressbar',
          }"
        >
          <Swiper-slide
            class="material"
            v-for="material in materials"
            :key="material.id"
          >
            <MaterialMini :item="material" />
          </Swiper-slide>
        </Swiper>
      </div>
      <router-link to="/materials" class="linkAll"
        >Больше материалов
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <path
            d="M5.25 21H36.75"
            stroke="#333333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M31.5 26.25L36.75 21L31.5 15.75"
            stroke="#333333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>
    </div>
  </div>
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
.videos__items {
  display: flex;

  gap: 22px;
  padding: 30px 0;
}

.post {
  position: relative;
  width: 500px;
  flex-shrink: 0;
  height: 388px;
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
  display: flex;
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
.headPost {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 122.222% */
}
.description-category {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 26px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
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
.head-h2 {
  width: 395px;
  max-width: 100%;
}
.podkasts__content,
.tests__content {
  display: flex;
  gap: 105px;
}
.tests__items {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.bannerPhoto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  max-width: none;
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
  line-height: 48px; /* 100% */
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
.postItem {
  max-width: 373px;
}
.news__content {
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.swiper {
  width: 100%;
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
  gap: 20px;
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
  line-height: 18px; /* 128.571% */
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
  padding-bottom: 46px;
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
.podkasts__items {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media screen and (max-width: 650px) {
  .post{
    width: inherit;
  }
  .textBanner {
    display: none;
  }
  .podkasts__content,
  .tests__content {
    flex-direction: column;
    gap: 30px;
  }
  .textBanner__text {
    font-size: 22px;
  }
  .line {
    width: 135px;
  }
  .textBanner__text::before {
    display: none;
  }
  .newsPost {
    width: 100%;
  }
  .head {
    flex-direction: column;
    align-items: flex-start;
  }
  .marqueez__content {
    font-size: 22px;
  }
  .materials__body {
    flex-direction: column;
  }
  .material__banner {
    width: 100%;
    height: 148px;
    max-width: none;
  }
  .bannerPhoto{
    min-height: 300px;
  }
  .post .post__content{
    left: 20px;
  }
}
</style>