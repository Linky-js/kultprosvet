<script>
import onlyCyrillic from "@/directives/onlyCirillick.js";
import validateEmail from "@/directives/validateEmail.js";
import LoginBlock from "../blocks/LoginBlock.vue";
import RegisterBlock from "../blocks/RegisterBlock.vue";
import { useCookies } from "vue3-cookies";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export default {
  name: "LoginPage",

  components: {
    LoginBlock,
    RegisterBlock,
  },
  directives: {
    onlyCyrillic,
    validateEmail,
  },
  props: {
    msg: String,
    links: String,
  },
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  methods: {
    checkCookie() {
      let user = this.cookies.isKey("user") ? this.cookies.get("user") : false;

      if (user) {
        this.accFlag = true;
      }
    },
    onEmailChange() {
      let email = document.querySelector(".emailChange");
      if (email.value) {
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(email.value)) {
          document.querySelector(".emailValid").classList.remove("default");
        } else {
          document.querySelector(".emailValid").classList.add("default");
        }
      }
    },
    registerSuccess() {
      this.showDone = true;
    },
    popupToogle() {
      document.querySelector(".popup").classList.toggle("active");
    },
    switchTo(mess) {
      this.message = mess;
    },

    loginRequest() {
      let login = document.querySelector(".inputLogin");

      this.login = login.value;
    },
    PassRequest() {
      let pass = document.querySelector(".inputPass");

      this.pass = pass.value;
    },
    accountRequest() {
      if (this.login !== "" && this.pass !== "") {
        if (this.login === "admin" && this.pass === "adminadmin") {
          this.$router.push("/account");
        }
      }
    },
    erroruser(error) {
      this.error = error;
      this.errorFlag = true;
    },
    closeError() {
      this.errorFlag = false;
    },
  },
  data() {
    return {
      message: "login",
      login: "",
      pass: "",
      inputUsername: "",
      inputPassword: "",
      inputI: "",
      inputEmail: "",
      sfera: "",
      error: "Danger",
      errorFlag: false,
      jsonUser: "",
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      timeline: null,
      showDone: false,
    };
  },

  mounted() {
    this.checkCookie();
    this.switchTo(this.message);
    gsap.registerPlugin(ScrollTrigger);
    let mm = gsap.matchMedia();
    this.timeline = gsap.timeline();
    mm.add("(min-width: 768px)", () => {
      gsap.set(".login__image", {
        width: "100%",
      });
      gsap.set(".login__wrapper", {
        width: "10%",
        opacity: 0,
      });
      gsap.to(".login__image", {
        width: "50%",
        duration: 1,
        delay: 0.1,
      });
      gsap.to(".login__wrapper", {
        width: "50%",
        opacity: 1,
        duration: 1,
        delay: 0.1,
      });
    });
  },
};
</script>

