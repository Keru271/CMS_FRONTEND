'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Eye,
  Settings,
  Share2,
  Trash2,
  Copy,
  Plus,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  Layout,
  Type,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  List,
  CheckSquare,
  Radio,
  Calendar,
  Clock,
  Star,
  Upload,
  Heading,
  Minus,
  FileText,
  AlertCircle,
  Inbox,
  Palette,
  ExternalLink,
  Code2,
  Loader2,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  CMSForm,
  FormField,
  FormFieldType,
  FormSettings as IFormSettings,
  FormCategory,
  FormStatus,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { PublicFormRenderer } from './PublicFormRenderer';
import { EmbedShareModal } from './EmbedShareModal';
import { FormSubmissionsStudio } from './FormSubmissionsStudio';

interface Props {
  formId?: string;
  onBack?: () => void;
}

const FIELD_PALETTE: {
  type: FormFieldType;
  label: string;
  icon: any;
  category: 'input' | 'choice' | 'advanced' | 'layout';
  description: string;
  defaultConfig: Partial<FormField>;
}[] = [
  // Standard Inputs
  {
    type: 'text',
    label: 'Short Text',
    icon: Type,
    category: 'input',
    description: 'Single-line text for names, titles, or brief input',
    defaultConfig: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      width: 'full',
    },
  },
  {
    type: 'email',
    label: 'Email Address',
    icon: Mail,
    category: 'input',
    description: 'Email input with automatic format validation',
    defaultConfig: {
      label: 'Email Address',
      placeholder: 'user@example.com',
      required: true,
      width: 'half',
    },
  },
  {
    type: 'phone',
    label: 'Phone Number',
    icon: Phone,
    category: 'input',
    description: 'Phone number with international format support',
    defaultConfig: {
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
      width: 'half',
    },
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    category: 'input',
    description: 'Numeric input for quantities, budgets, or scores',
    defaultConfig: {
      label: 'Quantity / Amount',
      placeholder: '0',
      required: false,
      width: 'half',
    },
  },
  {
    type: 'textarea',
    label: 'Long Paragraph',
    icon: AlignLeft,
    category: 'input',
    description: 'Multi-line text area for messages, notes, and comments',
    defaultConfig: {
      label: 'Message / Description',
      placeholder: 'Type detailed information here...',
      required: false,
      width: 'full',
    },
  },

  // Choices
  {
    type: 'select',
    label: 'Dropdown Select',
    icon: List,
    category: 'choice',
    description: 'Single-choice dropdown menu from custom list',
    defaultConfig: {
      label: 'Select Option',
      placeholder: 'Choose an option...',
      required: false,
      width: 'half',
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
        { label: 'Option 3', value: 'option_3' },
      ],
    },
  },
  {
    type: 'radio',
    label: 'Single Choice (Radio)',
    icon: Radio,
    category: 'choice',
    description: 'Radio button group where only one option can be selected',
    defaultConfig: {
      label: 'Choose One',
      required: false,
      width: 'full',
      options: [
        { label: 'First Choice', value: 'choice_1' },
        { label: 'Second Choice', value: 'choice_2' },
      ],
    },
  },
  {
    type: 'checkbox',
    label: 'Multiple Checkboxes',
    icon: CheckSquare,
    category: 'choice',
    description: 'Multi-select checkboxes or single agreement toggle',
    defaultConfig: {
      label: 'Select Applicable Items',
      required: false,
      width: 'full',
      options: [
        { label: 'Feature A', value: 'feature_a' },
        { label: 'Feature B', value: 'feature_b' },
        { label: 'Feature C', value: 'feature_c' },
      ],
    },
  },

  // Advanced
  {
    type: 'rating',
    label: 'Star Rating',
    icon: Star,
    category: 'advanced',
    description: 'Interactive 1-to-5 star rating review input',
    defaultConfig: {
      label: 'Rate Your Experience',
      description: 'Click a star to rate from 1 to 5',
      required: false,
      width: 'full',
    },
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: Calendar,
    category: 'advanced',
    description: 'Calendar date picker for bookings and deadlines',
    defaultConfig: {
      label: 'Select Date',
      required: false,
      width: 'half',
    },
  },
  {
    type: 'time',
    label: 'Time Picker',
    icon: Clock,
    category: 'advanced',
    description: 'Time selector for appointments and event schedules',
    defaultConfig: {
      label: 'Select Time',
      required: false,
      width: 'half',
    },
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    category: 'advanced',
    description: 'Attachment upload for resumes, invoices, and screenshots',
    defaultConfig: {
      label: 'Attach Document / File',
      description: 'Upload relevant PDF, image, or doc files',
      required: false,
      width: 'full',
    },
  },

  // Layout & Content
  {
    type: 'heading',
    label: 'Section Header',
    icon: Heading,
    category: 'layout',
    description: 'Visual header title dividing form sections',
    defaultConfig: {
      label: 'Section Header Title',
      description: 'Optional subheading guidance for this section',
      width: 'full',
    },
  },
  {
    type: 'divider',
    label: 'Divider Line',
    icon: Minus,
    category: 'layout',
    description: 'Clean horizontal dividing line',
    defaultConfig: {
      label: 'Divider',
      width: 'full',
    },
  },
  {
    type: 'paragraph',
    label: 'Instruction Paragraph',
    icon: FileText,
    category: 'layout',
    description: 'Helpful explanatory text or disclaimer instructions',
    defaultConfig: {
      label: 'Please fill in all details carefully. All information is kept confidential.',
      width: 'full',
    },
  },
];

