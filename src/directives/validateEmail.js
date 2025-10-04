export default {
  mounted(el, binding) {
    el.addEventListener('input', () => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = regex.test(el.value);

      // Обновляем флаг в компоненте через переданный метод или реактивное свойство
      if (binding.value) {
        binding.value(isValid);
      }

      // Визуальная индикация валидности ввода
      if (!isValid && el.value.length > 0) {
        el.style.borderColor = 'red';
      } else {
        el.style.borderColor = '';
      }
    });
  }
};