<template>
 <div class="container">
    <div class="login">
      <div class="login_head">
        <router-link class="logo" to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="192"
            height="45"
            viewBox="0 0 192 45"
            fill="none"
          >
            <path
              d="M16.7298 0.00244141H0V44.9999H16.7298V0.00244141Z"
              fill="black"
            />
            <path
              d="M22.3008 33.7512C22.3008 27.5387 27.2927 22.5024 33.4506 22.5024C39.6085 22.5024 44.6004 27.5387 44.6004 33.7512C44.6004 39.9637 39.6085 44.9999 33.4506 44.9999C27.2927 44.9999 22.3008 39.9637 22.3008 33.7512Z"
              fill="black"
            />
            <path
              d="M27.8713 0.00244141H44.586L33.4412 22.5024H16.7266L27.8713 0.00244141Z"
              fill="black"
            />
            <path
              d="M60.4062 19.6075V0.00244141H64.8531V7.83938H67.5989L72.2097 0.00244141H77.2875L71.2759 9.47398L77.2597 19.6101H72.0709L67.7074 11.9666H64.8531V19.6101H60.4062V19.6075Z"
              fill="black"
            />
            <path
              d="M82.254 19.6076V15.3149C83.0969 15.3149 83.7733 15.2767 84.2856 15.2028C84.8156 15.129 85.2547 14.9711 85.603 14.7318C85.9689 14.4721 86.3071 14.0953 86.6175 13.5962L79.3164 0H84.5027L88.9217 9.3315L92.5458 0H97.2929L92.3514 11.6306C92.041 12.3512 91.7306 13.0616 91.4177 13.7617C91.1072 14.4441 90.7691 15.0908 90.4031 15.6993C90.0549 16.3079 89.6612 16.8629 89.222 17.3619C88.8006 17.8432 88.3261 18.2378 87.7936 18.5535C87.1349 18.9227 86.3576 19.1901 85.4617 19.3556C84.5885 19.5236 83.5184 19.6076 82.254 19.6076Z"
              fill="black"
            />
            <path
              d="M97.4102 19.6636V15.3989C98.1067 15.3989 98.6367 15.269 99.0026 15.0119C99.3862 14.7522 99.6613 14.383 99.8254 13.9043C100.01 13.4231 100.146 12.8706 100.237 12.2417C100.31 11.7248 100.355 11.18 100.373 10.6071C100.411 10.0164 100.429 9.46136 100.429 8.9445C100.446 8.40981 100.456 7.9566 100.456 7.58742L100.512 0H114.536V19.6051H110.089V4.15271H104.656L104.6 8.38944C104.6 9.83054 104.572 11.1774 104.517 12.4327C104.461 13.6701 104.307 14.7776 104.05 15.7553C103.793 16.7331 103.346 17.5453 102.705 18.192C102.102 18.7827 101.398 19.1799 100.593 19.3836C99.8052 19.5694 98.7452 19.6636 97.4102 19.6636Z"
              fill="black"
            />
            <path
              d="M118.406 19.6075V0.00244141H122.853V7.00935H126.613C127.638 7.00935 128.6 7.11119 129.496 7.31488C130.391 7.50074 131.169 7.82155 131.827 8.28495C132.504 8.72797 133.026 9.33649 133.392 10.1131C133.776 10.8693 133.968 11.8291 133.968 12.9927C133.985 14.2861 133.758 15.3657 133.281 16.2314C132.824 17.0818 132.201 17.7539 131.416 18.253C130.646 18.752 129.768 19.1034 128.781 19.3045C127.792 19.5082 126.788 19.6101 125.763 19.6101H118.406V19.6075ZM122.853 15.4803H125.982C126.495 15.4803 126.962 15.4523 127.383 15.3962C127.822 15.3224 128.206 15.2027 128.536 15.0372C128.867 14.8717 129.112 14.6324 129.278 14.3167C129.463 14.0035 129.554 13.6063 129.554 13.1251C129.554 12.6643 129.48 12.2951 129.334 12.0175C129.188 11.74 128.968 11.5287 128.675 11.381C128.383 11.2155 128.044 11.1035 127.661 11.0475C127.295 10.9915 126.883 10.9635 126.427 10.9635H122.858V15.4803H122.853Z"
              fill="black"
            />
            <path
              d="M139.574 19.6075V4.15515H133.727V0.00244141H149.919V4.15515H144.018V19.6075H139.574Z"
              fill="black"
            />
            <path
              d="M60.4062 44.7784V25.1733H76.8458V44.7784H72.399V29.298H64.8531V44.7784H60.4062Z"
              fill="black"
            />
            <path
              d="M80.75 44.7784V25.1733H88.6265C90.1282 25.1733 91.4355 25.3948 92.5509 25.8379C93.6841 26.2809 94.5624 27.0014 95.1857 27.997C95.8267 28.9951 96.1473 30.3419 96.1473 32.0402C96.1473 33.6086 95.8091 34.9199 95.1327 35.9714C94.4564 37.023 93.5327 37.8071 92.3617 38.324C91.1907 38.823 89.8556 39.0726 88.354 39.0726H85.1968V44.7759H80.75V44.7784ZM85.1968 35.0854H88.354C89.3963 35.0854 90.219 34.8257 90.8247 34.3088C91.4481 33.7919 91.7585 33.0357 91.7585 32.0377C91.7585 31.1338 91.4935 30.4591 90.9635 30.016C90.4512 29.5552 89.6007 29.3235 88.412 29.3235H85.2018V35.0854H85.1968Z"
              fill="black"
            />
            <path
              d="M107.779 44.9998C105.785 44.9998 104.056 44.5848 102.593 43.7548C101.146 42.9044 100.031 41.7332 99.2436 40.2386C98.4562 38.7237 98.0625 36.9796 98.0625 35.0038C98.0625 32.972 98.4638 31.2101 99.2714 29.7155C100.094 28.2006 101.237 27.0294 102.701 26.1993C104.165 25.3489 105.894 24.9263 107.887 24.9263C109.846 24.9263 111.547 25.3413 112.993 26.1713C114.457 27.0013 115.592 28.1649 116.397 29.6595C117.22 31.1362 117.631 32.8803 117.631 34.8943C117.631 36.8701 117.228 38.6244 116.423 40.1546C115.618 41.6695 114.474 42.8585 112.993 43.7268C111.529 44.5746 109.79 44.9998 107.779 44.9998ZM107.86 40.7631C109.104 40.7631 110.111 40.4779 110.878 39.905C111.648 39.3322 112.205 38.604 112.551 37.7179C112.899 36.8319 113.074 35.928 113.074 35.0038C113.074 34.3214 112.973 33.6365 112.771 32.9542C112.587 32.2718 112.286 31.6429 111.865 31.07C111.461 30.4972 110.931 30.0363 110.272 29.685C109.614 29.3336 108.798 29.1579 107.829 29.1579C106.603 29.1579 105.606 29.4431 104.839 30.0159C104.069 30.571 103.504 31.289 103.138 32.1751C102.789 33.0611 102.615 33.993 102.615 34.9707C102.615 35.9484 102.8 36.8803 103.165 37.7663C103.531 38.6524 104.099 39.3729 104.866 39.9254C105.656 40.4856 106.653 40.7631 107.86 40.7631Z"
              fill="black"
            />
            <path
              d="M128.95 44.9998C126.939 44.9998 125.218 44.595 123.789 43.7802C122.363 42.968 121.273 41.8146 120.524 40.3201C119.792 38.8255 119.426 37.0712 119.426 35.0598C119.426 33.0102 119.809 31.2304 120.579 29.7155C121.346 28.2006 122.437 27.0294 123.845 26.1993C125.273 25.3489 126.957 24.9263 128.895 24.9263C130.396 24.9263 131.749 25.1936 132.958 25.7283C134.167 26.263 135.144 27.0574 135.896 28.1089C136.663 29.1426 137.13 30.4539 137.294 32.0401H133.039C132.819 31.1362 132.37 30.4335 131.694 29.9345C131.035 29.4176 130.139 29.1579 129.003 29.1579C127.777 29.1579 126.798 29.4431 126.066 30.0159C125.334 30.571 124.804 31.2814 124.473 32.147C124.163 33.0153 124.006 33.9191 124.006 34.8612C124.006 35.8389 124.17 36.781 124.501 37.6848C124.849 38.5887 125.389 39.3271 126.121 39.9C126.871 40.4728 127.86 40.758 129.084 40.758C129.816 40.758 130.457 40.6485 131.005 40.4245C131.572 40.2029 132.039 39.8796 132.405 39.4544C132.771 39.0292 133.026 38.5225 133.173 37.9318H137.536C137.39 39.4646 136.905 40.7555 136.082 41.8095C135.277 42.8611 134.243 43.6555 132.981 44.1902C131.742 44.7325 130.396 44.9998 128.95 44.9998Z"
              fill="black"
            />
            <path
              d="M140.328 44.7784V25.1733H149.414C150.272 25.1733 151.059 25.265 151.773 25.4509C152.505 25.6164 153.136 25.9041 153.666 26.3089C154.216 26.6959 154.645 27.223 154.956 27.8875C155.266 28.5342 155.423 29.3541 155.423 30.3521C155.423 31.1083 155.248 31.8289 154.9 32.5112C154.552 33.1936 154.057 33.7206 153.419 34.0898C154.279 34.4234 154.966 34.9759 155.478 35.7524C156.011 36.5086 156.273 37.4965 156.273 38.7161C156.273 39.9153 156.053 40.9134 155.614 41.7078C155.193 42.4844 154.607 43.1005 153.858 43.5639C153.126 44.0069 152.283 44.3201 151.334 44.506C150.383 44.6918 149.386 44.7835 148.343 44.7835H140.328V44.7784ZM144.775 40.6512H148.783C149.239 40.6512 149.651 40.613 150.017 40.5391C150.4 40.4475 150.721 40.3278 150.976 40.1801C151.251 40.0146 151.45 39.8008 151.579 39.5436C151.725 39.2661 151.798 38.9529 151.798 38.6015C151.798 38.2324 151.735 37.9268 151.607 37.6875C151.496 37.4481 151.324 37.2546 151.087 37.107C150.85 36.9415 150.564 36.8294 150.236 36.776C149.908 36.7021 149.532 36.6639 149.111 36.6639H144.775V40.6512ZM144.775 32.9823H148.316C148.755 32.9823 149.138 32.9364 149.469 32.8448C149.817 32.7531 150.1 32.6233 150.32 32.4578C150.539 32.2923 150.706 32.0886 150.814 31.8492C150.943 31.6099 151.006 31.3324 151.006 31.0192C151.006 30.594 150.905 30.263 150.706 30.0211C150.521 29.7614 150.256 29.5883 149.911 29.4941C149.562 29.3821 149.141 29.3286 148.646 29.3286H144.777V32.9823H144.775Z"
              fill="black"
            />
            <path
              d="M159.117 44.7784V25.1733H173.444V29.326H163.564V33.0357H171.88V37.0229H163.564V40.6512H173.444V44.7759H159.117V44.7784Z"
              fill="black"
            />
            <path
              d="M181.65 44.7784V29.326H175.805V25.1733H191.999V29.326H186.099V44.7784H181.65Z"
              fill="black"
            />
          </svg>
        </router-link>
        <div class="close_login">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071Z"
              fill="#333333"
            />
          </svg>
        </div>
      </div>
      <div class="login__wrapper">
        <div class="login__content">
          <div v-if="errorFlag" class="alert">
            <div class="alert__text">
              {{ error }}
            </div>
            <div @click="closeError" class="alert__close">
              <svg
                data-v-cd8a3306=""
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  data-v-cd8a3306=""
                  d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                  fill="#333333"
                ></path>
              </svg>
            </div>
          </div>
          <div v-if="showDone" class="done">
            <div class="done__text">
              На почту отправлено письмо с подтверждением.
            </div>
          </div>
          <login-block
            v-if="message == 'login'"
            @erroruser="erroruser"
            @switchTo="switchTo"
          ></login-block>
          <register-block
            v-if="message == 'registration'"
            @switchTo="switchTo"
            @erroruser="erroruser"
            @registerSuccess="registerSuccess"
          ></register-block>
  
          <div class="politic">
            <div v-if="message == 'registration'" class="politic__text">
              Нажимая кнопку «Зарегистрироваться», я даю согласие на обработку
              персональных данных, в соответствии с <span>Политикой</span>, и
              соглашаюсь с <span>Правилами</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="popup">
      <div class="popup__content">
        <a @click="popupToogle" class="close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="#545454"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
        <div class="popup__head">Восстановление пароля</div>
        <div class="form__item">
          <label class="form__label">Электронная почта</label>
          <input
            @input="onEmailChange"
            type="text"
            class="form__input emailChange"
          />
        </div>
        <button class="btn btn-blue default emailValid">Восстановить</button>
      </div>
    </div>
 </div>
