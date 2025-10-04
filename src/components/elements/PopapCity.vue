<script>
import gsap from "gsap";
import axios from "axios";
import { useCookies } from "vue3-cookies";
export default {
  name: "PopapCity",
  props: {
    local: {
      type: Object,
      required: true,
    },
    step: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  data() {
    return {
      cityes: [],
      resultCityes: [],
      apiUrl: this.$store.getters.getApiUrl,
      user: this.$store.getters.getUser,
      stepUp: 1,
    };
  },
  methods: {
    getCityes() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-list/get-cities" + authGet)
        .then((response) => {
          this.cityes = response.data.cities;
        });
    },
    closePopup() {
      this.$emit("closePopup");
    },
    resultSearch() {
      let input = document.getElementById("searchInputCity").value;
      

      // Проверяем длину введенного текста
      if (input.length < 3) {
        return;
      }

      // Очищаем массив результатов перед новым поиском
      this.resultCityes = [];

      // Проходим по массиву городов и ищем совпадения
      for (let c of this.cityes) {
        if (c.city.toLowerCase().includes(input.toLowerCase())) {
          this.resultCityes.push(c);
        }
      }

    },
    selectCity(c) {
      this.cookies.set("localUser", c, { expires: 7 });
      this.$store.commit("setLocal", c);
      this.closePopup();
    },
  },
  mounted() {
    this.stepUp = this.step;
    this.getCityes();
    gsap.set(".modal", { opacity: 0, duration: 0.5 });
    gsap.to(".modal", { opacity: 1, duration: 0.5 });
  },
};
</script>
<template>
  <div class="modal">
    <div class="modal__content">
      <div @click="closePopup" class="close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071Z"
            fill="white"
          />
        </svg>
      </div>
      <div class="head-h2">Выберите город</div>
      <div v-if="stepUp == 1" class="step1">
        <div class="text">
          Ваш город {{ local.city }} ?
          <div class="btns">
            <a @click="selectCity(local)" class="get__addNews">Все верно</a>
            <a @click="this.stepUp = 2" class="btn-red">Выбрать другой</a>
          </div>
        </div>
      </div>
      <div v-if="stepUp == 2" class="step2">
        <div class="label">Выберите город из списка, вводя его название</div>
        <div class="form-group">
          <input
            @input="resultSearch"
            id="searchInputCity"
            class="form__input"
            type="text"
            placeholder="Введите город"
          />
          <div class="list">
            <a v-for="item in resultCityes" :key="item.id" @click="selectCity(item)" class="list__item">
              {{ item.city }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.get__addNews {
  color: #5f22c1;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 112.5% */
  background: #f0f0f0;
  padding: 15px 20px;
  width: 212px;
  margin: 0 auto;
  margin-top: 23px;
  transition: all 0.3s;
}
.get__addNews:hover {
  transform: scale(1.05);
}
.close {
  position: absolute;
  top: 0px;
  right: -60px;
  cursor: pointer;
  width: 44px;
  height: 44px;
  padding: 10px;
  border-radius: 50%;
  background: rgba(248, 248, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal__content {
  width: 100%;
  max-width: 800px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 20px;
  min-height: 250px;
}
.btns {
  display: flex;
  align-items: end;
  gap: 20px;
}
.btn-red {
  height: max-content;
}
.step2 {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}
.label {
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s all;
  text-align: left;
}
.form__input {
  background: #e7e7e7;
  padding: 13px 20px;
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 128.571% */
  width: 100%;
  outline: none;
  outline: none;
  border: 1px solid #eaeaea;
}
.form__input:focus {
  outline: none;
}
.form__input:hover {
  outline: none;
}
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
  min-height: 250px;
}
.list__item {
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  text-align: left;
}
</style>