import { useState } from 'react';
import { Boxes, BookOpen, TrendingDown, TrendingUp, Warehouse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWarehouseData } from '@/warehouse/useWarehouseData';
import BalancesPage from '@/warehouse/BalancesPage';
import ReceiptsPage from '@/warehouse/ReceiptsPage';
import WriteoffsPage from '@/warehouse/WriteoffsPage';
import ReferencesPage from '@/warehouse/ReferencesPage';

type Tab = 'balances' | 'receipts' | 'writeoffs' | 'references';

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'balances', label: 'Остатки на складе', icon: Boxes },
  { id: 'receipts', label: 'Поступление', icon: TrendingUp },
  { id: 'writeoffs', label: 'Списание', icon: TrendingDown },
  { id: 'references', label: 'Справочники и Шаблон бланка', icon: BookOpen },
];

function App() {
  const [tab, setTab] = useState<Tab>('balances');
  const data = useWarehouseData();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="no-print sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Warehouse className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold leading-tight">Складской учёт</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-left leading-tight">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {tab === 'balances' && <BalancesPage data={data} />}
          {tab === 'receipts' && <ReceiptsPage data={data} />}
          {tab === 'writeoffs' && <WriteoffsPage data={data} />}
          {tab === 'references' && <ReferencesPage data={data} />}
        </div>
      </main>
    </div>
  );
}

export default App;
