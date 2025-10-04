<script setup>
import { onMounted, ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  objects: { type: Array, required: true },
  regionId: { type: String, required: true },
  defaultMap: { type: Boolean, required: false },
});

const emit = defineEmits(["marker-click"]);

watch(
  () => props.defaultMap,
  (val) => {
    if (val && mapInstance && clusterer) {
      // вернуть карту в дефолтный цвет
      mapInstance.container.getElement().style.filter = "none";

      // всем маркерам вернуть цветной layout
      clusterer.getGeoObjects().forEach((pm) => {
        pm.options.set("iconContentLayout", layoutColored);
      });
    }
  }
);


const mapRef = ref(null);
let mapInstance = null;
let clusterer = null;

onMounted(() => {
  if (!window.ymaps) {
    const script = document.createElement("script");
    script.src =
      "https://api-maps.yandex.ru/2.1/?apikey=9c78f871-95db-4703-8e87-9b5ddbab0b78&lang=ru_RU";
    script.onload = initMap;
    document.head.appendChild(script);
  } else {
    initMap();
  }
});

// let activePlacemark = null;
let layoutColored = null;
let layoutGray = null;

function initMap() {
  window.ymaps.ready(() => {
    mapInstance = new window.ymaps.Map(mapRef.value, {
      center: [55.75, 37.61],
      zoom: 6,
      controls: []
    });

    clusterer = new window.ymaps.Clusterer({
      preset: "islands#invertedBlueClusterIcons",
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterOpenBalloonOnClick: false,
    });

    // заранее создаём два шаблона: цветной и ч/б
    layoutColored = window.ymaps.templateLayoutFactory.createClass(`
      <div style="
        border-radius: 100px;
        background: #5F22C1;
        color: #FFF;
        text-align: center;
        font-family: Onest, sans-serif;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        height: 48px;
        cursor: pointer;
        filter: none;
      ">
        $[properties.count]
      </div>
    `);

    layoutGray = window.ymaps.templateLayoutFactory.createClass(`
      <div style="
        border-radius: 100px;
        background: #aaa; /* фон тоже серый если хочешь */
        color: #fff;
        text-align: center;
        font-family: Onest, sans-serif;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        height: 48px;
        cursor: pointer;
        filter: grayscale(1);
      ">
        $[properties.count]
      </div>
    `);

    mapInstance.geoObjects.add(clusterer);
    renderMarkers();
  });
}

function renderMarkers() {
  if (!mapInstance || !clusterer) return;

  clusterer.removeAll();
  mapInstance.container.getElement().style.filter = "none"; // карта цветная по дефолту

  const regionObjects = props.objects.filter(
    (o) => String(o.region_id) === String(props.regionId)
  );

  const geoObjects = regionObjects.map((obj) => {
    const placemark = new window.ymaps.Placemark(
      [parseFloat(obj.lat), parseFloat(obj.lon)],
      {
        hintContent: obj.name,
        count: obj.count || 1
      },
      {
        iconLayout: "default#imageWithContent",
        iconImageSize: [48, 48],
        iconImageOffset: [-24, -24],
        iconContentLayout: layoutColored,
        hasBalloon: false,
        openEmptyBalloon: false,
        hideIconOnBalloonOpen: false
      }
    );

    placemark.events.add("click", () => {
      emit("marker-click", obj);

      // карта в ч/б
      mapInstance.container.getElement().style.filter =
        "grayscale(1) brightness(1.1)";

      // все маркеры серые
      clusterer.getGeoObjects().forEach((pm) => {
        pm.options.set("iconContentLayout", layoutGray);
      });

      // текущий маркер цветной
      placemark.options.set("iconContentLayout", layoutColored);
    });

    return placemark;
  });

  clusterer.add(geoObjects);

  if (geoObjects.length) {
    if (geoObjects.length === 1) {
      // один объект → ставим центр и фиксированный зум
      const coords = geoObjects[0].geometry.getCoordinates();
      mapInstance.setCenter(coords, 15); // 10 — оптимальный зум, можно подправить
    } else {
      // несколько объектов → используем fitBounds
      const bounds = window.ymaps.geoQuery(geoObjects).getBounds();
      if (bounds) {
        mapInstance.setBounds(bounds, {
          checkZoomRange: true,
          zoomMargin: 40
        });

        // запрет на слишком близкий зум
        if (mapInstance.getZoom() > 15) {
          mapInstance.setZoom(15);
        }
      }
    }
  }
}

// следим за изменениями
watch(() => props.regionId, () => renderMarkers());
watch(() => props.objects, () => renderMarkers(), { deep: true });
</script>

<template>
  <div ref="mapRef" class="yandex-map"></div>
</template>

<style scoped>
.yandex-map {
  width: 100%;
  height: 670px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
