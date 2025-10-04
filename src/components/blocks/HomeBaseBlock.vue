<script>
import PodkastMini from "../elements/PodkastMini.vue";
import PopupVideo from "../elements/PopupVideo.vue";
import { myMixin2 } from "@/mixin";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

export default {
  name: "HomeBaseBlock",
  components: {
    PodkastMini,
    PopupVideo,
    Swiper,
    SwiperSlide,
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
  mixins: [myMixin2],
  data() {
    return {
      lastItems: [],
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      popupShow: false,
      iframe: null,
    };
  },
  methods: {
    getContent() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=7&limit=1"
        )
        .then((response) => {
          let item = response.data.news[0];
          item.item = "news";
          item.order = 0;
          this.lastItems.push(item);

        })
        .catch((error) => {
          console.log(error);
        });

      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=1&limit=1"
        )
        .then((response) => {
          let item = response.data.news[0];
          item.item = "news";
          item.order = 1;
          this.lastItems.push(item);
          
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
          let item = response.data.podcasts[0];
          item.item = "podkast";
          item.order = 2;
          this.lastItems.push(response.data.podcasts[0]);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=2&limit=1"
        )
        .then((response) => {
          let item = response.data.news[0];
          item.item = "news";
          item.order = 3;
          this.lastItems.push(item);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl + "api-video/get-list/" + authGet + "&theme_id=1&limit=1"
        )
        .then((response) => {
          let item = response.data.videos[0];
          item.item = "video";
          item.order = 4;
          this.lastItems.push(item);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=3&limit=1"
        )
        .then((response) => {
          let item = response.data.news[0];
          item.item = "news";
          item.order = 5;
          this.lastItems.push(item);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=4&limit=1"
        )
        .then((response) => {
          let item = response.data.news[0];
          item.item = "news";
          item.order = 6;
          this.lastItems.push(item);
        })
        .catch((error) => {
          console.log(error);
        });
      axios
        .get(
          this.apiUrl + "api-news/get-list/" + authGet + "&theme_id=10&limit=1"
        )
        .then((response) => {
          let item = response.data.news[0];
          item.item = "news";
          item.order = 7;
          this.lastItems.push(item);
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
  },
  mounted() {
    this.getContent();
  },
};
</script>

<template>
  <div class="home__base mBlock">
    <div class="container">
      <div class="home__base__content">
        <div class="head-h2">База знаний</div>
        <div class="home__base--items">
          <div
            v-for="i in lastItems"
            :key="i.id"
            class="home__base--itemWrapper"
            :class="'order' + i.order"
          >
            <div v-if="i.item == 'podkast'" class="plast">
              <div class="photo">
                <img src="@/assets/image/menColor.png" alt="" />
              </div>
              <PodkastMini
                class="podkastMini"
                :color="getThemeClass(i.theme.name)"
                :theme="i"
              ></PodkastMini>
            </div>
            <div v-else-if="i.item == 'video'" class="video home__base--item">
              <img
                class="home__base--video__img"
                :src="apiDomain + 'web/uploads/' + i.poster"
                alt=""
              />
              <div class="date">{{ i.date }}</div>
              <div class="home__base--item__text">
                <a @click="togglePlay(i.link)" class="linkPlay">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M23 12C23 10.965 22.47 9.93 21.409 9.353L8.597 2.385C6.534 1.264 4 2.724 4 5.033V12H23Z"
                      fill="#5F22C1"
                    />
                    <path
                      d="M8.597 21.615L21.409 14.647C21.89 14.3924 22.2923 14.0113 22.5727 13.5448C22.8531 13.0784 23.0008 12.5442 23 12H4V18.967C4 21.277 6.534 22.736 8.597 21.615Z"
                      fill="#5F22C1"
                    />
                  </svg>
                </a>
                <div class="title">{{ i.title }}</div>
              </div>
            </div>
            <div
              v-else-if="i.order === 6"
              class="plast2"
              :class="getThemeClass(i.theme.name)"
            >
              <div class="photo2">
                <img src="@/assets/image/womenColor.png" alt="" />
              </div>
              <div
                class="home__base--item"
                :class="[getThemeClass(i.theme.name), getItemClass(i.item)]"
              >
                <div class="date">{{ i.date }}</div>
                <div class="home__base--item__text">
                  <div class="title">{{ i.title }}</div>
                  <div class="subtitle">{{ i.subtitle }}</div>
                  <router-link :to="'/post/' + i.id" class="link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="43"
                      height="42"
                      viewBox="0 0 43 42"
                      fill="none"
                    >
                      <path
                        d="M5.75 21H37.25"
                        stroke="#42AD6F"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M32 26.25L37.25 21L32 15.75"
                        stroke="#42AD6F"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </router-link>
                </div>
              </div>
            </div>
            <div
              v-else
              class="home__base--item"
              :class="[getThemeClass(i.theme.name), getItemClass(i.item)]"
            >
              <div class="date">{{ i.date }}</div>
              <div class="home__base--item__text">
                <div class="title">{{ i.title || i.audio?.name }}</div>
                <div v-if="i.subtitle" class="subtitle">{{ i.subtitle }}</div>
                <router-link
                  v-if="i.item == 'test'"
                  :to="i.link"
                  class="linkTest"
                >
                  Пройти
                </router-link>
                <router-link v-else :to="'/post/' + i.id" class="link">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="43"
                    height="42"
                    viewBox="0 0 43 42"
                    fill="none"
                  >
                    <path
                      d="M5.75 21H37.25"
                      stroke="#42AD6F"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M32 26.25L37.25 21L32 15.75"
                      stroke="#42AD6F"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <swiper
          class="home__base--itemsMobile"
          :slidesPerView="1"
          :spaceBetween="20"
          :loop="true"
          :modules="modules"
          :navigation="{
            enabled: true,
            prevEl: '.arrow-prev',
            nextEl: '.arrow-next',
          }"
          @swiper="onSwiper"
        >
          <swiper-slide
            v-for="i in lastItems"
            :key="i.id"
            class="home__base--itemWrapper"
          >
            <div v-if="i.item == 'podkast'" class="plast">
              <div class="photo">
                <img src="@/assets/image/menColor.png" alt="" />
              </div>
              <PodkastMini
                class="podkastMini"
                :color="getThemeClass(i.theme.name)"
                :theme="i"
              ></PodkastMini>
            </div>
            <div v-else-if="i.item == 'video'" class="video home__base--item">
              <img
                class="home__base--video__img"
                :src="apiDomain + 'web/uploads/' + i.poster"
                alt=""
              />
              <div class="date">{{ i.date }}</div>
              <div class="home__base--item__text">
                <a @click="togglePlay(i.link)" class="linkPlay">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M23 12C23 10.965 22.47 9.93 21.409 9.353L8.597 2.385C6.534 1.264 4 2.724 4 5.033V12H23Z"
                      fill="#5F22C1"
                    />
                    <path
                      d="M8.597 21.615L21.409 14.647C21.89 14.3924 22.2923 14.0113 22.5727 13.5448C22.8531 13.0784 23.0008 12.5442 23 12H4V18.967C4 21.277 6.534 22.736 8.597 21.615Z"
                      fill="#5F22C1"
                    />
                  </svg>
                </a>
                <div class="title">{{ i.title }}</div>
              </div>
            </div>
            <div
              v-else-if="i.order === 6"
              class="plast2"
              :class="getThemeClass(i.theme.name)"
            >
              <div class="photo2">
                <img src="@/assets/image/womenColor.png" alt="" />
              </div>
              <div
                class="home__base--item"
                :class="[getThemeClass(i.theme.name), getItemClass(i.item)]"
              >
                <div class="date">{{ i.date }}</div>
                <div class="home__base--item__text">
                  <div class="title">{{ i.title }}</div>
                  <div class="subtitle">{{ i.subtitle }}</div>
                  <router-link to="/base/1" class="link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="43"
                      height="42"
                      viewBox="0 0 43 42"
                      fill="none"
                    >
                      <path
                        d="M5.75 21H37.25"
                        stroke="#42AD6F"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M32 26.25L37.25 21L32 15.75"
                        stroke="#42AD6F"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </router-link>
                </div>
              </div>
            </div>
            <div
              v-else
              class="home__base--item"
              :class="[getThemeClass(i.theme.name), getItemClass(i.item)]"
            >
              <div class="date">{{ i.date }}</div>
              <div class="home__base--item__text">
                <div class="title">{{ i.title || i.audio?.name }}</div>
                <div v-if="i.subtitle" class="subtitle">{{ i.subtitle }}</div>
                <router-link
                  v-if="i.item == 'test'"
                  :to="i.link"
                  class="linkTest"
                >
                  Пройти
                </router-link>
                <router-link v-else :to="'/post/' + i.id" class="link">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="43"
                    height="42"
                    viewBox="0 0 43 42"
                    fill="none"
                  >
                    <path
                      d="M5.75 21H37.25"
                      stroke="#42AD6F"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M32 26.25L37.25 21L32 15.75"
                      stroke="#42AD6F"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
</template>
<style scoped>
.home__base__content {
  display: flex;
  flex-direction: column;
  gap: 59px;
}
.home__base--items {
  display: flex;
  flex-wrap: wrap;
}
.home__base--itemWrapper {
  width: 100%;
  height: max-content;
  overflow: hidden;
}
.home__base--itemsMobile {
  display: none;
}
.home__base--itemWrapper.order0 {
  order: 0;
}
.home__base--itemWrapper.order1 {
  order: 1;
}
.home__base--itemWrapper.order2 {
  order: 2;
}
.home__base--itemWrapper.order3 {
  order: 3;
}
.home__base--itemWrapper.order4 {
  order: 4;
}
.home__base--itemWrapper.order5 {
  order: 5;
}
.home__base--itemWrapper.order6 {
  order: 6;
}
.home__base--itemWrapper.order7 {
  order: 7;
}
.home__base--itemWrapper.order8 {
  order: 8;
}
.home__base--itemWrapper.order9 {
  order: 9;
}
.home__base--itemWrapper:has(.art) {
  max-width: 22.307%;
}
.home__base--itemWrapper:has(.lifestyle) {
  max-width: 38.46%;
}
.home__base--itemWrapper:has(.science) {
  max-width: 28.03%;
}
.home__base--itemWrapper.order4 {
  max-width: 25.64%;
}
.home__base--itemWrapper:has(.literature) {
  max-width: 46.32%;
}
.home__base--itemWrapper:has(.moda) {
  max-width: 39.23%;
}
.home__base--itemWrapper:has(.plast2) {
  max-width: 60.769%;
}
.home__base--item {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  height: 306px;
  justify-content: space-between;
  position: relative;
  width: 100%;
}
.home__base--item.video {
  background: none;
  color: #fff;
}
.home__base--video__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

.home__base--item.art {
  background: #fcfdf5;
  color: #707c1d;
  stroke: #42ad6f;
}
.home__base--item.lifestyle {
  background: #439563;
  color: #fff;
}
.home__base--item.lifestyle path {
  stroke: #fff;
}

.home__base--item.music {
  background: #5f22c1;
  color: #fff;
}
.home__base--item.music path {
  stroke: #f092f9;
}
.home__base--item.moda {
  background: #f092f9;
  color: #fff;
}
.home__base--item.moda path {
  stroke: #5e2563;
}

.music .date {
  color: #f092f9;
}
.literature .date {
  color: #f9db4a;
}
.science .date {
  color: #67e2e1;
}
.moda .date {
  color: #5e2563;
}
.home__base--item.literature {
  background: #ef8933;
  color: #fff;
}
.home__base--item.science {
  background: #2971eb;
  color: #fff;
}
.home__base--item.science path {
  stroke: #fff;
}
.home__base--item .date {
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.video .home__base--item__text {
  margin-bottom: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.home__base--item__text {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.video .title {
  text-align: center;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.32px;
  max-width: 164px;
}
.title {
  font-family: Onest;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px; /* 116.667% */
  letter-spacing: -0.48px;
}
.subtitle {
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 291px;
}
.plast {
  height: 306px;
  width: 100%;
  display: flex;
  flex-shrink: 0;
}
.photo {
  background: #ffc32a;
  width: 50%;
}
.photo2 {
  width: 252px;
  flex-shrink: 0;
  background: #ef8933;
}
.photo img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
}
.home__base--itemWrapper:has(.plast) {
  max-width: 39.23%;
}
.podkastMini {
  width: 50%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  max-width: none;
}
.linkPlay {
  background: #fff;
  border-radius: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  width: 50px;
  height: 50px;
  cursor: pointer;
}
.linkPlay svg {
    transition: 0.3s;
}
.linkPlay:hover svg {
    transform: scale(1.2);
}
.linkTest {
  color: #626262;
  text-align: center;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 128.571% */
  border-radius: 90px;
  background: #f9db4a;
  padding: 8px 15px;
  width: max-content;
  min-width: 111px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 12px;
}
.plast2 {
  width: 100%;
  display: flex;
  flex-shrink: 0;
  height: 306px;
}
.photo2 img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
}
@media screen and (max-width: 1024px) {
  .home__base--items {
    display: none;
  }
  .home__base--itemsMobile {
    display: block;
    width: 100%;
  }
  .photo2{
    display: none;
  }
  .home__base--itemWrapper {
    max-width: 50% !important;
  }
  .photo2 {
    width: 100%;
  }
  .plast2 {
    flex-direction: column-reverse;
  }
}
@media screen and (max-width: 600px) {
  .home__base--itemWrapper {
    max-width: none !important;
  }
  .title {
    font-size: 20px;
  }
}
.link svg {
  transition: all 0.3s;
}
.link:hover svg {
  transform: scale(1.2);
}
</style>