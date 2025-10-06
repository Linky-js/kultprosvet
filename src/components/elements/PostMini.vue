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
    <div class="news__item-arrow">
      <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.125 4.37544L11.74 4.37551L8.43306 1.06738L9.31694 0.183499L14.1339 5.00044L9.31694 9.81738L8.43306 8.9335L11.74 5.62551L0.125 5.62544L0.125 4.37544Z"
          fill="white" />
      </svg>
    </div>
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
    </div>
  </router-link>
</template>
<style scoped>
.news__item {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #333;
  width: 420px;
  height: 512px;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
}
.news__item-arrow {
  width: 50px;
  height: 50px;
  position: absolute;
  right: 16px;
  top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  backdrop-filter: blur(30px);
}
.news__item-arrow svg {
  transform: rotate(-45deg);
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
  gap: 12px;
  padding: 31px 24px 28px;
  position: relative;
  z-index: 2;
  background: linear-gradient(180deg, rgba(16, 28, 34, 0) 0%, rgba(16, 28, 34, 0.6) 100%);
  backdrop-filter: blur(6px);
  
}

.news__item__date {
  font-family: Onest;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  padding: 10px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  width: max-content;
}

.news__item__title {
  color: #fff;
  font-family: Onest;
  font-size: 20px;
  font-weight: 600;
  line-height: 120%;
}

.news__item__subtitle {
  color: #ddd;
  font-family: Onest;
  font-size: 14px;
  font-weight: 500;
  line-height: normal;
}



@media screen and (max-width: 600px) {
  .news__item {
    width: 260px;
    height: 316px;
  }
  .news__item--text {
    padding: 30px 16px 16px;
  }
  .news__item-arrow {
    width: 36px;
    height: 36px;
    right: 10px;
    top: 10px;
  }
  .news__item-arrow svg {
    width: 8px;
    height: 12px;
  }

  .news__item__title {
    font-size: 16px;
  }

  .news__item__subtitle {
    font-size: 12px;
  }

  .news__item__date {
    font-size: 11px;
  }
}
</style>