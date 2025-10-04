<script>
import axios from "axios";
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import PodkastItemToPage from "../elements/PodkastItemToPage.vue";

export default {
  name: "PodkastPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    SubscribeBlock,
    PodkastItemToPage,
  },

  data() {
    return {
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      relatedNews: [],
      post: {},
      crumbsShow: false,
    };
  },
  computed: {
    getThemeId() {
      return this.$route.params.id;
    },
  },
  methods: {
    getPost() {
      this.postId = this.getThemeId;
      let params = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-podcast/get" + params + "&id=" + this.postId)
        .then((response) => {
          this.post = response.data.podcast;

          this.crumbsShow = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    formatDate(timestamp) {
      const date = new Date(timestamp * 1000); // Умножаем на 1000, если timestamp в секундах
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    },
    async copyUrl(event) {
      try {
        const el = event.currentTarget;

        // Проверяем, доступен ли метод share
        if (navigator.share) {
          await navigator.share({
            title: document.title,
            text: window.location.href,
            url: window.location.href,
          });
        } else {
          // Копирование ссылки в буфер обмена для десктопов или неподдерживаемых устройств
          const url = window.location.href;
          await navigator.clipboard.writeText(url);
          el.classList.add("active");

          setTimeout(() => {
            el.classList.remove("active");
          }, 1000);
        }
      } catch (err) {
        console.error("Ошибка копирования/разделения: ", err);
      }
    },
  },
  mounted() {
    this.getPost();
  },
  watch: {
    getThemeId() {
      this.getPost();
    },
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    v-if="crumbsShow"
    :page="[
      { name: 'Подкасты', link: 'podcasts' },
      { name: post?.title, link: '' },
    ]"
    :title="post.title"
    :bannerHead="{ name: 'post', uniq: false }"
  />

  <div class="post mBlock">
    <div class="container">
      
      <div class="post__content">
        <div class="head-h2">
          {{ post?.title }}
        </div>
       
        <div id="post" class="post__text">
          {{ post?.description }}
        </div>
        <PodkastItemToPage
          :item="post"
        />
      </div>
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
    </div>
  </div>
  <subscribe-block />
  <FooterBlock />
</template>

<style scoped>
.post__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  margin-bottom: 90px;
}
.post__content img {
  width: 100%;
  max-width: 670px;
}
.post__content p {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.news__item {
  max-width: 373px;
}
.swiper-slide {
  width: max-content;
}
.relatedPosts {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.swiper {
  width: 100%;
}
.post__text {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 670px;
}
.slide {
  width: -moz-max-content;
  width: max-content;
  height: auto;
}
@media screen and (max-width: 1024px) {
  .swiper-slide {
    width: inherit;
  }
}
</style>