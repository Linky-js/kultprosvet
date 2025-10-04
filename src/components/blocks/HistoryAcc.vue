<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useStore } from "vuex";

const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;
const historyArray = ref([]);

const getHistory = () => {
  const authGet = `&auth=${user.username}:${user.auth_key}&user_id=${user.user_id}`;
  axios.get(apiUrl + "api-history/get" + authGet).then((response) => {
    console.log(response.data.history);
    const {
      data: { history },
    } = response;
    const groupedByDate = {};

    // Группируем уведомления по дате
    history.forEach((history) => {
      const date = new Date(history.date_add * 1000).toLocaleDateString();
      console.log(date);

      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }

      groupedByDate[date].push(history);
    });
    historyArray.value = Object.entries(groupedByDate).map(
      ([date, history]) => ({ date, history })
    );
    console.log(historyArray.value);
  });
};
onMounted(() => {
  getHistory();
});
</script>
<template>
  <div class="history__content">
    <div class="history__head">История просмотров</div>
    <div class="history__body">
      <div
        v-for="dayItem in historyArray"
        :key="dayItem.id"
        class="history__items"
      >
        <div class="history__list__item__date">{{ dayItem.date }}</div>
        <router-link
          v-for="item in dayItem.history"
          :key="item.id"
          class="history__list__item"
          :to="'/' + (item.item === 'news' ? 'post' : item.item) + '/' + item.item_id"
        >
          <div class="history__list__item__icon">
            <svg
              v-if="item.item === 'news'"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M2.08203 5.75C2.08203 4.23122 3.31325 3 4.83203 3H15.832C17.3508 3 18.582 4.23122 18.582 5.75V21.3333C18.582 22.8521 17.3508 24.0833 15.832 24.0833H4.83203C3.31325 24.0833 2.08203 22.8521 2.08203 21.3333V5.75ZM5.7487 19.5C5.7487 18.9937 6.1591 18.5833 6.66536 18.5833H10.332C10.8383 18.5833 11.2487 18.9937 11.2487 19.5C11.2487 20.0063 10.8383 20.4167 10.332 20.4167H6.66536C6.1591 20.4167 5.7487 20.0063 5.7487 19.5ZM6.66536 14.9167C6.1591 14.9167 5.7487 15.3271 5.7487 15.8333C5.7487 16.3396 6.1591 16.75 6.66536 16.75H13.9987C14.505 16.75 14.9154 16.3396 14.9154 15.8333C14.9154 15.3271 14.505 14.9167 13.9987 14.9167H6.66536ZM9.41536 7.58333C9.41536 7.07707 9.82577 6.66667 10.332 6.66667H13.9987C14.505 6.66667 14.9154 7.07707 14.9154 7.58333C14.9154 8.08959 14.505 8.5 13.9987 8.5H10.332C9.82577 8.5 9.41536 8.08959 9.41536 7.58333Z"
                fill="white"
              />
              <path
                d="M19.7232 24.0743C21.137 23.9601 22.2487 22.7765 22.2487 21.3333V8.49998C22.2487 7.30258 21.4834 6.28393 20.4153 5.90643V22.25C20.4153 22.95 20.1538 23.5889 19.7232 24.0743Z"
                fill="white"
              />
              <path
                d="M23.3898 24.0742C24.8036 23.96 25.9153 22.7765 25.9153 21.3333V11.2499C25.9153 10.0526 25.1501 9.03395 24.082 8.65643V22.25C24.082 22.9499 23.8205 23.5888 23.3898 24.0742Z"
                fill="white"
              />
            </svg>
            <svg
              v-if="item.item === 'book'"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="white"
              class="bi bi-book-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"
              />
            </svg>
            <svg
              v-if="item.item === 'podcast'"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="white"
              class="bi bi-file-earmark-music-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M11 6.64v1.75l-2 .5v3.61c0 .495-.301.883-.662 1.123C7.974 13.866 7.499 14 7 14s-.974-.134-1.338-.377C5.302 13.383 5 12.995 5 12.5s.301-.883.662-1.123C6.026 11.134 6.501 11 7 11c.356 0 .7.068 1 .196V6.89a1 1 0 0 1 .757-.97l1-.25A1 1 0 0 1 11 6.64"
              />
            </svg>
            <svg
              v-if="item.item === 'test'"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="white"
              class="bi bi-123"
              viewBox="0 0 16 16"
            >
              <path
                d="M2.873 11.297V4.142H1.699L0 5.379v1.137l1.64-1.18h.06v5.961zm3.213-5.09v-.063c0-.618.44-1.169 1.196-1.169.676 0 1.174.44 1.174 1.106 0 .624-.42 1.101-.807 1.526L4.99 10.553v.744h4.78v-.99H6.643v-.069L8.41 8.252c.65-.724 1.237-1.332 1.237-2.27C9.646 4.849 8.723 4 7.308 4c-1.573 0-2.36 1.064-2.36 2.15v.057zm6.559 1.883h.786c.823 0 1.374.481 1.379 1.179.01.707-.55 1.216-1.421 1.21-.77-.005-1.326-.419-1.379-.953h-1.095c.042 1.053.938 1.918 2.464 1.918 1.478 0 2.642-.839 2.62-2.144-.02-1.143-.922-1.651-1.551-1.714v-.063c.535-.09 1.347-.66 1.326-1.678-.026-1.053-.933-1.855-2.359-1.845-1.5.005-2.317.88-2.348 1.898h1.116c.032-.498.498-.944 1.206-.944.703 0 1.206.435 1.206 1.07.005.64-.504 1.106-1.2 1.106h-.75z"
              />
            </svg>
          </div>
          <div class="history__list__item__text">
            <div
             
              class="history__list__item__title"
            >
              {{ item.item_data.title || item.item_data.name }}
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
<style scoped>
.history__content {
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.history__head {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}
.history__body {
  display: flex;
  flex-direction: column;
  gap: 45px;
}
.history__items {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.history__list__item__date {
  color: #676767;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
  letter-spacing: 0.16px;
}
.history__list__item {
  display: flex;
  gap: 20px;
  align-items: center;
  cursor: pointer;
}
.history__list__item__icon {
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8.25px;
  background: #bbb;
  border-radius: 10px;
}
.history__list__item__title {
  color: #333;
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 122.222% */
}
</style>