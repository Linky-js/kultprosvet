<template>
  <div class="number">
    {{ displayedNumber }}
  </div>
</template>
  
  <script>
export default {
  props: {
    number: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      displayedNumber: 0,
    };
  },
  watch: {
    number: {
      immediate: true,
      handler(newVal) {
        this.animateNumber(newVal);
      },
    },
  },
  methods: {
    animateNumber(targetNumber) {
      const duration = 3000; // 3 seconds
      const startTime = performance.now();
      const startNumber = this.displayedNumber;

      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // нормализуем прогресс (0 to 1)

        const easedProgress = this.easeOutQuint(progress); // добавляем эффект затухания
        this.displayedNumber = Math.floor(
          startNumber + (targetNumber - startNumber) * easedProgress
        );

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          this.displayedNumber = targetNumber; // Установка конечного значения
        }
      };

      requestAnimationFrame(updateNumber);
    },
    easeOutQuint(x) {
      return 1 - Math.pow(1 - x, 5);
    },
  },
};
</script>
  
  <style scoped>
.number {
  color: #5f22c1;
  text-align: center;
  font-family: Onest;
  font-size: 46px;
  font-style: normal;
  font-weight: 700;
  line-height: 50px; /* 108.696% */
  transition: opacity 0.5s ease;
}
</style>