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
  slidesPerView: 'auto',
  spaceBetween: 20,
  modules: modules,
  navigation: {
    prevEl: '.prevSlidenew',
    nextEl: '.nextSlidenew',
  },
  breakpoints: {
    1024: {
      spaceBetween: 20
    },
    300: {
      spaceBetween: 16
    },
  }
})
onMounted(() => {
  swiperOptions.value.navigation.prevEl = prevEl.value
  swiperOptions.value.navigation.nextEl = nextEl.value
})

import back1 from "@/assets/image/home-theme/back-1.png";
import back2 from "@/assets/image/home-theme/back-2.png";
import back3 from "@/assets/image/home-theme/back-3.png";
import back4 from "@/assets/image/home-theme/back-4.png";
import back5 from "@/assets/image/home-theme/back-5.png";
import back6 from "@/assets/image/home-theme/back-6.png";
import back7 from "@/assets/image/home-theme/back-7.png";
import back8 from "@/assets/image/home-theme/back-8.png";
import back9 from "@/assets/image/home-theme/back-9.png";
import back10 from "@/assets/image/home-theme/back-10.png";
import back11 from "@/assets/image/home-theme/back-11.png";
import back12 from "@/assets/image/home-theme/back-12.png";

import img1 from "@/assets/image/home-theme/human-1.png";
import img2 from "@/assets/image/home-theme/human-2.png";
import img3 from "@/assets/image/home-theme/human-3.png";
import img4 from "@/assets/image/home-theme/human-4.png";
import img5 from "@/assets/image/home-theme/human-5.png";
import img6 from "@/assets/image/home-theme/human-6.png";
import img7 from "@/assets/image/home-theme/human-7.png";
import img8 from "@/assets/image/home-theme/human-8.png";
import img9 from "@/assets/image/home-theme/human-9.png";
import img10 from "@/assets/image/home-theme/human-10.png";
import img11 from "@/assets/image/home-theme/human-11.png";
import img12 from "@/assets/image/home-theme/human-12.png";
const slides = [
  {
    id: 1,
    background: back1,
    head: "Музыка",
    text: "Фиолетовый цвет связан с духовностью, воображением и артистизмом",
    img: img1,
    link: "/theme/4",
  },
  {
    id: 2,
    background: back2,
    head: "Лайф менеджмент",
    text: "Зеленый цвет символизирует гармонию, рост и развитие, что очень важно",
    img: img2,
    link: "/theme/1",
  },
  {
    id: 3,
    background: back3,
    head: "Наука",
    text: "Синий цвет ассоциируется с интеллектом, логикой и точностью",
    img: img3,
    link: "/theme/2",
  },
  {
    id: 4,
    background: back4,
    head: "Литература",
    text: "Синий цвет ассоциируется с интеллектом, логикой и точностью",
    img: img4,
    link: "/theme/3",
  },
  {
    id: 5,
    background: back5,
    head: "История ",
    text: "Охра ассоциируется с традициями, стабильностью и опытом",
    img: img5,
    link: "/theme/5",
  },
  {
    id: 6,
    background: back6,
    head: "Архитектура",
    text: "Серый цвет символизирует гармонию, баланс и практичность",
    img: img6,
    link: "/theme/6",
  },
  {
    id: 7,
    background: back7,
    head: "Живопись",
    text: "Желтый цвет олицетворяет яркость, креативность и энергию",
    img: img7,
    link: "/theme/7",
  },
  {
    id: 8,
    background: back8,
    head: "Кино",
    text: "Красный цвет ассоциируется с драмой, эмоциональностью и динамикой",
    img: img8,
    link: "/theme/8",
  },
  {
    id: 9,
    background: back9,
    head: "Спорт",
    text: "Голубой цвет ассоциируется с энергией, динамикой и здоровым образом жизни",
    img: img9,
    link: "/theme/12",
  },
  {
    id: 10,
    background: back10,
    head: "Мода",
    text: "Розовый цвет ассоциируется с женственностью, изысканностью и творчеством",
    img: img10,
    link: "/theme/10",
  },
  {
    id: 11,
    background: back11,
    head: "Философия",
    text: "Темно-синий цвет символизирует глубину, мудрость и абстрактность",
    img: img11,
    link: "/theme/9",
  },
  {
    id: 12,
    background: back12,
    head: "Урбанистика",
    text: "Бирюзовый ассоциируется с практичностью, прочностью и городской средой",
    img: img12,
    link: "/theme/11",
  },
];
</script>

