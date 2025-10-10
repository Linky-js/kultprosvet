<script setup>
import { reactive, computed, defineProps, ref, watch, onMounted } from 'vue';
import axios from "axios";
import { useStore } from 'vuex';
import { entityConfigs } from '@/configs/entityConfigs';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VCalendar from "v-calendar";
import "v-calendar/style.css";

// Компоненты форм
import Editor from '@/components/blocks/form/EditorNews.vue';
import BaseInput from '@/components/blocks/form/BaseInput.vue';
import BaseTextarea from '@/components/blocks/form/BaseTextarea.vue';
import BaseSelect from '@/components/blocks/form/BaseSelect.vue';
import BaseDatePicker from '@/components/blocks/form/BaseDatePicker.vue';
import BaseCoords from '@/components/blocks/form/KoordinatesVal.vue';
import DragImages from './elements/DragImages.vue';
import TestElement from './elements/TestElement.vue';

const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;

// props
const props = defineProps({
  entity: { type: String, required: true },
  initialData: { type: Object, default: () => ({}) },
});

// refs
const isCalendarVisible = ref(false);
const formattedDate = ref("Выберите дату");
const dateRange = ref(null);
const fieldOptions = reactive({}); // сюда складываем options для селектов: fieldOptions[fieldKey] = [{value,label},...]
// const isSaving = ref(false);

// вспомогательные refs для хранения "сырых" списков (если нужно)
const categoriesRaw = ref([]);
const regionsRaw = ref([]);

// computed
const config = computed(() => entityConfigs[props.entity] || []);

// form data
const formData = reactive({});

// ---------------------- INIT ----------------------
function getDefaultValue(type) {
  switch (type) {
    case 'input':
    case 'textarea':
    case 'editor':
    case 'select':
    case 'date':
      return '';
    case 'images':
      return [];
    case 'coords':
      return { lat: '', lng: '' };
    default:
      return '';
  }
}
function resolveValueFromSource(data, srcKey) {
  if (!data) return undefined;
  if (data[srcKey] !== undefined) return data[srcKey];

  // если sourceKey = something_id и в data есть object 'something' с id
  if (srcKey && srcKey.endsWith('_id')) {
    const objKey = srcKey.replace('_id', '');
    const maybeObj = data[objKey];
    if (maybeObj && typeof maybeObj === 'object') {
      if (maybeObj.id !== undefined) return maybeObj.id;
      if (Array.isArray(maybeObj) && maybeObj[0] && maybeObj[0].id !== undefined) return maybeObj[0].id;
    }
  }

  // если sourceKey содержит точку 'user.name' (возможность расширить)
  if (srcKey && srcKey.includes('.')) {
    const parts = srcKey.split('.');
    let cur = data;
    for (const p of parts) {
      if (!cur) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  return undefined;
}
function initForm() {
  config.value.forEach((field) => {
    const srcKey = field.sourceKey || field.key;
    const maybe = resolveValueFromSource(props.initialData, srcKey);
    const value = maybe !== undefined ? maybe : getDefaultValue(field.type);

    // адаптация формата для images/image
    if (field.type === 'images' && Array.isArray(maybe)) {
      formData[field.key] = maybe.map(v => ({ id: Date.now() + Math.random(), url: v, isExisting: true }));
    } else if (field.type === 'image' && typeof maybe === 'string' && maybe) {
      formData[field.key] = { id: Date.now(), url: maybe, isExisting: true };
    } else {
      formData[field.key] = value;
    }
  });

  // дополнительная страховка: если в initialData есть вложенный category/region объекты, выставим соответствующие ключи
  // например initialData.category.id => formData.categorieId
  config.value.forEach(field => {
    const tKey = field.key;
    const src = field.sourceKey || field.key;
    if ((src === 'category_id' || tKey === 'categorieId') && props.initialData) {
      const catVal = resolveValueFromSource(props.initialData, 'category_id') ?? resolveValueFromSource(props.initialData, 'category');
      if (catVal !== undefined) formData[tKey] = catVal;
    }
    if ((src === 'region_id' || tKey === 'regionId') && props.initialData) {
      const regVal = resolveValueFromSource(props.initialData, 'region_id') ?? resolveValueFromSource(props.initialData, 'region');
      if (regVal !== undefined) formData[tKey] = regVal;
    }
  });
}

onMounted(() => {
  console.log('props.', props.entity);

  initForm();
  getDynamicOptions();
});

// Следим за изменением initialData (например, при редактировании)
watch(() => props.initialData, initForm, { deep: true });
watch(() => props.entity, (val) => {
  console.log('props.entity', val);

});

// ---------------------- COMPONENTS MAP ----------------------
function getComponent(type) {
  const map = {
    input: BaseInput,
    textarea: BaseTextarea,
    select: BaseSelect,
    date: BaseDatePicker,
    coords: BaseCoords,
    images: DragImages,
    editor: Editor,
    test: TestElement,
  };
  return map[type] || BaseInput;
}

// ---------------------- OPTIONS LOADING ----------------------
async function getDynamicOptions() {
  // темы
  const needsTheme = config.value.some(f => (f.sourceKey || f.targetKey || f.key) === 'theme_id' || f.key === 'theme');
  if (needsTheme) await getThemes();

  // категории (ищем конфигные поля, которые связаны с category_id / categorieId)
  const needsCategory = config.value.some(f => {
    const src = f.sourceKey || f.targetKey || '';
    return src === 'category_id' || f.key === 'categorieId' || src.includes('category');
  });
  if (needsCategory) await getCategories();

  // регионы (обычно для object)
  const needsRegions = config.value.some(f => {
    const src = f.sourceKey || f.targetKey || '';
    return src === 'region_id' || f.key === 'regionId';
  });
  if (needsRegions) await getRegions();
}

async function getThemes() {
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await axios.get(`${apiUrl}api-theme/get-list${authGet}`);
    const themes = response.data.themes || [];

    fieldOptions.theme = themes.map(t => ({
      value: t.id,
      label: t.name,
    }));

    if (props.initialData?.theme?.id) {
      formData.theme = props.initialData.theme.id;
    }
  } catch (err) {
    console.error("Ошибка при загрузке тем:", err);
  }
}

async function getCategories() {
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    // endpoint формируем по шаблону: api-${entity}-category/get-list
    let link = props.entity.includes('1banner') ? props.entity.slice(0, -7) : props.entity;
    const endpoint = `${apiUrl}api-${link}-category/get-list${authGet}`;
    const response = await axios.get(endpoint);
    // backend у тебя возвращал либо response.data.categories, либо response.data.object_categories
    const cats = response.data.categories || response.data.object_categories || [];
    categoriesRaw.value = cats;

    // Преобразуем в массив {value,label}
    // Возможные структуры: {id, name} или {category_id, title} — пробуем наиболее частые
    const options = cats.map(c => {
      if (c.id !== undefined && (c.name || c.title || c.title_ru)) {
        return { value: c.id, label: c.name || c.title || c.title_ru || c.name_ru };
      }
      // fallback — если структура иная, берём первое числовое поле как id и строковое как label
      const keys = Object.keys(c);
      const idKey = keys.find(k => k.toLowerCase().includes('id')) || keys[0];
      const labelKey = keys.find(k => ['name', 'title', 'label'].includes(k)) || keys[1] || keys[0];
      return { value: c[idKey], label: c[labelKey] };
    });


    // находим поле конфигурации, куда нужно подставить опции — обычно key = 'categorieId' или sourceKey = 'category_id'
    config.value.forEach(field => {
      const src = field.sourceKey || field.targetKey || field.key;
      if (src === 'category_id' || field.key === 'categorieId' || src.includes('category')) {

        fieldOptions[field.key] = options;
        // если редактируем и initialData имеет category или category_id — выставляем
        const initialCat = resolveValueFromSource(props.initialData, 'category_id') ?? resolveValueFromSource(props.initialData, 'category');
        if (initialCat !== undefined) {
          formData[field.key] = initialCat;
        }
      }
    });



  } catch (err) {
    console.error("Ошибка при загрузке категорий:", err);
  }
}

