<script setup>
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { onMounted, ref, nextTick } from "vue";
import main1 from "@/assets/image/speaker-1.jpg";
import main2 from "@/assets/image/speaker-2.jpg";
import main3 from "@/assets/image/speaker-3.jpg";
import main4 from "@/assets/image/speaker-4.jpg";
import main5 from "@/assets/image/speaker-5.jpg";
import main6 from "@/assets/image/speaker-6.jpg";

const speackers = [
  { id: 1, img: main1 },
  { id: 2, img: main2 },
  { id: 3, img: main3 },
  { id: 4, img: main4 },
  { id: 5, img: main5 },
  { id: 6, img: main6 },
];
const mobSpeackers = [
  { id: 1, img: main2 },
  { id: 2, img: main4 },
  { id: 3, img: main6 },
];
const mobSpeackers2 = [
  { id: 1, img: main1 },
  { id: 2, img: main3 },
  { id: 3, img: main5 },
];
const mobile = ref(false);

const text = ref("Экосистема для развития ");
const text2 = ref("и просвещения школьников и подростков");

onMounted(async () => {
  mobile.value = window.innerWidth < 1024;
  console.log(mobile.value);

  if (mobile.value) {
    return;
  } else {
    gsap.registerPlugin(ScrollTrigger);
    // let timeline = gsap.timeline();
    let body = document.querySelector("body");
    body.style.overflow = "hidden";

    await nextTick();

    let chars = gsap.utils.toArray(".head-h1 span");
    gsap.from(chars, {
      opacity: 1,
      y: 50,
      stagger: 0.02,
      duration: 1,
      delay: 0.5,
      ease: "power3.out",
    });

    gsap.set(".main__description", { opacity: 0 });

    gsap.to(".main__description", {
      opacity: 1,
      duration: 0.5,
      delay: 2.0,
      ease: "power1.inOut",
    });
    let positions = [200, 120, 40, -40, -120, -200];
    let transforms = [-3.09, -6, -1, 2, 4, 10];

    let items = document.querySelectorAll(".speackers__item");
    let positions2 = [200, 175, 150, 125, 100, 75];
    let heights = [0, 20, 40, 60, 80, 100];
    items.forEach((item, index) => {
      gsap.fromTo(
        item,
        {
          x: 0,
          rotate: `${transforms[index]}deg`,
        },
        {
          x: `${positions[index]}%`,
          rotate: 0,
          scrollTrigger: {
            start: "100",
            end: "500",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        item,
        {
          x: `${positions[index]}%`,
          rotate: 0,
          y: 0,
        },
        {
          x: `${positions2[index]}%`,
          rotate: 0,
          y: `${heights[index]}%`,
          scrollTrigger: {
            start: "700",
            end: "900",
            scrub: 1,
          },
        }
      );
    });
    gsap.fromTo(
      ".speackers",
      {
        y: 0,
      },
      {
        y: "350%",
        x: "100px",
        scrollTrigger: {
          start: "100",
          end: "800",
          scrub: 1,
        },
      }
    );

    gsap.fromTo(
      ".head-theme",
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: ".head-theme",
          start: "top bottom",
          end: "top center",
          scrub: 2,
        },
      }
    );
    items.forEach((item, index) => {
      gsap.fromTo(
        item,
        { x: `${positions[index]}%` },
        {
          x: 0,
          rotate: `${transforms[index]}deg`,
          duration: 1,
          delay: 1.5,
          ease: "power1.inOut",
          onComplete: () => {
            if (index === items.length - 1) {
              body.style.overflow = "visible";
            }
          },
        }
      );
    });
    gsap.fromTo(
      ".speackers",
      { y: "200%", rotate: "10deg" },
      {
        y: 0,
        rotate: 0,
        duration: 1,
        delay: 0.5,
        ease: "power1.inOut",
      }
    );
  }
});
</script>

