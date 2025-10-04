export default {
    mounted(el) {
      el.addEventListener('input', () => {
        const regex = /[^а-яё\s]/gi;  // Разрешаем только кириллицу и пробелы
        el.value = el.value.replace(regex, '');
        // Вызов события input для обновления v-model
      });
    }
  };