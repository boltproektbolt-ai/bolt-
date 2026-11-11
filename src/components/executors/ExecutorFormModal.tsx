import { useState, type FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import FormField, { inputClassName } from '@/components/ui/FormField';
import { createExecutor, updateExecutor } from '@/lib/api/executors';
import type { Executor } from '@/types/directory';

interface ExecutorFormModalProps {
  executor: Executor | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExecutorFormModal({ executor, onClose, onSaved }: ExecutorFormModalProps) {
  const [position, setPosition] = useState(executor?.position ?? '');
  const [employee, setEmployee] = useState(executor?.employee ?? '');
  const [fullName, setFullName] = useState(executor?.full_name ?? '');
  const [positionError, setPositionError] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedPosition = position.trim();
    const trimmedEmployee = employee.trim();
    const trimmedFullName = fullName.trim();
    let hasError = false;
    if (!trimmedPosition) {
      setPositionError('Укажите должность');
      hasError = true;
    } else {
      setPositionError('');
    }
    if (!trimmedEmployee) {
      setEmployeeError('Укажите сотрудника');
      hasError = true;
    } else {
      setEmployeeError('');
    }
    if (!trimmedFullName) {
      setFullNameError('Укажите ФИО');
      hasError = true;
    } else {
      setFullNameError('');
    }
    if (hasError) return;

    setSubmitError('');
    setSaving(true);
    try {
      const input = {
        position: trimmedPosition,
        employee: trimmedEmployee,
        full_name: trimmedFullName,
      };
      if (executor) {
        await updateExecutor(executor.id, input);
      } else {
        await createExecutor(input);
      }
      onSaved();
      onClose();
    } catch {
      setSubmitError('Не удалось сохранить исполнителя. Попробуйте еще раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={executor ? 'Редактирование исполнителя' : 'Новый исполнитель'}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            form="executor-form"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </>
      }
    >
      <form id="executor-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="Должность" htmlFor="executor-position" error={positionError}>
          <input
            id="executor-position"
            className={inputClassName}
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="Например, Инженер"
            autoFocus
          />
        </FormField>
        <FormField label="Сотрудник" htmlFor="executor-employee" error={employeeError}>
          <input
            id="executor-employee"
            className={inputClassName}
            value={employee}
            onChange={(event) => setEmployee(event.target.value)}
            placeholder="Например, Иванов"
          />
        </FormField>
        <FormField label="ФИО" htmlFor="executor-full-name" error={fullNameError}>
          <input
            id="executor-full-name"
            className={inputClassName}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Например, Иванов Иван Иванович"
          />
        </FormField>
        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
        )}
      </form>
    </Modal>
  );
}
