<script>
import { myMixinColor } from "@/mixin";
export default {
  name: "WidjetAudio",
  data() {
    return {
      apiDomain: this.$store.getters.getApiDomain,
      audioID: null,
    };
  },
  mixins: [myMixinColor],
  methods: {
    playingAudio() {
       
        
      this.audioID = localStorage.getItem("audioId");
      if (this.audioID) {
        let audio = document.getElementById("audioWidjet");
        audio.src = this.apiDomain + "web/uploads/" + this.audioID;
        if (localStorage.getItem("audioPlay" + this.audioID) == "playing") {
          let audios = document.querySelectorAll(".podkastComponent");
          for (let a of audios) {
            let dataSound = a.getAttribute("data-sound");
            if (dataSound == this.audioID) {
                a.querySelector('audio').pause();
            }
          }
          audio.play();
        }
      }
    },
    updateProgress() {
      let audio = document.getElementById("audioWidjet");
      localStorage.setItem("audioUrl" + this.audioID, audio.currentTime);
    },
  },
  mounted() {
   
    this.playingAudio();
  },
};
</script>
<template>
  <div class="widjet_audio">
    <div class="podkast__body-item">
      <div
        class="btn__playAudio"
        :id="'audioB' + item.id"
        @click="togglePlayAudio('audio' + item.id, 'audioB' + item.id)"
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
        @timeupdate="updateProgress()"
        @play="startVisualization"
        @pause="pauseVisualization"
        @loadedmetadata="setDuration('audio' + item.id)"
        controls
        style="display: none; visibility: hidden"
      ></audio>
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
  </div>
</template>
<style scoped>
.widjet_audio {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 100;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
}
.podkast__body-item {
  display: flex;
  gap: 15px;
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