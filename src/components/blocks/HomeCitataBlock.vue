<script>
export default {
  name: "HomeCitataBlock",
  components: {},
  data() {
    return {
      citata: {
        text: "Мода ― то состояние, <br />которое надо ощущать <br /> на себе. Надо видеть, идёт ли <br />это, подходит ли это именно тебе",
        label: "Валентин Юдашкин, <br /> российский художник-модельер",
        img: require("@/assets/image/yudashkin.png"),
      },
    };
  },

  methods: {
    remoteText(text) {
      const plainText = text.replace(/<\/?[^>]+(>|$)/g, "");

      // Обрезаем текст до 100 символов и добавляем многоточие
      return plainText;
    },
  },
};
</script>


<template>
  <div class="homeCitataBlock mBlock">
    <div class="container">
      <div class="homeCitataBlock__wrapper">
        <div class="citata">
          <img class="citata__img" :src="citata.img" alt="" />

          <div class="citata__content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="53"
              height="40"
              viewBox="0 0 53 40"
              fill="none"
            >
              <path
                d="M34.472 39.04L29.48 31.488C30.6747 30.8053 32.04 29.8667 33.576 28.672C35.112 27.392 36.52 26.0267 37.8 24.576C39.08 23.1253 39.8907 21.8027 40.232 20.608C37.7574 20.352 35.5814 19.3707 33.704 17.664C31.8267 15.9573 30.888 13.568 30.888 10.496C30.888 6.99733 31.9974 4.39467 34.216 2.688C36.4347 0.896001 38.9947 0 41.896 0C45.6507 0.0853322 48.424 1.49333 50.216 4.224C52.008 6.95467 52.904 10.1973 52.904 13.952C52.904 17.9627 52.008 21.6747 50.216 25.088C48.5094 28.5013 46.2054 31.4453 43.304 33.92C40.488 36.3093 37.544 38.016 34.472 39.04ZM5.03204 39.04L0.0400391 31.488C1.32004 30.8053 2.68537 29.8667 4.13604 28.672C5.67204 27.392 7.08004 26.0267 8.36004 24.576C9.64004 23.1253 10.4507 21.8027 10.792 20.608C8.31737 20.352 6.14137 19.3707 4.26404 17.664C2.38671 15.9573 1.44804 13.568 1.44804 10.496C1.44804 6.99733 2.55737 4.39467 4.77604 2.688C6.99471 0.896001 9.55471 0 12.456 0C16.296 0.0853322 19.112 1.49333 20.904 4.224C22.696 6.95467 23.592 10.1973 23.592 13.952C23.592 17.9627 22.6534 21.6747 20.776 25.088C18.984 28.5013 16.68 31.4453 13.864 33.92C11.1334 36.3093 8.18937 38.016 5.03204 39.04Z"
                fill="#E6E6E6"
              />
            </svg>
            <div class="citata__text">
              {{ remoteText(citata.text) }}
            </div>
            <div class="label">
              {{ remoteText(citata.label) }}
            </div>
          </div>
        </div>
        <span class="line"></span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.homeCitataBlock {
  width: 100%;
  overflow: hidden;
}
.homeCitataBlock__wrapper {
  display: flex;
  gap: 117px;
  align-items: center;
}
.line {
  display: block;
  background: #e4e4e4;
  height: 5px;
  width: 100%;
  flex-shrink: 0;
}
.citata {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  height: 366px;
}
.citata__img {
  flex-shrink: 0;
  align-self: flex-start;
}
.citata__content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-self: flex-end;
  width: 391px;
  flex-shrink: 0;
  height: max-content;
  transform: translateX(-42px)
}
.citata__text {
  color: #333;
  font-family: Onest;
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}
.label {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 223px;
  align-self: flex-end;
}
@media screen and (max-width: 1024px) {
  .line{
    display: none;
  }
  .citata{
    width: 100%;
    height: auto;
    flex-direction: column;
  }
  .citata__content{
    flex-shrink: initial;
    max-width: 206px;
    transform: translate(9px, -109px);
  }
  .citata__text{
    font-size: 16px;
  }
  .citata__img{
    max-width: 60%;
  }
  .homeCitataBlock{
    padding: 0;
  }
}
</style>