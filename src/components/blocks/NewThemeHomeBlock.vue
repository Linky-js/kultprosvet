<script setup>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'

const modules = [Navigation]

const prevEl = ref(null)
const nextEl = ref(null)

const swiperOptions = ref({
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: {
    prevEl: null,
    nextEl: null
  }
})
onMounted(() => {
  swiperOptions.value.navigation.prevEl = prevEl.value
  swiperOptions.value.navigation.nextEl = nextEl.value
})

import ban1 from "@/assets/image/muz-ban.png";
import ban2 from "@/assets/image/ban2.png";
import ban3 from "@/assets/image/ban3.png";
import ban4 from "@/assets/image/ban4.png";
import ban5 from "@/assets/image/ban5.png";
import ban6 from "@/assets/image/ban6.png";
import ban7 from "@/assets/image/ban7.png";
import ban8 from "@/assets/image/ban8.png";
import ban9 from "@/assets/image/ban9.png";
import ban10 from "@/assets/image/ban10.png";
import ban11 from "@/assets/image/ban11.png";
import ban12 from "@/assets/image/ban12.png";

import img1 from "@/assets/image/muz-img.png";
import img2 from "@/assets/image/img2.png";
import img3 from "@/assets/image/img3.png";
import img4 from "@/assets/image/img4.png";
import img5 from "@/assets/image/img5.png";
import img6 from "@/assets/image/img6.png";
import img7 from "@/assets/image/img7.png";
import img8 from "@/assets/image/img8.png";
import img9 from "@/assets/image/img9.png";
import img10 from "@/assets/image/img10.png";
import img11 from "@/assets/image/img11.png";
import img12 from "@/assets/image/img12.png";

const slides = [
  {
    id: 1,
    background: ban1,
    head: "Музыка",
    text: "— фиолетовый цвет. Фиолетовый цвет связан с духовностью, воображением и артистизмом, что соответствует музыкальной тематике.",
    img: img1,
    link: "/theme/4",
  },
  {
    id: 2,
    background: ban2,
    head: "Лайф менеджмент",
    text: "— зеленый цвет. Зеленый цвет символизирует гармонию, рост и развитие, что очень важно для лайф менеджмента.",
    img: img2,
    link: "/theme/1",
  },
  {
    id: 3,
    background: ban3,
    head: "Наука",
    text: "— синий цвет. Синий цвет ассоциируется с интеллектом, логикой и точностью, что соответствует научной тематике.",
    img: img3,
    link: "/theme/2",
  },
  {
    id: 4,
    background: ban4,
    head: "Литература",
    text: "— оранжевый цвет. Оранжевый цвет олицетворяет творчество, вдохновение и эмоциональность, что характерно для литературы.",
    img: img4,
    link: "/theme/3",
  },
  {
    id: 5,
    background: ban5,
    head: "История ",
    text: "— коричневый цвет. Коричневый цвет ассоциируется с традициями, стабильностью и опытом, что отражает суть истории.",
    img: img5,
    link: "/theme/5",
  },
  {
    id: 6,
    background: ban6,
    head: "Архитектура",
    text: "— серый цвет. Серый цвет символизирует гармонию, баланс и практичность, что важно для архитектурной тематики.",
    img: img6,
    link: "/theme/6",
  },
  {
    id: 7,
    background: ban7,
    head: "Живопись",
    text: "— желтый цвет. Желтый цвет олицетворяет яркость, креативность и энергию, что характерно для живописи.",
    img: img7,
    link: "/theme/7",
  },
  {
    id: 8,
    background: ban8,
    head: "Кино",
    text: "— красный цвет. Красный цвет ассоциируется с драмой, эмоциональностью и динамикой, что соответствует кинотематике.",
    img: img8,
    link: "/theme/8",
  },
  {
    id: 9,
    background: ban9,
    head: "Философия",
    text: "— темно-синий цвет. символизирует глубину, мудрость и абстрактность, что отражает суть философии.",
    img: img9,
    link: "/theme/9",
  },
  {
    id: 10,
    background: ban10,
    head: "Мода",
    text: "— розовый цвет. Розовый цвет ассоциируется с женственностью, изысканностью и творчеством, что характерно для модной тематики",
    img: img10,
    link: "/theme/10",
  },
  {
    id: 11,
    background: ban11,
    head: "Урбанистика",
    text: "— цвет хаки. Цвет хаки ассоциируется с практичностью, прочностью и городской средой, что соответствует теме урбанистики.",
    img: img11,
    link: "/theme/11",
  },
  {
    id: 12,
    background: ban12,
    head: "Спорт",
    text: "— голубой цвет. Голубой цвет ассоциируется с энергией, динамикой и здоровым образом жизни, что отражает суть спортивной тематики.",
    img: img12,
    link: "/theme/12",
  },
];
</script>

