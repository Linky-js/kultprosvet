<script>
import gsap from "gsap";

export default {
  name: "LinkWithAnimation",
  data() {
    return {
      showIcon: false, // Отвечает за появление стрелки в конце анимации
    };
  },
  mounted() {
    // Спрячем элемент linkAll__K до наведения
    gsap.set(".linkAll__K", { scale: 0, opacity: 0 });
  },
  methods: {
    onHover() {
     if (!this.showIcon) {
       this.showIcon = true;
       this.playAnimation();
     } else {
         return;
     }
    },
    playAnimation() {
      let width = document.querySelector(".linkAll").offsetWidth;
      gsap
        .timeline()
        .to(".linkAll__text", {
            scale: 0.3,
            opacity: 0,
            duration: 0.2,
            ease: "power1.in",
        })
        .to(".linkAll__K", {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "power1.out",
        }) // Плавное появление
        .to(".linkAll__K__circle", {
          rotationY: 720, // Вращение вокруг Y-оси 2 раза
          duration: 1,
          transformOrigin: "center",
          ease: "power2.inOut",
        })
        .to(".linkAll__K", {
          x: width - 55, // Перемещение элемента как будто он "врезается в стенку"
          rotation: 720, // Вращение вокруг своей оси
          duration: 1.5,
          ease: "power4.out",
        })
        .to(".linkAll__text", {
            scale: 1,
            opacity: 1,
            duration: 0.2,
            ease: "power1.in",
        })
        .to(".linkAll__K", {
          scale: 0, // Уменьшение элемента после удара
          duration: 0.5,
          ease: "power1.in",
        })
        
        .add(() => {
          this.showIcon = true; // Появление стрелки после завершения анимации
          document.querySelector(".linkAll__icon").classList.add("show");
          gsap.fromTo(
            ".linkAll__icon path",
            { strokeDasharray: 1000, strokeDashoffset: 1000 },
            { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" } // Анимация обводки стрелки
          );
          setTimeout(this.resetState, 3000);
        });
    },
    resetState() {
      // Сбрасываем иконку
      this.showIcon = false;
      document.querySelector(".linkAll__icon").classList.remove("show");

      // Сбрасываем положение элемента и его масштаб
      gsap.set(".linkAll__K", {
        x: 0, // Возвращаем в исходное положение
        scale: 0, // Скрываем элемент обратно
        opacity: 0, // Прячем элемент
        rotation: 0, // Сбрасываем вращение
      });

      // Сбрасываем вращение внутреннего круга
      gsap.set(".linkAll__K__circle", {
        rotationY: 0,
      });
    },
  },
};
</script>

<template>
  <a href="/news" class="linkAll" @mouseenter="onHover">
    <span class="linkAll__text"><slot></slot></span>
    <!-- Иконка стрелки, которая появится в конце анимации -->
    <svg
      class="linkAll__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
    >
      <path
        d="M5.25 21H36.75"
        stroke="#333333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M31.5 26.25L36.75 21L31.5 15.75"
        stroke="#333333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Элемент с вращающимся кругом -->
    <svg
      class="linkAll__K"
      xmlns="http://www.w3.org/2000/svg"
      width="45"
      height="45"
      viewBox="0 0 45 45"
      fill="none"
    >
      <path
        d="M16.7298 0.00146484H0V44.9989H16.7298V0.00146484Z"
        fill="black"
      />
      <path
        d="M22.3022 33.7502C22.3022 27.5377 27.2942 22.5015 33.4521 22.5015C39.61 22.5015 44.6019 27.5377 44.6019 33.7502C44.6019 39.9627 39.61 44.9989 33.4521 44.9989C27.2942 44.9989 22.3022 39.9627 22.3022 33.7502Z"
        fill="black"
      />
      <path
        class="linkAll__K__circle"
        d="M27.8723 0.00146484H44.5869L33.4422 22.5015H16.7275L27.8723 0.00146484Z"
        fill="black"
      />
    </svg>
  </a>
</template>
  

  
  <style scoped>
.linkAll {
  display: inline-flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  color: #333;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  gap: 8px;
}

.linkAll__icon {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.linkAll__icon.show {
  opacity: 1;
  visibility: visible;
}

.linkAll__K {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.linkAll__K__circle {
  transform-origin: center;
}
</style>
  