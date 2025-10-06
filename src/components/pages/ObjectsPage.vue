<script setup>
import HeaderBlock from "../blocks/HeaderBlock.vue";
import FooterBlock from "../blocks/FooterBlock.vue";
import YandexMap from "../elements/YandexMap.vue";
import axios from "axios";
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import gsap from "gsap";
import ObjectModal from "../elements/ObjectModal.vue";
import GalleryModal from "../elements/GalleryModal.vue";
import SubscribeBlock from "../blocks/SubscribeBlock.vue";


const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;

const objects = ref([]);

const categories = ref([]);
const selectedRegion = ref(null);
const regions = ref([]);
const mapRoot = ref(null);
const svgEl = ref(null);
const markers = ref([]);
const openObject = ref(null);
const flagMap = ref(false);

// --- pan/zoom состояние ---
const transform = ref({ scale: 1, x: 0, y: 0 });
let dragging = false;
let dragStart = { x: 0, y: 0 };
let lastPan = { x: 0, y: 0 };

// --- загрузка данных ---
const getObjects = () => {
    let authGet = `&auth=${user.username}:${user.auth_key}`;
    axios
        .get(`${apiUrl}/api-object/get-list${authGet}`)
        .then((res) => {
            objects.value = res.data.objects || [];
            applyTransform();
        });
}
const getRegions = () => {
    let authGet = `&auth=${user.username}:${user.auth_key}`;
    axios
        .get(`${apiUrl}/api-object-region/get-list${authGet}`)
        .then((res) => { regions.value = res.data.object_regions || []; });
};

const getCategories = () => {
    let authGet = `&auth=${user.username}:${user.auth_key}`;
    axios
        .get(`${apiUrl}/api-object-category/get-list${authGet}`)
        .then((res) => { categories.value = res.data.object_categories || []; });
};

// --- утилиты ---
function getPathByDataCode(code) {
    if (!svgEl.value) return null;
    return svgEl.value.querySelector(`[data-code="${code}"]`);
}

function getElementCenterSVG(el) {
    const box = el.getBBox();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

function svgToScreen(x, y) {
    const pt = svgEl.value.createSVGPoint();
    pt.x = x; pt.y = y;
    return pt.matrixTransform(svgEl.value.getScreenCTM());
}

function screenToLocal(screenX, screenY) {
    const mapRect = mapRoot.value.getBoundingClientRect();
    return { left: screenX - mapRect.left, top: screenY - mapRect.top };
}

function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- маркеры ---
function buildInitialMarkers() {
    if (!svgEl.value || !mapRoot.value) return [];
    const byRegion = new Map();
    for (const o of objects.value) {
        const key = String(o.region_id);
        if (!byRegion.has(key)) byRegion.set(key, []);
        byRegion.get(key).push(o);
    }

    const initial = [];
    for (const region of regions.value) {
        const regionIdStr = String(region.id);
        const objs = byRegion.get(regionIdStr) || [];
        if (!objs.length) continue;

        const pathEl = getPathByDataCode(region.data_code);
        if (!pathEl) continue;

        const c = getElementCenterSVG(pathEl);
        const scr = svgToScreen(c.x, c.y);
        const local = screenToLocal(scr.x, scr.y);

        initial.push({
            regions: [region],
            regionIds: [region.id],
            dataCodes: [region.data_code],
            count: objs.length,
            svgX: c.x,
            svgY: c.y,
            screenX: scr.x,
            screenY: scr.y,
            left: local.left,
            top: local.top,
        });
    }
    return initial;
}

function clusterMarkers(initialMarkers) {
    let list = initialMarkers.map(m => ({ ...m }));
    const minDist = Math.max(36, window.innerWidth * 0.028);

    let merged = true;
    while (merged) {
        merged = false;
        outer: for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                const a = list[i], b = list[j];
                if (dist({ x: a.screenX, y: a.screenY }, { x: b.screenX, y: b.screenY }) < minDist) {
                    const total = a.count + b.count;
                    const newX = (a.svgX * a.count + b.svgX * b.count) / total;
                    const newY = (a.svgY * a.count + b.svgY * b.count) / total;
                    const scr = svgToScreen(newX, newY);
                    const newLocal = screenToLocal(scr.x, scr.y);
                    list.splice(j, 1);
                    list.splice(i, 1, {
                        regions: [...a.regions, ...b.regions],
                        regionIds: Array.from(new Set([...a.regionIds, ...b.regionIds])),
                        dataCodes: Array.from(new Set([...a.dataCodes, ...b.dataCodes])),
                        count: total,
                        svgX: newX,
                        svgY: newY,
                        screenX: scr.x,
                        screenY: scr.y,
                        left: newLocal.left,
                        top: newLocal.top,
                    });
                    merged = true;
                    break outer;
                }
            }
        }
    }
    return list;
}

async function recalcMarkers() {
    await nextTick();
    markers.value = clusterMarkers(buildInitialMarkers());
}

// --- GSAP zoom ---
function zoomToPoint(svgX, svgY, targetScale) {
    const oldScale = transform.value.scale;
    const screenX = svgX * oldScale + transform.value.x;
    const screenY = svgY * oldScale + transform.value.y;
    const newX = transform.value.x + (screenX - (svgX * targetScale + transform.value.x));
    const newY = transform.value.y + (screenY - (svgY * targetScale + transform.value.y));

    gsap.to(transform.value, {
        duration: 0.8,
        scale: targetScale,
        x: newX,
        y: newY,
        ease: "power2.out",
        onUpdate: applyTransform,
        onComplete: () => recalcMarkers(),
    });
}

function zoomToCluster(marker, e) {
    console.log('marker', e);

    if (!svgEl.value) return;
    const boxes = marker.regions
        .map(r => getPathByDataCode(r.data_code))
        .filter(p => p)
        .map(p => p.getBBox());
    if (!boxes.length) return;

    const union = boxes.reduce((acc, b) => acc ? {
        x: Math.min(acc.x, b.x),
        y: Math.min(acc.y, b.y),
        x2: Math.max(acc.x2, b.x + b.width),
        y2: Math.max(acc.y2, b.y + b.height)
    } : { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height }, null);

    //   const centerX = union.x + (union.x2 - union.x)/2;
    //   const centerY = union.y + (union.y2 - union.y)/2;

    const mapRect = mapRoot.value.getBoundingClientRect();
    const scaleX = (mapRect.width * 0.6) / (union.x2 - union.x);
    const scaleY = (mapRect.height * 0.6) / (union.y2 - union.y);
    const targetScale = Math.min(scaleX, scaleY);
    const offsetX = e.clientX - mapRect.left;
    const offsetY = e.clientY - mapRect.top;
    const svgX = (offsetX - transform.value.x) / transform.value.scale;
    const svgY = (offsetY - transform.value.y) / transform.value.scale;
    zoomToPoint(svgX, svgY, targetScale);
}

function onMarkerClick(marker, e) {
    if (marker.regionIds.length === 1) {
        selectedRegion.value = marker;
    } else {
        zoomToCluster(marker, e);
    }
}

// --- трансформация ---
function applyTransform() {
    if (!svgEl.value) return;
    gsap.set(svgEl.value, {
        x: transform.value.x,
        y: transform.value.y,
        scale: transform.value.scale,
        transformOrigin: "0 0",
    });
    recalcMarkers();
}

// --- мышка ---
function onWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(10, Math.max(1, transform.value.scale * (1 + delta)));
    const mapRect = mapRoot.value.getBoundingClientRect();
    const offsetX = e.clientX - mapRect.left;
    const offsetY = e.clientY - mapRect.top;
    const svgX = (offsetX - transform.value.x) / transform.value.scale;
    const svgY = (offsetY - transform.value.y) / transform.value.scale;
    console.log('new scale', newScale);

    transform.value.x = offsetX - svgX * newScale;
    transform.value.y = offsetY - svgY * newScale;
    transform.value.scale = newScale;
    applyTransform();
}

function onMouseDown(e) {
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    lastPan = { x: transform.value.x, y: transform.value.y };
}
function onMouseMove(e) { if (dragging) { transform.value.x = lastPan.x + (e.clientX - dragStart.x); transform.value.y = lastPan.y + (e.clientY - dragStart.y); applyTransform(); } }
function onMouseUp() { dragging = false; }

function clearActive() {

    svgEl.value.querySelectorAll("path.active").forEach(p => p.classList.remove("active"));

    mapRoot.value.querySelectorAll(".marker.active").forEach(m => m.classList.remove("active"));
}

function markerPathHover(marker, el) {
    clearActive();

    if (el) el.classList.add("active");

    marker.dataCodes.forEach(code => {
        const path = getPathByDataCode(code);
        if (path) path.classList.add("active");
    });
}

function markerPathLeave() {
    clearActive();
}
// --- мобильный pinch ---
let pinchStart = null;
function onTouchStart(e) {
  if (e.touches.length === 2) {
    e.preventDefault(); // только тут блокируем скролл страницы
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchStart = {
      distance: Math.sqrt(dx * dx + dy * dy),
      center: {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      },
      scale: transform.value.scale
    };
  } else {
    pinchStart = null; // одиночный палец → ничего не делаем, пусть страница скроллится
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2 && pinchStart) {
    e.preventDefault(); // блокируем скролл только во время pinch
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const targetScale = Math.min(10, Math.max(1, pinchStart.scale * distance / pinchStart.distance));
    const mapRect = mapRoot.value.getBoundingClientRect();
    const svgX = (pinchStart.center.x - mapRect.left - transform.value.x) / transform.value.scale;
    const svgY = (pinchStart.center.y - mapRect.top - transform.value.y) / transform.value.scale;

    zoomToPoint(svgX, svgY, targetScale);
  }
}

function onTouchEnd(e) {
  if (e.touches.length < 2) {
    pinchStart = null;
  }
}
function onYandexMarkerClick(e) {
    openObject.value = e;

}
const openGalleryRegion = ref(null);
const openGalleryPhoto = ref(null);
function goOpenGallery(region, currentPhoto) {
    console.log('region', region);
    console.log('currentPhoto', currentPhoto);

    openGalleryRegion.value = region;
    openGalleryPhoto.value = currentPhoto;


}
function closeOpenObject() {
    openObject.value = null;
    flagMap.value = true;

}
// --- watch & mounted ---
watch(() => regions.value.length, val => { if (val > 0) recalcMarkers(); });

onMounted(async () => {
    getObjects();
    getCategories();
    getRegions();
    await nextTick();
    svgEl.value = mapRoot.value.querySelector("#svgRoot");

    if (window.innerWidth > 1024) {
        mapRoot.value.addEventListener("wheel", onWheel, { passive: false });
        mapRoot.value.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }
    // события touch
    mapRoot.value.addEventListener("touchstart", onTouchStart, { passive: false });
    mapRoot.value.addEventListener("touchmove", onTouchMove, { passive: false });
    mapRoot.value.addEventListener("touchend", onTouchEnd, { passive: false });

    recalcMarkers();
});

