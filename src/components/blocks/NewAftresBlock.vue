<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import af1 from "@/assets/image/af1.png";
import af2 from "@/assets/image/af2.png";
import af3 from "@/assets/image/af3.png";
import af4 from "@/assets/image/af4.png";
import af5 from "@/assets/image/af5.png";
import af6 from "@/assets/image/af6.png";
import af7 from "@/assets/image/af7.png";
import af8 from "@/assets/image/af8.png";
import af9 from "@/assets/image/af9.png";
import af10 from "@/assets/image/af10.png";
import af11 from "@/assets/image/af11.png";
import af12 from "@/assets/image/af12.png";
import af13 from "@/assets/image/af13.png";
import af14 from "@/assets/image/af14.png";
import af15 from "@/assets/image/af15.png";

const images = [
  { id: 1, img: af1 },
  { id: 2, img: af2 },
  { id: 3, img: af3 },
  { id: 4, img: af4 },
  { id: 5, img: af5 },
  { id: 6, img: af6 },
  { id: 7, img: af7 },
  { id: 8, img: af8 },
  { id: 9, img: af9 },
  { id: 10, img: af10 },
  { id: 11, img: af11 },
  { id: 12, img: af12 },
  { id: 13, img: af13 },
  { id: 14, img: af14 },
  { id: 15, img: af15 },
];
const mobImages = [
  { id: 1, img: af1 },
  { id: 2, img: af2 },
  { id: 7, img: af7 },

  { id: 11, img: af11 },
  { id: 8, img: af8 },
];
const mobile = ref(false);

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);
  mobile.value = window.innerWidth < 1024;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".afters",
      start: "top center",
      end: "center center",
      scrub: 1,
      markers: false,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(
    ".afters .image__afters:nth-of-type(8)",
    { scale: 8 },
    { scale: 1, ease: "none" }
  );
});
</script>
<template>
  <div class="afters__wrapper">
    <div class="container">
      <div v-if="!mobile" class="afters">
        <div class="image__afters" v-for="image in images" :key="image.id">
          <img :src="image.img" />
        </div>
      </div>
      <div v-else class="afters">
        <div
          class="image__afters mobile"
          v-for="image in mobImages"
          :key="image.id"
        >
          <img :src="image.img" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.afters__wrapper {
  margin-top: 810px;
  margin-bottom: 200px;
}
.afters {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  row-gap: 60px;
  flex-wrap: wrap;
  column-gap: 138px;
}
.afters .image__afters:nth-child(2),
.afters .image__afters:nth-child(4) {
  transform: translateY(-15px);
}
.afters .image__afters:nth-child(3) {
  transform: translateY(-30px);
}
.afters .image__afters:nth-child(12),
.afters .image__afters:nth-child(14) {
  transform: translateY(15px);
}
.afters .image__afters:nth-child(13) {
  transform: translateY(30px);
}
.afters .image__afters:nth-child(8) {
  border-radius: 20px;
  background: #940e19;
  overflow: hidden;
  width: 150px;
  height: 200px;
  display: flex;
  align-items: flex-end;
  transform-origin: top 20% center;
  position: relative;
  z-index: 2;
}
.mobile {
  display: none;
}
@media screen and (max-width: 1024px) {
  .mobile {
    display: block;
  }
  .desktop {
    display: none;
  }
  .afters {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 15px;
    column-gap: 51px;
    position: relative;
  }
  .afters .image__afters:nth-child(2),
  .afters .image__afters:nth-child(4),
  .afters .image__afters:nth-child(3) {
    transform: translateY(0);
  }
  .afters .image__afters:nth-child(5) {
    width: 200px;
    height: 257.143px;
    border-radius: 20px;
    background: #940e19;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    transform-origin: top 20% center;
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .image__afters {
    width: 150px;
    height: 200px;
  }
  .afters__wrapper{
    margin-top: 100px;
    margin-bottom: 100px;
  }
}
</style>