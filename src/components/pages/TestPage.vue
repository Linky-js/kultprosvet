<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import Breadcrumbs from "../ui/Breadcrumbs.vue";
import TestFront from "../elements/TestFront.vue";
import AnimatedNumber from "../ui/AnimatedNumber.vue";

import axios from "axios";

export default {
  name: "TestPage",
  components: {
    HeaderBlock,
    Breadcrumbs,
    TestFront,
    AnimatedNumber,
  },
  data() {
    return {
      test: null,
      apiUrl: this.$store.getters.getApiUrl,
      user: this.$store.getters.getUser,
      logedUser: true,
      questions: [],
      number: null,
    };
  },
  methods: {
    getTest() {
      if (this.user.username === "guest") {
        setTimeout(() => {
          let circles = document.querySelectorAll(".circle");
          circles.forEach((circle) => {
            circle.classList.add("active");
          });
          let text = document.querySelector(".animation-text");
          text.classList.add("active");
        }, 1500);
        this.logedUser = false;
        return;
      }
      setTimeout(() => {
        document.querySelector(".tests").classList.remove("opacityB");
      }, 500);
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(
          this.apiUrl +
            "api-test/get" +
            authGet +
            `&id=${this.$route.params.id}`
        )
        .then((response) => {
          this.test = response.data.test;
          this.getQuestions();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getQuestions() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(
          this.apiUrl +
            "api-test-q/get-list" +
            authGet +
            `&test_id=${this.test.id}`
        )
        .then((response) => {
          this.questions = response.data.qs;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    goToResult(result) {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      let params = {
        user_id: this.user.user_id,
        test_id: this.test.id,
        points: result,
      };

      axios
        .post(this.apiUrl + "api-test/set-user-to-test" + authGet, params, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          document.querySelector(".tests").classList.add("opacityB");
          setTimeout(() => {
            this.number = result;
          }, 500);
          setTimeout(() => {
            document.querySelector(".well-done").classList.remove("opacityB");
          }, 600);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async copyUrl(event) {
      try {
        const el = event.currentTarget;

        // Проверяем, доступен ли метод share
        if (navigator.share) {
          await navigator.share({
            title: document.title,
            text: window.location.href,
            url: window.location.href,
          });
        } else {
          // Копирование ссылки в буфер обмена для десктопов или неподдерживаемых устройств
          const url = window.location.href;
          await navigator.clipboard.writeText(url);
          el.classList.add("active");

          setTimeout(() => {
            el.classList.remove("active");
          }, 1000);
        }
      } catch (err) {
        console.error("Ошибка копирования/разделения: ", err);
      }
    },
  },
  mounted() {
    this.getTest();
  },
};
</script>

<template>
  <HeaderBlock />
  <Breadcrumbs
    :page="[
      { name: 'Тесты', link: '/tests' },
      { name: test?.name, link: '' },
    ]"
    :title="test?.name"
    :bannerHead="{ name: 'tests', uniq: false }"
  />
  <div v-if="logedUser && !number" class="tests opacityB mBlock">
    <div class="container">
      
      <div class="tests__content">
        <div class="head-h2">{{ test?.name }}</div>
        <div class="test__questions">
          <TestFront @submit="goToResult" :questions="questions" />
        </div>
      </div>
      <a @click="copyUrl" class="desc__share">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M16.4405 8.89999C20.0405 9.20999 21.5105 11.06 21.5105 15.11V15.24C21.5105 19.71 19.7205 21.5 15.2505 21.5H8.74047C4.27047 21.5 2.48047 19.71 2.48047 15.24V15.11C2.48047 11.09 3.93047 9.23999 7.47047 8.90999"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g opacity="0.4">
            <path
              d="M12 15.0001V3.62012"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.3504 5.85L12.0004 2.5L8.65039 5.85"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>

        <span>Поделиться</span>
      </a>
    </div>
  </div>
  <div class="content-wrap" v-if="!logedUser">
    <!-- <div class="content">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div> -->

    <div class="animation-text">
      Что бы пройти тест, нужно <router-link to="/login">войти</router-link> в
      аккаунт
    </div>
  </div>
  <div v-if="logedUser && number" class="well-done opacityB">
    <div class="well-done__content">
      <div class="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="77"
          height="77"
          viewBox="0 0 77 77"
          fill="none"
        >
          <g clip-path="url(#clip0_2127_1285)">
            <path
              d="M42.5136 0.317862C46.1856 0.73655 49.7324 1.73755 52.1867 4.57211C54.6171 7.36817 55.3438 11.2037 55.3438 15.6409C55.3438 17.8883 54.9251 21.0261 54.5882 23.5189L54.516 24.0627H61.3594C64.2613 24.0627 67.0093 24.4718 69.3866 25.6653C71.8314 26.8877 73.7708 28.933 74.8584 31.4403C77.0385 36.2432 76.9663 43.2165 75.7632 52.211L75.5707 53.6837C75.0654 57.4855 74.6323 60.7725 74.0644 63.4675C73.4339 66.4994 72.5484 69.2858 70.8496 71.514C67.2306 76.2639 61.1476 77.0002 52.9375 77.0002C44.044 77.0002 37.3739 75.3977 31.8202 73.8577C31.0278 73.6395 30.2658 73.4262 29.5343 73.2176C26.3677 72.3225 23.7593 71.5814 21.2328 71.2204C20.6769 72.9027 19.6048 74.3668 18.1688 75.4045C16.7328 76.4422 15.0061 77.0006 13.2344 77.0002H8.42188C6.18825 77.0002 4.04612 76.1129 2.46671 74.5335C0.887302 72.9541 0 70.812 0 68.5784L0 32.4846C0 27.8357 3.773 24.0627 8.42188 24.0627H13.2344C14.7101 24.0626 16.1599 24.4502 17.4386 25.1867C18.7174 25.9232 19.7801 26.9827 20.5205 28.2592C21.7621 27.7539 23.3599 26.9695 24.9384 25.8145C28.1676 23.4564 31.2812 19.6304 31.2812 13.2346V10.8284C31.2812 5.04374 36.0649 -0.41845 42.5136 0.317862ZM21.6562 64.0065C25.0491 64.43 28.3456 65.3732 31.6278 66.3069L33.7501 66.9084C39.0246 68.3762 44.9824 69.7863 52.9375 69.7863C61.5711 69.7863 63.91 68.7131 65.1035 67.1442C65.8109 66.2154 66.4317 64.7139 66.9996 61.9949C67.5049 59.579 67.9044 56.5856 68.4193 52.7067L68.6118 51.263C69.8149 42.2059 69.5214 37.1479 68.2846 34.4337C67.8816 33.4297 67.1249 32.6079 66.1574 32.1237C65.1564 31.6232 63.6549 31.2863 61.3594 31.2863H52.9375C49.6361 31.2863 46.7053 28.5095 47.1336 24.8568C47.2491 23.9264 47.371 22.9863 47.4994 22.0367C47.8122 19.6882 48.125 17.3685 48.125 15.6457C48.125 11.7524 47.432 10.1113 46.739 9.31242C46.0797 8.55205 44.8044 7.84942 41.6955 7.4933C40.2181 7.32005 38.5 8.62905 38.5 10.8284V13.2346C38.5 22.4842 33.7934 28.2881 29.1974 31.6424C26.8972 33.3187 24.354 34.6333 21.6562 35.5406V64.0065ZM13.2344 31.2815H8.42188C8.10279 31.2815 7.79677 31.4082 7.57114 31.6339C7.34551 31.8595 7.21875 32.1655 7.21875 32.4846V68.5784C7.21875 69.2425 7.75775 69.7815 8.42188 69.7815H13.2344C13.5535 69.7815 13.8595 69.6547 14.0851 69.4291C14.3107 69.2035 14.4375 68.8974 14.4375 68.5784V32.4846C14.4375 32.1655 14.3107 31.8595 14.0851 31.6339C13.8595 31.4082 13.5535 31.2815 13.2344 31.2815Z"
              fill="#DEDEDE"
            />
          </g>
          <defs>
            <clipPath id="clip0_2127_1285">
              <rect width="77" height="77" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div class="contentTest">
        <div class="text">Поздравляем! Вы набрали</div>
        <div class="number-wrap">
          <div class="number">
            <AnimatedNumber :number="number" />
          </div>
          <div class="textnum">
            {{ "бал" + (number > 4 && number < 21 ? "ов" : "а") }}
          </div>
        </div>
        <div class="btnsDone">
          <router-link to="/tests" class="btn">Пройти другие тесты</router-link>
          <div @click="goToResult" class="btn-white">Пройти снова</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.well-done__content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}
.contentTest {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: max-content;
}
.text {
  color: #333;
  text-align: center;
  font-family: Onest;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px; /* 120% */
}
.textnum {
  color: #5f22c1;
  text-align: center;
  font-family: Onest;
  font-size: 46px;
  font-style: normal;
  font-weight: 700;
  line-height: 50px; /* 108.696% */
}
.number-wrap {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.btn-white {
  border-radius: 10px;
  background: #eee;
  padding: 10px 20px;
  min-width: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5f22c1;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  width: 100%;
}
.btn {
  border-radius: 10px;
  background: #5f22c1;
  padding: 10px 20px;
  min-width: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  width: 100%;
}
.text {
  color: #333;
  font-family: Onest;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px; /* 116.667% */
}
.content-wrap {
  position: relative;
  min-height: 250px;
}
.animation-text {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 48%;
  transform: translate(-50%, -50%);
  width: 150px;
  z-index: 1;
  opacity: 0;
  transform: scale(0.1);
  transition: opacity 0.5s ease, transform 0.9s ease;
}
.animation-text.active {
  opacity: 1;
  transform: scale(1);
}
.content-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.content {
  width: 320px;
  height: 320px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.65);
  animation: spin-all 3.5s ease;
}

.circle {
  width: 80%;
  height: 80%;

  border-radius: 100%;
  position: absolute;
  box-sizing: border-box;

  top: 80px;
  right: -146px;
  border: 6vmin solid #439563;
  border-top-color: transparent;
  border-left-color: transparent;
  background-image: linear-gradient(
      0deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    linear-gradient(
      90deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    radial-gradient(#2971eb 5.5vmin, transparent calc(5.5vmin + 1px));
  background-repeat: no-repeat;
  background-size: 3vmin 1vmin, 1vmin 3vmin, 100% 100%;
  background-position: center center;
  filter: drop-shadow(0vmin 0vmin 0.5vmin #000)
    drop-shadow(0vmin 1vmin 0.5vmin #0004);
  animation: spin-bot 2.5s ease 0s infinite;
  transition: top 1.5s ease, right 1.5s ease;
}
.circle.active {
  top: 184px;
  right: -240px;
}
.circle:nth-child(2) {
  width: 60%;
  height: 60%;
  top: -84px;
  right: -73px;
  animation: spin-top 2.5s ease 0s infinite;
  transform: rotate(-45deg);
  border: 6vmin solid #5f22c1;
  border-top-color: transparent;
  border-left-color: transparent;
  background-image: linear-gradient(
      0deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    linear-gradient(
      90deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    radial-gradient(#ef8933 1.25vmin, transparent calc(1.25vmin + 1px));
  background-size: 1.4vmin 1vmin, 1vmin 1.4vmin, 100% 100%;
  filter: hue-rotate(10deg) drop-shadow(0vmin 0vmin 0.5vmin #000)
    drop-shadow(0vmin 1vmin 0.5vmin #0004);
  transition: top 1.5s ease, right 1.5s ease;
}
.circle.active:nth-child(2) {
  top: -184px;
  right: -180px;
}
.circle:nth-child(3) {
  width: 100%;
  height: 100%;
  top: -67px;
  left: -80px;
  transform: rotate(175deg);
  animation: spin-left 2.5s ease calc(2.5s / 4) infinite;
  border: 6vmin solid #717786;
  border-top-color: transparent;
  border-left-color: transparent;
  background-image: linear-gradient(
      0deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    linear-gradient(
      90deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    radial-gradient(#c17979 9vmin, transparent calc(9vmin + 1px));
  background-size: 5vmin 1vmin, 1vmin 5vmin, 100% 100%;
  filter: hue-rotate(20deg) drop-shadow(0vmin 0vmin 0.5vmin #000)
    drop-shadow(0vmin 1vmin 0.5vmin #0004);
  transition: top 1.5s ease, left 1.5s ease;
}
.circle.active:nth-child(3) {
  top: -167px;
  left: -180px;
}
.circle:nth-child(4) {
  width: 60%;
  height: 60%;
  top: 190px;
  left: 37px;
  transform: rotate(-280deg);
  animation: spin-last 2.5s ease calc(calc(calc(2.5s / 4) + 2.5s) * -1) infinite;
  border: 6vmin solid #e90037;
  border-top-color: transparent;
  border-left-color: transparent;
  background-image: linear-gradient(
      0deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    linear-gradient(
      90deg,
      transparent calc(50% - 2px),
      black calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 2px)
    ),
    radial-gradient(#f092f9 2.5vmin, transparent calc(2.5vmin + 1px));
  background-size: 2vmin 1vmin, 1vmin 2vmin, 100% 100%;
  filter: hue-rotate(30deg) drop-shadow(0vmin 0vmin 0.5vmin #000)
    drop-shadow(0vmin 1vmin 0.5vmin #0004);
  transition: top 1.5s ease, left 1.5s ease;
}
.circle.active:nth-child(4) {
  top: 290px;
  left: -37px;
}
@keyframes spin-all {
  0% {
    transform: rotate(0deg) scale(0.65);
  }
  100% {
    transform: rotate(360deg) scale(0.65);
  }
}

@keyframes spin-top {
  0% {
    transform: rotate(-45deg);
  }
  100% {
    transform: rotate(315deg);
  }
}

@keyframes spin-bot {
  0%,
  35% {
    transform: rotate(0deg);
  }
  80%,
  100% {
    transform: rotate(-360deg);
  }
}

@keyframes spin-left {
  0%,
  35% {
    transform: rotate(175deg);
  }
  80%,
  100% {
    transform: rotate(535deg);
  }
}

@keyframes spin-last {
  0%,
  10% {
    transform: rotate(-280deg);
  }
  90%,
  100% {
    transform: rotate(-640deg);
  }
}

.tests {
  visibility: visible;
  transform: scale(1);
  transition: all 0.5s ease;
}
.well-done {
  display: flex;
  justify-content: center;
  visibility: visible;
  transform: scale(1);
  transition: all 0.5s ease;
}
.opacityB {
  opacity: 0;
  visibility: hidden;
  transform: scale(0.5);
}
</style>