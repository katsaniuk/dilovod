import { defineEventHandler, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { fetchPersons } from '~/server/utils/fetchPersons';

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  if (!config.dilovodApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API ключ відсутній'
    });
  }

  try {
    const persons = await fetchPersons(
      config.public.apiBaseUrl,
      config.dilovodApiKey
    );

    return { persons: persons.length > 0 ? persons : [] };
  } catch (error) {
    console.error('❌ Помилка отримання клієнтів:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Невідома помилка'
    });
  }
});
