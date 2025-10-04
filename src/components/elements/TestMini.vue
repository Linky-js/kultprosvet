<script>
export default {
  name: "TestMini",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {},
  data() {
    return {
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      user: this.$store.getters.getUser,
    };
  },
  mounted() {
   
  },
};
</script>

<template>
  <div class="test__item">
    <img
      :src="apiDomain + 'web/uploads/' + item.photo"
      alt="news"
      class="test__item__image"
    />
    <div class="test__item--text">
      <div class="test__item__date">Тест</div>
      <div class="test__item__title">
        {{ item.name }}
      </div>
      <div class="test__item__subtitle">
        {{ item?.description }}
      </div>
      <router-link :to="'/test/' + item.id" class="test__item__link">
        Пройти
      </router-link>
    </div>
  </div>
</template>
  <style scoped>
.test__item__link {
  background: #5f22c1;
  min-width: 119px;
  padding: 10px 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  width: max-content;
  margin-top: auto;
}
.test__item {
  display: flex;
  flex-direction: column;
  background: #f4f4f4;
  max-width: calc(33.333% - 17px);
  min-height: 373px;
  width: 378px;
}
.test__item__image {
  width: 100%;
  height: 198px;
  object-fit: cover;
  object-position: center;
}
.test__item--text {
  display: flex;
  flex-direction: column;
  gap: 7px;
  justify-content: space-between;
  padding: 24px;
  height: 100%;
}
.test__item__date {
  color: #9e9e9e;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.test__item__title {
  color: #333;
  font-family: Onest;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 120% */
  letter-spacing: -0.4px;
}
.test__item__subtitle {
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
@media screen and (max-width: 600px) {
  .test__item {
    max-width: 290px;
    min-height: 414px;
  }
}
</style>