</template>

<style scoped>
.alert {
  display: flex;
  justify-content: space-between;
  width: max-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 30px;
  border-radius: 20px;
  background: #ec7777;
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
}
.done {
  margin: 0 auto;
  padding: 30px;
  border-radius: 20px;
  background: #77ec81;
  position: relative;
}
.alert__text {
  color: var(--Black-1200, #2e2e2e);
  font-family: Onest;
  font-size: 20px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;
}
.alert__close {
  position: absolute;
  cursor: pointer;
  right: 10px;
  top: 10px;
}
.close {
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 20px;
}
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 71px;
  padding: 45px 0;
}
.login_head{
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.login__content {
  width: 100%;
  max-width: 536px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  padding: 22px 0;
  height: 100%;
  margin: 0 auto;
  align-items: center;
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
.form__input:autofill,
.form__input:-webkit-autofill,
.form__input:-internal-autofill-selected {
  border-radius: 2px;
  background: var(--Black-200, #f2f2f2);
  color: var(--Black, #111);
  font-family: Onest;
  font-size: 16px;
  font-weight: 400;
  line-height: 20.8px;
  text-align: left;

  padding: 14px 16px;
  outline: none;
  border: 1px solid #eaeaea;
  width: 100%;
  max-width: 100%;
}
.form__input:hover,
.form__input:focus {
  border-radius: 2px;
  background: var(--Black-300, #eaeaea);
  list-style: none;
  outline: none;
}
.form__content {
  display: flex;
  flex-direction: column;
  gap: 22px;
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
