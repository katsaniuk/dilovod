import { sendApiRequest } from './apiClient';
import { buildRequestPayload } from './buildRequests';
import { Product, ProductWithPrice } from '~/types';

/**
 * Отримання списку товарів через API
 * @param apiBaseUrl - Базовий URL API
 * @param apiKey - API ключ
 * @returns Список товарів з обробленою ціною
 */
export const fetchProducts = async (
  apiBaseUrl: string,
  apiKey: string
): Promise<ProductWithPrice[]> => {
  if (!apiBaseUrl || !apiKey) {
    throw new Error('Базовий URL або API ключ не вказано');
  }

  // Формуємо запит до API
  const packet = buildRequestPayload(apiKey);

  // Надсилаємо запит і обробляємо дані
  const data = await sendApiRequest<Product[]>(apiBaseUrl, packet);

  // Мапимо дані, додаючи обробку ціни
  return data.map((product) => ({
    ...product,
    price: product.price ? parseFloat(product.price) : 0
  }));
};
