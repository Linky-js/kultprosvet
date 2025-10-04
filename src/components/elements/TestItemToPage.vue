<script>
export default {
  name: "TestItemToPage",
  props: {
    item: Object,
  },
};
</script>
<template>
  <div class="test_item">
    <div class="test_name">
      {{ item.name }}
    </div>
    <div class="test_description">
      {{ item.description }}
    </div>
    <router-link :to="'/test/' + item.id" class="goToTest">Начать тестирование</router-link>
    <span class="line"></span>
  </div>
</template>
<style scoped>
.test_item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.test_name {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.test_description {
  color: #686868;
  font-family: Onest;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.goToTest {
  color: #5F22C1;
  font-family: "Proxima Nova";
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 128.571% */
  text-decoration-line: underline;
}
.line {
  width: 334px;
  
  height: 1px;
  background: #000;
  margin-top: 13px;
}
@media (max-width: 500px) {
  .test_item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
</style>