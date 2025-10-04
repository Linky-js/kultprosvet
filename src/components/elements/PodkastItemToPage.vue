<script>
export default {
  name: "PodkastItemToPage",
  props: {
    item: {
      type: Object,
    },
  },
  data() {
    return {
      isPlaying: false,
      remainingTime: "00:00",
      bars: Array(20).fill({ height: 10, active: false }),
      intervalId: null,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  methods: {
    setDuration(id) {
      const audio = document.getElementById(id);
     
      this.remainingTime = this.formatTime(audio.duration); // Устанавливаем полное время трека
    },
    updateProgress(id) {
      const audio = document.getElementById(id);

      const progress = (audio.currentTime / audio.duration) * this.bars.length;

      // Обновление визуализации
      this.bars.forEach((bar, index) => {
        bar.active = index < progress;
      });

      localStorage.setItem("audioUrl" + this.item.link, audio.currentTime);

      const timeLeft = audio.duration - audio.currentTime;
      this.remainingTime = this.formatTime(timeLeft);
    },
    togglePlayAudio2(id, btnId) {
      localStorage.removeItem("audioName");
      localStorage.removeItem("audioPic");

      let localFlag = localStorage.getItem("audioId");
      if (localFlag) {
        if (localFlag != this.item.link + this.item.id) {
          localStorage.removeItem("audioId");
          localStorage.setItem("audioId", this.item.link);
          if (this.item.pic != null) {
            localStorage.setItem("audioPic", this.item.pic);
          }

          localStorage.setItem("audioName", this.item.title);
          localStorage.setItem("metrikId", this.item.id);
        }
      } else {
        localStorage.setItem("audioId", this.item.link);
        if (this.item.pic != null) {
          localStorage.setItem("audioPic", this.item.pic);
        }
        localStorage.setItem("audioName", this.item.title);
        localStorage.setItem("metrikId", this.item.id);
      }

      const btn = document.getElementById(btnId);
      btn.classList.toggle("play");
      const audio = document.getElementById(id);

      if (this.isPlaying) {
        audio.pause();
        localStorage.setItem("audioPlay" + this.item.link, "paused");
      } else {
        audio.play();
        localStorage.setItem("audioPlay" + this.item.link, "playing");
      }
      this.isPlaying = !this.isPlaying;
    },
    togglePlayAudio(link) {
      let playing = localStorage.getItem("audioPlay");
      if (playing == "playing") {
        localStorage.setItem("audioPlay", "paused");
      }
      localStorage.removeItem("audioPic");
      localStorage.setItem("audioId", link);
      if (this.item.pic != null) {
        localStorage.setItem("audioPic", this.item.pic);
      }
      localStorage.setItem("audioName", this.item.title);
      localStorage.setItem("metrikId", this.item.id);
      
      setTimeout(() => {
        localStorage.setItem("audioPlay", "playing");
      }, 350);
      
    },
    startVisualization() {
      if (this.intervalId) return;
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
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return "00:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes < 10 ? "0" : ""}${minutes}:${
        remainingSeconds < 10 ? "0" : ""
      }${remainingSeconds}`;
    },
  },
  mounted() {
    
  },
};
</script>
<template>
  <div class="podkast__body-item podkastComponent" :data-sound="item.link">
    <div class="image">
      <router-link :to="'podcast/' + $route.params.id != 'podcast/' + item.id ? `/podcast/${item.id}` : ''">
        <img
          v-if="item.pic"
          :src="apiDomain + 'web/uploads/' + item.pic"
          alt=""
          class="img"
        />
      </router-link>
    </div>
    <div
      class="btn__playAudio"
      :id="'audioB' + item.id"
      @click="togglePlayAudio(item.link)"
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
    <!-- <audio
      class="theme__audio"
      :id="'audio' + item.id"
      :src="apiDomain + 'web/uploads/' + item.link"
      @timeupdate="updateProgress('audio' + item.id)"
      @play="startVisualization"
      @pause="pauseVisualization"
      @loadedmetadata="setDuration('audio' + item.id)"
      controls
      style="display: none; visibility: hidden"
    ></audio> -->
    <div class="audio__visualization">
      <div class="head__audio">{{ item.title }}</div>
      <div class="time">{{ remainingTime }}</div>
      <div class="audio__bars">
        <div
          v-for="(bar, index) in bars"
          :key="index"
          :class="['audio__bar', { 'audio__bar--active': bar.active }]"
          :style="{ height: bar.height + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.podkast__body-item {
  display: flex;
  gap: 15px;
}
.image {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  flex-shrink: 0;
}
.image .img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 10px;
}
.audio__visualization {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.head__audio {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
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
  background: #d1d1d1;
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
}

.audio__bar--active {
  background-color: #439563;
}
</style>