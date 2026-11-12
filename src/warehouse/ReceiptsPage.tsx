import { useMemo, useState } from 'react';
import { Download, Pencil, Plus, Printer, Search, Trash2, TrendingUp } from 'lucide-react';
import { exportToCsv } from './csv';
import { uid } from './store';
import type { WarehouseData } from './useWarehouseData';
import type { Receipt } from './types';
import { UNITS } from './types';
import PrintModal from './PrintModal';

const empty = (): Omit<Receipt, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  invoiceNumber: '',
  article: '',
  name: '',
  quantity: 1,
  unit: 'шт',
  shelfId: '',
  executorId: '',
});

export default function ReceiptsPage({ data }: { data: WarehouseData }) {
  const { receipts, shelves, executors, templates, updateReceipts } = data;
  const [form, setForm] = useState<Omit<Receipt, 'id'>>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [printRecord, setPrintRecord] = useState<Receipt | null>(null);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.article.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q),
    );
  }, [receipts, search]);

  const shelfName = (id: string) => shelves.find((s) => s.id === id)?.code ?? '';
  const executorName = (id: string) => executors.find((e) => e.id === id)?.fullName ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoiceNumber || !form.article || !form.name || !form.shelfId || !form.executorId) {
      setError('Заполните все обязательные поля');
      return;
    }
    setError('');
    if (editingId) {
      updateReceipts(receipts.map((r) => (r.id === editingId ? { ...form, id: editingId } : r)));
    } else {
      updateReceipts([...receipts, { ...form, id: uid() }]);
    }
    setForm(empty());
    setEditingId(null);
  };

  const handleEdit = (r: Receipt) => {
    setEditingId(r.id);
    setForm({ ...r });
  };

  const handleDelete = (id: string) => {
    updateReceipts(receipts.filter((r) => r.id !== id));
  };

  const handleExport = () => {
    exportToCsv(
      'поступления.csv',
      ['Дата', 'Номер накладной', 'Артикул', 'Наименование ТМЦ', 'Количество', 'Ед.', 'Стеллаж', 'Исполнитель'],
      filtered.map((r) => [r.date, r.invoiceNumber, r.article, r.name, r.quantity, r.unit, shelfName(r.shelfId), executorName(r.executorId)]),
    );
  };

  const printTemplate = templates.find((t) => t.type === 'receipt') ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <TrendingUp className="h-6 w-6 text-green-600" />
          Поступление
        </h1>
        <p className="mt-1 text-sm text-slate-500">Документы поступления товаров на склад</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {editingId ? 'Редактирование поступления' : 'Новое поступление'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Дата</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Номер накладной</span>
            <input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
              placeholder="Н-001"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Артикул</span>
            <input value={form.article} onChange={(e) => setForm({ ...form, article: e.target.value })}
              placeholder="АРТ-001"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Наименование ТМЦ</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Наименование товара"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Количество</span>
            <input type="number" min="0" step="0.001" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Ед. измерения</span>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Стеллаж</span>
            <select value={form.shelfId} onChange={(e) => setForm({ ...form, shelfId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20">
              <option value="">Выберите стеллаж</option>
              {shelves.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.zone}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Исполнитель</span>
            <select value={form.executorId} onChange={(e) => setForm({ ...form, executorId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20">
              <option value="">Выберите исполнителя</option>
              {executors.map((ex) => <option key={ex.id} value={ex.id}>{ex.fullName}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            {editingId ? 'Сохранить' : 'Добавить поступление'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty()); }}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по поступлениям"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <button type="button" onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800">
          <Download className="h-4 w-4" />
          Выгрузить в Excel (CSV)
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Номер</th>
              <th className="px-4 py-3">Артикул</th>
              <th className="px-4 py-3">Наименование</th>
              <th className="px-4 py-3 text-right">Кол-во</th>
              <th className="px-4 py-3">Ед.</th>
              <th className="px-4 py-3">Стеллаж</th>
              <th className="px-4 py-3">Исполнитель</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">Поступлений нет</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{r.date}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{r.invoiceNumber}</td>
                <td className="px-4 py-3 text-slate-700">{r.article}</td>
                <td className="px-4 py-3 text-slate-700">{r.name}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{r.quantity}</td>
                <td className="px-4 py-3 text-slate-600">{r.unit}</td>
                <td className="px-4 py-3 text-slate-700">{shelfName(r.shelfId)}</td>
                <td className="px-4 py-3 text-slate-700">{executorName(r.executorId)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => setPrintRecord(r)} title="Печать"
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
                      <Printer className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleEdit(r)} title="Редактировать"
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(r.id)} title="Удалить"
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {printRecord && (
        <PrintModal
          record={printRecord}
          recordType="receipt"
          template={printTemplate}
          shelves={shelves}
          executors={executors}
          onClose={() => setPrintRecord(null)}
        />
      )}
    </div>
  );
}
