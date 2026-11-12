import { useMemo, useState } from 'react';
import { Download, Pencil, Plus, Printer, Search, Trash2, TrendingDown } from 'lucide-react';
import { exportToCsv } from './csv';
import { uid } from './store';
import type { WarehouseData } from './useWarehouseData';
import type { Writeoff, BalanceRow } from './types';
import { UNITS } from './types';
import PrintModal from './PrintModal';

const empty = (): Omit<Writeoff, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  actNumber: '',
  shelfId: '',
  article: '',
  name: '',
  quantity: 1,
  unit: 'шт',
  reason: '',
  executorId: '',
});

export default function WriteoffsPage({ data }: { data: WarehouseData }) {
  const { receipts, writeoffs, shelves, executors, templates, updateWriteoffs } = data;
  const [form, setForm] = useState<Omit<Writeoff, 'id'>>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [printRecord, setPrintRecord] = useState<Writeoff | null>(null);
  const [error, setError] = useState('');

  const balances = useMemo<BalanceRow[]>(() => {
    const map = new Map<string, BalanceRow>();
    for (const r of receipts) {
      const key = `${r.article}__${r.shelfId}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += r.quantity;
      } else {
        map.set(key, { article: r.article, name: r.name, shelfId: r.shelfId, shelfCode: '', quantity: r.quantity, unit: r.unit });
      }
    }
    for (const w of writeoffs) {
      const key = `${w.article}__${w.shelfId}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity -= w.quantity;
      } else {
        map.set(key, { article: w.article, name: w.name, shelfId: w.shelfId, shelfCode: '', quantity: -w.quantity, unit: w.unit });
      }
    }
    return Array.from(map.values()).filter((b) => b.quantity > 0);
  }, [receipts, writeoffs]);

  const availableItems = useMemo(() => {
    if (!form.shelfId) return [];
    return balances.filter((b) => b.shelfId === form.shelfId);
  }, [balances, form.shelfId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return writeoffs;
    return writeoffs.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.article.toLowerCase().includes(q) ||
        w.actNumber.toLowerCase().includes(q),
    );
  }, [writeoffs, search]);

  const shelfName = (id: string) => shelves.find((s) => s.id === id)?.code ?? '';
  const executorName = (id: string) => executors.find((e) => e.id === id)?.fullName ?? '';

  const handleShelfChange = (shelfId: string) => {
    setForm({ ...form, shelfId, article: '', name: '', unit: 'шт', quantity: 1 });
  };

  const handleItemSelect = (article: string) => {
    const item = availableItems.find((b) => b.article === article);
    if (item) {
      setForm({ ...form, article: item.article, name: item.name, unit: item.unit, quantity: 1 });
    }
  };

  const currentBalance = availableItems.find((b) => b.article === form.article)?.quantity ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.actNumber || !form.shelfId || !form.article || !form.name || !form.executorId || !form.reason) {
      setError('Заполните все обязательные поля');
      return;
    }
    if (!editingId && form.quantity > currentBalance) {
      setError(`Нельзя списать больше текущего остатка (${currentBalance} ${form.unit})`);
      return;
    }
    setError('');
    if (editingId) {
      updateWriteoffs(writeoffs.map((w) => (w.id === editingId ? { ...form, id: editingId } : w)));
    } else {
      updateWriteoffs([...writeoffs, { ...form, id: uid() }]);
    }
    setForm(empty());
    setEditingId(null);
  };

  const handleEdit = (w: Writeoff) => {
    setEditingId(w.id);
    setForm({ ...w });
  };

  const handleDelete = (id: string) => {
    updateWriteoffs(writeoffs.filter((w) => w.id !== id));
  };

  const handleExport = () => {
    exportToCsv(
      'списания.csv',
      ['Дата', 'Номер акта', 'Стеллаж', 'Артикул', 'Наименование ТМЦ', 'Количество', 'Ед.', 'Причина', 'Исполнитель'],
      filtered.map((w) => [w.date, w.actNumber, shelfName(w.shelfId), w.article, w.name, w.quantity, w.unit, w.reason, executorName(w.executorId)]),
    );
  };

  const printTemplate = templates.find((t) => t.type === 'writeoff') ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <TrendingDown className="h-6 w-6 text-red-600" />
          Списание
        </h1>
        <p className="mt-1 text-sm text-slate-500">Документы списания товаров со склада</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {editingId ? 'Редактирование списания' : 'Новое списание'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Дата</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Номер акта</span>
            <input value={form.actNumber} onChange={(e) => setForm({ ...form, actNumber: e.target.value })}
              placeholder="А-001"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Стеллаж</span>
            <select value={form.shelfId} onChange={(e) => handleShelfChange(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20">
              <option value="">Выберите стеллаж</option>
              {shelves.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.zone}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">
              ТМЦ {form.shelfId && availableItems.length > 0 ? '(выберите из остатков)' : ''}
            </span>
            <select value={form.article} onChange={(e) => handleItemSelect(e.target.value)} disabled={!form.shelfId}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50">
              <option value="">{form.shelfId ? 'Выберите ТМЦ' : 'Сначала выберите стеллаж'}</option>
              {availableItems.map((b) => (
                <option key={b.article} value={b.article}>{b.article} — {b.name} (остаток: {b.quantity} {b.unit})</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">
              Количество {form.article ? `(доступно: ${currentBalance} ${form.unit})` : ''}
            </span>
            <input type="number" min="0" step="0.001" max={currentBalance || undefined} value={form.quantity}
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
            <span className="text-xs font-medium text-slate-600">Причина списания</span>
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Например: Установка в кассу"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
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
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700">
            <Plus className="h-4 w-4" />
            {editingId ? 'Сохранить' : 'Добавить списание'}
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
            placeholder="Поиск по списаниям"
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
              <th className="px-4 py-3">Номер акта</th>
              <th className="px-4 py-3">Стеллаж</th>
              <th className="px-4 py-3">Артикул</th>
              <th className="px-4 py-3">Наименование</th>
              <th className="px-4 py-3 text-right">Кол-во</th>
              <th className="px-4 py-3">Ед.</th>
              <th className="px-4 py-3">Причина</th>
              <th className="px-4 py-3">Исполнитель</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-400">Списаний нет</td></tr>
            )}
            {filtered.map((w) => (
              <tr key={w.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{w.date}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{w.actNumber}</td>
                <td className="px-4 py-3 text-slate-700">{shelfName(w.shelfId)}</td>
                <td className="px-4 py-3 text-slate-700">{w.article}</td>
                <td className="px-4 py-3 text-slate-700">{w.name}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{w.quantity}</td>
                <td className="px-4 py-3 text-slate-600">{w.unit}</td>
                <td className="px-4 py-3 text-slate-700">{w.reason}</td>
                <td className="px-4 py-3 text-slate-700">{executorName(w.executorId)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => setPrintRecord(w)} title="Печать"
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
                      <Printer className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleEdit(w)} title="Редактировать"
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(w.id)} title="Удалить"
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
          recordType="writeoff"
          template={printTemplate}
          shelves={shelves}
          executors={executors}
          onClose={() => setPrintRecord(null)}
        />
      )}
    </div>
  );
}
