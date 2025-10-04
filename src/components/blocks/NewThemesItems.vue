<script setup>
import { onMounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import th1 from "@/assets/image/th1.png";
import th2 from "@/assets/image/th2.png";
import th3 from "@/assets/image/th3.png";
import th4 from "@/assets/image/th4.png";
import th5 from "@/assets/image/th5.png";
import th6 from "@/assets/image/th6.png";
import th7 from "@/assets/image/th7.png";
import th8 from "@/assets/image/th8.png";
import th9 from "@/assets/image/th9.png";
import th10 from "@/assets/image/th10.png";
import th11 from "@/assets/image/th11.png";
import th12 from "@/assets/image/th12.png";
import podck from "@/assets/podck.jpg";

const themes = [
  { id: 1, img: th1 },
  { id: 2, img: th2 },
  { id: 3, img: th3 },
  { id: 4, img: th4 },
  { id: 5, img: th5 },
  { id: 6, img: th6 },
  { id: 7, img: th7 },
  { id: 8, img: th8 },
  { id: 9, img: th9 },
  { id: 10, img: th10 },
  { id: 11, img: th11 },
  { id: 12, img: th12 },
];
const themesMob = [
  { id: 7, img: th7 },
  { id: 8, img: th8 },
  { id: 9, img: th9 },
  { id: 10, img: th10 },
  { id: 11, img: th11 },
  { id: 12, img: th12 },
];
onMounted(() => {
  const mobile = window.innerWidth < 1024;
  if (mobile) return;
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".themes",
      start: "top center",
      end: "bottom center",
      scrub: 1,
      markers: false,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(".images img", { scale: 0 }, { scale: 1, ease: "none" })
    .to(".images img:nth-of-type(1)", { rotate: 15, ease: "none" }, ">")
    .to(".images img:nth-of-type(2)", { rotate: -15, ease: "none" }, "<")
    .to(".images img", { y: 400, ease: "none" }, ">")
    .to(".podcats__info", { y: 400, ease: "none" }, "<")
    .to(".images img:nth-of-type(1)", { rotate: 0, ease: "none" }, ">")
    .to(".images img:nth-of-type(2)", { rotate: 0, ease: "none" }, "<")
    .to(
      ".images img",
      {
        y: (i) => (i + 1) * 80 + 800,
        x: (i) => (i <= 5 ? i * 200 - 400 : (5 - (i - 5)) * 200 - 400),
        ease: "none",
      },
      ">"
    )
    .to(".podcats__info", {
      y: (12 + 1) * 80 + 800,
      x: (5 - (13 - 5)) * 200 - 400,
      ease: "none",
    });
  tl.add("pausePoint") // Добавляем метку перед паузой
    .to({}, { duration: 0.1 }) // Пауза (если scrollTrigger не влияет)
    .add("resumePoint", "+=0.5") // Метка, сдвигающая начало анимации
    .to(
      [
        ".images img:nth-of-type(7)",
        ".images img:nth-of-type(8)",
        ".images img:nth-of-type(9)",
        ".images img:nth-of-type(10)",
        ".images img:nth-of-type(11)",
        ".images img:nth-of-type(12)",
      ],
      { x: "+=100", y: "+=450", width: "165px", height: "198px", ease: "none" },
      "resumePoint" // Запускаем анимацию с этой метки
    );
  tl.to(".podcats__info", { x: "+=100", y: "+=450", ease: "none" }, "<")
    .to(
      [".images img:nth-of-type(7)"],
      { x: "-=65", y: "+=470", ease: "none" },
      ">"
    )
    .to(
      [".images img:nth-of-type(8)"],
      { x: "-=45", y: "+=390", ease: "none" },
      "<"
    )
    .to(
      [".images img:nth-of-type(9)"],
      { x: "-=25", y: "+=310", ease: "none" },
      "<"
    )
    .to(
      [".images img:nth-of-type(10)"],
      { x: "+=535", y: "+=440", ease: "none" },
      "<"
    )
    .to(
      [".images img:nth-of-type(11)"],
      { x: "+=555", y: "+=360", ease: "none" },
      "<"
    )
    .to(
      [".images img:nth-of-type(12)"],
      { x: "+=575", y: "+=280", ease: "none" },
      "<"
    )
    .to(".podcats__info", { x: "+=1155", y: "-=100", ease: "none" }, "<")
    .to(".podcats__info", { opacity: 1 })
    .to(".podcats__info", { opacity: 1 });
});
</script>

<template>
  <div class="themes">
    <div class="container">
      <div class="themes__content">
        <div class="images">
          <img
            v-for="theme in themes"
            :src="theme.img"
            :key="theme.id"
            alt=""
          />
          <div class="podcats__info desktop">
            <div
              class="podcats__head"
              :style="{ backgroundImage: `url(${podck})` }"
            >
              Подкасты
            </div>
            <div class="block"></div>
          </div>
        </div>
        <div class="themes__head">
          Финансовая
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="54"
            viewBox="0 0 38 54"
            fill="none"
          >
            <path
              d="M33.9594 26.9523C32.014 25.3216 29.5409 24.456 27.0033 24.5176H10.6912C9.94747 24.5364 9.20759 24.4049 8.51586 24.131C7.82413 23.8572 7.19478 23.4465 6.66547 22.9237C6.13617 22.4009 5.71779 21.7767 5.4354 21.0884C5.153 20.4001 5.0124 19.6619 5.02199 18.918C5.00386 18.6284 5.00386 18.338 5.02199 18.0484C5.2413 16.7192 5.93833 15.5156 6.98219 14.6639C8.02606 13.8122 9.34495 13.3708 10.6912 13.4226H26.7598C28.0705 13.4215 29.3391 13.8859 30.3392 14.7332C31.3393 15.5804 32.006 16.7553 32.2203 18.0484H37.4374C37.219 15.3666 35.9994 12.8652 34.021 11.0415C32.0427 9.21784 29.4505 8.20543 26.7598 8.20557H21.2645V0.206055H16.9169V8.20557H10.6912C8.00053 8.20543 5.40833 9.21784 3.42997 11.0415C1.45162 12.8652 0.231999 15.3666 0.0135994 18.0484C-0.00453314 18.338 -0.00453314 18.6284 0.0135994 18.918C0.0135994 20.3202 0.289784 21.7086 0.826384 23.0041C1.36298 24.2996 2.14949 25.4767 3.141 26.4682C5.14344 28.4706 7.85933 29.5956 10.6912 29.5956H27.1772C27.915 29.577 28.6491 29.7063 29.3362 29.9759C30.0233 30.2455 30.6494 30.6499 31.1778 31.1653C31.7061 31.6807 32.126 32.2966 32.4125 32.9768C32.6991 33.6569 32.8466 34.3876 32.8464 35.1257C32.88 35.5191 32.88 35.9147 32.8464 36.3082C32.5702 37.532 31.8862 38.6255 30.9066 39.4092C29.9269 40.1929 28.7099 40.6202 27.4554 40.621H11.1086C9.85404 40.6202 8.63706 40.1929 7.65743 39.4092C6.6778 38.6255 5.99376 37.532 5.7176 36.3082H0.465746C0.764642 38.9215 2.01453 41.3334 3.97724 43.0844C5.93995 44.8355 8.47829 45.8032 11.1086 45.8033H16.9169V53.6985H21.2645V45.8033H27.1772C29.8075 45.8032 32.3458 44.8355 34.3085 43.0844C36.2712 41.3334 37.5211 38.9215 37.82 36.3082V35.1257C37.8158 33.5634 37.4678 32.0213 36.8005 30.6087C36.1333 29.1962 35.1633 27.9478 33.9594 26.9523Z"
              fill="#439563"
            />
          </svg>
          грамотность, психология, наука, технологии, искусство и многое другое.
          <br />
          <span>
            Выбирай тему, которая тебе интересна, и прокачивай себя с крутыми
            блогерами и экспертами.
          </span>
        </div>
      </div>
      <div class="info__content">
        <div class="info__head">
          <div class="head-h1">
            Твой личный центр знаний – учись <br />
            в удобном формате!
          </div>
          <div class="text">
            Подкасты, книги, видео, тесты, свежие новости <br />
            и афиша мероприятий – все, что поможет тебе <br />
            развиваться, теперь собрано в одном месте. <br />
            <span>Управляй своим обучением легко и удобно!</span>
          </div>
          <div class="podcats__info mobile">
            <div
              class="podcats__head"
              :style="{ backgroundImage: `url(${podck})` }"
            >
              Подкасты
            </div>
            <div class="block">
              <img
                v-for="theme in themesMob"
                :src="theme.img"
                :key="theme.id"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.themes {
  padding-top: 150px;
}
.themes__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  text-align: center;
  padding-bottom: 1800px;
}
.themes__head {
  color: #333;
  font-family: Onest;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  max-width: 1308px;
}
.themes__head span {
  color: #a5a5a5;
}
.images {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 50px;
  width: 100%;
  height: 200px;
}

