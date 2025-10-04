<script>
export default {
  name: "PostMini",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  methods: {
    formatDate(timestamp) {
      const date = new Date(timestamp * 1000); // Умножаем на 1000, если timestamp в секундах
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    },
  },
  
};
</script>
<template>
  <router-link :to="'/post/' + item.id" class="news__item">
    <img :src="apiDomain + 'web/uploads/' + item.title_photo" alt="news" class="news__item__image" />
    <div class="news__item--text">
      <div class="news__item__date">
        {{ formatDate(item.date_add) }}
      </div>
      <div class="news__item__title">
        {{ item.title }}
      </div>
      <div class="news__item__subtitle">
        {{ item.short_text }}
      </div>
      <div class="news__item__link">Подробнее</div>
    </div>
  </router-link>
</template>
<style scoped>
.news__item {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #333;
  min-height: 419px;
  width: 420px;
  height: 600px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}
.news__item__image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  object-position: center;
  border-radius: 15px;
}
.news__item--text {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px 20px;
  position: relative;
  z-index: 2;
  border-radius: 15px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) -1.84%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(3.3499999046325684px);
}
.news__item__date {
  color: rgba(255, 255, 255, 0.34);
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.news__item__title {
  color: #fff;

  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 120%; /* 21.6px */
  letter-spacing: -0.36px;
}
.news__item__subtitle {
  color: #fff;

  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.news__item__link {
  transition: 0.3s;
  color: #000;

  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 128px;
  border: 1px solid #fff;
  background: #fff;
  width: max-content;
  margin-top: 30px;
}


@media screen and (max-width: 600px) {
  .news__item {
    width: 350px;
    height: 500px;
  }
  .news__item__title{
    font-size: 16px;
  }
  .news__item__subtitle{
    font-size: 12px;
  }
  .news__item__date{
    font-size: 10px;
  }
}
</style>