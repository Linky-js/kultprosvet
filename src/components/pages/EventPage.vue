<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import AfishaItem from "../elements/AfishaItem.vue";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

export default {
  name: "EventPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    AfishaItem,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      event: this.$route.params.id,
      eventObj: null,
      similarEvents: [],
    };
  },
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
  methods: {
    async getEvent() {
      let event = this.$route.params.id;
      let params = `https://pro.culture.ru/api/2.5/pushkinsCardEvents/${event}?apiKey=vj4nqaldqshsgcawd8yw`;
      params = encodeURI(params);
      
      try {
        const response = await axios.post(
          "https://xn--b1agnepfhjfgc3i.fun/ApiConnector.php",
          {
            requestUrl: params,
            method: "GET",
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.eventObj = response.data.event;
        this.getSimilarEvents(this.eventObj.category.sysName);
      } catch (error) {
        console.log(error);
      }
    },
    async getSimilarEvents(cat) {
      let params = `https://pro.culture.ru/api/2.5/pushkinsCardEvents?&categories=${cat}&apiKey=vj4nqaldqshsgcawd8yw&limit=10&offset=0`;
      params = encodeURI(params);
    
      try {
        const response = await axios.post(
          "https://xn--b1agnepfhjfgc3i.fun/ApiConnector.php",
          {
            requestUrl: params,
            method: "GET",
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.similarEvents = response.data.events;
      } catch (error) {
        console.log(error);
      }
    },
    timeUpdate(seconds) {
      if (!seconds) return ""; // Проверяем, что значение существует
      const date = new Date(seconds); // Конвертируем секунды в миллисекунды
      const day = String(date.getDate()).padStart(2, "0"); // Добавляем ведущий ноль
      let month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
      const monthNames = [
        "янв",
        "фев",
        "мар",
        "апр",
        "май",
        "июн",
        "июл",
        "авг",
        "сен",
        "окт",
        "ноя",
        "дек",
      ]; // Массив с названиями месяцев
      month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    },
    formatDescription(description) {
      // Убираем HTML-теги с помощью регулярного выражения
      const text = description
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Ограничиваем длину строки до 23 символов
      return text;
    },
    updateColorBar() {
      let spans = document.querySelectorAll(
        ".swiper-pagination-progressbar-fill"
      );
      spans.forEach((span) => {
        span.style.backgroundColor = "rgb(57, 148, 93)";
      });
    },
  },
  computed: {
    getThemeId() {
      return this.$route.params.id;
    },
  },
  watch: {
    getThemeId() {
      this.getEvent();
    },
  },

  mounted() {
    this.getEvent();
  },
};
</script>
<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[{ name: 'Афиша', link: '/afisha' }]"
    :title="'Афиша'"
    :bannerHead="{ name: 'afisha', uniq: false }"
  />
  <div class="afisha mBlock">
    <div class="container">
      <div class="afisha__content">
        <div
          class="event__head"
          :style="{
            backgroundImage:
              'url(https://pro.culture.ru/uploads/' +
              eventObj?.image.name +
              ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        >
          <div class="item__content">
            <div class="date">
              {{ timeUpdate(eventObj?.start) }} -
              {{ timeUpdate(eventObj?.end) }}
            </div>
            <div class="category">{{ eventObj?.category.name }}</div>
            <div class="title">
              {{ eventObj?.name }}
            </div>
          </div>
        </div>
        <div class="event__content">
            <div class="head-h2">Описание</div>
          <div v-if="eventObj?.description" class="description">
            {{ formatDescription(eventObj?.description) }}
          </div>
        </div>
        <div v-if="similarEvents.length > 0" class="similar__events">
          
            <div class="videos__content">
              <div class="head">
                <div class="head-h2">Другие мероприятия</div>
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
                :loop="true"
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
                <swiper-slide
                  class="post"
                  v-for="item in similarEvents"
                  :key="item.id"
                >
                  <AfishaItem :item="item" />
                </swiper-slide>
              </Swiper>
            </div>
          
        </div>
      </div>
    </div>
  </div>
  <FooterBlock />
</template>
<style scoped>
.afisha__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.event__head {
  width: 100%;
  height: 388px;
  flex-shrink: 0;
}
.item__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 7px;
  height: 100%;
  padding: 20px 20px 0 20px;
  background: linear-gradient(180deg, rgba(102, 102, 102, 0) 0%, #000 100%);
}
.event__content{
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.videos__items {
  display: flex;

  gap: 22px;
  padding: 30px 0;
}
.post {
  position: relative;
  width: 324px;
  height: 290px;
  flex-shrink: 0;
}
.date {
  color: #fff;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-bottom: auto;
}
.title {
  color: #fff;
  font-family: Onest;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: 36px; /* 112.5% */
  letter-spacing: -0.64px;
  max-width: 546px;
  margin-bottom: 83px;
}
.category {
  color: #d4d4d4;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 24px */
  letter-spacing: 0.3px;
  border-radius: 8px;
  background: rgba(130, 130, 130, 0.4);
  padding: 8px;
  width: max-content;
}
@media screen and (max-width: 650px) {
    .title {
      font-size: 24px;
    }
}
</style>