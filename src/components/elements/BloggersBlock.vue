<script setup>
import { defineProps, defineEmits } from "vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { useStore } from "vuex";
const emit = defineEmits(["searchvideobyblogger"]);

const store = useStore();
const apiDomain = store.getters.getApiDomain;
const props = defineProps({
  bloggers: {
    type: Array,
    required: true
  }
});

function goSearch(blogger) {
  let newBlogger = blogger
  newBlogger.blogger_id = blogger.id
  emit("searchvideobyblogger", newBlogger);
}
</script>
<template>
  <div class="bloggers-block">
    <div class="container">
      <div class="bloggers">
        <div class="head-h2">
          Блогеры и ведущие
        </div>
        <Swiper :slides-per-view="'auto'" :space-between="20" class="swiper_bloggers">
          <SwiperSlide v-for="blogger in props.bloggers" :key="blogger.id" class="blogger" @click="goSearch(blogger)">
            <img :src="apiDomain + 'web/uploads/' + blogger.poster" alt="" />
            {{ blogger.title }}
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>

</template>
<style>
.bloggers-block {
  margin-top: 130px;
}

.bloggers {
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
}

.swiper_bloggers {
  width: 100%;
  overflow: visible;
}

.blogger {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
  color: #333;
  text-align: center;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 135%;
  width: 200px;
}

.blogger img {
  border-radius: 50%;
  height: 200px;
  width: 200px;
}

@media (max-width: 1024px) {
  .bloggers-block {
    margin-top: 60px;
  }

  .head-h2 {
    font-size: 16px;
    line-height: 120%;
  }

  .bloggers {
    gap: 16px;
  }

  .blogger {
    font-size: 14px;
    width: 140px;
  }

  .blogger img {
    height: 140px;
    width: 140px;
  }
}
</style>