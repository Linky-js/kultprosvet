ue
Копировать код
<script>
import validateEmail from "@/directives/validateEmail.js";
import validatePhone from "@/directives/validatePhone.js";
import BtnRed from "../ui/BtnRed.vue";
import axios from "axios";
import Cookies from "js-cookie";
import router from "@/router/router";

export default {
  name: "LoginBlock",
  directives: {
    validateEmail,
    validatePhone,
  },
  components: {
    BtnRed,
  },
  data() {
    return {
      tabsArray: ["Vk", "По почте", "Yandex"],
      message: "",
      error: "",
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      isEmailValid: false,
      isPhoneValid: false,
      inputUsername: "",
      userVk: null,
    };
  },
  methods: {
    updateEmailValidity(isValid) {
      this.isEmailValid = isValid;
    },
    updatePhoneValidity(isValid) {
      this.isPhoneValid = isValid;
    },
    popupToogle() {
      const popup = document.querySelector(".popup");
      popup.classList.toggle("active");
    },
    switchTo(type) {
      this.$emit("switchTo", type);
    },
    changeTab(tab) {
      this.message = tab;
    },
    userLogin() {
      console.log(this.user.username);
      if (!this.isEmailValid) {
        this.error = "Некорректная почта";
        this.$emit("erroruser", this.error);
        return;
      }
     
      
      this.error = "";
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      
      this.inputPassword = document.querySelector(".passInput").value;
      let params = {
        username: this.inputUsername,
        password: this.inputPassword,
      };

      axios
        .post(this.apiUrl + "api-user/login" + authGet, params, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          if (response.data.status) {
            this.$store.commit("setUserData", response.data.user);
            let jsonUser = JSON.stringify(response.data.user);
            Cookies.set("user", jsonUser, { expires: 7 });
            this.$emit("registerSuccess");
            router.push("/account");
          } else {
            this.error = response.data.error;
            console.log(this.error);
            this.$emit("erroruser", this.error);
            
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // VK ID авторизация
    initVKID() {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js";
      script.onload = () => {
        if ("VKIDSDK" in window) {
          const VKID = window.VKIDSDK;

          VKID.Config.init({
            app: 52498967,
            redirectUrl: "https://xn--b1agnepfhjfgc3i.fun/login",
            responseMode: VKID.ConfigResponseMode.Callback,
            source: VKID.ConfigSource.LOWCODE,
          });

          const oneTap = new VKID.OneTap();
          oneTap
            .render({
              container: this.$refs.vkContainer,
              showAlternativeLogin: true,
            })
            .on(VKID.WidgetEvents.ERROR, this.vkidOnError)
            .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, this.onLoginSuccess);
        }
      };
      document.head.appendChild(script);
    },
    onLoginSuccess(payload) {
      const code = payload.code;
      const deviceId = payload.device_id;

      window.VKIDSDK.Auth.exchangeCode(code, deviceId)
        .then(this.vkidOnSuccess)
        .catch(this.vkidOnError);
    },
    vkidOnSuccess(data) {
      axios
        .post(
          "https://xn--b1agnepfhjfgc3i.fun/ApiConnector.php",
          {
            requestUrl: "https://id.vk.com/oauth2/user_info",
            method: "POST",
            headers: ["Content-Type: multipart/form-data"],
            body: {
              access_token: data.access_token,
              client_id: 52498967,
            },
          },
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
        .then((response) => {
          this.userVk = response.data.user;
          this.getUserByVkId(response.data.user.user_id);
        })
        .catch((error) => {
          console.log("Ошибка при получении данных пользователя:", error);
        });
    },
    getUserByVkId(id) {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      let params = {
        vk_user_id: id,
      };

      axios
        .post(this.apiUrl + "api-user/get-user-by-vk" + authGet, params, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          if (response.data.status == false) {
            this.registerUserByVK();
          } else if (response.status == 200) {
            this.$store.commit("setUserData", response.data);
            let jsonUser = JSON.stringify(response.data);
            Cookies.set("user", jsonUser, { expires: 7 });
            this.$emit("registerSuccess");
            router.push("/account");
          }
        })
        .catch((error) => {
          console.log("Пользователь не найден", error);
        });
    },
    vkidOnError(error) {
      console.error("Ошибка авторизации через VK ID", error);
    },
    registerUserByVK() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      let params = {
        type: "email",
        username: this.userVk.user_id,
        password: this.userVk.user_id + this.randomPassword() + "VK",
        email: this.userVk?.email || this.randomEmail(),
        vk_user_id: this.userVk.user_id,
      };
      let paramsUpdate = {
        i: this.userVk.first_name,
        f: this.userVk.last_name,

        tel: this.userVk?.phone,
        dr: this.userVk?.birthday,
        sex: this.userVk?.sex,
        avatar: this.userVk?.avatar,
      };

      axios
        .post(this.apiUrl + "api-user/register" + authGet, params, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          if (response.data.status == false) {
            console.log(response.data.error);
            return;
          }
          paramsUpdate.id = response.data.user.id;
          let authVkGet = `&auth=${response.data.user.username}:${response.data.user.auth_key}`;
          this.registerUpdate(paramsUpdate, authVkGet);
        })
        .catch((error) => {
          console.log("Пользователь не зарегистрирован", error);
        });
    },
    registerUpdate(params, authVkGet) {
      axios
        .post(this.apiUrl + "api-user/update-user" + authVkGet, params, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          this.$store.commit("setUserData", response.data.user);
          let jsonUser = JSON.stringify(response.data.user);
          Cookies.set("user", jsonUser, { expires: 7 });
          this.$emit("registerSuccess");
          router.push("/account");
        });
    },
    randomEmail() {
      return Math.random().toString(12).slice(-8) + "@культпросвет.fun";
    },
    randomPassword() {
      return Math.random().toString(36).slice(-8);
    },
  },
  mounted() {
    // Инициализация VK ID авторизации, если выбран таб "Vk"

     this.initVKID();
  },
};
</script>

