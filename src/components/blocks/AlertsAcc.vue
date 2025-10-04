<script>
import axios from "axios";
import AlertPopup from "../elements/AlertPopup.vue";
export default {
  name: "AlertsAcc",
  components: {
    AlertPopup,
  },

  data() {
    return {
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      alert: {
        title:
          "Новые знания теперь будут отображаться в специальном разделе, который называется «New topics»",
        date: 1733754657,
        text: "Наша мультиформатная образовательная платформа для школьников и подростков позволяет создавать множество разных разделов. Один из таких разделов «New topics». Мы расширили функционал и сделали самое лучшее для этого.",
      },
      alerts: [],
      alertsAll: [],
      status1: [],
      status2: [],
      alertShow: false,
    };
  },
  methods: {
    getAlerts() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;

      axios
        .get(
          this.apiUrl +
            "api-notify/get-list" +
            authGet +
            "&user_id=" +
            this.user.user_id
        )
        .then((response) => {
          console.log(response);

          const {
            data: { notifies },
          } = response;

          // Создаем объект для группировки уведомлений по дате
          const groupedByDate = {};

          // Группируем уведомления по дате
          notifies.forEach((notify) => {
            const date = new Date(
              notify.date_publication * 1000
            ).toLocaleDateString();
            console.log(date);

            if (!groupedByDate[date]) {
              groupedByDate[date] = [];
            }

            groupedByDate[date].push(notify);
          });

          this.alertsAll = Object.entries(groupedByDate).map(
            ([date, notifies]) => ({ date, notifies })
          );

          this.status1 = [];
          this.status2 = [];
          console.log(this.alertsAll);

          for (const alertGroup of this.alertsAll) {
            const status1Alerts = alertGroup.notifies.filter(
              (alert) => alert.status === 1
            );
            const status2Alerts = alertGroup.notifies.filter(
              (alert) => alert.status !== 1
            ); 

            if (status1Alerts.length > 0) {
              this.status1.push({ ...alertGroup, notifies: status1Alerts });
            }

            if (status2Alerts.length > 0) {
              this.status2.push({ ...alertGroup, notifies: status2Alerts });
            }
          }

          this.showAlerts("all");
        })
        .catch((error) => {
          console.error("Ошибка при получении уведомлений:", error);
        });
    },
    alertGoToShow(item) {
      this.alert = item;
      console.log(item);

      this.alertShow = true;
    },
    closeAlertShow() {
      this.alertShow = false;
      this.alert = {};
    },
    showAlerts(block) {
      let elements = document.querySelectorAll(".alert__tabs__item");
      elements.forEach((item) => {
        item.classList.remove("active");
      });
      if (block == "all") {
        this.alerts = this.alertsAll;
        let el = this.$refs.all;
        el.classList.add("active");
      } else if (block == "unread") {
        this.alerts = this.status1;
        let el = this.$refs.unread;
        el.classList.add("active");
      } else if (block == "read") {
        this.alerts = this.status2;
        let el = this.$refs.read;
        el.classList.add("active");
      }
    },
    timestampToDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp * 1000); // Умножаем на 1000, если timestamp в секундах

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
      ];
      const day = String(date.getDate()).padStart(2, "0");
      const month = monthArray[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${day} ${month} ${year} г., ${hours}:${minutes}`;
    },
  },
  mounted() {
    this.getAlerts();
  },
};
</script>
<template>
  <div class="alert__content">
    <div class="alert__head">Уведомления</div>
    <div class="alert__tabs">
      <div @click="showAlerts('all')" ref="all" class="alert__tabs__item">
        <div class="alert__tabs__item__name">Все</div>
        <div class="alert__tabs__item__count">{{ alertsAll.length }}</div>
      </div>
      <div @click="showAlerts('unread')" ref="unread" class="alert__tabs__item">
        <div class="alert__tabs__item__name">Непрочитанные</div>
        <div class="alert__tabs__item__count">{{ status1.length }}</div>
      </div>
      <div @click="showAlerts('read')" ref="read" class="alert__tabs__item">
        <div class="alert__tabs__item__name">Прочитанные</div>
        <div class="alert__tabs__item__count">{{ status2.length }}</div>
      </div>
    </div>
    <div class="alert__body">
      <div v-for="dayItem in alerts" :key="dayItem.id" class="alert__items">
        <div class="alert__list__item__date">{{ dayItem.date }}</div>
        <div
          v-for="item in dayItem.notifies"
          :key="item.id"
          class="alert__list__item"
        >
          <div class="alert__list__item__icon">
            <svg
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
          </div>
          <div class="alert__list__item__text">
            <div @click="alertGoToShow(item)" class="alert__list__item__title">
              {{ item.title }}
            </div>
            <div class="alert__list__item__time">
              {{ timestampToDate(item.date__add) }}
            </div>
          </div>
          <svg
            v-if="item.status == 1"
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="18"
            viewBox="0 0 8 18"
            fill="none"
          >
            <rect y="5" width="8" height="8" rx="4" fill="#5F22C1" />
          </svg>
        </div>
      </div>
    </div>
  </div>
  <AlertPopup
    v-if="alertShow"
    @closePopup="closeAlertShow"
    @updateAlert="getAlerts"
    :item="alert"
  />
</template>
<style scoped>
.alert__content {
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.alert__head {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}
.alert__tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.alert__tabs__item {
  border-radius: 90px;
  background: rgba(25, 25, 25, 0.05);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  transition: all 0.3s;
}
.alert__tabs__item.active {
  background: #5f22c1;
}
.active .alert__tabs__item__name {
  color: #fff;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px; /* 128.571% */
  letter-spacing: 0.14px;
}
.alert__tabs__item__name {
  color: #333;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px; /* 128.571% */
  letter-spacing: 0.14px;
}
.alert__tabs__item__count {
  color: #fff;
  text-align: center;
  font-family: Onest;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 15px; /* 125% */
  letter-spacing: 0.12px;
  padding: 1.5px 6px;
  background: #5f22c1;
  border-radius: 10px;
}
.alert__body {
  display: flex;
  flex-direction: column;
  gap: 45px;
}
.alert__items {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.alert__list__item__date {
  color: #676767;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
  letter-spacing: 0.16px;
}
.alert__list__item {
  display: flex;
  gap: 20px;
  cursor: pointer;
}
.alert__list__item__icon {
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8.25px;
  background: #bbb;
  border-radius: 10px;
}
.alert__list__item__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.alert__list__item__time {
  color: #676767;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 128.571% */
}
</style>