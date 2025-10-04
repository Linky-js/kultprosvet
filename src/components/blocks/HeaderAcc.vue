<script>
import Cookies from "js-cookie";
export default {
  name: "HeaderAcc",
  components: {},
  methods: {
    logout() {
      Cookies.remove("user");
      this.$router.push("/");
    },
  }
};
</script>
<template>
  <div class="header_acc">
    <div class="links">
      <router-link to="/" class="gotoHome link">Перейти на сайт</router-link>
      <a @click="logout" class="exit link">Выйти из ЛК</a>
    </div>
  </div>
</template>
<style scoped>
.header_acc {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 43px;
  width: 100%;
}
.links{
    display: flex;
    gap: 24px;
}
.link {
  color: #383838;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px; 
}
.gotoHome.link {
  color: #5f22c1;
}
</style>