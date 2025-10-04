<script>
// import axios from "axios";
export default {
  name: "HomeSliderBlock",
  components: {},
  created() {},
  methods: {
    getSlideStyle(imgUrl) {
      return {
        background:
          `url(` + this.apiDomain + `/web/uploads/${imgUrl}) no-repeat`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      };
    },
    slideTop(index) {
      return index * 100; // ваш метод slideTop для вычисления top
    },
    progressWidth(index) {
      if (index === this.currentIndex) {
        return this.i + "%";
      } else {
        return "0%";
      }
    },
    progress() {
      if (this.progressBars.length === 0) {
        this.progressBars = document.querySelectorAll(".progress-bar__item");
        return;
      }
      if (this.i === 5000) {
        this.i = 0;
        this.progressBars.forEach((bar) => bar.classList.remove("active"));
        this.currentIndex++;
        if (this.currentIndex === this.slides.length) {
          this.currentIndex = 0;
        }
        if (this.currentIndex === 0 && this.isSlideScrollComplete) {
          this.isSlideScrollComplete = false;
        }
      } else {
        this.i += 100;
        // Применяем класс active только к активному прогресс бару
        this.progressBars[this.currentIndex].classList.add("active");
      }
    },
    progressScroll() {
      const slideWrapper = this.$refs.slideWrapper;
      const rect = slideWrapper.getBoundingClientRect();
      if (!this.isSlideScrollComplete && !this.isScrolling && rect.top >= 0) {
        this.isScrolling = true;
        this.nextSlide();
        setTimeout(() => {
          this.isScrolling = false;
        }, 1500);
      }
    },
    nextSlide() {
      if (this.currentIndex < this.slides.length - 1) {
        this.i = 5000;
        this.progress();
      } else {
        this.isSlideScrollComplete = true;
      }
    },
    preventScroll(event) {
      const slideWrapper = this.$refs.slideWrapper;
      const rect = slideWrapper.getBoundingClientRect();
    
      if (!this.isSlideScrollComplete && rect.top >= 0) {
        event.preventDefault();
      }
    },
    // async getBanners() {
    //   let params = `&auth=${this.user.username}:${this.user.auth_key}`;
    //   axios
    //     .get(this.apiUrl + "api/banner/get-banner-home" + params)
    //     .then((response) => {
    //      
    //       this.slides = response.data;
          
          
    //       this.i = 0;
    //       this.progressInterval = setInterval(this.progress, 100);
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //     });
    // },
    getImageUrl(slide) {
      // Используем мобильное изображение, если isMobile true
      return this.isMobile ? slide.imgMob : slide.imgUrl;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },
  },
  mounted() {
    // this.getBanners();
    this.i = 0;
    this.progressInterval = setInterval(this.progress, 100);
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    clearInterval(this.progressInterval);
    window.removeEventListener("resize", this.handleResize);
  },
  data() {
    return {
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      isMobile: window.innerWidth <= 768,
      slides: [
        {
          id: 1,
          imgUrl: require("@/assets/image/main1.webp"),
          imgMob: require("@/assets/image/main1-mob.webp"),
          head: "Световые решения для вашего проекта",
          subHead:
            "Lumatica видит будущее, где свет становится более чем просто источником освещения. Свет становится ключом к новым возможностям, знаниям и вдохновению.",
        },
        {
          id: 2,
          imgUrl: require("@/assets/image/main2.webp"),
          imgMob: require("@/assets/image/main2-mob.webp"),
          head: "Магия освещения: Уют и Стиль",
          subHead:
            "Качественное освещение может создавать уют, подчеркивать дизайн интерьера и делать пребывание в этих местах более приятным и запоминающимся",
        },
        {
          id: 3,
          imgUrl: require("@/assets/image/main3.webp"),
          imgMob: require("@/assets/image/main3-mob.webp"),
          head: "Игра света — новое видение",
          subHead:
            "Меняется освещение, меняется и восприятие того, что видишь",
        },
        {
          id: 4,
          imgUrl: require("@/assets/image/main4.webp"),
          imgMob: require("@/assets/image/main4-mob.webp"),

          head: "Игра света — новое видение",
          subHead:
            "Меняется освещение, меняется и восприятие того, что видишь",
        },
        {
          id: 5,
          imgUrl: require("@/assets/image/main5.webp"),
          imgMob: require("@/assets/image/main5-mob.webp"),
          head: "Игра света — новое видение",
          subHead:
            "Меняется освещение, меняется и восприятие того, что видишь",
        },
      ],
    //   slides: [],
      currentIndex: 0,
      progressInterval: null,
      isSlideScrollComplete: false,
      isScrolling: false,
      progressBars: [],
    };
  },
};
</script>

<template>
  <div
    @wheel="progressScrollG"
    ref="slideWrapper"
    class="home-main slide-wrapper"
  >
    <div class="slide-slider">
      <div
        class="slide"
        v-for="(slide, index) in slides"
        :key="slide.id"
        :style="{ backgroundImage: `url(${getImageUrl(slide)})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }"
        :class="{ active: currentIndex === index }"
      >
        
      </div>
    </div>
    <div class="progress-bar">
      <div
        class="progress-bar__item"
        v-for="(slide, index) in slides"
        :key="'progress' + index"
        :class="{ active: currentIndex === index }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.slide-wrapper {
  background: #FFF;
  overflow: hidden;
  position: relative;
}
.slide-slider {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.slide {
  width: 100%;
  height: 100%;
  position: absolute;
  transition: 2s all;
  z-index: 1;
  opacity: 1;
  bottom: -100vh;
  transform: scale(0.8);
  transition: 2s all;
}
.slide.active {
  z-index: 2;
  bottom: 0;
  opacity: 1;
  transform: scale(1);
  transition: 2s all;
}
.container {
  height: 100%;
}
.home-main__content {
  display: flex;
  flex-direction: column;
  padding-bottom: 194px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 36px;
  height: 100%;
}
.head-h2 {
  max-width: 996px;
}
.sub-head-h2 {
  max-width: 795px;
}
.btn-opacity {
  border: 1px solid var(--White, #fff);
  padding: 16.5px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--White, #fff);
  font-family: "Suisse Intl";
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  width: 288px;
  margin-top: 12px;
}
.progress-bar {
  justify-content: space-between;
  display: flex;
  gap: 15px;
  bottom: 25px;
  position: absolute;
  width: 100%;
  z-index: 2;
  bottom: 25px;
  left: 0;
  height: 2px;
  padding: 0 50px;
}
.progress-bar__item {
  width: 100%;
  height: 2px;
  display: block;
  background: #fff;
  position: relative;
}
.progress-bar__item:before {
  position: absolute;
  background: #fff;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  content: "";
}
.progress-bar__item.active:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0; /* Начальная ширина для анимации */
  background-color: #EC4E44; /* Цвет активного прогресс бара */
  animation: progressAnimation 5s linear forwards; /* Анимация заполнения прогресс бара */
}
@keyframes progressAnimation {
  100% {
    width: 100%;
  }
}
@media screen and (max-width: 1024px) {
  .slide-slider {
    max-height: 455px;
  }
  .home-main__content {
    padding-bottom: 50px;
    gap: 24px;
  }
  .btn-opacity {
    font-size: 12px;
    padding: 12px;
    width: 184px;
  }
  .head-h2,
  .sub-head-h2 {
    max-width: 454px;
  }
}
@media screen and (max-width: 650px) {
  .slide-slider {
    max-height: none;
  }
  .home-main__content {
    justify-content: center;
  }
}
</style>