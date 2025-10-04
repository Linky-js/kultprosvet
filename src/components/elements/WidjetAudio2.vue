<script>
import { myMixinColor } from "@/mixin";
import { sendMetrik } from "@/utils/metrika.js";
export default {
  name: "WidjetAudio",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      apiDomain: this.$store.getters.getApiDomain,
      audioID: null,
      isPlaying: false,
      remainingTime: "00:00",
      bars: Array(20).fill({ height: 10, active: false }),
      intervalId: null,
      intervalId2: null,
      dragging: false,
      widgetPosition: { top: 100, left: 100 }, // Стартовая позиция
      dragOffset: { x: 0, y: 0 },
    };
  },
  mixins: [myMixinColor],
  methods: {
    sendMetrik: sendMetrik,
    startDragging(event) {
      this.dragging = true;

      // Обрабатываем событие касания
      if (event.type === 'touchstart') {
        const touch = event.touches[0];
        this.dragOffset.x = touch.clientX - this.widgetPosition.left;
        this.dragOffset.y = touch.clientY - this.widgetPosition.top;
      } else {
        // Обычное событие мыши
        this.dragOffset.x = event.clientX - this.widgetPosition.left;
        this.dragOffset.y = event.clientY - this.widgetPosition.top;
      }
    },
    stopDragging() {
      this.dragging = false;
    },
    dragWidget(event) {
      if (this.dragging) {
        // Определяем тип события
        if (event.type === 'touchmove') {
          const touch = event.touches[0];
          this.widgetPosition.left = touch.clientX - this.dragOffset.x;
          this.widgetPosition.top = touch.clientY - this.dragOffset.y;
          event.preventDefault();  // Предотвращаем стандартные действия браузера
        } else {
          // Обычное событие мыши
          this.widgetPosition.left = event.clientX - this.dragOffset.x;
          this.widgetPosition.top = event.clientY - this.dragOffset.y;
        }
      }
    },
    seekAudio(index) {
      let audio = document.getElementById("audioWidjet");
      let seekTime = (index / this.bars.length) * audio.duration;
      audio.currentTime = seekTime;
      this.updateProgress("audioWidjet"); // Обновим визуализацию после перемотки
    },

    setDuration(id) {
      const audio = document.getElementById(id);

      this.remainingTime = this.formatTime(audio.duration); // Устанавливаем полное время трека
    },
    togglePlayAudio() {
      let audio = document.getElementById("audioWidjet");
      if (this.isPlaying) {
        localStorage.setItem("audioPlay", "paused");
        audio.pause();
        this.isPlaying = false;
      } else {
        localStorage.setItem("audioPlay", "playing");
        audio.play();
        this.isPlaying = true;
      }
    },
    startVisualization() {
      if (this.intervalId2) return;
      this.sendMetrik("podkast_" + this.item.metrikId);
      this.intervalId = setInterval(() => {
        this.bars = this.bars.map((bar) => {
          const randomHeight = Math.floor(Math.random() * 10) + 10;
          return {
            ...bar,
            height: randomHeight,
          };
        });
      }, 100);
    },
    pauseVisualization() {
      clearInterval(this.intervalId2);
      this.intervalId = null;
    },

    updateProgress(id) {
      if (!this.isPlaying) {
        return;
      }
      let audio = document.getElementById(id);

      let progress = (audio.currentTime / audio.duration) * this.bars.length;

      // Обновление визуализации
      this.bars.forEach((bar, index) => {
        bar.active = index < progress;
      });

      localStorage.setItem("audioUrl" + this.item.link, audio.currentTime);

      let timeLeft = audio.duration - audio.currentTime;
      this.remainingTime = this.formatTime(timeLeft);
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return "00:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes < 10 ? "0" : ""}${minutes}:${
        remainingSeconds < 10 ? "0" : ""
      }${remainingSeconds}`;
    },

    closeWidjet() {
      let audio = document.getElementById("audioWidjet");
      clearInterval(this.intervalId);
      if (audio) {
        audio.pause();
      }
      this.isPlaying = false;
      localStorage.setItem("audioPlay", "paused");
      this.$emit("closeWidjet");
    },
    startInterval() {
      this.intervalId = setInterval(() => {
        let audio = document.getElementById("audioWidjet");
        if (audio) {
          const audioStatus = localStorage.getItem("audioPlay");
          if (audioStatus === "paused" && this.isPlaying) {
            audio.pause();
            this.isPlaying = false;
          } else if (audioStatus === "playing" && !this.isPlaying) {
            audio.play();
            this.isPlaying = true;
          }
        }
      }, 50);
    },
  },
  watch: {
    isPlaying(newVal) {
      let audio = document.getElementById("audioWidjet");
      if (audio) {
        if (newVal) {
          audio.play();
        } else {
          audio.pause();
        }
      }
    },
  },
  mounted() {
    let isMobile = window.innerWidth < 1024;

    if (isMobile) {
      this.widgetPosition = {
        top: 20,
        left: 20,
      };
    }
    this.startInterval();
  },
  beforeUnmount() {
    clearInterval(this.intervalId); // Очистка интервала при размонтировании компонента
  },
};
</script>
<template>
  <div
    class="widjet_audio"
    @mousedown="startDragging($event)"
    @touchstart="startDragging($event)"
    @touchmove.prevent="dragWidget($event)" 
    @touchend="stopDragging"
    @mouseup="stopDragging"
    @mousemove="dragWidget($event)"
    :style="{
      top: widgetPosition.top + 'px',
      left: widgetPosition.left + 'px',
    }"
  >
    <div class="podkast__body-item">
      <div class="image">
        <img
          v-if="item.audioPic"
          :src="apiDomain + 'web/uploads/' + item.audioPic"
          alt=""
          class="img"
        />
      </div>
      <div
        class="btn__playAudio"
        :id="'audioB' + item.id"
        @click="togglePlayAudio()"
        :class="{ play: isPlaying }"
      >
        <svg
          class="playSvg"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M23 12.0002C23 10.9652 22.47 9.93018 21.409 9.35318L8.597 2.38518C6.534 1.26418 4 2.72418 4 5.03318V12.0002H23Z"
            fill="white"
          />
          <path
            d="M8.597 21.615L21.409 14.647C21.89 14.3924 22.2923 14.0113 22.5727 13.5448C22.8531 13.0784 23.0008 12.5442 23 12H4V18.967C4 21.277 6.534 22.736 8.597 21.615Z"
            fill="white"
          />
        </svg>
        <svg
          class="pauseSvg"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M1.66602 5.00033C1.66602 3.42866 1.66602 2.64366 2.15435 2.15533C2.64268 1.66699 3.42768 1.66699 4.99935 1.66699C6.57102 1.66699 7.35602 1.66699 7.84435 2.15533C8.33268 2.64366 8.33268 3.42866 8.33268 5.00033V15.0003C8.33268 16.572 8.33268 17.357 7.84435 17.8453C7.35602 18.3337 6.57102 18.3337 4.99935 18.3337C3.42768 18.3337 2.64268 18.3337 2.15435 17.8453C1.66602 17.357 1.66602 16.572 1.66602 15.0003V5.00033ZM11.666 5.00033C11.666 3.42866 11.666 2.64366 12.1543 2.15533C12.6427 1.66699 13.4277 1.66699 14.9993 1.66699C16.571 1.66699 17.356 1.66699 17.8443 2.15533C18.3327 2.64366 18.3327 3.42866 18.3327 5.00033V15.0003C18.3327 16.572 18.3327 17.357 17.8443 17.8453C17.356 18.3337 16.571 18.3337 14.9993 18.3337C13.4277 18.3337 12.6427 18.3337 12.1543 17.8453C11.666 17.357 11.666 16.572 11.666 15.0003V5.00033Z"
            fill="white"
          />
        </svg>
      </div>
      <audio
        class="theme__audio"
        :id="'audioWidjet'"
        :src="apiDomain + 'web/uploads/' + item.audioId"
        @timeupdate="updateProgress('audioWidjet')"
        @play="startVisualization"
        @pause="pauseVisualization"
        @loadedmetadata="setDuration('audioWidjet')"
        autoplay="false"
        controls
        style="display: none; visibility: hidden"
      ></audio>
      <div class="audio__visualization">
        <div class="head__audio">{{ item.audioName }}</div>
        <div class="time">{{ remainingTime }}</div>
        <div class="audio__bars">
          <div
            v-for="(bar, index) in bars"
            :key="index"
            :class="['audio__bar', { 'audio__bar--active': bar.active }]"
            :style="{ height: bar.height + 'px' }"
            @click="seekAudio(index)"
          ></div>
        </div>
      </div>
      <div @click="closeWidjet" class="close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071Z"
            fill="#fff"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
<style scoped>
.image {
  width: 56px;
  height: 56px;
  border-radius: 10px;
}
.image .img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 10px;
}
.widjet_audio {
  position: fixed;

  z-index: 100;
  border-radius: var(--S, 15px);
  background: #333;
  box-shadow: 0px -1px 0px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  max-width: 95vw;
  padding: 15px;
}
.podkast__body-item {
  display: flex;
  gap: 15px;
  position: relative;
  align-items: center;
  gap: 10px;
}
.close {
  cursor: pointer;
}
.audio__visualization {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.head__audio {
  color: #fff;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
  max-width: 267px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  color: #979797;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.28px;
}
.audio__bars {
  height: 24px;
}
.btn__playAudio {
  border-radius: 90px;
  background: #4a4a4a;
}
.btn__playAudio.play {
  background: #7451f3;
}
.btn__playAudio {
  border-radius: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  width: 50px;
  height: 50px;
  cursor: pointer;
}
.audio__bars {
  display: flex;
  align-items: flex-end;
  height: 24px;
}

.audio__bar {
  width: 4px;
  margin: 0 2px;
  background-color: #8b8b8b;
  transition: background-color 0.2s, height 0.25s;
  cursor: pointer;
}

.audio__bar--active {
  background-color: #7451f3;
}
@media screen and (max-width: 1024px) {
  .head__audio {
    font-size: 14px;
    max-width: 150px;
  }
}
</style>