<script>
export default {
  name: "AfishaItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
   
    formatDescription(description) {
      // Убираем HTML-теги с помощью регулярного выражения
      const text = description
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Ограничиваем длину строки до 23 символов
      return text.length > 23 ? text.slice(0, 23) + "..." : text;
    },
  },
};
</script>

<template>
  <router-link :to="'/event/' + item._id" class="afisha__item"
  :style="{ backgroundImage: 'url(https://pro.culture.ru/uploads/' + item.image.name + ')', backgroundSize: 'cover' }"
  >
    <div class="item__content">
      <div class="category">{{ item.category.name }}</div>
      <div class="title">
        {{ item.name }}
      </div>
      <div class="description">
        {{ formatDescription(item.description) }}
      </div>
      <div class="more">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <path
            d="M5.25 21H36.75"
            stroke="white"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M31.5 26.25L36.75 21L31.5 15.75"
            stroke="white"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </router-link>
</template>
<style scoped>
.afisha__item {
  display: block;
  width: 324px;
  height: 290px;
  flex-shrink: 0;
  transition: all 0.3s;
  cursor: pointer;
}
.afisha__item svg{
  transition: all 0.3s;
}
.afisha__item:hover svg {
  transform: scale(1.1);
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
.date {
  color: #fff;
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  
}
.category {
  margin-bottom: auto;
  color: #fff;
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
.title {
  color: #fff;
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 122.222% */
  letter-spacing: -0.36px;
}
.description {
  color: #fff;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>