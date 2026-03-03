// ─── Field & Form Types ──────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'select'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'phone'
  | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  width: 'full' | 'half';
}

export interface FormConfig {
  fields: FormField[];
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
}

// ─── Field metadata ──────────────────────────────────────────────────────────

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  icon: string; // lucide icon name — resolved in component
  defaultLabel: string;
  defaultPlaceholder: string;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  { type: 'text', label: 'Texto', icon: 'Type', defaultLabel: 'Campo de texto', defaultPlaceholder: 'Escribe aqui...' },
  { type: 'email', label: 'Email', icon: 'Mail', defaultLabel: 'Correo electronico', defaultPlaceholder: 'tu@email.com' },
  { type: 'textarea', label: 'Texto largo', icon: 'AlignLeft', defaultLabel: 'Descripcion', defaultPlaceholder: 'Escribe una descripcion...' },
  { type: 'select', label: 'Seleccion', icon: 'ChevronDown', defaultLabel: 'Seleccionar opcion', defaultPlaceholder: 'Selecciona...' },
  { type: 'number', label: 'Numero', icon: 'Hash', defaultLabel: 'Numero', defaultPlaceholder: '0' },
  { type: 'checkbox', label: 'Casilla', icon: 'CheckSquare', defaultLabel: 'Acepto los terminos', defaultPlaceholder: '' },
  { type: 'date', label: 'Fecha', icon: 'Calendar', defaultLabel: 'Fecha', defaultPlaceholder: 'dd/mm/aaaa' },
  { type: 'phone', label: 'Telefono', icon: 'Phone', defaultLabel: 'Telefono', defaultPlaceholder: '+34 600 000 000' },
  { type: 'file', label: 'Archivo', icon: 'Paperclip', defaultLabel: 'Adjuntar archivo', defaultPlaceholder: '' },
];

// ─── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'eproject:helpdesk-form-config';

function storageKey(orgId: string | number): string {
  return `${STORAGE_KEY_PREFIX}:${orgId}`;
}

export function getDefaultConfig(): FormConfig {
  return {
    title: 'Enviar un ticket',
    description: 'Completa el formulario y nos pondremos en contacto contigo lo antes posible.',
    submitLabel: 'Enviar ticket',
    successMessage: 'Tu ticket ha sido enviado correctamente. Te contactaremos pronto.',
    fields: [
      { id: 'default-name', type: 'text', label: 'Nombre completo', placeholder: 'Tu nombre', required: true, width: 'half' },
      { id: 'default-email', type: 'email', label: 'Correo electronico', placeholder: 'tu@email.com', required: true, width: 'half' },
      { id: 'default-subject', type: 'text', label: 'Asunto', placeholder: 'Resumen breve de tu solicitud', required: true, width: 'full' },
      { id: 'default-description', type: 'textarea', label: 'Descripcion', placeholder: 'Describe tu problema con el mayor detalle posible...', required: false, width: 'full' },
    ],
  };
}

export function loadFormConfig(orgId: string | number): FormConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(orgId));
    return raw ? (JSON.parse(raw) as FormConfig) : null;
  } catch {
    return null;
  }
}

export function saveFormConfig(orgId: string | number, config: FormConfig): void {
  localStorage.setItem(storageKey(orgId), JSON.stringify(config));
}

export function deleteFormConfig(orgId: string | number): void {
  localStorage.removeItem(storageKey(orgId));
}

export function hasFormConfig(orgId: string | number): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(storageKey(orgId)) !== null;
}

// ─── ID generator ────────────────────────────────────────────────────────────

let counter = 0;
export function generateFieldId(): string {
  counter += 1;
  return `field-${Date.now()}-${counter}`;
}
