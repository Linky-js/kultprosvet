<script setup>
import { ref, onMounted, defineProps, defineEmits } from "vue";
import axios from "axios";
import { useStore } from 'vuex';

const alert = ref({});
const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["closePopup", "updateAlert"]);

const closePopup = () => {
  let popup = document.querySelector(".popup");
  popup.classList.remove("active");
  setTimeout(() => {
    emit("closePopup");
  }, 500);
};
const timestampToDate = (timestamp, format) => {
  const date = new Date(timestamp * 1000); // Умножаем на 1000, если timestamp в секундах
  if (format == "d.m.y") {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }
  if (format == "d.m.y, h:m") {
    const monthArray = [
      "янв",
      "фев",
      "мар",
      "апр",
      "мая",
      "июня",
      "июля",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ]
    const day = String(date.getDate()).padStart(2, "0");
    const month = monthArray[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${year} г., ${hours}:${minutes}`;
  }
};
const updateAlert = () => {
  let authGet = `&auth=${user.username}:${user.auth_key}`;
  let params = {
    id: alert.value.id,
    user_id: user.user_id,
    status: 2
  }
  axios
    .post(apiUrl + "api-notify/update" + authGet, params)
    .then((response) => {
      if (response.data.status) {
        emit("updateAlert");
      }
    })
}
onMounted(() => {
  alert.value = props.item;
  let popup = document.querySelector(".popup");
  setTimeout(() => {
    popup.classList.add("active");
    if (alert.value.status == 1) {
      updateAlert();
    }
  }, 500);

  
});
</script>

<template>
  <div class="popup">
    <div class="popup__contents">
      <div class="popup__item">
        <div @click="closePopup" class="popup__btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071Z"
              fill="#333333"
            />
          </svg>
        </div>
        <div class="popup__head">
          {{ alert.title }}
        </div>
        <div class="popup_date">
          {{ timestampToDate(1733754902, "d.m.y, h:m") }}
        </div>
        <div class="popup__text">
          {{ alert?.text }}
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: rgba(0, 0, 0, 0);
  z-index: 9999;
  overflow: hidden;
  transition: background-color 0.3s linear;
}
.popup.active {
  background-color: rgba(0, 0, 0, 0.5);
}
.popup__contents {
  background-color: white;
  padding: 46px 23px;
  width: 41.5%;
  max-width: 583px;
  position: relative;
  height: 100%;
  transform: translateX(100%);
  transition: transform 0.5s ease-in-out;
}
.active .popup__contents {
  transform: translateX(0);
}
.popup__item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 45px;
}
.popup__btn {
  align-self: flex-end;
  cursor: pointer;
  border-radius: 90px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}
.popup__head {
  color: #333;
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
}
.popup_date {
  color: #676767;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}
.popup__text {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>