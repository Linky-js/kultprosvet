<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";

export default {
  name: "ContactsPage",
  components: {
    HeaderBlock,
    FooterBlock,
    Breadcrumbs,
    SubscribeBlock,
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[{ name: 'Контакты', link: '/contacts' }]"
    :bannerHead="{ name: 'contacts', uniq: false }"
    :title="'Контакты'"
  />

  <div class="contacts mBlock">
    <div class="container">
      <div class="contacts__content">
        <div class="contacts__info">
          <!-- <div class="contacts__item">
            <div class="label">Адрес:</div>
            <div class="value">
              ООО "495Медиа", 123022, г. Москва, округ ЦАО, район Пресненский, ул. Рочдельская,
              д. 14Бс2
            </div>
          </div>
          <div class="contacts__item">
            <div class="label">Телефон:</div>
            <a href="tel:+7 (495) 198 72 77" class="value"
              >+7 (495) 198 72 77</a
            >
          </div> -->
          <div class="contacts__item">
            <div class="label">E-mail:</div>
            <a href="mailto:pr.495media@mail.ru" class="value"
              >pr.495media@mail.ru</a
            >
          </div>
          <!-- <div class="infoCompany">
            <div class="itemInfo">
              <div class="label">ИНН:</div>
              <div class="value">9725062642</div>
            </div>
            <div class="itemInfo">
              <div class="label">ОГРН:</div>
              <div class="value">1217700485518</div>
            </div>
          </div> -->
        </div>
        <div class="form">
          <div class="head-h2">Напишите нам</div>
          <div class="form__content">
            <input type="text" placeholder="Ваше имя" class="form__input" />
            <input type="text" placeholder="E-mail" class="form__input" />
            <textarea
              placeholder="Сообщение"
              class="form__textarea form__input"
              rows="5"
              cols="30"
              name="message"
              id="message"
            ></textarea>
            <button class="btn-red">Отправить</button>
          </div>
          <div class="description">
            Оставляя свой адрес электронной почты , выдаёте согласие на
            получение рассылки и принимаете условия
            <router-link to="/politics">Политики 495 МЕДИА</router-link> в
            отношении
            <router-link to="/politics"
              >обработки персональных данных</router-link
            >
          </div>
        </div>
      </div>
      <!-- <div class="map">
        <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3Ade871ae056c07c4f2d901d7cc12006b6d37b259bdb473264a637b0dd5b2159cd&amp;source=constructor" width="100%" height="322" frameborder="0"></iframe>
      </div> -->
    </div>
  </div>
  <SubscribeBlock />
  <FooterBlock />
</template>
<style scoped>
.description {
  max-width: 449px;
  color: #7e7e7e;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px; /* 123.077% */
}
.infoCompany {
  display: flex;
  gap: 20px;
}
.itemInfo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.description a {
  color: #5f22c1;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  text-decoration-line: underline;
}
.contacts__content {
  display: flex;
  gap: 150px;
}
.contacts__info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.contacts__item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}
.label {
  color: #949494;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
  line-height: 18px; /* 138.462% */
  text-transform: uppercase;
}
.value {
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 128.571% */
  white-space: inherit;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 594px;
}
.form__content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.form__input {
  background: #f2f2f2;
  padding: 13px 20px;
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 128.571% */
  width: calc(50% - 7.5px);
}
.form__input::placeholder {
  color: #848484;
}
.form__textarea {
  width: 100%;
}
.contacts__content {
  padding-bottom: 90px;
}
.map {
  width: 100%;
  height: 322px;
  filter: grayscale(100%);
}
@media screen and (max-width: 650px) {
  .contacts__content {
    flex-direction: column;
    gap: 40px;
  }
  .form__content {
    gap: 15px;
  }
  .form__input {
    width: 100%;
  }
}
</style>