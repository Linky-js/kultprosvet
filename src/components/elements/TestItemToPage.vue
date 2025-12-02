<script>
export default {
  name: "TestItemToPage",
  props: {
    item: Object,
    index: Number
  },
  computed: {
    colors() {
      return [
        { back: "#BC76E8", front: "#CC7FFD" }, // 1-й цвет
        { back: "#89C338", front: "#8BC737" }, // 2-й цвет
        { back: "#A3A9B7", front: "#A7AEBD" }, // 3-й цвет
        { back: "#DF9936", front: "#E6A03C" }, // 4-й цвет
      ];
    },
    colorSet() {
      return this.colors[this.index % 4];
    }
  }
};
</script>
<template>
  <div class="test">
    <svg width="342" height="358" viewBox="0 0 342 358" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_4094_2095)">
        <g clip-path="url(#clip0_4094_2095)">
          <rect x="16" y="14" width="310" height="326" rx="28" class="svg-back" :fill="colorSet.back" />
          <rect x="80.4629" y="45" width="197" height="237" rx="8" transform="rotate(3.74109 80.4629 45)" fill="#F3F3F3"
            fill-opacity="0.7" />
          <rect x="65" y="54.3984" width="197" height="237" rx="8" fill="#F3F3F3" />
          <foreignObject x="-14" y="54" width="370" height="316">
            <div xmlns="http://www.w3.org/1999/xhtml"
              style="backdrop-filter:blur(15px);clip-path:url(#bgblur_1_4094_2095_clip_path);height:100%;width:100%">
            </div>
          </foreignObject>
          <g filter="url(#filter1_d_4094_2095)" data-figma-bg-blur-radius="30">
            <path class="svg-front"
              d="M16 312V84H211.452C221.269 84 230.542 88.5058 236.609 96.2232L245.391 107.394C251.458 115.112 260.731 119.617 270.548 119.617L326 119.617V312C326 327.464 313.464 340 298 340H44C28.536 340 16 327.464 16 312Z"
              :fill="colorSet.front" fill-opacity="0.85" shape-rendering="crispEdges" />
          </g>
        </g>
      </g>
      <defs>
        <filter id="filter0_d_4094_2095" x="0" y="0" width="342" height="358" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0609051 0 0 0 0 0.075594 0 0 0 0 0.149038 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4094_2095" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4094_2095" result="shape" />
        </filter>
        <filter id="filter1_d_4094_2095" x="-14" y="54" width="370" height="316" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="7" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0672707 0 0 0 0 0.0565828 0 0 0 0 0.163462 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4094_2095" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4094_2095" result="shape" />
        </filter>
        <clipPath id="bgblur_1_4094_2095_clip_path" transform="translate(14 -54)">
          <path
            d="M16 312V84H211.452C221.269 84 230.542 88.5058 236.609 96.2232L245.391 107.394C251.458 115.112 260.731 119.617 270.548 119.617L326 119.617V312C326 327.464 313.464 340 298 340H44C28.536 340 16 327.464 16 312Z" />
        </clipPath>
        <clipPath id="clip0_4094_2095">
          <rect x="16" y="14" width="310" height="326" rx="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
    <div class="test__content">
      <div class="test__title">
        {{ item.name }}
      </div>
      <div class="test__desc">
        {{ item.description }}
      </div>
      <router-link :to="'/test/' + item.id">Начать тестирование</router-link>
    </div>
  </div>
</template>
<style scoped>
.test {
  width: 310px;
  height: 326px;
  font-family: "Onest", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  padding: 18px;
}

.test svg {
  position: absolute;
  top: -15px;
  left: -16px;
  z-index: -1;
}
.test__content {
  min-height: 164px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
}

.test__title {
  font-weight: 600;
  font-size: 20px;
  line-height: 110%;
  color: #fff;
}

.test__desc {
  font-weight: 500;
  font-size: 13px;
  line-height: 120%;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
}

.test a {
  width: 100%;
  border-radius: 100px;
  background: #f4f5f5;
  font-weight: 600;
  font-size: 14px;
  line-height: 135%;
  color: #333;
  padding: 16px;
  text-align: center;
  margin-top: auto;
}
</style>