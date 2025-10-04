<script setup>
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/thumbs'
import { useStore } from "vuex";
const store = useStore();
const apiDomain = store.getters.getApiDomain;
const props = defineProps({
    objectItem: { type: Object, required: true },
    currentPhoto: { type: String, required: false },
});

const emit = defineEmits(["close"]);
const initialIndex = ref(0);
const thumbsSwiper = ref(null);
onMounted(() => {
    if (props.currentPhoto) {
        const index = props.objectItem.img.findIndex(
            (img) => img.img === props.currentPhoto
        );
        initialIndex.value = index !== -1 ? index : 0;
    }
});
</script>

<template>
    <div class="modal" @click.self="emit('close')">

        <div class="modalContent">
            <div class="close" @click="emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                        d="M1.26732 9.66549L0.333984 8.73215L4.06732 4.99882L0.333984 1.26549L1.26732 0.332153L5.00065 4.06549L8.73398 0.332153L9.66732 1.26549L5.93398 4.99882L9.66732 8.73215L8.73398 9.66549L5.00065 5.93215L1.26732 9.66549Z"
                        fill="#696969" />
                </svg>
            </div>
            <div class="gradientTop"></div>
            <div class="gradientBottom"></div>

            <div class="modal_head">
                <div class="head-28">
                    {{ props.objectItem.name }}
                </div>
                <div class="iconImages">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <g clip-path="url(#clip0_69_3707)">
                            <path
                                d="M4.68715 13.8991C3.48645 13.8991 2.41842 13.1303 2.03059 11.9857L2.00436 11.8995C1.9129 11.5964 1.87458 11.3415 1.87458 11.0865V5.97278L0.0550637 12.0464C-0.178951 12.9398 0.354311 13.866 1.24903 14.1127L12.8466 17.2187C12.9914 17.2562 13.1361 17.2741 13.2787 17.2741C14.0256 17.2741 14.7082 16.7784 14.8995 16.0478L15.5751 13.8991H4.68715Z"
                                fill="white" />
                            <path
                                d="M6.75008 6.02372C7.57737 6.02372 8.25003 5.35093 8.25003 4.52364C8.25003 3.69635 7.57737 3.02356 6.75008 3.02356C5.92279 3.02356 5.25 3.69635 5.25 4.52364C5.25 5.35093 5.92279 6.02372 6.75008 6.02372Z"
                                fill="white" />
                            <path
                                d="M16.1253 0.77356H4.875C3.84157 0.77356 3 1.61513 3 2.6487V10.8988C3 11.9324 3.84157 12.7739 4.875 12.7739H16.1253C17.1588 12.7739 18.0004 11.9324 18.0004 10.8988V2.6487C18.0004 1.61513 17.1588 0.77356 16.1253 0.77356ZM4.875 2.27364H16.1253C16.3324 2.27364 16.5003 2.4416 16.5003 2.6487V7.97308L14.1311 5.20844C13.8798 4.91372 13.516 4.7562 13.1252 4.74727C12.7367 4.74947 12.3723 4.92196 12.1233 5.22052L9.33762 8.56402L8.43013 7.65872C7.91719 7.14579 7.08235 7.14579 6.5701 7.65872L4.50008 9.72805V2.6487C4.50008 2.4416 4.66804 2.27364 4.875 2.27364Z"
                                fill="white" />
                        </g>
                        <defs>
                            <clipPath id="clip0_69_3707">
                                <rect width="18" height="18" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    {{ props.objectItem.img.length }}
                </div>
            </div>
            <Swiper class="smallSwiper" :slides-per-view="'auto'" :space-between="10" @swiper="thumbsSwiper = $event"
                :watch-slides-progress="true">
                <SwiperSlide v-for="image in props.objectItem.img" :key="image.id" class="swiperSlideSmall">
                    <img :src="apiDomain + 'web/uploads/' + image.img" alt="" />
                </SwiperSlide>
            </Swiper>
            <Swiper class="bigSwiper" :slides-per-view="1" :space-between="0" :thumbs="{ swiper: thumbsSwiper }"
                :initial-slide="initialIndex" :modules="[Thumbs]">
                <SwiperSlide v-for="image in props.objectItem.img" :key="image.id" class="swiperSlideBig">
                    <img :src="apiDomain + 'web/uploads/' + image.img" alt="" />
                </SwiperSlide>
            </Swiper>

            <!-- Маленький свайпер -->

        </div>
    </div>
</template>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.bigSwiper {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
}

.swiperSlideBig {
    width: 100%;
    height: 100%;
}

.swiperSlideBig img {
    object-fit: cover;
    width: 100%;
    height: 100%;
}

.modalContent {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    max-width: 1300px;
    max-height: 622px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    border-radius: 28px;
    padding: 24px 20px 20px;
}

.modal_head {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 3;
}

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

.iconImages {
    border-radius: 100px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background: rgba(0, 0, 0, 0.30);
    backdrop-filter: blur(10px);
    display: inline-flex;
    padding: 8px 16px 8px 12px;
    justify-content: center;
    align-items: center;
    gap: 6px;
    color: #FFF;
    font-family: Onest;
    font-size: 13px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    /* 138.462% */
}

.head-28 {
    color: #FFF;
    font-family: Onest;
    font-size: 28px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
    /* 33.6px */
    letter-spacing: -0.56px;
}

.gradientTop {
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(180deg, rgba(16, 28, 34, 0.80) 0%, rgba(16, 28, 34, 0.00) 100%);
    height: 164px;
    position: absolute;
}

.gradientBottom {
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(180deg, rgba(16, 28, 34, 0.00) 0%, rgba(16, 28, 34, 0.80) 100%);
    height: 164px;
    position: absolute;
}

.smallSwiper {
    width: 100%;
    height: 102px;
    position: relative;
    z-index: 2;
}

.swiperSlideSmall {
    width: 180px;
    height: 102px;
    border-radius: 12px;
    border: 2px solid #ffffff00;
    background: #B7B7B7;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.swiperSlideSmall.swiper-slide-thumb-active {
    border: 2px solid #fff;
}

.swiperSlideSmall img {
    object-fit: cover;
    width: 100%;
    height: 100%;
}

@media screen and (max-width: 1024px) {
    .smallSwiper {
        order: 3;
    }

    .modal {
        padding: 0 5px;
    }

    .bigSwiper {
        position: static;
        height: 228px;
        order: 2;
    }

    .bigSwiper .swiperSlideBig {
        border-radius: 16px;
        background: #AFAFAF;
        overflow: hidden;
    }

    .modal_head {
        order: 1;
        gap: 11px;
    }

    .modalContent {
        border-radius: 8px;
        background: #FFF;
        box-shadow: 0 2px 12px 0 rgba(22, 28, 51, 0.15);
        padding: 18px 14px 30px;
        max-height: 425px;
    }

    .head-28 {
        color: #333;
        font-family: Onest;
        font-size: 22px;
        font-style: normal;
        font-weight: 600;
        line-height: 120%;
        /* 26.4px */
        letter-spacing: -0.44px;
    }

    .gradientTop,
    .gradientBottom {
        display: none;
    }
}
</style>
