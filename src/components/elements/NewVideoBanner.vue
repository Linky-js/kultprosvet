<script setup>
import { defineProps } from "vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination } from "swiper/modules";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  banners: {
    type: Array,
    required: true
  } 
});
// const user = store.getters.getUser;
// const apiUrl = store.getters.getApiUrl;
// const themes = ref([]);
const apiDomain = store.getters.getApiDomain;
// const videos = ref([]);
// const popupShow = ref(false);
// const iframe = ref(null);

const modules = [Navigation, Pagination];
</script>
<template>
  <div class="banner-wrapper">
    <div class="banner-pagination"></div>
    <div class="arrows">
      <div class="arrow arrow-prev">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 16 32" fill="none">
          <path
            d="M13.3483 0H14.4868C14.9863 0 15.4416 0.286879 15.6571 0.737581C15.8675 1.17756 15.8134 1.69838 15.517 2.0857L5.29342 15.4461C5.01852 15.8053 4.86957 16.2451 4.86957 16.6975C4.86957 17.1862 5.04339 17.659 5.35996 18.0313L15.4703 29.9225C15.7925 30.3014 15.8618 30.8344 15.6472 31.2832C15.4377 31.7212 14.9953 32 14.5097 32H13.2944C12.3625 32 11.4773 31.5924 10.8714 30.8845L0.982452 19.3298C0.348432 18.5889 0 17.6459 0 16.6709C0 15.7645 0.3011 14.8839 0.855992 14.1673L10.8942 1.20354C11.482 0.444369 12.3881 0 13.3483 0Z"
            fill="white" fill-opacity="0.6" />
        </svg>
      </div>
      <div class="arrow arrow-next">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 16 32" fill="none">
          <path
            d="M2.65174 0H1.51325C1.01365 0 0.558449 0.286879 0.342896 0.737581C0.132472 1.17756 0.186586 1.69838 0.48297 2.0857L10.7066 15.4461C10.9815 15.8053 11.1304 16.2451 11.1304 16.6975C11.1304 17.1862 10.9566 17.659 10.64 18.0313L0.529693 29.9225C0.207482 30.3014 0.138199 30.8344 0.352817 31.2832C0.562308 31.7212 1.00471 32 1.49025 32H2.7056C3.63747 32 4.52272 31.5924 5.12864 30.8845L15.0175 19.3298C15.6516 18.5889 16 17.6459 16 16.6709C16 15.7645 15.6989 14.8839 15.144 14.1673L5.10585 1.20354C4.518 0.444369 3.6119 0 2.65174 0Z"
            fill="white" fill-opacity="0.6" />
        </svg>
      </div>
    </div>
    <Swiper :slidesPerView="1" :spaceBetween="20" :loop="false" 
    :modules="modules"
     :navigation="{ nextEl: '.arrow-next', prevEl: '.arrow-prev' }"
      :pagination="{ el: '.banner-pagination', clickable: true }"
    >
      <SwiperSlide v-for="item in props.banners" :key="item.id" class="swiper_slide">
        <img :src="apiDomain + 'web/uploads/' + item.filename" alt="" />
        <div class="banner__info">
          <div class="tags">
            <div class="theme tag">
              {{ item.theme.name }}
            </div>
            <div v-if="item?.category?.name" class="category tag">
              {{ item?.category?.name }}
            </div>
          </div>
          <h3 class="banner__title">
            {{ item.title }}
          </h3>
          <div class="btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M12.4873 5.45349C12.7675 5.60248 13.0018 5.82489 13.1652 6.0969C13.3287 6.36891 13.415 6.68025 13.415 6.99757C13.415 7.3149 13.3287 7.62624 13.1652 7.89825C13.0018 8.17025 12.7675 8.39267 12.4873 8.54166L5.01361 12.6057C3.8102 13.2608 2.33203 12.4092 2.33203 11.0622V2.93349C2.33203 1.58599 3.8102 0.734908 5.01361 1.38883L12.4873 5.45349Z"
                fill="white" />
            </svg>
            Смотреть сейчас
          </div>
        </div>
      </SwiperSlide>
      
    </Swiper>
  </div>
</template>
<style scoped>
.banner-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-top: 46px;
}

.banner-pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.swiper_slide {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 16px;
  background: #F3F3F3;
  overflow: hidden;
}

.swiper_slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
}

.banner__info {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(0, 0, 0, 0.1);
  padding: 48px 64px;
}

.tags {
  display: flex;
  gap: 6px;
}

.tag {
  color: rgba(255, 255, 255, 0.80);
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  border-radius: 100px;
  border: 1px solid rgba(245, 245, 245, 0.30);
  background: rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(10px);
  padding: 10px 16px 8px 16px;
}
.banner__title{
  color: #FFF;
font-family: Onest;
font-size: 40px;
font-style: normal;
font-weight: 600;
line-height: 110%; /* 44px */
letter-spacing: -0.8px;
max-width: 518px;
}
.btn{
  border-radius: 128px;
border: 1px solid #955AF5;
background: #5F22C1;
display: inline-flex;
padding: 20px 36px;
justify-content: center;
align-items: center;
gap: 6px;
color: #FFF;
text-align: center;
font-family: Onest;
font-size: 15px;
font-style: normal;
font-weight: 600;
line-height: 18px; /* 120% */
width: max-content;
}
.arrows{
  display: flex;
  justify-content: space-between;
  gap: 24px;
  position: absolute;
  top: 50%;
  left: 8px;
  width: calc(100% - 16px);
  transform: translateY(-50%);
  z-index: 3;
}
.arrow{
  display: flex;
  cursor: pointer;
}
</style>