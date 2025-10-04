<script>
import PrelouderComp from "./components/ui/PrelouderComp.vue";
import emitter from "./eventBus"; // Импортируем глобальный эмиттер
import WidjetAudio2 from "./components/elements/WidjetAudio2.vue";
import { useCookies } from "vue3-cookies";
import axios from "axios";

export default {
  name: "App",
  components: {
    PrelouderComp,
    WidjetAudio2,
  },
  data() {
    return {
      apiUrl: this.$store.getters.getApiUrl,
      user: this.$store.getters.getUser,
      loading: true,
      audioWidjet: null,
      observers: [], // Для хранения всех Observer
      mutationObserver: null, // Для отслеживания изменений в DOM
      flagPlay: false,
    };
  },
  methods: {
    showPreloader() {
      this.loading = true;
    },
    hidePreloader() {
      this.loading = false;
    },
    checkCookie() {
      let user = this.cookies.isKey("user") ? this.cookies.get("user") : false;
      let localUser = this.cookies.isKey('localUser') ? this.cookies.get('localUser') : false;
      
      
      if (user) {
        this.$store.commit("setUserData", user);
        if (!localUser){
        let authget = `&auth=${user.username}:${user.auth_key}`;
        axios
          .get(this.apiUrl + "api-geo/get-geo" + authget)
          .then((response) => {
            if (response.data.geo.region_with_type == null) {
              this.updateLoacal();
              return;
            } else {
              this.$store.commit("setLocal", response.data.geo);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        } else {
          this.$store.commit("setLocal", localUser);
        }

        
      } else {
        if (!localUser){
        let authget = `&auth=${this.user.username}:${this.user.auth_key}`;
        axios
          .get(this.apiUrl + "api-geo/get-geo" + authget)
          .then((response) => {
            if (response.data.geo.region_with_type == null) {
              this.updateLoacal();
              return;
            } else {
              this.$store.commit("setLocal", response.data.geo);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        } else {
          this.$store.commit("setLocal", localUser);
        }
      }
    },
    updateLoacal() {
      setTimeout(() => {
        let user = this.cookies.isKey("user") ? this.cookies.get("user") : false;
        let authget = `&auth=${user.username}:${user.auth_key}`;
        axios
          .get(this.apiUrl + "api-geo/get-geo" + authget)
          .then((response) => {
            
            this.$store.commit("setLocal", response.data.geo);
          })
          .catch((error) => {
            console.log(error);
          });
      }, 360000);
    },

    checkLocalStorage() {
      const audioId = localStorage.getItem("audioId");
      const playing = localStorage.getItem("audioPlay");
      if (audioId && playing == "playing") {
        this.goPlay(audioId);
      }
    },
    goPlay(audioId) {
      this.audioWidjet = {
        audioId: audioId,
        audioPic: localStorage.getItem("audioPic"),
        audioName: localStorage.getItem("audioName"),
        metrikId: localStorage.getItem("metrikId"),
      };
    },
  },
  computed: {
    audioS() {
      let audio = localStorage.getItem("audioId");
      return audio ? audio : null;
    },
  },
  watch: {
    audioS() {
      this.goPlay();
    },
  },
  mounted() {
    let playing = localStorage.getItem("audioPlay");
    if (playing == "playing") {
      localStorage.setItem("audioPlay", "paused");
    }
    this.checkCookie();
    this.interval = setInterval(() => {
      this.checkLocalStorage();
    }, 300);
  },
  beforeUnmount() {
    emitter.off("show-preloader", this.showPreloader);
    emitter.off("hide-preloader", this.hidePreloader);
  },
  created() {
    emitter.on("show-preloader", this.showPreloader);
    emitter.on("hide-preloader", this.hidePreloader);
  },
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
};
</script>

<template>
  <PrelouderComp v-if="loading" />
  <div class="wrapper"><router-view></router-view></div>
  <WidjetAudio2
    v-if="audioWidjet !== null"
    :item="audioWidjet"
    @closeWidjet="audioWidjet = null"
  />
</template>
<style scoped>
.wrapper {
  overflow: hidden;
}
</style>