<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import TestMini from "../elements/TestMini.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import axios from "axios";
export default {
  name: "TestsPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    TestMini,
    SubscribeBlock,
  },
  data() {
    return {
      tests: [],
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      user: this.$store.getters.getUser,
      displayCount: 3,
      incrementCountDesktop: 3,
      incrementCountMobile: 2,
    };
  },
  computed: {
    // Определяем шаг для подгрузки новостей в зависимости от ширины экрана
    getIncrementCount() {
      return this.windowWidth < 600
        ? this.incrementCountMobile
        : this.incrementCountDesktop;
    },
  },
  methods: {
    getTests() {
      if (this.displayCount < this.tests.length) {
        this.displayCount += this.getIncrementCount;
      }
    },
  },
  mounted() {
    let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
    axios
      .get(this.apiUrl + "api-test/get-list" + authGet)
      .then((response) => {

        this.tests = response.data.tests;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[{ name: 'Тесты', link: '/tests' }]"
    :title="'Тесты'"
    :bannerHead="{ name: 'tests', uniq: false }"
  />
  <div class="tests mBlock">
    <div class="container">
      <div class="tests__content">
        <div class="head-h2">Тесты</div>
        <div class="tests__items">
          <TestMini v-for="test in tests.slice(0, this.displayCount)" :key="test.id" :item="test" />
        </div>
        <a
          v-if="displayCount < tests.length"
          @click="getTests()"
          class="get__addNews"
        >
          Больше тестов
        </a>
      </div>
    </div>
  </div>
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
.tests__content {
  display: flex;
  flex-direction: column;
  gap: 42px;
}
.tests__items{
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.get__addNews {
  color: #5F22C1;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 112.5% */
  background: #f0f0f0;
  padding: 15px 20px;
  width: 212px;
  margin: 0 auto;
  margin-top: 23px;
  transition: all 0.3s;
}
.get__addNews:hover{
  transform: scale(1.05);
}
</style>