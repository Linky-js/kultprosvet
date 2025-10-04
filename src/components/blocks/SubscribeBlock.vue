<script>
import validateEmail from "@/directives/validateEmail.js";
import BtnRed from "../ui/BtnRed.vue";
export default {
  name: "SubscribeBlock",
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
          <div class="title">Подпишись <br> на наши новости <br> и подкасты</div>
        </div>
        <div class="subscribe__content__right">
          <div class="form">
            <input
              v-validate-email="updateEmailValidity"
              type="text"
              placeholder="Введите электронную почту"
              class="form__input"
            />
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
  padding-bottom: 90px;
  padding-top: 90px;
}
.subscribe{
    background: #F4F4F4;
}
.subscribe__content {
  display: flex;
  gap: 93px;
  align-items: center;
  padding-left: 47px;
}
.subscribe__content__right {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.title {
  color: #333;
  font-family: Onest;
  font-size: 36px;
  font-style: normal;
  font-weight: 600;
  line-height: 40px; /* 111.111% */
  letter-spacing: -0.72px;
  max-width: 360px;
}
.subscribe__content__right {
  display: flex;
  flex-direction: column;
  gap: 17px;
}
.form__input {
  background: #e7e7e7;
  padding: 13px 20px;
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 128.571% */
  width: 290px;
  outline: none;
  outline: none;
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
.form {
  display: flex;
}
.form__btn {
  border-radius: none;
}
.description {
  max-width: 449px;
  color: #7e7e7e;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px; /* 123.077% */
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
  .subscribe__content{
    flex-direction: column;
    padding-left: 0;
    align-items: flex-start;
    gap: 30px;
  }
  .subscribe__content__right{
    max-width: 100%;
  }
  .subscribe {
  padding-bottom: 45px;
  padding-top: 45px;
}
.title{
  font-size: 30px;
}
}
</style>