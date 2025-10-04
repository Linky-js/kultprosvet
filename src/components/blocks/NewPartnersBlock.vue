<script setup>
import { ref } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { onMounted } from "vue";
import log1 from "@/assets/image/push.svg";
import log2 from "@/assets/image/media.svg";
import log3 from "@/assets/image/iri.svg";

const images = ref([...Array(5)].flatMap(() => [log1, log2, log3]));
const text = ref("Наши партнеры верят: знания — это сила!");
onMounted(() => {
  let marqueeBlock = document.querySelector(".marquiz__block");
  let distance = marqueeBlock.scrollWidth / 2;
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".marquiz__block", {
    x: `-${distance}px`,
    duration: 10,
    ease: "linear",
    repeat: -1,
  });

  let words = document.querySelectorAll(".head-h1 div");
  
  gsap.fromTo(
    words,
    { opacity: 0, y: 50 }, // Стартовое состояние (слова ниже и прозрачные)
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.2, // Задержка между словами
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".head-h1",
        start: "top 80%", // Когда блок появляется на 80% экрана
        
      },
    }
  );
});
</script>
<template>
  <div class="partners">
    <div class="container">
      <div class="partners__content">
        <div class="head-h1">
          <div v-for="(word, index) in text.split(' ')" :key="index">
            <span v-if="word === 'это' || word === 'сила!'">{{ word }}</span>
            <template v-else>{{ word }}</template>
          </div>
        </div>
        <div class="text">
          Вместе мы создаем пространство, где развиваться легко и интересно.
        </div>
        <div class="marquiz__block">
          <img v-for="img in images" :src="img" :key="img" alt="" />
          <img v-for="img in images" :src="img" :key="img" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquiz__block {
  display: flex;
  gap: 100px;
  margin-top: 50px;
  width: max-content;
}
.marquiz__block img {
  flex-shrink: 0;
  width: max-content;
  object-fit: none;
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  overflow: hidden;
}
.head-h1 span {
  color: #5f22c1;
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
.partners__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 180px;
}
@media screen and (max-width: 1024px) {
  .head-h1 {
    font-size: 24px;
    gap: 8px;
    row-gap: 1px;
  }
  .text{
    font-size: 16px;
  }
  .partners__content{
    gap: 25px;
    margin-top: 100px;
  }
}
</style>