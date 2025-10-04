<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import PodkastMini from "../elements/PodkastMini.vue";
import PodkastItemToPage from "../elements/PodkastItemToPage.vue";
import PopupVideo from "../elements/PopupVideo.vue";
import axios from "axios";
export default {
  name: "HomeThemBlock",
  components: {
    Swiper,
    SwiperSlide,
    PodkastMini,
    PopupVideo,
    PodkastItemToPage,
  },
  setup() {
    const swiperActiveIndex = 0; // начальный активный индекс
    const onSwiper3 = (swiper) => {
      console.log(swiper.activeIndex);
    };
    return {
      onSwiper3,
      swiperActiveIndex,
      modules: [Navigation, Pagination, Scrollbar, A11y],
    };
  },
  data() {
    return {
      theme: {
        name: "Лайф менеджмент",
        video: [],
        audio: null,

        lastPost: {},
      },
      bars: Array(20).fill({ height: 10, active: false }), // Массив для визуализации
      intervalId: null,
      isPlaying: false,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      iframe: null,
      popupShow: false,
    };
  },
  methods: {
    getContent() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=1&limit=1"
        )
        .then((response) => {
          this.theme.lastPost = response.data.news[0];
        })
        .catch((error) => {
          console.log(error);
        });

      axios
        .get(
          this.apiUrl + "api-video/get-list/" + authGet + "&theme_id=1&limit=3"
        )
        .then((response) => {
          this.theme.video = response.data.videos;
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl +
            "api-podcast/get-list/" +
            authGet +
            "&theme_id=1&limit=1"
        )
        .then((response) => {
          this.theme.audio = response.data.podcasts[0];
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
    updateProgress(id) {
      const audio = document.getElementById(id);
      const progress = (audio.currentTime / audio.duration) * this.bars.length;
      this.bars.forEach((bar, index) => {
        if (index < progress) {
          bar.active = true;
        } else {
          bar.active = false;
        }
      });
    },
    startVisualization() {
      if (this.intervalId) return;
      this.intervalId = setInterval(() => {
        this.bars = this.bars.map((bar) => {
          const randomHeight = Math.floor(Math.random() * 10) + 10;
          return {
            ...bar,
            height: randomHeight,
          };
        });
      }, 100);
    },
    pauseVisualization() {
      clearInterval(this.intervalId);
      this.intervalId = null;
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
};
</script>

<template>
  <div class="theme mBlock">
    <div class="container">
      <div class="theme__content">
        <h2 class="head-h2">Лайф менеджмент</h2>
        <div class="theme__wrapper">
          <div class="theme__slider">
            <swiper
              class="theme__swiper"
              :slidesPerView="1"
              :spaceBetween="20"
              :modules="modules"
              :navigation="{
                enabled: true,
                prevEl: '.prevSlide',
                nextEl: '.nextSlide',
              }"
            >
              <swiper-slide
                class="theme__item"
                v-for="v in theme.video"
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
                {{ truncate(v.title, 54) }}
              </h3>
              <p class="sub-headPost">
                {{ v.text }}
              </p>
            </div>
              </swiper-slide>
            </swiper>
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
          <PodkastMini class="podkastDesktop" v-if="theme.audio" :theme="theme.audio"></PodkastMini>
          <PodkastItemToPage class="podkastMobile" v-if="theme.audio" :item="theme.audio"></PodkastItemToPage>
          <div class="posts">
            <div class="theme__last-post">
              <div class="theme__last-post__content">
                <p class="last-post__date">{{ theme.lastPost.date }}</p>
                <h3 class="headPost">
                  {{ theme.lastPost.title }}
                </h3>
                <p class="sub-headPost">
                  {{ theme.lastPost.short_text }}
                </p>
                <router-link :to="'post/' + theme.lastPost.id">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="42"
                    height="42"
                    viewBox="0 0 42 42"
                    fill="none"
                  >
                    <path
                      d="M5.25 21H36.75"
                      stroke="white"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M31.5 26.25L36.75 21L31.5 15.75"
                      stroke="white"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
            <router-link class="btn-opacity" :to="'/news'"
              >Больше статей
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
    </div>
  </div>
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
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
.theme__content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.theme__wrapper {
  display: flex;
  justify-content: center;
}
.theme__slider {
  max-width: 42.73%;
  width: 100%;
  height: max-content;
}
.theme__swiper {
  width: 100%;
  height: 100%;
}
.theme__item {
  width: 100%;
  height: max-content;
  position: relative;
}
.theme__item .post__content {
  position: absolute;
  left: 44px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2;
}
.video {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}
.kategory {
  border-bottom: 1px solid #b9b9b9;
  width: 100%;
  max-width: 322px;
  padding-bottom: 10px;
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
.theme__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.theme__podkast {
  width: 100%;
  max-width: 21.88%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 40px 20px 20px;
  height: 390px;
  background: #333;
  gap: 18px;
}
.audio__head {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.32px;
}
.audio__visualization {
  display: flex;
  align-items: flex-end;
  height: 24px; /* Высота контейнера для палочек */
  margin-top: 10px;
}

.audio__bar {
  width: 4px;
  margin: 0 2px;
  background-color: #8b8b8b;
  transition: background-color 0.2s, height 0.25s;
}

.audio__bar--active {
  background-color: #439563;
}
.theme__audio {
  display: none;
  visibility: hidden;
}
.btn__playAudio {
  border-radius: 90px;
  background: #39945d;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  width: 50px;
  height: 50px;
  cursor: pointer;
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
}
.posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.theme__last-post {
  background: #39945d;
  padding: 25px 0 16px 20px;

  height: 280px;
}
.theme__last-post svg{
  transition: all 0.3s;
}
.theme__last-post svg:hover{
  transform: scale(1.2);
}
.theme__last-post__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 7px;
  height: 100%;
}
.posts .btn-opacity {
  align-self: flex-end;
}
.last-post__date {
  color: var(--Neutral-100, #fff);

  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.linksSlide {
  margin-left: auto;
  margin-right: 20px;
  width: max-content;
}
.linksSlide .nextSlide{
  transition: all 0.3s;
}
.linksSlide .nextSlide:hover{
  transform: scale(1.2);
}
.linksSlide .prevSlide{
  transition: all 0.3s;
}
.linksSlide .prevSlide:hover{
  transform: scale(1.2);
}
.podkastMobile {
  display: none;
}
@media screen and (max-width: 1024px) {
  .podkastDesktop{
    display: none;
  }
  .podkastMobile{
    display: block;
  }
  .theme__wrapper {
    flex-direction: column;
    gap: 10px;
  }
  .theme__podkast {
    max-width: 250px;
  }
  .theme__slider {
    max-width: 100%;
  }
  .video{
    height: 206px;
  }
  .theme__slider {
    height: calc(206px + 42px);
  }
  .theme__swiper{
    height: 206px;
  }
  .theme__item .post__content{
    left: 20px;
  }
}
</style>