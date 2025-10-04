<script setup>
</script>

<template>
  <div class="register">
    <div class="container">
      <div class="register__content">
        <div class="register__content__left">
          <div class="head-h1">
            Создай личный кабинет и получи доступ ко всему контенту!
          </div>

          <div class="text">
            Подкасты и книги – слушай, читай, развивайся! <br />
            Глубокие мысли и крутые истории – где и когда тебе удобно! <br />
            Лучшие книги, подкасты и аудиоформаты, которые помогут разобраться в
            важном и открыть для себя новое.
          </div>
        </div>
      
      <div class="register__content__right">
        <NuxtLink class="whiollet">Войти</NuxtLink>
        <NuxtLink class="white">Зарегистрироваться</NuxtLink>
      </div>
    </div>
    </div>
  </div>
</template>
<style scoped>
.register__content {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 200px;
}
.register__content__left {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 50%;
}
.register__content__right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.head-h1{
    max-width: 608px;
}
.text{
    max-width: 640px;
}
@media screen and (max-width: 1024px) {
  .register__content{
    flex-direction: column;
  }
  .register__content__left{
    max-width: 100%;
  }
  .register__content__right{
    width: 100%;

  }
  .register__content__right *{
    width: 100%;
  }
}
</style>