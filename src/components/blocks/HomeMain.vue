<script setup>
import BtnRed from "../ui/BtnRed.vue";
import { ref, reactive, onMounted } from "vue";
import gsap from "gsap";

const men1 = ref(null);
const men2 = ref(null);
const men3 = ref(null);
const comment1 = ref(null);
const comment2 = ref(null);
const comment3 = ref(null);
const comments = reactive([
  {
    text: "Откуда берутся твои эмоции и мысли?",
    img: require("@/assets/main1.png"),
    className: "lifestyle",
  },
  {
    text: "Не знаешь, как быть классным в любом коллективе? Я подскажу!",
    img: require("@/assets/main2.png"),
    className: "literature",
  },
  {
    text: "Как стать богатым и научиться копить? ",
    img: require("@/assets/main3.png"),
    className: "science",
  },
]);

const currentIndex = ref(0);
const currentClass = ref(comments[currentIndex.value].className);

const comment = ref(null);
const men = ref(null);
onMounted(() => {
  let mobile = window.innerWidth < 1024;
  if (mobile) {
    // Изначально скрываем блоки
    gsap.set([comment.value], { opacity: 0, y: 50 });
    gsap.set([men.value], { opacity: 0, y: -50 });

    // Функция для переключения комментария
    const switchComment = () => {
      const nextIndex = (currentIndex.value + 1) % comments.length;

      // Анимация исчезновения текущего комментария и человека
      const tl = gsap.timeline({
        onComplete: () => {
          // Обновляем индекс и класс
          currentIndex.value = nextIndex;
          currentClass.value = comments[nextIndex].className;

          // Показываем новый комментарий и человека
          gsap.to([comment.value, men.value], {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        },
      });

      // Скрытие старого
      tl.to([comment.value], {
        opacity: 0,
        y: -50,
        duration: 0.6,
        ease: "power3.in",
      });
      tl.to([men.value], {
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: "power3.in",
      });
    };

    // Запускаем цикл
    gsap
      .timeline({ repeat: -1 })
      .to({}, { duration: 2 }) // Пауза на показе первого комментария
      .call(switchComment)
      .to({}, { duration: 4 }) // Пауза на следующем комментарии
      .call(switchComment)
      .to({}, { duration: 4 }) // Пауза на третьем комментарии
      .call(switchComment);
  } else {
    // Изначально скрываем людей и комментарии
    gsap.set([men1.value, men2.value, men3.value], {
      opacity: 0,
      scale: 0,
      rotate: -45,
    });
    gsap.set([comment1.value, comment2.value, comment3.value], {
      opacity: 0,
      scale: 0.8,
      y: 100,
    });

    // Анимация появления
    const timeline = gsap.timeline();

    timeline
      // Появление первого человека
      .to(men1.value, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.8,
        ease: "back.out(1.7)", // "Подпрыгивающий" эффект
      })
      // Появление первого комментария
      .to(
        comment1.value,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
        },
        "-=0.4"
      ) // Накладываем часть анимации на предыдущую

      // Появление второго человека
      .to(men2.value, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
      // Появление второго комментария
      .to(
        comment2.value,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
        },
        "-=0.4"
      )

      // Появление третьего человека
      .to(men3.value, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
      // Появление третьего комментария
      .to(
        comment3.value,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
        },
        "-=0.4"
      );
  }
});
</script>
<template>
  <div class="main">
    <div class="container">
      <div class="main__content">
        <div class="main__item desktop lifestyle">
          <div class="circles">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <circle cx="6" cy="6" r="6" fill="#C8FB95" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <circle cx="6" cy="6" r="6" fill="#C8FB95" />
            </svg>
          </div>
          <div class="textComment" ref="comment1">
            <div class="comment">Откуда берутся твои эмоции и мысли?</div>
          </div>
          <img src="@/assets/main1.png" ref="men1" alt="" />
        </div>
        <div class="main__item desktop history">
          <svg
            class="circle1"
            xmlns="http://www.w3.org/2000/svg"
            width="144"
            height="142"
            viewBox="0 0 144 142"
            fill="none"
          >
            <circle cx="55" cy="53" r="89" fill="#FC6A2F" />
          </svg>
          <svg
            class="circle2"
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="131"
            viewBox="0 0 80 131"
            fill="none"
          >
            <circle cx="14.5" cy="65.5" r="65.5" fill="#2A89FF" />
          </svg>
          <div class="text">
            Экосистема для развития и просвещения школьников и подростков
          </div>
          <BtnRed :link="'/login'">Присоединиться</BtnRed>
        </div>
        <div class="main__item desktop literature">
          <div class="textComment" ref="comment2">
            <div class="comment comment2">
              Не знаешь, как быть классным в любом коллективе? Я подскажу!
            </div>
          </div>
          <img src="@/assets/main2.png" ref="men2" alt="" />
        </div>
        <div class="main__item desktop item_science">
          <div class="science">
            <div class="circles">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <circle cx="9" cy="9" r="9" fill="#A8DBFF" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <circle cx="9" cy="9" r="9" fill="#A8DBFF" />
              </svg>
            </div>
            <div class="textComment" ref="comment3">
              <div class="comment comment3">
                Откуда берутся твои эмоции и мысли?
              </div>
            </div>
            <img src="@/assets/main3.png" ref="men3" alt="" />
          </div>
          <div class="descriptionBlock">
            Повседневная практика показывает, что базовый вектор развития
            выявляет срочную потребность экономической целесообразности
            принимаемых решений.
          </div>
        </div>
        <div class="main__item mobile" :class="currentClass">
          <div v-if="currentIndex == 3" class="circles">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <circle cx="6" cy="6" r="6" fill="#C8FB95" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <circle cx="6" cy="6" r="6" fill="#C8FB95" />
            </svg>
          </div>
          <div class="textComment">
            <div class="comment" ref="comment">
              {{ comments[currentIndex].text }}
            </div>
          </div>
          <img :src="comments[currentIndex].img" ref="men" alt="" />
        </div>
        <div class="main__item-mobile mobile">
          <h1 class="title">
            Экосистема для развития и просвещений школьников и подростков
          </h1>
          <div class="head-h5">
            Наша мультиформатная образовательная платформа для школьников и
            подростков, на которой можно «зависать» с пользой
          </div>
          <BtnRed :link="'/login'">Присоединиться</BtnRed>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.main__content {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: 283px 475px;
}
.main {
  padding-top: 87px;
}
.main__item {
  border-radius: 48px;

  height: max-content;
  display: flex;
  width: max-content;
  position: relative;
  height: 100%;
}
.lifestyle {
  background: #5bba46;
  grid-column-start: 1;
  grid-column-end: 3;
  width: 283px;
}
.lifestyle img {
  border-radius: 48px;
}
.lifestyle .circles {
  position: absolute;
  top: 46px;
  left: 36px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.textComment {
  display: flex;
  position: absolute;
}
.lifestyle .textComment {
  right: -94px;
  top: 58px;
}
.comment {
  color: #fff;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
  letter-spacing: -0.408px;
  position: relative;
  z-index: 1;
}
.lifestyle .comment {
  background: #c383da;
  width: 123px;
  height: 104px;
  padding: 8px 10px;
  border-radius: 15px;
}
.lifestyle .comment::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: -5px;
  width: 20px;
  height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='14' viewBox='0 0 20 14' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.97146 0H20C20 7.73199 13.732 14 6 14H0V13.6709C1.43115 12.4697 2.61579 10.9871 3.47376 9.30324C4.5962 7.10032 4.89299 4.39657 4.97146 0Z' fill='%23C383DA'/%3E%3C/svg%3E");
  z-index: 1;
}
.history {
  overflow: hidden;
  border-radius: 48px;
  background: #fdeee7;
  width: 100%;
  grid-column-start: 3;
  grid-column-end: 11;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
  padding: 0 40px;
}
.history .circle1 {
  position: absolute;
  top: -0px;
  left: -0px;
}
.history .circle2 {
  position: absolute;
  bottom: 0px;
  left: 0px;
}
.text {
  color: #292929;
  font-family: Onest;
  font-size: 48px;
  font-style: normal;
  font-weight: 350;
  line-height: 100%; /* 48px */
  max-width: 659px;
}
.literature {
  background: url("@/assets/orangebg.png");
  grid-column-start: 1;
  grid-column-end: 8;
  position: relative;
  background-size: cover;
  background-position: center;
  width: 100%;
  padding-left: 5%;
}
.literature .textComment {
  position: absolute;
  right: 50px;
  top: 34px;
  border-radius: 15px;
  background: #ffc582;
  width: 332px;
  height: 125px;
  flex-shrink: 0;
}
.literature .comment {
  border-radius: 15px;
  background: #ffc582;
  width: 332px;
  height: 125px;
  flex-shrink: 0;
  padding: 14px 16px;
  color: #fff;
  font-family: Onest;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px; /* 116.667% */
  letter-spacing: -0.408px;
}
.literature .comment::before {
  content: "";
  position: absolute;
  bottom: -5px;
  left: -3px;
  width: 13px;
  height: 22px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='22' viewBox='0 0 13 22' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.24979 0H13V9C13 16.1797 7.1797 22 0 22V21.6C0.716471 20.7412 1.3319 19.7944 1.82908 18.7766C3.24979 15.8683 3.24979 12.0894 3.24979 4.53158V0Z' fill='%23FFC582'/%3E%3C/svg%3E");
}
.science {
  border-radius: 48px;
  background: #4d88f7;
  max-height: 319px;
}
.science .circles {
  position: absolute;
  right: 15%;
  top: 37px;
  gap: 18px;
  display: flex;
  flex-direction: column;
}
.science img {
  height: 100%;
  border-radius: 48px;
  width: 100%;
  object-fit: cover;
  object-position: center top;
}
.item_science {
  grid-column-start: 8;
  grid-column-end: 11;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.descriptionBlock {
  border-radius: 48px;
  background: #f5ebf9;
  padding: 30px 40px;
  color: #292929;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 350;
  line-height: 130%; /* 20.8px */
  width: 100%;
}
.science .textComment {
  position: absolute;
  top: -29px;
  left: -20px;
}
.science .comment {
  background: #a8dbff;
  border-radius: 15px;

  padding: 5px 13px;
  color: #fff;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
  letter-spacing: -0.408px;
  max-width: 112px;
  position: relative;
}
.science .comment::before {
  content: "";
  position: absolute;
  bottom: 0px;
  right: -5px;
  width: 20px;
  height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='14' viewBox='0%200%2020%2014' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15.0285%200L0%200C0%207.73199%206.26801%2014%2014%2014H20V13.6709C18.5689%2012.4697%2017.3842%2010.9871%2016.5262%209.30324C15.4038%207.10032%2015.107%204.39657%2015.0285%200Z' fill='%23A8DBFF'/%3E%3C/svg%3E");
}
.comment {
  transform-origin: center;
  perspective: 1000px;
}
.textComment {
  z-index: 1;
}
.mobile {
  display: none;
}
@media screen and (max-width: 1000px) {
  .desktop {
    display: none;
  }
  .mobile {
    display: flex;
    justify-content: center;
  }
  .main__item-mobile.mobile {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  .title {
    color: var(--Gray-1, #333);
    font-family: Onest;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: 28px; /* 116.667% */
    letter-spacing: -0.48px;
  }
  .head-h5 {
    color: var(--Gray-1, #333);
    font-family: Onest;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
  .mobile img {
    border-radius: 0;
    height: 100%;
    width: auto;
  }
  .main__content {
    display: flex;
    flex-direction: column-reverse;
    padding-top: 20px;
  }
  .mobile {
    height: 283px;
    width: 100%;
    position: relative;
    transition: background 0.3s ease-in-out;
  }
  .mobile .textComment {
    position: absolute;
    right: -5px;
    top: -5px;
    left: auto;
    bottom: auto;
    background: transparent;
    width: max-content;
    height: max-content;
  }
  .mobile .comment {
    background: #5f21c0;
    width: max-content;
    max-width: 150px;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: -0.408px;
    height: max-content;
    padding: 8px;
  }
  .mobile .comment::before {
    content: "";
    position: absolute;
    bottom: -5px;
    left: -3px;
    width: 13px;
    height: 22px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='22' viewBox='0 0 13 22' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.24979 0H13V9C13 16.1797 7.1797 22 0 22V21.6C0.716471 20.7412 1.3319 19.7944 1.82908 18.7766C3.24979 15.8683 3.24979 12.0894 3.24979 4.53158V0Z' fill='%235f21c0'/%3E%3C/svg%3E");
    z-index: -1;
  }
  .mobile::after {
    content: "";
    position: absolute;
    bottom: -70px;
    left: 0;
    width: 100%;
    height: 70px; /* Высота скрываемой части */
    background: white; /* Цвет фона, перекрывающий содержимое */
    z-index: 1;
    pointer-events: none; /* Чтобы не мешать взаимодействию */
  }
  .main__item-mobile::after {
    content: none;
  }
  .history {
    position: relative;
    z-index: 3;
    padding: 20px;
    height: 250px;
  }
  .text {
    color: #292929;
    font-family: Onest;
    font-size: 24px;
    font-style: normal;
    font-weight: 350;
    line-height: 100%; /* 48px */
    max-width: 659px;
  }
  .history .circle1 {
    top: -50px;
    left: -50px;
  }
  .history .circle2 {
    bottom: -50px;
    right: -50px;
  }
}
@media screen and (max-width: 650px) {
  .mobile .comment {
    background: #5f21c0;
    width: max-content;
    max-width: 150px;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: -0.408px;
    height: max-content;
    padding: 5px;
    align-items: flex-end;
  }
  .mobile img {
    max-width: 89%;
    height: auto;
    object-fit: cover;
  }
  .mobile {
    align-items: end;
    border-radius: 24px;
  }
  .text {
    color: #292929;
    font-family: Onest;
    font-size: 24px;
    font-style: normal;
    font-weight: 350;
    line-height: 100%; /* 48px */
    max-width: 659px;
  }
  .history {
    border-radius: 24px;
  }
  .history .circle1 {
    display: none;
  }
  .history .circle2 {
    display: none;
  }
}
</style>