<script>
import { ref, onMounted, watch } from "vue";
import * as pdfjsLib from "pdfjs-dist";

// Указываем путь к воркеру вручную, если файл находится в public
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default {
  name: "PdfViewer",
  props: {
    pdfFile: {
      type: String, // Путь к PDF файлу
      required: true,
    },
  },
  setup(props) {
    
    const pdfPages = ref([]); // Массив для хранения страниц
    const canvasRefs = ref([]); // Массив для хранения ссылок на канвасы

    const renderPage = async (page, canvas) => {
      const viewport = page.getViewport({ scale: 1.1 });
      const context = canvas.getContext("2d");

      // Устанавливаем размер канваса в зависимости от страницы
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Рендерим страницу на канвас
      await page.render(renderContext);
    };

    const renderPDF = async () => {
      try {
        if (!props.pdfFile) {
          console.error("PDF file not provided.");
          return;
        }


        // Загрузка документа
        const loadingTask = pdfjsLib.getDocument(props.pdfFile);
      
        // Ожидаем завершения загрузки документа
        const pdf = await loadingTask.promise;


        // Очищаем массив страниц перед рендерингом
        pdfPages.value = [];

        // Рендерим каждую страницу
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          pdfPages.value.push(page); // Добавляем страницу в массив

          // Ждем, пока шаблон будет обновлен и канвас станет доступным
          watch(
            () => canvasRefs.value[pageNumber - 1],
            (canvas) => {
              if (canvas) {
                renderPage(page, canvas); // Рендерим страницу на канвас
              }
            }
          );
        }

      } catch (error) {
        console.error("Error loading or rendering PDF:", error);
      }
    };

    watch(() => props.pdfFile, renderPDF); // Перерендерить, если PDF изменится

    onMounted(() => {
      renderPDF();
    });

    return {
      pdfPages,
      canvasRefs,
    };
  },
  mounted() {
  },
};
</script>

<template>
  <div class="pdf-container">
    <!-- Выводим страницы с помощью v-for -->
    <div v-for="(page, index) in pdfPages" :key="index" class="pdf-page">
      <!-- Привязываем ref к каждому канвасу -->
      <canvas :ref="(el) => (canvasRefs[index] = el)"></canvas>
    </div>
  </div>
</template>

<style scoped>
.pdf-container {
  max-height: 80vh; /* Задаем максимальную высоту для контейнера */
  overflow-y: auto; /* Включаем вертикальную прокрутку */
  border: 1px solid #ccc;
  max-width: 600px;
}

.pdf-page {
  margin-bottom: 20px; /* Отступ между страницами */
}

canvas {
  width: 100%;
  height: auto;
}
</style>