<template>
  <section class="main">
    <div class="container">
      <div class="main__content">
        <h1 class="head-title">
          <div v-if="!mobile" class="head-h1">
            <span v-for="(char, index) in text.split('')" :key="index">
              {{ char === " " ? "\u00A0" : char }}
            </span>
          </div>
          <div v-if="!mobile" class="head-h1">
            <span v-for="(char, index) in text2.split('')" :key="index">
              {{ char === " " ? "\u00A0" : char }}
            </span>
          </div>
          <div v-else class="head-h1">
            Экосистема для развития и просвещения школьников и подростков
          </div>
        </h1>
        <div v-if="!mobile" class="speackers">
          <div class="speackers__item" v-for="item in speackers" :key="item.id">
            <img :src="item.img" alt="" />
          </div>
        </div>
        <div v-else class="speackers">
          <div class="speackers__item" v-for="item in mobSpeackers" :key="item.id">
            <img :src="item.img" alt="" />
          </div>
        </div>

        <div class="main__description">
          <div class="text">
            Мультиформатная образовательная платформа для школьников и
            подростков, на которой можно «зависать» с пользой
          </div>
          <div class="buttons">
            <router-link :to="'/videos'" class="whiollet">Смотреть видео</router-link>
            <router-link :to="'/login'" class="white">Зарегистрироваться</router-link>
          </div>
        </div>
      </div>
      <div class="theme__content">
        <div class="head-theme">
          Вводный курс по истории искусств и мировой архитектуры — <span>смотри на мир шире!</span>
        </div>
        <div class="text">
          Узнавай, как создавались великие шедевры, почему здания становятся символами эпохи, а картины — голосом
          времени. <br>

          Видео, статьи, подкасты и тесты — всё, чтобы ты вдохновился, удивился и открыл для себя мир искусства и
          архитектуры по-новому.
        </div>
        <div v-if="mobile" class="speackers dop">
          <div class="speackers__item" v-for="item in mobSpeackers2" :key="item.id">
            <img :src="item.img" alt="" />
          </div>
        </div>
        <div class="buttons">
          <router-link :to="'/theme/1'" class="whiollet">Подробнее</router-link>
          <router-link :to="'/videos'" class="white">Смотреть видео</router-link>
        </div>
      </div>
    </div>
  </section>
</template>
<style scoped>
.main {
  padding-top: 87px;
}

.head-h1 {
  color: #333;
  text-align: center;
  font-family: Onest;
  font-size: 50px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  /* 55px */
  letter-spacing: -1px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
  overflow: hidden;
}

.head-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.speackers {
  display: flex;
  justify-content: center;
  margin-top: 70px;
}

.speackers__item {
  margin-right: -50px;
  display: flex;
  width: 250px;
}

.speackers__item img {
  border-radius: 20px;
  box-shadow: 0px 3px 3.8px rgba(0, 0, 0, 0.1);
}

.speackers__item:nth-of-type(6) {
  z-index: 5;
}

.main__description {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  margin-top: 40px;
}

.text {
  color: #333;
  font-family: Onest;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 629px;
}

.main__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main__content .text {
  text-align: center;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.whiollet {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  /* 90% */
  padding: 18px 40px;
  border-radius: 128px;
  background: #5f22c1;
  border: 1px solid #5f22c1;
}

.white {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5f22c1;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  padding: 18px 40px;
  border-radius: 128px;
  background: #ffffff;
  border: 1px solid #5f22c1;
}

.theme__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-top: 280px;
}

.theme__content .text {
  max-width: 490px;
}

.head-theme {
  color: #a5a5a5;
  font-family: Onest;
  font-size: 40px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  letter-spacing: -0.8px;
  max-width: 548px;
}

.head-theme span {
  color: #333;
}

.theme__content .buttons {
  justify-content: flex-start;
}

@media screen and (max-width: 1024px) {
  .speackers__item {
    width: 150px;
    height: 150px;
  }

  .head-h1 {
    font-size: 24px;
  }

  .speackers__item:nth-of-type(1) {
    transform: rotate(-6deg);
  }

  .speackers__item:nth-of-type(2) {
    transform: rotate(2deg);
    margin-top: 46px;
  }

  .speackers__item:nth-of-type(3) {
    transform: rotate(10deg);
    margin-top: 96px;
  }

  .buttons {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .buttons * {
    width: 100%;
    font-size: 18px;
  }

  .text {
    font-size: 16px;
  }

  .main__description {
    gap: 20px;
  }

  .theme__content {
    padding-top: 100px;
    gap: 20px;
  }

  .head-theme {
    font-size: 24px;
  }

  .dop .speackers__item {
    transform: rotate(0);
  }

  .speackers {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>