async function getRegions() {
  try {
    const authGet = `&auth=${user.username}:${user.auth_key}`;
    const response = await axios.get(`${apiUrl}api-object-region/get-list${authGet}`);
    const regs = response.data.object_regions || [];
    regionsRaw.value = regs;

    const options = regs.map(r => ({ value: r.id, label: r.name || r.title || r.region_name || r.name_ru }));

    // подставляем в поле regionId если есть в конфиге
    config.value.forEach(field => {
      const src = field.sourceKey || field.targetKey || field.key;
      if (src === 'region_id' || field.key === 'regionId') {
        fieldOptions[field.key] = options;
        const initialReg = resolveValueFromSource(props.initialData, 'region_id') ?? resolveValueFromSource(props.initialData, 'region');
        if (initialReg !== undefined) formData[field.key] = initialReg;
      }
    });
  } catch (err) {
    console.error("Ошибка при загрузке регионов:", err);
  }
}

function getFieldProps(field) {
  const p = field.props || {};
  // для любого select мы пробуем взять опции из fieldOptions[field.key]
  if ((field.type === 'select' || (p && p.options)) && fieldOptions[field.key]) {
    return { ...p, options: fieldOptions[field.key] || [] };
  }
  // остальные просто прокидываем
  return p;
}

// ---------------------- SAVE ENTITY ----------------------
async function uploadFile(input) {
  // Определяем File из входа
  let file = null;

  if (!input) return null;

  // Если передали сам File
  if (input instanceof File) {
    file = input;
  }
  // Если передали объект { file, dataurl, ... }
  else if (typeof input === 'object' && input.file instanceof File) {
    file = input.file;
  }
  // Если передали событие <input type="file" /> 
  else if (input.target && input.target.files && input.target.files[0]) {
    file = input.target.files[0];
  }

  if (!file) {
    console.warn('uploadFile: не нашли файл для загрузки', input);
    return null;
  }

  const validFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  if (!validFileTypes.includes(file.type)) {
    alert("Можно загружать только JPG/PNG/WebP/SVG/GIF.");
    return null;
  }

  const fd = new FormData();
  fd.append("UploadForm[file]", file);
  fd.append("folder", "users/avatar");
  fd.append("filenamePrefix", "avatar_");

  const authGet = `&auth=${user.username}:${user.auth_key}`;

  try {
    const res = await axios.post(apiUrl + "upload" + authGet, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Поддерживаем разные форматы ответа сервера
    const d = res.data;
    if (!d) return null;
    if (typeof d === 'string') return d;
    if (d.path) return d.path;
    if (d.url) return d.url;
    if (d.file) return d.file;
    // если вернулся объект/строка в другом ключе — вернём весь payload чтобы не терять данные
    return d;
  } catch (err) {
    console.error('Ошибка uploadFile:', err);
    throw err;
  }
}

// buildParamsFromConfig
async function buildParamsFromConfig(config, formDataLocal) {
  try {
    const params = {};

    // сначала простое копирование
    config.forEach(field => {
      const targetKey = field.sourceKey || field.key; // у тебя уже так использовалось
      const value = formDataLocal[field.key];
      if (value !== undefined) {
        params[targetKey] = value;
      }
    });

    params.date_add = new Date();

    // Пример для титульного фото: backend у тебя использует ключ 'title_photo'
    // Проверяем: если пришёл объект (не строка) — нужно загрузить файл
    if ((params.title_photo && typeof params.title_photo !== 'string') || (params.filename && typeof params.filename !== 'string')) {
      // если пришёл объект и у него флаг isExisting === true, просто возьмём url
      const tp = params.title_photo || params.filename;
      if (tp.isExisting && (tp.url || tp.path)) {
        params.title_photo = tp.url || tp.path;
      } else {
        // загружаем файл (поддерживает File / {file}/ event)
        const uploaded = await uploadFile(tp);
        // подставляем путь, который вернул сервер
        params.title_photo = uploaded;
        params.filename = uploaded;
      }
    } else {
      // если нет params.title_photo, но в formData есть поле вида srcPhoto (в зависимости от конфига)
      // — можно добавить дополнительные проверки, если нужно
    }

    return params;
  } catch (error) {
    console.error("Ошибка при формировании параметров:", error);
    return {};
  }
}

async function saveEntity() {
  const authGet = `&auth=${user.username}:${user.auth_key}`;
  const isUpdate = !!props.initialData?.id;
  let link = '';
  if (props.entity.includes('1category')) {
    link = props.entity.slice(0, -9) + '-category';
  } else {
    link = props.entity;
    if (props.entity.includes('1banner')) {
      link = props.entity.slice(0, -7) + '-banner';
    }
  }

  const endpoint = `api-${link}/${isUpdate ? "update" : "set"}`;
  const configCurrent = entityConfigs[props.entity] || [];

  try {
    const params = await buildParamsFromConfig(configCurrent, formData);
    if (props.entity === 'news') params.author_id = user.user_id;
    if (isUpdate) params.id = props.initialData.id;
    const { data } = await axios.post(apiUrl + endpoint + authGet, params, {
      headers: { "Content-Type": "application/json" },
    });

    if (data.status === "false") {
      toast.error(data.error || "Ошибка при сохранении", { autoClose: 1500 });
      return;
    }

    toast.success(isUpdate ? "Изменения сохранены!" : "Создано успешно!", {
      autoClose: 1000,
    });
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
    toast.error("Произошла ошибка при сохранении", { autoClose: 1000 });
  }
}

// ---------------------- DATE HANDLING ----------------------
function handleDateChange(timestamp = false) {
  if (timestamp) {
    const date = new Date(timestamp);
    formattedDate.value = date.toLocaleDateString("ru-RU");
  }
  if (dateRange.value) {
    const date = new Date(dateRange.value);
    formattedDate.value = date.toLocaleDateString("ru-RU");
    formData.date_publication = date.getTime() / 1000;
  }
}
</script>

<template>
  <div class="content-editor">
    <!-- Календарь -->
    <div class="wrap-calendar">
      <div class="price__item-btnCalendar" @click="isCalendarVisible = !isCalendarVisible">
        {{ formattedDate }}
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M14.9386 6.7124L10.0486 11.6024C9.47109 12.1799 8.52609 12.1799 7.94859 11.6024L3.05859 6.7124"
            stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <div v-if="isCalendarVisible" class="calendar-container">
        <VDatePicker v-model="dateRange" mode="dateTime" is24hr :is-range="false"
          @click:outside="isCalendarVisible = false" @update:model-value="handleDateChange" />
        <VCalendar />
      </div>
    </div>

    <!-- Генерация полей -->
    <component v-for="field in config" :is="getComponent(field.type)" :key="field.key" v-model="formData[field.key]"
      :label="field.label" v-bind="getFieldProps(field)" />

    <button @click="saveEntity" class="btn btn-primary">Сохранить</button>
  </div>
</template>

<style scoped>
#fileNews {
  display: none;
}

.content-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 0 40px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-weight: 600;
  font-size: 16px;
  line-height: 18px;
  color: #333;
}
</style>
