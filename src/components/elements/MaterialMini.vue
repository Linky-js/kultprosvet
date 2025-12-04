<script>
export default {
  name: "MaterialMini",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {},
  mounted() {

  },
  data() {
    return {
      user: this.$store.getters.getUser,
      apiDomain: this.$store.getters.getApiDomain,
    };
  }
};
</script>

<template>
  <div class="material">
    <div class="material__file" :class="{blue: item.format === 'DOC'}">{{ item.format }}</div>
    <svg width="200" height="254" viewBox="0 0 200 254" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 12C0 5.37258 5.37258 0 12 0H141.719C145.167 0 148.448 1.48334 150.727 4.07178L173.333 29.7573L195.819 54.4014C198.509 57.3491 200 61.1954 200 65.1858V242C200 248.627 194.627 254 188 254H12C5.37258 254 0 248.627 0 242V12Z"
        fill="#EEF0F0" />
      <path
        d="M143.5 0C145.726 0 147.845 0.954137 149.32 2.62067L174 30.5L197.641 56.4143C199.159 58.0778 200 60.2483 200 62.5H155.5C148.873 62.5 143.5 57.1274 143.5 50.5L143.5 0Z"
        fill="#EEF0F0" />
      <path
        d="M143.5 0C145.726 0 147.845 0.954137 149.32 2.62067L174 30.5L197.641 56.4143C199.159 58.0778 200 60.2483 200 62.5H155.5C148.873 62.5 143.5 57.1274 143.5 50.5L143.5 0Z"
        fill="url(#paint0_linear_4095_2082)" />
      <defs>
        <linearGradient id="paint0_linear_4095_2082" x1="174.364" y1="33.2774" x2="139.904" y2="61.3203"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#F6F6F6" />
          <stop offset="1" stop-color="white" />
        </linearGradient>
      </defs>
    </svg>
    <div class="material__title">{{ item.title }}</div>
    <div class="material__size">{{ item.format }}, {{ item.size }}</div>
    <router-link v-if="user.username == 'guest'" :to="'/login'" class="material__link">Войдите, чтобы скачать</router-link>
    <a v-else :href="apiDomain + 'web/uploads/' + item.link" class="material__link">Открыть файл</a>
  </div>
</template>
<style scoped>
.material {
  width: 200px;
  height: 254px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  position: relative;
  font-family: "Onest", sans-serif;
  padding-bottom: 19px;
  padding-left: 16px;
  padding-top: 16px;
}
.material svg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
.material__file {
  font-weight: 700;
  font-size: 16px;
  line-height: 135%;
  text-transform: uppercase;
  text-align: center;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  background: #e64946;
  position: absolute;
  top: 19px;
  left: -8px;
}
.material__file.doc {
  background: #3e84f0;
}
.material__size {
  font-weight: 400;
  font-size: 14px;
  line-height: 135%;
  color: #717171;
  margin-bottom: 20px;
}
.material__title {
  font-weight: 500;
  font-size: 14px;
  line-height: 135%;
  color: #353535;
}
.material__size {
  font-weight: 400;
  font-size: 14px;
  line-height: 135%;
  color: #717171;
}
.material__link {
  color: #5F22C1;
  font-size: 14px;
  font-weight: 500;
}

</style>