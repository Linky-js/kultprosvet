<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import PdfViewer from "../elements/PdfViewer.vue";
import axios from "axios";
export default {
  name: "LibraryPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    SubscribeBlock,
    PdfViewer,
  },
  data() {
    return {
      book: {},
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      bookFlag: false,
    };
  },
  methods: {
    getBook() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(
          this.apiUrl +
            "api-book/get" +
            authGet +
            `&id=${this.$route.params.id}`
        )
        .then((response) => {
          this.book = response.data.book;
        
          this.bookFlag = true;
        })
        .catch((error) => {
          console.log(error);
        });
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
    this.getBook();
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[
      { name: 'Библиотека', link: '/library' },
      { name: book.title, link: '' },
    ]"
    :bannerHead="{ name: 'book', uniq: false }"
    :title="book.title"
  />
  <div class="library mBlock">
    <div class="container">
     
      <div class="library__content">
        <PdfViewer v-if="bookFlag" :pdfFile="apiDomain + 'web/uploads/' + book.link" />
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
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
.library__content{
  display: flex;
  justify-content: center;
}
</style>