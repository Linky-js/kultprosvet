<script>
export default {
  name: "MaterialMini",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {},
  mounted() {
    
  },
  data() {
    return {
      user: this.$store.getters.getUser,
      apiDomain: this.$store.getters.getApiDomain,
    };
  }
};
</script>

<template>
  <div class="materialMini">
    <div class="icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
      >
        <path
          d="M17.2223 30.583C16.8389 30.583 16.5806 30.6205 16.4473 30.658V33.1122C16.6056 33.1497 16.8035 33.1601 17.0764 33.1601C18.0743 33.1601 18.6889 32.6559 18.6889 31.8038C18.6889 31.0413 18.1598 30.583 17.2223 30.583ZM24.4868 30.608C24.0702 30.608 23.7993 30.6455 23.6389 30.683V36.1205C23.7993 36.158 24.0577 36.158 24.291 36.158C25.9931 36.1705 27.1014 35.233 27.1014 33.2497C27.1139 31.5205 26.1035 30.608 24.4868 30.608Z"
          fill="#BFBFBF"
        />
        <path
          d="M29.1673 4.16699H12.5007C11.3956 4.16699 10.3358 4.60598 9.55437 5.38738C8.77297 6.16878 8.33398 7.22859 8.33398 8.33366V41.667C8.33398 42.7721 8.77297 43.8319 9.55437 44.6133C10.3358 45.3947 11.3956 45.8337 12.5007 45.8337H37.5007C38.6057 45.8337 39.6655 45.3947 40.4469 44.6133C41.2283 43.8319 41.6673 42.7721 41.6673 41.667V16.667L29.1673 4.16699ZM19.7882 33.7295C19.1444 34.3337 18.1944 34.6045 17.0882 34.6045C16.8736 34.6085 16.6591 34.596 16.4465 34.567V37.5378H14.584V29.3378C15.4246 29.2128 16.2738 29.1557 17.1236 29.167C18.284 29.167 19.109 29.3878 19.6652 29.8316C20.1944 30.2524 20.5527 30.942 20.5527 31.7545C20.5506 32.5712 20.2798 33.2607 19.7882 33.7295ZM27.7194 36.5524C26.8444 37.2795 25.5132 37.6253 23.8861 37.6253C22.9111 37.6253 22.2215 37.5628 21.7527 37.5003V29.3399C22.5936 29.2176 23.4426 29.1598 24.2923 29.167C25.8694 29.167 26.8944 29.4503 27.6944 30.0545C28.559 30.6962 29.1007 31.7191 29.1007 33.1878C29.1007 34.7774 28.5194 35.8753 27.7194 36.5524ZM35.4173 30.7712H32.2257V32.6691H35.209V34.1982H32.2257V37.5399H30.3382V29.2295H35.4173V30.7712ZM29.1673 18.7503H27.084V8.33366L37.5007 18.7503H29.1673Z"
          fill="#BFBFBF"
        />
      </svg>
    </div>
    <div class="title">{{ item.title }}</div>
    <div class="size">{{ item.format }}, {{ item.size }}</div>
    <router-link v-if="user.username == 'guest'" :to="'/login'" class="link">Войдите, чтобы скачать</router-link>
    <a v-else :href="apiDomain + 'web/uploads/' + item.link" class="link">Открыть файл</a>
  </div>
</template>
<style scoped>
.materialMini {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  background: #f4f4f4;
  width: 178px;
  height: 304px;
  padding: 16px;
  transition: all 0.3s linear;
}
.materialMini * {
  transition: all 0.3s linear;
}
.icon {
  width: 50px;
  height: 50px;
}
.materialMini path {
  fill: #bfbfbf;
}
.materialMini:hover path {
  fill: #FFFFFF;
}
.materialMini:hover {
  background: #333;
}
.title {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  max-width: 117px;
  margin-top: auto;
}
.materialMini:hover .title {
  color: #fff;
}
.materialMini:hover .link {
  color: #fff;
}
.link {
  color: #5F22C1;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
.size {
  color: #717171;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>