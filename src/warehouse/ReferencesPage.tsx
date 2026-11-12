import { useRef, useState } from 'react';
import { BookOpen, Pencil, Plus, Trash2, Upload, FileText, Image, Save, RotateCcw } from 'lucide-react';
import { uid } from './store';
import type { WarehouseData } from './useWarehouseData';
import type { Shelf, Executor, PrintTemplate, TemplateField } from './types';
import { TEMPLATE_VARIABLES } from './types';
import { STANDARD_RECEIPT_HTML, STANDARD_WRITEOFF_HTML, VARIABLE_LABELS } from './templateUtils';

export default function ReferencesPage({ data }: { data: WarehouseData }) {
  const { shelves, executors, templates, updateShelves, updateExecutors, updateTemplates } = data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Справочники и Шаблон бланка
        </h1>
      </div>

      <ShelvesBlock shelves={shelves} onSave={updateShelves} />
      <ExecutorsBlock executors={executors} onSave={updateExecutors} />
      <TemplateBlock templates={templates} onSave={updateTemplates} />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ShelvesBlock({ shelves, onSave }: { shelves: Shelf[]; onSave: (s: Shelf[]) => void }) {
  const [editing, setEditing] = useState<Shelf | null>(null);
  const [form, setForm] = useState<Omit<Shelf, 'id'>>({ code: '', zone: '', notes: '' });

  const startAdd = () => {
    setEditing(null);
    setForm({ code: '', zone: '', notes: '' });
  };

  const startEdit = (s: Shelf) => {
    setEditing(s);
    setForm({ code: s.code, zone: s.zone, notes: s.notes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return;
    if (editing) {
      onSave(shelves.map((s) => (s.id === editing.id ? { ...form, id: editing.id } : s)));
    } else {
      onSave([...shelves, { ...form, id: uid() }]);
    }
    setEditing(null);
    setForm({ code: '', zone: '', notes: '' });
  };

  return (
    <SectionCard title="Стеллажи">
      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Номер / Код</span>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="С-01"
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Зона / Ряд</span>
          <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}
            placeholder="Зона А, Ряд 1"
            className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Примечание</span>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Необязательно"
            className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? 'Сохранить' : 'Добавить'}
        </button>
        {editing && (
          <button type="button" onClick={startAdd}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Отмена
          </button>
        )}
      </form>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="text-left text-xs font-semibold uppercase text-slate-500">
          <tr><th className="pb-2">Код</th><th className="pb-2">Зона / Ряд</th><th className="pb-2">Примечание</th><th className="pb-2 text-right">Действия</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {shelves.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">Стеллажей нет</td></tr>}
          {shelves.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="py-2.5 font-medium text-slate-900">{s.code}</td>
              <td className="py-2.5 text-slate-700">{s.zone}</td>
              <td className="py-2.5 text-slate-600">{s.notes || '—'}</td>
              <td className="py-2.5">
                <div className="flex justify-end gap-1">
                  <button type="button" onClick={() => startEdit(s)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onSave(shelves.filter((x) => x.id !== s.id))}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

function ExecutorsBlock({ executors, onSave }: { executors: Executor[]; onSave: (e: Executor[]) => void }) {
  const [editing, setEditing] = useState<Executor | null>(null);
  const [form, setForm] = useState<Omit<Executor, 'id'>>({ fullName: '', personnelNumber: '', position: '', department: '', phone: '' });

  const startAdd = () => {
    setEditing(null);
    setForm({ fullName: '', personnelNumber: '', position: '', department: '', phone: '' });
  };

  const startEdit = (ex: Executor) => {
    setEditing(ex);
    setForm({ fullName: ex.fullName, personnelNumber: ex.personnelNumber, position: ex.position, department: ex.department, phone: ex.phone });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName) return;
    if (editing) {
      onSave(executors.map((ex) => (ex.id === editing.id ? { ...form, id: editing.id } : ex)));
    } else {
      onSave([...executors, { ...form, id: uid() }]);
    }
    setEditing(null);
    setForm({ fullName: '', personnelNumber: '', position: '', department: '', phone: '' });
  };

  return (
    <SectionCard title="Карточки исполнителей">
      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">ФИО</span>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Табельный номер</span>
          <input value={form.personnelNumber} onChange={(e) => setForm({ ...form, personnelNumber: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Должность</span>
          <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Подразделение</span>
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Телефон</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            {editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? 'Сохранить' : 'Добавить'}
          </button>
          {editing && (
            <button type="button" onClick={startAdd}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Отмена
            </button>
          )}
        </div>
      </form>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="text-left text-xs font-semibold uppercase text-slate-500">
          <tr><th className="pb-2">ФИО</th><th className="pb-2">Таб. №</th><th className="pb-2">Должность</th><th className="pb-2">Подразделение</th><th className="pb-2">Телефон</th><th className="pb-2 text-right">Действия</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {executors.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-400">Исполнителей нет</td></tr>}
          {executors.map((ex) => (
            <tr key={ex.id} className="hover:bg-slate-50">
              <td className="py-2.5 font-medium text-slate-900">{ex.fullName}</td>
              <td className="py-2.5 text-slate-700">{ex.personnelNumber}</td>
              <td className="py-2.5 text-slate-700">{ex.position}</td>
              <td className="py-2.5 text-slate-700">{ex.department}</td>
              <td className="py-2.5 text-slate-700">{ex.phone}</td>
              <td className="py-2.5">
                <div className="flex justify-end gap-1">
                  <button type="button" onClick={() => startEdit(ex)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onSave(executors.filter((x) => x.id !== ex.id))}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

function TemplateBlock({
  templates,
  onSave,
}: {
  templates: PrintTemplate[];
  onSave: (t: PrintTemplate[]) => void;
}) {
  const receiptTpl = templates.find((t) => t.type === 'receipt') ?? null;
  const writeoffTpl = templates.find((t) => t.type === 'writeoff') ?? null;

  return (
    <SectionCard title="Шаблон бланка для печати">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TemplateEditor type="receipt" label="Приходная накладная" template={receiptTpl} allTemplates={templates} onSave={onSave} />
        <TemplateEditor type="writeoff" label="Акт списания" template={writeoffTpl} allTemplates={templates} onSave={onSave} />
      </div>
    </SectionCard>
  );
}

function TemplateEditor({
  type,
  label,
  template,
  allTemplates,
  onSave,
}: {
  type: 'receipt' | 'writeoff';
  label: string;
  template: PrintTemplate | null;
  allTemplates: PrintTemplate[];
  onSave: (t: PrintTemplate[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'none' | 'html' | 'image'>(
    template?.format ?? 'none',
  );
  const [imageData, setImageData] = useState<string>(template?.format === 'image' ? template.content : '');
  const [fields, setFields] = useState<TemplateField[]>(template?.fields ?? []);
  const [selectedVar, setSelectedVar] = useState<string>(TEMPLATE_VARIABLES[0]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const standardHtml = type === 'receipt' ? STANDARD_RECEIPT_HTML : STANDARD_WRITEOFF_HTML;

  const saveTemplate = (format: 'html' | 'image', content: string, tplFields: TemplateField[]) => {
    const next = allTemplates.filter((t) => t.type !== type);
    next.push({ id: template?.id ?? uid(), type, format, content, fields: tplFields });
    onSave(next);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (file.type.startsWith('image/')) {
        setImageData(result);
        setMode('image');
        setFields([]);
      } else {
        if (editableRef.current) {
          editableRef.current.innerHTML = result;
        }
        setMode('html');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStandard = () => {
    if (editableRef.current) {
      editableRef.current.innerHTML = standardHtml;
    }
    setMode('html');
  };

  const insertTag = (tag: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editableRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(tag));
      range.collapse(false);
    } else if (editableRef.current) {
      editableRef.current.appendChild(document.createTextNode(tag));
    }
  };

  const handleSaveHtml = () => {
    if (editableRef.current) {
      saveTemplate('html', editableRef.current.innerHTML, []);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newField: TemplateField = { id: uid(), variable: selectedVar, x, y };
    setFields([...fields, newField]);
  };

  const handleFieldDrag = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    setDraggingId(fieldId);
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = field.x;
    const origY = field.y;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setFields((prev) =>
        prev.map((f) =>
          f.id === fieldId ? { ...f, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) } : f,
        ),
      );
    };
    const onUp = () => {
      setDraggingId(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleSaveImage = () => {
    saveTemplate('image', imageData, fields);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{label}</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          <Upload className="h-4 w-4" /> Загрузить бланк
        </button>
        <input ref={fileRef} type="file" accept=".html,image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
        <button type="button" onClick={handleStandard}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          <FileText className="h-4 w-4" /> Стандартный бланк
        </button>
      </div>

      {mode === 'html' && (
        <>
          <div className="mb-3 flex flex-wrap gap-1">
            {TEMPLATE_VARIABLES.map((tag) => (
              <button key={tag} type="button" onClick={() => insertTag(tag)}
                className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                {tag}
              </button>
            ))}
          </div>
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[300px] overflow-auto rounded-lg border border-slate-300 bg-white p-4 text-sm focus:outline focus:ring-2 focus:ring-blue-500/20"
          />
          <button type="button" onClick={handleSaveHtml}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" /> Сохранить шаблон
          </button>
        </>
      )}

      {mode === 'image' && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <select value={selectedVar} onChange={(e) => setSelectedVar(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline focus:ring-2 focus:ring-blue-500/20">
              {TEMPLATE_VARIABLES.map((tag) => (
                <option key={tag} value={tag}>{tag} — {VARIABLE_LABELS[tag]}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">Кликните по бланку, чтобы поставить поле. Перетаскивайте для перемещения.</span>
          </div>
          <div
            ref={imgContainerRef}
            onClick={handleImageClick}
            className="relative mx-auto cursor-crosshair overflow-hidden border border-slate-300 bg-white"
            style={{ width: '794px', maxWidth: '100%' }}
          >
            <img src={imageData} alt="Бланк" className="block w-full select-none" draggable={false} />
            {fields.map((f) => (
              <div
                key={f.id}
                onMouseDown={(e) => handleFieldDrag(e, f.id)}
                onClick={(e) => e.stopPropagation()}
                className={`absolute flex items-center gap-1 rounded px-1 py-0.5 text-sm ${draggingId === f.id ? 'cursor-grabbing bg-blue-100 ring-1 ring-blue-400' : 'cursor-grab bg-white/80 ring-1 ring-slate-300'}`}
                style={{ left: `${f.x}px`, top: `${f.y}px` }}
              >
                <span className="text-blue-700">{f.variable}</span>
                <button type="button" onClick={() => handleDeleteField(f.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleSaveImage}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" /> Сохранить шаблон
          </button>
        </>
      )}

      {mode === 'none' && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 py-10 text-center">
          <Image className="h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500">Загрузите бланк (HTML или изображение) или используйте стандартный</p>
        </div>
      )}

      {template && (
        <p className="mt-3 text-xs text-green-600">Шаблон сохранён: {template.format === 'image' ? 'Изображение' : 'HTML'}</p>
      )}
    </div>
  );
}
