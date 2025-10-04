export default {
    namespaced: true,
    state: {
      isPlaying: false,
      audioUrl: null,
      currentTime: 0,
      isWidgetVisible: false
    },
    mutations: {
      SET_PLAYING(state, status) {
        state.isPlaying = status;
      },
      SET_AUDIO_URL(state, url) {
        state.audioUrl = url;
      },
      SET_CURRENT_TIME(state, time) {
        state.currentTime = time;
      },
      SET_WIDGET_VISIBLE(state, status) {
        state.isWidgetVisible = status;
      }
    },
    actions: {
      playAudio({ commit }, url) {
        commit('SET_AUDIO_URL', url);
        commit('SET_PLAYING', true);
      },
      pauseAudio({ commit }) {
        commit('SET_PLAYING', false);
      },
      setCurrentTime({ commit }, time) {
        commit('SET_CURRENT_TIME', time);
      },
      toggleWidgetVisibility({ commit }, status) {
        commit('SET_WIDGET_VISIBLE', status);
      }
    },
    getters: {
      isPlaying: state => state.isPlaying,
      audioUrl: state => state.audioUrl,
      currentTime: state => state.currentTime,
      isWidgetVisible: state => state.isWidgetVisible
    }
  };