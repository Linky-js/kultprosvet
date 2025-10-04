<script>
export default {
  props: {
    questions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentQuestion: 0, 
      userAnswers: [],
      transitionName: "slide-left",
    };
  },
  methods: {
    pushResult() {
      let inputVale = document.querySelector("input[type='radio']").value;
     

      let result = {
        currentQuestion: this.currentQuestion,
        value: Number(inputVale),
      };
      if (this.currentQuestion < this.questions.length - 1) {
        if (this.userAnswers.length > 0) {
          let flagResult = false;
          for (let i of this.userAnswers) {
            if (i.currentQuestion === result.currentQuestion) {
              i.value = result.value;
              flagResult = true;
              break;
            }
          }
          if (!flagResult) {
            this.userAnswers.push(result);
          }
        } else {
          this.userAnswers.push(result);
        }
      }
    },
    goToNextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        this.pushResult();
        this.transitionName = "slide-left";
        this.currentQuestion++;
      }
    },
    goToPreviousQuestion() {
      if (this.currentQuestion > 0) {
        this.transitionName = "slide-right";
        this.currentQuestion--;
      } else {
        this.$router.push("/tests");
      }
    },
    submitTest() {
      let result = 0;
      for (let i of this.userAnswers) {
        result += i.value;
      }
      this.$emit("submit", result);
    },
    changeInput() {
      console.log(this.userAnswers);
    },
  },
  mounted() {
   
  },
};
</script>

<template>
  <div class="test__questions">
    <transition :name="transitionName" mode="out-in">
      <div
        v-if="currentQuestion < questions.length"
        :key="currentQuestion"
        class="test__question"
      >
        <div class="gotoBack" @click="goToPreviousQuestion">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
          >
            <path
              d="M36.75 21H5.25"
              stroke="#333333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.5 26.25L5.25 21L10.5 15.75"
              stroke="#333333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Назад
        </div>
        <div class="question__head">
          <div class="pages">
            {{ currentQuestion + 1 }} из {{ questions.length }}
          </div>
          <div class="question">{{ questions[currentQuestion].question }}</div>
        </div>
        <div class="answers">
          <div
            v-for="(answer, idx) in questions[currentQuestion].answers"
            :key="idx"
            class="answer"
          >
            <input
              type="radio"
              @change="changeInput"
              :id="`answer-${questions[currentQuestion].id}${idx}`"
              :name="`question-${currentQuestion}`"
              :value="answer.points"
            />

            <label
              :for="`answer-${questions[currentQuestion].id}${idx}`"
              class="answer__label"
              >{{ answer.text }}</label
            >
          </div>
        </div>
        <div class="btns">
          <a
            v-if="currentQuestion > 0"
            class="back"
            @click="goToPreviousQuestion"
            >Назад</a
          >
          <a
            v-if="currentQuestion < questions.length - 1"
            class="next"
            @click="goToNextQuestion"
            >Далее</a
          >
          <a v-else class="next" @click="submitTest">Завершить тест</a>
        </div>
      </div>
    </transition>
  </div>
</template>
  
  <style scoped>
.test__questions {
  position: relative;
  height: 400px;
}

.test__question {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

/* Переходы для slide-left (вперед) */
.slide-left-enter-active {
  transition: transform 0.5s ease;
}
.slide-left-leave-active {
  transition: transform 0.5s ease;
}
.slide-left-enter,
.slide-left-leave-to {
  transform: translateX(100%);
}
.slide-left-leave,
.slide-left-enter-to {
  transform: translateX(0%);
}

/* Переходы для slide-right (назад) */
.slide-right-enter-active {
  transition: transform 0.5s ease;
}
.slide-right-leave-active {
  transition: transform 0.5s ease;
}
.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(-100%);
}
.slide-right-leave,
.slide-right-enter-to {
  transform: translateX(0%);
}
.gotoBack {
  color: #333;
  text-align: center;
  font-family: "Proxima Nova";
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 128.571% */
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.question__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pages {
  color: #c7c7c7;
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 111.111% */
}
.question {
  color: #333;
  font-family: Onest;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px; /* 116.667% */
}
.test__question {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.answers {
  display: grid;
  grid-template-columns: repeat(2, max-content);
  row-gap: 16px;
  column-gap: 20px;
}
.answer {
  position: relative;
  width: max-content;
}
.answer input {
  display: none;
}
.answer__label {
  color: #333;
  font-family: Onest;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px; /* 144.444% */
  position: relative;
  padding-left: 32px;
  cursor: pointer;
}
.answer__label::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border: 1px solid #333;
  border-radius: 10px;
}
.answer input:checked + .answer__label::before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Crect width='24' height='24' rx='8' fill='%235F22C1'/%3E%3Cpath d='M8.16803 13.0605L6.76286 11.3709C6.44509 10.9888 5.86547 10.9684 5.52169 11.3273C5.22562 11.6364 5.21221 12.1197 5.49068 12.4447L7.3222 14.5826C8.87243 16.392 11.6616 16.4219 13.2502 14.6459L18.4825 8.79651C18.7745 8.47003 18.7661 7.97379 18.4631 7.65746C18.124 7.30343 17.5548 7.31457 17.2298 7.6816L12.4086 13.1263C11.2735 14.4082 9.26287 14.377 8.16803 13.0605Z' fill='white'/%3E%3C/svg%3E")
    no-repeat;
  background-position: center;
  background-size: cover;
}
.next {
  border-radius: 10px;
  background: #5f22c1;
  padding: 10px 20px;
  min-width: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  width: max-content;
}
.back {
  border-radius: 10px;
  background: #eee;
  padding: 10px 20px;
  min-width: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5f22c1;
  font-family: "Proxima Nova";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  width: max-content;
}
.btns {
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>
  