import { useCallback, useEffect, useState } from 'react';
import { store, seedIfNeeded } from './store';
import type { Shelf, Executor, Receipt, Writeoff, PrintTemplate } from './types';

export function useWarehouseData() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [writeoffs, setWriteoffs] = useState<Writeoff[]>([]);
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);

  const reload = useCallback(() => {
    setShelves(store.shelves.list());
    setExecutors(store.executors.list());
    setReceipts(store.receipts.list());
    setWriteoffs(store.writeoffs.list());
    setTemplates(store.templates.list());
  }, []);

  useEffect(() => {
    seedIfNeeded();
    reload();
  }, [reload]);

  const updateShelves = (next: Shelf[]) => {
    store.shelves.save(next);
    setShelves(next);
  };
  const updateExecutors = (next: Executor[]) => {
    store.executors.save(next);
    setExecutors(next);
  };
  const updateReceipts = (next: Receipt[]) => {
    store.receipts.save(next);
    setReceipts(next);
  };
  const updateWriteoffs = (next: Writeoff[]) => {
    store.writeoffs.save(next);
    setWriteoffs(next);
  };
  const updateTemplates = (next: PrintTemplate[]) => {
    store.templates.save(next);
    setTemplates(next);
  };

  return {
    shelves,
    executors,
    receipts,
    writeoffs,
    templates,
    reload,
    updateShelves,
    updateExecutors,
    updateReceipts,
    updateWriteoffs,
    updateTemplates,
  };
}

export type WarehouseData = ReturnType<typeof useWarehouseData>;