<template>
  <div class="form login__form">
    <div class="head-h3">Войти в личный кабинет</div>

    <div class="form__content">
      <div class="form__item">
        <input
          type="text"
          class="form__input loginInput"
          v-model="inputUsername"
          v-validate-email="updateEmailValidity"
          placeholder="Электронная почта"
        />
      </div>
      <div class="form__item">
        <input
          type="password"
          class="form__input passInput"
          placeholder="Пароль"
        />
        <a @click="popupToogle" class="forgot">Забыли пароль?</a>
      </div>
      <div class="form__footer">
        <BtnRed class="btnLogin"  @click="userLogin" >Вход</BtnRed>
        <!-- <button @click="userLogin" class="btn">Вход</button> -->
      </div>
      <div class="form__footer">
        <a @click="switchTo('registration')" class="link"
          >Впервые здесь? <span>Зарегистрироваться</span></a
        >
      </div>
    </div>
  </div>

  <div class="and"><span></span>или <span></span></div>

  <!-- Вход через ВКонтакте -->
  <div ref="vkContainer" class="loginItem"></div>
</template>
<style scoped>
.close {
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 20px;
}
.login {
  display: flex;
  justify-content: center;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.loginItem {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login__head {
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.logo {
  max-width: 205px;
}
.back {
  color: var(--Black-1200, #2e2e2e);
  font-family: "Suisse Intl";
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 536px;
  align-items: center;
}
.form__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 536px;
}
.form__label {
  color: var(--Black-1300, #1d1d1b);
  font-family: Onest;
  font-size: 16px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;
}
.form__input,
.form__input:autofill {
  border-radius: 10px;
  background: #e7e7e7;
  color: var(--Black, #111);
  font-family: Onest;
  font-size: 16px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;

  padding: 14px 16px;
  outline: none;
  border: 1px solid #eaeaea;
  width: 290px;
  max-width: 100%;
}
.form__input:hover,
.form__input:focus {
  border-radius: 10px;
  background: #e7e7e7;
  list-style: none;
  outline: none;
}
.form__input::placeholder {
  color: #848484;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 128.571% */
}
.form__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form__row {
  display: flex;
  gap: 22px;
  justify-content: space-between;
}
.forgot {
  color: var(--Black-1200, #2e2e2e);
  font-family: Onest;
  font-size: 16px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;

  text-decoration-line: underline;
  margin-top: 8px;
}
.btn-black {
  width: 100%;
}
.link {
  color: var(--Black-1200, #2e2e2e);
  font-family: Onest;
  font-size: 16px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;
}
.link span {
  text-decoration-line: underline;
}
.login__image {
  width: 50%;
  flex-shrink: 0;
  height: 100%;
  background: #0850cd;
  position: relative;
  z-index: 2;
}
.login__image img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}
.login__wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 50%;
  flex-shrink: 0;
  padding-right: 40px;
  padding-left: 40px;
  height: 100%;
}
.login-image {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
}
.politic__text {
  color: var(--Black-1200, #2e2e2e);
  font-family: Onest;
  font-size: 16px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;
}
.politic__text span {
  text-decoration-line: underline;
}
.popup {
  background: rgba(31, 31, 31, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 20px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}
.popup.active {
  opacity: 1;
  visibility: visible;
  transition: all 0.3s;
}
.popup__content {
  border-radius: 2px;
  background: var(--White, #fff);
  padding: 40px 36px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 33px;
  max-width: 586px;
  width: 100%;
}
.popup__head {
  color: var(--Black-1300, #1d1d1b);
  text-align: center;
  font-family: Onest;
  font-size: 28px;
  font-weight: 400;
  line-height: 20.8px;
}

.politic {
  padding-bottom: 20px;
}
.and {
  color: #a2a2a2;
  text-align: center;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
  letter-spacing: 0.16px;
  width: 100%;
  max-width: 290px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
}
.and span {
  display: block;
  width: 100%;
  background: rgba(174, 174, 174, 0.45);
  height: 1px;
}
.btnLogin{
  width: 100%;
  border-radius: 10px;
}

@media screen and (max-width: 960px) {
  .form__row {
    flex-direction: column;
  }
}

@media screen and (max-width: 767px) {
  .login__image {
    display: none;
  }
  .login__wrapper {
    width: 100%;
    padding-right: 24px;
    padding-left: 24px;
  }
  .login__content {
    max-width: 100%;
  }
  .form {
    width: 100%;
    margin: 0 auto;
  }
  .link {
    font-size: 15px;
  }
  .politic {
    max-width: 536px;
    margin: 0 auto;
  }
}
</style>