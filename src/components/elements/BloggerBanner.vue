<script setup>
import { ref, onMounted, defineProps } from "vue";
import { useStore } from "vuex";
import BtnRed from "../ui/BtnRed.vue";

const blogger = ref({});
const store = useStore();
const apiDomain = store.getters.getApiDomain;
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  btn: {
    type: Boolean,
    required: false,
    default: false,
  }
});
onMounted(() => {
  blogger.value = props.item;
  if (!blogger.value.poster) {
    blogger.value.poster = "users/avatar/avatar__67586a76aa26c.png";
  }
});
</script>

<template>
  <div class="blogger-banner">
    <div class="blogger-banner__img">
      <img
        class="imagedektop poster"
        :src="apiDomain + 'web/uploads/' + blogger?.poster"
        :alt="blogger.title"
      />
      <img
        class="imagemobile poster"
        :src="apiDomain + 'web/uploads/' + blogger?.poster_mobile"
        :alt="blogger.title"
      />
    </div>
    <div class="blogger-banner__name">
      <div class="label">Блогер</div>
      <div class="bloggerName">{{ blogger.title }}</div>
    </div>
    <div class="description">
      {{ blogger.description }}
    </div>
    <BtnRed v-if="btn" :link="'/blogger/' + blogger.id">Смотреть видео</BtnRed>
  </div>
</template>
<style scoped>
.blogger-banner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 64px 74px;
  position: relative;
  min-height: 388px;
}
.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.blogger-banner__img {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
.imagemobile {
  display: none;
}
.label {
  border-bottom: 1px solid #b9b9b9;
  color: #797979;
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px; /* 183.333% */
  text-transform: uppercase;
  padding-bottom: 5px;
  max-width: 322px;
}
.bloggerName {
  color: #fff;
  font-family: Onest;
  font-size: 40px;
  font-style: normal;
  font-weight: 500;
  line-height: 44px; /* 110% */
}
.description {
  color: #fff;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 322px;
}
@media screen and (max-width: 1024px) {
  .imagedektop {
    display: none;
  }
  .imagemobile {
    display: block;
  }
}
</style>