export const FormBuilderStudio: React.FC<Props> = ({ formId, onBack }) => {
  const [form, setForm] = useState<CMSForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'submissions'>('builder');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'field' | 'form'>('field');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Form State
  const [title, setTitle] = useState('Untitled Form');
  const [slug, setSlug] = useState('untitled-form');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FormCategory>('GENERAL');
  const [status, setStatus] = useState<FormStatus>('PUBLISHED');
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<IFormSettings>({
    submitButtonText: 'Submit',
    submittingButtonText: 'Submitting...',
    successType: 'message',
    successMessage: 'Thank you! Your submission has been received.',
    emailNotifications: true,
    autoResponder: false,
    theme: {
      accentColor: '#3b82f6',
      borderRadius: 'md',
      cardStyle: 'bordered',
    },
  });

  // Load Form Data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (formId && formId !== 'new') {
          const loaded = await cmsService.getForm(formId);
          if (loaded) {
            setForm(loaded);
            setTitle(loaded.title);
            setSlug(loaded.slug);
            setDescription(loaded.description || '');
            setCategory(loaded.category || 'GENERAL');
            setStatus(loaded.status || 'PUBLISHED');
            const parsedFields =
              loaded.fields || (loaded.fieldsJson ? JSON.parse(loaded.fieldsJson) : []);
            setFields(parsedFields);
            if (parsedFields.length > 0) setSelectedFieldId(parsedFields[0].id);
            const parsedSettings =
              loaded.settings || (loaded.settingsJson ? JSON.parse(loaded.settingsJson) : {});
            setSettings({
              ...settings,
              ...parsedSettings,
              theme: { ...settings.theme, ...(parsedSettings.theme || {}) },
            });
          }
        } else {
          // Initialize New Blank Form
          const initialFields: FormField[] = [
            {
              id: 'field_name_' + Date.now(),
              type: 'text',
              label: 'Your Full Name',
              name: 'fullName',
              placeholder: 'e.g. John Doe',
              required: true,
              width: 'half',
            },
            {
              id: 'field_email_' + (Date.now() + 1),
              type: 'email',
              label: 'Email Address',
              name: 'email',
              placeholder: 'john@example.com',
              required: true,
              width: 'half',
            },
            {
              id: 'field_msg_' + (Date.now() + 2),
              type: 'textarea',
              label: 'Your Message',
              name: 'message',
              placeholder: 'Write your message here...',
              required: true,
              width: 'full',
            },
          ];
          setFields(initialFields);
          setSelectedFieldId(initialFields[0].id);
        }
      } catch (err) {
        console.error('Failed to load form', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId]);

  const selectedField = useMemo(() => {
    return fields.find((f) => f.id === selectedFieldId) || null;
  }, [fields, selectedFieldId]);

  // Add field to canvas
  const handleAddField = (type: FormFieldType) => {
    const pal = FIELD_PALETTE.find((p) => p.type === type);
    const newId = `field_${type}_${Date.now()}`;
    const newName = `${type}_${Math.random().toString(36).substring(2, 7)}`;

    const newField: FormField = {
      id: newId,
      type,
      name: newName,
      label: pal?.defaultConfig.label || 'New Field',
      placeholder: pal?.defaultConfig.placeholder || '',
      description: pal?.defaultConfig.description || '',
      required: pal?.defaultConfig.required ?? false,
      width: pal?.defaultConfig.width || 'full',
      options: pal?.defaultConfig.options
        ? JSON.parse(JSON.stringify(pal.defaultConfig.options))
        : undefined,
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
    setInspectorTab('field');
  };

  // Update selected field properties
  const updateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    setFields((prev) => prev.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f)));
  };

  // Move field up/down
  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    setFields((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  // Duplicate field
  const duplicateField = (id: string) => {
    const original = fields.find((f) => f.id === id);
    if (!original) return;
    const newId = `field_${original.type}_${Date.now()}`;
    const clone: FormField = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      name: `${original.name}_copy`,
      label: `${original.label} (Copy)`,
    };
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      const copy = [...prev];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
    setSelectedFieldId(newId);
  };

  // Delete field
  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      const remaining = fields.filter((f) => f.id !== id);
      setSelectedFieldId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Save Form Handler
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        description,
        category,
        status,
        fields,
        settings,
      };

      let saved: CMSForm;
      if (form?.id) {
        const res = await cmsService.updateForm(form.id, payload);
        saved = res.form;
      } else {
        const res = await cmsService.createForm(payload);
        saved = res.form;
        setForm(saved);
      }

      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 2500);
    } catch (err: any) {
      console.error('Failed to save form', err);
      alert(err.response?.data?.message || err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  // Options editor helpers for select/radio/checkbox
  const addOption = () => {
    if (!selectedField) return;
    const opts = selectedField.options ? [...selectedField.options] : [];
    const count = opts.length + 1;
    opts.push({ label: `Option ${count}`, value: `option_${count}` });
    updateSelectedField({ options: opts });
  };

  const updateOption = (index: number, key: 'label' | 'value', value: string) => {
    if (!selectedField || !selectedField.options) return;
    const opts = [...selectedField.options];
    opts[index] = { ...opts[index], [key]: value };
    updateSelectedField({ options: opts });
  };

  const removeOption = (index: number) => {
    if (!selectedField || !selectedField.options) return;
    const opts = selectedField.options.filter((_, i) => i !== index);
    updateSelectedField({ options: opts });
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Active form object for live preview
  const liveFormObj: CMSForm = {
    id: form?.id || 'preview-id',
    title,
    slug,
    description,
    category,
    status,
    fieldsJson: JSON.stringify(fields),
    fields,
    settingsJson: JSON.stringify(settings),
    settings,
    submissionsCount: form?.submissionsCount || 0,
    viewCount: form?.viewCount || 0,
    createdAt: form?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] space-y-4">
      {/* Studio Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Title & Category Info */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              title="Back to Forms"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Layout className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
                placeholder="Form Title..."
              />
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {category}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono px-1">/form/{slug}</p>
          </div>
        </div>

        {/* View Switcher Tabs (Builder / Live Test / Submissions) */}
        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'builder'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Test</span>
          </button>
          {form?.id && (
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'submissions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Responses ({form.submissionsCount || 0})</span>
            </button>
          )}
        </div>

        {/* Device Mode & Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab !== 'submissions' && (
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  deviceView === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  deviceView === 'tablet'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  deviceView === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {form?.id && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Share & Embed Form"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-blue-500/25 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccessMessage ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Form</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      {activeTab === 'submissions' ? (
        <FormSubmissionsStudio initialFormId={form?.id} />
      ) : activeTab === 'preview' ? (
        <div className="bg-slate-100 dark:bg-slate-950/60 p-6 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center items-start min-h-[600px] overflow-y-auto">
          <div
            className={`transition-all duration-300 w-full ${
              deviceView === 'mobile'
                ? 'max-w-sm'
                : deviceView === 'tablet'
                  ? 'max-w-xl'
                  : 'max-w-2xl'
            }`}
          >
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-3 rounded-t-2xl border-t border-x border-slate-200 dark:border-slate-800 text-xs text-center font-medium text-slate-500">
              Interactive Test Mode • Responses will simulate instant feedback
            </div>
            <PublicFormRenderer form={liveFormObj} previewMode={true} />
          </div>
        </div>
      ) : (
        /* Builder View: 3-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Field Elements Palette */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Add Elements
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Click any component to append it to your form.
              </p>
            </div>

            {/* Component Groups */}
            <div className="space-y-4">
              {/* Standard Inputs */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                  Standard Fields
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {FIELD_PALETTE.filter((p) => p.category === 'input').map((pal) => {
                    const Icon = pal.icon;
                    return (
                      <button
                        key={pal.type}
                        onClick={() => handleAddField(pal.type)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 text-left transition group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-100/50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">
                            {pal.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Choice Fields */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                  Choice Selectors
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {FIELD_PALETTE.filter((p) => p.category === 'choice').map((pal) => {
                    const Icon = pal.icon;
                    return (
                      <button
                        key={pal.type}
                        onClick={() => handleAddField(pal.type)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 text-left transition group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-100/50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">
                            {pal.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced & Date Fields */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                  Specialized & Media
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {FIELD_PALETTE.filter((p) => p.category === 'advanced').map((pal) => {
                    const Icon = pal.icon;
                    return (
                      <button
                        key={pal.type}
                        onClick={() => handleAddField(pal.type)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 text-left transition group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-100/50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">
                            {pal.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Helpers */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                  Layout & Headers
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {FIELD_PALETTE.filter((p) => p.category === 'layout').map((pal) => {
                    const Icon = pal.icon;
                    return (
                      <button
                        key={pal.type}
                        onClick={() => handleAddField(pal.type)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 text-left transition group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-100/50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">
                            {pal.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Form Canvas */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-100/80 dark:bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[550px] flex justify-center items-start overflow-y-auto max-h-[calc(100vh-220px)]">
              <div
                className={`transition-all duration-300 w-full ${
                  deviceView === 'mobile'
                    ? 'max-w-sm'
                    : deviceView === 'tablet'
                      ? 'max-w-xl'
                      : 'max-w-2xl'
                } space-y-4`}
              >
                {/* Canvas Header / Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {title || 'Untitled Form'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {description ||
                      'Click Form Settings on the right panel to customize description & theme.'}
                  </p>
                </div>

                {/* Fields List */}
                {fields.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
                    <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Your form is empty
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Click components from the left palette to build your custom form.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, idx) => {
                      const isSelected = selectedFieldId === field.id;
                      const pal = FIELD_PALETTE.find((p) => p.type === field.type);
                      const Icon = pal?.icon || Type;

                      return (
                        <div
                          key={field.id}
                          onClick={() => {
                            setSelectedFieldId(field.id);
                            setInspectorTab('field');
                          }}
                          className={`p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Field Header Actions */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {field.label}
                              </span>
                              {field.required && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                  Required
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({field.width || 'full'})
                              </span>
                            </div>

                            {/* Field Action Buttons */}
                            <div
                              className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                disabled={idx === 0}
                                onClick={() => moveField(idx, 'up')}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-20"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === fields.length - 1}
                                onClick={() => moveField(idx, 'down')}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-20"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => duplicateField(field.id)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteField(field.id)}
                                className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Dummy Field Preview Representation */}
                          <div className="text-xs text-slate-400 italic">
                            {field.type === 'textarea' ? (
                              <div className="h-12 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/30">
                                {field.placeholder || 'Paragraph text area...'}
                              </div>
                            ) : field.type === 'select' ? (
                              <div className="py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                <span>{field.placeholder || 'Select option...'}</span>
                                <span>▼</span>
                              </div>
                            ) : field.type === 'radio' || field.type === 'checkbox' ? (
                              <div className="flex gap-2">
                                {field.options?.slice(0, 3).map((o) => (
                                  <span
                                    key={o.value}
                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] not-italic text-slate-600 dark:text-slate-300"
                                  >
                                    ○ {o.label}
                                  </span>
                                ))}
                              </div>
                            ) : field.type === 'rating' ? (
                              <div className="flex gap-1 text-amber-400 not-italic">★★★★★</div>
                            ) : (
                              <div className="py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                                {field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dummy Submit Button on Canvas */}
                <div className="pt-2">
                  <button
                    type="button"
                    style={{ backgroundColor: settings.theme?.accentColor || '#3b82f6' }}
                    className="w-full py-2.5 px-4 text-white font-semibold rounded-xl text-sm opacity-90 shadow-sm"
                  >
                    {settings.submitButtonText || 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inspector Panel */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
            {/* Inspector Tab Switcher */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setInspectorTab('field')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  inspectorTab === 'field'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Field Settings
              </button>
              <button
                onClick={() => setInspectorTab('form')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  inspectorTab === 'form'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Form Settings
              </button>
            </div>

            {/* Field Inspector Tab */}
            {inspectorTab === 'field' && (
              <div>
                {!selectedField ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Select a field in the canvas to configure its properties.
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateSelectedField({ label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Field Key Identifier
                      </label>
                      <input
                        type="text"
                        value={selectedField.name}
                        onChange={(e) => updateSelectedField({ name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {selectedField.type !== 'heading' && selectedField.type !== 'divider' && (
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={selectedField.placeholder || ''}
                          onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Help / Description Text
                      </label>
                      <input
                        type="text"
                        value={selectedField.description || ''}
                        onChange={(e) => updateSelectedField({ description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Width / Grid Span */}
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Field Width
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'full', label: 'Full (100%)' },
                          { id: 'half', label: 'Half (50%)' },
                          { id: 'third', label: 'Third (33%)' },
                        ].map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => updateSelectedField({ width: w.id as any })}
                            className={`py-1.5 px-2 rounded-lg text-center font-medium transition ${
                              selectedField.width === w.id ||
                              (!selectedField.width && w.id === 'full')
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Required Checkbox */}
                    {selectedField.type !== 'heading' && selectedField.type !== 'divider' && (
                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedField.required}
                            onChange={(e) => updateSelectedField({ required: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Required Field
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Choice Options Editor (for select, radio, checkbox) */}
                    {(selectedField.type === 'select' ||
                      selectedField.type === 'radio' ||
                      selectedField.type === 'checkbox') && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Options List
                          </span>
                          <button
                            type="button"
                            onClick={addOption}
                            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {selectedField.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => updateOption(i, 'label', e.target.value)}
                                placeholder="Label"
                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(i)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Form Settings Tab */}
            {inspectorTab === 'form' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Form Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FormCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="GENERAL">General</option>
                    <option value="CONTACT">Contact & Support</option>
                    <option value="FEEDBACK">Customer Feedback</option>
                    <option value="LEAD_GEN">Lead Generation</option>
                    <option value="ORDER_INQUIRY">Wholesale / Order Inquiry</option>
                    <option value="REGISTRATION">Event Registration</option>
                    <option value="SURVEY">Survey & Poll</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Form Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FormStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PUBLISHED">Published (Open to Submissions)</option>
                    <option value="DRAFT">Draft (Staff Only)</option>
                    <option value="ARCHIVED">Archived (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Description / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description displayed at top of form..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.submitButtonText || 'Submit'}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, submitButtonText: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Success Action
                  </label>
                  <select
                    value={settings.successType || 'message'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        successType: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="message">Display Confirmation Message</option>
                    <option value="redirect">Redirect to Custom URL</option>
                  </select>
                </div>

                {settings.successType === 'redirect' ? (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Redirect URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://yourstore.com/thank-you"
                      value={settings.redirectUrl || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, redirectUrl: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Success Message
                    </label>
                    <textarea
                      rows={2}
                      value={settings.successMessage || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, successMessage: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Theme Accent Color */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Theme Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    {['#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f59e0b', '#0f172a'].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              theme: { ...prev.theme, accentColor: color } as any,
                            }))
                          }
                          style={{ backgroundColor: color }}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            settings.theme?.accentColor === color
                              ? 'scale-125 ring-2 ring-offset-2 ring-slate-400'
                              : 'hover:scale-110'
                          }`}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Card Style */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Style
                  </label>
                  <select
                    value={settings.theme?.cardStyle || 'bordered'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, cardStyle: e.target.value as any } as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="bordered">Standard Bordered</option>
                    <option value="elevated">Elevated Shadow</option>
                    <option value="flat">Flat Light</option>
                    <option value="glass">Glassmorphism</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embed / Share Modal */}
      {form && (
        <EmbedShareModal
          form={liveFormObj}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};
