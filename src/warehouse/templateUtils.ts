import type { Receipt, Writeoff, Executor, Shelf, PrintTemplate, TemplateVariable } from './types';

export interface PrintData {
  '{{номер}}': string;
  '{{дата}}': string;
  '{{артикул}}': string;
  '{{товар}}': string;
  '{{количество}}': string;
  '{{ед_изм}}': string;
  '{{стеллаж}}': string;
  '{{исполнитель}}': string;
  '{{причина}}': string;
}

export function buildPrintData(
  record: Receipt | Writeoff,
  shelves: Shelf[],
  executors: Executor[],
): PrintData {
  const shelf = shelves.find((s) => s.id === record.shelfId);
  const executor = executors.find((e) => e.id === record.executorId);
  const isReceipt = 'invoiceNumber' in record;
  return {
    '{{номер}}': isReceipt ? (record as Receipt).invoiceNumber : (record as Writeoff).actNumber,
    '{{дата}}': record.date,
    '{{артикул}}': record.article,
    '{{товар}}': record.name,
    '{{количество}}': String(record.quantity),
    '{{ед_изм}}': record.unit,
    '{{стеллаж}}': shelf ? shelf.code : '',
    '{{исполнитель}}': executor ? executor.fullName : '',
    '{{причина}}': isReceipt ? '' : (record as Writeoff).reason,
  };
}

export function applyTemplate(html: string, data: PrintData): string {
  return html.replace(/\{\{[^}]+\}\}/g, (match) => {
    return data[match as keyof PrintData] ?? match;
  });
}

export const STANDARD_RECEIPT_HTML = `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
<thead>
<tr>
<th colspan="2" style="border:1px solid #333;padding:8px;text-align:center;font-size:18px;background:#f0f0f0">Приходная накладная № {{номер}}</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #333;padding:6px;width:30%">Дата</td><td style="border:1px solid #333;padding:6px">{{дата}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Артикул</td><td style="border:1px solid #333;padding:6px">{{артикул}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Наименование ТМЦ</td><td style="border:1px solid #333;padding:6px">{{товар}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Количество</td><td style="border:1px solid #333;padding:6px">{{количество}} {{ед_изм}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Стеллаж</td><td style="border:1px solid #333;padding:6px">{{стеллаж}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Исполнитель</td><td style="border:1px solid #333;padding:6px">{{исполнитель}}</td></tr>
</tbody>
</table>`;

export const STANDARD_WRITEOFF_HTML = `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
<thead>
<tr>
<th colspan="2" style="border:1px solid #333;padding:8px;text-align:center;font-size:18px;background:#f0f0f0">Акт списания № {{номер}}</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #333;padding:6px;width:30%">Дата</td><td style="border:1px solid #333;padding:6px">{{дата}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Стеллаж</td><td style="border:1px solid #333;padding:6px">{{стеллаж}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Артикул</td><td style="border:1px solid #333;padding:6px">{{артикул}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Наименование ТМЦ</td><td style="border:1px solid #333;padding:6px">{{товар}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Количество</td><td style="border:1px solid #333;padding:6px">{{количество}} {{ед_изм}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Причина списания</td><td style="border:1px solid #333;padding:6px">{{причина}}</td></tr>
<tr><td style="border:1px solid #333;padding:6px">Исполнитель</td><td style="border:1px solid #333;padding:6px">{{исполнитель}}</td></tr>
</tbody>
</table>`;

export const VARIABLE_LABELS: Record<TemplateVariable, string> = {
  '{{номер}}': 'Номер документа',
  '{{дата}}': 'Дата',
  '{{артикул}}': 'Артикул',
  '{{товар}}': 'Наименование ТМЦ',
  '{{количество}}': 'Количество',
  '{{ед_изм}}': 'Ед. измерения',
  '{{стеллаж}}': 'Стеллаж',
  '{{исполнитель}}': 'Исполнитель',
  '{{причина}}': 'Причина списания',
};
