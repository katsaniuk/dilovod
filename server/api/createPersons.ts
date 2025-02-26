import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { buildCreatePersonRequest } from '~/server/utils/buildRequests';
import { fetchPersons } from '~/server/utils/fetchPersons';

/**
 * Валідація вхідних даних для створення клієнта
 */
const validatePersonData = (name: string, phone: string) => {
  if (!name.trim() || !phone.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ім'я та телефон обов'язкові"
    });
  }

  const phoneRegex = /^\+380\d{9}$/;
  if (!phoneRegex.test(phone.trim())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Невірний формат телефону. Використовуйте +380XXXXXXXXX'
    });
  }
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { name, phone } = await readBody(event);

  validatePersonData(name, phone);

  try {
    const packet = buildCreatePersonRequest(
      config.dilovodApiKey,
      name.trim(),
      phone.trim()
    );
    const formData = new URLSearchParams();
    formData.append('packet', JSON.stringify(packet));

    await $fetch(config.public.apiBaseUrl, {
      method: 'POST',
      body: formData
    });

    // Отримуємо оновлений список персон
    const updatedPersons = await fetchPersons(
      config.public.apiBaseUrl,
      config.dilovodApiKey
    );

    return { success: true, persons: updatedPersons };
  } catch (error) {
    console.error('❌ Помилка створення клієнта:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Помилка сервера'
    });
  }
});
