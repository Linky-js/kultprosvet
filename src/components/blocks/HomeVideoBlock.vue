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
        <div class="home__video-head">
          <div class="head-h1">Видео – учись быстро и интересно!</div>
          <div class="arrows">
            <div class="arrow arrow__prev">
              <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 4H0.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 7.5L0.5 4L4 0.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="arrow arrow__next">
              <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 4H21.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18 7.5L21.5 4L18 0.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        <swiper class="posts" :slidesPerView="'auto'" :spaceBetween="20" @swiper="onSwiper" :modules="modules"
          :navigation="{ nextEl: '.arrow__next', prevEl: '.arrow__prev' }">
          <Swiper-slide class="post" v-for="v in videoPosts" :key="v.id">
            <div class="video">
              <div :id="'btnVBlock' + v.id" class="video__play" @click="togglePlay(v.link)">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M19.1673 9.99755C19.1673 9.13505 18.7257 8.27255 17.8415 7.79171L7.16482 1.98505C5.44565 1.05088 3.33398 2.26755 3.33398 4.19171V9.99755H19.1673Z"
                    fill="#5F22C1" />
                  <path
                    d="M7.16482 18.0125L17.8415 12.2058C18.2423 11.9936 18.5776 11.6761 18.8112 11.2873C19.0449 10.8986 19.168 10.4535 19.1673 10H3.33398V15.8058C3.33398 17.7308 5.44565 18.9467 7.16482 18.0125Z"
                    fill="#5F22C1" />
                </svg>
              </div>
              <img class="poster" :src="apiDomain + 'web/uploads/' + v.poster" alt="" />
            </div>
            <div class="post__content">
              <h3 class="headPost">
                {{ truncate(v.title, 65) }}
              </h3>
              <div class="post__content-list">
                <p>{{ v.category.name }}</p>
                <p>{{ v.theme.name }}</p>
              </div>
            </div>
          </Swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
  <PopupVideo v-if="popupShow" :item="iframe" @closePopup="closePopup" />
</template>
<style scoped>
.arrows {
  display: flex;
  align-items: center;
  gap: 20px;
}

.arrow {
  border: 1px solid #D3D3D3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  transition: .3s all;
}

.arrow path {
  transition: .3s all;
}

.arrow:hover {
  background: #5F22C1;
  border-color: #5F22C1;
}

.arrow:hover path {
  stroke: #fff;
}

.home__video {
  margin-top: 170px;
}

.home__video-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
}

.head-h1 {
  max-width: 550px;
}

.home__video__wrapper {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.posts {
  width: 100%;
  overflow: visible;
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
  line-height: 22px;
  /* 183.333% */
  text-transform: uppercase;
}

.post {
  position: relative;
  width: 530px;
  border-radius: 15px;
}

.post .poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post .video {
  width: 100%;
  position: relative;
  display: flex;
  margin-bottom: 16px;
  height: 345px;
  border-radius: 28px;
  overflow: hidden;
}

.post:hover .video::after {
  background: linear-gradient(180deg, rgba(16, 28, 34, 0) 0%, rgba(16, 28, 34, 0.8) 100%);
}

.video::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  height: 104px;
  transition: .3s all;
  background: linear-gradient(180deg, rgba(16, 28, 34, 0) 0%, rgba(16, 28, 34, 0) 100%);
}

.post__content-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.post__content-list p {
  font-size: 12px;
  line-height: 1;
  font-family: 'Onest';
  font-weight: 600;
  color: #595959;
  background: #F0F0F0;
  padding: 9px 10px;
  border-radius: 50px;
}

.headPost {
  color: #333;
  font-family: Onest;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 120%;
  margin-bottom: 8px;
}


.video__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: #fff;
  border-radius: 50%;
}
.video__play svg {
  position: relative;
  z-index: 1;
}
.video__play::after {
  top: -7px;
  width: 58px;
  height: 58px;
  left: -7px;
  content: '';
  display: inline-block;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 1);
  position: absolute;
  z-index: -1;
}

@media screen and (max-width: 1024px) {
  .arrows {
    display: none;
  }

  .post {
    width: 310px;
  }
  .post .video {
    height: 200px;
    border-radius: 16px;
    margin-bottom: 12px;
  }
  .post .video::after {
    content: none;
  }
  .video__play {
    width: 36px;
    height: 36px;
  }
  .video__play svg {
    width: 16px;
    height: 16px;
  }
  .video__play::after {
    width: 48px;
    height: 48px;
  }

  .head-h1 {
    color: #333;
    font-size: 24px;
    line-height: 110%;
  }
  .headPost {
    font-size: 16px;
    line-height: 120%;
    margin-bottom: 8px;
  }
  .home__video__wrapper {
    gap: 36px;
  }
  .post__content-list p {
    font-size: 11px;
  }
  .home__video {
    margin-top: 100px;
  }
}
</style>