export interface Shelf {
  id: string;
  code: string;
  zone: string;
  notes: string;
}

export interface Executor {
  id: string;
  fullName: string;
  personnelNumber: string;
  position: string;
  department: string;
  phone: string;
}

export interface Receipt {
  id: string;
  date: string;
  invoiceNumber: string;
  article: string;
  name: string;
  quantity: number;
  unit: string;
  shelfId: string;
  executorId: string;
}

export interface Writeoff {
  id: string;
  date: string;
  actNumber: string;
  shelfId: string;
  article: string;
  name: string;
  quantity: number;
  unit: string;
  reason: string;
  executorId: string;
}

export interface TemplateField {
  id: string;
  variable: string;
  x: number;
  y: number;
}

export interface PrintTemplate {
  id: string;
  type: 'receipt' | 'writeoff';
  format: 'html' | 'image';
  content: string;
  fields: TemplateField[];
}

export interface BalanceRow {
  article: string;
  name: string;
  shelfId: string;
  shelfCode: string;
  quantity: number;
  unit: string;
}

export type TemplateVariable =
  | '{{номер}}'
  | '{{дата}}'
  | '{{артикул}}'
  | '{{товар}}'
  | '{{количество}}'
  | '{{ед_изм}}'
  | '{{стеллаж}}'
  | '{{исполнитель}}'
  | '{{причина}}';

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  '{{номер}}',
  '{{дата}}',
  '{{артикул}}',
  '{{товар}}',
  '{{количество}}',
  '{{ед_изм}}',
  '{{стеллаж}}',
  '{{исполнитель}}',
  '{{причина}}',
];

export const UNITS = ['шт', 'кг', 'м', 'уп'];
