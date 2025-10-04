<script>
import gsap from "gsap";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import ScrollTrigger from "gsap/ScrollTrigger";
import axios from "axios";

import PopupVideo from "../elements/PopupVideo.vue";
export default {
  name: "HomeVideoBlock",
  components: {
    PopupVideo,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      videoPosts: [],
      isPlaying: false,
      timeline: null,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      iframe: null,
      popupShow: false,
      displayCount: 4,
    };
  },
  methods: {
    getContent() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;

      axios
        .get(this.apiUrl + "api-video/get-list/" + authGet + "&limit=5")
        .then((response) => {
          this.videoPosts = response.data.videos;
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
    gsap.registerPlugin(ScrollTrigger);
    this.timeline = gsap.timeline();
    let posts = document.querySelectorAll(".post__content");
    posts.forEach((post) => {
      this.timeline.fromTo(
        post,
        { y: "50%", opacity: 0.2 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: post,
            start: "top bottom",
            end: "+=200",
            scrub: 2,
          },
        }
      );
    });
    const script = document.createElement("script");
    script.src = "https://vk.com/js/api/videoplayer.js";
    document.head.appendChild(script);
  },
};
</script>

<template>
  <div class="home__video mBlock">
    <div class="container">
      <div class="home__video__wrapper">
        <div class="head-h1">Видео – учись быстро и интересно!</div>
        <swiper
          class="posts"
          :slidesPerView="'auto'"
          :spaceBetween="20"
          @swiper="onSwiper"
        >
          <Swiper-slide class="post" v-for="v in videoPosts" :key="v.id">
            <div class="video">
              <div
                :id="'btnVBlock' + v.id"
                class="btn__playVideo"
                @click="togglePlay(v.link)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                >
                  <circle
                    data-figma-bg-blur-radius="20"
                    cx="30"
                    cy="30"
                    r="30"
                    fill="#D9D9D9"
                    fill-opacity="0.1"
                  />
                  <path
                    d="M36.25 28.0341C37.5833 28.8039 37.5833 30.7284 36.25 31.4982L28 36.2613C26.6667 37.0311 25 36.0689 25 34.5293L25 25.003C25 23.4634 26.6667 22.5011 28 23.2709L36.25 28.0341Z"
                    fill="#D9D9D9"
                  />
                  <defs>
                    <clipPath
                      id="bgblur_0_5071_1844_clip_path"
                      transform="translate(20 20)"
                    >
                      <circle cx="30" cy="30" r="30" />
                    </clipPath>
                  </defs>
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
                {{ truncate(v.title, 65) }}
              </h3>
              <p class="sub-headPost">
                {{ v.description }}
              </p>
            </div>
          </Swiper-slide>
        </swiper>
      </div>
      <router-link class="btn-opacity" :to="'/videos'"
        >Больше видео
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
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
</template>
<style scoped>
.home__video {
  margin-top: 170px;
}
.head-h1 {
  max-width: 550px;
}
.home__video__wrapper {
  display: flex;
  flex-direction: column;
  gap: 62px;
}

.posts {
  width: 100%;
}
.btn-opacity {
  margin-left: auto;
}
.description-category {
  color: #fff;
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px; /* 183.333% */
  text-transform: uppercase;
}
.post {
  position: relative;
  width: 640px;
  height: 400px;
  border-radius: 15px;
  overflow: hidden;
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
  gap: 8px;
  z-index: 2;
}

.headPost {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  max-width: 332px;
}
.sub-headPost {
  color: var(--Neutral-100, #fff);
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 366px;
}
.btn__playVideo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn__playVideo {
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
.post:nth-of-type(3) .kategory span,
.post:nth-of-type(4) .kategory span {
  color: var(--383838, #a2a2a2);
}
@media screen and (max-width: 1024px) {
  .posts {
    display: flex;
    flex-direction: column;
  }
  .post .video {
    max-height: none !important;
  }
  .post {
    width: 350px;
    height: 220px;
  }
  .post .post__content {
    left: 20px;
  }
  .head-h1 {
    color: #333;
    text-align: center;
    font-family: Onest;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: 110%; /* 26.4px */
    letter-spacing: -0.48px;
  }
  .home__video__wrapper {
    gap: 35px;
  }
  .home__video{
    margin-top: 100px;
  }
}
</style>