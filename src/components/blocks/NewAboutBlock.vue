<script setup>
import gsap from "gsap";
import { onMounted } from "vue";
import k1 from "@/assets/image/k1.png";
import k2 from "@/assets/image/k2.png";
import k3 from "@/assets/image/k3.png";
import k4 from "@/assets/image/k4.png";
import k5 from "@/assets/image/k5.png";
import k6 from "@/assets/image/k6.png";
import k7 from "@/assets/image/k7.png";
import k8 from "@/assets/image/k8.png";
import k9 from "@/assets/image/k9.png";
import k10 from "@/assets/image/k10.png";
import k11 from "@/assets/image/k11.png";
import k12 from "@/assets/image/k12.png";
import k13 from "@/assets/image/k13.png";
import k14 from "@/assets/image/k14.png";
import k15 from "@/assets/image/k15.png";
import k16 from "@/assets/image/k16.png";
import k17 from "@/assets/image/k17.png";
import k18 from "@/assets/image/k18.png";
import k19 from "@/assets/image/k19.png";
import k20 from "@/assets/image/k20.png";

const imagesTop = [
  {
    img: k1,
  },
  {
    img: k2,
  },
  {
    img: k3,
  },
  {
    img: k4,
  },
  {
    img: k5,
  },
  {
    img: k6,
  },
  {
    img: k7,
  },
  {
    img: k8,
  },
  {
    img: k9,
  },
  {
    img: k10,
  },
];
const imagesBottom = [
  {
    img: k11,
  },
  {
    img: k12,
  },
  {
    img: k13,
  },
  {
    img: k14,
  },
  {
    img: k15,
  },
  {
    img: k16,
  },
  {
    img: k17,
  },
  {
    img: k18,
  },
  {
    img: k19,
  },
  {
    img: k20,
  },
];
onMounted(() => {
  let marqueeBlock = document.querySelector(".marquiz_top");
  let distance = marqueeBlock.scrollWidth / 2;

  gsap.to(".marquiz_top", {
    x: `-${distance}px`,
    duration: 15,
    ease: "linear",
    repeat: -1,
  });
  gsap.to(".marquiz_bottom", {
    x: `${distance}px`,
    duration: 15,
    ease: "linear",
    repeat: -1,
  });
});
</script>
<template>
  <div class="about">
    <div class="container">
      <div class="about__content">
        <div class="marquiz_top marquiz">
          <img v-for="img in imagesTop" :src="img.img" :key="img" alt="" />
          <img v-for="img in imagesTop" :src="img.img" :key="img" alt="" />
          <img v-for="img in imagesTop" :src="img.img" :key="img" alt="" />
        </div>
        <div class="about__info">
          <div class="head-h1">
            Учись, общайся, развивайся – вместе с единомышленниками!
          </div>
          <div class="text">
            Присоединяйся к платформе, проходи курсы, обсуждай новые знания с
            другими участниками и будь в центре событий. Развиваться легче,
            когда ты не один
          </div>
        </div>
        <div class="marquiz marquiz_bottom">
          <img v-for="img in imagesBottom" :src="img.img" :key="img" alt="" />
          <img v-for="img in imagesBottom" :src="img.img" :key="img" alt="" />
          <img v-for="img in imagesBottom" :src="img.img" :key="img" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.about {
  margin-top: 412px;
}
.about__content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 80px;
  align-items: center;
}
.marquiz {
  display: flex;
  gap: 40px;
  align-items: end;
  height: 239px;
}
.marquiz img {
  flex-shrink: 0;
  width: 110px;
  height: 120px;
}
.marquiz_bottom {
  justify-content: flex-end;
}
.marquiz img:nth-child(4n + 4) {
  transform: translateY(0px); /* Первая в группе */
}

.marquiz img:nth-child(4n + 1),
.marquiz img:nth-child(4n + 3) {
  transform: translateY(-59px); /* Вторая в группе */
}

.marquiz img:nth-child(4n + 2) {
  transform: translateY(-118px); /* Третья в группе */
}
.about__info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
}
.head-h1 {
  color: #333;
  text-align: center;
  font-family: Onest;
  font-size: 50px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  letter-spacing: -1px;
  max-width: 899px;
}
.text {
  text-align: center;
  max-width: 688px;
}
@media screen and (max-width: 1024px) {
  .about{
    margin-top: 100px;
  }
  .marquiz img {
    width: 45px;
    height: 50px;
  }
  .marquiz {
    gap: 16px;
    height: 100px;
  }
  .marquiz img:nth-child(4n + 4) {
    transform: translateY(0px); 
  }

  .marquiz img:nth-child(4n + 1),
  .marquiz img:nth-child(4n + 3) {
    transform: translateY(-24px); 
  }

  .marquiz img:nth-child(4n + 2) {
    transform: translateY(-48px); 
  }
  .head-h1 {
    font-size: 24px;
  }
  .text {
    font-size: 16px;
  }
  .about__content {
    gap: 40px;
  }
}
</style>