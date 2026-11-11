import { supabase } from '@/lib/supabase';
import type { Executor, ExecutorInput } from '@/types/directory';

export async function fetchExecutors(): Promise<Executor[]> {
  const { data, error } = await supabase
    .from('executors')
    .select('id, position, employee, full_name')
    .order('position, employee');
  if (error) throw new Error(error.message);
  return (data ?? []) as Executor[];
}

export async function createExecutor(input: ExecutorInput): Promise<void> {
  const { error } = await supabase.from('executors').insert(input);
  if (error) throw error;
}

export async function updateExecutor(id: string, input: ExecutorInput): Promise<void> {
  const { error } = await supabase
    .from('executors')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteExecutor(id: string): Promise<void> {
  const { error } = await supabase.from('executors').delete().eq('id', id);
  if (error) throw error;
}