<template>
  <div class="theme">
    <div class="container">
      <div class="theme__head">
        <h2 class="head-h1">12 тем, которые прокачают тебя!</h2>
        <div class="arrowsSlide">
          <div class="prevSlidenew arrow" ref="prevEl">
            <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.5 4H0.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 7.5L0.5 4L4 0.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="nextSlidenew arrow" ref="nextEl">
            <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 4H21.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M18 7.5L21.5 4L18 0.5" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <swiper class="theme__swiper" v-bind="swiperOptions">
        <swiper-slide v-for="slide in slides" :key="slide.id" :class="[`slide__${slide.id}`, 'slide__item']">
          <router-link :to="slide.link" class="slide__link">
            <div class="slide__item-head">
              <div class="head__slide">{{ slide.head }}</div>
              <div class="btn__slide">
                <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0.125 4.37446L11.74 4.37453L8.43306 1.06641L9.31694 0.182522L14.1339 4.99946L9.31694 9.81641L8.43306 8.93252L11.74 5.62453L0.125 5.62446L0.125 4.37446Z"
                    fill="white" />
                </svg>
              </div>
            </div>
            <div class="text__slide">{{ slide.text }}</div>
            <img class="slide__img" :src="slide.img" alt="" />
            <img class="slide__back" :src="slide.background" alt="">
          </router-link>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<style scoped>
.theme {
  margin-top: 374px;
}

.theme__swiper {
  overflow: visible;
}

.theme__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 36px;
}

.head-h1 {
  color: #333;
  font-family: Onest;
  font-size: 50px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  /* 55px */
  letter-spacing: -1px;
  max-width: 616px;
}

.slide__item {
  max-width: 310px;
  height: 380px;
  position: relative;
  background: #F0F2F2;
  border-radius: 28px;
  padding: 20px 20px 0 24px;
  transition: .3s all;
  overflow: hidden;
}

.slide__1:hover {
  background: #6F54EA;
}

.slide__2:hover {
  background: #5BBA46;
}

.slide__3:hover {
  background: #4D88F7;
}

.slide__4:hover {
  background: #FF5A37;
}

.slide__5:hover {
  background: #986932;
}

.slide__6:hover {
  background: #717786;
}

.slide__7:hover {
  background: #F0A942;
}

.slide__8:hover {
  background: #D2313E;
}

.slide__9:hover {
  background: #1B6EBB;
}

.slide__10:hover {
  background: #E54788;
}

.slide__11:hover {
  background: #0C1843;
}

.slide__12:hover {
  background: #416B71;
}

.slide__item:hover {
  box-shadow: 0px 2px 12px 0px rgba(15, 22, 44, 0.2);
}

.slide__item:hover .head__slide {
  color: #fff;
}

.slide__item:hover .text__slide {
  color: #fff;
  opacity: 1;
}

.slide__item:hover .btn__slide {
  transform: rotate(-45deg);
  background: transparent;
}

.slide__item:hover .slide__back {
  opacity: 0.2;
}

.slide__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 34px;
}


.slide__img {
  bottom: 0;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  z-index: 2;
}

.slide__back {
  width: 100%;
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  transition: .3s all;
}

.head__slide {
  color: #333333;
  font-family: Onest;
  font-size: 20px;
  font-weight: 600;
  line-height: 110%;
  transition: .3s all;
  position: relative;
  z-index: 2;
}

