<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { defineProps, defineEmits } from "vue";
import { useStore } from "vuex";
const store = useStore();
const apiDomain = store.getters.getApiDomain;

const emit = defineEmits(["close"]);
const props = defineProps({
    openObject: Object
})
</script>
<template>
    <div class="modal">
        <div class="close" @click="emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                        d="M1.26732 9.66549L0.333984 8.73215L4.06732 4.99882L0.333984 1.26549L1.26732 0.332153L5.00065 4.06549L8.73398 0.332153L9.66732 1.26549L5.93398 4.99882L9.66732 8.73215L8.73398 9.66549L5.00065 5.93215L1.26732 9.66549Z"
                        fill="#696969" />
                </svg>
            </div>
        <div class="modalMap">
            <div class="modalHead">
                <div class="head-24">
                    {{ props.openObject?.name }}
                </div>
                <div class="hashtag"># {{ props.openObject?.tag }}</div>
            </div>
            <div class="description">
                {{ props.openObject?.description }}
            </div>
            <div class="modalGallery">
                <Swiper :slides-per-view="'auto'" :space-between="10" class="mySwiper">
                    <SwiperSlide class="swiperSlide" v-for="image in props.openObject.img" :key="image.id">
                        <img @click="$emit('photomodal', props.openObject, image.img)"
                            :src="apiDomain + 'web/uploads/' + image.img" alt="" />
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    </div>
</template>
<style scoped>
.close {
    z-index: 4;
    position: absolute;
    top: 10px;
    right: 12px;
    display: flex;
    width: 32px;
    height: 32px;
    padding: 8px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-radius: 100px;
    border: 1px solid #DBDBDB;
    background: #EBECF0;
    cursor: pointer;
}
.modal {
    position: absolute;
    top: 76px;
    left: 40px;
    width: calc(100% - 80px);
    max-width: 441px;
    height: auto;
    max-height: 479px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
    z-index: 1000;
    border-radius: 8px;
    background: #FFF;
    box-shadow: 0 2px 12px 0 rgba(22, 28, 51, 0.15);
    padding: 20px;
}

.modalMap {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.modalHead {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.head-24 {
    color: #333;
    font-family: Onest;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
    letter-spacing: -0.48px;
}

.hashtag {
    color: #5F22C1;
    font-family: Onest;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
}

.description {
    color: #525252;
    font-family: Onest;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 135%;
    max-width: 401px;
    width: 100%;
}

.swiperSlide {
    width: 282px;
    height: 200px;
    border-radius: 12px;
    background: #DADADA;
    overflow: hidden;
}

.swiperSlide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

@media screen and (max-width: 1024px) {
    .modal {
        left: 20px;
        width: calc(100% - 40px);
        max-width: 441px;
        height: auto;
        max-height: 479px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 32px;
        z-index: 1000;
        border-radius: 8px;
        background: #FFF;
        box-shadow: 0 2px 12px 0 rgba(22, 28, 51, 0.15);
        padding: 20px;
    }

    .head-24 {
        font-size: 22px;
    }

    .hashtag {
        font-size: 10px;
    }

    .modalMap {
        gap: 18px;
    }

}
</style>