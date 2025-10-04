<script>
import SideBar from "../blocks/SideBar.vue";
import HeaderAcc from "../blocks/HeaderAcc.vue";
import ProfileAcc from "../blocks/ProfileAcc.vue";
import AlertsAcc from "../blocks/AlertsAcc.vue";
import HistoryAcc from "../blocks/HistoryAcc.vue";
import axios from "axios";
export default {
  name: "AccountPage",
  components: {
    SideBar,
    HeaderAcc,
    ProfileAcc,
    AlertsAcc,
    HistoryAcc
  },
  data() {
    return {
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      userInfo: null,
      stage: 'profile',
    };
  },
  methods: {
    getUserInfo() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-user/get-user" + authGet)
        .then((response) => {
        
          this.userInfo = response.data.user;
        })
    },
  },
  mounted() {
    this.getUserInfo();
  },
  
};
</script>

<template>
  <div class="wrapperAcc">
    <div class="sidebar">
      <SideBar @updateStage="stage = $event" :user="user" />
    </div>
    <div class="info">
      <HeaderAcc class="header_acc" />
      <ProfileAcc v-if="stage == 'profile'" :userP="userInfo" />
      <AlertsAcc v-if="stage == 'alerts'" />
      <HistoryAcc v-if="stage == 'history'" />
    </div>
  </div>
</template>

<style scoped>
.wrapperAcc {
  display: flex;
  background: #f5f7f8;
  padding-right: 30px;
  gap: 51px;
}
.sidebar {
  width: 308px;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  background: url(@/assets/image/sidebar.png);
}
.info {
  width: 100%;
  max-width: 954px;
}
@media screen and (max-width: 1024px) {
  .header_acc{
    display: none;
  }
  .wrapperAcc{
    flex-direction: column;
    padding: 0;
  }
  .sidebar{
    height: auto;
    position: static;
    width: 100%;
    background: url(@/assets/image/sidebar-mob.png);
    background-size: cover;
    background-position: bottom;
  }
  .info{
    padding: 20px;
  }
}
</style>