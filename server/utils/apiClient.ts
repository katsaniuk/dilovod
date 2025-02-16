import axios from 'axios';
import type { AxiosError } from 'axios';

/**
 * Загальна функція для надсилання API-запитів
 * @param apiBaseUrl - Базовий URL API
 * @param packet - Дані запиту
 * @returns Відповідь API
 */
export const sendApiRequest = async <T>(
  apiBaseUrl: string,
  packet: object
): Promise<T> => {
  try {
    const formData = new URLSearchParams();
    formData.append('packet', JSON.stringify(packet));

    const response = await axios.post<T>(apiBaseUrl, formData);

    if (!response.data) {
      throw new Error('API повернуло порожню відповідь');
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('❌ Помилка API:', {
      url: apiBaseUrl,
      request: packet,
      response: axiosError.response?.data
    });

    throw new Error(
      axiosError.response?.data &&
      typeof axiosError.response.data === 'object' &&
      'error' in axiosError.response.data
        ? String(axiosError.response.data.error)
        : 'Сталася невідома помилка'
    );
  }
};
