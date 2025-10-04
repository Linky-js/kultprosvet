<script>
export default {
  name: "PrelouderComp",
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    
  },
};
</script>
<template>
  <div  class="preloader">
    <!-- Добавьте любой стиль или изображение для прелоудера -->
    <div class="spinner">Загрузка...</div>
  </div>
</template>

<style>
.preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner {
  color: white;
  font-size: 1.5em;
}
</style>