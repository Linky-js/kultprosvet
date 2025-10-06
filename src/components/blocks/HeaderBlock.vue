<script>
import router from "@/router/router";
import axios from "axios";
import { useCookies } from "vue3-cookies";
import PopapCity from "../elements/PopapCity.vue";
export default {
  name: "HeaderBlock",
  components: {
    PopapCity,
  },
  data() {
    return {
      links: [
        {
          id: 1,
          name: "Темы",
          link: "/tems",
          sublinks: [],
        },
        {
          id: 2,
          name: "Видео",
          link: "/videos",
        },
        {
          id: 3,
          name: "Подкасты",
          link: "/podcasts",
        },
        {
          id: 10,
          name: "Карта",
          link: "/objects",
        },
        {
          id: 4,
          name: "Тесты",
          link: "/tests",
        },
        {
          id: 5,
          name: "Новости",
          link: "/news",
        },
        {
          id: 6,
          name: "Библиотека",
          link: "/library",
        },
        {
          id: 9,
          name: "Афиша",
          link: "/afisha",
        },
        {
          id: 8,
          name: "О проекте",
          link: "/about",
        },
        {
          id: 7,
          name: "Контакты",
          link: "/contacts",
        },
      ],
      links2: [],
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      local: this.$store.getters.getLocal,
      accFlag: false,
      avatar: null,
      popapCityes: false,
      step: 2,
    };
  },
  computed: {
    getThemeId() {
      return this.$route.params.id;
    },
  },
  watch: {
    getThemeId() {
      this.getMenu();
    },
  },
  methods: {
    getMenu() {
      let theme_id = this.getThemeId;

      let params = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-theme/get-list" + params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          withCredentials: false,
        })
        .then((response) => {
          let links2 = response.data.themes;
          this.links[0].sublinks = [];
          for (let l of links2) {
            let link = {
              id: l.id,
              name: l.name,
              link: "/theme/" + l.id,
            };
            if (link.id == theme_id) {
              link.active = true;
            } else {
              link.active = false;
            }
            this.links[0].sublinks.push(link);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    openBurger() {
      let nav = document.querySelector(".header__nav");
      nav.classList.toggle("active");

      let icon = document.querySelector(".burger_link .icon");
      icon.classList.toggle("active");
      setTimeout(() => {
        icon.classList.toggle("rotate");
      }, 300);
    },
    enterSublink() {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        return;
      }
      let item = document.querySelector(".header__linkSub");

      item.classList.add("active");
    },
    leaveSublink() {
      let mobile = window.innerWidth < 1024;
      if (mobile) {
        return;
      }
      let item = document.querySelector(".header__linkSub");
      item.classList.remove("active");
    },
    clickSublink() {
      const isDesktop = window.innerWidth > 1024;
      if (isDesktop) return;

      this.isSubmenuOpen = true;

      const elsToHide = [
        ...document.querySelectorAll(".header__link"),
        ".mobile__btns",
        ".mobile__socialsWrap",
        ".header__city"
      ];

      elsToHide.forEach(sel => {
        if (typeof sel === "string") {
          document.querySelector(sel)?.classList.add("none");
        } else {
          sel.classList.add("none");
        }
      });

      document.querySelector(".header__linkSub")?.classList.add("active");
      document.querySelector(".header__prev")?.classList.add("active");
      document.querySelector(".header__head")?.classList.add("active");
    },
    clickPrev() {
      this.isSubmenuOpen = false;

      const elsToShow = [
        ...document.querySelectorAll(".header__link"),
        ".mobile__btns",
        ".header__city"
      ];

      elsToShow.forEach(sel => {
        if (typeof sel === "string") {
          document.querySelector(sel)?.classList.remove("none");
        } else {
          sel.classList.remove("none");
        }
      });

      document.querySelector(".mobile__socialsWrap")?.classList.remove("none");
      document.querySelector(".header__prev")?.classList.remove("active");
      document.querySelector(".header__head")?.classList.remove("active");
      document.querySelector(".header__linkSub")?.classList.remove("active");
    },
    openAccount() {
      if (this.accFlag) {
        router.push("/account");
      } else {
        router.push("/login");
      }
    },
    checkCookie() {
      let user = this.cookies.isKey("user") ? this.cookies.get("user") : false;

      if (user) {
        this.accFlag = true;
      }
    },
    closePopup() {
      let city = this.cookies.isKey("localUser")
        ? this.cookies.get("localUser")
        : false;
      if (city) {
        this.local = this.$store.getters.getLocal;
      }
      this.popapCityes = false;
    }
  },
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  mounted() {
    this.getMenu();
    this.checkCookie();
    if (this.user?.profile?.avatar) {
      this.avatar = this.user.profile.avatar;
    }
    let city = this.cookies.isKey("localUser")
      ? this.cookies.get("localUser")
      : false;
    if (!city) {
      if (this.local.id != 605) {
        this.step = 1;
        this.popapCityes = true;
      }
    }
  },
};
</script>

<template>
  <div class="header">
    <div class="container">
      <div class="header__content">
        <router-link to="/" class="header__logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="45" viewBox="0 0 192 45" fill="none">
            <path d="M16.7298 0.00244141H0V44.9999H16.7298V0.00244141Z" fill="black" />
            <path class="path_animated"
              d="M22.3022 33.7512C22.3022 27.5387 27.2942 22.5024 33.4521 22.5024C39.61 22.5024 44.6019 27.5387 44.6019 33.7512C44.6019 39.9637 39.61 44.9999 33.4521 44.9999C27.2942 44.9999 22.3022 39.9637 22.3022 33.7512Z"
              fill="black" />
            <path d="M27.8721 0.00244141H44.5867L33.4419 22.5024H16.7273L27.8721 0.00244141Z" fill="black" />
            <path
              d="M60.4053 19.6075V0.00244141H64.8521V7.83938H67.5979L72.2087 0.00244141H77.2865L71.275 9.47398L77.2587 19.6101H72.0699L67.7064 11.9666H64.8521V19.6101H60.4053V19.6075Z"
              fill="black" />
            <path
              d="M82.2533 19.6076V15.3149C83.0962 15.3149 83.7726 15.2767 84.2849 15.2028C84.8149 15.129 85.254 14.9711 85.6023 14.7318C85.9682 14.4721 86.3064 14.0953 86.6168 13.5962L79.3157 0H84.5019L88.921 9.3315L92.545 0H97.2922L92.3507 11.6306C92.0403 12.3512 91.7299 13.0616 91.4169 13.7617C91.1065 14.4441 90.7683 15.0908 90.4024 15.6993C90.0541 16.3079 89.6604 16.8629 89.2213 17.3619C88.7998 17.8432 88.3254 18.2378 87.7929 18.5535C87.1342 18.9227 86.3569 19.1901 85.4609 19.3556C84.5877 19.5236 83.5177 19.6076 82.2533 19.6076Z"
              fill="black" />
            <path
              d="M97.4106 19.6636V15.3989C98.1072 15.3989 98.6372 15.269 99.0031 15.0119C99.3867 14.7522 99.6618 14.383 99.8259 13.9043C100.01 13.4231 100.146 12.8706 100.237 12.2417C100.31 11.7248 100.356 11.18 100.374 10.6071C100.411 10.0164 100.429 9.46136 100.429 8.9445C100.447 8.40981 100.457 7.9566 100.457 7.58742L100.512 0H114.537V19.6051H110.09V4.15271H104.656L104.601 8.38944C104.601 9.83054 104.573 11.1774 104.517 12.4327C104.462 13.6701 104.308 14.7776 104.051 15.7553C103.793 16.7331 103.346 17.5453 102.705 18.192C102.102 18.7827 101.398 19.1799 100.593 19.3836C99.8057 19.5694 98.7457 19.6636 97.4106 19.6636Z"
              fill="black" />
            <path
              d="M118.408 19.6075V0.00244141H122.855V7.00935H126.615C127.64 7.00935 128.602 7.11119 129.497 7.31488C130.393 7.50074 131.171 7.82155 131.829 8.28495C132.506 8.72797 133.028 9.33649 133.394 10.1131C133.778 10.8693 133.97 11.8291 133.97 12.9927C133.987 14.2861 133.76 15.3657 133.283 16.2314C132.826 17.0818 132.203 17.7539 131.418 18.253C130.648 18.752 129.77 19.1034 128.783 19.3045C127.794 19.5082 126.79 19.6101 125.765 19.6101H118.408V19.6075ZM122.855 15.4803H125.984C126.497 15.4803 126.964 15.4523 127.385 15.3962C127.824 15.3224 128.208 15.2027 128.538 15.0372C128.869 14.8717 129.114 14.6324 129.28 14.3167C129.465 14.0035 129.556 13.6063 129.556 13.1251C129.556 12.6643 129.482 12.2951 129.336 12.0175C129.19 11.74 128.97 11.5287 128.677 11.381C128.384 11.2155 128.046 11.1035 127.663 11.0475C127.297 10.9915 126.885 10.9635 126.429 10.9635H122.86V15.4803H122.855Z"
              fill="black" />
            <path d="M139.572 19.6075V4.15515H133.725V0.00244141H149.917V4.15515H144.016V19.6075H139.572Z"
              fill="black" />
            <path d="M60.4053 44.7784V25.1733H76.8448V44.7784H72.398V29.298H64.8521V44.7784H60.4053Z" fill="black" />
            <path
              d="M80.749 44.7784V25.1733H88.6256C90.1272 25.1733 91.4345 25.3948 92.55 25.8379C93.6831 26.2809 94.5614 27.0014 95.1847 27.997C95.8258 28.9951 96.1463 30.3419 96.1463 32.0402C96.1463 33.6086 95.8081 34.9199 95.1317 35.9714C94.4554 37.023 93.5317 37.8071 92.3607 38.324C91.1897 38.823 89.8546 39.0726 88.353 39.0726H85.1958V44.7759H80.749V44.7784ZM85.1958 35.0854H88.353C89.3953 35.0854 90.218 34.8257 90.8237 34.3088C91.4471 33.7919 91.7575 33.0357 91.7575 32.0377C91.7575 31.1338 91.4925 30.4591 90.9625 30.016C90.4502 29.5552 89.5997 29.3235 88.4111 29.3235H85.2009V35.0854H85.1958Z"
              fill="black" />
            <path
              d="M107.781 44.9998C105.787 44.9998 104.058 44.5848 102.595 43.7548C101.148 42.9044 100.033 41.7332 99.2456 40.2386C98.4582 38.7237 98.0645 36.9796 98.0645 35.0038C98.0645 32.972 98.4657 31.2101 99.2733 29.7155C100.096 28.2006 101.239 27.0294 102.703 26.1993C104.167 25.3489 105.896 24.9263 107.889 24.9263C109.848 24.9263 111.549 25.3413 112.995 26.1713C114.459 27.0013 115.594 28.1649 116.399 29.6595C117.222 31.1362 117.633 32.8803 117.633 34.8943C117.633 36.8701 117.23 38.6244 116.425 40.1546C115.619 41.6695 114.476 42.8585 112.995 43.7268C111.531 44.5746 109.792 44.9998 107.781 44.9998ZM107.862 40.7631C109.106 40.7631 110.113 40.4779 110.88 39.905C111.65 39.3322 112.207 38.604 112.553 37.7179C112.901 36.8319 113.076 35.928 113.076 35.0038C113.076 34.3214 112.975 33.6365 112.773 32.9542C112.589 32.2718 112.288 31.6429 111.867 31.07C111.463 30.4972 110.933 30.0363 110.274 29.685C109.616 29.3336 108.8 29.1579 107.831 29.1579C106.605 29.1579 105.608 29.4431 104.841 30.0159C104.071 30.571 103.506 31.289 103.14 32.1751C102.791 33.0611 102.617 33.993 102.617 34.9707C102.617 35.9484 102.801 36.8803 103.167 37.7663C103.533 38.6524 104.101 39.3729 104.868 39.9254C105.658 40.4856 106.655 40.7631 107.862 40.7631Z"
              fill="black" />
            <path
              d="M128.95 44.9998C126.938 44.9998 125.217 44.595 123.789 43.7802C122.363 42.968 121.273 41.8146 120.523 40.3201C119.791 38.8255 119.425 37.0712 119.425 35.0598C119.425 33.0102 119.809 31.2304 120.579 29.7155C121.346 28.2006 122.436 27.0294 123.844 26.1993C125.273 25.3489 126.956 24.9263 128.894 24.9263C130.396 24.9263 131.749 25.1936 132.958 25.7283C134.166 26.263 135.143 27.0574 135.895 28.1089C136.662 29.1426 137.129 30.4539 137.293 32.0401H133.038C132.819 31.1362 132.369 30.4335 131.693 29.9345C131.034 29.4176 130.139 29.1579 129.003 29.1579C127.776 29.1579 126.797 29.4431 126.065 30.0159C125.333 30.571 124.803 31.2814 124.473 32.147C124.162 33.0153 124.006 33.9191 124.006 34.8612C124.006 35.8389 124.17 36.781 124.501 37.6848C124.849 38.5887 125.389 39.3271 126.121 39.9C126.87 40.4728 127.86 40.758 129.084 40.758C129.815 40.758 130.456 40.6485 131.004 40.4245C131.572 40.2029 132.039 39.8796 132.405 39.4544C132.771 39.0292 133.026 38.5225 133.172 37.9318H137.536C137.389 39.4646 136.905 40.7555 136.082 41.8095C135.277 42.8611 134.242 43.6555 132.98 44.1902C131.741 44.7325 130.396 44.9998 128.95 44.9998Z"
              fill="black" />
            <path
              d="M140.329 44.7784V25.1733H149.415C150.273 25.1733 151.06 25.265 151.774 25.4509C152.506 25.6164 153.137 25.9041 153.667 26.3089C154.217 26.6959 154.646 27.223 154.957 27.8875C155.267 28.5342 155.424 29.3541 155.424 30.3521C155.424 31.1083 155.25 31.8289 154.901 32.5112C154.553 33.1936 154.058 33.7206 153.42 34.0898C154.28 34.4234 154.967 34.9759 155.479 35.7524C156.012 36.5086 156.274 37.4965 156.274 38.7161C156.274 39.9153 156.055 40.9134 155.616 41.7078C155.194 42.4844 154.609 43.1005 153.859 43.5639C153.127 44.0069 152.284 44.3201 151.335 44.506C150.384 44.6918 149.387 44.7835 148.345 44.7835H140.329V44.7784ZM144.776 40.6512H148.784C149.241 40.6512 149.652 40.613 150.018 40.5391C150.402 40.4475 150.722 40.3278 150.977 40.1801C151.252 40.0146 151.451 39.8008 151.58 39.5436C151.726 39.2661 151.8 38.9529 151.8 38.6015C151.8 38.2324 151.737 37.9268 151.608 37.6875C151.497 37.4481 151.325 37.2546 151.088 37.107C150.851 36.9415 150.566 36.8294 150.237 36.776C149.909 36.7021 149.533 36.6639 149.112 36.6639H144.776V40.6512ZM144.776 32.9823H148.317C148.756 32.9823 149.14 32.9364 149.47 32.8448C149.819 32.7531 150.101 32.6233 150.321 32.4578C150.54 32.2923 150.707 32.0886 150.815 31.8492C150.944 31.6099 151.007 31.3324 151.007 31.0192C151.007 30.594 150.906 30.263 150.707 30.0211C150.523 29.7614 150.258 29.5883 149.912 29.4941C149.564 29.3821 149.142 29.3286 148.648 29.3286H144.779V32.9823H144.776Z"
              fill="black" />
            <path
              d="M159.118 44.7784V25.1733H173.446V29.326H163.565V33.0357H171.881V37.0229H163.565V40.6512H173.446V44.7759H159.118V44.7784Z"
              fill="black" />
            <path d="M181.65 44.7784V29.326H175.805V25.1733H192V29.326H186.099V44.7784H181.65Z" fill="black" />
          </svg>
        </router-link>
        <nav class="header__nav">
          <div class="header__prev" @click="clickPrev">
            <svg width="8" height="16" viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.67413 16L7.24338 16C7.49317 16 7.72078 15.8566 7.82855 15.6312C7.93376 15.4112 7.90671 15.1508 7.75852 14.9572L2.64671 8.27695C2.50926 8.09733 2.43478 7.87744 2.43478 7.65126C2.43478 7.4069 2.5217 7.17051 2.67998 6.98434L7.73515 1.03877C7.89626 0.849286 7.9309 0.582791 7.82359 0.358418C7.71885 0.139405 7.49765 -4.39172e-08 7.25487 -6.5141e-08L6.6472 -1.18265e-07C6.18127 -1.58999e-07 5.73864 0.203782 5.43568 0.557773L0.491227 6.33512C0.174217 6.70553 7.71329e-07 7.17703 7.28706e-07 7.66457C6.89089e-07 8.11774 0.150551 8.55806 0.427997 8.91637L5.44708 15.3982C5.741 15.7778 6.19405 16 6.67413 16Z"
                fill="#EBDFFF" />
            </svg>
            Назад
          </div>
          <div class="header__head">Темы</div>
          <ul class="header__list">
            <li v-for="(item, index) in links" :key="index">
              <div v-if="item.sublinks" @mouseover="enterSublink" @mouseleave="leaveSublink" @click="clickSublink"
                class="header__linkSub">
                <a class="header__link famsublink">{{ item.name }}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M9.64021 11.7682C9.26936 12.0773 8.73069 12.0773 8.35984 11.7682L2.35984 6.76822C1.93556 6.41466 1.87824 5.78409 2.2318 5.35982C2.58537 4.93554 3.21593 4.87821 3.64021 5.23178L9.00003 9.69829L14.3598 5.23178C14.7841 4.87821 15.4147 4.93554 15.7682 5.35982C16.1218 5.78409 16.0645 6.41466 15.6402 6.76822L9.64021 11.7682Z"
                      fill="#5F22C1" />
                  </svg>
                </a>

                <ul class="sublinks">
                  <div class="sublinksWrapper">
                    <li v-for="(subitem, subindex) in item.sublinks" :key="subindex">
                      <router-link class="sublink" :class="[subitem.name, { active: subitem.active }]"
                        :to="subitem.link">{{ subitem.name }}</router-link>
                    </li>
                  </div>
                </ul>
              </div>
              <router-link v-else class="header__link" :to="item.link">{{
                item.name
              }}</router-link>
            </li>
            <div @click="[(step = 2), (popapCityes = true)]" class="header__city">
              <svg class="city__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                fill="none">
                <path
                  d="M11.9997 4.47998C11.2442 4.47998 10.5056 4.70402 9.87741 5.12377C9.24922 5.54351 8.7596 6.14012 8.47047 6.83813C8.18134 7.53614 8.10569 8.30422 8.25309 9.04523C8.40049 9.78623 8.7643 10.4669 9.29854 11.0011C9.83278 11.5354 10.5134 11.8992 11.2544 12.0466C11.9955 12.194 12.7635 12.1183 13.4615 11.8292C14.1596 11.5401 14.7562 11.0505 15.1759 10.4223C15.5956 9.79406 15.8197 9.0555 15.8197 8.29998C15.8197 7.28685 15.4172 6.31522 14.7008 5.59883C13.9844 4.88244 13.0128 4.47998 11.9997 4.47998V4.47998ZM11.9997 10.7866C11.5079 10.7866 11.0271 10.6408 10.6182 10.3676C10.2092 10.0943 9.89052 9.70597 9.70231 9.25159C9.5141 8.79721 9.46485 8.29722 9.5608 7.81486C9.65675 7.33249 9.89358 6.88941 10.2414 6.54164C10.5891 6.19387 11.0322 5.95704 11.5146 5.86109C11.9969 5.76515 12.4969 5.81439 12.9513 6.0026C13.4057 6.19081 13.794 6.50953 14.0673 6.91846C14.3405 7.32739 14.4864 7.80816 14.4864 8.29998C14.4846 8.95833 14.2218 9.58911 13.7557 10.054C13.2895 10.5189 12.658 10.78 11.9997 10.78V10.7866Z"
                  fill="#5F22C1" />
                <path
                  d="M11.9993 1.3335C9.92279 1.33523 7.93132 2.15862 6.45987 3.62383C4.98842 5.08903 4.15656 7.07699 4.146 9.1535C4.146 12.2668 5.89266 14.8735 7.17266 16.7735L7.406 17.1202C8.67952 18.9659 10.0457 20.746 11.4993 22.4535L12.006 23.0468L12.5127 22.4535C13.9661 20.7458 15.3323 18.9658 16.606 17.1202L16.8393 16.7668C18.1127 14.8668 19.8593 12.2668 19.8593 9.1535C19.8488 7.07583 19.016 5.08687 17.5431 3.62148C16.0702 2.15608 14.077 1.33347 11.9993 1.3335V1.3335ZM15.726 16.0002L15.486 16.3535C14.3393 18.0735 12.8193 20.0002 11.9993 20.9535C11.2127 20.0002 9.65933 18.0735 8.51266 16.3535L8.27933 16.0002C7.09933 14.2402 5.47933 11.8335 5.47933 9.12683C5.47933 8.27061 5.64797 7.42278 5.97564 6.63173C6.3033 5.84069 6.78356 5.12193 7.38899 4.51649C7.99443 3.91106 8.71319 3.4308 9.50423 3.10313C10.2953 2.77547 11.1431 2.60683 11.9993 2.60683C12.8555 2.60683 13.7034 2.77547 14.4944 3.10313C15.2855 3.4308 16.0042 3.91106 16.6097 4.51649C17.2151 5.12193 17.6954 5.84069 18.023 6.63173C18.3507 7.42278 18.5193 8.27061 18.5193 9.12683C18.5193 11.8602 16.906 14.2668 15.726 16.0002V16.0002Z"
                  fill="#5F22C1" />
              </svg>
              <svg class="city__icon-mob" width="22" height="22" viewBox="0 0 22 22" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.27208 19.9947C9.82758 20.4531 10.4069 20.872 11 21.2808C11.5944 20.8774 12.1709 20.4483 12.7279 19.9947C13.6565 19.2323 14.5304 18.4055 15.3432 17.5206C17.2168 15.4719 19.25 12.5019 19.25 9.16797C19.25 8.08456 19.0366 7.01177 18.622 6.01083C18.2074 5.00989 17.5997 4.10042 16.8336 3.33434C16.0675 2.56825 15.1581 1.96056 14.1571 1.54596C13.1562 1.13136 12.0834 0.917969 11 0.917969C9.91659 0.917969 8.8438 1.13136 7.84286 1.54596C6.84193 1.96056 5.93245 2.56825 5.16637 3.33434C4.40029 4.10042 3.7926 5.00989 3.37799 6.01083C2.96339 7.01177 2.75 8.08456 2.75 9.16797C2.75 12.5019 4.78317 15.471 6.65683 17.5206C7.46957 18.4058 8.34347 19.232 9.27208 19.9947ZM11 12.1471C10.2099 12.1471 9.45211 11.8333 8.89341 11.2746C8.33471 10.7159 8.02083 9.95809 8.02083 9.16797C8.02083 8.37784 8.33471 7.62008 8.89341 7.06138C9.45211 6.50268 10.2099 6.1888 11 6.1888C11.7901 6.1888 12.5479 6.50268 13.1066 7.06138C13.6653 7.62008 13.9792 8.37784 13.9792 9.16797C13.9792 9.95809 13.6653 10.7159 13.1066 11.2746C12.5479 11.8333 11.7901 12.1471 11 12.1471Z"
                  fill="#EBDFFF" />
              </svg>
              {{ local.city }}
            </div>
          </ul>
          <div class="mobile__btns">
            <router-link class="mobBtn" :to="'/login'">Войти</router-link>
            <router-link class="mobBtn" :to="'/login'">Регистрация</router-link>
          </div>
          <div class="mobile__socialsWrap">
            <div class="headMob">Социальные сети</div>
            <div class="mobile_socials">
              <a href="#" class="social_linkMob">
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M0.658203 2.43231C0.658203 2.06627 0.926834 1.76953 1.25821 1.76953H12.0876C12.795 1.76953 13.3939 1.85141 13.8934 2.00755C13.9005 2.00978 13.9076 2.01215 13.9146 2.01466C14.4284 2.19821 14.8649 2.47825 15.2544 2.8726C15.2628 2.88114 15.271 2.88993 15.279 2.89898C15.6453 3.31483 15.9143 3.79037 16.0713 4.3432C16.2215 4.87206 16.2973 5.52404 16.2973 6.30249V7.27003C16.2973 8.55847 16.0954 9.66431 15.5804 10.4173L15.5804 10.4174C15.2326 10.9258 14.754 11.2836 14.1789 11.5164L16.5357 14.9378C16.6738 15.1382 16.697 15.4078 16.5958 15.6335C16.4945 15.8591 16.2862 16.0019 16.0582 16.0019H12.6832C12.4864 16.0019 12.3022 15.8953 12.1901 15.7167L9.73383 11.8029H4.87233V15.3391C4.87233 15.7052 4.6037 16.0019 4.27232 16.0019H1.25821C0.926834 16.0019 0.658203 15.7052 0.658203 15.3391V2.43231ZM1.85821 3.09509V14.6764H3.67232V11.1401C3.67232 10.7741 3.94095 10.4773 4.27232 10.4773H10.048C10.2447 10.4773 10.429 10.5839 10.5411 10.7625L12.9973 14.6764H14.8477L12.6749 11.5221C12.5468 11.3362 12.5168 11.0896 12.5959 10.873C12.6749 10.6563 12.8514 10.5017 13.0603 10.4658C13.869 10.3272 14.3511 10.0157 14.6229 9.61828C14.902 9.21032 15.0973 8.45839 15.0973 7.27003V6.30249C15.0973 5.61023 15.0289 5.10125 14.9263 4.73999C14.8321 4.40816 14.6715 4.11379 14.4309 3.83701C14.1766 3.58284 13.898 3.40349 13.5559 3.27968C13.1902 3.16689 12.7094 3.09509 12.0876 3.09509H1.85821ZM3.67232 5.27684C3.67232 4.9108 3.94095 4.61406 4.27232 4.61406H11.6003C11.8384 4.61406 12.0621 4.63593 12.2609 4.68668C12.4528 4.73565 12.6637 4.82208 12.8368 4.98446C13.1704 5.29732 13.2832 5.77896 13.2832 6.24438V7.32803C13.2832 7.80574 13.1736 8.29134 12.8368 8.60717C12.6535 8.7791 12.4311 8.85787 12.2438 8.89934C12.0528 8.94161 11.8394 8.95747 11.6169 8.95821C11.6113 8.95838 11.6058 8.95846 11.6003 8.95846H4.27232C3.94095 8.95846 3.67232 8.66172 3.67232 8.29568V5.27684ZM11.5846 7.6329C11.5898 7.63276 11.595 7.63268 11.6003 7.63268C11.7869 7.63268 11.9195 7.61921 12.008 7.59962C12.0275 7.59531 12.0428 7.59114 12.0545 7.58752C12.0673 7.54594 12.0832 7.46442 12.0832 7.32803V6.24438C12.0832 6.11792 12.0674 6.04138 12.0549 6.00265C12.0543 6.00094 12.0538 5.99933 12.0533 5.99782C12.0397 5.99249 12.0194 5.98553 11.9908 5.97821C11.9054 5.95641 11.7771 5.93962 11.6003 5.93962H4.87233V7.6329H11.5846ZM12.0449 5.97741C12.0447 5.97714 12.0446 5.977 12.0446 5.97699C12.0446 5.97698 12.0447 5.97712 12.0449 5.97741ZM12.0437 7.61593C12.0437 7.61593 12.0437 7.6158 12.0439 7.61555C12.0438 7.61581 12.0437 7.61593 12.0437 7.61593Z"
                    fill="white" />
                  <path
                    d="M15.4511 2.20926C16.0031 2.20926 16.4509 1.71472 16.4509 1.10463C16.4509 0.494542 16.0031 0 15.4511 0C14.8987 0 14.4509 0.494542 14.4509 1.10463C14.4509 1.71472 14.8987 2.20926 15.4511 2.20926Z"
                    fill="white" />
                </svg>
              </a>
              <a href="#" class="social_linkMob">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="13" viewBox="0 0 22 13" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M21.1972 1.05411C21.3451 0.590982 21.1972 0.25 20.4892 0.25H18.1513C17.5564 0.25 17.2821 0.54433 17.1334 0.869196C17.1334 0.869196 15.9444 3.58009 14.2603 5.34098C13.7152 5.85161 13.4676 6.01362 13.1702 6.01362C13.0215 6.01362 12.7979 5.85161 12.7979 5.38763V1.05411C12.7979 0.497679 12.634 0.25 12.1389 0.25H8.46244C8.09106 0.25 7.86751 0.507857 7.86751 0.752991C7.86751 1.27973 8.71003 1.40187 8.79642 2.88455V6.10607C8.79642 6.81263 8.66015 6.94071 8.36269 6.94071C7.57005 6.94071 5.64189 4.2171 4.49746 1.10076C4.2757 0.494286 4.05127 0.25 3.45367 0.25H1.11405C0.446091 0.25 0.3125 0.54433 0.3125 0.869196C0.3125 1.44768 1.10514 4.32143 4.00406 8.12228C5.93668 10.7178 8.65748 12.125 11.136 12.125C12.6225 12.125 12.8059 11.8129 12.8059 11.2742V9.31232C12.8059 8.68719 12.9466 8.5625 13.4178 8.5625C13.7651 8.5625 14.3591 8.72536 15.7467 9.97647C17.332 11.46 17.5929 12.125 18.4853 12.125H20.8232C21.4911 12.125 21.826 11.8129 21.6336 11.1954C21.4217 10.5812 20.6646 9.68978 19.6609 8.63205C19.1159 8.02982 18.2983 7.38094 18.0498 7.05607C17.7034 6.6396 17.8022 6.45384 18.0498 6.08317C18.0498 6.08317 20.8998 2.32897 21.1963 1.05411H21.1972Z"
                    fill="white" />
                </svg>
              </a>
              <a href="#" class="social_linkMob">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="16" viewBox="0 0 19 16" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M16.2799 0.972489C16.4989 0.886168 16.7386 0.856396 16.9741 0.886272C17.2096 0.916149 17.4322 1.00458 17.6188 1.14236C17.8054 1.28015 17.9491 1.46225 18.035 1.6697C18.121 1.87716 18.1459 2.1024 18.1074 2.32197L16.0974 13.7394C15.9024 14.8407 14.612 15.4723 13.5334 14.9237C12.6312 14.4648 11.2912 13.7577 10.0859 13.0199C9.48329 12.6505 7.63724 11.4679 7.86412 10.6263C8.05909 9.90676 11.161 7.20283 12.9335 5.59524C13.6292 4.96366 13.3119 4.59931 12.4903 5.18027C10.4493 6.6227 7.17462 8.81623 6.09162 9.4337C5.13625 9.97814 4.63818 10.0711 4.04262 9.97814C2.95608 9.80883 1.94841 9.54657 1.12598 9.22705C0.0146214 8.79548 0.0686825 7.36467 1.12509 6.94804L16.2799 0.972489Z"
                    fill="white" />
                </svg>
              </a>
            </div>
          </div>
        </nav>
        <div class="header__auth">
          <div class="search_link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5C18 12.2105 17.4274 13.7873 16.4633 15.0491L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3166 21.0976 19.6834 21.0976 19.2929 20.7071L15.0491 16.4633C13.7873 17.4274 12.2105 18 10.5 18ZM10.5 16C13.5376 16 16 13.5376 16 10.5C16 7.46243 13.5376 5 10.5 5C7.46243 5 5 7.46243 5 10.5C5 13.5376 7.46243 16 10.5 16Z"
                fill="#5F22C1" />
            </svg>
          </div>
          <div @click="openAccount" class="auth_link">
            <img v-if="avatar" :src="apiDomain + 'web/uploads/' + avatar" class="avatar" alt="" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M4.75746 12.0299C5.29326 11.8959 5.83619 12.2217 5.97014 12.7575C6.10409 13.2933 5.77833 13.8362 5.24254 13.9701C2.98142 14.5354 2 15.5168 2 17V19C2 19.5523 2.44772 20 3 20H19C19.5523 20 20 19.5523 20 19V17C20 15.5168 19.0186 14.5354 16.7575 13.9701C16.2217 13.8362 15.8959 13.2933 16.0299 12.7575C16.1638 12.2217 16.7067 11.8959 17.2425 12.0299C20.3148 12.7979 22 14.4832 22 17V19C22 20.6569 20.6569 22 19 22H3C1.34315 22 0 20.6569 0 19V17C0 14.4832 1.68525 12.7979 4.75746 12.0299ZM10.2909 2.05826C8.66619 2.38319 7.61254 3.96367 7.93747 5.58835L8.39223 7.86214C8.64085 9.10522 9.73231 10 11 10C12.2677 10 13.3592 9.10522 13.6078 7.86214L14.0625 5.58835C14.1013 5.39463 14.1208 5.19756 14.1208 5C14.1208 3.34315 12.7776 2 11.1208 2H10.8792C10.6817 2 10.4846 2.01951 10.2909 2.05826ZM11.1208 0C13.8822 0 16.1208 2.23858 16.1208 5C16.1208 5.32926 16.0883 5.65771 16.0237 5.98058L15.5689 8.25437C15.1333 10.4323 13.2211 12 11 12C8.77895 12 6.86666 10.4323 6.43107 8.25437L5.97631 5.98058C5.43475 3.27278 7.19084 0.638656 9.89863 0.0970966C10.2215 0.0325234 10.55 0 10.8792 0H11.1208Z"
                fill="#5F22C1" />
            </svg>
          </div>
          <div @click="openBurger" class="burger_link">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path class="path1" fill-rule="evenodd" clip-rule="evenodd"
                d="M6 3C4.34315 3 3 4.34315 3 6V8C3 9.65685 4.34315 11 6 11H18C19.6569 11 21 9.65685 21 8V6C21 4.34315 19.6569 3 18 3H6ZM5 6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V8C19 8.55228 18.5523 9 18 9H6C5.44772 9 5 8.55228 5 8V6Z"
                fill="#5F22C1" />
              <path class="path2" fill-rule="evenodd" clip-rule="evenodd"
                d="M6 13C4.34315 13 3 14.3431 3 16V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V16C21 14.3431 19.6569 13 18 13H6ZM5 16C5 15.4477 5.44772 15 6 15H18C18.5523 15 19 15.4477 19 16V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V16Z"
                fill="#5F22C1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
  <popap-city :local="local" :step="step" @closePopup="closePopup" v-if="popapCityes"></popap-city>
</template>
<style scoped>
.auth_link {}

.none {
  display: none !important;
}

.header__prev {
  display: none;
  padding: 11px 4px;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 18px;
  line-height: 120%;
  font-family: 'Onest';
  position: absolute;
  top: 22px;
  left: 20px;
}

.header__head {
  font-size: 28px;
  font-family: 'Onest';
  line-height: 120%;
  color: #fff;
  display: none;
}

.header__head.active {
  display: block;
  margin-bottom: 12px;
}

.header__prev.active {
  display: flex;
}

.header {
  background: hsla(0, 0%, 100%, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 21px 0;
  backdrop-filter: blur(17px);
}

.header__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header__logo {
  display: flex;
  align-items: center;
}

.header__nav {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.header__list {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header__linkSub {
  position: relative;
}

.sublinksWrapper {
  padding: 15px 0;
  overflow-y: auto;
  max-height: 100%;
}

.sublinks {
  position: absolute;
  max-height: 318px;
  top: calc(100% + 8px);
  left: 0;
  background: #ffffff;
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 5px 2px 5px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: max-content;
  opacity: 0;
  visibility: hidden;

  transition: 0.3s;
}

.sublinksWrapper::-webkit-scrollbar {
  width: 2px;
  border-radius: 5px;
  background-color: transparent;
  background: transparent;
}

.sublinksWrapper::-webkit-scrollbar-thumb {
  background: rgba(25, 25, 25, 0.45);
  width: 2px;
  border-radius: 5px;
  border: none;
}

.sublinksWrapper::-webkit-scrollbar-track {
  background-color: transparent;
  background: transparent;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}

.header__linkSub.active .sublinks {
  opacity: 1;
  visibility: visible;
}

.header__linkSub.active svg {
  transform: rotate(180deg);
}

.header__linkSub svg {
  transition: 0.3s all;
}

.header__link,
.sublink,
.header__city {
  color: #383838;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s all;
}

.header__city {
  cursor: pointer;
  text-decoration: underline;
  gap: 5px;
}

.city__icon-mob {
  display: none;
}

.sublink {
  width: 391px;
  padding: 15px 20px;
  border-bottom: 1px solid #e3e3e3;
}

@keyframes spinAndChangeColor {
  0% {
    transform: perspective(1000px) rotateY(0deg);
    fill: #000000;
  }

  12.5% {
    transform: perspective(1000px) rotateY(180deg);
    fill: #5f22c1;
  }

  25% {
    transform: perspective(1000px) rotateY(360deg);
    fill: #439563;
  }

  37.5% {
    transform: perspective(1000px) rotateY(540deg);
    fill: #ffc32a;
  }

  50% {
    transform: perspective(1000px) rotateY(720deg);
    fill: #5f22c1;
  }

  62.5% {
    transform: perspective(1000px) rotateY(900deg);
    fill: #2971eb;
  }

  75% {
    transform: perspective(1000px) rotateY(1080deg);
    fill: #ef8933;
  }

  87.5% {
    transform: perspective(1000px) rotateY(1260deg);
    fill: #f092f9;
  }

  100% {
    transform: perspective(1000px) rotateY(1440deg);
    fill: #000000;
    /* Возврат к дефолтному цвету */
  }
}

.path_animated {
  animation: spinAndChangeColor 8s ease-in-out 3;
  animation-delay: 4s;
  transform-origin: 17% 15%;
}

.header__auth {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__auth div {
  border-radius: 90px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 44px;
  height: 44px;
  cursor: pointer;
}

.header__auth div:has(.avatar) {
  padding: 2px;
}

.header__auth .burger_link {
  display: none;
  position: relative;
  z-index: 100;
}

.path1,
.path2 {
  transform-origin: center;
  transition: transform 0.4s ease;
}

/* Анимация активации */
.icon.active .path1 {
  transform: translateX(-3px);
  /* Сдвиг влево */
  transition: transform 0.2s ease;
}

.icon.active .path2 {
  transform: translateX(3px);
  /* Сдвиг вправо */
  transition: transform 0.2s ease;
}

.icon.active.rotate .path1,
.icon.active.rotate .path2 {
  transform: translateX(0px) rotate(-90deg);
}

/* Поворот через задержку */

/* Возврат в исходное состояние */
.icon .path1,
.icon .path2 {
  transform: translateX(0) rotate(0deg);
  /* Исходное положение полосок */
  transition: transform 0.4s ease;
}

.mobile__socialsWrap,
.mobile__btns {
  display: none;
}

.mobBtn {
  color: #333;
  text-align: center;
  font-family: "Onest";
  font-size: 14px;
  font-weight: 600;
  padding: 15px 30px;
  background: #fff;
  max-width: 136px;
  border-radius: 50px;
  width: 100%;
  border: 1px solid #fff;
}

.mobBtn:last-child {
  background: transparent;
  color: #fff;
  max-width: 191px;
  width: 100%;
}

.mobile__socialsWrap {
  gap: 10px;
  margin-top: 36px;
  align-items: center;
  justify-content: space-between;
}

.mobile_socials {
  display: flex;
  gap: 8px;
}

.headMob {
  color: #ac7bfc;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
  text-transform: uppercase;
  max-width: 136px;
}

.social_linkMob {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #7e51c5;
}

@media screen and (max-width: 1260px) {
  .header__linkSub.active .sublinks {
    display: block;
  }

  .mobile__socialsWrap,
  .mobile__btns {
    display: flex;
    width: 100%;
  }

  .mobile__btns {
    gap: 8px;
    margin-top: 32px;
  }

  .header__auth .burger_link {
    display: flex;
  }

  .sublinks {
    position: static;
    max-height: none;
    top: auto;
    left: auto;
    box-shadow: none;
    border-radius: 0px;
    padding: 0;
    display: none;
    opacity: 1;
    visibility: visible;
    width: 100%;
    background: transparent;
  }

  .sublinksWrapper {
    display: flex;
    gap: 8px;
    padding: 0;
    overflow: visible;
    flex-wrap: wrap;
  }

  .sublink {
    border: 1px solid #702AE0;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    line-height: 120%;
    color: #fff;
    position: relative;
    background: #7132D5;
    border-radius: 50px;
    width: max-content;
  }

  .header__nav {
    position: absolute;
    top: 0;
    right: -100%;
    width: 50vw;
    height: 100vh;
    min-width: 325px;
    background: #5f22c1;
    backdrop-filter: blur(17px);
    z-index: 99;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    padding-top: 82px;
    transition: 0.3s all;
    text-align: left;
  }

  .header__city {
    position: absolute;
    top: 33px;
    left: 20px;
  }

  .city__icon {
    display: none;
  }

  .city__icon-mob {
    display: block;
  }

  .header__nav.active {
    right: 0;
  }

  .header__list {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    width: 100%;
  }

  .header__list li {
    width: 100%;
  }

  .header__list .sublinksWrapper li {
    width: max-content;
  }

  .header__link {
    padding: 16px 17px;
    background: #6927D2;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 15px;
  }

  .header__link:hover {
    color: #fff;
  }

  .header__link.famsublink::after {
    display: none;
  }

  .header__link.famsublink svg {
    width: 16px;
    height: 16px;
  }

  .header__link.famsublink path {
    fill: #EBDFFF;
  }

  .header__link::after,
  .sublink::after {
    width: 22px;
    height: 22px;
    content: '';
    background: url('data:image/svg+xml,<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.43787 10.3107L16.2144 10.3108L12.5767 6.67188L13.549 5.6996L18.8476 10.9982L13.549 16.2969L12.5767 15.3246L16.2144 11.6858L3.43787 11.6857L3.43787 10.3107Z" fill="%23EBDFFF"/></svg>');
    background-size: cover;
    background-repeat: no-repeat;
  }

  .header__link,
  .header__city {
    font-size: 18px;
    color: #f8f8f8;
  }

  .header__logo {
    width: 120px;
  }
}

@media screen and (max-width: 650px) {
  .header__nav {
    width: 100vw;
    height: 100vh;
  }
}
</style>