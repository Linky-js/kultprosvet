<script>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import NewHomeMainBlock from "../blocks/NewHomeMainBlock.vue";
import NewPartnersBlock from "../blocks/NewPartnersBlock.vue";
import NewThemesItems from "../blocks/NewThemesItems.vue";
import NewAboutBlock from "../blocks/NewAboutBlock.vue";
import NewAftresBlock from "../blocks/NewAftresBlock.vue";
import NewThemeHomeBlock from "../blocks/NewThemeHomeBlock.vue";
import HomeVideoBlock from "../blocks/HomeVideoBlock.vue";
import NewRegisterBlock from "../blocks/NewRegisterBlock.vue";
import NewKultBlock from "../blocks/NewKultBlock.vue";
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
    NewAboutBlock,
    NewAftresBlock,
    NewRegisterBlock,
    NewKultBlock,
    HomeVideoBlock,
    homeNewsBlock,
    SubscribeBlock,
    FooterBlock,
  },
};
</script>
<template>
  <HeaderBlock />
  <NewHomeMainBlock />
  <NewThemeHomeBlock />
  <NewPartnersBlock />
  <NewThemesItems />
  <NewAboutBlock />
  <HomeVideoBlock />
  <NewAftresBlock />
  <NewRegisterBlock />
  <NewKultBlock />
  <homeNewsBlock />
  <SubscribeBlock />
  <FooterBlock />
</template>