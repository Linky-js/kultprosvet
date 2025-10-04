<script>
import BtnRed from "../ui/BtnRed.vue";
import axios from "axios";
import { MaskInput } from "vue-3-mask";
export default {
  name: "ProfileAcc",
  components: {
    BtnRed,
    MaskInput,
  },
  props: {
    userP: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isDisabled: true,
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      maxFileSize: 5 * 1024 * 1024,
      srcAvatar: null,
      userReset: null,
      school: {
        schoolOld: false,
        flag: true,
        items: [],
        item: null,
        name: "",
        id: null,
      },
    };
  },
  methods: {
    async editUser() {
      if (this.isDisabled) {
        this.isDisabled = false;
        return;
      }
      console.log(" this.school.name.trim()", this.school.name.trim());
      console.log(
        " this.userReset.school_name.trim()",
        this.userReset?.school_name
      );
      let newId = null;
      if (this.userReset.school_name) {
        if (
          this.school.name.trim() != this.userReset.school_name.trim() &&
          this.userReset.school_id
        ) {
          newId = await this.setSchool(this.school.name);
        }
      }

      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      let email = document.querySelector(".emailI").textContent;
      let tel = document.querySelector(".telI").textContent;
      let sex = document.querySelector(".sexI").textContent;
      let dr = document.querySelector(".drI").textContent;

      // Получаем полное имя из блока
      let fullName = document.querySelector(".nameI").textContent.trim();

      let nameParts = fullName.split(" ").filter((part) => part.length > 0);

      let f = "";
      let i = "";
      let o = "";
      let [part1, part2, part3] = nameParts;

      let isOtchestvo = (str) => /[в|вна|вич]$/.test(str);

      if (isOtchestvo(part3)) {
        f = part1;
        i = part2;
        o = part3;
      } else if (isOtchestvo(part2)) {
        f = part1;
        i = part3;
        o = part2;
      } else {
        f = part1;
        i = part2;
        o = part3;
      }
      let params = {
        id: this.userP.id,
        email: email,
        tel: tel,
        sex: sex,
        dr: dr,
        f: f,
        i: i,
        o: o,
        avatar: this.srcAvatar,
        school_id: this.school.id,
      };
      if (newId) {
        params.school_id = newId;
      }
      try {
        // Отправляем запрос с обновленными данными
        await axios.post(
          this.apiUrl + "api-user/update-user" + authGet,
          params,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        this.isDisabled = true;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async uploadPhoto(event) {
      let file = event.target.files[0];

      if (!file) {
        return;
      }

      let validFileTypes = ["image/jpeg", "image/png"];
      if (!validFileTypes.includes(file.type)) {
        alert("Можно загружать только файлы формата JPG или PNG.");
        return;
      }

      if (file.size > this.maxFileSize) {
        alert("Максимальный размер файла: 5 MB.");
        return;
      }
      let formData = new FormData();
      formData.append("UploadForm[file]", file);
      formData.append("folder", "users/avatar");
      formData.append("filenamePrefix", "avatar_");

      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;

      try {
        let response = await axios.post(
          this.apiUrl + "upload" + authGet,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.srcAvatar = response.data;
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при загрузке фото. Попробуйте еще раз.");
      }
    },
    applyDateMask(event) {
      const input = event.target.textContent;

      // Убираем все, кроме цифр
      const cleanedInput = input.replace(/\D/g, "");

      // Применяем маску
      let formattedInput = cleanedInput;
      if (cleanedInput.length > 2) {
        formattedInput = cleanedInput.slice(0, 2) + "." + cleanedInput.slice(2);
      }
      if (cleanedInput.length > 4) {
        formattedInput =
          formattedInput.slice(0, 5) + "." + cleanedInput.slice(4, 8);
      }

      // Ограничиваем длину ввода до 10 символов (DD.MM.YYYY)
      formattedInput = formattedInput.slice(0, 10);

      // Обновляем содержимое с форматированной датой
      event.target.textContent = formattedInput;
    },
    enforceDateMask(event) {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
      ];
      const isNumber = /^[0-9]$/.test(event.key);

      // Разрешаем только цифры и управляющие клавиши
      if (!isNumber && !allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
    },
    selectSexAdd(event) {
      if (!this.isDisabled) {
        let sex = event.target;
        sex.classList.add("active");
      }
    },
    selectSexRemove(event) {
      if (!this.isDisabled) {
        let sex = event.target;
        sex.classList.remove("active");
      }
    },
    goGender(event) {
      if (!this.isDisabled) {
        let item = event.target.textContent;
        document.querySelector(".sexI").textContent = item;
      }
    },
    getUser() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-user/get-user" + authGet)
        .then((response) => {
          console.log(response.data);

          this.userReset = response.data.userProfile;
          if (this.userReset.sex == 2) {
            this.userReset.sex = "Мужской";
          } else if (this.userReset.sex == 1) {
            this.userReset.sex = "Женский";
          }
          if (this.userReset.school_id) {
            this.getSchool(this.userReset.school_id);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    getSchool(id) {
      if (!id) {
        return;
      }
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-school/get" + authGet + "&id=" + id)
        .then((response) => {
          console.log("api-school/get", response.data);
          if (response.data.status && response.data.status != 'false') {
            this.school.schoolOld = true;
            this.school.name = response.data.school.name;
            this.userReset.school_name = response.data.school.name;
            this.school.id = response.data.school.id;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    async setSchool(name) {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      let params = {
        name: name,
      };
      try {
        let response = await axios.post(
          this.apiUrl + "api-school/set" + authGet,
          params,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log(response);
        return response.data.school.id;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    selectSchool(selectedSchool, id) {
      this.school.name = selectedSchool;
      this.school.id = id;
      this.school.items = [];
      console.log(this.school);
    },
    getSortSchool(event) {
      let inputValue = event.target.value;
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      if (inputValue.length > 1) {
        this.school.name = inputValue;
        axios
          .get(
            this.apiUrl + "api-school/autocomplete&str=" + inputValue + authGet
          )
          .then((response) => {
            console.log("response", response);

            this.school.items = response.data.schools;
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        this.school.name = inputValue;
        this.school.items = [];
        this.school.flag = true;
      }
    },
  },
  mounted() {
    this.getUser();
  },
  computed: {
    getImageSource() {
      const avatarPath = this.userReset?.avatar;

      if (
        avatarPath &&
        (avatarPath.startsWith("http") || avatarPath.startsWith("https"))
      ) {
        return avatarPath; // полный путь
      } else {
        // короткий путь
        return this.apiDomain + "web/uploads/" + (this.srcAvatar || avatarPath);
      }
    },
  },
};
</script>
<template>
  <div class="profile_info">
    <div class="profile__head">
      <div class="profile__head__image">
        <img :src="getImageSource" alt="" />
        <a v-if="!isDisabled" class="addImage">
          <input
            type="file"
            class="settings__file"
            accept=".jpg,.jpeg,.png"
            @change="uploadPhoto"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 17C9.79172 17 8 15.2083 8 13C8 10.7917 9.79172 9 12 9C14.2083 9 16 10.7917 16 13C16 15.2083 14.2083 17 12 17ZM14 13C14 14.1037 13.1037 15 12 15C10.8963 15 10 14.1037 10 13C10 11.8963 10.8963 11 12 11C13.1037 11 14 11.8963 14 13Z"
              fill="#5F22C1"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1 9.5V18C1 20.2091 2.79086 22 5 22H19C21.2091 22 23 20.2091 23 18V9.5C23 7.567 21.433 6 19.5 6H18.2361C17.8573 6 17.511 5.786 17.3416 5.44721L16.4472 3.65836C15.939 2.64201 14.9002 2 13.7639 2H10.2361C9.09975 2 8.06096 2.64201 7.55279 3.65836L6.65836 5.44721C6.48897 5.786 6.1427 6 5.76393 6H4.5C2.567 6 1 7.567 1 9.5ZM5 20C3.89543 20 3 19.1046 3 18V9.5C3 8.67157 3.67157 8 4.5 8H5.76393C6.90025 8 7.93904 7.35799 8.44721 6.34164L9.34164 4.55279C9.51103 4.214 9.8573 4 10.2361 4H13.7639C14.1427 4 14.489 4.214 14.6584 4.55279L15.5528 6.34164C16.061 7.35799 17.0998 8 18.2361 8H19.5C20.3284 8 21 8.67157 21 9.5V18C21 19.1046 20.1046 20 19 20H5Z"
              fill="#5F22C1"
            />
          </svg>
        </a>
      </div>
      <div class="basicUserInfo">
        <div
          :contenteditable="!isDisabled"
          class="profile__head__name nameI"
          :class="{ edit: !isDisabled }"
        >
          {{ userReset?.f }} {{ userReset?.i }} {{ userReset?.o }}
        </div>
        <div class="userBtns">
          <BtnRed class="balls"
            >Потратить баллы
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M11.0981 2.54365C11.536 1.91807 12.4625 1.91807 12.9004 2.54365L16.129 7.1559L21.6794 9.00605C22.4055 9.24807 22.6686 10.1391 22.1905 10.7368L18.5289 15.3138L18.9832 20.7659C19.0488 21.5529 18.2883 22.1505 17.5392 21.9008L11.9993 20.0542L6.45936 21.9008C5.71018 22.1505 4.94973 21.5529 5.01531 20.7659L5.46965 15.3138L1.80799 10.7368C1.32989 10.1391 1.59304 9.24807 2.31909 9.00605L7.86954 7.1559L11.0981 2.54365ZM11.9993 4.74388L9.33745 8.54647C9.20208 8.73986 9.00809 8.88457 8.78414 8.95922L4.17603 10.4953L7.25526 14.3443C7.43097 14.5639 7.51586 14.8425 7.4925 15.1228L7.12175 19.5718L11.6514 18.0619C11.8772 17.9867 12.1213 17.9867 12.3471 18.0619L16.8768 19.5718L16.506 15.1228C16.4827 14.8425 16.5676 14.5639 16.7433 14.3443L19.8225 10.4953L15.2144 8.95922C14.9904 8.88457 14.7965 8.73986 14.6611 8.54647L11.9993 4.74388Z"
                fill="white"
              />
            </svg>
          </BtnRed>
          <a @click="editUser()" class="btn-white"
            >{{ isDisabled ? "Редактировать" : "Сохранить" }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M18.1213 2.70705C16.9498 1.53547 15.0503 1.53548 13.8787 2.70705L4.29291 12.2928C4.16476 12.421 4.07384 12.5816 4.02988 12.7574L2.02988 20.7574C1.94468 21.0982 2.04453 21.4587 2.29291 21.7071C2.54129 21.9554 2.90178 22.0553 3.24256 21.9701L11.2426 19.9701C11.4184 19.9261 11.579 19.8352 11.7071 19.7071L21.2929 10.1213C22.4645 8.94969 22.4645 7.05019 21.2929 5.87862L18.1213 2.70705ZM15.2929 4.12126C15.6834 3.73074 16.3166 3.73074 16.7071 4.12126L19.8787 7.29283C20.2692 7.68336 20.2692 8.31652 19.8787 8.70705L18 10.5857L13.4143 5.99992L15.2929 4.12126ZM12 7.41413L5.90299 13.5112L4.37439 19.6256L10.4888 18.097L16.5858 11.9999L12 7.41413Z"
                fill="#5F22C1"
              />
            </svg>
          </a>
          <a class="btn-white">
            Удалить профиль
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9 11C9 10.4477 9.44772 10 10 10C10.5523 10 11 10.4477 11 11V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V11Z"
                fill="#5F22C1"
              />
              <path
                d="M14 10C13.4477 10 13 10.4477 13 11V17C13 17.5523 13.4477 18 14 18C14.5523 18 15 17.5523 15 17V11C15 10.4477 14.5523 10 14 10Z"
                fill="#5F22C1"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17 6V5C17 3.34315 15.6569 2 14 2H10C8.34315 2 7 3.34315 7 5V6H3C2.44772 6 2 6.44772 2 7C2 7.55228 2.44772 8 3 8H4V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V8H21C21.5523 8 22 7.55228 22 7C22 6.44772 21.5523 6 21 6H17ZM9 6H15V5C15 4.44772 14.5523 4 14 4H10C9.44772 4 9 4.44772 9 5V6ZM6 8H18V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V8Z"
                fill="#5F22C1"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
    <div class="profile__body">
      <div class="user__items">
        <div
          class="user__item"
          @mousemove="selectSexAdd"
          @mouseleave="selectSexRemove"
        >
          <div class="label">Пол</div>
          <div class="value sexI" :class="{ edit: !isDisabled }">
            {{ userReset?.sex }}
          </div>
          <div class="selectSex">
            <div @click="goGender" class="gender">Мужской</div>
            <div @click="goGender" class="gender">Женский</div>
          </div>
        </div>
        <div class="user__item">
          <div class="label">Email</div>
          <MaskInput
            class="value emailI"
            :class="{ edit: !isDisabled }"
            :disabled="isDisabled"
            :value="userP?.email"
            mask=""
          />
        </div>
        <div class="user__item">
          <div class="label">Школа</div>
          <input
            class="value schoolI"
            :class="{ edit: !isDisabled }"
            :disabled="isDisabled"
            :value="school.name"
            @input="getSortSchool"
          />
          <div
            v-if="school.items.length > 0 && school.flag"
            @click="school.flag = false"
            class="close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071Z"
                fill="#000"
              />
            </svg>
          </div>
          <div
            class="school_items"
            :class="{ active: school.items.length > 0 && school.flag }"
          >
            <div class="school_itemWrap">
              <div
                v-for="schoolItem in school.items"
                :key="schoolItem.id"
                class="school_item"
                @click="selectSchool(schoolItem.name, schoolItem.id)"
              >
                {{ schoolItem.name }}
              </div>
            </div>
          </div>
        </div>
        <div class="user__item">
          <div class="label">Дата рождения</div>

          <MaskInput
            class="value drI"
            :class="{ edit: !isDisabled }"
            :disabled="isDisabled"
            :value="userReset?.dr"
            mask="##.##.####"
          />
        </div>
        <div class="user__item">
          <div class="label">Телефон</div>

          <MaskInput
            class="value telI"
            :class="{ edit: !isDisabled }"
            :disabled="isDisabled"
            :value="userReset?.tel"
            mask="+7 (###) ###-##-##"
          />
        </div>
        <div class="user__item">
          <div class="label">Количество баллов</div>
          <div class="value ballsValue">{{ userP?.userProfile?.balls }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.btn-white {
  color: #5f22c1;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 112.5% */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f1f1f1;
  border-radius: 10px;
  width: 228px;
  padding: 10px 20px;
  cursor: pointer;
}
.balls {
  border-radius: 10px;
  width: 228px;
  padding: 10px 20px;
}
.profile_info {
  display: flex;
  flex-direction: column;
  gap: 45px;
  padding-top: 77px;
}
.profile__head {
  display: flex;
  gap: 37px;
}
.profile__head__image {
  border-radius: 20px;
  border-bottom-right-radius: 0px;
  background: #e2e2e2;
  width: 187px;
  height: 187px;
  overflow: hidden;
  position: relative;
  min-width: 150px;
}
.profile__head__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.addImage {
  border-radius: 10px 0px 0px 0px;
  background: #fff;
  padding: 7px;
  position: absolute;
  right: 0;
  bottom: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.settings__file {
  position: absolute;
  opacity: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.basicUserInfo {
  display: flex;
  flex-direction: column;
  gap: 21px;
}
.profile__head__name {
  color: var(--Gray-1, #333);
  font-family: Onest;
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  width: min-content;
  min-width: 60px;
}
.userBtns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.user__items {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 43px;
}
.user__item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}
.selectSex {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}
.user__item.active .selectSex {
  opacity: 1;
  visibility: visible;
  transition: all 0.3s;
}
.gender {
  cursor: pointer;
}
.label {
  color: #383838;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.value {
  color: var(--383838, #383838);
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}
.value.ballsValue {
  color: #5f22c1;
}
.close {
  position: absolute;
  top: 28px;
  right: 0px;
  cursor: pointer;
}
.close svg {
  width: 15px;
}
.edit {
  background: #f1f1f1;
  border: 1px solid #5f22c1;
  padding: 5px;
  min-height: 34px;
}
.edit:focus {
  outline: none;
  border: 1px solid #5f22c1;
}
.school_items {
  padding: 20px;
  width: 100%;
  position: absolute;
  top: 100%;
  background: #fff;
  border-radius: 15px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  height: max-content;
  max-height: 250px;
  overflow-y: auto;
  z-index: 2;
}
.school_itemWrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  height: 100%;
}

.school_itemWrap::-webkit-scrollbar-thumb {
  background: rgba(25, 25, 25, 0.45);
  width: 2px;
  border-radius: 5px;
  border: none;
}
.school_itemWrap::-webkit-scrollbar-track {
  background-color: transparent;
  background: transparent;
}
.school_items.active {
  opacity: 1;
  visibility: visible;
}
.school_item {
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: #1a1a1a;
  cursor: pointer;
}
.school_item:hover {
  color: #333;
}
@media screen and (max-width: 1090px) {
  .user__items {
    grid-template-columns: 1fr 1fr;
  }
  .profile__head {
    gap: 20px;
  }
}
@media screen and (max-width: 767px) {
  .user__items {
    grid-template-columns: 1fr;
  }
  .profile__head__image {
  }
  .profile__head {
    flex-direction: column;
    align-items: center;
  }
  .profile_info {
    padding-top: 0;
    padding-bottom: 40px;
  }
  .basicUserInfo {
    align-items: center;
  }
  .userBtns a {
    width: 100%;
  }
}
</style>