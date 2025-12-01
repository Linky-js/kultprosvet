<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import NewHomeMainBlock from "../blocks/NewHomeMainBlock.vue";
import NewPartnersBlock from "../blocks/NewPartnersBlock.vue";
import NewThemesItems from "../blocks/NewThemesItems.vue";
import NewAboutBlock from "../blocks/NewAboutBlock.vue";
import NewThemeHomeBlock from "../blocks/NewThemeHomeBlock.vue";
import MapBlockHome from "../blocks/home/MapBlockHome.vue";
import HomeVideoBlock from "../blocks/HomeVideoBlock.vue";
import NewRegisterBlock from "../blocks/NewRegisterBlock.vue";
import homeNewsBlock from "../blocks/homeNewsBlock.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
export default {
  name: "HomePage",
  components: {
    HeaderBlock,
    NewHomeMainBlock,
    NewThemeHomeBlock,
    NewPartnersBlock,
    NewThemesItems,
    MapBlockHome,
    NewAboutBlock,
    NewRegisterBlock,
    HomeVideoBlock,
    homeNewsBlock,
    SubscribeBlock,
    FooterBlock,
  },
  data() {
    return {
      themesBlockShow: false,
    };
  },
};
</script>
<template>
  <HeaderBlock />
  <NewHomeMainBlock />
  <NewThemeHomeBlock />
  <NewPartnersBlock />
  <NewThemesItems v-if="themesBlockShow" />
  <MapBlockHome />
  <HomeVideoBlock />
  <homeNewsBlock />
  <NewAboutBlock />
  <NewRegisterBlock />
  <SubscribeBlock />
  <FooterBlock />
</template>