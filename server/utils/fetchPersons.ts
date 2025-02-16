import { sendApiRequest } from './apiClient';
import { buildPersonRequest } from './buildRequests';
import type { Person } from '~/types';

/**
 * Отримання списку клієнтів через API
 * @param apiBaseUrl - Базовий URL API
 * @param apiKey - API ключ
 * @returns Список клієнтів
 */
export const fetchPersons = async (
  apiBaseUrl: string,
  apiKey: string
): Promise<Person[]> => {
  if (!apiBaseUrl || !apiKey) {
    throw new Error('Базовий URL або API ключ не вказано');
  }

  const packet = buildPersonRequest(apiKey);
  return sendApiRequest<Person[]>(apiBaseUrl, packet);
};
