<template>
  <div class="container">
    <!-- Лоадер, який покриває форму -->
    <div v-if="isLoading" class="loader-overlay">
      <div class="loader">Завантаження...</div>
    </div>

    <form @submit.prevent="submitOrder" class="order-form">
      <!-- Номер телефону -->
      <div class="form-group">
        <label for="phoneNumber">Номер телефону:</label>
        <input
          v-model="phoneNumber"
          id="phoneNumber"
          type="text"
          required
          class="input"
          placeholder="+380XXXXXXXXX"
          pattern="^\+380\d{9}$"
          @input="checkCustomer"
        />
        <div v-if="customerExists !== null" class="customer-status">
          {{ customerExists ? 'Клієнт існує' : 'Новий клієнт' }}
        </div>
      </div>

      <!-- Ім'я замовника -->
      <div class="form-group">
        <label for="customerName">Ім'я замовника:</label>
        <input
          v-model="customerName"
          id="customerName"
          type="text"
          required
          class="input"
        />
      </div>

      <!-- Кастомний селект з пошуком для товарів -->
      <div class="form-group">
        <label>Оберіть товари:</label>
        <div class="product-select-group">
          <div class="select-display" @click="toggleDropdown">
            <span v-if="selectedProducts.length === 0" class="placeholder">
              Оберіть товар...
            </span>
            <span class="dropdown-arrow">&#9662;</span>
          </div>
          <!-- Дропдаун з інпутом для фільтрації -->
          <div v-if="dropdownOpen" class="dropdown">
            <div class="filter-container">
              <input
                type="text"
                v-model="filterQuery"
                placeholder="Пошук..."
                class="dropdown-filter"
                @click.stop
              />
            </div>
            <ul class="dropdown-list">
              <li
                v-for="product in filteredProducts"
                :key="product.code"
                class="dropdown-item"
                @click.stop="selectProduct(product)"
              >
                {{ product.good__pr }} - {{ product.price }} грн
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Список обраних товарів з можливістю редагування кількості -->
      <div class="form-group" v-if="selectedProducts.length">
        <label>Обрані товари:</label>
        <div
          v-for="(product, index) in selectedProducts"
          :key="product.code + '-' + index"
          class="product-item"
        >
          <div class="product-info">
            <span class="product-name">{{ product.good__pr }}</span>
            <span class="product-price">Вартість: {{ product.price }} грн</span>
          </div>
          <div class="quantity-control">
            <!-- Кнопку видалення переміщено ліворуч -->
            <button
              type="button"
              class="remove-product-btn"
              @click.stop="removeProduct(product)"
            >
              &#128465;
            </button>
            <label>Кількість:</label>
            <input
              type="number"
              v-model.number="product.quantity"
              min="1"
              class="quantity-input"
            />
          </div>
        </div>
      </div>

      <!-- Загальна сума (тепер як блок, а не input) -->
      <div class="form-group total-group">
        <label>Сума:</label>
        <div class="total-display">{{ totalFormatted }}</div>
      </div>

      <!-- Кнопка збереження -->
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? 'Збереження...' : 'Зберегти замовлення' }}
      </button>
    </form>

    <!-- Повідомлення про статус -->
    <div v-if="message" class="message" :class="{ error: messageError }">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const customerName = ref('');
const phoneNumber = ref('');
const selectedProducts = ref([]);
const message = ref('');
const messageError = ref(false);
const products = ref([]);
const persons = ref([]);
const customerExists = ref(null);
const isSubmitting = ref(false);
const isLoading = ref(true); // прапорець для лоадера

// Для роботи дропдауну
const dropdownOpen = ref(false);
const filterQuery = ref('');

// Завантаження товарів та клієнтів при монтуванні
onMounted(async () => {
  isLoading.value = true;
  await loadProducts();
  await loadPersons();
  isLoading.value = false;
});

// Завантаження товарів
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Помилка отримання товарів');
    const fetchedProducts = await response.json();
    products.value = fetchedProducts.map((product, index) => ({
      ...product,
      code: product.code,
      price: 1000 + index * 100
    }));
  } catch (error) {
    setMessage(error.message, true);
  }
}

// Завантаження клієнтів
async function loadPersons() {
  try {
    const response = await fetch('/api/persons');
    if (!response.ok) throw new Error('Помилка отримання клієнтів');
    const data = await response.json();
    persons.value = data.persons || [];
  } catch (error) {
    setMessage(error.message, true);
  }
}

// Перевірка клієнта за номером телефону
const checkCustomer = () => {
  const customer = persons.value.find(
    (p) => p.person_phone && p.person_phone === phoneNumber.value
  );

  customerExists.value = !!customer;
  customerName.value = customer ? customer.person_name : null;
};

watch(phoneNumber, checkCustomer);

// Обчислення загальної суми
const total = computed(() =>
  selectedProducts.value.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  )
);
const totalFormatted = computed(() => `${total.value.toFixed(2)} грн`);

// Перемикаємо відкриття дропдауну
function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

