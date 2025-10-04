<script>
import BtnRed from "../ui/BtnRed.vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export default {
  name: "PromoTheme",
  data() {
    return {
      timeline: null,
    };
  },
  components: {
    BtnRed,
  },
  mounted() {
    gsap.registerPlugin(ScrollTrigger);

    this.timeline = gsap.timeline();
    this.timeline.fromTo(
      ".promo__theme__content__right",
      { y: "50%", opacity: 0.2 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: ".promo__theme__content",
          start: "top bottom",
          end: "top center+200",
          scrub:true,
        },
      }
    );
  },
};
</script>

<template>
  <div class="promo__theme mBlock">
    <div class="container">
      <div class="promo__theme__content">
        <div class="promo__theme__content__left">
          <img src="@/assets/image/promo.png" alt="" />
        </div>
        <div class="promo__theme__content__right">
          <div class="title">Откройте для себя удивительный мир науки!</div>
          <div class="subtitle">
            Переходи на нашу страничку «Наука» прямо сейчас
          </div>
          <BtnRed>Перейти</BtnRed>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.promo__theme__content {
  display: flex;
  gap: 39px;
  align-items: center;
}
.promo__theme__content__left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.promo__theme__content__right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
}
.title {
  color: #333;
  font-family: Onest;
  font-size: 36px;
  font-style: normal;
  font-weight: 600;
  line-height: 40px; /* 111.111% */
  letter-spacing: -0.72px;
  max-width: 532px;
}
.subtitle {
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 252px;
}
@media screen and (max-width: 1024px) {
  .promo__theme__content__left{
    display: none;
  }
  .title{
    font-size: 30px;
  }
}
</style>