<script setup>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import BloggerBanner from "../elements/BloggerBanner.vue";
import PopupVideo from "../elements/PopupVideo.vue";
import { ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";

const blogger = ref({});
const store = useStore();
const router = useRouter();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;
const apiDomain = store.getters.getApiDomain;
const videos = ref([]);
const popupShow = ref(false);
const iframe = ref(null);

const getBlogger = () => {
  const id = router.currentRoute.value.params.id;
  const authGet = `&auth=${user.username}:${user.auth_key}&id=${id}`;
  axios
    .get(apiUrl + "/api-blogger/get" + authGet)
    .then((response) => {
      blogger.value = response.data.blogger;
      getVideos(blogger.value.id);
    })
    .catch((error) => {
      console.log(error);
    });
};
const getVideos = (id) => {
  const authGet = `&auth=${user.username}:${user.auth_key}&blogger_id=${id}`;
  axios
    .get(apiUrl + "/api-video/get-list" + authGet)
    .then((response) => {
      console.log(response.data.videos);

      videos.value = response.data.videos;
    })
    .catch((error) => {
      console.log(error);
    });
};
const togglePlay = (link) => {
  popupShow.value = true;
  iframe.value = link;
};
const truncate = (text, maxLength) => {
  let mobile = window.innerWidth < 1024;
  if (mobile) {
    maxLength = 28;
  }
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
const copyUrl = (event) => {
  const url = window.location.href;
  const el = event.currentTarget;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      el.classList.add("active");

      setTimeout(() => {
        el.classList.remove("active");
      }, 1000);
    })
    .catch((err) => {
      console.error("Ошибка копирования: ", err);
    });
};

// Вызов функции при первом монтаже компонента
onMounted(() => {
  getBlogger();
});

// Наблюдение за изменением параметра id в маршруте
watch(
  () => router.currentRoute.value.params.id,
  (newId) => {
    if (newId) {
      getBlogger();
    }
  }
);
</script>

<template>
  <HeaderBlock />

  <Breadcrumbs
    :page="[{ name: 'Видео', link: '/videos' }]"
    :title="'Видео'"
    :bannerHead="{ name: 'videos', uniq: false }"
  />
  <div class="videos mBlock">
    <div class="container">
      <a @click="copyUrl" class="desc__share">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M16.4405 8.89999C20.0405 9.20999 21.5105 11.06 21.5105 15.11V15.24C21.5105 19.71 19.7205 21.5 15.2505 21.5H8.74047C4.27047 21.5 2.48047 19.71 2.48047 15.24V15.11C2.48047 11.09 3.93047 9.23999 7.47047 8.90999"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g opacity="0.4">
            <path
              d="M12 15.0001V3.62012"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.3504 5.85L12.0004 2.5L8.65039 5.85"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>

        <span>Поделиться</span>
      </a>
      <div class="videos__content">
        <BloggerBanner :key="blogger.id" :item="blogger" />

        <div class="videos__items">
          <div class="post" v-for="v in videos" :key="v.id">
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
          </div>
        </div>
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
  color: #5f22c1;
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
  margin: 0 auto;
  margin-top: 23px;
  transition: all 0.3s;
}
.get__addNews:hover {
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
  .link__filteres {
    flex-direction: column;
  }
  .videos__items {
    flex-direction: column;
  }
  .videos__items .post {
    width: 100%;
  }
  .post .post__content {
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
  .products__sort-rating {
    width: 100%;
  }
}
</style>