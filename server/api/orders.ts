// server/api/saleOrderCreate.ts
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const apiUrl = `${config.public.apiBaseUrl}`; // Замініть на правильний шлях до вашого API
  const apiKey = config.dilovodApiKey;

  const requestData = {
    version: '0.25',
    key: apiKey,
    action: 'call',
    params: {
      method: 'saleOrderCreate',
      arguments: {
        header: {
          firm: 1100400000001001,
          person: body.personId,
          remarkFromPerson: 'call me please'
        },
        goods: body.goods.map((item: { good: string; qty: number }) => ({
          good: item.good,
          qty: item.qty
        }))
      }
    }
  };

  try {
    const response = await $fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    return response; // Повертаємо відповідь з API
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage:
        (error as any).message || 'Помилка при створенні замовлення',
      data: (error as any).data
    });
  }
});