.images img {
  width: 250px;
  height: 300px;
  flex-shrink: 0;
  position: absolute;
  transform-origin: center;
  transform: scale(0);
}
.info__head {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.head-h1 {
  color: #333;
  font-family: Onest;
  font-size: 50px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  letter-spacing: -1px;
  max-width: 549px;
}
.text {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  max-width: 518px;
}
.text span {
  color: #5f22c1;
}
.podcats__info {
  border-radius: 18px;
  background: #030303;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: max-content;
  position: relative;
  z-index: -1;
  opacity: 0;
}

.podcats__head {
  padding: 20px;
  color: #fff;
  font-family: Onest;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  letter-spacing: -0.48px;
  background-position: top center;
  background-size: 101% 101%;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  border-bottom-left-radius: 15px;
  text-align: left;
}
.block {
  width: 530px;
  height: 415px;
  flex-shrink: 0;
  border-radius: 15px;
  background: #dfdfdf;
}
.info__content {
}
.mobile {
  display: none;
}
@media screen and (max-width: 1024px) {
  .themes__content {
    flex-direction: column-reverse;
  }
  .mobile {
    display: flex;
  }
  .desktop {
    display: none;
  }
  .images img {
    position: relative;
    width: 100px;
    height: 120px;
    transform: scale(1);
  }
  .themes__head {
    font-size: 24px;
  }
  .themes {
    padding-top: 50px;
    padding-bottom: 50px;
  }
  .images {
    height: auto;
    margin-top: 0;
  }
  .themes__head svg {
    width: 18px;
    height: 25.459px;
  }
  .block {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 13px;
    width: 100%;
    height: auto;
  }
  .block img {
    width: 108px;
    height: 131px;
  }
  .podcats__info {
    opacity: 1;
    max-width: 350px;
    width: 100%;
    z-index: 1;
    gap: 15px;
  }
  .podcats__head{
    font-size: 16px;
    padding: 15px;
    padding-bottom: 0;
  }
  .head-h1{
    font-size: 24px;
  }
  .text{
    font-size: 16px;
  }
  .info__head{
    gap: 34px;
  }
  .themes__content{
    padding-bottom: 50px;
  }
}
</style>