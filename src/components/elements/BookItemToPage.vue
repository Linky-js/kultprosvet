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
  <router-link :to="`/book/${item.id}`" class="book">
    <div class="book__img">
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.4674 25.6914C14.1454 25.6914 13.9284 25.7229 13.8164 25.7544V27.8159C13.9494 27.8474 14.1157 27.8562 14.3449 27.8562C15.1832 27.8562 15.6994 27.4327 15.6994 26.7169C15.6994 26.0764 15.2549 25.6914 14.4674 25.6914ZM20.5697 25.7124C20.2197 25.7124 19.9922 25.7439 19.8574 25.7754V30.3429C19.9922 30.3744 20.2092 30.3744 20.4052 30.3744C21.8349 30.3849 22.7659 29.5974 22.7659 27.9314C22.7764 26.4789 21.9277 25.7124 20.5697 25.7124Z"
          fill="white" />
        <path
          d="M24.5 3.5H10.5C9.57174 3.5 8.6815 3.86875 8.02513 4.52513C7.36875 5.1815 7 6.07174 7 7V35C7 35.9283 7.36875 36.8185 8.02513 37.4749C8.6815 38.1313 9.57174 38.5 10.5 38.5H31.5C32.4283 38.5 33.3185 38.1313 33.9749 37.4749C34.6313 36.8185 35 35.9283 35 35V14L24.5 3.5ZM16.6215 28.3325C16.0808 28.84 15.2827 29.0675 14.3535 29.0675C14.1733 29.0709 13.9931 29.0604 13.8145 29.036V31.5315H12.25V24.6435C12.9561 24.5385 13.6695 24.4905 14.3832 24.5C15.358 24.5 16.051 24.6855 16.5183 25.0583C16.9628 25.4118 17.2638 25.991 17.2638 26.6735C17.262 27.3595 17.0345 27.9388 16.6215 28.3325ZM23.2838 30.7038C22.5488 31.3145 21.4305 31.605 20.0638 31.605C19.2448 31.605 18.6655 31.5525 18.2717 31.5V24.6453C18.9781 24.5425 19.6913 24.494 20.405 24.5C21.7297 24.5 22.5908 24.738 23.2628 25.2455C23.989 25.7845 24.444 26.6438 24.444 27.8775C24.444 29.2128 23.9558 30.135 23.2838 30.7038ZM29.75 25.8475H27.069V27.4418H29.575V28.7263H27.069V31.5333H25.4835V24.5525H29.75V25.8475ZM24.5 15.75H22.75V7L31.5 15.75H24.5Z"
          fill="white" />
      </svg>
      <img :src="apiDomain + 'web/uploads/' + item.poster" alt="" />
    </div>
    <div class="book__content">
      <div class="title">
        {{ item.title }}
      </div>
      <div class="format">{{ item.format }}, {{ item.size }}</div>
      <div class="more">Открыть файл</div>
    </div>
  </router-link>
</template>
<style scoped>
.book {
  font-family: "Onest", sans-serif;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.book__img {
  position: relative;
  width: 100%;
  height: 313px;
  border-radius: 6px;
  overflow: hidden;
}
.book__img svg {
  top: 8px;
  left: 4px;
  position: absolute;
}
.book__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.book__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.title{
  font-weight: 500;
  font-size: 16px;
  line-height: 135%;
  color: #333;
}
.format {
  font-weight: 400;
  font-size: 14px;
  line-height: 135%;
  color: #717171;
  margin-bottom: 1px;
}
.more {
  font-weight: 500;
  font-size: 14px;
  line-height: 135%;
  color: #5f22c1;
}
@media (max-width: 650px){
  .book{
    width: 162px;
    gap: 12px;
  }
  .book__img {
    height: 253px;
  }
  .book__img svg {
    width: 36px;
    height: 36px;
    left: 4px;
    top: 6px;
  }
  .title {
    font-size: 14px;
  }
  .format {
    font-size: 12px;
  }
  .more {
    font-size: 13px;
  }
}
</style>