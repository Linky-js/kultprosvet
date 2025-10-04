<script>
export default {
  name: "BookItemToPage",
  props: {
    item: {
      type: Object,
    },
  },
  data() {
    return {
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  mounted() {
  },
};
</script>
<template>
  <router-link :to="`/book/${item.id}`" class="book_item">
    <div class="image">
      <img
        :src="apiDomain + 'web/uploads/' + item.poster"
        alt=""
        class="book"
      />
    </div>
    <div class="book__content">
      <div class="formatIcon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
        >
          <path
            d="M17.2223 30.5835C16.8389 30.5835 16.5806 30.621 16.4473 30.6585V33.1127C16.6056 33.1502 16.8035 33.1606 17.0764 33.1606C18.0743 33.1606 18.6889 32.6564 18.6889 31.8043C18.6889 31.0418 18.1598 30.5835 17.2223 30.5835ZM24.4868 30.6085C24.0702 30.6085 23.7993 30.646 23.6389 30.6835V36.121C23.7993 36.1585 24.0577 36.1585 24.291 36.1585C25.9931 36.171 27.1014 35.2335 27.1014 33.2502C27.1139 31.521 26.1035 30.6085 24.4868 30.6085Z"
            fill="#D5D5D5"
          />
          <path
            d="M29.1673 4.1665H12.5007C11.3956 4.1665 10.3358 4.60549 9.55437 5.38689C8.77297 6.16829 8.33398 7.2281 8.33398 8.33317V41.6665C8.33398 42.7716 8.77297 43.8314 9.55437 44.6128C10.3358 45.3942 11.3956 45.8332 12.5007 45.8332H37.5007C38.6057 45.8332 39.6655 45.3942 40.4469 44.6128C41.2283 43.8314 41.6673 42.7716 41.6673 41.6665V16.6665L29.1673 4.1665ZM19.7882 33.729C19.1444 34.3332 18.1944 34.604 17.0882 34.604C16.8736 34.608 16.6591 34.5955 16.4465 34.5665V37.5373H14.584V29.3373C15.4246 29.2123 16.2738 29.1552 17.1236 29.1665C18.284 29.1665 19.109 29.3873 19.6652 29.8311C20.1944 30.2519 20.5527 30.9415 20.5527 31.754C20.5506 32.5707 20.2798 33.2603 19.7882 33.729ZM27.7194 36.5519C26.8444 37.279 25.5132 37.6248 23.8861 37.6248C22.9111 37.6248 22.2215 37.5623 21.7527 37.4998V29.3394C22.5936 29.2171 23.4426 29.1593 24.2923 29.1665C25.8694 29.1665 26.8944 29.4498 27.6944 30.054C28.559 30.6957 29.1007 31.7186 29.1007 33.1873C29.1007 34.7769 28.5194 35.8748 27.7194 36.5519ZM35.4173 30.7707H32.2257V32.6686H35.209V34.1978H32.2257V37.5394H30.3382V29.229H35.4173V30.7707ZM29.1673 18.7498H27.084V8.33317L37.5007 18.7498H29.1673Z"
            fill="#D5D5D5"
          />
        </svg>
      </div>
      <div class="book__text">
        <div class="title__book">
          {{ item.title }}
        </div>
        <div class="format">{{ item.format }}, {{ item.size }}</div>
        <div class="more"
          >Открыть файл</div
        >
      </div>
    </div>
  </router-link>
</template>
<style scoped>
.book_item {
  display: flex;
  gap: 14px;
  cursor: pointer;
  max-width: 380px;
}
.book_item svg{
  transition: all 0.3s;
}
.book_item:hover svg{
  transform: scale(1.1);
}
.book_item svg path{
  transition: all 0.3s;
}
.book_item:hover svg path{
  fill: #5f22c1;
}
.image {
  width: 148px;
  height: 206px;
  background: #f4f4f4;
  padding: 20px;
  flex-shrink: 0;
}
.book {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.book__text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.title__book {
  font-size: 16px;
  font-weight: 700;
}
.book__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  border-bottom: 4px solid #E0E0E0;
}
.formatIcon {
  max-width: 50px;
}
.book__text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.title__book {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
.format {
  color: #717171;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.more {
  color: #5f22c1;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-decoration: none;
}
</style>