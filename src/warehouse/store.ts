import type { Shelf, Executor, Receipt, Writeoff, PrintTemplate } from './types';

const KEYS = {
  shelves: 'wh_shelves',
  executors: 'wh_executors',
  receipts: 'wh_receipts',
  writeoffs: 'wh_writeoffs',
  templates: 'wh_templates',
  seeded: 'wh_seeded',
} as const;

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const store = {
  shelves: {
    list: () => load<Shelf>(KEYS.shelves),
    save: (data: Shelf[]) => save(KEYS.shelves, data),
  },
  executors: {
    list: () => load<Executor>(KEYS.executors),
    save: (data: Executor[]) => save(KEYS.executors, data),
  },
  receipts: {
    list: () => load<Receipt>(KEYS.receipts),
    save: (data: Receipt[]) => save(KEYS.receipts, data),
  },
  writeoffs: {
    list: () => load<Writeoff>(KEYS.writeoffs),
    save: (data: Writeoff[]) => save(KEYS.writeoffs, data),
  },
  templates: {
    list: () => load<PrintTemplate>(KEYS.templates),
    save: (data: PrintTemplate[]) => save(KEYS.templates, data),
  },
};

export function seedIfNeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return;

  const shelves: Shelf[] = [
    { id: uid(), code: 'С-01', zone: 'Зона А, Ряд 1', notes: 'Ближний к входу' },
    { id: uid(), code: 'С-02', zone: 'Зона А, Ряд 2', notes: '' },
  ];

  const executors: Executor[] = [
    { id: uid(), fullName: 'Иванов Иван Иванович', personnelNumber: '00123', position: 'Кладовщик', department: 'Склад', phone: '+375 29 123-45-67' },
    { id: uid(), fullName: 'Петров Пётр Петрович', personnelNumber: '00124', position: 'Заведующий складом', department: 'Склад', phone: '+375 29 234-56-78' },
  ];

  const s1 = shelves[0].id;
  const s2 = shelves[1].id;
  const e1 = executors[0].id;
  const e2 = executors[1].id;
  const today = new Date().toISOString().slice(0, 10);

  const receipts: Receipt[] = [
    { id: uid(), date: today, invoiceNumber: 'Н-001', article: 'АРТ-001', name: 'Фискальный накопитель ФН-1.2', quantity: 10, unit: 'шт', shelfId: s1, executorId: e1 },
    { id: uid(), date: today, invoiceNumber: 'Н-002', article: 'АРТ-002', name: 'Чековая лента 80мм', quantity: 50, unit: 'уп', shelfId: s2, executorId: e2 },
  ];

  const writeoffs: Writeoff[] = [
    { id: uid(), date: today, actNumber: 'А-001', shelfId: s1, article: 'АРТ-001', name: 'Фискальный накопитель ФН-1.2', quantity: 2, unit: 'шт', reason: 'Установка в кассу', executorId: e1 },
    { id: uid(), date: today, actNumber: 'А-002', shelfId: s2, article: 'АРТ-002', name: 'Чековая лента 80мм', quantity: 5, unit: 'уп', reason: 'Выдача со склада', executorId: e2 },
  ];

  store.shelves.save(shelves);
  store.executors.save(executors);
  store.receipts.save(receipts);
  store.writeoffs.save(writeoffs);
  store.templates.save([]);
  localStorage.setItem(KEYS.seeded, '1');
}