.text__slide {
  color: #333333;
  font-family: Onest;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  opacity: 0.8;
  transition: .3s all;
  position: relative;
  z-index: 2;
}

.btn__slide {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .3s all;
  transform: rotate(0deg);
  backdrop-filter: blur(30px);
  position: relative;
  z-index: 2;
}

.slide__1 .btn__slide {
  background: #6F54EA;
}

.slide__2 .btn__slide {
  background: #5BBA46;
}

.slide__3 .btn__slide {
  background: #4D88F7;
}

.slide__4 .btn__slide {
  background: #FF5A37;
}

.slide__5 .btn__slide {
  background: #986932;
}

.slide__6 .btn__slide {
  background: #717786;
}

.slide__7 .btn__slide {
  background: #F0A942;
}

.slide__8 .btn__slide {
  background: #D2313E;
}

.slide__9 .btn__slide {
  background: #1B6EBB;
}

.slide__10 .btn__slide {
  background: #E54788;
}

.slide__11 .btn__slide {
  background: #0C1843;
}

.slide__12 .btn__slide {
  background: #416B71;
}

.theme__slider {
  position: relative;
}

.arrowsSlide {
  display: flex;
  gap: 20px;
}

.arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1px solid rgba(211, 211, 211, 1);
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.arrow:hover {
  background: rgba(95, 34, 193, 1);
}

.arrow:hover path {
  stroke: #fff;
}


@media screen and (max-width: 1024px) {
  .arrowsSlide {
    display: none;
  }
  .theme__head {
    margin-bottom: ;
  }
  .head-h1 {
    font-size: 24px;
  }
  .theme {
    margin-top: 100px;
  }
  .slide__item {
    max-width: 260px;
    height: 320px;
    padding: 14px 14px 0 20px;
    box-shadow: 0px 2px 12px 0px rgba(15, 22, 44, 0.2);
  }
  .btn__slide {
    transform: rotate(-45deg);
    background: transparent;  
    border-color: rgba(255, 255, 255, 0.5);
    width: 32px;
    height: 32px;
  }
  .btn__slide svg {
    height: 6.74px;
    width: 9.81px;
  }
  .slide__item-head {
    margin-bottom: 50px;
  }
  .slide__1 {background: #6F54EA;}
  .slide__2 {background: #5BBA46;}
  .slide__3 {background: #4D88F7;}
  .slide__4 {background: #FF5A37;}
  .slide__5 {background: #986932;}
  .slide__6 {background: #717786;}
  .slide__7 {background: #F0A942;}
  .slide__8 {background: #D2313E;}
  .slide__9 {background: #1B6EBB;}
  .slide__10 {background: #E54788;}
  .slide__11 {background: #0C1843;}
  .slide__12 {background: #416B71;}
  .slide__back {
    opacity: .3;
  }
  .head__slide {
    font-size: 18px;
    color: #fff;
  }
  .text__slide {
    color: rgba(255, 255, 255, 0.8);
    opacity: 1;
    font-size: 13px;
  } 
  .slide__1 .slide__img {
    width: 148px;
  }
  .slide__2 .slide__img {
    width: 204px;
  }
  .slide__3 .slide__img {
    width: 209px; 
  }
  .slide__4 .slide__img {
    width: 219px;
    bottom: -35px;
  }
  .slide__5 .slide__img {
    width: 165px;
  }
  .slide__6 .slide__img {
    width: 242px;
  }
  .slide__7 .slide__img {
    width: 190px;
  }
  .slide__8 .slide__img {
    width: 215px;
  }
  .slide__9 .slide__img {
    width: 164px;
  }
  .slide__10 .slide__img {
    width: 297px;
  }
  .slide__11 .slide__img {
    width: 176px;
  }
  .slide__12 .slide__img {
    width: 208px;
  }
}
</style>