import { useEffect, useRef, useState } from 'react';
import { Printer, X } from 'lucide-react';
import type { Receipt, Writeoff, Shelf, Executor, PrintTemplate } from './types';
import { buildPrintData, applyTemplate } from './templateUtils';

interface PrintModalProps {
  record: Receipt | Writeoff;
  recordType: 'receipt' | 'writeoff';
  template: PrintTemplate | null;
  shelves: Shelf[];
  executors: Executor[];
  onClose: () => void;
}

export default function PrintModal({
  record,
  recordType,
  template,
  shelves,
  executors,
  onClose,
}: PrintModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editHtml, setEditHtml] = useState('');

  const data = buildPrintData(record, shelves, executors);

  useEffect(() => {
    if (!template) return;
    if (template.format === 'html') {
      const filled = applyTemplate(template.content, data);
      setEditHtml(filled);
    }
  }, [template]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePrint = () => {
    const content = containerRef.current?.innerHTML ?? '';
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Печать</title>
<style>@media print{body{margin:0}body *{visibility:hidden}.print-area,.print-area *{visibility:visible}.print-area{position:absolute;left:0;top:0;width:100%}}</style>
</head><body><div class="print-area">${content}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Печать документа
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              Распечатать
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          {!template && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center">
              <p className="text-sm text-amber-800">
                Шаблон бланка не загружен. Перейдите в раздел «Справочники и Шаблон бланка», чтобы загрузить или создать шаблон для{' '}
                {recordType === 'receipt' ? 'приходной накладной' : 'акта списания'}.
              </p>
            </div>
          )}

          {template && template.format === 'image' && (
            <div
              ref={containerRef}
              className="relative mx-auto bg-white"
              style={{ width: '794px', maxWidth: '100%' }}
            >
              <img
                src={template.content}
                alt="Бланк"
                className="block w-full select-none"
                draggable={false}
              />
              {template.fields.map((field) => {
                const value = data[field.variable as keyof typeof data] ?? field.variable;
                return (
                  <div
                    key={field.id}
                    className="absolute whitespace-nowrap rounded px-1 text-sm text-slate-900"
                    style={{
                      left: `${(field.x / 794) * 100}%`,
                      top: `${(field.y / 1123) * 100}%`,
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          )}

          {template && template.format === 'html' && (
            <div
              ref={containerRef}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: editHtml }}
              className="prose prose-sm max-w-none rounded-lg border border-slate-200 p-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          )}
        </div>
      </div>
    </div>
  );
}
