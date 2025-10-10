<script setup>
import { defineProps, defineEmits } from "vue";
import { useStore } from "vuex";
const store = useStore();
const props = defineProps({
    video: {
        type: Object,
        required: true,
    },

});
const emit = defineEmits(["openVideo"]);
const togglePlay = (iframeSrc) => {
  emit("openVideo", iframeSrc);
};
const apiDomain = store.getters.getApiDomain;
const truncate = (text, maxLength) => {
    const mobile = window.innerWidth < 1024;
    if (mobile) maxLength = 28;
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
</script>
<template>
    <div class="post">
        <div class="video">
            <div :id="'btnVBlock' + props.video.id" class="video__play" @click="togglePlay(props.video.link)">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M19.1673 9.99755C19.1673 9.13505 18.7257 8.27255 17.8415 7.79171L7.16482 1.98505C5.44565 1.05088 3.33398 2.26755 3.33398 4.19171V9.99755H19.1673Z"
                        fill="#5F22C1" />
                    <path
                        d="M7.16482 18.0125L17.8415 12.2058C18.2423 11.9936 18.5776 11.6761 18.8112 11.2873C19.0449 10.8986 19.168 10.4535 19.1673 10H3.33398V15.8058C3.33398 17.7308 5.44565 18.9467 7.16482 18.0125Z"
                        fill="#5F22C1" />
                </svg>
            </div>
            <img class="poster" :src="apiDomain + 'web/uploads/' + props.video.poster" alt="" />
        </div>
        <div class="post__content">
            <h3 class="headPost">
                {{ truncate(props.video.title, 40) }}
            </h3>
            <div class="post__content-list">
                <p>{{ props.video.category.name }}</p>
                <p>{{ props.video.theme.name }}</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
.post {
    position: relative;
    width: 530px;
    border-radius: 15px;
}

.post .poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.post .video {
    width: 100%;
    position: relative;
    display: flex;
    margin-bottom: 16px;
    height: 273px;
    border-radius: 28px;
    overflow: hidden;
}

.post:hover .video::after {
    background: linear-gradient(180deg, rgba(16, 28, 34, 0) 0%, rgba(16, 28, 34, 0.8) 100%);
}

.video::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1;
    height: 104px;
    transition: .3s all;
    background: linear-gradient(180deg, rgba(16, 28, 34, 0) 0%, rgba(16, 28, 34, 0) 100%);
}

.post__content-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.post__content-list p {
    font-size: 12px;
    line-height: 1;
    font-family: 'Onest';
    font-weight: 600;
    color: #595959;
    background: #F0F0F0;
    padding: 9px 10px;
    border-radius: 50px;
}

.headPost {
    color: #333;
    font-family: Onest;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: 120%;
    margin-bottom: 8px;
}


.video__play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    background: #fff;
    border-radius: 50%;
}

.video__play svg {
    position: relative;
    z-index: 1;
}

.video__play::after {
    top: -7px;
    width: 58px;
    height: 58px;
    left: -7px;
    content: '';
    display: inline-block;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 1);
    position: absolute;
    z-index: -1;
}

@media screen and (max-width: 1024px) {
    .arrows {
        display: none;
    }

    .post {
        width: 310px;
    }

    .post .video {
        height: 200px;
        border-radius: 16px;
        margin-bottom: 12px;
    }

    .post .video::after {
        content: none;
    }

    .video__play {
        width: 36px;
        height: 36px;
    }

    .video__play svg {
        width: 16px;
        height: 16px;
    }

    .video__play::after {
        width: 48px;
        height: 48px;
    }

    .headPost {
        font-size: 16px;
        line-height: 120%;
        margin-bottom: 8px;
    }

    .post__content-list p {
        font-size: 11px;
    }

    .home__video {
        margin-top: 100px;
    }
}
</style>