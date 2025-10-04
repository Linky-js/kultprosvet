<script>
import BtnRed from "../ui/BtnRed.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default {
  name: "HomeSliderBlock",
  components: {
    BtnRed,
    Swiper,
    SwiperSlide,
  },
  setup() {
    const swiperActiveIndex = 0; // начальный активный индекс
    const onSwiper = (swiper) => {
      console.log(swiper.activeIndex);
    };
    return {
      onSwiper,
      swiperActiveIndex,
      modules: [Navigation, Pagination, Scrollbar, A11y],
    };
  },
  data() {
    return {
      sliders: [
        {
          id: 1,
          imgUrl: require("@/assets/image/ban1.webp"),
        },
        {
          id: 2,
          imgUrl: require("@/assets/image/ban2.webp"),
        },
        {
          id: 3,
          imgUrl: require("@/assets/image/ban3.webp"),
        },
        // {
        //   id: 4,
        //   imgUrl: require("@/assets/image/main2.jpg"),
        // },
        // {
        //   id: 5,
        //   imgUrl: require("@/assets/image/main3.jpg"),
        // },
        // {
        //   id: 6,
        //   imgUrl: require("@/assets/image/main4.jpg"),
        // },
        // {
        //   id: 7,
        //   imgUrl: require("@/assets/image/main2.jpg"),
        // },
      ],
      timeline: null,
    };
  },
  mounted() {
    gsap.registerPlugin(ScrollTrigger);
    this.timeline = gsap.timeline();
    this.timeline.fromTo(
      ".home-slider-block__head",
      { y: "50%", opacity: 0.2 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: ".home-slider-block",
          start: "top bottom",
          end: "top center+200",
          scrub: 2,
        },
      }
    );
    this.timeline.fromTo(
      ".home-slider-block__text",
      { y: "55%", opacity: 0.2 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: ".home-slider-block",
          start: "top bottom",
          end: "top center+200",
          scrub: 2,
        },
      }
    );
    this.timeline.fromTo(
      ".home-slider-block__slider",
      { x: "55%", opacity: 0.2 },
      {
        opacity: 1,
        x: 0,
        scrollTrigger: {
          trigger: ".home-slider-block",
          start: "top bottom",
          end: "top center+200",
          scrub: 2,
        },
      }
    );
  },
};
</script>

<template>
  <div class="home-slider-block mBlock ">
    <div class="container">
      <div class="home-slider-block__content">
        <div class="home-slider-block__head">
          <h1 class="head-h2">
            О ПРОЕКТЕ
          </h1>
        </div>
        <div class="home-slider-block__wrapper">
          <div class="home-slider-block__text">
            <p class="description">
              Данный образовательный проект направлен на развитие ключевых навыков и компетенций, необходимых для успешного будущего старшеклассников
            </p>
            <btn-red :link="'/about'" style="max-width: max-content"
              >Подробнее о компании</btn-red
            >
            <div class="arrows">
              <a class="arrow-prev">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <path
                    d="M13.75 17.4805L7.26819 10.9987L13.75 4.51684"
                    stroke="#111111"
                    stroke-width="1.28333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
              <a class="arrow-next"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <path
                    d="M8.25 4.51953L14.7318 11.0013L8.25 17.4832"
                    stroke="#111111"
                    stroke-width="1.28333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          <swiper
            class="home-slider-block__slider"
            :slidesPerView="'auto'"
            :spaceBetween="20"
            :loop="true"
            :modules="modules"
            :navigation="{
              enabled: true,
              prevEl: '.arrow-prev',
              nextEl: '.arrow-next',
            }"
            :breakpoints="{
              1600: {
                spaceBetween: 20,
              },
              1440: {
                spaceBetween: 20,
              },
              1280: {
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              768: {
                spaceBetween: 12,
              },
              320: {
                spaceBetween: 12,
              },
            }"
            @swiper="onSwiper"
          >
            <swiper-slide v-for="slide in sliders" :key="slide.id">
              <img :src="slide.imgUrl" alt="" />
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-slider-block{
  overflow: hidden;
  margin-top: 300px;
}
.arrows {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 36px;
}
.arrows a {
  cursor: pointer;
}
.home-slider-block__content {
  display: flex;
  flex-direction: column;
  gap: 84px;
}
.home-slider-block__wrapper {
  display: flex;
  gap: 60px;
}
.home-slider-block__text {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}
.swiper-slide img {
  height: 408px;
  object-fit: cover;
  object-position: center;
}
.swiper-slide {
  width: max-content;
}
.description {
  max-width: 288px;
}
.swiper {
  width: 100%;
  flex-shrink: 0;
}

@media screen and (max-width: 1024px) {
  .home-slider-block__content {
    gap: 58px;
  }
  .swiper-slide img {
    height: 328px;
  }
  .home-slider-block__text {
    gap: 16px;
  }
}
@media screen and (max-width: 650px) {
  .home-slider-block__wrapper {
    flex-direction: column;
    gap: 56px;
  }
  .home-slider-block__content {
    gap: 30px;
  }
  .swiper-slide img {
    height: 222px;
  }
}
</style>