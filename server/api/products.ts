import { defineEventHandler, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { fetchProducts } from '~/server/utils/fetchProducts';

/**
 * Обробник для отримання списку товарів
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  if (!config.dilovodApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API ключ відсутній'
    });
  }

  try {
    const products = await fetchProducts(
      config.public.apiBaseUrl,
      config.dilovodApiKey
    );

    return products;
  } catch (error) {
    console.error('❌ Помилка при отриманні товарів:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Невідома помилка'
    });
  }
});