// Фільтрація товарів для дропдауну (не включає вже обрані)
const filteredProducts = computed(() => {
  const query = filterQuery.value.trim().toLowerCase();
  return products.value.filter(
    (product) =>
      !selectedProducts.value.some((p) => p.code === product.code) &&
      product.good__pr.toLowerCase().includes(query)
  );
});

// Додавання товару (при виборі з дропдауну)
function selectProduct(product) {
  // Створюємо глибоку копію об'єкта товару
  const productCopy = JSON.parse(JSON.stringify(product));
  productCopy.quantity = 1;

  if (!selectedProducts.value.some((p) => p.code === productCopy.code)) {
    selectedProducts.value.push(productCopy);
  }
  filterQuery.value = '';
  dropdownOpen.value = false;
}

function clearFilter() {
  filterQuery.value = '';
}

// Видалення товару із вибраних
function removeProduct(product) {
  selectedProducts.value = selectedProducts.value.filter(
    (p) => p.code !== product.code
  );
}

// Відправка замовлення
async function submitOrder() {
  try {
    validateOrder();
    isSubmitting.value = true;
    message.value = '';

    let customer;
    if (!customerExists.value) {
      const newCustomer = await createCustomer();
      const customerData = newCustomer?.persons[0];

      if (customerData?.person_id) {
        customer = { ...customerData, person_id: customerData.person_id };
        persons.value.push(customer);

        await loadPersons();

        customerExists.value = true;
        setMessage('Новий покупець успішно зареєстрований!');
      } else {
        throw new Error('Не вдалося отримати ID нового клієнта');
      }
    } else {
      customer = persons.value.find(
        (p) => p.person_phone === phoneNumber.value.trim()
      );
    }
    if (!customer) {
      setMessage('Помилка отримання person_id клієнта', true);
      return;
    }

    const response = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        personId: customer.person_id,
        goods: selectedProducts.value.map((product) => ({
          good: product.good,
          qty: product.quantity,
          price: product.price,
          priceAmount: product.totalFormatted
        }))
      }
    });
    if (response.data?.header?.number) {
      setMessage(`Документ успішно створено № ${response.data.header.number}`);
      resetForm();
    } else {
      throw new Error('Не вдалося отримати номер документа');
    }
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    isSubmitting.value = false;
  }
}

// Валідація замовлення
function validateOrder() {
  if (!customerName.value.trim() || !phoneNumber.value.trim()) {
    throw new Error("Будь ласка, заповніть всі обов'язкові поля");
  }
  if (selectedProducts.value.length === 0) {
    throw new Error('Будь ласка, оберіть хоча б один товар');
  }
  const invalid = selectedProducts.value.filter(
    (product) => !product.quantity || product.quantity < 1
  );
  if (invalid.length > 0) {
    throw new Error(
      `Будь ласка, вкажіть коректну кількість для: ${invalid
        .map((p) => p.good__pr)
        .join(', ')}`
    );
  }
}

// Створення клієнта
async function createCustomer() {
  const response = await $fetch('/api/createPersons', {
    method: 'POST',
    body: {
      name: customerName.value.trim(),
      phone: phoneNumber.value.trim()
    }
  });
  return response;
}

// Скидання форми
const resetForm = () => {
  customerName.value = '';
  phoneNumber.value = '';
  selectedProducts.value = [];
  filterQuery.value = '';
  customerExists.value = null;
};

function setMessage(msg, isError = false) {
  message.value = msg;
  messageError.value = isError;

  setTimeout(() => {
    message.value = '';
  }, 3000);
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.order-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.product-select-group {
  position: relative;
  user-select: none;
}

.select-display {
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 6px;
  min-height: 40px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  cursor: pointer;
}

.placeholder {
  color: #888;
}

.selected-tag {
  background: #e0f0ff;
  border: 1px solid #b0d4ff;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem;
  display: flex;
  align-items: center;
}

.remove-tag {
  background: transparent;
  border: none;
  margin-left: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  color: #333;
}

.dropdown-arrow {
  margin-left: auto;
  padding: 0 0.5rem;
  font-size: 1.2rem;
}

/* Дропдаун */
.dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0 0 6px 6px;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.dropdown-filter {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-bottom: 1px solid #ddd;
  outline: none;
  box-sizing: border-box;
}

.dropdown-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f0f8ff;
}

/* Обрані товари */
.product-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-weight: 500;
}

.product-price {
  color: #28a745;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Quantity input */
.quantity-input {
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Кнопка збереження */
.submit-btn {
  background: #007bff;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.submit-btn:hover {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Повідомлення */
.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  background-color: #28a745;
  color: white;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.total-group {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* Новий блок для загальної суми */
.total-display {
  font-size: 1.25rem;
  font-weight: bold;
  color: #28a745;
  text-align: right;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.customer-status {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Лоадер */
.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loader {
  font-size: 1.5rem;
  color: #007bff;
}

/* Кнопка видалення товару (розташована ліворуч) */
.remove-product-btn {
  background: transparent;
  border: none;
  color: #dc3545;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.remove-product-btn:hover {
  transform: scale(1.1);
  color: #a71d2a;
}
</style>
