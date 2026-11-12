import { useMemo, useState } from 'react';
import { Boxes, Download, Search } from 'lucide-react';
import { exportToCsv } from './csv';
import type { WarehouseData } from './useWarehouseData';
import type { BalanceRow } from './types';

export default function BalancesPage({ data }: { data: WarehouseData }) {
  const { receipts, writeoffs, shelves } = data;
  const [search, setSearch] = useState('');
  const [shelfFilter, setShelfFilter] = useState('all');

  const balances = useMemo<BalanceRow[]>(() => {
    const map = new Map<string, BalanceRow>();

    for (const r of receipts) {
      const key = `${r.article}__${r.shelfId}`;
      const shelf = shelves.find((s) => s.id === r.shelfId);
      const existing = map.get(key);
      if (existing) {
        existing.quantity += r.quantity;
      } else {
        map.set(key, {
          article: r.article,
          name: r.name,
          shelfId: r.shelfId,
          shelfCode: shelf?.code ?? '',
          quantity: r.quantity,
          unit: r.unit,
        });
      }
    }

    for (const w of writeoffs) {
      const key = `${w.article}__${w.shelfId}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity -= w.quantity;
      } else {
        const shelf = shelves.find((s) => s.id === w.shelfId);
        map.set(key, {
          article: w.article,
          name: w.name,
          shelfId: w.shelfId,
          shelfCode: shelf?.code ?? '',
          quantity: -w.quantity,
          unit: w.unit,
        });
      }
    }

    return Array.from(map.values()).filter((b) => b.quantity !== 0);
  }, [receipts, writeoffs, shelves]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return balances.filter((b) => {
      if (shelfFilter !== 'all' && b.shelfId !== shelfFilter) return false;
      if (!q) return true;
      return b.name.toLowerCase().includes(q) || b.article.toLowerCase().includes(q);
    });
  }, [balances, search, shelfFilter]);

  const handleExport = () => {
    exportToCsv(
      'остатки_склада.csv',
      ['Артикул', 'Наименование ТМЦ', 'Стеллаж', 'Текущий остаток', 'Ед. измерения'],
      filtered.map((b) => [b.article, b.name, b.shelfCode, b.quantity, b.unit]),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Boxes className="h-6 w-6 text-blue-600" />
          Остатки на складе
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Текущие остатки по каждому товару на каждом стеллаже
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию / артикулу"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={shelfFilter}
            onChange={(e) => setShelfFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Все стеллажи</option>
            {shelves.map((s) => (
              <option key={s.id} value={s.id}>{s.code}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Выгрузить в Excel (CSV)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Артикул</th>
              <th className="px-5 py-3">Наименование ТМЦ</th>
              <th className="px-5 py-3">Стеллаж</th>
              <th className="px-5 py-3 text-right">Текущий остаток</th>
              <th className="px-5 py-3">Ед. измерения</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                  Остатков не найдено
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={`${b.article}-${b.shelfId}`} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-900">{b.article}</td>
                <td className="px-5 py-4 text-slate-700">{b.name}</td>
                <td className="px-5 py-4 text-slate-700">{b.shelfCode}</td>
                <td className="px-5 py-4 text-right font-semibold text-slate-900">
                  {b.quantity.toLocaleString('ru-RU')}
                </td>
                <td className="px-5 py-4 text-slate-600">{b.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
