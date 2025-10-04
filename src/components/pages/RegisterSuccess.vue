<script>
import axios from 'axios';
import Cookies from 'js-cookie';
export default {
  name: "RegisterSuccess",
  data() {
    return {
      token: null,
      type: null,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  created() {
    // Извлечение токена из URL при создании компонента
    this.token = this.$route.query.token;
    if (this.$route.query.type){
      this.type = this.$route.query.type
    }
  },
  methods: {

    registerSuccess() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}&token=${this.token}`;
      if (this.type != null) {
      authGet += `&type=${this.type}`
    }
      axios
        .get(this.apiUrl + "api-user/confirm" + authGet)
        .then((response) => {
          if (response.data.status) {
            this.$store.commit("setUserData", response.data.user);
            let jsonUser = JSON.stringify(response.data.user);
            Cookies.set("user", jsonUser, { expires: 7 });
            setTimeout(() => {
              this.$router.push("/account");
            }, 5000);
          } else {
            this.error = response.data.error;
          }
        })
    }

  },

  mounted() {
    this.registerSuccess();
  },
};
</script>

<template>
  <div class="registrationSuccess">
    <div class="container">
      <div class="form registration__form center">
        <div class="head-h3">Ваша почта подтверждена</div>
        <router-link to="/account" class="btn-blue">Личный кабинет</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registrationSuccess{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.form__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 536px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 536px;
}
</style>