// Запит для отримання клієнтів
export const buildPersonRequest = (apiKey: string, version = '0.25') => ({
  version,
  key: apiKey,
  action: 'request',
  params: {
    from: 'catalogs.persons',
    fields: {
      id: 'person_id',
      name: 'person_name',
      phone: 'person_phone'
    }
  }
});

// Запит для створення клієнта
export const buildCreatePersonRequest = (
  apiKey: string,
  name: string,
  phone: string,
  version = '0.25'
) => ({
  version,
  key: apiKey,
  action: 'saveObject',
  params: {
    header: {
      id: 'catalogs.persons',
      name: { uk: name },
      parent: 1100100000001007,
      personType: 1004000000000035,
      details: JSON.stringify({
        phones: [{ pr: phone, kind: 'phone' }],
        emails: [],
        messengers: [],
        urls: [],
        attributes: [],
        notes: []
      })
    }
  }
});

// Запит для отримання товарів
export const buildRequestPayload = (apiKey: string) => ({
  version: '0.25',
  key: apiKey,
  action: 'request',
  params: {
    from: 'catalogs.goods',
    fields: {
      id: 'good',
      code: 'code',
      'parent.code': 'parentCode',
      price: 'price'
    },
    filters: [
      {
        alias: 'parentCode',
        operator: '=',
        value: 101010
      }
    ]
  }
});

// Запит для створення замовлення
export const buildCreateOrderRequest = ({
  apiKey,
  firm,
  personId,
  remark = '',
  goods,
  version = '0.25'
}: {
  apiKey: string;
  firm: number;
  personId: number;
  remark?: string;
  goods: { good: number; qty: number }[];
  version?: string;
}) => ({
  version,
  key: apiKey,
  action: 'call',
  params: {
    method: 'saleOrderCreate',
    arguments: {
      header: {
        firm: 1100400000001001,
        person: personId,
        remarkFromPerson: remark
      },
      goods: goods.map((item) => ({
        good: item.good,
        qty: item.qty
      }))
    }
  }
});
