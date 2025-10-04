export default {
    mounted(el, binding) {
      el.addEventListener('input', () => {
        // Регулярное выражение для проверки номера телефона в формате +7(XXX) XXX-XX-XX
        const regex = /^\+7\(\d{3}\) \d{3}-\d{2}-\d{2}$/;
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
  