onBeforeUnmount(() => {
    if (mapRoot.value) {
        mapRoot.value.removeEventListener("wheel", onWheel);
        mapRoot.value.removeEventListener("mousedown", onMouseDown);
        mapRoot.value.removeEventListener("touchstart", onTouchStart);
        mapRoot.value.removeEventListener("touchmove", onTouchMove);
        mapRoot.value.removeEventListener("touchend", onTouchEnd);
    }
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
    <HeaderBlock />
    <GalleryModal v-if="openGalleryRegion" :object-item="openGalleryRegion" :current-photo="openGalleryPhoto.url"
        @close="openGalleryRegion = null" />
    <div class="objects">
        <div class="container">
            <div class="objects__content">
                <div class="head-h1">
                    Карта России с культурными объектами
                </div>
                <div class="categories">
                    <div v-for="category in categories" :key="category.id" class="category">
                        {{ category.name }}
                    </div>
                </div>
            </div>
        </div>
        <div class="map_wrapper">
            <div class="container">
                <ObjectModal v-if="openObject" :open-object="openObject" @photomodal="goOpenGallery"
                    @close="closeOpenObject" />
                <div v-if="selectedRegion" class="infoSelectedRegion">
                    <div @click="selectedRegion = null" class="back">
                        <div class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="10" viewBox="0 0 15 10"
                                fill="none">
                                <path
                                    d="M14.8745 4.23189L3.25951 4.23195L6.56645 0.923829L5.68257 0.0399442L0.865628 4.85689L5.68257 9.67383L6.56645 8.78994L3.25951 5.48195L14.8745 5.48189L14.8745 4.23189Z"
                                    fill="#383838" />
                            </svg>
                        </div>
                        <w> К другим регионам</w>
                    </div>
                    <div class="region">
                        <div class="regionName">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
                                fill="none">
                                <path
                                    d="M8 1.33203C9.5913 1.33203 11.1174 1.96417 12.2426 3.08939C13.3679 4.21461 14 5.74073 14 7.33203C14 9.38136 12.8827 11.0587 11.7053 12.262C11.1171 12.8567 10.4753 13.3959 9.788 13.8727L9.504 14.066L9.37067 14.1547L9.11933 14.3147L8.89533 14.4514L8.618 14.6127C8.42976 14.7201 8.21675 14.7767 8 14.7767C7.78325 14.7767 7.57024 14.7201 7.382 14.6127L7.10467 14.4514L6.758 14.238L6.63 14.1547L6.35667 13.9727C5.61522 13.471 4.9246 12.8981 4.29467 12.262C3.11733 11.058 2 9.38136 2 7.33203C2 5.74073 2.63214 4.21461 3.75736 3.08939C4.88258 1.96417 6.4087 1.33203 8 1.33203ZM8 5.33203C7.73736 5.33203 7.47728 5.38376 7.23463 5.48427C6.99198 5.58478 6.7715 5.7321 6.58579 5.91782C6.40007 6.10353 6.25275 6.32401 6.15224 6.56666C6.05173 6.80932 6 7.06939 6 7.33203C6 7.59467 6.05173 7.85475 6.15224 8.0974C6.25275 8.34005 6.40007 8.56053 6.58579 8.74624C6.7715 8.93196 6.99198 9.07928 7.23463 9.17979C7.47728 9.2803 7.73736 9.33203 8 9.33203C8.53043 9.33203 9.03914 9.12132 9.41421 8.74624C9.78929 8.37117 10 7.86246 10 7.33203C10 6.8016 9.78929 6.29289 9.41421 5.91782C9.03914 5.54274 8.53043 5.33203 8 5.33203Z"
                                    fill="#5F22C1" />
                            </svg>
                            {{ selectedRegion?.regions[0].name }}
                        </div>
                        <div class="currentCount">
                            {{ selectedRegion?.count }}
                        </div>
                    </div>
                </div>
            </div>

            <YandexMap v-if="selectedRegion" :objects="objects" :default-map="flagMap"
                :region-id="selectedRegion.regionIds[0]" @marker-click="onYandexMarkerClick" />
            <div v-else class="container">
                <div class="map" ref="mapRoot" style="position:relative;">
                    <transition name="fade">
                        <div class="map__content">
                            <div class="info">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                                    fill="none">
                                    <g clip-path="url(#clip0_69_2124)">
                                        <mask id="mask0_69_2124" style="mask-type:luminance" maskUnits="userSpaceOnUse"
                                            x="0" y="0" width="20" height="20">
                                            <path
                                                d="M9.99984 18.3346C11.0944 18.336 12.1784 18.1211 13.1896 17.7022C14.2009 17.2833 15.1194 16.6687 15.8923 15.8938C16.6673 15.1208 17.2818 14.2023 17.7007 13.1911C18.1196 12.1799 18.3345 11.0959 18.3332 10.0013C18.3345 8.90676 18.1196 7.82274 17.7007 6.81151C17.2818 5.80029 16.6673 4.8818 15.8923 4.10881C15.1194 3.33388 14.2009 2.71932 13.1896 2.30044C12.1784 1.88156 11.0944 1.66663 9.99984 1.66798C8.9053 1.66663 7.82127 1.88156 6.81005 2.30044C5.79882 2.71932 4.88033 3.33388 4.10734 4.10881C3.33241 4.8818 2.71785 5.80029 2.29897 6.81151C1.8801 7.82274 1.66516 8.90676 1.66651 10.0013C1.66516 11.0959 1.8801 12.1799 2.29897 13.1911C2.71785 14.2023 3.33241 15.1208 4.10734 15.8938C4.88033 16.6687 5.79882 17.2833 6.81005 17.7022C7.82127 18.1211 8.9053 18.336 9.99984 18.3346Z"
                                                fill="white" stroke="white" stroke-width="2" stroke-linejoin="round" />
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M9.99967 4.58594C10.2759 4.58594 10.5409 4.69568 10.7362 4.89103C10.9316 5.08639 11.0413 5.35134 11.0413 5.6276C11.0413 5.90387 10.9316 6.16882 10.7362 6.36417C10.5409 6.55952 10.2759 6.66927 9.99967 6.66927C9.72341 6.66927 9.45846 6.55952 9.2631 6.36417C9.06775 6.16882 8.95801 5.90387 8.95801 5.6276C8.95801 5.35134 9.06775 5.08639 9.2631 4.89103C9.45846 4.69568 9.72341 4.58594 9.99967 4.58594Z"
                                                fill="black" />
                                            <path d="M10.2083 14.1693V8.33594H9.375M8.75 14.1693H11.6667" stroke="black"
                                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </mask>
                                        <g mask="url(#mask0_69_2124)">
                                            <path d="M0 0H20V20H0V0Z" fill="#5F22C1" />
                                        </g>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_69_2124">
                                            <rect width="20" height="20" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                Выберите регион, чтобы увидеть больше объектов
                            </div>
                            <svg ref="svgRoot" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
                                id="svgRoot" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.2" baseProfile="tiny"
                                x="0px" y="0px" viewBox="0 0 1000 600" xml:space="preserve"
                                xmlns:xml="http://www.w3.org/XML/1998/namespace">
                                <g id="viewport" ref="svgGroup">
                                    <path
                                        d="m 130.24729,259.26463 -0.71301,-1.3323 -0.83965,1.13893 -1.20312,0.61639 -0.3652,1.98343 -2.7566,-1.20341 -1.29507,1.2557 -1.79887,-1.96928 -0.51738,2.08913 -1.70104,0.51357 0.48353,2.36036 1.41813,-1.06374 1.07846,1.34199 2.31013,-0.11587 0.63117,-1.4221 0.77636,1.28888 1.63087,-0.86752 1.60105,1.08107 2.52028,-0.21377 0.38854,-1.63667 -0.76508,-2.45949 0.30997,-0.96605 c -0.75062,0.0982 -0.83803,-0.13605 -1.19347,-0.41925 z"
                                        data-title="Москва" data-code="RU-MOW"></path>
                                    <path
                                        d="m 136.30673,181.67516 -2.95955,-0.98651 -3.94605,0.98651 -0.98652,3.94606 0.98652,2.95954 3.94605,1.97303 2.95955,-1.97303 1.97302,-2.95954 -1.97302,-3.94606 z"
                                        data-title="Санкт-Петербург" data-code="RU-SPE"></path>
                                    <path
                                        d="m 305.00066,165.89094 -4.93257,0 -3.94605,3.94605 0.98651,3.94606 4.93257,0.98651 0.98652,0 0.98651,-0.98651 0.98651,0 0,0 0.98652,-0.98651 0,0.98651 0,0 -0.98652,0.98651 0,0 0.98652,0 0.98651,-0.98651 0,-3.94606 -1.97303,-3.94605 z m 45.37966,22.68982 1.97303,0.98652 0,0.98651 0,0.98652 0,0.98651 2.95954,1.97303 1.97303,-2.95954 -0.98652,-2.95955 -0.98651,-2.95954 0,0 0,-1.97303 -0.98651,-1.97303 -1.97303,0 0,1.97303 -0.98652,0 -0.98651,0 0,4.93257 z m -27.6224,-0.98651 -2.95954,-0.98651 -3.94606,-0.98652 -4.93257,0.98652 0,0 0.98651,0.98651 0,1.97303 -1.97303,0 -0.98651,-0.98652 0,-0.98651 0.98651,-0.98651 -2.95954,-0.98652 -2.95954,0 -0.98651,0 -0.98652,-0.98651 -5.91908,0.98651 -5.91909,-0.98651 -0.98651,-0.98652 0,-0.98651 0,0.98651 0,0 0,0.98652 -0.98652,0 0,0.98651 0,1.97303 0,0 -0.98651,-1.97303 -1.97303,-0.98651 -0.98652,-0.98652 -3.94605,2.95955 -3.94606,3.94605 -4.93257,-1.97303 -3.94606,-2.95954 0.98652,-2.95954 0.98651,-1.97303 -0.98651,-1.97303 -0.98652,-1.97303 3.94606,-1.97303 2.95954,-0.98651 4.93257,2.95954 0.98652,-0.98651 0.98651,-0.98652 0,-0.98651 0.98652,0 0,-2.95954 0,-2.95955 -2.95955,-3.94605 -3.94605,-2.95955 -0.98652,-2.95954 -0.98651,-0.98651 0,2.95954 0,4.93257 -5.91909,4.93257 -4.93257,3.94606 0,2.95954 0,2.95955 -3.94606,2.95954 -1.97302,1.97303 0,0.98651 0,1.97303 3.94605,5.91908 2.95954,5.91909 0.98652,1.97303 0.98651,0.98651 0,0.98652 1.97303,0 0,0 0,-0.98652 1.97303,-0.98651 1.97303,0 1.97303,0.98651 1.97303,1.97303 0,0 6.9056,0 7.89211,0.98652 1.97303,-0.98652 0.98651,-0.98651 0.98652,0.98651 0,0.98652 1.97303,-0.98652 1.97302,0 4.93258,3.94606 5.91908,4.93257 29.59543,17.75726 0.98651,0.98651 0.98652,0.98652 5.91908,-0.98652 6.9056,-1.97303 0,-0.98651 0.98652,-1.97303 0.98651,0.98651 0.98651,0 1.97303,-0.98651 1.97303,-0.98651 1.97303,-0.98652 1.97303,-0.98651 0.98651,-0.98652 0.98652,0 0.98651,0 1.97303,0.98652 1.97303,-2.95955 0,-1.97302 -0.98652,-0.98652 -1.97302,-2.95954 0.98651,-0.98652 0.98651,-0.98651 1.97303,-1.97303 0,-1.97303 -2.95954,-4.93257 -3.94606,-3.94606 -4.93257,-3.94605 -0.98651,-0.98652 -0.98652,-0.98651 -0.98651,0.98651 -0.98652,0.98652 0,0 -0.98651,-0.98652 -0.98651,0 -0.98652,0.98652 0,5.91908 -0.98651,5.91909 0,0 0,0 -0.98652,-0.98652 -0.98651,0 -1.97303,0.98652 -1.97303,-0.98652 -0.98651,0 -0.98652,1.97303 -2.95954,0.98652 -0.98651,-1.97303 0.98651,-1.97303 1.97303,-0.98651 0.98651,0 0,-1.97303 -0.98651,-1.97303 0.98651,0 -6.9056,-0.98652 -5.91908,0.98652 -1.97303,-2.95954 -5.91909,-1.97303 -3.94605,0.98651 0,0.98652 -0.98652,0.98651 -0.98651,-1.97303 -1.97303,0 -0.98651,0.98652 -0.98652,0 0,0 0.98652,-0.98652 0,-0.98651 0,-0.98652 -1.97303,-0.98651 -1.97303,0 0.98651,-0.98652 0,-0.98651 0.98652,0 0.98651,0 1.97303,0.98651 0.98651,-1.97302 0.98652,-1.97303 0.98651,0 0.98652,-0.98652 0,-0.98651 -0.98652,0 1.97303,0 1.97303,0 0,0 z"
                                        data-title="Ненецкий АО" data-code="RU-NEN"></path>
                                    <path
                                        d="m 157.02353,237.90648 0.98651,-0.98652 -2.95954,-0.98651 -0.98652,0.98651 0.98652,0.98652 1.97303,0 z m 6.9056,0.98651 -0.98652,0 -0.98651,0.98651 -2.95955,-1.97302 0,3.94605 -0.98651,2.95955 -1.97303,1.97302 0,-0.98651 0,-0.98651 0,-0.98652 -2.95954,0.98652 -0.98652,-0.98652 0.98652,-0.98651 0.98651,0 -0.98651,-5.91909 -1.97303,0 -1.97303,0.98652 0.98652,0.98651 -0.98652,0.98651 -0.98651,0.98652 -1.97303,0 0,0.98651 0,0.98652 -0.98652,1.97303 0,2.95954 0,1.97303 0.98652,0.98651 -2.95954,1.97303 -2.95955,2.95954 0,0.98652 0,0.98651 0,1.97303 2.95955,2.95954 2.95954,-0.98651 5.91908,-1.97303 4.93258,1.97303 5.91908,-3.94606 6.9056,-2.95954 0,-0.98652 0.98651,-1.97302 -3.94605,-4.93258 0,-4.93257 -2.95954,-2.95954 z"
                                        data-title="Ярославская область" data-code="RU-YAR"></path>
                                    <path
                                        d="m 255.67495,352.34213 m 0,0 0,2.95954 -1.97303,3.94606 0.98652,0.98651 0.98651,0.98652 -1.97303,0 -0.98651,0 -0.98652,0 -0.98651,0.98651 -0.98651,0 -1.97303,-0.98651 -0.98652,1.97303 -0.98651,0.98651 -0.98652,0 0,-0.98651 0,-0.98652 -0.98651,-0.98651 -1.97303,0.98651 0,-1.97303 0.98652,-0.98651 -2.95955,-2.95954 -2.95954,0.98651 -0.98651,0.98652 0,0.98651 -0.98652,0 0,0.98651 1.97303,6.9056 0,0.98652 1.97303,0 1.97303,0 0,0.98651 0.98651,0.98652 5.91909,0 4.93257,0 -1.97303,2.95954 -2.95954,2.95954 -0.98652,1.97303 -0.98651,-0.98651 -0.98652,-0.98652 -0.98651,0.98652 -1.97303,0 -0.98651,0 -0.98652,0 -2.95954,4.93257 -2.95954,4.93257 -0.98652,0.98651 -1.97303,1.97303 0,0.98652 0,0.98651 -0.98651,0 0,0.98651 0.98651,0.98652 0,0.98651 0,0.98652 0.98652,0 0.98651,-0.98652 2.95955,1.97303 2.95954,1.97303 -1.97303,1.97303 -1.97303,1.97303 0.98652,0 3.94605,0.98651 3.94606,-0.98651 0.98651,-2.95955 0,-1.97302 0.98652,-0.98652 0.98651,0 0.98652,-0.98651 0.98651,0 3.94606,1.97303 2.95954,1.97302 -1.97303,-3.94605 -1.97303,-2.95955 1.97303,-1.97302 1.97303,0 -1.97303,-0.98652 -1.97303,-1.97303 0.98652,0 0.98651,-0.98651 0.98652,-0.98652 -0.98652,-0.98651 0.98652,0 0.98651,0 0.98652,0 0.98651,0 0,0.98651 0.98651,0.98652 2.95955,0.98651 1.97302,0.98652 0,0.98651 0.98652,0.98652 0.98651,-0.98652 2.95955,0 2.95954,0.98652 0,-0.98652 0,0 0,-0.98651 -0.98652,-0.98652 1.97303,-1.97303 0,-1.97302 -2.95954,-1.97303 -3.94606,-2.95955 1.97303,-1.97302 0.98652,-0.98652 0.98651,-1.97303 0,-0.98651 0.98651,0 0.98652,-0.98651 0.98651,0 0.98652,0 0.98651,-3.94606 0,-4.93257 -0.98651,-1.97303 0,-0.98652 -0.98652,-0.98651 -1.97303,-0.98651 0,0 -0.98651,0 -0.98651,0.98651 -4.93258,-2.95954 -4.93257,-3.94606 0,-0.98651 -0.98651,0 -0.98651,0 -0.98652,0.98651 z"
                                        data-title="Челябинская область" data-code="RU-CHE"></path>
                                    <path
                                        d="m 178.72684,324.71973 -0.98652,-1.97303 -3.94605,-0.98651 0,-1.97303 -2.95955,-1.97303 -1.97302,-2.95954 -3.94606,5.91908 -1.97303,-0.98651 -3.94606,0 0.98652,3.94606 -0.98652,3.94605 0.98652,1.97303 0,1.97303 -2.95954,3.94606 -2.95955,1.97303 2.95955,4.93257 5.91908,0 0.98652,0.98651 0,0.98652 1.97302,-2.95955 1.97303,-4.93257 0.98652,0 1.97302,0 1.97303,-0.98651 0.98652,0 1.97303,0.98651 1.97302,0 1.97303,1.97303 2.95955,1.97303 0,-0.98652 0.98651,0 0.98651,0 0.98652,0 1.97303,-2.95954 0.98651,-1.97303 -1.97303,-2.95954 0,-2.95954 -0.98651,-1.97303 -2.95954,0 -1.97303,0 -1.97303,-1.97303 z"
                                        data-title="Ульяновская область" data-code="RU-ULY"></path>
                                    <path
                                        d="m 337.55563,344.45002 -3.94605,0.98651 -0.98652,0.98651 0,0.98652 -1.97303,0 -1.97302,-0.98652 -1.97303,0 -2.95955,0 -0.98651,-0.98651 -0.98651,0 -1.97303,0.98651 -0.98652,1.97303 -2.95954,0 -2.95954,-0.98651 0,1.97303 -0.98652,0.98651 0,1.97303 0,1.97303 -1.97303,0.98651 -1.97302,0 -1.97303,0 0,0 0,-0.98651 -2.95954,0 -1.97303,0.98651 -1.97303,3.94606 -0.98652,4.93257 0,0.98652 0.98652,0 -0.98652,0.98651 -0.98651,0 -0.98651,0 -0.98652,2.95954 0,2.95955 1.97303,0.98651 1.97303,0.98651 0,1.97303 0,1.97303 0.98651,0 1.97303,0 0,0.98651 0.98652,0.98652 0.98651,-0.98652 0.98651,0.98652 1.97303,2.95954 0.98652,2.95954 0.98651,0.98652 1.97303,0.98651 0,0 0.98651,0 0.98652,2.95955 1.97303,3.94605 0,0 0.98651,0 0,-0.98651 0.98651,0.98651 0,0.98652 0.98652,0 1.97303,0.98651 1.97303,1.97303 0.98651,1.97303 1.97303,0 0.98651,-0.98652 0,-1.97302 0.98652,0 1.97303,-0.98652 -0.98652,-0.98651 0,-0.98652 0.98652,0 0.98651,0 0,-0.98651 -0.98651,-0.98652 0.98651,-0.98651 1.97303,-0.98651 0,-0.98652 0.98651,-0.98651 0,0 0.98652,0 0,-0.98652 0,-0.98651 0.98651,-0.98652 0.98652,0 0,-0.98651 0,-0.98651 0,-0.98652 1.97302,0.98652 2.95955,-0.98652 -0.98652,-6.9056 0,-0.98651 -0.98651,0 -1.97303,0 -0.98651,-0.98652 0.98651,-0.98651 1.97303,-0.98651 0,-2.95955 0,-2.95954 2.95954,-1.97303 2.95954,-1.97303 0.98652,0.98652 0.98651,1.97303 -0.98651,0.98651 0,1.97303 1.97303,0 1.97303,0.98651 1.97302,0.98652 2.95955,1.97303 0.98651,-0.98652 1.97303,0 6.9056,1.97303 7.89211,-2.95954 -1.97303,-1.97303 -2.95954,0 -0.98651,-0.98652 -0.98652,-0.98651 -2.95954,-1.97303 -1.97303,-0.98651 0,-1.97303 0.98652,-2.95954 -1.97303,0 -1.97303,-1.97303 0.98651,-0.98652 0,-0.98651 -0.98651,-0.98652 -0.98652,0 -0.98651,-3.94605 -1.97303,-2.95955 -0.98651,-0.98651 -0.98652,0 -0.98651,-0.98651 -2.95954,-0.98652 -0.98652,0 -1.97303,0 -0.98651,-0.98651 -0.98651,-1.97303 -1.97303,0 -0.98652,0.98651 -1.97303,2.95955 z"
                                        data-title="Тюменская область" data-code="RU-TYU"></path>
                                    <path
                                        d="m 114.40611,270.46145 -1.57842,0 -0.29596,0.98651 -1.08516,0.98652 -0.78921,0 -0.49326,-0.98652 -2.36765,-0.98651 -2.26898,-0.98652 -0.29595,0 -0.39461,0.98652 -1.97304,0 -1.67707,0.98651 -0.49326,0.98652 -0.69056,0.98651 0.69056,4.93257 2.17033,3.94606 1.08517,0.98651 0.98652,0.98652 -0.1973,1.97302 0.0987,2.95955 1.67708,1.97303 1.28246,0.98651 1.87439,0 0.39461,-0.98651 0.78921,-0.98652 0.78921,0 0.78921,0 1.28247,-0.98651 1.57842,0 4.83392,-7.89212 -0.0986,-1.97302 1.47977,-1.97303 0.98652,0 -0.98652,-0.98652 0,-0.98651 0,-1.97303 0,-0.98651 -1.47977,0 -2.07168,-2.95955 0,0 -1.18382,0 -1.38112,0.98652 -0.98651,0 z"
                                        data-title="Тульская область" data-code="RU-TUL"></path>
                                    <path
                                        d="m 304.01415,296.11082 -2.95954,-1.97303 -2.95955,-1.97303 0,-1.97303 0,-0.98651 -0.98651,-0.98652 0,-0.98651 -1.97303,0.98651 0,0.98652 -2.95954,3.94605 -1.97303,3.94606 0,0.98652 0,0.98651 -4.93257,4.93257 -4.93257,4.93257 -1.97303,0.98652 -1.97303,0.98651 -2.95954,2.95954 1.97303,4.93258 -1.97303,2.95954 0,2.95954 0,0.98652 0,0 -2.95955,2.95954 -4.93257,0.98651 -0.98651,2.95954 0,1.97303 -2.95954,0 -1.97303,-1.97303 -1.97303,1.97303 -1.97303,2.95955 -4.93257,0 -1.97303,0.98651 0,0 0,0.98651 -0.98651,2.95955 -1.97303,1.97303 0,0.98651 0,1.97303 0.98651,0 0.98652,0.98651 3.94605,1.97303 2.95955,1.97303 0.98651,0 0,0 0.98652,-0.98651 0.98651,0 0.98651,0 0,0.98651 4.93257,3.94606 4.93258,2.95954 0.98651,-0.98651 0.98651,0 0,0 1.97303,0.98651 0.98652,0.98651 0,0.98652 0.98651,1.97303 2.95954,-1.97303 2.95955,-0.98652 1.97303,0.98652 1.97302,1.97303 0.98652,0 0,0 0.98651,0 0.98652,0.98651 1.97303,1.97303 2.95954,-1.97303 4.93257,0 -0.98651,1.97303 0.98651,0 0.98651,0 0.98652,-0.98651 -0.98652,0 0,-0.98652 0.98652,-4.93257 1.97303,-3.94606 1.97303,-0.98651 2.95954,0 0,0.98651 0,0 1.97303,0 1.97302,0 1.97303,-0.98651 0,-1.97303 0,-1.97303 0.98652,-1.97303 0,-0.98651 0,-1.97303 -0.98652,-0.98651 0,-4.93258 0,-3.94605 -2.95954,-1.97303 -2.95954,-2.95954 0.98651,-2.95955 0.98652,-3.94605 0,-1.97303 -0.98652,-0.98652 0,0 0,-2.95954 0,-1.97303 0.98652,-3.94605 1.97302,-3.94606 -1.97302,-2.95954 -0.98652,-1.97303 -2.95954,-6.9056 z"
                                        data-title="Свердловская область" data-code="RU-SVE"></path>
                                    <path
                                        d="m 136.30673,279.34008 -1.97303,-0.98652 0,0.98652 -0.98652,0 -0.98651,0 -0.98652,0 -2.95954,0 -1.97303,0.98651 -0.98651,0 -0.98652,-0.98651 -0.98651,0.98651 -1.97303,0.98651 -1.38112,0 -4.83392,7.89212 0.69056,1.97303 0,1.97302 2.17033,0 2.26899,0.98652 -0.29596,1.97303 0.39461,1.97303 1.97303,0.98651 2.95954,0 0.98651,1.97303 0.98652,0.98651 1.97303,0 0.98651,-0.98651 5.91909,2.95954 0.98651,0 0.98651,0 0.98652,-0.98651 0,0 0,-0.98652 0.98651,0.98652 1.97303,0 0,0 -0.98651,-1.97303 -1.97303,0 1.97303,-0.98652 1.97303,0 0.98651,-0.98651 1.97303,-0.98651 0,-1.97303 0,0 0.98651,-1.97303 0,-1.97303 -1.97303,-0.98651 -0.98651,0 0,0 0.98651,-0.98652 0,-0.98651 0,-0.98652 -3.94605,-4.93257 -2.95955,-3.94605 -1.97302,0 z"
                                        data-title="Рязанская область" data-code="RU-RYA"></path>
                                    <path
                                        d="m 100.00298,273.42099 -3.946056,-0.98651 -3.946057,-0.98652 -0.394606,0.98652 -0.69056,0 -2.170331,0.98651 -1.578423,0 -0.394606,0.98651 -0.295954,1.97303 -2.367634,0.98652 -1.085166,1.97303 1.282468,0.98651 1.677075,0.98651 0,0.98652 0,1.97303 2.564937,0.98651 1.874377,0.98651 0.09865,1.97303 0.197303,2.95955 0.986514,0.98651 0.986515,0.98651 -0.295955,0.98652 0,1.97303 0.789212,0 0.69056,0 0.295954,0.98651 0.69056,0 3.255497,-0.98651 1.183818,0.98651 0.295954,-1.97303 -0.09865,-0.98651 0.493254,-0.98652 0.59191,-1.97302 4.14337,-1.97303 -0.0987,-2.95955 0.1973,-1.97302 -0.98652,-0.98652 -1.08517,-0.98651 -2.17033,-4.93257 -0.69056,-3.94606 z"
                                        data-title="Орловская область" data-code="RU-ORL"></path>
                                    <path
                                        d="m 372.08363,371.0859 m 0,-0.98651 -7.89211,2.95954 -6.9056,-1.97303 -1.97303,0 -0.98651,0.98652 -2.95955,-1.97303 -1.97302,-0.98652 -1.97303,-0.98651 -1.97303,0 0,-1.97303 0.98651,-0.98651 -0.98651,-1.97303 -0.98652,-0.98652 -2.95954,1.97303 -2.95954,1.97303 0,3.94606 0,1.97303 -1.97303,0.98651 -0.98651,0.98651 0.98651,0.98652 1.97303,0 0.98651,0 0,0.98651 0.98652,7.89212 -2.95955,0 -1.97302,-0.98652 0,0.98652 0,0.98651 0,0.98651 -0.98652,0 -0.98651,0.98652 0,0.98651 0,0.98652 -0.98652,0 0,0 -0.98651,0.98651 0,0.98652 -1.97303,0.98651 -0.98651,0.98651 0.98651,0.98652 -0.98651,0.98651 0,0 -0.98652,0 0,0.98652 0.98652,0.98651 -1.97303,0.98652 -0.98652,0 0,1.97302 1.97303,2.95955 -0.98651,4.93257 0,1.97303 0.98651,0 -2.95954,3.94605 0.98651,1.97303 0.98652,0.98652 0.98651,0.98651 0.98652,0 0.98651,-0.98651 0.98651,0 0,0.98651 0.98652,0 0,-0.98651 0.98651,-0.98652 0,2.95955 0,3.94605 1.97303,-0.98651 0,-0.98652 1.97303,0.98652 1.97303,1.97303 0.98651,0.98651 1.97303,0 0,0.98651 -0.98651,0.98652 -1.97303,-0.98652 -1.97303,2.95955 0.98651,1.97303 1.97303,-0.98652 4.93257,2.95954 0.98652,0 3.94606,-1.97302 2.95954,0 1.97303,-1.97303 1.97302,0 0.98652,-2.95955 0.98651,-1.97302 0.98652,-0.98652 0,-0.98651 -0.98652,-2.95954 -0.98651,-1.97303 0.98651,-4.93257 1.97303,-1.97303 -0.98651,-0.98652 0,-1.97303 0.98651,0 0.98652,0 0,0 1.97302,-1.97302 1.97303,-0.98652 2.95955,0 0.98651,0 0,-1.97303 -0.98651,-1.97303 0.98651,-1.97302 1.97303,-0.98652 0,-0.98651 0,-0.98652 0.98651,-1.97303 0.98652,-0.98651 0,-1.97303 -0.98652,-0.98651 -0.98651,-1.97303 0.98651,-0.98652 0,-0.98651 0,-0.98651 -0.98651,-1.97303 0,-0.98652 0,-0.98651 0,-1.97303 -0.98652,-0.98651 0,-0.98652 0.98652,0 0,-0.98651 0,-1.97303 0.98651,0 0,-1.97303 z"
                                        data-title="Омская область" data-code="RU-OMS"></path>
                                    <path
                                        d="m 127.4281,199.43242 0,-0.98651 -2.95955,0 -1.97302,0.98651 -0.98652,-1.97303 -1.38112,-0.98651 -1.87437,0.98651 -1.57843,0 -4.93257,1.97303 0.69056,3.94606 0.98652,2.95954 -0.88787,0.98651 -1.18381,0 -0.0987,0.98652 -0.1973,0.98651 -2.95955,0.98652 -0.49326,1.97303 -1.77572,1.97302 0.1973,1.97303 1.28247,1.97303 1.38112,0.98652 5.52449,1.97302 5.42583,0.98652 1.87437,0.98651 0.98652,0.98652 0,0 2.95954,-0.98652 2.95954,-0.98651 0.98652,-0.98652 0.98651,-0.98651 2.95954,1.97303 1.97303,2.95954 0,0 0.98652,0 0.98651,0.98652 1.97303,0.98651 0.98651,-0.98651 0.98652,0 1.97303,0.98651 0.98651,1.97303 0.98651,0 1.97303,0.98651 0,-2.95954 0,-2.95954 -0.98651,-0.98652 -0.98652,0 0,-0.98651 -0.98651,0 0,-1.97303 0.98651,-2.95954 -1.97302,-2.95955 -0.98652,-1.97302 0,-2.95955 -1.97303,-1.97303 0,-0.98651 -0.98651,-0.98651 -1.97303,0 -1.97303,0 0,-1.97303 0,-1.97303 -0.98651,-0.98652 -0.98652,-0.98651 0,0 0,-0.98651 -1.97303,0.98651 -1.97302,0.98651 -1.97303,-0.98651 z"
                                        data-title="Новгородская область" data-code="RU-NGR"></path>
                                    <path
                                        d="m 115.29397,289.20522 -1.57842,0 -1.28247,0.98651 -0.78921,0 -0.78921,0 -0.78921,0.98652 -0.39461,0.98651 -1.87439,0 -1.28246,-0.98651 -1.67708,-1.97303 -2.17034,0.98651 -1.97303,0.98652 -0.59191,1.97302 -0.493254,0.98652 0.09865,1.97303 -0.295954,0.98651 -1.183818,-0.98651 -3.255497,0.98651 0.591909,1.97303 1.874377,1.97303 2.762237,0.98651 2.36764,0.98652 0,0.98651 -0.0987,0 0.88786,0.98652 1.18383,0 0.88786,1.97302 -0.29595,0.98652 2.46628,1.97303 2.6636,2.95954 1.87438,-0.98651 1.57842,-0.98652 -0.98651,-5.91908 3.4528,-3.94606 4.34066,-2.95954 -0.39461,-1.97303 0.29596,-1.97303 -2.26899,-0.98652 -2.17033,0 0,-1.97302 -0.69056,-1.97303 z"
                                        data-title="Липецкая область" data-code="RU-LIP"></path>
                                    <path
                                        d="m 86.09313,282.29962 0,-0.98652 -1.677075,-0.98651 -1.282468,-0.98651 -2.466286,0 -0.394605,0 -0.591909,0 -0.493257,0 -0.69056,0.98651 -1.775726,-1.97303 -1.874377,1.97303 -0.986514,0.98651 -1.775726,-0.98651 -0.295954,0.98651 -0.197303,0.98652 -2.466285,1.97303 1.677074,2.95954 2.268983,2.95954 -0.295955,0.98652 -0.493257,0.98651 0.493257,0 0.295955,0.98651 -0.493258,0 -0.493257,0.98652 1.874377,1.97303 2.268983,0 0.591909,0 0.69056,0 0.887863,1.97303 1.085165,0.98651 4.636617,1.97303 5.919086,2.95954 0.887863,0.98652 0.887862,1.97302 1.38112,-1.97302 1.085166,-1.97303 1.282469,0.98651 1.183817,0 0.295954,0 0,-0.98651 0.591909,-0.98652 -0.197303,-0.98651 0,0 -1.874377,-1.97303 -0.591909,-1.97303 -0.69056,0 -0.295954,-0.98651 -0.69056,0 -0.789212,0 0,-0.98652 0.295955,-0.98651 -0.986515,-1.97303 -0.986514,-0.98651 -0.197303,-2.95955 -0.09865,-1.97303 -1.874377,-0.98651 -2.564937,-0.98651 0,-1.97303 z"
                                        data-title="Курская область" data-code="RU-KRS"></path>
                                    <path
                                        d="m 296.12204,366.15333 m 0.98651,-1.97303 -4.93257,0.98652 -2.95954,0.98651 -1.97303,-1.97303 -0.98652,-0.98651 -0.98651,0 0,0 -0.98652,0 -1.97302,-1.97303 -1.97303,-0.98652 -2.95955,0.98652 -2.95954,1.97303 0,4.93257 -0.98651,3.94606 -0.98652,0 -0.98651,0 -0.98652,0.98651 -0.98651,0 0,0.98651 -0.98651,1.97303 -0.98652,0.98652 -1.97303,1.97302 3.94606,2.95955 2.95954,1.97303 0,1.97302 -1.97303,0.98652 0.98652,0.98651 0,0.98652 0,0.98651 0,0.98652 4.93257,0.98651 4.93257,0.98651 1.97303,0.98652 0.98651,0.98651 0.98652,-0.98651 0.98651,-0.98652 1.97303,0 2.95954,0.98652 0.98652,0.98651 7.89211,0.98652 7.89212,0.98651 0.98651,-0.98651 0.98651,-0.98652 0.98652,0 1.97303,0.98652 0.98651,-0.98652 0.98652,0 -1.97303,-3.94605 -0.98652,-2.95955 -0.98651,0 0,0 -1.97303,-0.98651 -0.98651,-0.98652 -0.98652,-2.95954 -1.97303,-2.95954 -0.98651,-0.98652 -0.98651,0.98652 -0.98652,-0.98652 0,-0.98651 -1.97303,0 -0.98651,0 0,-1.97303 0,-1.97303 -1.97303,-0.98651 -1.97303,-0.98651 0,-3.94606 0.98652,-1.97303 z"
                                        data-title="Курганская область" data-code="RU-KGN"></path>
                                    <path
                                        d="m 32.525406,170.82351 m -1.677075,0 m -0.69056,0 0,0 2.367635,0 0,0 z m 4.439315,-0.98652 1.183817,-0.98651 -1.183817,0.98651 -1.085166,0.98652 0.09865,0 0.986515,-0.98652 z m 9.766491,2.95955 0,0 -5.623132,-0.98652 -1.381119,-1.97303 -1.578423,-0.98651 -1.183817,0.98651 -0.986515,0.98652 0.394606,0 1.085166,2.95954 -2.268983,-0.98651 -2.959543,-0.98652 4.14336,7.89212 4.735268,6.9056 2.76224,3.94605 0.493258,0 0.394605,0 1.085166,-0.98651 3.4528,-0.98652 -0.887863,-6.9056 -0.295954,-2.95954 -0.09865,-2.95954 -0.493257,-0.98652 -0.591908,0 -0.69056,0 -1.085166,0.98652 -1.085166,0.98651 -1.775725,-1.97303 -0.69056,-1.97302 0.493257,0 0.69056,0 3.058194,0 0.887863,0 z"
                                        data-title="Калининградская область" data-code="RU-KGD"></path>
                                    <path
                                        d="m 172.80775,269.47493 -1.97303,-0.98651 -1.97302,-0.98652 -0.98652,-1.97302 -0.98651,-1.97303 -0.98652,0.98651 -1.97302,0.98652 -6.9056,-3.94606 -4.93258,-1.97303 -4.93257,1.97303 0,0 0.98652,2.95954 -0.98652,3.94606 1.97303,0 1.97303,0 0.98651,1.97303 0.98652,1.97303 2.95954,2.95954 0.98652,0 0,0 0,1.97303 0,0.98651 1.97302,0.98652 1.97303,0.98651 0.98652,0 0.98651,0.98651 0.98652,-0.98651 1.97302,-1.97303 1.97303,0.98652 1.97303,0.98651 1.97303,-0.98651 0.98651,-1.97303 1.97303,-0.98652 0.98652,0 0,-0.98651 -1.97303,-2.95954 -2.95955,0 0.98652,-0.98652 0.98651,-1.97303 z"
                                        data-title="Ивановская область" data-code="RU-IVA"></path>
                                    <path
                                        d="m 83.922798,256.65025 -0.986514,0.98651 -1.085166,0 -0.69056,0 -0.295954,0 -0.986514,0 -0.986514,0 -1.874377,-0.98651 -2.07168,0 -1.677075,-2.95955 -2.959542,-0.98651 -0.887863,0.98651 -0.295954,1.97303 -0.591909,0.98652 -0.69056,0 -1.479771,1.97303 -1.578423,1.97302 -0.887863,1.97303 -0.69056,0 0.789211,0.98652 -0.197302,0.98651 0.591908,0 2.466286,0.98652 1.874377,-0.98652 0.887863,0.98652 0.591908,1.97302 1.874377,0.98652 1.578423,0.98651 2.367634,2.95955 0.295955,2.95954 -1.282469,1.97303 -0.197303,2.95954 1.874377,-1.97303 1.775726,1.97303 0.69056,-0.98651 0.493257,-0.98652 0.591909,0.98652 0.394605,0 2.466286,-0.98652 1.085166,-0.98651 2.367634,-0.98652 0.295954,-1.97303 0.394606,-1.97302 1.578423,0.98651 2.170331,-0.98651 0.69056,0 0.394606,-0.98652 -2.268983,-3.94606 0.986514,-1.97302 1.578423,-0.98652 -0.986514,-4.93257 -0.591909,-3.94606 -3.4528,0.98652 -3.4528,0 z"
                                        data-title="Брянская область" data-code="RU-BRY"></path>
                                    <path
                                        d="m 113.8142,372.07242 -1.28247,0 -1.08516,-0.98652 -0.19731,0.98652 -0.1973,0 -0.78921,-0.98652 -1.28248,0 -1.67707,0.98652 0.98651,1.97302 0.59191,2.95955 1.18383,0.98651 0.78921,0.98651 -1.28248,0.98652 -0.88786,1.97303 0.29595,2.95954 0.98653,1.97303 2.56493,0 2.07168,1.97303 -1.67707,0 -2.17033,0.98651 -0.49326,4.93257 -0.39461,3.94606 -3.55146,0.98651 -3.65011,0 0.1973,0.98652 0.98652,0.98651 -0.39461,0.98652 -0.29595,0.98651 0.98652,0.98652 0.69056,0.98651 -3.35416,0.98651 -0.88786,2.95955 0.39461,0.98651 0.3946,0 0.78921,0 0.78921,0 0.69056,0.98652 0.69057,0.98651 0,0.98651 0.29596,0 0,0 0.29595,0 0.39461,0 -0.1973,0.98652 0.1973,0 0.69056,0 0.59191,-0.98652 2.86089,1.97303 0.0987,0.98652 0.0987,0 1.08517,-0.98652 0.29595,0 0.1973,0 -0.1973,0.98652 0.69056,-0.98652 0.98652,-0.98651 0.5919,0.98651 -0.0986,0.98652 -0.78921,0.98651 -0.3946,0.98652 1.18381,-0.98652 1.18382,-0.98651 2.76224,-1.97303 2.86089,-0.98652 0.49326,0.98652 -1.77573,-7.89212 0.59191,0 1.18382,1.97303 1.97303,0 0.98651,-6.9056 0,-7.89211 -1.97303,-1.97303 -1.57842,-1.97303 -0.98651,0.98652 -0.98652,-0.98652 0.88786,-2.95954 1.67708,-1.97303 -0.39461,-2.95954 -0.98651,-2.95955 2.36763,-1.97302 -0.98651,-1.97303 -0.59191,-1.97303 -2.95954,-0.98651 -3.15685,0 z"
                                        data-title="Астраханская область" data-code="RU-AST"></path>
                                    <path
                                        d="m 817.98808,309.92202 -1.97303,-1.97303 -0.98652,-0.98652 -0.98651,0.98652 -0.98651,0.98651 -0.98652,-0.98651 -1.97303,0 -0.98651,1.97303 -1.97303,2.95954 -0.98651,-0.98651 -0.98652,-0.98652 -0.98651,0.98652 -1.97303,0 -4.93257,-1.97303 -3.94606,0 -0.98651,5.91908 0,5.91909 -0.98652,0.98651 -1.97303,0.98652 0,0.98651 0,0.98652 -0.98651,0.98651 -0.98652,0.98651 0,0.98652 0,0.98651 -0.98651,3.94606 1.97303,2.95954 0.98651,4.93257 0.98652,3.94606 1.97303,1.97303 0.98651,2.95954 -0.98651,0.98652 -1.97303,-1.97303 -0.98652,0.98651 -0.98651,0.98652 -0.98652,3.94605 -3.94605,2.95955 0,0 -1.97303,0.98651 -0.98652,0 -1.97302,-0.98651 0,0 -0.98652,0.98651 0,1.97303 0,0.98651 -0.98651,0.98652 -4.93257,1.97303 -4.93257,1.97302 -0.98652,0 -0.98651,0 -1.97303,1.97303 -0.98652,1.97303 -0.98651,5.91909 -0.98651,2.95954 0.98651,3.94606 -1.97303,0 -0.98651,0 1.97303,2.95954 2.95954,1.97303 -0.98652,0.98651 -0.98651,0.98652 0,0.98651 0,1.97303 -1.97303,0.98651 -0.98651,1.97303 0.98651,0 0.98652,0 0.98651,0.98652 1.97303,0.98651 0.98651,1.97303 0,1.97303 -0.98651,0.98651 -1.97303,0 0,4.93257 -0.98651,4.93257 3.94605,0.98652 2.95955,-1.97303 0.98651,0.98651 0.98651,0 1.97303,-0.98651 0.98652,-0.98651 1.97302,0.98651 0.98652,0.98651 0.98651,0 0.98652,0 -0.98652,2.95955 -1.97303,1.97303 0,0.98651 0,0.98651 -1.97302,1.97303 -1.97303,1.97303 -0.98652,0.98651 -0.98651,0.98652 0,2.95954 0,2.95954 -2.95954,1.97303 0,3.94606 2.95954,0.98651 3.94606,0 1.97302,1.97303 1.97303,2.95955 0.98652,0 0.98651,0 0.98652,0 0.98651,0 0,0 0.98651,-0.98652 1.97303,-0.98651 3.94606,-1.97303 1.97303,-1.97303 0.98651,-1.97303 1.97303,0 2.95954,-0.98651 0.98652,-0.98652 0.98651,0 0,-0.98651 2.95955,0.98651 0.98651,3.94606 0,3.94606 0.98651,1.97303 0,1.97302 -0.98651,0.98652 -3.94606,0 -4.93257,0.98651 0,0 0.98652,1.97303 0,3.94606 -1.97303,0.98651 -1.97303,0.98652 -0.98652,0.98651 -0.98651,1.97303 0,0.98651 0,0.98652 -2.95954,1.97303 -2.95955,1.97303 0.98652,1.97302 0,0.98652 -0.98652,1.97303 -0.98651,2.95954 0,2.95954 0,2.95954 0.98651,-0.98651 0,0 0.98652,0.98651 0,0.98652 0.98651,0 0.98652,-0.98652 0.98651,0.98652 0,0.98651 0.98652,0 1.97302,0.98652 0,3.94605 0,2.95955 0.98652,2.95954 0,2.95954 3.94606,-1.97303 0,0 0.98651,0 0,0 0.98651,-0.98651 0.98652,-1.97303 1.97303,0 1.97303,0.98652 1.97302,-0.98652 1.97303,0 0,0 0.98652,0.98652 1.97303,2.95954 1.97302,0 1.97303,0.98651 1.97303,0 0.98652,0 0.98651,-1.97303 1.97303,0 1.97303,0 0.98651,0 1.97303,-0.98651 0.98651,1.97303 0,0 0.98652,1.97303 -2.95955,1.97303 -0.98651,1.97302 0.98651,1.97303 0.98652,0.98652 1.97303,1.97303 -1.97303,2.95954 -0.98652,0.98651 0,4.93257 0.98652,4.93257 1.97303,-1.97302 0,-1.97303 0.98651,-2.95954 1.97303,-2.95955 0.98651,0 0.98652,0.98652 0.98651,-0.98652 0.98652,0.98652 0,0.98651 0,0.98652 0.98651,-0.98652 0.98652,-0.98651 0.98651,0.98651 0.98651,0.98652 4.93258,-1.97303 3.94605,-2.95955 0,-1.97302 0,-1.97303 3.94606,-1.97303 1.97303,-5.91909 -1.97303,0 -1.97303,0 -0.98651,-0.98651 0,-0.98652 -0.98652,-0.98651 -0.98651,-0.98651 0,-0.98652 0.98651,0 0,0 0.98652,0 1.97303,-2.95954 3.94605,-1.97303 0,0 0,0.98651 1.97303,1.97303 1.97303,1.97303 -0.98651,1.97303 0,1.97303 1.97302,0.98651 2.95955,0 1.97303,-8.87863 1.97302,-6.9056 0,-0.98651 -0.98651,-1.97303 0,-0.98651 0,-1.97303 0,-0.98652 -0.98651,-0.98651 0,-2.95954 -0.98652,-2.95954 -0.98651,-1.97303 -0.98652,-1.97303 0,-1.97303 0,-0.98651 0,0 0,0 -4.93257,-13.8112 0,-0.98652 0,-0.98651 0.98652,-4.93257 -0.98652,-3.94606 0.98652,-1.97303 -0.98652,-0.98651 -0.98651,0.98651 -1.97303,-2.95954 0,-2.95955 -0.98652,0 -0.98651,-0.98651 -3.94606,-1.97303 0,0 0.98652,0 1.97303,0 0.98651,-1.97303 -0.98651,-1.97302 -1.97303,0 -1.97303,-0.98652 0,0 -0.98652,-0.98651 -2.95954,0 -2.95954,-1.97303 0,-0.98652 -1.97303,-0.98651 0,0 -0.98651,0 -0.98652,-0.98651 -1.97303,0 -0.98651,0.98651 -0.98652,0.98651 -2.95954,0.98652 -1.97303,0 0,0 0.98652,0 0.98651,1.97303 0,3.94605 0,3.94606 -0.98651,-1.97303 0,-2.95954 0,-0.98651 0,0 -1.97303,3.94605 -4.93257,4.93257 0,-2.95954 1.97303,-3.94606 -0.98652,0 -0.98651,0.98652 -0.98652,0 -1.97302,-0.98652 0.98651,-0.98651 0.98651,-0.98651 0,-0.98652 -2.95954,2.95954 0.98652,0.98652 0,1.97303 0,0.98651 -0.98652,0 -0.98651,0 0,0.98651 0,0 -1.97303,-4.93257 -2.95954,-4.93257 -6.9056,2.95955 -4.93258,-1.97303 1.97303,-2.95955 0.98652,-1.97302 1.97303,-2.95955 0.98651,-2.95954 0.98651,-1.97303 0.98652,-0.98651 2.95954,-4.93257 0.98652,-5.91909 0.98651,-0.98651 0.98651,-0.98652 0,-0.98651 -0.98651,-0.98652 0.98651,-1.97303 0,-2.95954 0.98652,-0.98651 1.97303,-4.93257 1.97303,-3.94606 0.98651,-1.97303 0,-1.97303 0.98651,-0.98651 0.98652,-1.97303 0,-1.97303 0,-2.95954 0.98651,-3.94606 1.97303,-1.97303 0.98651,-7.89211 4.93258,-6.9056 0.98651,0 0.98651,-0.98652 0.98652,-0.98651 0.98651,-0.98651 4.93257,-1.97303 4.93258,-2.95955 0.98651,0 0.98651,-0.98651 0.98652,0 0,1.97303 1.97303,0.98651 0.98651,-1.97303 -0.98651,-2.95954 1.97303,0 1.97302,0 0,-1.97303 0,-0.98651 -2.95954,-2.95954 -3.94606,-1.97303 -3.94605,0 -2.95955,-0.98652 0,-3.94605 2.95955,-0.98652 -0.98652,-1.97303 0,-0.98651 0,-0.98651 0.98652,-0.98652 -2.95955,-4.93257 -5.91908,-3.94606 -3.94606,0.98652 -4.93257,0.98651 0,2.95954 -0.98651,2.95955 z"
                                        data-title="Хабаровский край" data-code="RU-KHA"></path>
                                    <path
                                        d="m 73.959004,415.47904 -0.394605,-0.98651 -1.479772,0.98651 -2.170331,0.98652 -0.887863,0 0.789212,0.98651 2.170331,0.98652 -2.07168,4.93257 -0.09865,0 0,0 0,0 -0.09865,0 -0.394606,0.98651 0,0 -3.156845,0.98651 -2.76224,-0.98651 -0.394606,-0.98651 -0.591908,0 -1.282469,0 -0.493257,0 0.295954,0.98651 -0.197303,0.98651 1.38112,0 1.578423,1.97303 0.493257,1.97303 0.197303,0.98652 1.085166,0.98651 1.085165,1.97303 2.07168,-0.98652 2.170332,0 1.085165,0.98652 0.394606,-0.98652 0.493257,0 1.479772,0 1.578422,0 0.986515,-1.97302 1.677074,-2.95955 2.466286,-0.98651 2.170331,-0.98652 0.295954,-1.97302 -0.493257,-1.97303 -1.677074,0 -1.677074,0 0.09865,-0.98652 0.295954,-0.98651 -1.282468,0 -1.38112,-0.98651 -0.09865,-0.98652 -0.197302,-0.98651 -0.493258,0 -0.986514,0 -0.789211,0 -0.789212,-0.98652 z"
                                        data-title="Чеченская Республика" data-code="RU-CE"></path>
                                    <path
                                        d="m 239.89072,306.96247 -1.97303,-0.98651 -0.98651,-0.98651 0,-0.98652 -0.98651,-0.98651 -0.98652,0 -0.98651,0 -1.97303,-0.98652 -1.97303,-1.97303 -3.94606,2.95955 -1.97303,4.93257 -1.97302,0.98651 -1.97303,0 -0.98652,0 -1.97303,-0.98651 -1.97302,2.95954 -0.98652,3.94606 -0.98651,0.98651 -1.97303,0 -0.98651,3.94606 -0.98652,2.95954 0.98652,0.98652 -0.98652,0 -1.97303,0.98651 0.98652,0.98652 0.98651,0 1.97303,1.97302 1.97303,0 0.98651,0 0,0.98652 0.98652,0 0,0 0.98651,0.98651 1.97303,-0.98651 0,-0.98652 -0.98652,-0.98651 1.97303,-0.98651 1.97303,0.98651 -0.98651,0 0,1.97303 0,1.97303 0.98651,-0.98652 1.97303,0.98652 -2.95954,1.97302 -2.95955,0 0.98652,1.97303 0.98651,0 1.97303,1.97303 0.98652,1.97303 1.97302,0.98651 1.97303,-0.98651 2.95955,-0.98651 2.95954,-0.98652 -0.98652,-1.97303 -0.98651,-2.95954 -0.98651,0 -0.98652,0.98651 0,-4.93257 0.98652,-0.98651 0.98651,0 0.98651,-0.98651 0,-0.98652 0.98652,0.98652 0.98651,-0.98652 3.94606,-8.87863 2.95954,-8.87863 z"
                                        data-title="Удмуртская Республика" data-code="RU-UD"></path>
                                    <path
                                        d="m 65.869587,414.49253 -1.479771,0.98651 -1.183817,0 -0.789211,-0.98651 -0.986515,0 -1.085165,0.98651 -0.591909,-0.98651 -0.789211,-0.98652 -2.170332,0.98652 -2.268982,0.98651 -0.887863,-0.98651 -0.887863,0 1.479771,4.93257 0.09865,1.97303 2.860891,0.98651 3.4528,0.98652 0.493257,0 1.282469,0 2.07168,0 0.789211,-2.95955 -0.986514,-0.98651 1.085165,-1.97303 1.578423,-1.97303 0.493257,0 0.295955,0 2.170331,0.98652 -0.394606,-2.95955 -2.466285,-1.97302 -1.183818,1.97302 z"
                                        data-title="Республика Северная Осетия — Алания" data-code="RU-SE"></path>
                                    <path
                                        d="m 166.88867,306.96247 -2.95954,0.98652 -1.97303,0.98651 -0.98652,0 0,-0.98651 -1.97303,0.98651 -1.97302,0.98652 -1.97303,-3.94606 -1.97303,-6.9056 -1.97303,-0.98651 -1.97303,0 -0.98651,-0.98652 -1.97303,-1.97303 0,0.98652 0,1.97303 -1.97303,0.98651 -0.98651,0.98651 -1.97303,0 -1.97303,0 1.97303,0.98652 0.98651,1.97303 0,0 -1.97303,-0.98652 -0.98651,0 0,0 0,0.98652 -1.97303,0.98651 1.97303,2.95954 1.97303,1.97303 0.98651,-0.98651 0.98652,-0.98652 1.97302,3.94606 2.95955,5.91909 1.97303,0 1.97302,-1.97303 2.95955,2.95954 3.94605,1.97303 3.94606,0 1.97303,0.98651 3.94606,-5.91908 0.98651,-3.94606 -0.98651,0 0,-0.98651 -0.98652,0 -0.98651,-0.98652 0.98651,-0.98651 -0.98651,-0.98652 z"
                                        data-title="Республика Мордовия" data-code="RU-MO"></path>
                                    <path
                                        d="m 203.3897,127.41688 -3.94606,-4.93257 -2.95954,6.9056 -3.94606,4.93257 -0.98652,0 -1.97302,0 -2.95955,1.97303 -0.98651,0 0,0.98651 -0.98652,0.98652 -2.95954,0.98651 -0.98651,2.95954 0.98651,0.98652 0,0 -0.98651,0.98651 -2.95955,2.95954 -0.98651,3.94606 -2.95954,0.98652 -2.95955,0 -0.98651,6.9056 -0.98651,7.89211 -12.82469,1.97303 -13.8112,0.98651 0,1.97303 1.97303,2.95954 0,-0.98651 0.98651,0.98651 0.98652,0 2.95954,0 2.95954,0 0.98652,-0.98651 0,0 0.98651,9.86514 -2.95954,10.85166 1.97303,0 1.97303,0 1.97303,0 0.98651,0.98651 1.97303,0 -0.98652,-1.97303 0,-0.98651 0.98652,0 0,0 1.97303,1.97303 1.97303,1.97303 1.97302,0 0.98652,0.98651 0.98651,3.94606 0,0 0.98652,0.98651 0.98651,-2.95954 -0.98651,-4.93257 0.98651,-4.93257 0,0.98651 0.98651,0 0.98652,-1.97303 0.98651,-1.97302 0,2.95954 0.98652,0 0.98651,-2.95954 0.98652,-1.97303 0,0.98651 0,0.98652 0,0.98651 0,0 0.98651,-1.97303 0.98651,-0.98651 -0.98651,2.95954 -1.97303,3.94606 0.98652,0 0,0 0.98651,-1.97303 0,0.98651 1.97303,0.98652 1.97303,-3.94606 0,-0.98651 -0.98652,0 0,0.98651 0,-0.98651 0,-0.98652 -0.98651,0.98652 0,0 0.98651,-2.95955 0.98652,-2.95954 0.98651,8.87863 -4.93257,6.9056 -0.98651,2.95954 -0.98652,3.94606 0.98652,0 0.98651,0 1.97303,1.97303 2.95954,2.95954 0.98652,-0.98652 0.98651,-0.98651 0.98651,0 0,0.98651 1.97303,-2.95954 0.98652,-2.95954 0,0 0,-0.98652 1.97303,-1.97302 1.97302,-1.97303 -1.97302,-2.95955 -0.98652,-3.94605 1.97303,-1.97303 0.98651,-1.97303 0.98652,-2.95954 0.98651,-2.95954 0.98652,0.98651 0.98651,0.98651 1.97303,-0.98651 1.97303,-1.97303 0,-1.97303 0.98651,-1.97303 0,-1.97302 0,-0.98652 -0.98651,0 -0.98652,0 0,-2.95954 0,-1.97303 0.98652,-0.98651 0,0 3.94606,-4.93258 0.98651,-1.97302 0.98651,-2.95955 0.98652,0 0.98651,0.98652 1.97303,-1.97303 0.98652,-0.98652 0,0.98652 0.98651,0 0.98651,-5.91909 -1.97302,-5.91908 0.98651,0 1.97303,0 -0.98652,-1.97303 -0.98651,-1.97303 0.98651,-0.98651 -0.98651,0 -0.98651,-0.98652 -2.95955,0.98652 -0.98651,-2.95955 0.98651,-2.95954 -3.94605,-4.93257 z"
                                        data-title="Республика Карелия" data-code="RU-KR"></path>
                                    <path
                                        d="m 108.28971,374.04544 -0.98651,-1.97302 -1.57843,0 -1.38112,0 0,-1.97303 -1.47978,-0.98652 -0.69056,1.97303 -1.28247,1.97303 -3.650099,-1.97303 -4.83392,1.97303 -0.591909,0.98651 1.677075,0.98652 2.959542,0 -1.38112,2.95954 -2.762239,1.97303 -0.197303,0.98651 -0.197303,0.98652 -2.466286,0 -2.564937,0 -0.789211,1.97303 -1.085166,0.98651 -0.394606,0 -0.493257,-0.98651 -1.479771,0.98651 -1.775726,-0.98651 -3.058194,-6.9056 -4.242011,-2.95955 -2.663589,0.98652 -3.551451,0.98651 0.69056,0.98652 0.986514,0 -0.09865,0.98651 0.197303,0.98651 1.183817,-0.98651 1.282468,0 0.295954,0.98651 -0.591908,0.98652 2.76224,0 3.156845,0 0.887863,2.95954 0.789212,1.97303 1.479771,1.97303 1.183817,1.97303 -0.295954,1.97303 -0.394606,2.95954 0.591909,1.97303 1.38112,1.97303 2.268982,4.93257 0.789212,4.93257 0.69056,0.98651 1.578423,0.98652 2.959542,4.93257 2.07168,2.95954 1.085166,0 0.69056,0.98652 0.789211,-0.98652 0.591909,0 3.058195,-1.97303 3.255496,-0.98651 0.69056,-0.98652 0.98652,0 0,-0.98651 -0.69057,-0.98651 -0.69056,-0.98652 -0.78921,0 -0.78921,0 -0.3946,-0.98651 -0.39461,0 0.88786,-2.95955 3.35416,-0.98651 -0.69056,-0.98651 -0.98652,-0.98652 0.29595,-0.98651 0.39461,-0.98652 -0.98652,-0.98651 -0.1973,-0.98652 3.65011,0 3.55146,-0.98651 0.39461,-3.94606 0.49326,-4.93257 2.17033,-0.98651 1.67707,0 -2.07168,-1.97303 -2.56493,0 -0.98653,-1.97303 -0.29595,-2.95954 0.88786,-1.97303 1.28248,-0.98652 -0.78921,-0.98651 -1.18383,-0.98651 -0.59191,-2.95955 z"
                                        data-title="Республика Калмыкия" data-code="RU-KL"></path>
                                    <path
                                        d="m 69.815645,417.45207 -0.789212,-0.98651 -1.282468,0 -0.295955,-0.98652 -0.493257,0 -1.578423,1.97303 -1.085165,1.97303 0.986514,0.98651 -0.789211,2.95955 -1.479772,0.98651 3.156846,0.98651 3.156845,-0.98651 0,0 0.394606,-0.98651 0.197303,0 2.07168,-3.94606 -2.170331,-1.97303 z"
                                        data-title="Республика Ингушетия" data-code="RU-IN"></path>
                                    <path
                                        d="m 444.09917,473.68338 -0.98651,0 -0.98651,-0.98651 -0.98652,-0.98652 -0.98651,0.98652 -0.98652,0 -0.98651,-0.98652 -1.97303,-1.97302 -2.95954,0.98651 -0.98652,1.97303 0.98652,1.97303 -1.97303,1.97303 -0.98652,-0.98652 0,0 -1.97302,0 -0.98652,0 -0.98651,-0.98651 -0.98652,-0.98652 -0.98651,1.97303 -0.98652,1.97303 -0.98651,0 -0.98651,0 -0.98652,0.98651 -0.98651,0.98652 -2.95955,0 -3.94605,0 -1.97303,0.98651 -0.98652,0.98652 0,0 -1.97302,-0.98652 -1.97303,0.98652 1.97303,1.97303 1.97302,1.97302 0,0.98652 0,1.97303 0,0.98651 -2.95954,0 1.97303,4.93257 2.95954,3.94606 0.98652,2.95954 0.98651,2.95955 0.98652,0.98651 0.98651,0 1.97303,0.98651 0.98651,0.98652 3.94606,-0.98652 2.95954,-0.98651 0,0.98651 -0.98651,0.98652 4.93257,6.9056 1.97303,0 1.97303,0 1.97303,-0.98652 0.98651,-1.97302 4.93257,0.98651 0,0 0.98652,0 0.98651,0 0.98651,0 0.98652,-0.98651 0.98651,0 0.98652,0.98651 1.97302,-2.95954 0.98652,-1.97303 -0.98652,-1.97303 0,-0.98651 -1.97302,0 0,-0.98652 2.95954,-1.97303 1.97303,0 0,-1.97303 -1.97303,-0.98651 0,-1.97303 0,-1.97303 -0.98652,0 -0.98651,-0.98651 0,-2.95954 -0.98651,-3.94606 -0.98652,0.98651 -1.97303,0.98652 -2.95954,-0.98652 -1.97303,-2.95954 0.98652,-0.98651 0.98651,-0.98652 0,-0.98651 0,-1.97303 1.97303,-0.98652 1.97303,-1.97302 0,-1.97303 0,-0.98652 -0.98652,0 z"
                                        data-title="Республика Алтай" data-code="RU-AL"></path>
                                    <path
                                        d="m 238.90421,339.51744 -0.98652,-0.98651 0,-0.98651 -2.95954,0 -2.95954,-0.98652 -2.95954,0.98652 -2.95955,0.98651 -1.97303,0 -1.97302,0 -3.94606,1.97303 -3.94606,0.98651 -0.98651,-0.98651 0,0.98651 -0.98652,0.98652 0,0 0.98652,0.98651 0,1.97303 -0.98652,1.97303 -0.98651,0.98651 -1.97303,0 0,0.98652 -0.98651,1.97303 -1.97303,3.94605 0,0 -0.98652,2.95955 0,2.95954 0,2.95954 0.98652,0.98652 0.98651,0.98651 0,0 0,0.98651 0.98652,0.98652 0.98651,0 -0.98651,2.95954 0,1.97303 0.98651,1.97303 0,0.98651 -0.98651,0 -0.98652,0 0.98652,2.95954 0.98651,2.95955 0.98652,0 1.97302,-1.97303 2.95955,0.98651 -1.97303,2.95955 -1.97303,1.97302 0.98651,0.98652 0.98652,0.98651 -1.97303,4.93257 0.98651,0 0.98652,1.97303 0.98651,0.98652 1.97303,0 1.97303,0 1.97303,0.98651 0.98651,0.98652 3.94606,0.98651 1.97303,-3.94606 1.97303,0 0.98651,-1.97303 0,-0.98651 0.98651,0 0,-0.98651 0,-0.98652 1.97303,-1.97303 0.98652,-0.98651 2.95954,-4.93257 2.95954,-4.93257 0.98652,0 0.98651,0 1.97303,-0.98652 0.98651,0 1.97303,0.98652 0,0.98651 0.98652,-1.97303 2.95954,-2.95954 1.97303,-2.95954 -4.93257,-0.98652 -5.91909,0.98652 -0.98651,-0.98652 0,-0.98651 -1.97303,0 -1.97303,0 0,-0.98652 -1.97303,-6.9056 0,-0.98651 0.98652,0 0,-0.98651 0.98651,-0.98652 2.95954,-0.98651 2.95955,1.97303 -0.98652,1.97302 0,1.97303 1.97303,-0.98651 0.98651,0.98651 0,0.98652 0,0.98651 0.98652,0 0.98651,-0.98651 0.98652,-1.97303 1.97303,0.98651 0.98651,0 0.98651,-0.98651 0.98652,0 0.98651,0 1.97303,0 -0.98651,-0.98652 -0.98652,-0.98651 1.97303,-3.94606 0,-2.95954 -0.98651,0 -2.95955,-1.97303 -3.94605,-1.97303 -0.98652,-0.98651 -0.98651,0 0,-1.97303 0,-0.98651 -1.97303,0 -1.97303,0 0,-0.98652 -0.98651,-2.95954 -0.98652,0 -0.98651,-0.98652 z"
                                        data-title="Республика Башкортостан" data-code="RU-BA"></path>
                                    <path
                                        d="m 48.309634,373.05893 -0.493257,-2.95954 -2.663589,0.98651 -3.354148,-0.98651 -1.578423,-1.97303 -0.986514,-0.98652 -0.789212,0.98652 0.295954,0.98651 0.493258,0.98652 1.775725,1.97303 1.578423,1.97302 0.591909,0 0.887862,-1.97302 1.085166,0 0.69056,2.95954 -0.295954,2.95954 -2.268983,0 -2.268983,2.95954 0.197303,0.98652 0.295954,0.98651 -0.986514,0.98652 -1.282468,0 0.197302,-0.98652 -0.394605,-0.98651 -0.789212,0.98651 -0.986514,0 -0.394606,0.98652 1.183817,2.95954 1.973029,1.97303 1.973029,-0.98652 1.282468,-2.95954 0.887863,0 0.789211,-0.98651 1.282469,-1.97303 2.170331,-0.98652 -0.295954,1.97303 -0.394606,1.97303 0.986514,0 0.591909,0 0.493257,-0.98651 0.493257,-0.98652 0.591909,-0.98651 1.183817,-0.98652 -0.986514,-4.93257 -2.76224,-2.95954 z"
                                        data-title="Республика Адыгея" data-code="RU-AD"></path>
                                    <path
                                        d="m 4.7369647,336.1116 2.5917148,-3.75913 -2.0103373,-5.02106 -1.953777,-1.09559 -0.2193535,-1.31469 4.5203802,0.2271 4.7309991,0.9551 3.179042,2.66438 -0.5698,-3.87073 2.516025,2.90662 0.316811,1.32955 2.95264,2.67352 1.420589,3.65025 -1.148432,2.97188 -0.520731,5.61101 1.852233,0.50526 1.366564,-0.19511 0.409477,1.68659 1.813921,0.396 2.409184,3.18908 -2.923806,0.039 -1.062951,1.77511 -4.119921,-3.42138 -0.948011,-2.34864 -2.262906,-0.2121 -4.660777,-1.81476 -3.1557142,-0.99192 -4.1139536,0.12157 z"
                                        data-title="Республика Крым" data-code="RU-CR"></path>
                                    <path
                                        d="M 5.1460742,342.76851 2.6451191,341.03593 1.7504522,337.47254 4.7369647,336.1116 z"
                                        data-title="Севастополь" data-code="RU-SEV"></path>
                                    <path
                                        d="m 308.94672,213.24362 -5.91908,-4.93257 -4.93258,-3.94606 -1.97302,0 -1.97303,0 0,0 -0.98652,-0.98651 -0.98651,0.98651 -1.97303,0.98652 -7.89211,-0.98652 -6.9056,0 0,0 -2.95955,3.94606 -2.95954,3.94606 -0.98651,2.95954 1.97302,0 0.98652,0.98651 -0.98652,2.95955 -0.98651,2.95954 0.98651,1.97303 0,0.98651 -0.98651,0.98652 -0.98651,0.98651 -0.98652,-0.98651 -1.97303,-1.97303 -0.98651,0 -0.98652,0.98651 -0.98651,-0.98651 0,-0.98652 -0.98651,0 -1.97303,0 -0.98652,-0.98651 -1.97302,0.98651 -0.98652,-0.98651 0,-1.97303 -6.9056,-4.93257 -6.9056,-2.95954 0,4.93257 1.97303,3.94605 0,4.93258 -1.97303,2.95954 0,1.97303 0.98652,1.97303 -2.95955,0.98651 -1.97303,0 -2.95954,3.94606 -0.98651,3.94605 0.98651,0.98652 0.98652,0 0.98651,-0.98652 0.98651,0.98652 1.97303,0.98651 0,-0.98651 0.98652,-1.97303 2.95954,-0.98652 0.98651,0.98652 0.98652,-0.98652 0.98651,0 0.98652,1.97303 0.98651,1.97303 -3.94606,3.94606 -4.93257,3.94606 -0.98651,2.95954 -0.98652,1.97303 -5.91908,1.97303 -1.97303,0 -1.97303,0.98651 -2.95954,4.93257 0,1.97303 0,0.98651 -3.94606,0.98652 -1.97303,2.95954 1.97303,1.97303 0.98652,1.97303 0,0 0,1.97303 0.98651,2.95954 -0.98651,0.98651 0,1.97303 2.95954,-1.97303 1.97303,-1.97302 0,0 0.98651,0 0.98652,0 0,-0.98652 3.94605,1.97303 2.95955,0.98651 3.94605,-0.98651 2.95955,0 0,0.98651 1.97302,-0.98651 -0.98651,-2.95954 1.97303,-4.93257 5.91908,1.97302 0.98652,0 0.98651,0 1.97303,1.97303 -0.98651,1.97303 0,0 2.95954,1.97303 1.97303,-0.98651 1.97303,2.95954 1.97302,0.98651 1.97303,0 2.95955,-0.98651 0.98651,0.98651 0,0.98652 0.98651,-0.98652 1.97303,0 0.98652,0 0.98651,0.98652 0,0 1.97303,-0.98652 2.95954,-0.98651 5.91909,5.91908 9.86514,0.98652 0,-0.98652 1.97303,-0.98651 0.98651,-1.97303 0.98652,-2.95954 1.97303,0 0.98651,-1.97303 -0.98651,-0.98651 0,-0.98652 1.97303,-3.94606 1.97302,-3.94605 3.94606,-3.94606 3.94606,-3.94606 0.98651,-5.91908 0.98652,-0.98652 1.97302,-0.98651 0,0 0.98652,-0.98652 0.98651,0 1.97303,-0.98651 1.97303,0 0,0 0,0.98651 0.98651,1.97303 1.97303,-0.98651 1.97303,-0.98652 1.97303,-0.98651 0,0 0,-0.98651 2.95954,-0.98652 1.97303,-0.98651 2.95954,0 1.97303,0.98651 0,0 2.95955,-2.95954 2.95954,-0.98652 0,-0.98651 1.97303,-1.97303 2.95954,0 3.94606,-0.98651 0.98651,0 0.98651,0 0.98652,0 0.98651,0 0.98652,-0.98652 0.98651,-1.97303 4.93257,-1.97302 3.94606,-2.95955 -0.98651,-2.95954 -1.97303,-2.95954 0.98651,-3.94606 0.98652,0 0.98651,-0.98651 -1.97303,-0.98652 -0.98651,0 -0.98652,0 -0.98651,0.98652 -1.97303,0.98651 -1.97303,0.98652 -1.97303,0.98651 -1.97303,0.98651 -0.98651,0 -0.98651,-0.98651 -0.98652,1.97303 0,0.98651 -6.9056,1.97303 -5.91908,0.98652 -0.98652,-0.98652 -0.98651,-0.98651 -29.59543,-17.75726 z"
                                        data-title="Республика Коми" data-code="RU-KO"></path>
                                    <path
                                        d="m 225.09301,255.66373 -4.93257,-0.98651 -1.97303,1.97303 -3.94606,2.95954 -1.97303,-0.98651 -1.97302,0.98651 0,1.97303 0.98651,0.98651 1.97303,0 0.98651,0 0,0 -0.98651,0.98652 -0.98652,0.98651 0.98652,1.97303 -1.97303,1.97303 -0.98651,1.97303 -0.98652,2.95954 0,2.95954 -1.97303,0.98652 0,0 -0.98651,0 -0.98652,0 -0.98651,0 -0.98651,0 0,0.98651 -1.97303,-0.98651 -0.98652,0 -2.95954,1.97303 -1.97303,0.98651 2.95954,3.94606 2.95955,3.94605 -0.98652,0.98652 0,0 -1.97303,0.98651 -1.97302,0.98652 -3.94606,-1.97303 -0.98652,0.98651 -0.98651,1.97303 -0.98651,0.98651 -0.98652,0.98652 0.98652,0.98651 0.98651,0.98652 0.98651,1.97303 2.95955,0 0.98651,0 0.98652,0.98651 0.98651,0 0.98651,0 0.98652,0.98651 1.97303,0.98652 0,0.98651 0,0 0.98651,-0.98651 1.97303,0 0,0.98651 -0.98651,1.97303 0.98651,0.98652 0,0 0.98651,0 0,1.97302 0,0.98652 0,0.98651 0.98652,0.98652 -0.98652,0.98651 -0.98651,0.98652 2.95954,0.98651 -0.98651,2.95954 0,1.97303 0.98651,0 0,0.98652 -0.98651,0 0.98651,2.95954 1.97303,0.98651 0.98652,-2.95954 0.98651,-3.94606 1.97303,0 0.98651,-0.98651 0.98652,-3.94606 1.97302,-2.95954 1.97303,0 0.98652,0.98651 1.97303,0 1.97302,-0.98651 1.97303,-5.91909 3.94606,-1.97303 1.97303,1.97303 1.97303,0.98652 0.98651,0 0.98652,0 0.98651,0.98651 0,0.98652 0.98651,0.98651 1.97303,0 0.98652,-0.98651 1.97303,-0.98652 0.98651,-2.95954 0.98651,-0.98652 -1.97302,-1.97302 0,-2.95955 4.93257,-2.95954 2.95954,-3.94606 -3.94606,-2.95954 -3.94605,-3.94606 0,-0.98651 -2.95955,0 -3.94605,0.98651 -2.95955,-0.98651 -3.94605,-1.97303 0,0.98652 -0.98652,0 -0.98651,0 0,0 -1.97303,1.97302 -2.95954,1.97303 0,-1.97303 0.98651,-0.98651 -0.98651,-2.95954 0,-1.97303 0,0 -0.98652,-1.97303 -1.97303,-1.97303 1.97303,-2.95954 3.94606,-0.98652 0,-0.98651 0,-1.97303 2.95954,-4.93257 -1.97303,-1.97303 -0.98651,-2.95954 z"
                                        data-title="Кировская область" data-code="RU-KIR"></path>
                                    <path
                                        d="m 152.09095,314.85459 -1.97302,1.97303 -1.97303,0 -2.95955,-5.91909 -1.97302,-3.94606 -0.98652,0.98652 -0.98651,0.98651 -2.95955,-1.97303 -0.98651,-2.95954 -1.97303,0 0,0 -0.98651,0.98652 -0.98652,1.97302 -0.98651,0.98652 0.98651,0.98651 0,0 0,1.97303 -1.97303,0.98652 0.98652,2.95954 0,4.93257 -0.98652,0.98651 -1.97302,0.98652 1.97302,1.97303 2.95955,1.97303 0.98651,1.97302 0.98652,0.98652 1.97302,0 0.98652,0.98651 0.98651,0.98652 0,0.98651 2.95955,1.97303 1.97302,0 0.98652,0.98651 0,1.97303 2.95954,-0.98651 1.97303,0 1.97303,0.98651 0.98651,0.98652 2.95955,-1.97303 2.95954,-3.94606 0,-1.97303 -0.98652,-1.97303 0.98652,-3.94605 -0.98652,-3.94606 -3.94605,-1.97303 -2.95955,-2.95954 z"
                                        data-title="Пензенская область" data-code="RU-PNZ"></path>
                                    <path
                                        d="m 130.38764,301.04339 -0.98651,0.98651 -1.97303,0 -0.98652,-0.98651 -0.98651,-1.97303 -2.95954,0 -1.97303,-0.98651 -4.34066,2.95954 -3.4528,3.94606 0.98651,5.91908 -1.57842,0.98652 -1.87438,0.98651 0.78921,0.98651 0.98652,0.98652 -0.49326,1.97303 -0.29596,0.98651 1.77573,0.98652 2.07168,0.98651 1.08517,1.97303 0.98651,1.97303 0.69056,0 0.78921,0 -0.1973,0.98651 1.28247,0.98652 4.73526,-1.97303 4.93258,-1.97303 1.97302,-0.98652 0.98652,-0.98651 0,-4.93257 -0.98652,-2.95954 0.98652,-0.98652 0.98651,-1.97303 0,0 -0.98651,-0.98651 0.98651,-0.98652 0.98652,-1.97302 0.98651,-0.98652 0,0 -4.93257,-2.95954 z"
                                        data-title="Тамбовская область" data-code="RU-TAM"></path>
                                    <path
                                        d="m 234.95815,97.821452 0,0.493257 -1.97303,1.479772 -2.95954,-1.183817 -1.97303,-0.69056 -0.98651,0.789211 -1.97303,1.085166 -0.98652,-1.578423 -0.98651,-0.09865 -1.97303,-0.295954 0,0.887863 0,1.085166 -3.94606,1.973027 -2.95954,3.94606 0,0.98651 0,0.98651 -0.98651,4.93258 -0.98652,3.94605 -2.95954,0.98652 -3.94606,0 -5.91908,4.93257 3.94606,4.93257 2.95954,4.93257 0,2.95954 0.98651,2.95955 2.95955,-0.98652 0.98651,0.98652 0.98651,0 0,0 0.98652,0.98651 0,-1.97303 0,-1.97303 0.98651,-1.97302 0,-0.98652 0,-0.98651 0,-1.97303 1.97303,3.94606 0,0.98651 -0.98651,0 0,1.97303 0,2.95954 0.98651,0 0.98651,0 0.98652,4.93257 0,0 -0.98652,0 0,0.98652 0.98652,0.98651 0.98651,0 0,1.97303 0,2.95954 1.97303,2.95954 2.95954,3.94606 2.95955,4.93257 1.97303,3.94606 9.86514,2.95954 5.91908,-0.98651 4.93258,-1.97303 0.98651,-0.98651 0,-1.97303 1.97303,-1.97303 1.97303,-2.95954 0,0 -0.98652,-1.97303 0,0 -0.98651,-0.98652 0.98651,-2.95954 0.98652,-2.95954 -0.98652,0 0,0 -0.98651,0 0,-2.95955 0,-2.95954 0,0 -0.98652,-0.98651 0,0.98651 0,0 0,0 -0.98651,-6.9056 0,-6.9056 0,-2.95954 0,-0.98651 0,0 -0.98651,-1.97303 -0.98652,0 0,0 0.98652,-0.98652 -0.98652,-0.98651 0,-0.98652 -0.98651,0 -0.98652,0 -0.98651,-2.95954 -0.98652,-1.97303 -1.97302,-0.98651 -1.97303,0.98651 -0.98652,-0.98651 0,0 0,0 1.97303,-0.98652 1.97303,-1.97302 -1.97303,-0.98652 -0.98651,0 0,0 0.98651,0 0.98652,-0.98651 -0.98652,-0.98652 -1.97303,-0.98651 0,0 0.98652,0 0.98651,-0.98652 -0.98651,-0.98651 0,-0.98651 1.97303,1.97302 2.95954,0.98652 -0.98652,-2.95954 -0.98651,-3.94606 0,0.98651 -0.98651,0 0,0 0,0 -0.98652,0 -0.98651,0 0,0.98652 -0.98652,-0.98652 0,0 0,0 0,0 0,-0.98651 -0.98651,-1.973027 0,-0.986515 -0.98652,0.986515 0,0.986507 -1.97302,0 -0.98652,-2.860884 0,-0.09865 z"
                                        data-title="Мурманская область" data-code="RU-MUR"></path>
                                    <path
                                        d="m 130.38764,168.85048 -1.97303,0.98651 0.98652,0.98652 0.98651,0.98651 1.97303,0 0.98651,0.98652 0,0 -0.98651,0 -0.98652,0.98651 0,0.98651 -0.98651,0 0,-0.98651 0,4.93257 0.98651,1.97303 1.97303,0 2.95955,0.98651 1.97302,3.94606 -1.97302,2.95954 -2.95955,1.97303 -3.94605,-1.97303 -0.98652,-2.95954 0.98652,-2.95954 -1.97303,-1.97303 -0.98652,0.98651 -0.98651,-0.98651 -0.98652,-0.98651 -0.98651,-0.98652 -0.98651,0.98652 -0.98652,0 0,-1.97303 0,0 -1.18381,0 -0.69056,0.98651 -1.47978,0.98652 0.49326,0 -1.18382,1.97302 -1.77572,-0.98651 -1.67708,0.98651 -1.77572,0 0.98651,2.95955 0.78921,1.97303 0.98652,1.97302 0.88786,1.97303 -0.69056,3.94606 1.47977,2.95954 1.47977,0 1.97303,-0.98651 1.38112,0.98651 0.98652,1.97303 1.97302,-0.98651 2.95955,0 0,0.98651 1.97303,0.98651 1.97302,-0.98651 1.97303,-0.98651 0,0.98651 0,0 0.98652,0.98651 0.98651,0.98652 0,1.97303 0,1.97303 1.97303,0 1.97303,0 0.98651,0.98651 0,0.98651 1.97303,2.95955 0,1.97303 0.98652,1.97302 1.97302,2.95955 2.95955,0 1.97303,0.98651 0.98651,-0.98651 0.98651,-0.98652 1.97303,0 0.98652,-0.98651 -0.98652,0 0,-0.98652 0.98652,-0.98651 0,-0.98651 0,-0.98652 0,-0.98651 2.95954,-1.97303 2.95954,-0.98652 1.97303,-1.97302 0,-0.98652 0.98652,-0.98651 1.97302,0 0.98652,0 1.97303,-0.98652 -0.98652,-0.98651 0,0 -0.98651,-3.94606 -0.98652,-0.98651 -1.97302,0 -1.97303,-1.97303 -1.97303,-1.97303 0,0 -0.98652,0 0,0.98651 0.98652,1.97303 -1.97303,0 -0.98651,-0.98651 -1.97303,0 -1.97303,0 -1.97303,0 0,0 -0.98651,0 -0.98652,-0.98652 -1.97303,1.97303 -2.95954,0.98652 -1.97303,-2.95955 -2.95954,0 -1.97303,-0.98651 -0.98651,-0.98651 0.98651,0 0.98651,-1.97303 0.98652,-1.97303 1.97303,-4.93257 2.95954,-3.94606 0,-1.97303 0,-0.98651 -1.97303,-2.95954 0,-2.95955 -6.9056,0 -4.93257,-0.98651 z"
                                        data-title="Ленинградская область" data-code="RU-LEN"></path>
                                    <path
                                        d="m 183.65941,224.09528 -0.98651,0 -1.97303,-0.98652 0,-0.98651 0,-0.98652 -0.98652,-0.98651 -0.98651,0 0,-3.94606 0.98651,-1.97303 0.98652,-2.95954 0.98651,-2.95954 -2.95954,-2.95954 -1.97303,-1.97303 -0.98651,0 -0.98652,0 0,0.98651 -2.95954,0.98652 -3.94606,0.98651 -0.98651,-0.98651 -0.98652,-1.97303 -1.97302,0 -0.98652,0.98651 0,0.98652 -1.97303,1.97302 -2.95954,0.98652 -2.95954,1.97303 0,0.98651 0,0.98652 0,0.98651 -0.98652,0.98651 0,0.98652 0.98652,0 -0.98652,0.98651 -1.97303,0 -0.98651,0.98652 -0.98651,0.98651 -1.97303,-0.98651 -2.95955,0 -0.98651,2.95954 0,1.97303 0.98651,0 0,0.98651 0.98652,0 0.98651,0.98652 0,2.95954 0,2.95954 2.95955,0 3.94605,0.98652 0,0.98651 0,0.98652 0,0.98651 0,2.95954 0.98652,-0.98651 2.95954,0.98651 0,-2.95954 0.98651,-2.95954 0.98652,0.98651 -0.98652,1.97303 0,3.94606 2.95955,1.97302 0.98651,-0.98651 0.98652,0 2.95954,2.95954 0,4.93257 3.94605,4.93258 3.94606,-0.98652 0,-0.98651 0.98652,-0.98652 2.95954,0.98652 2.95954,0.98651 0.98652,-0.98651 0.98651,-0.98652 0,0.98652 0,0.98651 0.98651,0 0.98652,0.98652 0,0.98651 0,1.97303 3.94606,0.98651 0,0.98652 0,0 0.98651,0.98651 1.97303,0.98652 0.98651,1.97302 0.98652,1.97303 6.9056,4.93257 0.98651,0 0.98652,-0.98651 1.97302,0.98651 0.98652,0 0.98651,-0.98651 0.98652,-0.98651 1.97303,0.98651 0.98651,1.97303 1.97303,-1.97303 -0.98652,-1.97303 0.98652,-0.98651 0.98651,-0.98652 0,0 -0.98651,0 -1.97303,0 -0.98651,-1.97303 0,-0.98651 1.97302,-0.98651 1.97303,0 3.94606,-1.97303 1.97303,-1.97303 -0.98652,-3.94606 -1.97303,-0.98651 0,-1.97303 0,-0.98652 -3.94605,0 -1.97303,0 -2.95954,-3.94605 -1.97303,-2.95955 -1.97303,0.98652 -2.95954,0 0,-0.98652 0,-1.97302 -1.97303,0 -0.98652,-0.98652 -0.98651,-0.98651 0,-0.98652 -0.98651,-0.98651 -0.98652,-0.98651 -0.98651,0 0,0 0,-0.98652 -1.97303,0 -2.95954,0.98652 0,-1.97303 -0.98652,-0.98652 -0.98651,-0.98651 -0.98652,-0.98652 -0.98651,-0.98651 -0.98652,0 0,-0.98651 -0.98651,-1.97303 z"
                                        data-title="Вологодская область" data-code="RU-VLG"></path>
                                    <path
                                        d="m 185.63244,251.71768 -0.98652,-0.98652 -0.98651,0 0,-0.98651 0,-0.98652 -0.98651,0.98652 -0.98652,0.98651 -2.95954,-0.98651 -2.95954,-0.98652 -0.98652,0.98652 0,0.98651 -3.94606,0.98652 -0.98651,1.97302 0,0.98652 -6.9056,2.95954 -5.91908,3.94606 6.9056,3.94606 1.97302,-0.98652 0.98652,-0.98651 0.98651,1.97303 0.98652,1.97302 1.97302,0.98652 1.97303,0.98651 -0.98651,1.97303 -0.98652,0.98652 2.95955,0 1.97303,2.95954 3.94605,1.97303 3.94606,0 1.97303,-1.97303 0.98651,-0.98652 2.95955,2.95955 0,1.97303 0.98651,0 0.98651,0 3.94606,0.98651 1.97303,-0.98651 2.95954,-1.97303 0.98652,0 1.97303,0.98651 0,-0.98651 0.98651,0 0.98651,0 0.98652,0 0.98651,0 0,0 1.97303,-0.98652 0,-2.95954 0.98652,-2.95954 0.98651,-1.97303 -0.98651,-1.97303 -1.97303,-0.98651 -0.98652,0.98651 -0.98651,0.98651 -0.98652,0 -1.97302,-0.98651 -0.98652,0.98651 -0.98651,0 -6.9056,-4.93257 -0.98652,-1.97303 -0.98651,-1.97302 -1.97303,-0.98652 -0.98651,-0.98651 0,0 0,-0.98652 -3.94606,-0.98651 0,-1.97303 0,-0.98651 z"
                                        data-title="Костромская область" data-code="RU-KOS"></path>
                                    <path
                                        d="m 114.0115,186.60774 -0.78921,-1.97303 -0.98651,-2.95955 -2.17033,2.95955 -2.269,1.97303 -0.49325,0 -2.56494,0 -1.57843,1.97302 0.69056,0.98652 0.49326,0.98651 -1.47978,2.95954 -1.38112,-0.98651 0.39461,-0.98651 0.29595,-0.98652 -0.59191,0 -0.1973,0.98652 0,0 -0.98651,0 -0.789214,-0.98652 -1.775727,0.98652 -1.874377,0 0,0.98651 0.394606,0 -0.09865,0.98651 -0.986515,2.95955 -2.268982,1.97303 -2.466286,0.98651 0.197303,0.98651 0.09865,0.98652 -2.466285,2.95954 -3.255498,3.94606 -0.09865,0 0.09865,0.98651 0.789212,0.98652 0.986514,0.98651 -0.394606,0.98652 -0.09865,0.98651 0.887863,0 1.282468,1.97303 -1.183817,2.95954 -0.789211,0.98652 1.479771,0 0.789212,0.98651 1.677074,0 1.775726,4.93257 0,1.97303 0.493257,0.98651 2.07168,0 1.38112,1.97303 2.564938,-1.97303 2.466284,-1.97302 0.59191,-2.95955 0,-1.97303 0.88786,-0.98651 0.88786,-0.98651 -0.49325,-0.98652 -0.0987,0 1.38113,-0.98651 1.57842,-0.98652 -0.1973,-1.97303 1.77572,-1.97302 0.49326,-1.97303 2.95955,-0.98652 0.1973,-0.98651 0.0987,-0.98652 1.18381,0 0.88787,-0.98651 -0.98652,-2.95954 -0.69056,-3.94606 4.93257,-1.97303 -1.47977,-2.95954 0.69056,-3.94606 -0.88786,-1.97303 -0.98652,-1.97302 z"
                                        data-title="Псковская область" data-code="RU-PSK"></path>
                                    <path
                                        d="m 335.58261,155.03928 0,-1.97303 -1.97303,0 0,1.97303 0.98651,0.98651 -0.98651,3.94606 2.95954,-2.95954 0,-0.98652 -0.98651,-0.98651 z m 22.68982,-21.70331 -2.95954,-0.98652 -2.95954,0 0,0.98652 0,0.98651 -0.98652,0 0,0 0,0.98651 0,0.98652 -1.97302,-0.98652 -2.95955,0 0,0.98652 0,0.98651 0.98652,0.98652 0,0 -0.98652,0 0,0.98651 0,0 0.98652,0 0,0 -0.98652,0 -0.98651,0.98652 -2.95954,1.97302 -1.97303,1.97303 0,0 -0.98652,-0.98651 0,-0.98652 -0.98651,-0.98651 -1.97303,0.98651 -1.97303,1.97303 -0.98651,2.95954 0,2.95955 0.98651,0 0.98652,0 0,0 0,0.98651 0,0 0,0 0.98651,-0.98651 0.98651,-0.98652 0,0.98652 -0.98651,1.97303 1.97303,1.97302 0.98651,-0.98651 0,0 0,0 -0.98651,0.98651 -0.98652,3.94606 0.98652,0.98652 0.98651,1.97302 -0.98651,0 -0.98652,0 0,0 -0.98651,-0.98651 0,0.98651 -0.98651,0.98652 -0.98652,0 0,0 0,1.97303 0.98652,1.97303 1.97302,0 0,0 0.98652,1.97302 0,1.97303 0.98651,0 0,0 0.98652,0 0,0 0,-0.98651 0.98651,0 0.98652,1.97303 0.98651,1.97303 0.98651,0.98651 0,-0.98651 0,0 0,-0.98652 0.98652,-0.98651 0,1.97303 1.97303,2.95954 0,0 0,-0.98652 0,-0.98651 0,0 0.98651,0.98651 1.97303,0 0,0 -0.98651,-2.95954 -0.98652,-2.95954 0,-4.93257 0.98652,-4.93257 0.98651,-3.94606 1.97303,-3.94606 0.98651,0 0,0 0.98652,-1.97303 0.98651,-1.97303 0.98651,-1.97302 0,0 0,0 0.98652,0.98651 1.97303,-0.98651 0,-0.98652 -0.98652,-0.98651 0,0 0,0 0.98652,0 1.97303,0.98651 0.98651,-0.98651 0,-0.98652 -0.98651,0 -0.98652,-0.98651 2.95954,0.98651 0,-1.97302 0,0 0,0 0.98652,0 0.98651,0 -0.98651,-2.95955 -1.97303,-1.97303 0,-0.98651 -0.98651,-0.98651 -1.97303,0 -0.98652,0 z m 22.68983,-21.70332 -1.97303,1.97303 0,0 0,0.98651 0.98652,0 0,0.98652 0.98651,0.98651 0,0 -1.97303,0 -1.97303,0.98652 0.98652,0 0.98651,0.98651 0,0 0,0.98652 0.98652,0.98651 0,0 0,0 -1.97303,-0.98651 -2.95954,-0.98652 -0.98652,0.98652 0.98652,1.97302 0,0 -0.98652,0 -0.98651,0 -1.97303,0 0.98651,0.98652 0,0.98651 -0.98651,0 -0.98652,-0.98651 0,1.97303 0.98652,1.97303 -0.98652,-0.98652 -1.97302,-1.97303 -1.97303,0.98652 0,1.97303 0,0 0,-0.98652 -1.97303,-0.98651 -1.97303,0.98651 -0.98651,0.98652 -0.98652,-0.98652 0,0 1.97303,2.95954 3.94606,0.98652 0,0.98651 -2.95955,0 -2.95954,0 -1.97303,0.98652 0,0.98651 0.98652,0 1.97303,0 1.97302,1.97303 0.98652,1.97303 0.98651,-0.98652 0,0 0,2.95955 1.97303,0.98651 0,0 0.98652,-0.98651 0,0.98651 0.98651,-0.98651 1.97303,-0.98652 -0.98652,-1.97303 0,0 0,-0.98651 0,-0.98651 0,0 0.98652,2.95954 1.97303,0 0.98651,-0.98652 -0.98651,-1.97302 -0.98652,-0.98652 0,-0.98651 0,0 1.97303,0.98651 0.98652,1.97303 0,0 0,0.98651 0.98651,-1.97302 0.98651,-1.97303 -0.98651,-0.98652 0,-0.98651 0,0 0,0 0.98651,0 0,0 0,-0.98652 0.98652,0 0,0.98652 0,1.97303 0,1.97303 0.98651,-0.98652 0,0 0.98652,-0.98651 1.97303,-0.98652 1.97302,-2.95954 -0.98651,-0.98651 0,-0.98652 0.98651,0 0,1.97303 1.97303,0.98651 0,0 0.98652,-0.98651 0.98651,-1.97303 0,-0.98651 0,0.98651 0.98652,2.95954 0.98651,-0.98651 0,-1.97303 0.98651,0 0,0.98652 0,0.98651 1.97303,-0.98651 0,-0.98652 0.98652,0.98652 0.98651,-0.98652 0,0 0,-0.98651 -0.98651,-0.98652 0,0 0.98651,0 0.98652,0 0.98651,-0.98651 -0.98651,0.98651 1.97302,-0.98651 2.95955,-0.98652 0,0 0,0 0,0.98652 0.98651,-0.98652 0.98651,0 2.95955,-0.98651 2.95954,0 1.97303,0 0.98651,0 10.85166,0 9.86514,-0.98651 2.95955,-1.97303 1.97302,-2.95955 1.97303,-1.97302 -0.98651,-2.95955 -4.93257,-1.97303 -5.91909,1.97303 0,0.98652 -0.98651,0.98651 -0.98652,0 0,-0.98651 -12.82468,0 -2.95955,-2.95955 -1.97302,-0.98651 -0.98652,1.97303 -2.95954,0.98651 0.98651,0 0,-0.98651 -1.97303,0 -1.97302,0.98651 -1.97303,-0.98651 -2.95954,0 -1.97303,0.98651 -0.98652,0 -0.98651,0 0,0.98652 0,0 -2.95954,0 0,1.97303 -0.98652,0.98651 -0.98651,-0.98651 -0.98652,-0.98652 -0.98651,0.98652 -0.98652,0.98651 -1.97302,0.98651 0,0 0,-0.98651 -0.98652,-1.97303 z m 49.32571,-72.11419 0,-2.466286 -1.97302,-0.493257 -0.98652,2.07168 0,2.959543 2.95954,-2.07168 z m -10.85165,-8.779977 -0.98652,2.466285 2.95955,0.493258 0.98651,-2.959543 -2.95954,0 z m 10.85165,0.394605 2.95955,1.677075 0.98651,-0.986515 -1.97303,-2.170331 -1.97303,1.479771 z m -3.94605,3.946057 m -0.98652,0.493258 0,0.789211 1.97303,-1.282469 -0.98651,0 z m -0.98651,-7.892114 0,-0.789212 -0.98652,-0.09865 0,1.085165 0,1.282469 0,0 0.98652,-1.479771 z m 0.98651,1.085165 -0.98651,0.789212 0,0.789211 0,1.282469 1.97303,-1.973029 0,-0.591908 -0.98652,-0.295955 z m 5.91909,0.09865 0.98651,-0.789212 -2.95954,-3.255497 -0.98651,1.677074 0.98651,1.677075 1.97303,0.69056 z m -20.7168,4.242011 0,0.69056 0.98651,0.591909 0.98652,-1.38112 0,-1.578423 -1.97303,-0.09865 0,1.775726 z m 0.98651,-5.919086 -1.97303,1.282469 0.98652,1.183817 0.98651,-1.085166 0,-1.38112 z m -7.89211,-14.304456 0,1.282468 0.98651,0.197303 0,0.493257 0,0.789212 0,0.789211 2.95955,-0.09865 1.97302,-0.591909 0.98652,-0.197303 0,0.09865 0.98651,0.197303 0.98652,2.466285 0.98651,-0.789211 0,-2.170332 -0.98651,-2.07168 -1.97303,0 -1.97303,0.197303 -0.98651,-0.09865 -0.98652,-0.197303 -1.97303,-0.887863 -0.98651,0.591909 z m 15.78423,4.242011 0,-0.591909 -0.98652,0.295955 -1.97303,0.394605 -0.98651,0.394606 0,1.085166 0,1.183817 -3.94606,0.09865 -2.95954,-0.789211 0,0.69056 0.98651,0.887863 -0.98651,0 -0.98651,-0.493257 0,0.591908 0,0.789212 0,0.197302 -0.98652,0 0,-1.677074 -1.97303,-0.295954 -0.98651,1.38112 0,1.479771 1.97303,-0.09865 0,1.282468 -0.98652,0.591909 -0.98651,0.591909 0.98651,0.295954 0.98652,-0.09865 0.98651,0.789212 0.98652,-0.887863 0,0 0,0.591908 0.98651,0.09865 0,0 0.98651,-1.479771 -0.98651,-1.085166 0,-0.09865 2.95954,0.295955 0.98652,0.986514 0.98651,-0.69056 1.97303,-0.591909 5.91909,-0.295954 -0.98652,-2.07168 -1.97303,-0.69056 0,-0.197303 0.98652,-0.69056 0.98651,-0.09865 0.98652,-0.986514 0,-0.394606 0,0 -1.97303,0 0,-0.69056 z m 2.95954,-2.663588 -0.98651,0.887862 0.98651,0.295955 1.97303,-0.394606 0,-0.986514 -0.98652,-0.493257 -0.98651,0.69056 z m 35.51451,10.457051 1.97303,1.775725 0.98652,-1.578422 -1.97303,-1.874378 -0.98652,1.677075 z m -7.89211,15.192319 1.97303,1.874377 3.94605,0.197303 2.95955,-2.564937 0,-0.197303 0.98651,-3.354148 -1.97303,-0.986515 -0.98651,1.479772 -0.98652,1.282468 -0.98651,-0.197302 -2.95954,0.394605 -1.97303,2.07168 z m -13.8112,6.313691 -0.98651,-1.183817 -1.97303,1.677075 1.97303,1.479771 0.98651,-1.973029 z m 0.98651,-6.708297 m -0.98651,-1.183817 -4.93257,-0.591908 0,3.058194 0,2.170331 0.98651,0 0,-0.591908 0.98652,0.09865 0.98651,-0.394605 -0.98651,-0.69056 0,-0.493258 0,-0.09865 2.95954,0.394606 0.98651,-1.677075 z m 3.94606,-0.986514 -0.98652,0.986514 0,1.183817 0,1.183818 0.98652,0.197302 0,-0.09865 0.98651,-0.09865 0,0.986514 0.98652,1.38112 2.95954,-0.986514 2.95954,-2.268983 0.98651,-1.479772 0,-1.578422 -0.98651,-0.591909 -1.97303,0 -1.97303,-1.282469 -1.97302,-0.493257 -1.97303,2.959543 z m -1.97303,-5.327177 0.98651,1.479772 1.97303,-0.591909 -0.98651,-1.479771 -1.97303,0.591908 z m -1.97303,2.564937 -0.98651,-0.493257 -0.98652,1.085166 0.98652,0.295954 0.98651,-0.887863 z m 0,-8.385371 -0.98651,-1.183817 -0.98652,-0.986514 -0.98651,-0.986515 0,-0.986514 -0.98652,0.295954 -0.98651,0.69056 0.98651,2.07168 0.98652,2.466286 0.98651,2.959543 2.95954,1.578423 -0.98651,-5.919086 z m 1.97303,-0.69056 -0.98652,-1.183817 -0.98651,0.09865 0.98651,2.07168 0,2.268983 0.98652,1.775726 0.98651,0.197303 0,-4.044709 -0.98651,-1.183817 z m 2.95954,0.197303 0.98652,-1.183817 -1.97303,-0.09865 -0.98652,1.085166 1.97303,0.197303 z m 6.9056,8.484023 1.97303,-1.874378 -1.97303,-0.887862 -2.95954,1.578422 2.95954,1.183818 z m -0.98651,-11.443566 -0.98652,0.591909 0,1.578423 0.98652,-0.591909 0,-1.578423 z m 3.94605,-7.300205 -1.97303,-0.394606 0,-0.295954 -0.98651,0.09865 0,0.887863 -0.98651,0.986514 1.97302,0.887863 2.95955,-1.282469 -0.98652,-0.887862 z m -7.89211,3.156845 0,2.860892 2.95954,0.493257 -0.98651,-3.354149 -1.97303,0 z m -4.93257,2.170332 0,-1.183817 -0.98652,0.394605 0,2.367634 1.97303,0.986515 2.95955,0 0.98651,0.197303 0,-0.197303 -0.98651,-2.663589 -2.95955,0.887863 -0.98651,-0.789211 z m -189.41074,154.78409 -0.98651,0 -0.98652,0.98651 -2.95954,0 -2.95954,0.98652 -1.97303,-0.98652 -0.98652,-0.98651 -2.95954,0.98651 -3.94606,0 -3.94605,2.95955 -0.98652,3.94605 -0.98651,3.94606 -0.98652,0 -0.98651,0.98651 0.98651,-0.98651 0,0 -0.98651,-0.98651 -0.98651,-0.98652 0,0.98652 0,0 -0.98652,0 -1.97303,-0.98652 -0.98651,-2.95954 -1.97303,-2.95954 -1.97303,-0.98652 -0.98651,0.98652 0,-0.98652 0.98651,-0.98651 1.97303,0 -0.98651,-4.93257 -2.95955,-3.94606 -1.97302,0.98651 -1.97303,0.98652 -0.98652,7.89211 0.98652,0 1.97303,0.98652 -1.97303,2.95954 -2.95955,2.95954 0,0 -0.98651,-0.98651 -0.98651,0 0,0.98651 -1.97303,-2.95954 -1.97303,-3.94606 -1.97303,1.97303 -1.97303,0.98651 -0.98651,-0.98651 -0.98652,-0.98651 -0.98651,2.95954 -0.98652,2.95954 -0.98651,1.97303 -1.97303,1.97303 0.98652,3.94605 1.97302,2.95955 -1.97302,1.97303 -1.97303,1.97302 0,0.98652 0,0 -0.98652,2.95954 -1.97303,2.95954 0,0 -0.98651,-0.98651 -0.98651,0.98651 -0.98652,0.98652 -0.98651,2.95954 -0.98652,2.95954 -0.98651,1.97303 0,3.94606 0.98651,0 0.98652,0.98651 0,0.98652 0,0.98651 1.97303,0.98652 0.98651,0 0.98651,1.97303 0,0.98651 0.98652,0 0.98651,0.98651 0.98652,0.98652 0.98651,0.98651 0.98652,0.98652 0,1.97303 2.95954,0 1.97303,-0.98652 0,0.98652 0,0 0.98651,0 0.98652,0.98651 0.98651,0.98651 0,0.98652 0.98651,1.97303 0.98652,0 1.97303,0.98651 0,0.98651 0,0.98652 2.95954,0 1.97303,-0.98652 1.97303,2.95955 2.95954,4.93257 1.97303,-0.98652 3.94605,0 0,0.98652 0,2.95954 1.97303,0 0.98652,3.94606 4.93257,0.98651 0.98651,1.97303 1.97303,1.97303 1.97303,-0.98651 1.97303,0 5.91908,-1.97303 0.98652,-1.97303 0.98651,-2.95954 4.93257,-3.94606 3.94606,-3.94606 -0.98651,-1.97303 -0.98652,-1.97303 -0.98651,0 -0.98652,0.98652 -0.98651,0 -2.95954,0 -0.98652,1.97303 0,0.98651 -1.97303,0 -0.98651,-0.98651 -0.98651,0 -0.98652,0 -0.98651,-0.98652 0.98651,-3.94605 2.95954,-3.94606 1.97303,0 2.95955,-0.98651 -0.98652,-1.97303 0,-1.97303 1.97303,-2.95954 0,-4.93258 -1.97303,-3.94605 0,-3.94606 6.9056,1.97303 6.9056,4.93257 0,2.95954 0.98652,0.98652 1.97302,-1.97303 0.98652,1.97303 1.97303,-0.98652 0.98651,0 0,0.98652 0.98651,0.98651 0.98652,-0.98651 0.98651,0 1.97303,1.97303 0.98652,0.98651 0.98651,-0.98651 0.98651,-0.98652 0,-0.98651 -0.98651,-0.98652 0.98651,-3.94605 0.98652,-2.95955 -0.98652,-0.98651 -1.97302,0 0.98651,-2.95954 2.95954,-3.94606 2.95955,-3.94606 -1.97303,-1.97303 -1.97303,-0.98651 -1.97303,0 -1.97303,0.98651 0,0.98652 0,0 -1.97303,0 0,-0.98652 -0.98651,-0.98651 -0.98652,-1.97303 -2.95954,-5.91909 -3.94605,-5.91908 0,-1.97303 0,-0.98651 -4.93258,3.94605 0.98652,-1.97302 -0.98652,-0.98652 -0.98651,-0.98651 -0.98651,0.98651 0.98651,-0.98651 1.97303,-0.98652 -3.94606,-7.89211 z"
                                        data-title="Архангельская область" data-code="RU-ARK"></path>
                                    <path
                                        d="m 426.34192,165.89094 0,-0.98652 -0.98652,0 -0.98651,0 -4.93257,1.97303 0,2.95954 0,0 3.94605,0.98652 2.95955,-0.98652 0,-0.98651 0,-1.97303 0,-0.98651 z m 12.82468,24.66285 0,-3.94605 0.98652,-2.95955 0,-1.97303 -0.98652,-0.98651 -0.98651,2.95954 -0.98652,4.93257 -2.95954,2.95955 -4.93257,0.98651 -0.98651,0.98651 -0.98652,0 -0.98651,1.97303 -0.98652,0.98652 -0.98651,0.98651 -0.98652,0.98652 0,0.98651 0.98652,0.98651 0,0.98652 -0.98652,1.97303 0.98652,3.94605 0,3.94606 -2.95954,2.95954 -1.97303,1.97303 -0.98652,2.95955 -0.98651,1.97302 -0.98652,1.97303 0,1.97303 0,1.97303 -0.98651,1.97303 -0.98651,2.95954 1.97302,0 0.98652,0 0.98651,0.98652 0.98652,0.98651 1.97303,-0.98651 1.97302,0 5.91909,3.94605 2.95954,5.91909 0,0.98651 -0.98651,0.98652 0.98651,2.95954 0,2.95954 -0.98651,0 -0.98652,0 -2.95954,1.97303 -0.98651,2.95954 3.94605,3.94606 2.95955,1.97303 -1.97303,0 -1.97303,-0.98652 -1.97303,0.98652 -0.98651,0 0,-0.98652 0,-1.97302 -0.98652,-1.97303 0,-0.98652 0.98652,-1.97303 0,-1.97302 0.98651,-0.98652 0.98652,-0.98651 -0.98652,0 0,-0.98652 0.98652,-0.98651 0,-0.98652 0,-2.95954 -0.98652,-1.97303 0,-1.97303 0,-1.97302 -4.93257,0 -5.91909,0 -1.97302,2.95954 -0.98652,1.97303 0,2.95954 -1.97303,6.9056 -1.97303,1.97303 -2.95954,0.98651 -0.98651,2.95955 -1.97303,1.97302 -2.95954,0.98652 -2.95955,1.97303 -1.97302,-0.98652 -0.98652,0.98652 -1.97303,2.95954 -2.95954,0 0,-0.98651 -0.98651,-0.98652 -3.94606,-0.98651 -2.95954,-1.97303 -1.97303,-0.98652 -0.98652,-1.97302 -0.98651,-2.95955 0,-2.95954 0,0 3.94606,1.97303 4.93257,1.97303 -0.98652,0.98651 -1.97303,0 0,0.98652 2.95955,1.97302 3.94605,0 0,-1.97302 0.98652,-1.97303 0.98651,0 0,0 1.97303,-0.98652 0.98652,-0.98651 0.98651,0 0,-0.98652 0,-0.98651 3.94606,-1.97303 3.94605,-1.97303 0.98652,-2.95954 0,-1.97303 2.95954,-1.97303 1.97303,-2.95954 -1.97303,-3.94606 -0.98651,-5.91908 2.95954,-4.93257 1.97303,-4.93257 1.97303,-5.91909 0.98651,-0.98651 0.98651,-0.98652 2.95955,-5.91908 -0.98652,-4.93258 0,-4.93257 3.94606,-3.94605 5.91909,-9.86515 0,-1.97302 0,-0.98652 -1.97303,-2.95954 -4.93257,-1.97303 -1.97303,-0.98651 -1.97303,-0.98652 0,0 -0.98652,0 0.98652,-0.98651 0,0 -0.98652,0 0,-0.98652 -4.93257,5.91909 -4.93257,6.9056 -7.89211,5.91908 -5.91909,2.95955 0.98652,0 0,0 -0.98652,1.97302 -0.98651,0 -0.98652,1.97303 1.97303,0 0.98652,0.98652 -1.97303,2.95954 -1.97303,3.94606 0,1.97303 -0.98651,1.97302 -0.98652,-0.98651 -0.98651,0 -1.97303,1.97303 -0.98652,2.95954 0,0.98652 0,0 0.98652,-0.98652 0,0 0.98651,0 0.98652,1.97303 0.98651,1.97303 0.98652,0 0,0 0,1.97303 -0.98652,0.98651 0,4.93257 1.97303,1.97303 0,0.98652 -5.91909,6.9056 -1.97302,0 0.98651,-0.98652 0,-0.98651 -0.98651,-0.98652 -0.98652,-0.98651 0,0 -0.98651,-6.9056 -1.97303,-2.95954 -2.95954,-3.94606 0.98651,0 1.97303,1.97303 0,0.98651 0,0.98652 0,-0.98652 -1.97303,-3.94606 -3.94606,-2.95954 -1.97303,0.98652 -0.98651,1.97302 -0.98651,0 1.97302,2.95955 0.98652,1.97303 0,1.97302 -1.97303,1.97303 -1.97303,1.97303 -0.98651,3.94606 1.97303,2.95954 0.98651,2.95954 -3.94606,1.97303 -4.93257,2.95954 -0.98651,0.98652 -0.98652,1.97303 -0.98651,0 -0.98652,0 -0.98651,0 -0.98651,0 -3.94606,0.98651 -2.95954,0 -1.97303,1.97303 0,0.98651 -2.95954,0.98652 -2.95955,1.97303 0,0.98651 -1.97303,-0.98651 -2.95954,0 0.98652,2.95954 0,1.97303 0.98651,1.97303 0,0.98651 -1.97303,1.97303 -0.98651,3.94606 -1.97303,0 -0.98652,1.97303 0.98652,1.97302 2.95954,0.98652 -0.98651,1.97303 0.98651,1.97303 0.98652,0 0.98651,0 0.98651,0 0.98652,0.98651 1.97303,-0.98651 1.97303,0 0,0.98651 0.98651,0.98651 0.98651,-0.98651 0.98652,0 2.95954,0.98651 2.95954,1.97303 0.98652,0.98652 1.97303,0.98651 -0.98652,0.98652 -1.97303,0.98651 1.97303,2.95954 2.95954,2.95954 0,0 1.97303,-0.98651 1.97303,-0.98651 2.95954,0.98651 0.98652,0 0.98651,-0.98651 1.97303,0 0,0.98651 0.98652,0.98651 0.98651,0 1.97303,1.97303 -0.98652,0.98652 -0.98651,1.97303 0,2.95954 0.98651,1.97303 1.97303,1.97303 0,3.94605 0,2.95955 4.93257,0.98651 4.93258,-0.98651 1.97302,2.95954 0.98652,2.95954 1.97303,1.97303 1.97303,0.98651 4.93257,0.98652 3.94605,2.95954 4.93257,2.95954 0.98652,2.95955 1.97303,2.95954 2.95954,0 3.94606,0 1.97303,0.98651 1.97302,0.98652 5.91909,-1.97303 3.94606,-1.97303 0.98651,0 0,0.98652 0,1.97302 2.95954,2.95955 1.97303,0 1.97303,0 1.97303,2.95954 1.97303,2.95954 1.97303,0 1.97303,0 1.97302,1.97303 1.97303,2.95954 4.93257,-2.95954 2.95955,-3.94606 0.98651,-1.97303 0,-0.98651 0.98651,-0.98651 0.98652,-1.97303 -1.97303,-0.98652 -0.98651,-0.98651 0,-1.97303 0.98651,-0.98651 1.97303,0 3.94606,-5.91909 0.98651,-5.91908 -0.98651,-2.95955 -1.97303,0.98652 -1.97303,-0.98652 -0.98652,-1.97303 -1.97302,0 -0.98652,-2.95954 0.98652,0 0.98651,-1.97303 0,-1.97303 0,-0.98651 0,-1.97303 0,-0.98651 0,-0.98652 0,0 -2.95954,-0.98651 -0.98652,-2.95954 0,-6.9056 0.98652,-3.94606 -0.98652,-4.93257 -0.98651,-2.95954 -0.98652,-0.98652 0,-0.98651 1.97303,-1.97303 0,-0.98652 -0.98651,-0.98651 0,-1.97303 0,-0.98651 0,-0.98652 3.94606,-1.97303 1.97302,-4.93257 0.98652,-6.9056 0.98651,-4.93257 -0.98651,-0.98651 -0.98652,-0.98652 0,-0.98651 -0.98651,-0.98652 -1.97303,1.97303 -1.97303,0 -0.98651,0 0,0 -1.97303,-1.97303 -2.95954,-1.97302 0,0 -0.98652,-2.95955 -0.98651,-1.97302 0,-1.97303 0,-0.98652 1.97303,-0.98651 0,0 0,0 0,-0.98652 0.98651,-0.98651 3.94606,-1.97303 1.97303,-1.97303 1.97303,0.98652 1.97302,0 0.98652,-4.93257 0,-5.91909 -1.97303,-0.98651 -1.97303,-1.97303 0,-1.97303 0,-1.97303 1.97303,0 0,0 0.98651,0 1.97303,-1.97303 0,-2.95954 -1.97303,-1.97303 -1.97302,-1.97303 -0.98652,-1.97303 -0.98651,-1.97303 -2.95955,0 -2.95954,1.97303 0.98652,0 0.98651,0 0.98651,1.97303 0,1.97303 -3.94605,-0.98651 -0.98652,-2.95955 -3.94605,0.98652 -0.98652,3.94605 0.98652,3.94606 1.97303,2.95954 1.97302,0 1.97303,1.97303 -0.98651,4.93257 -0.98652,-1.97302 -0.98651,-1.97303 -5.91909,-2.95955 -4.93257,-3.94605 0.98652,-0.98652 1.97303,-3.94605 -0.98652,-1.97303 2.95954,-2.95955 1.97303,-2.95954 z m 10.85166,1.97303 0.98651,-0.98651 0,-1.97303 -0.98651,-0.98652 -4.93257,1.97303 3.94605,1.97303 0.98652,0 z m -9.86514,-14.79771 -3.94606,-0.98652 0.98651,2.95955 0.98652,0 0,0 0.98651,-1.97303 0.98652,0 z m 3.94605,-4.93257 m 0.98652,0 0.98651,0.98651 0.98652,-0.98651 -1.97303,-0.98652 -0.98652,0.98652 z"
                                        data-title="Ямало-Ненецкий АО" data-code="RU-YAN"></path>
                                    <path
                                        d="m 870.27333,135.30899 -0.98651,0 -0.98652,2.95955 3.94606,1.97303 1.97303,-0.98652 1.97303,-1.97303 -0.98652,-0.98651 -0.98651,-1.97303 0,0 -1.97303,0 -1.97303,0.98651 z m 27.6224,-62.643651 -2.95954,1.973028 0,0.789212 0,0.591908 -0.98652,0.591909 -0.98651,0.789211 -0.98651,4.242011 0.98651,4.340663 0.98651,2.268983 1.97303,1.183817 0.98652,0.493257 0,0 1.97303,-5.425828 2.95954,-1.578423 0.98651,-0.986514 0,-1.183818 1.97303,-4.242011 -0.98651,-4.242011 -1.97303,0.295954 -3.94606,0.09865 z m 67.08297,20.519496 -0.98651,1.578423 -0.98652,1.085166 -0.98651,0.986514 0.98651,0.197303 0.98652,-0.69056 1.97302,0.493257 1.97303,0.789211 0,0.197303 0,0.986514 0,0.986515 1.97303,0 1.97303,0.986509 -0.98651,0 -0.98652,0 0,0.98652 0,0.98651 -0.98651,0 -0.98652,-0.98651 -0.98651,0.98651 -0.98652,0 -1.97302,0 0,-1.97303 -1.97303,-0.986509 -3.94606,-2.860892 -0.98651,-0.197303 -0.98652,0 0,-0.09865 0,0.887863 0,1.282468 -0.98651,-0.295954 0,-0.394606 -0.98652,-1.282468 -1.97302,-0.986514 -1.97303,0.591908 -0.98652,0.986514 2.95955,0.493258 -0.98652,0.887862 -1.97303,1.973023 -0.98651,-1.973023 -0.98652,-1.085165 -0.98651,0.887863 -1.97303,1.183817 -0.98651,-0.986515 -0.98652,-0.197302 -2.95954,1.183817 -2.95954,1.973028 -0.98652,-0.98652 -0.98651,0 -1.97303,0.98652 -1.97303,0.98651 -0.98651,-0.98651 -1.97303,-0.98652 -2.95954,0.98652 -2.95955,1.97303 -2.95954,0 -1.97303,0 -0.98651,0.98651 -1.97303,0.98652 0,0 0,-0.98652 0.98651,0 0,-0.98651 -0.98651,0 -1.97303,0.98651 -0.98651,0.98652 -1.97303,0.98651 -1.97303,0 -0.98651,0.98651 -2.95955,0.98652 -2.95954,0.98651 -0.98651,0 0,0.98652 0,0.98651 -0.98652,-0.98651 -0.98651,0 0,0 -3.94606,4.93257 -0.98651,0.98651 -1.97303,1.97303 0,0 -0.98652,0 -0.98651,0 0.98651,0.98652 0,0.98651 -1.97303,0 -1.97302,0.98651 0,0 -0.98652,0.98652 -1.97303,0.98651 -2.95954,1.97303 -2.95954,0.98652 0.98651,0.98651 0.98652,0.98651 0.98651,1.97303 0,1.97303 0,0.98652 1.97303,0 0.98651,-0.98652 4.93257,2.95954 0.98652,4.93258 -0.98652,1.97302 0,1.97303 -2.95954,0 -1.97303,-1.97303 -2.95954,0.98652 -2.95954,0.98651 -1.97303,-1.97303 -4.93257,-1.97302 -0.98652,0.98651 0,1.97303 0,2.95954 -1.97303,1.97303 -1.97302,0 -1.97303,0.98651 -0.98652,0.98652 -1.97302,1.97303 -2.95955,0.98651 -1.97303,-0.98651 0,0.98651 0,0 -0.98651,0.98651 -0.98651,0.98652 -0.98652,0 -0.98651,1.97303 0,0.98651 -0.98652,0.98652 -0.98651,0.98651 0,0 0.98651,1.97303 0.98652,0.98651 0.98651,0 0.98652,0.98652 0,0 0.98651,1.97303 0.98651,0 1.97303,0.98651 0,0.98651 0,0.98652 1.97303,2.95954 0.98652,1.97303 -1.97303,0.98651 -0.98652,0.98652 -6.9056,7.89211 -4.93257,6.9056 0.98652,0.98652 0.98651,0.98651 -0.98651,1.97303 0,1.97303 5.91908,3.94605 5.91909,1.97303 0,0.98652 -0.98652,0.98651 1.97303,3.94606 1.97303,2.95954 2.95954,0 1.97303,0.98652 0,0 0.98651,3.94605 1.97303,0 0.98652,0 1.97303,-0.98651 0.98651,0 0,0 1.97303,0 1.97303,0.98651 0.98651,0 3.94606,0 2.95954,-1.97303 2.95954,0.98652 2.95955,0 0.98651,0 0,0 0,0 0,0 0,0 0.98652,0 0,0 1.97302,-1.97303 2.95955,-1.97303 -0.98652,-1.97303 1.97303,-1.97303 0.98652,-0.98651 1.97302,-0.98651 0.98652,0 0.98651,0 0.98652,0 0,-0.98652 3.94605,-1.97303 0.98652,0 1.97303,-0.98651 1.97302,-1.97303 0.98652,-0.98651 0,0 1.97303,-0.98652 1.97303,0 0.98651,0.98652 0,0 2.95954,-0.98652 2.95955,-0.98651 1.97302,0 0.98652,0.98651 1.97303,0 2.95954,0 0.98651,4.93257 0.98652,5.91909 3.94606,-0.98652 3.94605,0 3.94606,0.98652 2.95954,0.98651 0.98652,0 0.98651,-0.98651 0.98652,0 0.98651,-0.98652 0,-1.97302 0,-0.98652 0.98651,0 1.97303,-1.97303 9.86514,-10.85165 0.98652,0.98651 1.97303,0.98651 1.97303,-0.98651 1.97302,0 0,0.98651 0.98652,0.98652 0.98651,-2.95954 0,-3.94606 1.97303,-5.91909 1.97303,-5.91908 0,0 -0.98651,0 -0.98652,0 0,-0.98652 -0.98651,-0.98651 0,0 0.98651,0 0,0 0,-0.98651 1.97303,1.97302 0,0 4.93257,-2.95954 4.93258,-2.95954 -0.98651,-0.98652 0,-0.98651 0,-2.95954 -2.95955,-0.98652 -2.95955,-0.98651 0,-1.97303 -2.95954,0.98651 -2.95954,-0.98651 -4.93257,-2.95954 -5.91909,-2.95955 -0.98651,2.95955 -3.94606,0.98651 -1.97303,-1.97303 -0.98651,-0.98651 -0.98652,2.95954 0,0.98652 -0.98651,0 -0.98652,0 0,0.98651 0,0.98651 -0.98651,-0.98651 0.98651,-0.98651 -0.98651,0 -0.98651,0 -1.97303,0 0,0.98651 0.98651,1.97303 -1.97303,0.98651 -0.98651,0.98652 0.98651,-1.97303 0.98652,-0.98652 0,-0.98651 -0.98652,-1.97303 0.98652,0 5.91908,-2.95954 -0.98651,-0.98652 0,-0.98651 1.97303,0 1.97302,0 3.94606,-2.95954 1.97303,-5.91909 -0.98651,-5.91908 -1.97303,-5.91909 -2.95955,0 -3.94605,-0.98651 -0.98652,-2.95955 0.98652,-1.97302 -0.98652,0 -0.98651,-0.98652 1.97303,-0.98651 0.98651,0.98651 0,-1.97303 0,-1.97303 1.97303,2.95955 0.98651,2.95954 1.97303,0 0.98652,-0.98651 0.98651,0 1.97303,3.94605 0.98651,-0.98651 0.98652,-0.98652 1.97303,-4.93257 1.97303,-2.95954 1.97302,-0.98651 2.95955,-0.98652 2.95954,1.97303 1.97303,0.98651 3.94606,-0.98651 2.95955,-1.97303 0.98651,-0.98651 0.98652,-0.98652 2.95954,0.98652 2.95954,-0.98652 0,-0.98651 0,-0.98652 -0.98651,-0.98651 0,-0.98651 1.97303,1.97302 0.98651,0.98652 0.98651,-1.97303 -1.97302,-1.97303 0,0 0.98651,0 0.98651,-0.98651 0,-0.98652 -1.97302,0 -1.97303,0.98652 -0.98652,-0.98652 -0.98651,-0.98651 0,0.98651 -0.98651,0 0.98651,-1.97303 0,-3.94605 -0.98651,-0.98652 -0.98652,-0.98651 -1.97303,-0.98652 -0.98651,0 -0.98652,0 -1.97303,0 -0.98652,0 1.97303,-0.986508 1.97304,-0.986515 1.97303,-1.677074 0.98651,-2.170331 0,-0.69056 -1.97303,0.295954 -1.97303,-0.69056 1.97303,-0.69056 2.95955,-1.775726 -1.97303,-1.282468 -0.98652,-0.986514 0,-3.255497 0,-2.367635 -0.98651,0.295955 -0.98652,0.789211 -0.98652,0.197303 -0.98651,0.09865 -2.95955,0.789212 -1.97303,0.69056 -4.93257,0.09865 -2.95954,0 -1.97303,2.466286 -0.98651,2.466285 -0.98652,0.789212 0,-0.09865 0,0.295955 0.98652,0.789211 0,0.789212 -1.97303,-0.591909 -0.98652,-0.986514 -0.98651,0.789211 z"
                                        data-title="Чукотский АО" data-code="RU-CHU"></path>
                                    <path
                                        d="m 813.05551,494.40018 m 0,0 0,0 -0.98652,0 -1.97303,0 -0.98651,-0.98651 -1.97303,0 -2.95954,-2.95954 -0.98652,-0.98652 0,0 -1.97303,0 -1.97302,0.98652 -1.97303,-0.98652 -1.97303,0 -0.98652,1.97303 -0.98651,0.98651 0,0 -0.98651,0 0,0 -2.95955,1.97303 -0.98651,0 -0.98652,0.98652 -0.98651,2.95954 -0.98651,1.97303 0,1.97303 0,1.97303 0.98651,0.98651 1.97303,1.97303 0,0.98651 0,0.98652 0.98651,1.97303 0.98652,0.98651 0.98651,0.98651 0,0 1.97303,0.98652 1.97303,-0.98652 0.98651,0 0,0 5.91909,-2.95954 0.98651,0 0.98652,0 0.98651,-1.97303 0,-1.97303 1.97303,-0.98651 1.97303,-1.97303 0.98651,0 0.98652,0 1.97303,-3.94606 2.95954,-1.97302 1.97303,0 1.97302,0 2.95955,-1.97303 -0.98652,-1.97303 0,0 -0.98651,-1.97303 -1.97303,0.98651 -0.98651,0 -1.97303,0 -0.98652,0 -1.97302,1.97303 0,0 z"
                                        data-title="Еврейская автономная область" data-code="RU-YEV"></path>
                                    <path
                                        d="m 513.15517,466.77778 -1.97303,0 -4.93257,1.97303 -2.95954,-0.98651 -0.98652,0.98651 -0.98651,0 -0.98651,0 0,-0.98651 -0.98652,0 -0.98651,0.98651 -1.97303,0 -0.98652,0 -0.98651,1.97303 -0.98651,2.95954 -1.97303,0.98652 -1.97303,0.98651 -4.93257,6.9056 -6.9056,3.94606 -6.9056,-0.98652 -5.91909,-1.97302 -0.98651,-1.97303 -1.97303,-0.98652 -2.95954,0.98652 -2.95955,0.98651 0,2.95954 0,1.97303 -3.94605,0 -3.94606,-0.98651 0,3.94606 0,2.95954 0.98651,0.98651 0.98652,0 0,1.97303 0,1.97303 1.97303,0.98651 0,1.97303 -1.97303,0 -2.95954,1.97303 0.98651,0.98652 0.98651,0 0,0.98651 0.98652,1.97303 3.94606,-0.98652 3.94605,0 0,-1.97302 0.98652,-1.97303 4.93257,0.98651 1.97303,-0.98651 1.97303,-0.98652 1.97302,0 1.97303,0 0,-0.98651 0.98652,-0.98652 0.98651,0 0,0.98652 0.98652,0 0,0.98651 0.98651,0 1.97303,-0.98651 0,1.97303 0.98651,1.97303 3.94606,0 4.93257,0.98651 0.98652,2.95954 0.98651,3.94606 3.94606,0.98651 3.94605,0.98652 0.98652,0 0.98651,-0.98652 4.93257,1.97303 0.98652,0 0.98651,0 2.95954,0.98652 0.98652,0.98651 0.98651,0.98651 6.9056,-3.94605 0.98652,-2.95954 0.98651,-2.95955 -0.98651,0 -0.98652,-1.97303 0,-0.98651 0,-0.98651 0,-0.98652 -0.98651,-0.98651 1.97303,-4.93257 2.95954,-3.94606 0.98651,0 0.98652,-0.98652 1.97303,-1.97302 0.98651,-1.97303 0,-0.98652 0,-0.98651 -0.98651,-0.98652 0,-0.98651 0,-0.98651 0.98651,-0.98652 0,-2.95954 0,-1.97303 0.98652,0 0,0 0,-1.97303 -0.98652,-0.98651 -1.97303,0 -1.97303,0 -4.93257,-3.94606 -4.93257,-4.93257 z"
                                        data-title="Республика Тыва" data-code="RU-TY"></path>
                                    <path
                                        d="m 933.41024,501.30578 0,0 -1.97302,0.98652 -0.98652,0 -0.98651,0 0,0.98651 0,0.98652 -0.98652,3.94605 -0.98651,3.94606 0.98651,0.98651 0.98652,0 0,-3.94605 0.98651,-3.94606 1.97303,-1.97303 0.98651,-0.98651 0,-0.98652 z m 5.91909,6.9056 0,-1.97303 -0.98651,0.98652 -0.98652,0.98651 1.97303,0 z m 6.9056,-26.63588 -0.98651,-1.97303 -0.98652,0 -0.98651,2.95954 -0.98652,1.97303 -1.97303,0 -1.97302,0 0,0.98651 0.98651,0.98652 -0.98651,1.97303 -0.98652,1.97303 0,1.97302 -0.98651,1.97303 0,0.98652 0,0.98651 -0.98652,1.97303 0.98652,0.98651 0.98651,-4.93257 0.98652,-0.98651 0.98651,-0.98652 0,-0.98651 0,-0.98651 1.97303,-1.97303 0.98651,-2.95955 1.97303,-1.97302 1.97303,-1.97303 z m 6.9056,-14.79772 m 0,-1.97302 0,0 -0.98651,0.98651 -1.97303,4.93257 0,0.98651 -0.98652,0.98652 1.97303,0.98651 1.97303,-6.9056 z m 7.89211,-14.79772 -0.98651,-2.95954 0,2.95954 -0.98652,1.97303 0,0.98651 0,0 1.97303,-2.95954 z m 0.98652,-13.8112 m 0,0 0,1.97303 0.98651,-0.98651 0,-0.98652 -0.98651,0 z m 0,-3.94606 m 0,0 m -0.98652,0 m 0,0 m 0,0 m 0.98652,0.98652 m 0,-0.98652 m 0,0 z m 0.98651,-10.85165 0,0 0,0 -0.98651,-1.97303 0.98651,0.98651 0,0.98652 z m -0.98651,-11.83817 0.98651,1.97303 0,0.98651 0.98652,-0.98651 -0.98652,-2.95955 -0.98651,0.98652 z m 3.94605,-18.74377 0,-1.97303 -0.98651,0 -0.98651,1.97303 1.97302,0 z m -2.95954,5.91908 -1.97303,3.94606 0.98652,0.98651 1.97303,-1.97303 0.98651,-2.95954 0,-2.95954 -0.98651,-1.97303 -0.98652,-0.98651 -0.98651,0.98651 0.98651,1.97303 0,2.95954 z m -81.88068,49.32571 -4.93257,-5.91908 -3.94606,-4.93257 -2.95954,-3.94606 0,0.98651 -0.98652,0 0,-0.98651 0,-0.98651 -1.97303,-0.98652 -1.97302,-1.97303 -0.98652,-4.93257 -1.97303,-5.91908 0,0 0,-0.98652 0,0.98652 -0.98651,0 -1.97303,-1.97303 -0.98651,-1.97303 0.98651,0 0.98652,0.98651 0,0.98652 0.98651,0 -3.94606,-4.93257 -2.95954,-3.94606 0,-0.98651 0,-0.98652 -2.95954,-1.97303 -0.98652,-0.98651 0,0.98651 0,0.98652 -0.98651,0 -0.98652,0.98651 1.97303,0.98652 2.95955,1.97302 0,0.98652 0,0.98651 0,-0.98651 0.98651,0 0,1.97303 -0.98651,0 0,0.98651 0,0 0.98651,0.98652 -0.98651,2.95954 -0.98652,-0.98652 -0.98651,0 -1.97303,0.98652 0,1.97303 0.98651,1.97303 0.98652,0.98651 1.97303,6.9056 1.97302,6.9056 3.94606,2.95954 4.93257,3.94606 0.98652,2.95954 0,3.94606 1.97302,1.97303 0.98652,1.97303 5.91908,17.75725 0,0.98652 3.94606,2.95954 1.97303,3.94606 0.98651,2.95954 0,3.94606 1.97303,1.97302 0.98652,1.97303 1.97303,7.89212 3.94605,5.91908 0.98652,-0.98651 0,-1.97303 -0.98652,-4.93257 0.98652,-3.94606 0.98651,0.98652 0,0 2.95954,-0.98652 1.97303,0.98652 1.97303,0.98651 0.98652,1.97303 0.98651,0.98651 -1.97303,-4.93257 -1.97303,-3.94606 -0.98651,0.98652 -1.97303,-0.98652 -1.97303,-0.98651 -1.97303,-1.97303 -3.94605,-2.95954 -2.95955,-4.93257 -0.98651,-5.91909 0,-4.93257 -0.98652,-1.97303 0,-1.97303 0.98652,-0.98651 0.98651,-1.97303 4.93257,-0.98651 4.93258,1.97303 1.97302,0.98651 0.98652,0.98651 -1.97303,-1.97302 -2.95954,-1.97303 -1.97303,-1.97303 -0.98652,-1.97303 -5.91908,-5.91909 z"
                                        data-title="Сахалинская область" data-code="RU-SAK"></path>
                                    <path
                                        d="m 773.59493,418.43859 1.97303,-1.97303 0.98652,-2.95955 -0.98652,0 -0.98651,0 -0.98652,-0.98651 -1.97302,-0.98651 -0.98652,0.98651 -1.97303,0.98651 -0.98651,0 -0.98651,-0.98651 -2.95955,1.97303 -3.94605,-0.98652 -1.97303,1.97303 -2.95955,0 -0.98651,0.98652 0,0.98651 -1.97303,0.98652 -1.97303,1.97302 0,0.98652 -0.98651,0.98651 -2.95954,-0.98651 -2.95955,-0.98652 0,0.98652 -1.97303,0 -0.98651,0 -0.98651,0 -0.98652,1.97303 0,0.98651 -1.97303,-0.98651 -0.98651,0 -1.97303,0.98651 -2.95954,1.97303 -2.95955,0 -0.98651,-0.98652 -2.95954,0 -2.95954,0.98652 -4.93258,-0.98652 -1.97302,-1.97302 -1.97303,-1.97303 -4.93257,-0.98652 -5.91909,0 -0.98651,-0.98651 -1.97303,-0.98651 -1.97303,0 -1.97303,0 -1.97303,-0.98652 -1.97303,-0.98651 -1.97303,-0.98652 -3.94605,0.98652 -3.94606,1.97303 0,3.94605 0,0 0.98651,0 0.98652,1.97303 0,0.98651 1.97303,0.98652 2.95954,0.98651 -1.97303,0.98652 -0.98651,0 0,1.97303 1.97303,1.97302 0.98651,0 0,-0.98651 1.97303,-0.98651 2.95954,-0.98652 1.97303,2.95954 0.98651,2.95955 0.98652,0 1.97303,-0.98652 1.97303,4.93257 -1.97303,4.93258 0.98651,0.98651 0.98652,0 2.95954,1.97303 -0.98652,0.98651 -0.98651,0.98652 0,0.98651 0,0.98652 0,0.98651 -0.98651,1.97303 0,0 2.95954,2.95954 1.97303,2.95954 0.98651,0 0.98652,0 2.95954,0 1.97303,-0.98651 1.97303,-0.98651 0,0 0.98651,0 0.98651,-0.98652 1.97303,0.98652 1.97303,0.98651 0,0 0.98652,-0.98651 2.95954,1.97302 2.95954,0.98652 0,-0.98652 0,0 5.91909,0 0.98651,0.98652 0,0.98651 0,0 0.98651,0 0,0 0.98652,0.98652 0,0 0.98651,0 0,0.98651 0,0.98652 0.98652,0 0,0 1.97303,1.97302 0.98651,0.98652 0.98651,3.94605 4.93258,5.91909 0.98651,0 0,0.98651 0.98651,0.98652 0,1.97303 1.97303,1.97303 1.97303,2.95954 0.98652,0.98651 0.98651,2.95955 0.98651,0 0.98652,0.98651 0,1.97303 2.95954,4.93257 3.94606,-0.98651 3.94606,-0.98652 0,0 0.98651,0.98652 0,0 0.98651,0 0.98652,0 0,0.98651 0.98651,0 0,0 0.98652,-0.98651 0.98651,0.98651 0,-0.98651 0.98651,0 0,-0.98652 3.94606,2.95954 6.9056,0.98652 0.98652,0 0.98651,-1.97303 0.98651,-2.95954 0.98652,-0.98652 0,0 0,0 0,-2.95954 -0.98652,-2.95954 0,-2.95955 0,-3.94605 -0.98651,-0.98652 -1.97303,0 0,-0.98651 -0.98651,-0.98652 -0.98652,0.98652 -0.98651,0 0,-0.98652 0,-0.98651 -0.98652,0 -0.98651,0.98651 0,-2.95954 0,-2.95954 0.98651,-2.95954 0.98652,-1.97303 0,-0.98652 -0.98652,-1.97302 2.95955,-1.97303 2.95954,-1.97303 0.98651,-0.98652 -0.98651,-0.98651 0.98651,-1.97303 0.98652,-0.98651 1.97303,-0.98652 1.97303,-0.98651 0,-3.94606 -0.98652,-1.97303 0,0 4.93257,-0.98651 3.94606,0 0.98651,-0.98652 0,-1.97302 -0.98651,-1.97303 0,-3.94606 -0.98651,-2.95954 -2.95955,-0.98652 0,0 -0.98651,0 -0.98652,0.98652 -2.95954,0.98651 -1.97303,0 -0.98651,1.97303 -1.97303,1.97303 -3.94606,1.97303 -1.97303,0.98651 -0.98651,0.98652 0,0 -0.98651,0 -0.98652,0 -0.98651,0 -0.98652,0 -1.97303,-2.95955 -1.97302,-1.97303 -3.94606,0 -2.95954,-0.98651 0,-3.94606 2.95954,-1.97303 0,-2.95954 0,-2.95954 0.98651,-0.98652 0.98652,-0.98651 1.97303,-1.97303 1.97302,-1.97303 0,-0.98651 0,-0.98651 z"
                                        data-title="Амурская область" data-code="RU-AMU"></path>
                                    <path
                                        d="m 633.50991,428.30373 -1.97303,0 -1.97303,-1.97303 0,-1.97303 -0.98651,0.98651 -2.95954,0 -0.98652,0 -1.97303,0 -0.98651,-0.98651 -0.98651,-0.98651 -0.98652,1.97302 -2.95954,1.97303 -1.97303,0 -2.95954,0 -0.98652,-0.98651 -0.98651,0 0,0 0,-0.98652 -0.98652,0 -1.97302,0.98652 -0.98652,1.97303 -0.98651,0 -0.98652,-0.98652 -1.97303,1.97303 -2.95954,1.97303 0.98652,4.93257 1.97302,0 0,0.98652 0,0.98651 1.97303,0.98651 0.98652,1.97303 -0.98652,0 -0.98651,0 0,1.97303 -1.97303,7.89212 0.98651,7.89211 2.95955,-10.85166 1.97303,-3.94605 2.95954,-0.98652 -0.98652,12.82469 -1.97302,13.8112 -0.98652,0.98651 -0.98651,0.98651 0,-0.98651 0,-1.97303 -0.98652,-0.98651 -0.98651,1.97303 -0.98652,1.97302 0.98652,0 1.97303,0 0,1.97303 -0.98652,1.97303 -0.98651,0 -0.98652,0 -1.97302,2.95954 -2.95955,3.94606 -11.83817,4.93257 -0.98651,2.95955 -0.98652,2.95954 -6.9056,3.94606 -3.94605,0.98651 -0.98652,0.98651 -2.95954,2.95955 -3.94606,0 -0.98651,0.98651 -0.98652,0 0,-1.97303 0,-1.97303 -0.98651,-1.97302 -1.97303,-0.98652 0,-1.97303 -0.98651,-1.97303 -6.9056,-5.91908 -0.98652,0.98651 -0.98651,0 -0.98652,-1.97303 -0.98651,-2.95954 -4.93257,-2.95954 -3.94606,-2.95954 -0.98651,-2.95955 0,-1.97303 -4.93257,3.94606 -3.94606,2.95954 -0.98651,-0.98651 0,0 -0.98652,0 0,1.97303 0,2.95954 -0.98651,0.98652 0,0.98651 0,0.98651 0.98651,0.98652 0,0.98651 0,0.98652 0.98652,0.98651 1.97302,0.98652 6.9056,3.94605 5.91909,2.95955 0.98651,0 0.98652,0.98651 3.94605,0.98651 2.95955,0.98652 0,5.91908 5.91908,6.9056 8.87863,1.97303 7.89212,-1.97303 1.97302,-0.98651 0.98652,0 3.94606,0.98651 3.94605,0.98652 1.97303,0 0.98651,0 2.95955,1.97303 1.97303,1.97302 1.97302,0 1.97303,0.98652 0,-3.94606 1.97303,-2.95954 1.97303,0 1.97303,-1.97303 -1.97303,-0.98651 -1.97303,-1.97303 0.98652,-1.97303 1.97302,-1.97303 0,0 0,0 -0.98651,-2.95954 0.98651,-1.97303 3.94606,0 2.95954,0.98651 0,0 1.97303,-1.97302 2.95955,-1.97303 2.95954,0 1.97303,0.98651 0.98651,-0.98651 1.97303,-1.97303 1.97303,-1.97303 1.97303,-0.98651 1.97303,-0.98652 0.98651,-2.95954 0.98651,-0.98652 0.98652,0 1.97303,0.98652 0.98651,-1.97303 1.97303,-0.98651 4.93257,-0.98652 4.93257,-3.94606 -1.97303,-5.91908 -1.97303,-3.94606 1.97303,-0.98651 0,-0.98652 5.91909,-4.93257 4.93257,-4.93257 1.97303,-0.98651 1.97303,-0.98652 1.97303,0 1.97302,-0.98651 0,-6.9056 -4.93257,-3.94606 -2.95954,-1.97303 0,-2.95954 0,-0.98651 0,0 0,0 -0.98651,-1.97303 0,0 0,-0.98652 0,0 -0.98652,-1.97303 0,-0.98651 0,0 0,-1.97303 -0.98651,-0.98651 -0.98652,-0.98652 0,0 0,0 -0.98651,0 0,0 1.97303,-0.98651 -0.98652,-1.97303 1.97303,-1.97303 0.98652,0 0.98651,-0.98651 -4.93257,-0.98652 -4.93257,5.91909 -4.93257,1.97303 -3.94606,-0.98652 -1.97303,0.98652 z"
                                        data-title="Республика Бурятия" data-code="RU-BU"></path>
                                    <path
                                        d="m 466.789,444.08796 -1.97303,-1.97303 -1.97303,0.98651 -2.95954,0 -2.95954,-2.95954 -2.95954,-2.95954 -0.98652,0.98651 0,1.97303 0,1.97303 0,0.98651 -0.98651,2.95954 -0.98652,3.94606 2.95955,0 1.97302,1.97303 -0.98651,0.98651 -0.98651,0.98652 0.98651,1.97303 -0.98651,1.97303 -0.98652,0 -1.97303,1.97302 0,1.97303 0.98652,2.95955 -0.98652,1.97302 0.98652,1.97303 0.98651,2.95954 -3.94606,2.95955 -3.94605,1.97303 -1.97303,1.97302 -1.97303,0.98652 0,1.97303 0,0.98651 -0.98651,0.98652 0,0.98651 0.98651,2.95954 2.95954,0.98652 1.97303,-0.98652 1.97303,-0.98651 3.94606,0.98651 3.94605,0 0,-1.97303 0,-2.95954 2.95955,-0.98651 2.95954,-0.98652 0.98651,-2.95954 1.97303,-1.97303 0.98652,-0.98651 1.97303,0 0,0 1.97302,-3.94606 0,-0.98651 1.97303,-0.98652 1.97303,-1.97303 0,-0.98651 -0.98651,-0.98651 -0.98652,-0.98652 0,-0.98651 0,0 -0.98651,-0.98652 1.97303,-4.93257 -1.97303,-5.91908 -0.98652,-5.91909 -2.95954,-0.98651 z"
                                        data-title="Республика Хакасия" data-code="RU-KK"></path>
                                    <path
                                        d="m 446.0722,418.43859 -2.95954,0 -2.95954,0 -0.98652,0 -0.98651,0.98651 -0.98652,-0.98651 -0.98651,0 -1.97303,1.97302 -0.98651,0.98652 -0.98652,0 -0.98651,-0.98652 -1.97303,0.98652 -1.97303,0 -0.98651,1.97303 0,0.98651 0.98651,2.95954 0,1.97303 0,0.98652 0.98652,0.98651 -0.98652,1.97303 -0.98651,1.97303 0.98651,1.97303 0,1.97302 -0.98651,0.98652 -0.98652,1.97303 1.97303,1.97303 0.98652,1.97302 0.98651,0.98652 0.98651,0 0,1.97303 0.98652,0.98651 0.98651,0.98652 0.98652,0.98651 0,2.95954 0.98651,1.97303 1.97303,0.98652 0.98651,0.98651 -0.98651,0.98651 -0.98651,1.97303 0,0.98652 0.98651,0 0,0.98651 -0.98651,0.98652 0.98651,1.97302 0,2.95955 1.97303,1.97302 0.98651,0.98652 0.98652,0 0.98651,-0.98652 0.98652,0.98652 0.98651,0.98651 0.98651,0 0.98652,-0.98651 0,1.97303 0,1.97303 3.94605,-1.97303 3.94606,-2.95955 -0.98651,-2.95954 -0.98652,-1.97303 0.98652,-1.97302 -0.98652,-2.95955 0.98652,-1.97303 0.98651,-1.97302 1.97303,-0.98652 0,-0.98651 -0.98651,-1.97303 0.98651,-0.98652 0.98651,-0.98651 -1.97302,-1.97303 -2.95955,0 0.98652,-3.94606 1.97303,-2.95954 -0.98652,-0.98651 0,-1.97303 0,-1.97303 0.98652,-0.98651 2.95954,-2.95955 2.95954,-0.98651 0,-0.98652 -0.98651,-8.87862 -0.98652,-0.98652 -0.98651,-0.98651 0.98651,-1.97303 0.98652,0 -0.98652,-0.98651 0,-0.98652 -3.94605,0 -2.95955,1.97303 -1.97303,-0.98651 -1.97302,-0.98652 -0.98652,0.98652 0,0 z"
                                        data-title="Кемеровская область" data-code="RU-KEM"></path>
                                    <path
                                        d="m 377.0162,392.78921 -1.97302,-0.98651 -1.97303,-1.97303 -0.98652,1.97303 0,0.98651 -0.98651,1.97303 0,0.98652 0,0.98651 -1.97303,0.98652 -0.98651,1.97302 0.98651,1.97303 0,1.97303 -0.98651,0 -2.95955,0 -1.97303,0.98652 -1.97302,1.97302 0,0 -0.98652,0 -0.98651,0 0,1.97303 0.98651,0.98652 -1.97303,1.97303 -0.98651,4.93257 0.98651,1.97303 0.98652,2.95954 0,0.98651 -0.98652,0.98652 -0.98651,1.97302 -0.98652,2.95955 1.97303,0 1.97303,0 0.98652,-0.98652 0.98651,-0.98651 0.98651,0.98651 0.98652,0 0.98651,0 0.98652,0 -1.97303,1.97303 -1.97303,0.98652 2.95954,5.91908 3.94606,6.9056 0.98651,-1.97303 1.97303,-0.98651 0.98652,0.98651 0,0.98652 1.97303,-0.98652 1.97302,0 2.95955,0.98652 2.95954,0 0,0 0.98651,-0.98652 0,0 6.9056,-2.95954 5.91909,-1.97303 0,0.98652 0.98651,2.95954 0.98652,0.98651 0,0.98652 0,0.98651 0.98651,0 0.98652,0.98652 -0.98652,0.98651 -0.98651,0 4.93257,5.91909 2.95954,-2.95955 4.93257,-2.95954 0,1.97303 1.97303,0 0,-1.97303 1.97303,0 1.97303,0 1.97303,0 1.97303,0 0.98651,-0.98651 2.95954,-1.97303 0.98652,-1.97303 0.98651,-0.98652 0,-1.97302 -0.98651,-1.97303 0.98651,-1.97303 0.98652,-1.97303 -0.98652,-0.98651 0,-0.98652 0,-1.97303 -0.98651,-2.95954 0,-0.98651 0.98651,-1.97303 -1.97303,0 -1.97303,0 -0.98651,0 -0.98651,-0.98652 -0.98652,2.95955 -1.97303,0.98651 -0.98651,0 0,-0.98651 0,0 -0.98652,-0.98652 0.98652,-0.98651 0.98651,-0.98652 0,-3.94605 0,-0.98652 0,-1.97303 -0.98651,0 -1.97303,0 -0.98651,0.98652 0,0.98651 -0.98652,-0.98651 -0.98651,0 -4.93257,0 -0.86436,-3.94606 -7.02776,-0.98651 -4.8742,-7.8498 -6.92458,-3.89609 0.92159,-1.02052 z"
                                        data-title="Новосибирская область" data-code="RU-NVS"></path>
                                    <path
                                        d="m 417.46329,445.07447 -0.98652,0 -2.95954,0 0,1.97303 -0.98651,0 -0.98652,-1.97303 -4.93257,2.95954 -2.95954,2.95955 -3.94606,-5.91909 0,0 0.98652,-0.98651 -0.98652,-0.98652 -0.98651,0 0,-0.98651 0,-0.98652 -0.98652,-0.98651 -0.98651,-2.95954 0,-0.98652 -5.91909,1.97303 -6.9056,2.95954 0,0 -0.98651,0.98652 0,0 -2.95954,0 -2.95955,-0.98652 -1.97302,0 -0.98652,0.98652 -0.98651,-1.97303 -0.98652,0 -0.98651,0.98651 -1.97303,1.97303 6.9056,35.51451 3.94606,-0.98651 0,-0.98651 0,-0.98652 0.98651,0 0.98652,0 0,-0.98651 0.98651,-0.98652 1.97303,4.93257 1.97303,3.94606 3.94605,0.98652 1.97303,0.98651 2.95955,0 0.98651,0 0,-0.98651 0.98651,0 0.98652,0 0.98651,0 0.98652,-0.98652 3.94605,2.95954 1.97303,3.94606 2.95954,0 0,-0.98651 0,-1.97303 0,-0.98652 -1.97302,-1.97302 -1.97303,-1.97303 1.97303,-0.98652 1.97302,0.98652 0,-0.98652 0.98652,0 1.97303,-0.98651 3.94605,0 2.95955,0 0.98651,-0.98652 0.98652,-0.98651 0.98651,0 0.98651,0 0.98652,-1.97303 0.98651,-1.97303 0.98652,0.98652 0.98651,0.98651 0.98652,0 1.97302,0 0,0 0.98652,0.98652 1.97303,-1.97303 -0.98652,-1.97303 0.98652,-1.97303 2.95954,-0.98651 0,-2.95955 -0.98651,-1.97302 0.98651,-0.98652 0,-0.98651 -0.98651,-0.98652 0,0 0.98651,-1.97303 0.98651,-1.97302 -0.98651,0 -1.97303,-0.98652 -0.98651,-1.97303 0,-2.95954 -0.98652,-0.98651 -0.98651,-0.98652 -0.98652,-0.98651 0,-1.97303 -0.98651,0 -1.97303,-0.98652 0,-1.97302 -1.97303,-1.97303 -2.95954,1.97303 -0.98651,0.98651 -1.97303,0 -1.97303,-0.98651 z"
                                        data-title="Алтайский край" data-code="RU-ALT"></path>
                                    <path
                                        d="m 93.196032,417.45207 -2.07168,-2.95954 -2.959542,-4.93257 -1.578423,-0.98652 -0.69056,-0.98651 -1.775726,0.98651 -2.76224,1.97303 -1.38112,-0.98651 -1.479771,0.98651 0.591909,0 -0.197303,1.97303 -1.874377,0 -1.479772,0 1.479772,0.98651 -0.493258,2.95955 0.493258,0 0.197302,0.98651 0.09865,0.98652 1.38112,0.98651 1.282468,0 -0.295954,0.98651 -0.09865,0.98652 1.677074,0 1.677074,0 0.493257,1.97303 -0.295954,1.97302 -2.170331,0.98652 -2.466286,0.98651 -1.677074,2.95955 -0.986515,1.97302 -1.578422,0 -1.479772,0 -0.493257,0 -0.394606,0.98652 -1.085165,-0.98652 -2.170332,0 -2.07168,0.98652 -1.183817,0.98651 -1.479771,1.97303 1.973028,4.93257 2.564938,3.94606 0.69056,6.9056 2.170331,5.91909 2.367634,0 2.564937,-0.98652 3.354149,0 2.860891,-1.97303 0,-8.87863 0.986514,-8.87862 5.623131,-4.93258 2.466286,-0.98651 -0.394606,-0.98651 -1.085165,0 -0.295955,0 0.394606,-2.95955 0.394606,-2.95954 -1.479772,-4.93257 4.14336,-1.97303 z"
                                        data-title="Республика Дагестан" data-code="RU-DA"></path>
                                    <path
                                        d="m 74.057656,380.95104 -2.76224,-0.98651 0.591908,-0.98652 -0.295954,-0.98651 -1.282468,0 -1.183817,0.98651 -0.197303,-0.98651 0.09865,-0.98651 -0.986514,0 -0.69056,-0.98652 -1.677074,-1.97303 -1.973029,-0.98651 -0.493257,1.97303 -0.493257,0.98651 -1.775726,-0.98651 -1.479771,-0.98652 -1.282469,1.97303 -0.789211,2.95954 0.887863,2.95955 -0.591909,1.97303 0.789212,0.98651 -1.479772,1.97303 -1.578423,0.98651 -0.394605,-0.98651 -0.493257,0 0.09865,3.94606 1.578423,1.97302 1.282468,2.95955 1.38112,0 1.282469,0.98651 -0.394606,0.98652 -0.09865,0 -2.170332,0 -1.677074,0.98651 0.394606,0.98651 1.085165,0 -0.789211,0.98652 -1.183817,1.97303 2.268983,0 2.564937,0.98651 0.493257,0.98652 -0.197303,0.98651 2.76224,1.97303 2.170331,0 1.874377,1.97303 1.085166,0.98651 0.493257,0 -0.789211,0.98652 -0.986514,0 2.466285,1.97302 0.394606,2.95955 2.170331,-0.98652 1.479772,-0.98651 0.394605,0.98651 0.789212,0.98652 0.789211,0 0.986514,0 0.493258,-2.95955 -1.479772,-0.98651 1.479772,0 1.874377,0 0.197303,-1.97303 -0.591909,0 1.479771,-0.98651 1.38112,0.98651 2.76224,-1.97303 1.775726,-0.98651 -0.789212,-4.93257 -2.268982,-4.93257 -1.38112,-1.97303 -0.591909,-1.97303 0.394606,-1.97303 0.295954,-2.95954 -1.183817,-1.97303 -1.479771,-1.97303 -0.789212,-1.97303 -0.887863,-1.97303 -3.156845,0 z"
                                        data-title="Ставропольский край" data-code="RU-STA"></path>
                                    <path
                                        d="m 60.641062,404.62739 -0.493257,-0.98652 -2.564937,-0.98651 -2.268983,0 -1.677074,0 -1.085166,0 -3.847406,2.95954 2.663589,3.94606 1.38112,4.93257 0.887863,0 0.887863,0.98651 2.268982,-0.98651 2.170332,-0.98652 0.789211,0.98652 0.591909,0.98651 1.085165,-0.98651 0.986515,0 0.789211,0.98651 1.183817,0 1.479771,-0.98651 1.183818,-2.95954 0.986514,0 0.789211,-0.98652 -0.493257,0 -1.085166,-0.98651 -1.874377,-1.97303 -2.170331,0 -2.76224,-1.97303 0.197303,-0.98651 z"
                                        data-title="Кабардино-Балкарская Республика " data-code="RU-KB"></path>
                                    <path
                                        d="m 56.201748,392.78921 -1.578423,-1.97302 -1.578423,0 0.09865,0.98651 -3.551452,1.97303 -1.578423,-1.97303 -1.578422,-2.95954 -3.354149,1.97303 -3.255497,1.97302 3.4528,6.9056 5.425828,5.91909 3.847406,-2.95954 1.085166,0 1.677074,0 1.183817,-1.97303 0.789211,-0.98652 -1.085165,0 -0.394606,-0.98651 1.677074,-0.98651 2.170332,0 0.09865,0 0.394606,-0.98652 -1.282469,-0.98651 -1.38112,0 -1.282468,-2.95955 z"
                                        data-title="Карачаево-Черкесская Республика" data-code="RU-KC"></path>
                                    <path
                                        d="m 61.528925,357.2747 -4.439314,-1.97303 -3.058195,-0.98651 0.493258,-0.98652 1.282468,-0.98651 -0.394606,-0.98651 0.197303,-0.98652 -1.085165,-0.98651 -1.38112,0 0,0.98651 -0.295955,0.98652 -0.09865,0 -0.887863,-0.98652 -0.493257,-0.98651 -1.38112,-0.98652 -1.282469,0 -0.591908,-0.98651 -0.69056,-0.98652 0,5.91909 0.295954,4.93257 -0.493257,-0.98651 -0.493257,0 -0.09865,-1.97303 0,-0.98652 -1.282469,0.98652 -1.38112,0.98651 0,-0.98651 0.394606,0 -0.69056,-0.98652 -1.874377,0.98652 -1.775726,0.98651 -0.986514,0 -1.183817,0 -1.282469,0.98652 -1.578423,0 -2.663588,-1.97303 -1.677074,-2.95954 -0.295955,1.97302 0.197303,0.98652 -1.677074,-0.98652 -1.38112,0 1.183817,1.97303 0.986514,3.94606 -0.69056,1.97303 0.197303,1.97303 0.69056,0.98651 0.69056,0 0.493257,0 0.09865,2.95954 -0.09865,1.97303 2.07168,5.91909 0.591909,6.9056 0.197303,7.89211 3.255497,0 1.282468,1.97303 0.789212,0.98651 0.69056,0 3.156845,-1.97302 3.354149,-0.98652 1.578422,1.97303 1.578423,1.97303 3.551452,-1.97303 -0.09865,-0.98651 1.578423,0 -0.09865,-3.94606 0.493257,0 0.394605,0.98651 1.578423,-0.98651 1.479772,-1.97303 -0.789212,-0.98651 0.591909,-1.97303 -0.887863,-2.95955 0.789211,-2.95954 1.282469,-1.97303 1.479771,0.98652 1.775726,0.98651 0.493257,-0.98651 0.493257,-1.97303 0.493257,-0.98651 -0.09865,-1.97303 0.591908,0 0.493258,-0.98652 -0.493258,0 -1.183817,0 -2.268983,-3.94605 0.493258,-0.98652 0.394605,-0.98651 -0.394605,-0.98652 -0.197303,-0.98651 0.69056,0 0.887863,-0.98652 -0.394606,-1.97302 -1.183817,-0.98652 z m -13.712548,12.82469 0.493257,2.95954 2.76224,2.95954 0.986514,4.93257 -1.183817,0.98652 -0.591909,0.98651 -0.493257,0.98652 -0.493257,0.98651 -0.591909,0 -0.986514,0 0.394606,-1.97303 0.295954,-1.97303 -2.170331,0.98652 -1.282469,1.97303 -0.789211,0.98651 -0.887863,0 -1.282468,1.97303 -1.973029,1.97303 -1.973029,-1.97303 -1.183817,-2.95954 0.394606,-0.98652 0.986514,-0.98651 0.789212,0 0.394605,0.98651 -0.197302,0.98652 1.282468,0 0.986514,-0.98652 -0.295954,-0.98651 -0.197303,-1.97303 2.268983,-1.97303 2.268983,0 0.295954,-2.95954 -0.69056,-2.95954 -1.085166,0 -0.887862,1.97302 -0.591909,0 -1.578423,-1.97302 -1.775725,-1.97303 -0.493258,-0.98652 -0.295954,-0.98651 0.789212,-0.98652 0.986514,0.98652 1.578423,1.97303 3.354148,0.98651 2.663589,-0.98651 z"
                                        data-title="Краснодарский край" data-code="RU-KDA"></path>
                                    <path
                                        d="m 100.20028,334.58487 -0.789207,0 -0.69056,0.98652 -4.242012,0.98651 -4.044709,-0.98651 -2.268982,-1.97303 -3.156846,2.95954 -4.14336,-0.98651 -0.69056,0.98651 0,1.97303 0.789212,0 0.591908,0.98651 -1.479771,0 -2.76224,0 -0.295954,0.98652 0.295954,0.98651 -0.789212,1.97303 -0.69056,0.98652 -1.775725,1.97302 -2.564937,0.98652 -3.156846,-1.97303 -3.058194,-2.95954 -1.085166,0 -0.986514,0 -1.775726,0 -1.775725,-0.98652 -2.466286,1.97303 -2.663588,1.97303 1.677074,0.98651 0.887863,0.98652 2.860891,0.98651 2.170331,0.98652 -0.197303,0.98651 -0.591908,0 -0.789211,1.97303 -0.591909,-0.98651 -0.986514,0 -1.775726,-0.98652 -1.578423,0 -0.197303,0.98652 0.394606,0.98651 -1.282468,0.98651 -0.493258,0.98652 3.058195,0.98651 4.439314,1.97303 1.183817,0.98652 0.394606,1.97302 -0.887863,0.98652 -0.69056,0 0.197303,0.98651 0.394605,0.98652 -0.394605,0.98651 -0.493258,0.98652 2.268983,3.94605 1.183817,0 0.493258,0 -0.493258,0.98652 -0.591908,0 0.09865,1.97303 -0.493257,0.98651 1.973029,0.98651 1.677074,1.97303 3.551451,-0.98651 2.663589,-0.98652 4.242011,2.95955 3.058194,6.9056 1.775726,0.98651 1.479771,-0.98651 0.493257,0.98651 0.394606,0 1.085166,-0.98651 0.789211,-1.97303 2.564937,0 2.466286,0 0.197303,-0.98652 0.197303,0 2.762239,-2.95954 1.38112,-2.95954 -2.959542,0 -1.677075,-0.98652 0.591909,-0.98651 -0.591909,-0.98651 -0.69056,-0.98652 -0.887862,0 -0.69056,0 0.493257,-0.98651 0,-0.98652 -0.789212,0 -0.887862,0 0.197302,-0.98651 0.789212,-4.93257 -1.479772,-2.95955 -0.986514,-1.97302 0.493257,-0.98652 0.986515,0 1.183817,-0.98651 1.282468,-0.98652 3.255497,0.98652 3.551452,-1.97303 -0.197303,-2.95954 -0.493257,-1.97303 -0.591909,-0.98652 -0.394606,0 2.762241,-2.95954 2.663588,-1.97303 -0.98651,-4.93257 -0.19731,-3.94606 z"
                                        data-title="Ростовская область" data-code="RU-ROS"></path>
                                    <path
                                        d="m 190.56501,337.54442 -1.97303,-2.95955 -0.98651,2.95955 -1.97303,1.97302 -0.98652,0 -0.98651,0 -0.98651,0.98652 0,0 -2.95955,-1.97303 -1.97303,-1.97303 -1.97302,0 -1.97303,-0.98651 -0.98652,0 -1.97303,0.98651 -1.97302,0 -0.98652,0 -1.97303,4.93257 -1.97302,2.95955 0,0.98651 0.98651,1.97303 0,1.97303 0.98651,0.98651 1.97303,0.98652 0,0.98651 0,0.98651 0,0.98652 0.98652,0 0,0.98651 0,1.97303 0,0 0.98651,0.98652 0.98651,3.94605 0.98652,2.95955 7.89211,-0.98652 2.95955,-2.95954 3.94605,-1.97303 0.98652,-0.98651 1.97303,0 1.97302,-1.97303 1.97303,-2.95955 1.97303,-0.98651 1.97303,-0.98651 1.97303,-3.94606 2.95954,-0.98652 -1.97303,-1.97302 -0.98651,0 0,-0.98652 0,-1.97303 -0.98652,-0.98651 -1.97302,-1.97303 -1.97303,0 -1.97303,0.98651 -1.97303,-2.95954 z"
                                        data-title="Самарская область" data-code="RU-SAM"></path>
                                    <path
                                        d="m 204.37621,311.89505 0,0 -1.97303,0.98651 -2.95954,-1.97303 0,0 -0.98652,0 -0.98651,0 -1.97303,0 0,0 0,0.98652 -0.98651,0 0,0 -1.97303,0 -1.97303,0.98651 -0.98651,-0.98651 -0.98652,0 -1.97303,0.98651 -0.98651,0 0,0.98651 0,0 -4.93257,0.98652 0,0.98651 0.98651,0.98652 -0.98651,2.95954 -3.94606,0 -0.98651,-0.98651 -0.98652,0 -0.98651,0.98651 0,1.97303 3.94605,0.98651 0.98652,1.97303 1.97303,1.97303 1.97303,0 2.95954,0 0.98651,1.97303 0,2.95954 1.97303,2.95954 1.97303,2.95955 1.97303,1.97302 1.97303,-0.98651 1.97303,0 1.97302,1.97303 0.98652,1.97303 0,0.98651 0,0.98652 0.98651,0 1.97303,1.97302 1.97303,2.95955 0.98651,0 0,0.98651 0,0 -0.98651,0.98652 0,1.97302 1.97303,1.97303 1.97303,-3.94605 0.98651,-1.97303 0,-0.98652 0,0 0.98652,0 -0.98652,0 1.97303,0 0.98651,-0.98651 0.98652,-1.97303 0,-1.97303 0,-0.98651 0,0 -0.98652,0 0.98652,0 -0.98652,-0.98652 0,0.98652 0,-0.98652 0,0.98652 0.98652,-0.98652 0,-0.98651 0.98651,0.98651 3.94606,-0.98651 3.94606,-1.97303 -0.98652,-1.97303 -1.97303,-1.97303 -0.98651,0 -0.98652,-1.97303 2.95955,0 2.95954,-1.97302 -1.97303,-0.98652 -0.98651,0.98652 0,-1.97303 0,-1.97303 0.98651,0 -1.97303,-0.98651 -1.97303,0.98651 0.98652,0.98651 0,0.98652 -1.97303,0.98651 -0.98651,-0.98651 0,0 -0.98652,0 0,-0.98652 -0.98651,0 -1.97303,0 -1.97303,-1.97302 -0.98651,-0.98652 -0.98652,0 1.97303,-0.98651 0.98652,-0.98652 -0.98652,0 -1.97303,-0.98651 -0.98651,-2.95954 0.98651,0 0,-0.98652 -0.98651,0 0,-1.97303 0.98651,-2.95954 -2.95954,-0.98651 z"
                                        data-title="Республика Татарстан" data-code="RU-TA"></path>
                                    <path
                                        d="m 201.41667,302.0299 0,-0.98651 -1.97303,-0.98652 -0.98652,-0.98651 -0.98651,0 -0.98651,0.98651 -0.98652,-0.98651 -0.98651,-0.98651 -2.95955,0 -0.98651,-1.97303 -0.98651,-0.98652 -0.98652,-0.98651 -2.95954,-1.97303 -2.95954,0 -0.98652,0 -0.98651,0.98651 -0.98652,-0.98651 -0.98651,0 -0.98652,1.97303 0.98652,1.97303 -0.98652,0 -0.98651,1.97303 0.98651,0.98651 -0.98651,1.97303 2.95954,0 0.98652,0.98651 4.93257,0.98652 0.98651,2.95954 0,0.98651 0.98652,0.98652 0,1.97303 0.98651,2.95954 0.98652,0 0.98651,0 1.97303,-0.98651 1.97303,0 0,0 0.98651,0 0,-0.98652 0,0 1.97303,0 0.98651,0 0.98652,0 0,0 2.95954,1.97303 1.97303,-0.98651 0,0 0.98651,-0.98652 0.98652,-0.98651 -0.98652,-0.98652 0,-0.98651 0,-0.98652 0,-1.97302 -0.98651,0 0,0 -0.98651,-0.98652 0.98651,-1.97303 0,-0.98651 -1.97303,0 -0.98651,0.98651 0,0 z"
                                        data-title="Республика Марий Эл" data-code="RU-ME"></path>
                                    <path
                                        d="m 180.69987,302.0299 -0.98652,-0.98651 -2.95954,0 -0.98651,0.98651 -1.97303,0.98652 0,0 0,2.95954 0.98651,1.97303 -0.98651,0 -1.97303,0 -1.97303,0.98651 0,0.98652 -0.98651,0 0,0.98651 0.98651,0 -0.98651,3.94606 1.97302,2.95954 2.95955,1.97303 0.98651,-0.98651 0.98652,0 0.98651,0.98651 3.94606,0 0.98651,-2.95954 -0.98651,-0.98652 0,-0.98651 4.93257,-0.98652 0,0 0,-0.98651 0.98651,0 1.97303,0 -0.98651,-2.95954 0,-1.97303 -0.98652,-0.98652 0,-0.98651 -0.98651,-2.95954 -4.93257,-0.98652 z"
                                        data-title="Чувашская Республика" data-code="RU-CU"></path>
                                    <path
                                        d="m 185.63244,275.39402 -1.97303,1.97303 -3.94606,0 -3.94605,-1.97303 0,0.98651 -0.98652,0 -1.97303,0.98652 -0.98651,1.97303 -1.97303,0.98651 -1.97303,-0.98651 -1.97303,-0.98652 -1.97302,1.97303 -0.98652,0.98651 -0.98651,-0.98651 -0.98652,0 0,1.97303 -0.98651,0.98651 0,0.98652 0.98651,0 -1.97303,0 -0.98651,0 0,0 -2.95954,0 -2.95955,0.98651 -2.95954,1.97303 -3.94606,0.98651 0,0.98652 0,0.98651 -0.98651,0 0,0.98652 0.98651,0 1.97303,0.98651 0,1.97303 -0.98651,0.98651 1.97303,1.97303 0.98651,0.98652 1.97303,0 1.97303,0.98651 1.97303,6.9056 1.97303,3.94606 1.97302,-0.98652 1.97303,-0.98651 0,0.98651 0.98652,0 1.97303,-0.98651 2.95954,-0.98652 0.98651,0.98652 -0.98651,0.98651 0.98651,0.98652 0.98652,0 0.98651,0 0,-0.98652 1.97303,-0.98651 1.97303,0 0.98651,0 -0.98651,-1.97303 0,-2.95954 0,0 1.97303,-0.98652 0.98651,-0.98651 0.98651,-1.97303 -0.98651,-0.98651 0.98651,-1.97303 0.98652,0 -0.98652,-1.97303 0.98652,-1.97303 0.98651,0 0.98652,0.98651 0.98651,-0.98651 0.98652,-0.98651 2.95954,0.98651 2.95954,1.97303 0.98652,-0.98652 0.98651,-0.98651 0.98651,-1.97303 0.98652,-0.98651 3.94606,1.97303 1.97302,-0.98652 1.97303,-0.98651 0,0 0.98652,-0.98652 -2.95955,-3.94605 -2.95954,-3.94606 -3.94606,-0.98651 -0.98651,0 -0.98651,0 0,-1.97303 -2.95955,-2.95955 -0.98651,0.98652 z"
                                        data-title="Нижегородская область" data-code="RU-NIZ"></path>
                                    <path
                                        d="m 151.10444,269.47493 -1.97303,-0.98651 -1.97303,0 0.98652,-3.94606 -0.98652,-2.95954 0,0 -3.94605,0.98651 -2.95955,-2.95954 0,-1.97303 0,-0.98651 -2.95954,4.93257 -1.97303,5.91908 0.98652,0.98652 0.98651,1.97303 0,0 0.98651,0.98651 1.97303,1.97303 -1.97303,5.91909 2.95955,3.94605 3.94605,4.93257 3.94606,-0.98651 1.97303,-1.97303 3.94606,0 2.95954,0 0,-0.98651 0.98651,0 1.97303,0 -0.98651,0 0,-0.98652 0.98651,-0.98651 0,-1.97303 -1.97303,-0.98651 -1.97302,-0.98652 0,-0.98651 0,-0.98652 0,-0.98651 -0.98652,0 -2.95954,-2.95954 -0.98652,-1.97303 -0.98651,-0.98652 z"
                                        data-title="Владимирская область" data-code="RU-VLA"></path>
                                    <path
                                        d="m 123.53125 244.78125 L 122.53125 245.75 L 121.5625 245.75 L 119.5 246.75 L 116.71875 247.71875 L 115.0625 251.6875 L 111.3125 255.625 L 112.78125 256.59375 L 113.875 256.59375 L 114.75 258.59375 L 115.75 260.5625 L 118.78125 261.53125 L 119.78125 266.46875 L 118.78125 267.46875 L 118 269.4375 L 120.09375 272.40625 L 121.5625 272.40625 L 121.5625 273.375 L 121.5625 275.34375 L 121.5625 276.34375 L 122.53125 277.3125 L 121.5625 277.3125 L 120.09375 279.28125 L 120.1875 281.28125 L 121.5625 281.28125 L 123.53125 280.28125 L 124.53125 279.28125 L 125.5 280.28125 L 126.5 280.28125 L 128.46875 279.28125 L 131.4375 279.28125 L 132.40625 279.28125 L 133.40625 279.28125 L 134.375 279.28125 L 134.375 278.3125 L 136.34375 279.28125 L 138.34375 279.28125 L 140.3125 273.375 L 138.34375 271.40625 L 137.34375 270.40625 L 136.34375 268.4375 L 135.375 267.46875 L 137.34375 261.53125 L 140.3125 256.59375 L 141.28125 255.625 L 140.3125 253.65625 L 139.3125 251.6875 L 138.34375 251.6875 L 136.34375 251.6875 L 134.375 250.6875 L 133.40625 251.6875 L 132.40625 251.6875 L 131.4375 250.6875 L 128.46875 249.6875 L 125.5 248.71875 L 124.53125 246.75 L 123.53125 244.78125 z M 129.53125 257.9375 L 130.25 259.28125 C 130.60544 259.56445 130.68688 259.7857 131.4375 259.6875 L 131.125 260.65625 L 131.90625 263.125 L 131.5 264.75 L 129 264.96875 L 127.375 263.875 L 125.75 264.75 L 124.96875 263.46875 L 124.34375 264.875 L 122.03125 265 L 120.96875 263.65625 L 119.53125 264.71875 L 119.0625 262.375 L 120.75 261.84375 L 121.28125 259.75 L 123.0625 261.71875 L 124.375 260.46875 L 127.125 261.6875 L 127.5 259.6875 L 128.6875 259.0625 L 129.53125 257.9375 z"
                                        data-title="Московская область" data-code="RU-MOS"></path>
                                    <path
                                        d="m 115.68858,260.5963 -0.98652,-1.97302 -0.88786,-1.97303 -1.08516,0 -1.47978,-0.98652 -7.59618,1.97303 -0.98651,-0.98651 -0.88786,-0.98652 -0.88787,0.98652 -1.67707,0 -1.479772,-2.95955 -2.07168,-0.98651 -0.887863,0.98651 -0.69056,0.98652 -1.578423,0 -1.677074,0.98651 0.591909,4.93257 0.986514,3.94606 -1.578423,1.97303 -0.986514,0.98651 2.268983,3.94606 3.946057,0.98652 3.946056,0.98651 0.69056,-0.98651 0.49326,-0.98652 1.67707,-0.98651 1.97304,0 0.39461,-0.98652 0.29595,0 2.26898,0.98652 2.36765,0.98651 0.49326,0 0.78921,0.98652 1.08516,-0.98652 0.29596,-0.98651 1.57842,0 0.98651,0 1.38112,-0.98652 1.18382,-0.98651 0.78921,-0.98652 0.98652,-1.97302 -0.98652,-3.94606 -3.05819,-1.97303 z"
                                        data-title="Калужская область" data-code="RU-KLU"></path>
                                    <path
                                        d="m 90.039187,309.92202 1.578423,-0.98652 0.197302,-1.97303 -0.887862,-1.97302 -0.887863,-0.98652 -5.919086,-2.95954 -4.636617,-1.97303 -1.085165,-1.97303 -0.887863,-0.98651 -0.69056,0 -0.591909,0 -2.268983,0 -1.874377,-1.97303 -3.551451,5.91908 1.282469,0.98652 1.973028,1.97303 0.493257,1.97303 0.69056,1.97302 0.09865,0.98652 3.255497,0.98651 3.156845,1.97303 -0.09865,0 -0.295954,0 -0.69056,3.94606 0,2.95954 1.282468,0.98652 1.282469,-0.98652 1.183817,3.94606 2.367634,3.94606 0.69056,-0.98652 0.887863,-0.98651 0.986514,-1.97303 1.479771,-2.95954 0.986515,0 0.986514,-0.98652 -0.197303,-1.97303 0,-2.95954 1.38112,0 0.986514,-1.97303 -1.38112,0 -1.282468,-1.97303 z"
                                        data-title="Белгородская область" data-code="RU-BEL"></path>
                                    <path
                                        d="m 666.06488,401.66784 -2.95954,-0.98651 -1.97303,1.97303 1.97303,1.97303 -0.98652,0.98651 -0.98651,0 0,1.97303 0,0.98651 -0.98651,0 0,0.98652 0.98651,6.9056 0.98651,0 0.98652,0 0,2.95954 0,2.95954 -0.98652,0 -0.98651,-0.98651 -1.97303,1.97303 -0.98651,0.98651 -1.97303,-0.98651 -0.98652,0 -1.97302,0 -0.98652,0 -1.97303,0.98651 0,1.97303 -0.98651,0.98651 0,0 0.98651,0 0,0 0,0 0.98652,0.98652 0.98651,0.98651 0,1.97303 -0.98651,0.98651 0,0 0.98651,0 0.98652,1.97303 0,0 0,0.98652 0,0 0.98651,1.97303 -0.98651,0.98651 0,0 0.98651,2.95954 2.95954,1.97303 4.93257,3.94606 0,7.89211 -1.97302,0 -2.95955,0.98652 -0.98651,0 -1.97303,0.98651 -4.93257,4.93257 -5.91909,4.93257 -0.98651,0.98652 -0.98652,0.98651 1.97303,3.94606 1.97303,5.91908 -4.93257,3.94606 -5.91909,0.98652 -0.98651,0.98651 -1.97303,1.97303 -0.98651,-0.98652 -0.98652,0 -0.98651,1.97303 -0.98651,1.97303 -1.97303,0.98652 -2.95955,0.98651 -0.98651,1.97303 -1.97303,1.97303 -0.98651,0.98651 -1.97303,-0.98651 -2.95954,0 -2.95955,1.97303 -1.97303,1.97302 -0.98651,0 -1.97303,-0.98651 -3.94606,0 -0.98651,1.97303 0.98651,2.95954 0,0 0,0.98652 -1.97302,0.98651 -1.97303,1.97303 2.95954,1.97303 1.97303,1.97303 -1.97303,0.98651 -1.97303,0 -1.97303,2.95954 0,3.94606 1.97303,1.97303 3.94606,3.94605 6.9056,0.98652 6.9056,0.98651 0.98651,0 0.98652,-0.98651 0.98651,0.98651 1.97303,0 1.97303,-0.98651 2.95954,-1.97303 6.9056,-1.97303 6.9056,-1.97303 1.97303,-3.94605 6.9056,-5.91909 4.93257,0.98652 3.94606,1.97302 3.94605,0 5.91909,-0.98651 4.93257,2.95954 6.9056,0.98652 1.97303,-2.95955 2.95954,-2.95954 2.95954,-1.97303 1.97303,-1.97303 0,-0.98651 0,-0.98651 0,0 -0.98651,0 0,-0.98652 1.97303,-7.89211 1.97303,-8.87863 2.95954,-3.94606 1.97303,-3.94606 -0.98652,-0.98651 -0.98651,-0.98651 0,-1.97303 -0.98652,-0.98652 -2.95954,0.98652 -0.98651,-2.95955 0.98651,-1.97302 2.95954,-2.95955 0,-0.98651 0.98652,-0.98651 3.94606,-1.97303 4.93257,-2.95955 -1.97303,-2.95954 -2.95954,-2.95954 0,0 0.98651,-1.97303 0,-0.98651 0,-0.98652 0,-0.98651 0.98651,-0.98652 0.98652,-0.98651 -2.95954,-1.97303 -0.98652,0 -0.98651,-0.98651 1.97303,-4.93258 -1.97303,-4.93257 -1.97303,0.98652 -0.98652,0 -0.98651,-2.95955 -1.97303,-2.95954 -2.95954,0.98652 -1.97303,0.98651 0,0.98651 -0.98651,0 -1.97303,-1.97302 0,-1.97303 0.98651,0 0.98652,-0.98652 -1.97303,-0.98651 -1.97303,-0.98652 -0.98652,-0.98651 0,-1.97303 -0.98651,0 -0.98651,0 0.98651,-3.94605 -2.95954,-3.94606 -0.98652,-3.94606 -0.98651,0 -0.98651,0.98652 0,0 -1.97303,-3.94606 0,-1.97303 0,-3.94606 -3.94606,0.98652 -1.97303,-0.98652 z"
                                        data-title="Забайкальский край" data-code="RU-ZAB"></path>
                                    <path
                                        d="m 857.44865,494.40018 -2.95955,0 -1.97302,-0.98651 0,-1.97303 0.98651,-1.97303 -0.98651,-1.97303 -1.97303,-1.97303 -0.98652,-0.98651 0,0 -2.95954,1.97303 -2.95954,2.95954 0,0 -0.98652,0 -0.98651,0 0,0.98652 0.98651,0.98651 0.98652,0.98651 0,0.98652 0.98651,0.98651 1.97303,0 1.97303,0 -1.97303,5.91909 -3.94606,1.97303 0,1.97303 0,1.97302 -3.94605,2.95955 -4.93258,1.97303 -0.98651,-0.98652 -0.98651,-0.98651 -0.98652,0.98651 -0.98651,0.98652 0,-0.98652 0,-0.98651 -0.98652,-0.98652 -0.98651,0.98652 -0.98652,-0.98652 -0.98651,0 -1.97303,2.95955 -0.98651,2.95954 0,1.97303 -1.97303,1.97302 0,4.93258 0,5.91908 -0.98652,1.97303 0.98652,1.97303 -0.98652,0.98651 -0.98651,1.97303 0.98651,2.95954 -1.97302,1.97303 -7.89212,0 -2.95954,0.98652 -0.98651,3.94605 -1.97303,0.98652 -0.98652,0.98651 0.98652,1.97303 0.98651,1.97303 2.95954,5.91909 0.98652,5.91908 0.98651,0.98651 0,0.98652 -0.98651,6.9056 -2.95954,0.98651 -0.98652,1.97303 0.98652,0 0.98651,0.98652 0.98651,1.97302 0.98652,1.97303 0.98651,-1.97303 0,-0.98651 -0.98651,-0.98651 -0.98652,-0.98652 3.94606,0 0,0 0.98652,0 0,-0.98651 0,-0.98652 0.98651,-3.94605 1.97303,-2.95955 -0.98652,-0.98651 0.98652,-0.98652 0.98651,0 0,0.98652 0,1.97303 0.98652,-0.98652 0.98651,-0.98651 0.98651,-0.98652 0,-0.98651 0.98652,2.95954 0,1.97303 0.98651,0 0,-0.98651 0.98652,0 0.98651,0.98651 0.98652,-0.98651 0,0 1.97302,0.98651 0.98652,0.98652 0,0 0,-1.97303 0.98651,0.98651 0,0 1.97303,-0.98651 1.97303,-1.97303 5.91909,-5.91909 3.94605,-6.9056 0.98652,-0.98651 0,-1.97303 0.98651,0 0,-0.98651 0,-2.95955 0.98652,-2.95954 0,-1.97303 1.97302,-1.97303 0.98652,-4.93257 1.97303,-5.91908 1.97303,-5.91909 1.97302,-4.93257 0.98652,-4.93257 0.98651,-5.91909 0,-1.97302 0,-2.95955 0.98652,-3.94605 0,-2.95955 z"
                                        data-title="Приморский край" data-code="RU-PRI"></path>
                                    <path
                                        d="m 982.79501,296.8355 2.61054,-0.87262 2.32698,1.45437 5.09028,-0.58175 -1.74524,-1.74524 -2.18155,0.7272 -3.34503,-1.16351 0.4363,-1.45436 -2.76329,1.89067 z m 13.13337,-5.29078 2.5664,0.0551 0.8705,-0.56693 2.62002,-0.23297 -0.2181,-0.50903 -6.10842,0.58175 z m -45.74739,-26.01584 -1.97303,0 0,0.98651 0,1.97303 0,3.94606 0,3.94605 0,0.98652 0.98651,0 0,-0.98652 0,-1.97303 0.98652,-1.97302 0,-0.98652 0,-0.98651 0.98651,-0.98652 0.98652,-1.97303 z m 3.94605,-62.1504 -0.98651,0.98651 0,0.98652 0,1.97302 -0.98651,0 -0.98652,0 -0.98651,0.98652 -0.98652,0.98651 -2.95954,-0.98651 -3.94606,-0.98652 -3.94605,0 -3.94606,0.98652 -0.98652,-5.91909 -0.98651,-4.93257 -2.95954,0 -1.97303,0 -0.98652,-0.98651 -1.97302,0 -2.95955,0.98651 -2.95954,0.98652 0,-0.98652 -0.98651,0 -1.97303,0 -1.97303,0.98652 0,0 -0.98652,0.98651 -1.97302,1.97303 -1.97303,0.98651 -0.98652,0 -3.94605,0.98652 0,0.98651 -0.98652,0.98652 -0.98651,0 -0.98652,0 -1.97302,0.98651 -0.98652,0.98651 -1.97303,0.98652 0.98652,2.95954 0.98651,0.98652 1.97303,3.94605 0,1.97303 0,1.97303 1.97303,2.95954 2.95954,2.95955 0,1.97302 0.98652,1.97303 0,0.98652 0.98651,1.97303 1.97303,1.97302 3.94605,1.97303 0.98652,2.95954 -0.98652,0.98652 0.98652,0.98651 0.98651,0 0,1.97303 0,0.98652 0.98652,0.98651 0.98651,1.97303 0.98652,0 0.98651,-0.98652 0,-0.98651 0.98651,0.98651 1.97303,0 0,-2.95954 -2.95954,0 -1.97303,-3.94606 0,-1.97302 -0.98651,-0.98652 -0.98652,-2.95954 2.95955,-1.97303 0.98651,-2.95954 2.95954,0 0.98652,0 0.98651,0 -1.97303,1.97303 -0.98651,3.94605 1.97303,2.95955 1.97303,2.95954 0,1.97303 0.98651,1.97303 0.98651,0 0.98652,0 0.98651,2.95954 0,1.97303 0.98652,0.98651 0.98651,0.98652 -0.98651,1.97302 -1.97303,1.97303 0,0 0,0 0,1.97303 0,0.98652 -0.98652,0.98651 -0.98651,1.97303 0,2.95954 0.98651,0.98652 -0.98651,5.91908 0,4.93257 -0.98651,0.98652 0,0.98651 -0.98652,3.94606 0,3.94605 0.98652,0.98652 0.98651,0.98651 0,0.98652 -0.98651,0.98651 0,2.95954 0,2.95955 -0.98652,3.94605 -0.98651,3.94606 -0.98652,1.97303 -0.98651,0.98651 0,0.98652 0,1.97303 -1.97303,0.98651 -1.97303,0.98652 1.97303,0.98651 1.97303,2.95954 0,5.91909 -0.98652,4.93257 1.97303,5.91908 2.95955,5.91909 13.8112,18.74377 17.75725,17.75726 2.95954,4.93257 3.94606,3.94606 2.95954,1.97302 0,0 0.98652,-4.93257 0,-4.93257 0.98651,-0.98651 0.98652,-2.95954 -0.98652,-8.87863 -1.97303,-1.97303 -0.98651,0 0,-0.98652 0,-0.98651 -0.98651,-1.97303 -0.98652,0 -0.98651,-0.98651 0.98651,-0.98652 1.97303,0.98652 0,0 2.95954,-6.9056 1.97303,-0.98652 0.98652,0 0,-0.98651 -4.93258,-3.94606 -1.97302,-5.91908 0,-4.93258 2.95954,-4.93257 0.98651,0 0.98652,0.98652 1.97303,-3.94606 0,-2.95954 -2.95955,-1.97303 -2.95954,-1.97303 -2.95954,-6.9056 0.98651,-6.9056 0,-0.98651 -0.98651,-0.98652 0.98651,-1.97303 0.98652,0.98652 0,2.95954 1.97302,0 0.98652,-2.95954 -4.93257,-3.94606 0,-0.98651 -0.98652,0.98651 -0.98651,0.98652 -2.95954,-2.95955 -1.97303,-2.95954 0,-2.95954 -0.98652,-2.95955 -1.97302,0 -1.97303,0 -0.98652,0 -0.98651,0.98652 0.98651,0.98651 -1.97303,0.98652 -1.97302,-0.98652 -2.95955,-8.87862 0,-4.93258 0,-0.98651 -0.98651,-0.98651 0,0 0.98651,0 0,-0.98652 0,0 -0.98651,0 0,-0.98651 0,-0.98652 0,-0.98651 -0.98652,-0.98652 -0.98651,0 -0.98651,-4.93257 1.97302,-3.94605 0.98652,-0.98652 -0.98652,-0.98651 2.95955,0 1.97303,0.98651 0.98651,-2.95954 -1.97303,-0.98652 0,-0.98651 1.97303,-3.94606 0.98651,-3.94605 0.98652,0.98651 3.94606,5.91909 0,-2.95955 0,-3.94605 0.98651,-4.93258 2.95954,-5.91908 3.94606,-1.97303 4.93257,-1.97303 3.94606,1.97303 2.95954,0 -0.98651,-2.95954 -1.97303,-2.95954 0.98651,-1.97303 0.98652,-2.95955 0,-1.97302 0,-1.97303 0,-0.98652 0.98651,-0.98651 -0.98651,-1.97303 -0.98652,0 0.98652,-0.98651 0.98651,0 -0.98651,-0.98652 -0.98652,-0.98651 0.98652,0 0.98651,-2.95955 -0.98651,-0.98651 -0.98652,0 0.98652,-0.98651 0.98651,-0.98652 0,-2.95954 -0.98651,0 0,-0.98652 0,-0.98651 0.98651,0 0.98651,-1.97303 0,-1.97303 0.98652,-0.98651 -0.98652,-0.98652 0,-0.98651 -1.97302,0 -1.97303,0.98651 -1.97303,-1.97302 -0.98652,-0.98652 -9.86514,11.83817 z"
                                        data-title="Камчатский край" data-code="RU-KAM"></path>
                                    <path
                                        d="m 872.24636,215.21665 0,0 -0.98651,0 -1.97303,0.98651 -0.98652,0 -1.97303,0 -0.98651,-3.94605 0,0 -1.97303,-0.98652 -2.95954,0 0,0 0,1.97303 -1.97303,0.98651 -0.98651,2.95955 -0.98652,1.97303 -0.98651,0 -1.97303,-0.98652 -0.98651,0.98652 -0.98652,0.98651 -2.95954,0.98651 -3.94606,0.98652 0,0.98651 0,0.98652 -0.98651,0 -0.98652,0 -0.98651,0 0,1.97303 0.98651,1.97302 -0.98651,1.97303 -0.98652,1.97303 0,2.95954 1.97303,0.98652 -1.97303,2.95954 0,4.93257 1.97303,1.97303 1.97303,0.98651 -0.98651,1.97303 0,0.98652 0.98651,0 0,0.98651 0,0.98652 -1.97303,0 -0.98651,2.95954 -0.98652,1.97303 -0.98651,0.98651 -1.97303,0.98652 0,0.98651 -0.98651,1.97303 -2.95955,-0.98652 -3.94605,-1.97302 -0.98652,1.97302 -1.97303,1.97303 -1.97302,0 -1.97303,0.98652 1.97303,2.95954 -0.98652,2.95954 -0.98651,0.98652 -0.98652,-0.98652 -0.98651,0.98652 -0.98652,0.98651 -1.97302,0.98652 -1.97303,0 0,0 -0.98652,2.95954 -0.98651,3.94606 0.98651,8.87862 1.97303,1.97303 2.95954,1.97303 0,0.98651 -0.98651,1.97303 0.98651,0.98652 0,1.97303 -0.98651,1.97302 0,3.94606 4.93257,-0.98651 3.94606,-0.98652 5.91908,3.94606 2.95955,5.91909 -0.98652,0 0,0.98651 0,1.97303 0.98652,0.98651 -2.95955,0.98652 0,4.93257 2.95955,0 3.94605,0 3.94606,1.97303 2.95954,2.95954 0,1.97303 0,0.98651 2.95955,-0.98651 0.98651,0 0,0 1.97303,-1.97303 1.97303,-1.97303 1.97303,0 2.95954,-0.98651 0,0 -0.98651,-0.98652 -0.98652,0 0,0 0,-1.97303 0.98652,0 0,-0.98651 0,-2.95954 2.95954,-0.98652 2.95954,-0.98651 2.95954,0 0.98652,0 0,0 -0.98652,0 0,0.98651 0.98652,0 0.98651,0 0,-1.97303 2.95954,-1.97302 1.97303,0.98651 1.97303,0.98651 1.97303,-0.98651 0.98651,0 0,0.98651 -0.98651,0 -1.97303,1.97303 -1.97303,0.98652 0.98652,2.95954 0.98651,0 1.97303,-0.98651 1.97303,-2.95955 0.98651,-0.98651 1.97303,0 1.97303,-0.98652 0,0 0,-0.98651 0,-1.97303 0.98651,-1.97303 0,0 2.95955,-0.98651 1.97303,0 0.98651,-0.98652 0,-1.97302 1.97303,0 0.98651,0 -0.98651,-0.98652 0.98651,0 0.98652,-0.98651 0,0 -0.98652,-1.97303 -1.97303,-0.98652 -1.97302,0.98652 -0.98652,0.98651 0,0.98652 -0.98651,0.98651 -0.98652,0 0,-0.98651 0,-0.98652 0,-1.97303 -0.98651,0 -0.98652,-0.98651 0,-0.98651 0.98652,-0.98652 -0.98652,0 0,-0.98651 0,-0.98652 0,-0.98651 0,-0.98652 0,-1.97302 1.97303,-3.94606 0.98652,-4.93257 -0.98652,-0.98652 0,-0.98651 0,-2.95954 0.98652,-1.97303 0,0 -0.98652,-1.97303 -0.98651,-1.97303 1.97303,-3.94606 0.98651,-2.95954 1.97303,0 0.98651,-0.98651 3.94606,-5.91909 2.95954,0 1.97303,0.98652 0.98652,-2.95955 0,-1.97303 1.97303,1.97303 0.98651,1.97303 0,1.97303 0,1.97303 0.98651,0.98651 0.98652,0.98652 0,0.98651 0.98651,0.98652 0.98652,-0.98652 0.98651,-0.98651 0.98651,1.97303 0.98652,2.95954 1.97303,-9.86514 1.97303,-10.85166 -0.98652,0 -0.98651,-1.97303 -0.98652,-0.98651 0,-0.98652 0,-1.97303 -0.98651,0 -0.98652,-0.98651 0,-0.98652 0,-2.95954 -3.94605,-1.97303 -2.95954,-1.97302 0,-1.97303 0,-0.98652 -0.98652,-1.97303 0,-1.97302 -2.95954,-2.95955 -1.97303,-2.95954 0,-1.97303 0,-1.97303 -1.97303,-3.94605 -1.97303,-0.98652 -1.97303,0.98652 -1.97302,2.95954 -0.98652,0 0,0 -0.98651,0 0,0 -2.95955,0 -3.94605,-0.98652 -2.95955,1.97303 -2.95954,0 -1.97303,-0.98651 -0.98651,0 -1.97303,0 z"
                                        data-title="Магаданская область" data-code="RU-MAG"></path>
                                    <path
                                        d="m 605.88751,176.74259 -0.98651,0 -0.98652,0 0,0.98652 0,1.97303 -0.98651,0 0,0 0.98651,1.97302 2.95955,1.97303 1.97302,-0.98651 0.98652,-1.97303 -3.94606,-3.94606 z m 102.59748,-12.82468 -1.97302,-2.95955 -2.95955,-0.98651 1.97303,1.97303 2.95954,1.97303 z m -9.86514,-22.68983 0,-3.94606 -0.98651,-0.98651 -1.97303,0.98651 1.97303,2.95955 0,1.97302 0.98651,-0.98651 z m 24.66286,9.86514 0.98651,3.94606 0.98652,0.98651 1.97302,0 0,-3.94605 -3.94605,-0.98652 z m 16.77074,11.83817 1.97303,-3.94605 0,-0.98652 -0.98652,-0.98651 -4.93257,-2.95955 -4.93257,0 -1.97303,2.95955 0,3.94605 -0.98651,1.97303 -0.98652,0.98652 -0.98651,0.98651 1.97303,0 1.97303,-0.98651 1.97303,-0.98652 2.95954,0 4.93257,-0.98651 z m -6.9056,-37.48754 0.98651,-0.98651 -4.93257,-0.98652 -3.94605,-0.98651 -0.98652,0.98651 -1.97303,0.98652 -3.94605,-1.97303 -2.95955,-0.98652 0,0.98652 0.98652,0.98651 0,0 -0.98652,0 0,0 -0.98651,0.98652 0,0.98651 0.98651,1.97303 0,0.98651 0.98652,0.98652 0,0 -2.95954,-0.98652 -2.95955,-0.98651 -1.97303,-0.98651 -0.98651,0 -0.98651,-0.98652 0,-0.98651 -0.98652,0.98651 -0.98651,1.97303 -0.98652,1.97303 -0.98651,0.98651 -0.98652,0.98652 0.98652,0.98651 0,0.98652 0,1.97302 -0.98652,1.97303 0.98652,0 0.98651,0.98652 0,1.97303 0.98652,1.97302 1.97303,1.97303 2.95954,0.98652 0.98651,1.97302 0.98652,0.98652 3.94605,0 0.98652,0 0,-2.95954 0,-2.95955 0.98651,0.98652 0.98652,0.98651 0.98651,-0.98651 0.98652,-0.98652 3.94605,-2.95954 0.98652,0 1.97302,0 0.98652,0 0,0 0.98651,-0.98651 0.98652,-0.98652 0.98651,-0.98651 -1.97303,-0.98652 -1.97303,0 -3.94605,-2.95954 -1.97303,-3.94606 2.95954,-2.95954 0,0 0,0.98652 5.91909,7.89211 2.95954,-3.94606 -0.98651,-3.94605 0.98651,-0.98652 z m 23.67634,-5.91908 0,0 -0.98651,0.98651 -2.95954,-0.98651 -2.95955,0.98651 0,0.98651 -0.98651,0.98652 -1.97303,-0.98652 0,-0.98651 -2.95954,0 -1.97303,0.98651 0,1.97303 -0.98652,0.98652 -1.97302,-1.97303 0,-0.98652 -0.98652,1.97303 0.98652,3.94606 3.94605,0.98651 4.93257,0.98652 5.91909,-1.97303 3.94606,-3.94606 0,-1.97303 -0.98652,-1.97302 z m 65.10994,35.51451 -15.78422,9.86514 -4.93258,5.91909 -3.94605,1.97303 -3.94606,-1.97303 -3.94606,-1.97303 -1.97303,0 -0.98651,0 -1.97303,0 -3.94606,-0.98652 0,0.98652 -0.98651,0.98651 -1.97303,0 -0.98651,-0.98651 0.98651,-1.97303 1.97303,-0.98651 -1.97303,-1.97303 -2.95954,-1.97303 -3.94606,0.98651 -2.95954,0.98652 -3.94606,7.89211 -3.94605,6.9056 -0.98652,0 0,-1.97303 0,0 -0.98651,-0.98651 1.97303,-0.98652 0.98651,-0.98651 -0.98651,-0.98651 0,-1.97303 1.97302,-0.98652 0.98652,-1.97303 -1.97303,0.98652 -4.93257,2.95954 -0.98652,0.98652 -0.98651,0.98651 -0.98651,-1.97303 2.95954,-2.95954 0.98651,0 2.95955,-1.97303 2.95954,-0.98651 0,0 -10.85166,0.98651 -10.85166,3.94606 -4.93257,0 -1.97303,0.98651 0.98652,0.98652 1.97303,0.98651 -0.98652,2.95954 -2.95954,0.98652 -1.97303,4.93257 0.98652,0.98651 1.97302,-0.98651 0,0.98651 0,0.98652 0.98652,0.98651 0.98651,1.97303 0,1.97303 1.97303,0.98651 0,1.97303 -1.97303,0 0,0.98651 0,0.98652 -0.98651,-0.98652 -0.98652,-0.98651 -0.98651,0 -0.98651,0.98651 -0.98652,0 -0.98651,0 0,0 0,2.95955 0,2.95954 -3.94606,-1.97303 -6.9056,-0.98651 -2.95954,3.94605 -3.94606,2.95955 -3.94606,-0.98652 -2.95954,-1.97303 -0.98651,-1.97302 1.97303,-0.98652 0,0 -1.97303,-0.98651 -0.98652,8.87863 -0.98651,10.85165 -0.98652,0.98652 -0.98651,-0.98652 -0.98651,-0.98651 0,0 0,0.98651 -0.98652,0 -0.98651,0 -0.98652,-0.98651 0,-0.98652 -0.98651,0 -1.97303,0 -1.97303,-2.95954 -1.97303,-2.95954 -0.98651,0 -0.98652,-0.98652 0.98652,-0.98651 0.98651,-0.98651 -0.98651,-1.97303 -1.97303,-0.98652 0,0 0.98651,0.98652 0,0.98651 -0.98651,0.98652 -1.97303,-1.97303 -0.98651,-1.97303 -4.93257,-2.95954 -1.97303,-0.98652 0.98651,0 1.97303,0 1.97303,1.97303 1.97303,1.97303 2.95954,0 1.97303,-1.97303 -0.98652,-2.95954 -1.97302,-1.97303 0,-1.97303 0,-1.97303 -0.98652,-1.97303 0,-0.98651 -1.97303,-1.97303 -0.98651,0 -0.98652,0 -5.91908,-4.93257 -1.97303,0.98651 -1.97303,0.98652 -0.98651,0 -1.97303,0 -1.97303,0 -2.95954,-1.97303 -3.94606,-0.98651 0,0.98651 -0.98651,0.98651 -1.97303,4.93258 0.98651,3.94605 0,3.94606 -1.97303,-0.98652 -2.95954,0 0,0 0,0.98652 -0.98651,0 -0.98652,0 -1.97303,0.98651 -0.98651,0.98652 -2.95954,-0.98652 -1.97303,-0.98651 -2.95954,0 -2.95955,0 -1.97303,-0.98652 0,-1.97302 1.97303,-1.97303 -0.98651,-0.98652 -0.98652,0 -1.97302,0 -1.97303,0 -2.95954,0 -1.97303,-0.98651 -0.98652,0.98651 -0.98651,0 -1.97303,-0.98651 -1.97303,0 -0.98651,0.98651 -0.98652,0.98652 -1.97303,0.98651 -2.95954,0.98652 0,1.97302 0,0.98652 -1.97303,-1.97303 0.98652,-1.97303 -0.98652,-2.95954 -1.97303,-1.97303 0,0.98652 0,1.97302 -0.98651,0.98652 -2.95954,0 -2.95955,-1.97303 -0.98651,0.98651 -0.98651,2.95955 -1.97303,1.97302 0.98651,0.98652 0.98652,0 0,0.98651 0,0.98652 0,0.98651 0.98651,0.98652 -0.98651,3.94605 0.98651,3.94606 0.98651,0.98651 0,0.98652 0,1.97303 0.98652,0.98651 1.97303,0.98652 1.97303,1.97302 0.98651,3.94606 0,3.94606 1.97303,3.94606 0.98651,2.95954 0,0.98651 -3.94605,2.95955 -3.94606,2.95954 -0.98652,2.95954 0,1.97303 -0.98651,0.98651 -1.97303,0.98652 0,3.94605 -1.97303,2.95955 -1.97303,0 -2.95954,-0.98652 -2.95954,0.98652 -1.97303,1.97303 -1.97303,0 -1.97303,-0.98652 0,0.98652 -0.98651,0 -0.98651,1.97302 0,0.98652 0.98651,3.94606 1.97303,2.95954 0,6.9056 0,6.9056 -0.98652,10.85165 -2.95954,1.97303 -1.97303,1.97303 0.98652,0.98652 0.98651,0.98651 0,3.94606 0,2.95954 0.98652,1.97303 0,1.97303 0,2.95954 0.98651,1.97303 1.97303,1.97303 1.97303,1.97303 -0.98652,1.97302 -0.98651,0.98652 -1.97303,2.95954 0,2.95954 -1.97303,2.95955 1.97303,3.94605 0.98651,0 0.98652,0 0.98651,0.98652 0.98652,0.98651 3.94605,0.98652 3.94606,0 2.95954,0 0.98652,1.97302 0.98651,2.95955 -0.98651,0.98651 -1.97303,2.95954 2.95954,1.97303 3.94606,1.97303 0.98651,6.9056 0,4.93257 1.97303,1.97303 0.98652,2.95954 -0.98652,2.95955 -1.97303,0.98651 0.98652,4.93257 2.95954,2.95955 -1.97303,4.93257 -1.97303,5.91908 0,1.97303 0,0.98651 0,0.98652 -0.98651,0.98651 -0.98652,4.93257 0.98652,3.94606 0.98651,0 0.98652,0 4.93257,-0.98651 0.98651,-1.97303 2.95955,0.98651 0.98651,0 0,-0.98651 0.98651,0 0.98652,0.98651 0.98651,-0.98651 0,0 0.98652,0 1.97303,0 0.98651,-0.98652 1.97303,-1.97302 0,0.98651 1.97303,1.97303 0.98651,0.98651 -0.98651,2.95955 4.93257,-4.93258 3.94605,-5.91908 0.98652,0 0.98651,0 0.98652,-1.97303 0.98651,-2.95954 1.97303,-0.98652 1.97303,0 2.95954,-2.95954 3.94606,0 2.95954,0.98651 1.97303,1.97303 1.97303,0.98652 0,1.97303 0.98651,0.98651 0,0.98651 0,0.98652 4.93257,0 4.93258,0.98651 0.98651,0.98652 0,1.97303 0.98651,1.97302 0,0.98652 0,1.97303 0.98652,1.97303 0.98651,0.98651 0,0.98651 0.98652,1.97303 0,3.94606 0,1.97303 1.97303,3.94606 0,0 0.98651,-0.98652 0.98651,0 0.98652,3.94606 2.95954,3.94606 3.94606,-1.97303 3.94605,-0.98652 1.97303,0.98652 1.97303,0.98651 1.97303,0.98652 2.95954,0 0.98652,0 1.97303,0.98651 0.98651,0.98651 5.91909,0 4.93257,0.98652 1.97303,1.97303 1.97302,1.97302 4.93258,0.98652 2.95954,-0.98652 2.95954,0 1.97303,0.98652 1.97303,0 2.95954,-1.97303 1.97303,-0.98651 1.97303,0 0.98651,0.98651 0.98652,-0.98651 0,-1.97303 0.98651,0 1.97303,0 0.98651,0 0.98652,-0.98652 1.97303,0.98652 2.95954,0.98651 0.98651,-0.98651 0,-0.98652 1.97303,-1.97302 1.97303,-0.98652 0,-0.98651 0.98651,-0.98652 2.95955,0 1.97303,-1.97303 0.98651,-4.93257 0,-3.94605 1.97303,-0.98652 0.98651,-0.98651 0,-1.97303 -0.98651,-1.97303 -1.97303,-0.98651 -0.98651,-0.98652 -0.98652,0 -0.98651,0 0.98651,-1.97303 1.97303,-0.98651 0,-1.97303 0,-0.98651 0.98651,-0.98652 0.98652,-0.98651 -2.95954,-1.97303 -1.97303,-2.95954 0.98651,0 1.97303,0 -0.98651,-3.94606 0.98651,-2.95954 0.98651,-5.91909 0.98652,-1.97303 1.97303,-1.97303 0.98651,0 0.98652,0 4.93257,-1.97302 4.93257,-1.97303 0.98651,-0.98652 0,-0.98651 0,-0.98652 0.98652,-1.97302 0.98651,0 0.98651,0.98651 0.98652,0 1.97303,-0.98651 0,0 4.93257,-2.95955 0.98651,-3.94605 0,-0.98652 0.98652,-0.98651 1.97303,1.97303 0.98651,-0.98652 -0.98651,-2.95954 -0.98652,-1.97303 -1.97303,-3.94606 -0.98651,-4.93257 -1.97303,-2.95954 0.98651,-3.94606 0,-0.98651 0.98652,-0.98652 0,-0.98651 0.98651,-0.98651 0,-0.98652 0,-0.98651 1.97303,-0.98652 0.98652,-0.98651 0,-5.91909 0.98651,-5.91908 3.94606,0 4.93257,1.97303 1.97303,0 0.98651,-0.98652 0.98652,0.98652 0.98651,0.98651 1.97303,-2.95954 1.97303,-1.97303 1.97303,0 0,0.98651 0.98651,-0.98651 0.98651,-0.98652 0.98652,0.98652 1.97303,1.97303 0.98651,-2.95955 0,-2.95954 0,-3.94606 0.98651,-1.97302 0,-1.97303 -0.98651,-0.98652 0.98651,-1.97303 0,-0.98651 -1.97302,-1.97303 -2.95955,-1.97303 -0.98651,-8.87862 0.98651,-3.94606 0.98652,-2.95954 0,0 1.97303,0 1.97302,-0.98652 0.98652,-0.98651 0.98651,-0.98652 0.98652,0.98652 0.98651,-0.98652 0.98652,-2.95954 -1.97303,-2.95954 1.97303,-0.98652 1.97302,0 1.97303,-1.97303 0.98652,-1.97302 3.94605,1.97302 2.95955,0.98652 0.98651,-1.97303 0,-0.98651 1.97303,-0.98652 0.98651,-0.98651 0.98652,-1.97303 1.97303,-2.95954 0.98651,0 0,-0.98652 0,-0.98651 -0.98651,0 0,-0.98652 0.98651,-1.97303 -0.98651,-0.98651 -2.95955,-1.97303 0,-4.93257 1.97303,-2.95954 -1.97303,-0.98652 0,-2.95954 0.98652,-1.97303 0.98651,-1.97303 -0.98651,-1.97302 0,-1.97303 0.98651,0 0.98652,0 0.98651,0 0,-0.98652 0,-0.98651 3.94606,-0.98652 2.95954,-0.98651 0.98652,-0.98651 0.98651,-0.98652 1.97303,0.98652 0.98651,0 0.98652,-1.97303 0.98651,-2.95955 1.97303,-0.98651 0,-1.97303 0,0 -1.97303,-2.95954 -1.97303,-3.94606 0.98652,-0.98651 0,-0.98652 -5.91909,-1.97303 -5.91908,-3.94605 0,-1.97303 0.98651,-1.97303 -0.98651,-0.98651 -0.98652,-0.98652 4.93257,-6.9056 6.9056,-7.89211 0.98652,-0.98652 1.97303,-0.98651 -0.98652,-1.97303 -1.97303,-2.95954 0,-0.98652 0,-0.98651 -1.97303,-0.98651 -0.98651,0 -0.98651,-1.97303 0,0 -0.98652,-0.98652 -0.98651,0 -0.98652,-0.98651 -0.98651,-1.97303 0,0 -0.98652,1.97303 0,0.98651 0,0.98652 -0.98651,0 0,-0.98652 -0.98651,0 0,2.95955 0,1.97302 -0.98652,-1.97302 -1.97303,-1.97303 -2.95954,0.98651 -3.94606,0 -0.98651,-2.95954 -1.97303,-3.94606 -10.85166,-2.95954 z m -96.67839,41.4336 1.97302,0.98651 1.97303,-0.98651 0,-0.98652 -0.98651,-0.98651 -1.97303,0.98651 -0.98651,0.98652 z"
                                        data-title="Республика Саха (Якутия)" data-code="RU-SA"></path>
                                    <path
                                        d="m 454.95083,186.60774 0.98651,1.97302 2.95955,0 0,-2.95954 0,-2.95954 -3.94606,3.94606 z m 25.64937,-35.51452 m -0.98651,0 m -0.98652,1.97303 0.98652,0 0,0.98651 0.98651,0.98652 0.98652,-3.94606 -0.98652,-0.98651 0,0 0,0.98651 z m 5.91909,-74.284523 0,-0.887863 -0.98652,-0.69056 -2.95954,-1.282468 1.97303,1.578422 0,0.493258 0,0.887862 1.97303,-0.09865 z m 16.77074,-22.591176 -2.95954,-0.789212 -1.97303,0.887863 0.98651,0.986514 0.98652,0 1.97303,0.591909 0.98651,-1.677074 z m 100.62445,87.010559 0.98652,0.98651 0,0.98652 1.97303,0.98651 -0.98652,-2.95954 -0.98651,-0.98652 -0.98652,0.98652 z m -64.12342,-7.89212 1.97303,0 0.98651,0 1.97303,-2.95954 -1.97303,0 -0.98651,0.98652 -0.98652,0.98651 -0.98651,0.98651 z m -0.98652,-49.42436 0.98652,-2.860892 -1.97303,-1.973028 -2.95954,-0.986514 -0.98652,-0.493258 -1.97303,1.183817 0,2.564938 1.97303,0.789211 0.98652,0.789211 0,1.183817 0,0.789212 3.94605,-0.986514 z m 21.70332,1.479771 -2.95955,-5.228526 -2.95954,2.170332 -1.97303,3.255497 -0.98651,1.183817 -0.98652,0.591909 0.98652,-1.282469 0.98651,-1.085166 0,-0.197303 0,-0.295954 -0.98651,0.493257 -1.97303,0.789212 0,0 -0.98651,-0.197303 3.94605,-2.268983 0.98652,-3.748754 -2.95955,-1.085166 -3.94605,0.394606 -0.98652,0.197303 0,0.493257 -0.98651,0 -0.98652,0.394606 -1.97302,1.775725 0.98651,1.183817 0,1.183817 -0.98651,0.197303 -0.98652,0.09865 -0.98651,1.183817 -0.98652,1.479771 -0.98651,0.394606 0,0.493257 0,0.986514 0.98651,0.295955 0,-0.789212 0,-0.789211 0.98652,-0.295954 0,0 0,1.381119 0,1.085166 0.98651,-0.09865 0.98652,0.394605 -0.98652,1.874378 0,1.973028 0.98652,0.591909 0,0.591908 0,0.789212 0,0.789211 0.98651,1.085166 0.98651,0 0.98652,-0.986515 0,0.986515 0,0.98651 0.98651,0 1.97303,0 1.97303,1.97303 1.97303,1.97303 3.94606,0.98652 3.94605,-2.95955 -0.98651,-1.97303 0,-1.973025 -0.98652,-1.874377 0,-0.09865 0.98652,-0.09865 0.98651,-4.636617 0.98652,-4.735268 z m 21.70331,27.227789 -0.98651,0 0,0.98652 -0.98652,0.98651 0.98652,0 0.98651,-1.97303 z m 0.98652,3.94606 1.97302,0 0.98652,-0.98651 -0.98652,-0.98652 -0.98651,0 -0.98651,0 -0.98652,0.98652 0,0.98651 0.98652,0 z m -16.77075,-20.223541 0,-0.986514 0,-1.38112 -0.98651,0.394606 -0.98652,0.986514 -0.98651,2.466286 0,1.973029 0,0 0.98651,0.98651 -0.98651,0 0,0 -0.98651,0.98652 0,0 0,0.98651 0,0.98652 0,0.98651 -0.98652,0 0,-0.98651 -0.98651,1.97302 -0.98652,1.97303 0,2.95955 -1.97303,2.95954 -0.98651,2.95954 1.97303,1.97303 2.95954,-1.97303 1.97303,-1.97303 3.94606,0 5.91908,-1.97303 2.95955,-0.98651 0.98651,-2.95954 0,-2.95955 -0.98651,-1.97302 -0.98652,0 0,0.98651 -0.98651,0 0,-1.97303 0,0 0,-0.98651 -0.98652,-0.98652 -0.98651,-0.98651 0,-0.98652 0,-0.986509 -1.97303,1.973029 -1.97303,2.95954 0,0.98652 -0.98651,0 0,-0.98652 2.95954,-8.188066 -1.97303,-1.085166 -0.98651,-0.09865 0,1.775726 -0.98652,1.183817 z m 41.4336,51.792001 0,0.98651 -0.98651,-1.97303 0,-1.97303 -0.98652,-0.98651 -1.97303,0 -1.97302,-2.95954 -1.97303,-2.95954 -0.98652,0.98651 0,0 -0.98651,-0.98651 -0.98652,0 0,0.98651 -0.98651,0 -0.98651,0 -0.98652,0 -1.97303,0 -1.97303,0.98651 -0.98651,-0.98651 -0.98651,0 -0.98652,0.98651 -1.97303,3.94606 -2.95954,0 1.97303,-4.93257 0,-3.94606 -2.95954,0 -2.95955,0 0.98652,-0.98651 0,-0.98652 -2.95954,0.98652 -1.97303,-0.98652 1.97303,-0.98651 1.97302,-1.97303 0.98652,-0.98651 0.98651,0 0.98652,-0.98652 -1.97303,-1.97303 -2.95954,-0.98651 -0.98652,-0.98651 0,-0.98652 -1.97303,0 -1.97303,0.98652 -0.98651,0 0,0 -5.91909,6.9056 -3.94605,6.9056 0.98651,0.98651 0,2.95954 -5.91908,1.97303 -0.98652,-0.98651 -1.97303,0 0,0.98651 1.97303,2.95954 0.98652,1.97303 -1.97303,0 -0.98652,-1.97303 -1.97303,0.98652 -0.98651,0 0,0.98651 -0.98651,0.98652 0,0 -0.98652,0 0,0 0,0.98651 -1.97303,0 -0.98651,0 -0.98652,0.98651 -1.97302,0 0.98651,0 0,-0.98651 -0.98651,-0.98651 -1.97303,0.98651 -0.98652,0.98651 0.98652,-1.97302 0.98651,-0.98652 -5.91908,-1.97303 -5.91909,0.98652 -0.98651,0.98651 1.97303,0.98652 1.97302,0 0,0.98651 -1.97302,0.98651 -1.97303,0 -3.94606,0.98652 -2.95954,0.98651 -1.97303,0 -2.95954,0 -0.98652,0 -1.97303,0.98652 0,0 -3.94605,1.97303 -1.97303,1.97302 -2.95955,0 -2.95954,0 0.98652,0.98652 1.97302,0.98651 -0.98651,0.98652 -1.97303,0.98651 -0.98651,1.97303 0,1.97303 -1.97303,-1.97303 -2.95954,-0.98651 0,0.98651 2.95954,2.95954 1.97303,1.97303 -0.98652,0.98652 0,0 -0.98651,-0.98652 -0.98652,-0.98651 -0.98651,0.98651 0,0 -0.98651,0 -0.98652,0 1.97303,1.97303 2.95954,2.95954 0,0 0,0 -0.98651,0.98652 0,0 0,3.94605 0,1.97303 -0.98652,0 -1.97302,0.98652 -0.98652,0 0.98652,-0.98652 0.98651,-0.98651 0.98651,-0.98652 0,-0.98651 -3.94605,-0.98651 -2.95954,0.98651 -4.93258,0 -5.91908,-0.98651 -5.91909,-0.98652 -0.98651,0 -0.98652,0 -0.98651,0 -1.97303,-0.98651 0,0.98651 -0.98651,1.97303 -0.98652,0.98651 0.98652,0.98652 0,0.98651 0,0 -0.98652,0 0,1.97303 0.98652,0.98652 -0.98652,2.95954 -0.98651,1.97303 0,0.98651 0,0 0,0.98651 -0.98652,0.98652 2.95955,2.95954 2.95954,1.97303 0,2.95954 0,2.95955 2.95954,1.97302 0.98652,3.94606 -1.97303,2.95954 -1.97303,2.95955 0.98651,1.97303 -0.98651,8.87862 -1.97303,0.98652 -1.97303,0.98651 2.95955,6.9056 0.98651,3.94606 -0.98651,0 0,-0.98652 -1.97303,-0.98651 -0.98652,-0.98651 0,-1.97303 0,-1.97303 -0.98651,-1.97303 -0.98652,-0.98651 3.94606,-9.86515 -0.98651,-1.97302 -1.97303,-0.98652 0.98651,-0.98651 0,-0.98652 0,0 0,-0.98651 2.95955,-1.97303 2.95954,-3.94606 -2.95954,-1.97303 -4.93258,-0.98651 -0.98651,-2.95954 -0.98651,-2.95955 -2.95955,-3.94605 -2.95954,-2.95955 -1.97303,0 -0.98651,0 0.98651,1.97303 0.98652,1.97303 1.97302,1.97303 1.97303,1.97303 0,2.95954 -1.97303,1.97303 -0.98651,0.98651 0,-0.98651 -1.97303,0 0,1.97303 0,1.97303 1.97303,1.97303 1.97303,1.97302 0,4.93258 -0.98652,4.93257 -1.97302,0 -1.97303,-0.98652 -1.97303,1.97303 -3.94606,2.95954 -0.98651,0 0,0.98652 0,0 -1.97303,0.98651 0,0.98652 0,1.97303 0.98651,1.97302 0.98652,2.95955 0,0 2.95954,1.97302 1.97303,1.97303 0,0.98652 0.98651,0 1.97303,-0.98652 1.97303,-1.97303 0.98651,0.98652 0,0.98651 0.98652,0.98652 0.98651,0.98651 -0.98651,5.91909 -0.98652,5.91908 -1.97302,4.93257 -3.94606,1.97303 0,0.98652 0,0.98651 0,0 0,0 0,0 0,1.97303 0.98651,1.97303 0,-0.98652 0,0 0,0.98652 0,0 -1.97303,1.97303 0,0.98651 0.98652,1.97303 0.98651,1.97303 0.98652,4.93257 -0.98652,3.94606 0,6.9056 0.98652,2.95954 2.95954,0.98651 0,0.98652 0,0.98651 0,0 0,1.97303 0,1.97303 0,0.98651 -0.98651,1.97303 -0.98652,0 0.98652,2.95954 1.97302,0 0.98652,1.97303 1.97303,0.98652 1.97303,-0.98652 0.98651,2.95955 -0.98651,5.91908 -3.94606,5.91909 -1.97303,0 -0.98651,0.98651 0,1.97303 0.98651,0.98651 1.97303,0.98652 -0.98652,1.97303 -0.98651,0.98651 0,0.98651 -0.98651,1.97303 -2.95955,3.94606 -4.93257,3.94606 0.98652,6.9056 3.94605,1.97303 1.97303,1.97302 -6.9056,3.94606 -7.89211,1.97303 0,7.89211 0,4.93258 4.93257,1.97302 2.95954,-0.98651 3.94606,0.98651 2.95954,0.98652 1.97303,0.98651 0,0.98652 0.98651,0.98651 0.98652,0 1.97303,1.97303 0,2.95954 0.98651,1.97303 2.95954,0.98651 1.97303,2.95955 -1.97303,0.98651 -1.97302,1.97303 -1.97303,2.95954 0,2.95955 3.94605,3.94605 2.95955,4.93257 -0.98652,0.98652 -0.98651,0 0,1.97303 -0.98652,0.98651 -0.98651,0 -0.98651,0 -1.97303,3.94606 -0.98652,1.97303 0,0.98651 0,0.98652 0.98652,0.98651 -0.98652,0 -0.98651,1.97303 0.98651,0.98651 0.98652,0.98652 0.98651,8.87862 0,0.98652 -2.95954,0.98651 -2.95954,2.95955 2.95954,2.95954 2.95954,2.95954 2.95954,0 1.97303,-0.98651 1.97303,1.97303 2.95954,0.98651 0.98652,5.91909 1.97303,5.91908 -1.97303,4.93257 0.98651,0.98652 0,0 0,0.98651 0.98652,0.98652 0.98651,0.98651 0,0.98651 -1.97303,1.97303 -1.97303,0.98652 0,0.98651 -1.97302,3.94606 0,0 -1.97303,0 -0.98652,0.98651 -1.97303,1.97303 -0.98651,2.95954 1.97303,0.98652 0.98651,1.97303 5.91909,1.97302 6.9056,0.98652 6.9056,-3.94606 4.93257,-6.9056 1.97303,-0.98651 1.97303,-0.98652 0.98651,-2.95954 0.98651,-1.97303 1.97303,0 0.98652,0 0.98651,-0.98651 0.98652,0 0,0.98651 0.98651,0 0.98651,0 0.98652,-0.98651 2.95954,0.98651 4.93257,-1.97303 -1.97303,-2.95954 -1.97302,-2.95954 -1.97303,-0.98652 -0.98652,-0.98651 0,-0.98651 0,-0.98652 2.95955,-1.97303 2.95954,-0.98651 0.98651,0 0.98652,-2.95954 0,-2.95955 0,-1.97303 0.98651,-0.98651 0.98652,-0.98651 0,-1.97303 0,-2.95955 3.94605,-3.94605 2.95955,-1.97303 0.98651,0 0.98651,-0.98652 -0.98651,-0.98651 0,-2.95954 0,-1.97303 -0.98651,-1.97303 -1.97303,-0.98651 1.97303,-4.93257 2.95954,-4.93258 2.95954,0.98652 2.95954,0 1.97303,0.98651 3.94606,0 0.98651,-3.94605 0.98652,-0.98652 0.98651,0 0.98652,0 0,0.98652 1.97302,6.9056 3.94606,1.97302 0,-1.97302 0,-0.98652 0,-0.98651 0,-0.98652 -0.98651,0 3.94605,-7.89211 7.89212,-4.93257 0,-0.98652 0.98651,-1.97303 2.95955,-1.97302 1.97302,0 0.98652,0.98651 0,0.98651 0,1.97303 1.97303,0.98652 1.97303,0 -0.98652,0.98651 0,0.98652 1.97303,0 0.98651,0.98651 0.98652,0.98651 0.98651,0 1.97303,-2.95954 0,-0.98651 1.97303,-1.97303 0.98651,-2.95954 -1.97302,-2.95955 -1.97303,-1.97303 0.98651,-0.98651 0.98652,-0.98651 0,-0.98652 0.98651,0 0.98651,0 0.98652,0 0,-0.98651 0,-0.98652 0,-0.98651 0,-0.98652 -1.97303,-1.97302 -2.95954,-0.98652 -1.97303,-7.89211 0.98651,-4.93257 0,-0.98652 0,0 1.97303,-0.98651 0.98652,-0.98652 4.93257,-3.94605 3.94605,-4.93257 0,-1.97303 -0.98651,-0.98652 0.98651,-1.97303 0.98652,-0.98651 -0.98652,-2.95954 -0.98651,-2.95955 0.98651,-3.94605 2.95955,-4.93257 -0.98652,-0.98652 0,0 1.97303,-0.98651 0.98651,0.98651 0.98652,0.98652 0,0 0.98651,-0.98652 0.98652,-0.98651 1.97303,-0.98652 0.98651,0 0,-3.94605 -3.94606,0 -3.94605,-0.98652 -0.98652,-0.98651 -0.98651,-0.98652 -0.98652,0 -0.98651,0 -1.97303,-3.94605 1.97303,-2.95955 0,-2.95954 1.97303,-2.95954 0.98651,-0.98652 0.98652,-1.97302 -1.97303,-1.97303 -1.97303,-1.97303 -0.98651,-1.97303 0,-2.95954 0,-1.97303 -0.98652,-1.97303 0,-3.94606 0,-2.95954 -0.98651,-0.98651 -0.98652,-0.98652 1.97303,-1.97303 2.95954,-1.97303 0.98652,-10.85165 0,-6.9056 0,-6.9056 -1.97303,-2.95954 -0.98651,-3.94606 0,-0.98652 0.98651,-1.97302 0.98651,0 0,-0.98652 1.97303,0.98652 1.97303,0 1.97303,-1.97303 2.95954,-0.98652 2.95954,0.98652 1.97303,0 1.97303,-2.95955 0,-3.94605 1.97303,-0.98652 0.98651,-0.98651 0,-1.97303 0.98652,-2.95954 3.94606,-2.95954 3.94605,-2.95955 0,-0.98651 -0.98651,-2.95954 -1.97303,-3.94606 0,-3.94606 -0.98651,-3.94606 -1.97303,-1.97302 -1.97303,-0.98652 -0.98652,-0.98651 0,-1.97303 0,-0.98652 -0.98651,-0.98651 -0.98651,-3.94606 0.98651,-3.94605 -0.98651,-0.98652 0,-0.98651 0,-0.98652 0,-0.98651 -0.98652,0 -0.98651,-0.98652 1.97303,-1.97302 0.98651,-2.95955 0.98651,-0.98651 0,-1.97303 0.98652,-0.98651 -1.97303,0.98651 -0.98651,0.98652 -1.97303,-0.98652 -2.95955,1.97303 0,0.98651 0,1.97303 1.97303,0 2.95955,-0.98651 0,0.98651 -0.98652,0.98652 -0.98651,0 -1.97303,2.95954 -1.97303,0.98651 -0.98651,-0.98651 0,0 -0.98652,1.97303 -1.97303,0.98651 0,0 0,0 0,1.97303 0,0.98651 -1.97303,-0.98651 -0.98651,-0.98651 0,0.98651 -0.98651,0 -2.95955,0 -2.95954,0 -0.98651,2.95954 -2.95955,2.95955 -0.98651,0 0.98651,-1.97303 1.97303,-1.97303 0,-1.97303 0.98652,-1.97303 2.95954,-0.98651 0.98651,-2.95955 -0.98651,-0.98651 -1.97303,-0.98651 -0.98651,0 0,0 0,0 5.91908,0.98651 3.94606,-3.94606 0.98651,0 0.98652,-1.97302 0.98651,-1.97303 1.97303,-1.97303 1.97303,-1.97303 0.98651,-2.95954 5.91909,-3.94606 0,-0.98651 0.98651,-0.98652 1.97303,-2.95954 2.95954,-2.95954 0.98652,-4.93258 -1.97303,-0.98651 -0.98651,-1.97303 0,0.98652 -0.98652,0.98651 0,0 0,0 0,-2.95954 0.98652,0 1.97302,0.98651 0,0.98652 0,0.98651 0.98652,-1.97303 0,-4.93257 -0.98652,0 -0.98651,0 0,-2.95954 -1.97303,-1.97303 0,1.97303 z m -72.01554,-75.073737 -0.98651,0.197303 -0.98652,0.591908 0.98652,0.394606 0.98651,0.295954 0.98652,0.887863 0.98651,0.986514 -0.98651,0.09865 -0.98652,-0.09865 0,0.295955 0,0.394605 0.98652,0.197303 0.98651,0.09865 0.98651,1.085165 0.98652,0.591909 1.97303,-0.69056 0.98651,-0.887863 7.89211,-0.986514 0.98652,-0.493257 0,-2.466286 0,-2.860891 1.97303,-1.183818 0.98651,-1.183817 0,-1.085165 -0.98651,-1.085166 0,-0.197303 -0.98652,-0.493257 -1.97303,-4.636617 -0.98651,-3.650103 -1.97303,-0.09865 0,1.38112 -4.93257,2.76224 -3.94606,3.156845 0,1.677075 0.98652,0.394605 0,0.887863 -0.98652,0.986514 0,1.085166 -0.98651,1.085166 -0.98651,0.493257 -0.98652,0.493257 0,0.789211 0.98652,0.69056 0,0.295955 -0.98652,0 z m -1.97303,-16.57344 -0.98651,1.282469 0,0.887863 0.98651,0 1.97303,0.887863 1.97303,-2.466286 -3.94606,-0.591909 z m 7.89212,89.674147 -1.97303,-0.98652 0,0 0.98651,1.97303 1.97303,0.98652 0,-0.98652 0,-0.98651 -0.98651,0 z"
                                        data-title="Красноярский край" data-code="RU-KYA"></path>
                                    <path
                                        d="m 208.32227,371.0859 0.98651,-2.95954 -0.98651,0 -0.98652,-0.98652 0,-0.98651 0,0 -0.98651,-0.98651 -0.98652,-0.98652 0,-2.95954 0,-2.95954 0.98652,-1.97303 0,-0.98652 -1.97303,-1.97303 0,-1.97302 0.98651,-0.98652 0,0 0,-0.98651 -0.98651,0 -1.97303,-2.95955 -2.95954,1.97303 -1.97303,2.95955 -1.97303,0.98651 -1.97303,0.98651 -1.97303,2.95955 -1.97302,1.97303 -1.97303,0 -0.98652,0.98651 -3.94605,1.97303 -2.95955,2.95954 -7.89211,0.98652 0,0.98651 1.97303,2.95954 0,1.97303 0,0 2.95954,1.97303 4.93257,0 0,1.97303 0,2.95954 2.95954,0.98651 1.97303,1.97303 0.98652,1.97303 0,1.97303 0.98651,3.94606 0.98652,3.94605 -0.98652,0.98652 0,1.97303 1.97303,-0.98652 0.98651,-1.97303 0.98652,0.98652 0.98651,0 0,0.98651 0,1.97303 1.97303,1.97303 0.98652,1.97303 1.97302,0 0.98652,0 0.98651,-0.98652 0.98652,-0.98651 3.94605,0.98651 3.94606,1.97303 0.98652,1.97303 0,0.98652 1.97302,0 1.97303,-0.98652 0.98652,0.98652 0.98651,0.98651 0.98651,0 0.98652,0 0.98651,2.95954 -0.98651,1.97303 4.93257,6.9056 2.95954,0 1.97303,-1.97303 0.98652,1.97303 0,0.98652 6.9056,2.95954 5.91908,-4.93257 -2.95954,-4.93257 -2.95954,-3.94606 0.98651,0 0,-0.98652 -0.98651,-1.97302 0,-1.97303 -0.98652,0 1.97303,-2.95955 1.97303,-0.98651 -2.95954,-2.95954 -2.95955,-0.98652 -0.98651,0.98652 -0.98652,0 0,-0.98652 0,-0.98651 -0.98651,-0.98652 -0.98651,1.97303 -1.97303,0 -2.95955,3.94606 -3.94605,-0.98651 0,-0.98652 -1.97303,-0.98651 -1.97303,0 -1.97303,0 -0.98651,-0.98652 -0.98652,-1.97303 -0.98651,0 1.97303,-4.93257 -0.98652,-0.98651 -0.98651,-0.98652 1.97303,-1.97302 1.97303,-2.95955 -2.95955,-1.97303 -1.97302,2.95955 -0.98652,0 -0.98651,-3.94606 -0.98652,-2.95954 0.98652,0.98651 0.98651,0 0,-1.97303 -0.98651,-0.98651 0,-2.95954 z"
                                        data-title="Оренбургская область" data-code="RU-ORE"></path>
                                    <path
                                        d="m 146.17187,335.57139 -0.98652,-0.98652 -1.97302,-0.98651 -2.95955,-1.97303 0,-0.98651 -0.98651,-0.98652 -0.98652,-0.98651 -1.97302,0 -0.98652,-0.98652 -0.98651,-1.97302 -2.95955,-0.98652 -1.97302,-2.95954 -3.94606,1.97303 -5.72178,1.97303 0.1973,2.95954 -1.38112,3.94605 0.59191,3.94606 2.36763,1.97303 2.95954,0 0,0.98651 0.98652,0.98652 0,0 1.97303,0 0,0.98651 0,0.98652 0.98651,0 0.98652,0.98651 0.98651,2.95954 -1.97303,2.95955 -1.97303,0.98651 0,0 0.98652,0.98652 0.98651,0 0,0.98651 0.98652,0.98651 0,0 0.98651,-0.98651 0,0 0.98651,0 0.98652,0.98651 0,1.97303 1.97303,0.98652 1.97303,0 0.98651,2.95954 1.97303,3.94606 0,0.98651 2.95954,4.93257 0,5.91909 4.93257,-1.97303 0.98652,-2.95954 0.98651,-2.95955 0.98652,0 0,0.98652 0.98651,0.98651 1.97303,0 2.95954,0 0.98652,-0.98651 0.98651,-1.97303 7.89211,1.97303 1.97303,-0.98652 1.97303,-0.98651 0.98651,0.98651 0,0 0.98652,0 0,-0.98651 0,-0.98651 -0.98652,-3.94606 -0.98651,-2.95954 -0.98651,-0.98652 0,0 0,-1.97303 0,-0.98651 0,-0.98652 -0.98652,0 0,-0.98651 0,-0.98651 -1.97303,-0.98652 -0.98651,-0.98651 0,-1.97303 -0.98651,-2.95954 0,0 0,-0.98652 -0.98652,-0.98651 -5.91908,-0.98652 -2.95955,-3.94605 -0.98651,-0.98652 -1.97303,-0.98651 -1.97303,0 -2.95954,0.98651 0,-1.97303 z"
                                        data-title="Саратовская область" data-code="RU-SAR"></path>
                                    <path
                                        d="m 124.46855,339.51744 0,-0.98651 -2.95954,0 -2.36763,-1.97303 -0.59191,-3.94606 -2.17033,-0.98651 -2.56494,-0.98651 -1.08516,-0.98652 -0.88787,-1.97303 -1.28247,0 -1.47978,0.98652 -2.36763,-0.98652 -2.46629,0 -0.0987,1.97303 0.29596,1.97303 -2.07169,1.97303 -2.17034,0.98651 0.19731,3.94606 0.98651,4.93257 -2.663587,1.97303 -2.762241,2.95954 0.394606,0 0.591909,0.98652 0.493257,1.97303 0.197303,2.95954 -3.551452,1.97303 -3.255497,-0.98652 -1.282468,0.98652 -1.183817,0.98651 -0.986515,0 -0.493257,0.98652 0.986514,1.97302 1.479772,2.95955 -0.789212,3.94605 -0.197302,1.97303 0.887862,0 0.789212,0 0,0.98652 -0.493257,0.98651 0.69056,0 0.887862,0 0.69056,0.98652 0.591909,0.98651 4.83392,-1.97303 3.650099,1.97303 1.28247,-1.97303 0.69056,-1.97303 1.47978,0.98652 0,1.97303 1.38112,0 1.57843,0 1.67707,-0.98652 1.28248,0 0.78921,0.98652 0.1973,0 0.19731,-0.98652 1.08516,0.98652 1.28247,0 3.15685,0 2.95954,0.98651 0.59191,1.97303 0.98651,1.97303 1.97303,-0.98652 0.98651,-0.98651 1.97303,0 0.98652,0 0,-1.97303 0.98651,-2.95954 3.94606,-2.95955 4.93257,-0.98651 0.98651,-0.98651 0.98652,-0.98652 0,-0.98651 -1.97303,-3.94606 -0.98651,-2.95954 -1.97303,0 -1.97303,-0.98652 0,-1.97303 -0.98652,-0.98651 -0.98651,0 0,0 -0.98651,0.98651 0,0 -0.98652,-0.98651 0,-0.98651 -0.98651,0 -0.98652,-0.98652 0,0 1.97303,-0.98651 1.97303,-2.95955 -0.98651,-2.95954 -0.98652,-0.98651 -0.98651,0 0,-0.98652 0,-0.98651 -1.97303,0 0,0 -0.98652,-0.98652 z"
                                        data-title="Волгоградская область" data-code="RU-VGG"></path>
                                    <path
                                        d="m 102.56792,304.00293 0,-0.98651 -2.36764,-0.98652 -2.762236,-0.98651 0,0 0.197303,0.98651 -0.591909,0.98652 0,0.98651 -0.295954,0 -1.183817,0 -1.282469,-0.98651 -1.085166,1.97303 -1.38112,1.97302 -0.197302,1.97303 -1.578423,0.98652 1.282468,0.98651 1.38112,0 -0.986514,1.97303 -1.38112,0 0,2.95954 0.197303,1.97303 -0.986514,0.98652 -0.986515,0 -1.479771,2.95954 -0.986514,2.95954 -0.789212,0 -0.789211,0.98652 1.085166,5.91908 1.775725,0.98651 0.789212,0.98652 2.268982,1.97303 4.044709,0.98651 4.242012,-0.98651 0.69056,-0.98652 0.789207,0 2.17034,-0.98651 2.07169,-1.97303 -0.29596,-1.97303 0.0987,-1.97303 2.46629,0 2.36763,0.98652 1.47978,-0.98652 1.28247,0 0.88787,1.97303 1.08516,0.98652 2.56494,0.98651 2.17033,0.98651 1.38112,-3.94605 -0.1973,-2.95954 -1.28247,-0.98652 0.1973,-0.98651 -0.78921,0 -0.69056,0 -0.98651,-1.97303 -1.08517,-1.97303 -2.07168,-0.98651 -1.77573,-0.98652 0.29596,-0.98651 0.49326,-1.97303 -0.98652,-0.98652 -0.78921,-0.98651 -2.6636,-2.95954 -2.46628,-1.97303 0.29595,-0.98652 -0.88786,-1.97302 -1.18383,0 -0.88786,-0.98652 0.0987,0 z"
                                        data-title="Воронежская область" data-code="RU-VOR"></path>
                                    <path
                                        d="m 113.22229,241.85253 -3.74876,-0.98651 -5.22853,-0.98652 -3.84741,-4.93257 -4.143363,-4.93257 -1.38112,-1.97303 -2.07168,0 -1.282469,0.98652 -2.170331,1.97303 -2.959543,2.95954 -1.874377,0 -0.09865,1.97303 0.197303,0.98651 0.295955,0 0.09865,0.98652 -0.887863,0 -0.986514,0.98651 -0.887863,1.97303 -0.394606,2.95954 0.394606,1.97303 -0.09865,0.98651 -0.986515,0.98652 -1.183817,0.98651 0.591909,0.98652 1.085166,0.98651 0.295954,2.95954 -0.986514,0.98652 0.197302,1.97303 -0.394605,0.98651 0.394605,0 0.69056,0 1.085166,0 0.986514,-0.98651 3.4528,0 3.4528,-0.98652 1.677074,-0.98651 1.578423,0 0.69056,-0.98652 0.887863,-0.98651 2.07168,0.98651 1.479772,2.95955 1.677068,0 0.88787,-0.98652 0.88786,0.98652 0.98651,0.98651 7.59618,-1.97303 3.74876,-3.94605 1.67707,-3.94606 -1.28247,-0.98652 -1.47977,-1.97302 -0.3946,-0.98652 -0.29596,-1.97303 z"
                                        data-title="Смоленская область" data-code="RU-SMO"></path>
                                    <path
                                        d="m 133.34718,222.12225 -2.95954,-1.97303 -0.98651,0.98651 -0.98652,0.98652 -2.95954,0.98651 -2.95954,0.98652 -0.98652,0 -0.98651,-0.98652 -0.88786,-0.98651 -5.42583,-0.98652 -5.52449,-1.97302 -1.38112,-0.98652 -1.28247,-1.97303 -1.57842,0.98652 -1.38113,0.98651 0.0987,0 0.49325,0.98652 -0.88786,0.98651 -0.88786,0.98651 0,1.97303 -0.59191,1.97303 -2.564937,1.97303 -2.466286,2.95954 4.143363,4.93257 3.84741,4.93257 5.22853,0.98652 3.74876,0.98651 0.29596,1.97303 0.3946,0.98652 1.47977,1.97302 1.38112,0.98652 2.66359,-0.98652 2.07168,-0.98651 0.98652,0 0.98651,-0.98651 0.98651,1.97302 0.98652,1.97303 2.95954,0.98652 2.95954,0.98651 0.98652,0.98652 0.98651,-0.98652 0.98652,-0.98651 1.97303,0.98651 1.97302,0.98652 0.98652,0 0.98651,1.97302 0,1.97303 2.95955,-3.94605 2.95954,-0.98652 -0.98652,-1.97303 0,-0.98651 0,-2.95954 0.98652,-1.97303 0,-0.98652 0.98651,-0.98651 0.98652,-0.98652 1.97303,0 0,-0.98651 -0.98652,-0.98651 1.97303,-0.98652 1.97303,0 0.98651,-5.91908 0,0 -3.94605,-0.98652 -2.95955,-0.98651 -1.97303,0 -0.98651,-0.98652 -0.98651,-0.98651 -1.97303,-0.98651 -0.98652,0 -0.98651,0.98651 -1.97303,-0.98651 -0.98651,-0.98652 -0.98652,0 0,0 -1.97303,-2.95954 z"
                                        data-title="Тверская область" data-code="RU-TVE"></path>
                                    <path
                                        d="m 263.56706,284.27265 -1.97302,-1.97303 -1.97303,-1.97303 -1.97303,0 -1.97303,-0.98651 -0.98651,-0.98652 0.98651,-1.97303 -1.97303,-1.97303 -0.98651,0 -0.98652,0 -5.91908,-1.97302 -1.97303,4.93257 0.98651,2.95954 -1.97302,0.98651 3.94605,4.93257 3.94606,1.97303 -2.95954,3.94606 -4.93257,2.95954 0,2.95955 1.97302,1.97302 -0.98651,0.98652 -0.98651,2.95954 -1.97303,0.98652 -0.98652,1.97302 -2.95954,8.87863 -3.94606,8.87863 -0.98651,0.98652 -0.98652,-0.98652 0,0.98652 -0.98651,0.98651 -0.98651,0 -0.98652,0.98651 0,4.93257 0.98652,-0.98651 0.98651,0 0.98651,2.95954 0.98652,1.97303 2.95954,0.98652 2.95954,0 0,0.98651 0.98652,0.98651 0.98651,0.98652 0.98652,0 0.98651,2.95954 0,0.98652 1.97303,0 1.97303,0 1.97303,-1.97303 0.98651,-2.95955 0,0 0,-0.98651 1.97303,0 4.93257,-0.98651 1.97303,-2.95955 1.97303,-1.97303 1.97303,1.97303 2.95954,0 0,-1.97303 0.98651,-2.95954 4.93257,-0.98651 2.95955,-2.95954 0,0 0,-0.98652 0,-2.95954 1.97303,-2.95954 -1.97303,-4.93258 2.95954,-2.95954 1.97303,-0.98651 1.97303,-0.98652 4.93257,-4.93257 4.93257,-4.93257 0,-0.98651 0,-0.98652 1.97303,-3.94606 2.95954,-2.95954 -9.86514,-1.97303 -5.91909,-4.93257 -2.95954,0 -1.97303,0.98652 0,0 -0.98651,0 -0.98652,-0.98652 -0.98651,0.98652 -1.97303,0 0,-0.98652 -0.98651,0 -2.95955,0 -1.97303,0.98652 z"
                                        data-title="Пермский край" data-code="RU-PER"></path>
                                    <path
                                        d="m 383.9218,307.94899 -1.97302,-1.97303 -4.93258,0 -4.93257,-0.98651 0,-2.95955 0,-3.94605 -1.97303,-0.98652 -0.98651,-2.95954 0,-2.95954 0.98651,-0.98652 0.98652,-1.97303 -1.97303,-1.97303 -0.98651,0 -0.98652,-0.98651 0,-0.98651 -1.97303,0 -0.98651,0.98651 -0.98652,0 -2.95954,0 -1.97303,0 -1.97303,0.98651 0,0 -2.95954,-2.95954 -1.97303,-2.95954 1.97303,-0.98651 0.98652,-0.98652 -1.97303,-0.98651 -0.98652,-0.98652 -2.95954,-1.97303 -2.95954,-0.98651 -0.98652,0 -0.98651,0.98651 -0.98651,-0.98651 0,-0.98651 -1.97303,0 -1.97303,0.98651 -0.98652,-0.98651 -0.98651,0 -0.98651,0 -0.98652,0 -0.98651,-1.97303 0.98651,-1.97303 -2.95954,-0.98652 -0.98652,-1.97302 0.98652,-1.97303 1.97303,0 0.98651,-2.95955 1.97303,-2.95954 0,-0.98651 -0.98651,-0.98652 0,-2.95954 -0.98652,-2.95954 -1.97303,0.98651 -2.95954,0.98652 0,0.98651 0,0.98651 -1.97303,0 -1.97303,0.98652 -1.97303,0.98651 -0.98651,-1.97303 0,-0.98651 0,0 -1.97303,0 -1.97303,0.98651 -0.98651,0 -0.98652,0.98652 0,0 -1.97302,0.98651 -0.98652,0.98652 -0.98651,5.91908 -3.94606,3.94606 -3.94606,3.94606 -1.97302,3.94605 -1.97303,4.93258 0,0.98651 0.98651,0 -0.98651,1.97303 -1.97303,0 -0.98652,2.95954 -0.98651,1.97303 0,0.98651 0.98651,0.98652 0,0.98651 0,1.97303 2.95955,1.97303 2.95954,1.97303 2.95954,6.9056 0.98652,1.97303 1.97302,2.95954 -1.97302,3.94606 -0.98652,3.94605 -0.98651,1.97303 0,2.95954 0,0 1.97303,0.98652 0,1.97303 -0.98652,3.94605 -0.98651,3.94606 2.95954,1.97303 2.95954,1.97303 0,3.94605 0,4.93258 0,1.97302 0.98652,0.98652 2.95954,0.98651 2.95954,0 0.98652,-1.97303 1.97303,-0.98651 0.98651,0 0,0.98651 2.95954,0 2.95955,0 1.97302,0.98652 0.98652,0 0.98651,-0.98652 0.98652,-0.98651 3.94605,-0.98651 1.97303,-2.95955 0.98652,-0.98651 1.97303,0 0.98651,1.97303 0,0.98651 2.95954,0 0.98652,0 2.95954,0.98652 0.98651,0.98651 0.98652,0.98651 0.98651,0 1.97303,2.95955 0.98651,3.94605 0.98652,0 0.98651,0.98652 -0.98651,0.98651 0,0.98652 1.97303,1.97303 0.98651,0 0,2.95954 -0.98651,1.97303 2.95954,1.97303 2.95954,0.98651 0.98652,0.98651 0.98651,0.98652 2.95954,0 1.97303,1.97303 3.94606,-3.94606 3.94606,-3.94606 2.95954,0 2.95954,0 2.95955,-4.93257 0.98651,-3.94606 0.98651,-0.98651 0.98652,0 0.98651,-1.97303 -0.98651,-1.97303 0,-0.98651 0.98651,0 0.98652,0.98651 3.94605,0.98652 3.94606,0.98651 0.98651,0.98652 0.98652,0.98651 1.97303,-0.98651 0.98651,0 0.98652,0 0,1.97302 1.97302,1.97303 3.94606,0 3.94606,-0.98651 0,1.97303 0.98651,1.97303 1.97303,0 1.97303,0 0.98651,0.98651 1.97303,0.98651 0.98652,-0.98651 0.98651,0 2.95954,-1.97303 1.97303,-0.98651 2.95955,1.97303 1.97302,0.98651 8.87863,-1.97303 5.91909,-3.94606 -0.98652,-1.97302 -3.94605,-1.97303 -0.98652,-6.9056 -1.97303,-3.94606 -1.97302,-1.97303 -1.97303,0 -1.97303,0 -1.97303,-2.95954 -1.97303,-2.95954 -1.97303,0 -1.97303,0 -2.95954,-2.95955 0,-0.98651 -0.98651,-1.97303 0,0 -4.93257,1.97303 -4.93258,1.97303 -1.97302,-0.98652 -1.97303,-0.98651 -3.94606,0 -2.95954,0 -1.97303,-1.97303 -0.98652,-3.94606 -4.93257,-2.95954 -3.94605,-2.95954 -4.93257,-0.98652 -1.97303,-0.98651 -1.97303,-1.97303 -1.97303,-2.95954 z"
                                        data-title="Ханты-Мансийский АО - Югра" data-code="RU-KHM"></path>
                                    <path
                                        d="m 424.36889,359.24773 -1.97303,-0.98651 -1.97303,0 -0.98651,0 -0.98652,-1.97303 -0.98651,-1.97303 -3.94606,0.98651 -3.94606,0 -1.97302,-1.97303 0,-1.97302 -0.98652,0 -0.98651,0 -1.97303,0.98651 -0.98652,-0.98651 -0.98651,-0.98652 -3.94606,-0.98651 -3.94605,-0.98652 -0.98652,-0.98651 0,0 0,0.98651 0,1.97303 -0.98651,1.97303 -0.98652,0 -0.98651,0.98651 -0.98651,3.94606 -2.95955,4.93257 -1.97303,0 -3.94605,0 -3.94606,3.94606 -3.94606,3.94606 0,0.98651 0,1.97303 -0.98651,0 0,1.97303 0,0.98651 -0.98652,0 0,0.98652 0.98652,0.98651 0,1.97303 0,0.98651 0,0.98652 0.98651,1.97303 0,0.98651 0,0.98651 -0.98651,0.98652 0.98651,1.97303 0.98652,0.98651 1.97303,1.97303 1.97302,0.98651 11.83818,3.94606 -0.98652,0.98652 6.9056,3.94605 4.93257,7.89212 6.9056,0.98651 0.98652,3.94606 5.91908,0 0,0 0.98652,0.98651 0,-0.98651 0.98651,-0.98652 1.97303,0 0.98651,0 0.98652,1.97303 -0.98652,0.98652 0,3.94605 -0.98651,0.98652 -0.98652,0.98651 0.98652,0 0,0.98652 0.98651,0.98651 0,0 1.97303,-0.98651 0.98652,-2.95955 0.98651,0.98652 0.98651,0 1.97303,0 1.97303,0 1.97303,0 1.97303,-0.98652 0.98651,0.98652 0.98652,0 0.98651,-0.98652 1.97303,-1.97302 0.98651,0 0.98652,0.98651 0.98651,-0.98651 0.98652,0 2.95954,0 2.95954,0 0,0 0.98652,-0.98652 1.97302,0.98652 1.97303,0.98651 2.95955,-1.97303 3.94605,0 0.98652,-2.95954 1.97303,-3.94606 0.98651,0 0.98651,0 0.98652,-0.98651 0,-1.97303 0.98651,0 0,-0.98652 -1.97303,-4.93257 -3.94605,-3.94605 0,-2.95955 0.98651,-2.95954 2.95954,-1.97303 1.97303,-0.98651 -1.97303,-2.95955 -2.95954,-0.98651 -0.98651,-1.97303 0,-2.95954 -1.97303,-1.97303 -0.98652,0 -0.98651,-0.98651 0,-0.98652 -1.97303,-0.98651 -3.94606,-0.98652 -2.95954,-0.98651 -3.94605,0.98651 -3.94606,-1.97302 0,-4.93258 0,-7.89211 -2.95954,-0.98651 -2.95955,-1.97303 -1.97303,0.98651 -2.95954,1.97303 -0.98651,0 -0.98652,0.98651 -1.97303,-0.98651 z"
                                        data-title="Томская область" data-code="RU-TOM"></path>
                                    <path
                                        d="m 597.00888,330.63882 -2.95954,0 0,3.94605 -0.98651,0 -1.97303,0.98652 -0.98652,0.98651 -0.98651,0.98652 0,0 -0.98652,-0.98652 -0.98651,0 -1.97303,0 0,0.98652 0,0 -1.97303,4.93257 -0.98651,4.93257 0.98651,1.97303 0.98652,2.95954 -0.98652,0.98651 -0.98651,1.97303 0.98651,0.98652 0,1.97303 -3.94605,4.93257 -4.93257,4.93257 -1.97303,0 -0.98652,0.98651 0,0.98652 0,0 -0.98651,4.93257 1.97303,7.89211 2.95954,0.98652 1.97303,1.97302 0,0.98652 0,0.98651 0,0.98652 0,0.98651 -0.98652,0 -0.98651,0 -0.98651,0 0,0.98652 -0.98652,0.98651 -0.98651,0.98651 1.97303,1.97303 1.97302,2.95955 -0.98651,2.95954 -1.97303,1.97303 0,0.98651 -1.97303,2.95954 -0.98651,0 -0.98652,-0.98651 -0.98651,-0.98651 -1.97303,0 0,-0.98652 0,-0.98651 -0.98651,0 -1.97303,-0.98652 0,-1.97303 0,-0.98651 -0.98652,-0.98651 -2.95954,0.98651 -1.97303,0.98651 -0.98651,1.97303 0,0.98652 -7.89212,4.93257 -3.94605,7.89211 0,0 0.98651,0.98652 -0.98651,0.98651 0.98651,0.98652 0,1.97302 -3.94606,-1.97302 -1.97302,-5.91909 0,-1.97303 -0.98652,0 -0.98651,0 -0.98652,0.98652 -0.98651,3.94605 -3.94606,0 -1.97303,-0.98651 -2.95954,0 -2.95954,-0.98652 -2.95954,4.93258 -1.97303,4.93257 0.98651,0.98651 1.97303,1.97303 0,1.97303 0,2.95954 0.98651,0.98651 -0.98651,0.98652 -0.98651,0 -2.95955,1.97303 -3.94605,3.94605 -0.98652,2.95955 0.98652,1.97303 -0.98652,0.98651 -0.98651,0.98651 0,1.97303 -0.98652,2.95955 0,2.95954 -0.98651,0 -2.95954,0.98651 -2.95955,1.97303 0,0.98652 0,0.98651 0.98652,0.98651 1.97303,0.98652 1.97302,2.95954 1.97303,2.95954 1.97303,0 4.93257,3.94606 4.93257,3.94606 1.97303,0 1.97303,0 0.98652,0.98651 0,1.97303 0.98651,0.98651 3.94606,-2.95954 3.94605,-3.94606 0.98652,1.97303 0.98651,2.95955 3.94606,2.95954 4.93257,2.95954 0.98651,2.95954 0.98652,1.97303 0.98651,0 0.98652,-0.98651 6.9056,5.91908 0,1.97303 0.98651,1.97303 0.98652,0.98652 1.97302,1.97302 0,1.97303 -0.98651,1.97303 1.97303,0 0.98651,-0.98651 3.94606,0 2.95954,-2.95955 0,-0.98651 -6.9056,-1.97303 2.95955,-0.98651 4.93257,-1.97303 -0.98652,-0.98652 -1.97303,-0.98651 0,-0.98651 -0.98651,-0.98652 0,-0.98651 2.95954,2.95954 3.94606,1.97303 11.83817,-12.82469 14.79771,-21.70331 -0.98651,-7.89211 0.98651,-7.89212 0.98652,-1.97303 0.98651,0 0.98652,0 -0.98652,-1.97303 -1.97303,-0.98651 0,-0.98651 -0.98651,-0.98652 -0.98651,0 -0.98652,-4.93257 1.97303,-1.97303 2.95954,-1.97303 0.98652,0.98652 0.98651,0 0.98652,-1.97303 1.97302,-1.97303 0.98652,0.98651 0,0.98652 0,0 0.98651,0 0.98652,0.98651 2.95954,0 1.97303,0 2.95954,-1.97303 0.98652,-1.97302 0.98651,0.98651 0.98651,0.98651 0.98652,0 1.97303,0 1.97303,0 1.97302,-0.98651 0,1.97303 1.97303,1.97303 1.97303,0 1.97303,-0.98652 3.94606,0.98652 4.93257,-1.97303 4.93257,-5.91909 3.94606,0.98652 0,0.98651 -0.98652,0 0.98652,0.98652 1.97302,0 0.98652,0 1.97303,0.98651 0.98651,-0.98651 1.97303,-1.97303 0.98651,0.98651 0.98652,0 0,-2.95954 0,-2.95954 -0.98652,0 -0.98651,0 -0.98651,-6.9056 0,-0.98652 0.98651,0 0,-0.98651 0,-1.97303 0.98651,0 0.98652,-0.98651 -1.97303,-1.97303 1.97303,-1.97303 2.95954,0.98651 1.97303,0.98652 3.94606,-0.98652 -0.98652,-1.97303 0,-0.98651 -0.98651,-0.98651 -0.98652,-1.97303 0,-1.97303 0,-0.98652 -0.98651,-1.97302 0,-1.97303 -0.98651,-1.97303 -4.93258,0 -4.93257,0 0,-0.98652 0,-0.98651 -0.98651,-0.98651 0,-1.97303 -1.97303,-0.98652 -1.97303,-1.97303 -2.95954,-0.98651 -3.94606,0 -2.95954,1.97303 -1.97303,0.98651 -1.97303,0.98652 -0.98651,2.95954 -0.98652,1.97303 -0.98651,0 -0.98652,0 -3.94605,5.91908 -4.93257,4.93258 0.98651,-2.95955 -1.97303,-0.98651 -0.98651,-1.97303 0,-0.98651 -1.97303,1.97302 -1.97303,0.98652 -0.98651,0 -0.98652,0 -0.98651,0 0,0 -0.98652,0 -0.98651,0 0,0.98651 -0.98651,0 -2.95955,-0.98651 -0.98651,1.97303 -4.93257,0.98651 -0.98652,0 -0.98651,0 -0.98652,-3.94606 0,-4.93257 0.98652,-0.98651 0.98651,-0.98652 0,-1.97302 0,-0.98652 1.97303,-5.91908 1.97303,-4.93257 -2.95954,-2.95955 -0.98652,-4.93257 1.97303,-1.97303 0.98652,-1.97303 -1.97303,-2.95954 -1.97303,-1.97303 0,-4.93257 -0.98652,-6.9056 -2.95954,-2.95954 -3.94606,-0.98652 2.95955,-2.95954 0.98651,-0.98651 -0.98651,-2.95955 -0.98652,-1.97302 z"
                                        data-title="Иркутская область" data-code="RU-IRK"></path>
                                    <path
                                        d="m23.64,337.19l0.62,-1.35l0.26,-1.19l0.44,-0.69l0.78,-0.98l0.98,-0.22l2.29,0.3l1.53,-1.05l3.07,-4.56l1.05,-7.35l-2.18,-3.15l-0.99,-1.2l-1.19,-1.96l-0.83,-0.83l-0.35,-1l-0.84,-0.95l-1.44,-0.64l-0.24,-1.14l-1.58,0.54l-0.92,0.86l-1.11,1.53l-1.27,-0.14l-0.97,0.35l0.24,1.14l0.47,0.99l-1.09,0.36l-0.35,-1l-0.8,0.85l-0.48,0.18l-1.45,-0.77l-0.4,-1.51l-0.44,0.69l-1.02,-1.45l-1.27,-0.14l-0.67,-0.45l-0.97,0.35l-0.78,0.98l-0.97,-0.94l-0.91,0.99l-0.01,1.17l-0.26,1.19l-1.16,-0.28l-0.35,-1l-1.09,0.36l0.66,1.62l0.71,0.84l0.35,1l-1.75,0.04l-0.76,-2.64l-0.53,-1.63l0.75,-1.37l-1.44,-0.64l-0.14,1.18l0.28,2.95l0.52,1.5l0.83,0.83l1.14,1.44l0.53,1.63l1.49,1.15l0.53,1.63l0.89,1.47l-0.12,-1.28l1.53,0.24l-1.38,-1.29l-1.14,-1.44l1.94,0.59l1.02,1.45l1.13,0.02l0.84,0.95l0.48,1.12l0.04,1.68l1.63,-0.03l0.6,-0.32l1.18,-0.76l0.96,0.81l0.35,1l-0.13,1.31l0.22,1.01l0.84,0.95l1.58,-0.54l1.63,1.27l-1.28,-0.27l-0.78,0.98l1.25,0.01l-0.25,1.32l0.8,-0.85l0.92,-0.86l0.17,0.5l-0.78,0.98l-0.26,1.19l-0.92,0.86l-0.19,0.66l0.05,0.51"
                                        data-title="Херсонская область" data-code="RU-HR" />
                                    <path
                                        d="m39.67,338.97l0.64,-0.2l1.14,-0.16l0.51,-0.09l1.14,-0.16l1.75,0.02l1.75,0.02l6.22,-4l-0.85,-6.27l-1.37,-1.54l-1.29,-1.01l-0.78,-1.1l0.48,-1.25l0.36,-1.26l0.43,-0.61l-0.66,-1.09l-0.2,-0.66l-0.03,-1.17l-0.64,0.2l-0.59,-0.44l-0.7,-0.58l-0.07,-0.65l-0.72,-0.32l-0.66,-1.09l-1.28,-1.14l-0.16,-1.05l-0.56,0.73l-0.3,0.62l-1.06,0.69l-0.56,0.73l-0.63,0.08l-0.23,1.27l-1.62,1.41l-0.95,0.83l-1.21,-0.49l-0.28,-1.19l0.55,-0.6l-0.59,-0.44l-0.83,-0.59l-1.1,-0.35l-0.63,0.08l-0.51,0.09l-0.44,0.74l0.16,1.05l0.58,0.57l-0.43,0.61l-1.07,0.81l-0.43,0.61l-0.36,1.26l0.08,0.52l0.03,1.17l-0.23,1.27l-1.14,0.16l-0.71,-0.45l-1.14,0.16l0.07,0.65l-0.36,1.26l-0.36,1.26l0.59,0.44l0.2,0.66l-0.47,1.12l-0.36,1.26l0.58,0.57l1.15,-0.29l-1.07,0.81l-1.14,0.16l-1.14,0.16l-0.59,-0.44l-1.14,0.16l0.08,0.52l1.21,0.49l1.35,0.37l1.02,-0.17l1.07,-0.81l1.65,-0.25l0.56,-0.73l1.17,1l1.22,0.36l1.64,-0.12l0.72,0.32l1.28,1.14l0.08,0.52l-0.43,0.61l-0.63,0.08l-0.51,0.09l-1.15,0.29l0.15,1.18l1.15,-0.29l1.14,-0.16l0.43,-0.61l1.15,-0.29l0.43,-0.61l0.7,0.58l0.08,0.52l0.07,0.65l0.08,0.52"
                                        data-title="Запорожская область" data-code="RU-ZP" />
                                    <path
                                        d="m67.29,338.92l-1.37,0.64l-0.75,0.26l-0.25,0.13l-0.37,0.13l-1.37,-0.64l-1.62,-0.64l-0.5,0.26l-1.25,0.52l-0.87,0.52l-0.87,0.39l-1.75,1.93l-1,-1.67l-0.5,0.64l-1.62,0.39l1,-0.77l-1.62,-1.42l-1.12,-0.26l-0.75,-0.52l-1.12,-0.39l-1.25,-0.13l-1.25,-0.39l-1.37,-0.9l0.37,-0.64l1.12,-0.39l0.25,-1.16l-0.12,-0.64l0.37,-1.29l1.37,-0.9l0.75,0.39l0.75,0.52l1.25,0.26l0.25,-1.29l-0.75,-0.39l-0.12,-0.52l0.37,-0.9l-0.75,-0.9l-0.25,-1.16l0.25,-1.16l0.5,-0.77l-0.12,-0.52l0.37,-0.77l0.37,-0.77l0.62,-0.13l1,-0.77l0.25,-0.77l0.87,1.03l0.25,1.16l1,-0.77l1.62,-1.03l0.25,-1.29l0.25,-1.29l1,-0.26l0.37,-1.29l-0.12,-0.64l0.87,-1.29l1.12,-0.39l0,0.64l0.87,1.03l1.87,0.13l1.12,-0.26l1.12,-0.39l0.5,0l0.5,-0.13l1.87,0.13l0.12,-0.52l0.12,-0.26l1,1.03l2,1.93l0.87,0.9l0.12,7.86l-1.62,5.8l-0.87,3.35l-1.5,1.42"
                                        data-title="Донецкая Народная Республика" data-code="RU-DON" />
                                    <path
                                        d="m68.06,338.65l-0.87,1.42l0.62,0.39l0.75,1.16l1.87,0.77l0.25,1.16l3,3.35l3.5,-3.61l0.25,-0.26l0.5,-0.26l0.37,-0.13l0.5,-0.39l0.75,-0.39l-0.62,-3.61l0.37,-0.52l0.37,-0.39l0.5,-0.39l0.37,-0.52l0.62,-0.52l0.37,0.13l1.87,0.26l-0.12,-2.58l0.62,-0.13l1,-0.13l0.5,0l0.5,-0.13l0.37,0l0.37,0l0.37,-0.13l0.25,0l0.37,-0.13l1.5,-0.13l0.25,-0.64l0.12,-0.52l0.37,-0.77l0.12,-0.39l0.25,-0.52l0.25,-0.39l0.12,-0.26l0.25,-0.26l0.25,-0.26l0.37,-0.52l-3,-1.29l0,-1.55l0,-1.42l0,-0.52l-1.75,-2.19l-0.5,-0.64l-0.5,-1.42l-0.12,-0.9l-0.12,-0.26l-0.12,-0.39l-0.12,-0.26l0,-0.52l-1.62,-0.9l-0.75,-0.52l-0.37,-0.39l-0.62,-0.77l-0.5,-0.64l-0.62,-0.64l-0.37,-0.52l-0.62,1.67l-1,0.77l-0.37,0.64l-1.12,0.26l-1.75,0.26l-0.87,1.42l-0.87,1.29l-0.5,0.77l-1,0.77l0.75,1.03l-0.87,1.42l-1,0.77l0.75,1.03l-0.5,0.64l-0.25,1.29l-1.12,0.26l-0.62,0l-0.5,0.77l-0.25,1.16l0.12,1.16l-0.25,1.29l-1.12,0.26l0,0.52l0.12,0.64l0.25,1.16l-0.62,0.13l0.87,1.55l-0.25,1.29l0,0.52"
                                        data-title="Луганская Народная Республика" data-code="RU-LUG" />
                                </g>
                            </svg>
                            <div class="markers-layer" aria-hidden="true">
                                <div v-for="(m, idx) in markers" :key="idx" class="marker"
                                    :style="{ left: m.left + 'px', top: m.top + 'px' }"
                                    @click="onMarkerClick(m, $event)"
                                    :title="m.regions.map(r => r.name).join(', ') + ' — ' + m.count"
                                    :data-codes="m.dataCodes.join(', ')" @mouseenter="markerPathHover(m)"
                                    @mouseleave="markerPathLeave(m)">
                                    <div class="marker__dot" :class="{ 'multi': m.regionIds.length > 1 }">
                                        <span v-if="m.regionIds.length === 1">{{ m.count }}</span>
                                        <span v-else>{{ m.count }}</span>

                                    </div>
                                    <div class="custom__title">
                                        <span v-for="reg in m.regions" :key="reg.id">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                viewBox="0 0 16 16" fill="none">
                                                <path
                                                    d="M8 1.33203C9.5913 1.33203 11.1174 1.96417 12.2426 3.08939C13.3679 4.21461 14 5.74073 14 7.33203C14 9.38136 12.8827 11.0587 11.7053 12.262C11.1171 12.8567 10.4753 13.3959 9.788 13.8727L9.504 14.066L9.37067 14.1547L9.11933 14.3147L8.89533 14.4514L8.618 14.6127C8.42976 14.7201 8.21675 14.7767 8 14.7767C7.78325 14.7767 7.57024 14.7201 7.382 14.6127L7.10467 14.4514L6.758 14.238L6.63 14.1547L6.35667 13.9727C5.61522 13.471 4.9246 12.8981 4.29467 12.262C3.11733 11.058 2 9.38136 2 7.33203C2 5.74073 2.63214 4.21461 3.75736 3.08939C4.88258 1.96417 6.4087 1.33203 8 1.33203ZM8 5.33203C7.73736 5.33203 7.47728 5.38376 7.23463 5.48427C6.99198 5.58478 6.7715 5.7321 6.58579 5.91782C6.40007 6.10353 6.25275 6.32401 6.15224 6.56666C6.05173 6.80932 6 7.06939 6 7.33203C6 7.59467 6.05173 7.85475 6.15224 8.0974C6.25275 8.34005 6.40007 8.56053 6.58579 8.74624C6.7715 8.93196 6.99198 9.07928 7.23463 9.17979C7.47728 9.2803 7.73736 9.33203 8 9.33203C8.53043 9.33203 9.03914 9.12132 9.41421 8.74624C9.78929 8.37117 10 7.86246 10 7.33203C10 6.8016 9.78929 6.29289 9.41421 5.91782C9.03914 5.54274 8.53043 5.33203 8 5.33203Z"
                                                    fill="#5F22C1" />
                                            </svg>
                                            {{ reg.name }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
    <SubscribeBlock />
    <FooterBlock />
</template>
<style scoped>
.objects {
    padding-top: 87px;
}

.map_wrapper {
    background: #F0F2F2;
    height: 670px;
}

.map_wrapper .container {
    position: relative;
}

.infoSelectedRegion {
    display: flex;
    justify-content: space-between;
    width: calc(100% - 80px);
    border-radius: 8px;
    background: #FFF;
    gap: 10px;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(22, 28, 51, 0.15);
    position: absolute;
    top: 10px;
    left: 40px;
    z-index: 3;
    padding: 12px;
}

.back {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #383838;
    text-align: center;
    font-family: Onest;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    cursor: pointer;
}

.icon {
    display: flex;
    width: 32px;
    height: 32px;
    padding: 5.857px 6px 6.143px 6px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: #E9E9E9;
}

.region {
    display: flex;
    align-items: center;
    gap: 14px;
}

.regionName {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #5F22C1;
    text-align: center;
    font-family: Onest;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}

.currentCount {
    color: #5F22C1;
    text-align: center;
    font-family: Onest;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
    /* 14.4px */
    display: inline-flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1/1;
    border-radius: 100px;
    border: 1px solid #5F22C1;
    width: 30px;
    height: 30px;
}

.map {}

.map__content {
    width: 100%;
    height: 670px;
    position: relative;
    overflow: hidden;
    display: flex;
    box-shadow: 0 0 100px 0 rgba(240, 242, 242, 0.25) inset;
    z-index: 2;
}

.map #svgRoot {
    display: block;
    max-width: 100%;
    width: 100%;
}

.map #viewport path {
    fill: #B7BEC7;
    stroke: #DDE1E8;
    cursor: pointer;
}

.map #viewport path.active {
    fill: #5F22C1;
}


