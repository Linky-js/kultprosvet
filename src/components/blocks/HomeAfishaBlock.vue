<script>
export default {
  name: "HomeAfishablock",
  components: {},
  data() {
    return {
      linksTheme: [
        {
          id: 1,
          name: "Выставки",
          link: "/afisha",
        },
        {
          id: 2,
          name: "Лекции",
          link: "/afisha",
        },
        {
          id: 3,
          name: "Музеи",
          link: "/afisha",
        },
        {
          id: 4,
          name: "Театры",
          link: "/afisha",
        },
        {
          id: 5,
          name: "Архитектура",
          link: "/afisha",
        },
        {
          id: 6,
          name: "Концерты",
          link: "/afisha",
        },
      ],
    };
  },
};
</script>

<template>
  <div class="afisha">
    <div class="container">
      <div class="afisha__content">
        <div class="afisha__content__left">
            <div class="afisha__content__title">Афиша</div>
            <div class="afisha__links">
              <div v-for="l in linksTheme" :key="l.id" class="afisha__links__item">
                <router-link :to="l.link" class="afisha__links__item__link">{{ l.name }}</router-link>
              </div>
            </div>
        </div>
        <div class="afisha__content__right">
            
        </div>
      </div>
    </div>
  </div>
</template>