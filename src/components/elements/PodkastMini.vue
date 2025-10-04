<script>
export default {
  name: "PodkastMini",
  props: {
    theme: {
      type: Object,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: "dark",
    },
  },
  computed: {
    isPlaying() {
      return this.$store.getters["audioPlayer/isPlaying"];
    },
    audioUrl() {
      return this.$store.getters["audioPlayer/audioUrl"];
    },
  },
  methods: {
    unikumId() {
      this.unikId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    },
    updateProgress(id) {
      const audio = document.getElementById(id);
      const progress = (audio.currentTime / audio.duration) * this.bars.length;
      this.bars.forEach((bar, index) => {
        bar.active = index < progress;
      });
      localStorage.setItem("audioUrl" + audio.src, audio.currentTime);
      this.$store.dispatch("audioPlayer/setCurrentTime", audio.currentTime);
    },
    togglePlay(id, btnId) {
      const btn = document.getElementById(btnId);
      btn.classList.toggle("play");
      const audio = document.getElementById(id);
      if (this.$store.getters["audioPlayer/isPlaying"]) {
        audio.pause();
        this.$store.dispatch("audioPlayer/pauseAudio");
      } else {
        let time = localStorage.getItem("audioUrl" + audio.src);
        if (time) {
          audio.currentTime = time;
          
        }
        audio.play();
        
        this.$store.dispatch(
          "audioPlayer/playAudio",
          this.apiDomain + "web/uploads/" + this.theme.link
        );
      }
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
    formatDate(timestamp) {
      const date = new Date(timestamp * 1000); // Умножаем на 1000, если timestamp в секундах
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    },
    loadAudio() {
      let audio = document.getElementById("audio" + this.unikId);
      audio.currentTime = this.$store.getters["audioPlayer/currentTime"];
      
      
      if (this.isPlaying) {
        audio.play();
      }
    },
  },
  data() {
    return {
      bars: Array(20).fill({ height: 10, active: false }), // Массив для визуализации
      intervalId: null,

      unikId: null,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  mounted() {
    this.unikumId();
  },
};
</script>
<template>
  <div :class="['theme__podkast', color]">
    <div v-if="theme.date_add" class="date">
      {{ formatDate(theme.date_add) }}
    </div>
    <div
      :id="'audioB' + unikId"
      class="btn__playAudio"
      @click="togglePlay('audio' + unikId, 'audioB' + unikId)"
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
      :id="'audio' + unikId"
      class="theme__audio"
      :src="apiDomain + 'web/uploads/' + theme.link"
      @timeupdate="updateProgress('audio' + unikId)"
      @play="startVisualization"
      @pause="pauseVisualization"
      @loadedmetadata="loadAudio"
      controls
    ></audio>
    <div class="audio__visualization">
      <div
        v-for="(bar, index) in bars"
        :key="index"
        :class="['audio__bar', { 'audio__bar--active': bar.active }]"
        :style="{ height: bar.height + 'px' }"
      ></div>
    </div>
    <div class="audio__head">{{ theme.title }}</div>
  </div>
</template>

<style scoped>
.theme__podkast {
  width: 100%;
  max-width: 21.88%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 40px 20px 20px;
  height: 390px;

  gap: 18px;
}
.dark,
.lifestyle {
  background: #333;
  color: var(--Neutral-100, #fff);
}
.dark .audio__bar--active,
.lifestyle .audio__bar--active {
  background-color: #439563;
}
.dark .btn__playAudio,
.lifestyle .btn__playAudio{
  background: #439563;
}

/* музыка */
.music {
  background: #5f22c1;
  color: var(--Neutral-100, #fff);
}
.music .audio__bar--active {
  background-color: #f092f9;
}
.music .btn__playAudio {
  background: #f092f9;
}

.audio__head {
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.32px;
}
.audio__visualization {
  display: flex;
  align-items: flex-end;
  height: 24px; /* Высота контейнера для палочек */
  margin-top: 10px;
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
.theme__audio {
  display: none;
  visibility: hidden;
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
  margin-top: auto;
}
.date {
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.music .date {
  color: #f092f9;
}
</style>