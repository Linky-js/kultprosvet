<script>
import validateEmail from "@/directives/validateEmail.js";
import BtnRed from "../ui/BtnRed.vue";
import img from "@/assets/image/news-img.png";
export default {
  name: "SubscribeBlock",
  setup() {
    return {
      img,
    };
  },
  components: {
    BtnRed,
  },
  directives: {
    validateEmail,
  },
  data() {
    return {
      isEmailValid: false,
    };
  },
  methods: {
    updateEmailValidity(isValid) {
      this.isEmailValid = isValid;
    },
  },
};
</script>
<template>
  <div class="subscribe">
    <div class="container">
      <div class="subscribe__content">
        <div class="subscribe__content__left">
          <img :src="img" alt="" />
          <div class="title">Подпишись на наши  <br/>новости и подкасты</div>
        </div>
        <div class="subscribe__content__right">
          <div class="form">
            <input v-validate-email="updateEmailValidity" type="text" placeholder="Введите электронную почту"
              class="form__input" />
            <BtnRed class="form__btn">Подписаться</BtnRed>
          </div>
          <div class="description">
            Оставляя свой адрес электронной почты , выдаёте согласие на
            получение рассылки и принимаете условия
            <router-link to="/politics">Политики 495 МЕДИА</router-link> в отношении
            <router-link to="/politics">обработки персональных данных</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.subscribe {
  padding: 23px 0;
}

.subscribe {
  background: #F4F4F4;
}

.subscribe__content {
  display: flex;
  gap: 42px;
  align-items: center;
  justify-content: space-between;
}

.subscribe__content__left {
  display: flex;
  align-items: center;
  gap: 41px;
}


.title {
  color: #333;
  font-family: Onest;
  font-size: 36px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: -0.02em;
  max-width: 487px;
}

.subscribe__content__right {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form {
  position: relative;
}
.form__input {
  background: #e7e7e7;
  padding: 21px;
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  width: 530px;
  outline: none;
  border-radius: 100px;
  border: 1px solid #eaeaea;
}

.form__input:focus {
  outline: none;
}

.form__input:hover {
  outline: none;
}

.form__input::placeholder {
  color: #848484;
}



.form__btn {
  position: absolute;
  top: 4px;
  right: 4px;
  border-radius: 100px;
  height: 54px;
  width: 150px;
  font-size: 14px;
  line-height: 1;
}

.description {
  max-width: 446px;
  color: #7e7e7e;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  padding-left: 22px;
}

.description a {
  color: #5F22C1;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  text-decoration-line: underline;
}

@media screen and (max-width: 1024px) {
  .subscribe__content {
    flex-direction: column;
    padding-left: 0;
    align-items: center;
    max-width: 337px;
    margin: 0 auto;
    gap: 30px;
  }
  .subscribe__content__left {
    flex-direction: column;
    justify-content: center;
    gap: 0;
    align-items: center;
  }
  .subscribe__content__left img {
    width: 122px;
  }
  .subscribe__content__right {
    max-width: 100%;
    gap: 32px;
  }

  .subscribe {
    padding-bottom: 44px;
    padding-top: 0;
  }
  .form__input {
    max-width: 337px;
    width: 100%;
  }
  .form__btn {
    width: 120px;
  }
  .description {
    padding-left: 16px;
  }
  .title {
    font-size: 26px;
  }
}
</style>