<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import AfishaItem from "../elements/AfishaItem.vue";
import VCalendar from "v-calendar";
import "v-calendar/style.css";
import axios from "axios";

export default {
  name: "AfishaPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    AfishaItem,
    VCalendar,
  },
  data() {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    return {
      local: this.$store.getters.getLocal,

      afisha: [],
      dateRange: null,
      formattedDate: "Выберите дату", // Форматированная дата
      timestamp: null, // Таймштамп
      kategoryes: [
        {
          id: 1,
          name: "Встречи",
          path: "vstrechi",
        },
        {
          id: 2,
          name: "Выставки",
          path: "vystavki",
        },
        {
          id: 3,
          name: "Концерты",
          path: "koncerty",
        },
        {
          id: 4,
          name: "Обучение",
          path: "obuchenie",
        },
        {
          id: 5,
          name: "Спектакли",
          path: "spektakli",
        },
        {
          id: 6,
          name: "Праздники",
          path: "prazdniki",
        },
        {
          id: 7,
          name: "Экскурсии",
          path: "ekskursii",
        },
        {
          id: 8,
          name: "Кино",
          path: "kino",
        },
        {
          id: 9,
          name: "Все",
          path: "prochie",
        },
      ],
      attributes: [
        {
          highlight: true,
          dates: new Date(),
        },
      ],

      disabledDates: [{ start: null, end: yesterday }],
      timestampStart: null,
      timestampEnd: null,
      selectedCategory: null,
      localDataId: null,
      total: 100,
      offset: 0,
      limit: 8,
      flagAddEvents: false,
    };
  },
  
  methods: {    
    getLocalId() {

      let params = `https://pro.culture.ru/api/2.5/locales?&nameQuery=${this.local.city}&apiKey=vj4nqaldqshsgcawd8yw`;
      params = encodeURI(params);
      axios
        .post(
          "https://xn--b1agnepfhjfgc3i.fun/ApiConnector.php",
          {
            requestUrl: params,
            body: {
              nameQuery: encodeURI(this.local.city),
            },
            method: "GET",
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {

          let localData = response.data.locales[0]._id;
          this.localDataId = localData;
          this.flagAddEvents = false;
          this.getAfisha(this.localDataId);
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    async getAfisha(id, dayStart = false, dayEnd = false, cat = false) {
      let params = `https://pro.culture.ru/api/2.5/pushkinsCardEvents?&locales=${id}&apiKey=vj4nqaldqshsgcawd8yw&limit=${this.limit}&offset=${this.offset}`;
      if (dayStart && dayStart != null) {
        params += `&start=${dayStart}`;
      }
      if (dayEnd && dayEnd != null) {
        params += `&end=${dayEnd}`;
      }
      if (cat && cat != null) {
        params += `&categories=${cat}`;
      }
      params = encodeURI(params);
    

      axios
        .post(
          "https://xn--b1agnepfhjfgc3i.fun/ApiConnector.php",
          {
            requestUrl: params,
            body: {
              nameQuery: encodeURI(this.local.city),
            },
            method: "GET",
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          if (!this.flagAddEvents) {
            this.afisha = [];
          }
          for (let e of response.data.events) {
            this.afisha.push(e);
          }

          this.total = response.data.total;
        });
    },
    toggleSort(event) {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        let parent = event.currentTarget;
        let sortText = parent.querySelector(".sort__text");
        let sortRating = parent.querySelector(".sort__rating");

        sortText.classList.toggle("active");
        sortRating.classList.toggle("active");
      } else {
        return;
      }
    },
    enterSort(event) {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        return;
      }
      let parent = event.currentTarget;
      let sortText = parent.querySelector(".sort__text");
      let sortRating = parent.querySelector(".sort__rating");

      sortText.classList.add("active");
      sortRating.classList.add("active");
    },
    leaveSort(event) {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        return;
      }
      let parent = event.currentTarget;
      let sortText = parent.querySelector(".sort__text");
      let sortRating = parent.querySelector(".sort__rating");

      sortText.classList.remove("active");
      sortRating.classList.remove("active");
    },
    handleSortClick(event) {
      let target = event.currentTarget;
      let sortTheme = target.getAttribute("data-sorttheme");
      let text = target.textContent;
      this.selectedCategory = sortTheme || null; // сбрасываем выбранную категорию при смене темы

      let filterText = target
        .closest(".products__sort-rating")
        .querySelector(".sort__text span");
      filterText.textContent = text || "Мероприятия";
      this.flagAddEvents = false;
      this.getAfisha(
        this.localDataId,
        this.timestampStart,
        this.timestampEnd,
        this.selectedCategory
      );
    },
    handleDateChange() {
      if (this.dateRange) {
        const date = new Date(this.dateRange);

        // Форматируем дату в чч.мм.гггг
        this.formattedDate = date
          .toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "."); // В некоторых системах может быть "/"

        // Таймштамп текущей даты
        this.timestamp = date.getTime();

        // Начало дня
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        this.timestampStart = startOfDay.getTime();

        // Конец дня
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        this.timestampEnd = endOfDay.getTime();
        this.getAfisha(
          this.localDataId,
          this.timestampStart,
          this.timestampEnd,
          this.selectedCategory
        );
      }
    },
    getAddEvents() {
      this.offset += this.limit;
      this.flagAddEvents = true;
      this.getAfisha(
        this.localDataId,
        this.timestampStart,
        this.timestampEnd,
        this.selectedCategory
      );
    },
   
  },
  
  mounted() {
    this.getLocalId();
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
        <div class="link__filteres">
          <div
            class="products__sort-rating themesFilter"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div class="sort__text">
              <span>Мероприятия</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.64021 11.7682C9.26936 12.0773 8.73069 12.0773 8.35984 11.7682L2.35984 6.76822C1.93556 6.41466 1.87824 5.78409 2.2318 5.35982C2.58537 4.93554 3.21593 4.87821 3.64021 5.23178L9.00003 9.69829L14.3598 5.23178C14.7841 4.87821 15.4147 4.93554 15.7682 5.35982C16.1218 5.78409 16.0645 6.41466 15.6402 6.76822L9.64021 11.7682Z"
                  fill="#5F22C1"
                />
              </svg>
            </div>
            <div class="sort__rating">
              <div
                v-for="theme in kategoryes"
                :key="theme.id"
                class="sort__rating-item"
                @click="handleSortClick"
                :data-sorttheme="theme.path"
              >
                {{ theme.name }}
              </div>
            </div>
          </div>
          <div
            class="products__sort-rating"
            @mouseover="enterSort"
            @mouseleave="leaveSort"
            @click="toggleSort"
          >
            <div class="sort__text">
              <span>{{ formattedDate }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.64021 11.7682C9.26936 12.0773 8.73069 12.0773 8.35984 11.7682L2.35984 6.76822C1.93556 6.41466 1.87824 5.78409 2.2318 5.35982C2.58537 4.93554 3.21593 4.87821 3.64021 5.23178L9.00003 9.69829L14.3598 5.23178C14.7841 4.87821 15.4147 4.93554 15.7682 5.35982C16.1218 5.78409 16.0645 6.41466 15.6402 6.76822L9.64021 11.7682Z"
                  fill="#5F22C1"
                />
              </svg>
            </div>
            <div class="sort__rating calendar">
              <VDatePicker
                class="datepicker"
                v-model="dateRange"
                :attributes="attributes"
                :disabled-dates="disabledDates"
                :columns="1"
                :is-range="false"
                @click:outside="isCalendarVisible = false"
                @update:model-value="handleDateChange"
              />
              <VCalendar />
            </div>
          </div>
        </div>
        <div class="afisha__items">
          <AfishaItem v-for="item of afisha" :key="item.id" :item="item" />
        </div>
        <a
          v-if="afisha.length < total"
          @click="getAddEvents"
          class="get__addNews"
        >
          Больше событий
        </a>
      </div>
      
    </div>
  </div>
  <FooterBlock />
</template>
<style scoped>
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
.datepicker {
  width: 100%;
}
.afisha__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.afisha__items {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  justify-content: center;
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
.products__sort-rating {
  position: relative;
  width: 243px;
  height: max-content;
}
.calendar {
  width: max-content;
}
@media screen and (max-width: 1024px) {
  .afisha__content {
    flex-direction: column;
  }
}
</style>