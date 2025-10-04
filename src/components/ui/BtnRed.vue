<script>
import $ from "jquery";
export default {
  name: "BtnRed",
  props: {
    link: {
      type: String,
      required: false,
    },
  },
  methods: {
    animateButton(e) {

      e.target.classList.remove("animate");

      e.target.classList.add("animate");
      setTimeout(function () {
        e.target.classList.remove("animate");
      }, 700);
    },
  },
  mounted() {
    $(".btn-red").on("click", this.animateButton);
  },
};
</script>

<template>
  <router-link v-if="link" :to="link" class="btn-red">
    <slot></slot>
  </router-link>
  <button v-else class="btn-red"><slot></slot></button>
</template>

<style scoped>
.btn-red{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 5px;
}

</style>