<template>
  <div class="themeBlock">
    <div class="container">
      <h2 class="head-h1">12 тем, которые прокачают тебя!</h2>
    </div>
    <div class="theme__slider">
      <div class="arrowsSlide">
        <div class="prevSlidenew arrow" ref="prevEl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="12"
            viewBox="0 0 21 12"
            fill="none"
          >
            <path
              d="M0.469669 5.46967C0.176777 5.76256 0.176777 6.23744 0.469669 6.53033L5.24264 11.3033C5.53553 11.5962 6.01041 11.5962 6.3033 11.3033C6.59619 11.0104 6.59619 10.5355 6.3033 10.2426L2.06066 6L6.3033 1.75736C6.59619 1.46447 6.59619 0.989593 6.3033 0.696699C6.01041 0.403806 5.53553 0.403806 5.24264 0.696699L0.469669 5.46967ZM21 5.25L1 5.25V6.75L21 6.75V5.25Z"
              fill="white"
            />
          </svg>
        </div>
        <div class="nextSlidenew arrow" ref="nextEl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="12"
            viewBox="0 0 21 12"
            fill="none"
          >
            <path
              d="M20.5303 6.53033C20.8232 6.23744 20.8232 5.76256 20.5303 5.46967L15.7574 0.696699C15.4645 0.403806 14.9896 0.403806 14.6967 0.696699C14.4038 0.989593 14.4038 1.46447 14.6967 1.75736L18.9393 6L14.6967 10.2426C14.4038 10.5355 14.4038 11.0104 14.6967 11.3033C14.9896 11.5962 15.4645 11.5962 15.7574 11.3033L20.5303 6.53033ZM0 6.75L20 6.75V5.25L0 5.25L0 6.75Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      <swiper
        class="theme__swiper"
        :slidesPerView="1"
        :spaceBetween="20"
        :modules="modules"
        :navigation="{
          enabled: true,
          prevEl: '.prevSlidenew',
          nextEl: '.nextSlidenew',
        }"
        v-bind="swiperOptions"
      >
        <swiper-slide
          v-for="slide in slides"
          :key="slide.id"
          class="theme__item"
        >
          <div
            class="slide__item"
            :style="{
              backgroundImage: `url(${slide.background})`,
            }"
          >
            <div class="container">
              <div class="slide__content">
                <div class="head__slide">{{ slide.head }}</div>
                <div class="text__slide">
                  {{ slide.text }}
                </div>
                <router-link :to="slide.link" class="btn__slide">Перейти</router-link>
                <img class="absolute slide__img" :src="slide.img" alt="" />
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<style scoped>
.themeBlock {
  overflow: hidden;
  margin-top: 374px;
}
.head-h1 {
  color: #333;
  font-family: Onest;
  font-size: 50px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%; /* 55px */
  letter-spacing: -1px;
  max-width: 616px;
  margin-bottom: 20px;
}
.slide__item {
  height: 550px;
}
.container {
  height: 100%;
}
.slide__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  height: 100%;
  padding: 35px 0;
}
.slide__item {
  background-position: center;
  background-size: cover;
}
.slide__img {
  bottom: 0;
  right: 154px;
}
.head__slide {
  color: #fff;
  font-family: Onest;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%; /* 35.2px */
  letter-spacing: -0.64px;
}
.text__slide {
  color: #fff;
  font-family: Onest;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  max-width: 464px;
}
.btn__slide {
  color: #5f22c1;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 90% */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 15px 40px;
  border-radius: 128px;
  background: #fff;
  border: 1px solid #fff;
  width: max-content;
  margin-top: auto;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}
.btn__slide:hover {
  border: 1px solid #5f22c1;
  transform: scale(1.1);
}
.theme__slider{
  position: relative;

}
.arrowsSlide{
  position: absolute;
  bottom: 35px;
  right: 70px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 3;
}
.arrow{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}
.arrow:hover{
  transform: scale(1.1);
}
.prevSlide{
  transform: rotate(180deg);
}
@media screen and (max-width: 1024px) {
  .slide__img {
    max-width: 100%;
    right: 0;
    max-height: 395px;
  }
  .head__slide {
    font-size: 18px;
  }
  .text__slide {
    font-size: 16px;
  }
  .btn__slide {
    font-size: 16px;
  }
  .head-h1 {
    font-size: 24px;
  }
  .themeBlock {
    margin-top: 100px;
  }
}
</style>