/* слой маркеров */
.markers-layer {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* чтобы svg клики не блокировались; каждый маркер переопределит pointer-events */
}

/* один маркер */
.marker {
    position: absolute;
    transform: translate(-50%, -50%);
    /* центрируем маркер */
    pointer-events: auto;
    z-index: 2;
}

.custom__title {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%);

    transition: all .3s ease;
    color: #5F22C1;
    text-align: center;
    font-family: Onest;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    display: flex;
    align-items: center;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    border-radius: 12px;
    border: 1px solid #FFF;
    background: rgba(255, 255, 255, 0.90);
    backdrop-filter: blur(10px);
    padding: 14px;
}

.custom__title span {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* вид круга */
.marker__dot {
    min-width: 48px;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #5f22c1;
    color: white;
    padding: 6px;
    font-weight: 600;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transition: transform .18s ease;
}

/* если маркер объединяет несколько регионов — делаем другой стиль */
.marker__dot.multi {
    background: #ff7a00;
}

/* hover */
.marker__dot:hover {
    transform: scale(1.08);
    cursor: pointer;
}

.categories {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 24px;
    margin-bottom: 28px;
}

.category {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #525252;
    font-family: Onest;
    font-size: 13px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    /* 138.462% */
    padding: 8px 16px;
    white-space: nowrap;
    cursor: pointer;
    border-radius: 100px;
    border: 1px solid #D4D4D4;
}

.category.active {
    background: #5F22C1;
    color: #fff;
}

.info {
    display: inline-flex;
    padding: 8px 12px 8px 8px;
    align-items: center;
    gap: 6px;
    border-radius: 100px;
    border: 1px solid #FFF;
    background: rgba(255, 255, 255, 0.90);
    backdrop-filter: blur(10px);
    height: max-content;
    position: absolute;
    top: 16px;
    left: 0;
    z-index: 3;
}

@media screen and (max-width: 1024px) {
    .infoSelectedRegion {
        width: calc(100% - 40px);
        left: 20px;
    }

    .infoSelectedRegion w {
        display: none;
    }

}
</style>