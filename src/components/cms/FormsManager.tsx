"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Inbox,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  ExternalLink,
  Sparkles,
  Layout,
  Layers,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  X,
  Grid,
  List as ListIcon,
  MessageSquare,
  Users,
  Award,
  Zap,
} from "lucide-react";
import { CMSForm, FormCategory, FormStatus } from "@/src/types";
import { cmsService } from "@/src/services/cmsService";
import { EmbedShareModal } from "./EmbedShareModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  onOpenBuilder?: (formId: string) => void;
  onOpenSubmissions?: (formId: string) => void;
}

export const FormsManager: React.FC<Props> = ({
  onOpenBuilder,
  onOpenSubmissions,
}) => {
  const router = useRouter();
  const [forms, setForms] = useState<CMSForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeShareForm, setActiveShareForm] = useState<CMSForm | null>(null);

  const loadForms = async () => {
    try {
      const data = await cmsService.getForms({
        category: selectedCategory,
        search: searchQuery,
      });
      setForms(data);
    } catch (err) {
      console.error("Failed to load forms", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadForms();
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await cmsService.duplicateForm(id);
      setForms((prev) => [res.form, ...prev]);
    } catch (err) {
      console.error("Failed to duplicate form", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form and all its submissions?")) return;
    try {
      await cmsService.deleteForm(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete form", err);
    }
  };

  const handleResetPresets = async () => {
    if (!confirm("Reset and seed default starter form templates?")) return;
    setRefreshing(true);
    try {
      const res = await cmsService.resetFormPresets();
      setForms(res.forms);
    } catch (err) {
      console.error("Failed to reset presets", err);
    } finally {
      setRefreshing(false);
    }
  };

  // KPI calculations
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionsCount || 0), 0);
  const activeFormsCount = forms.filter((f) => f.status === "PUBLISHED").length;

  const navigateToBuilder = (id: string) => {
    if (onOpenBuilder) {
      onOpenBuilder(id);
    } else {
      router.push(`/forms/${id}`);
    }
  };

  const navigateToSubmissions = (id?: string) => {
    if (onOpenSubmissions && id) {
      onOpenSubmissions(id);
    } else if (id) {
      router.push(`/forms/${id}/submissions`);
    } else {
      router.push("/forms/submissions");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Form Builder Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Create responsive forms, surveys, and manage incoming responses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateToSubmissions()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition"
          >
            <Inbox className="w-4 h-4" />
            <span>All Submissions</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Forms
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {forms.length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Active Forms
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {activeFormsCount}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Responses Collected
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {totalSubmissions}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Presets & Templates
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              4 Starter
            </span>
            <button
              onClick={handleResetPresets}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Seed More
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Categories" },
            { id: "CONTACT", label: "Contact & Support" },
            { id: "FEEDBACK", label: "Feedback & NPS" },
            { id: "ORDER_INQUIRY", label: "B2B & Wholesale" },
            { id: "REGISTRATION", label: "Registration" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Layout Toggle */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forms List Container */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Forms Created Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create custom forms with our drag-and-drop builder to collect leads, feedback, and customer inquiries.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Form</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => {
            const fieldsCount =
              form.fields?.length || (form.fieldsJson ? JSON.parse(form.fieldsJson).length : 0);
            const isPublished = form.status === "PUBLISHED";

            return (
              <div
                key={form.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  {/* Card Category & Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {form.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPublished ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {form.status}
                    </span>
                  </div>

                  {/* Form Title & Description */}
                  <div>
                    <h3
                      onClick={() => navigateToBuilder(form.id)}
                      className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition cursor-pointer"
                    >
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {form.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Details Pill */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {fieldsCount}
                      </span>{" "}
                      fields
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {form.submissionsCount || 0}
                      </span>{" "}
                      submissions
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigateToSubmissions(form.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1"
                      title="View Submissions"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>{form.submissionsCount || 0}</span>
                    </button>
                    <button
                      onClick={() => setActiveShareForm(form)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Share & Embed"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(form.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigateToBuilder(form.id)}
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>Edit Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Form Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fields</th>
                <th className="p-4">Submissions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {forms.map((form) => {
                const fieldsCount =
                  form.fields?.length || (form.fieldsJson ? JSON.parse(form.fieldsJson).length : 0);
                return (
                  <tr
                    key={form.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4">
                      <div
                        onClick={() => navigateToBuilder(form.id)}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                      >
                        {form.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">/form/{form.slug}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {form.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          form.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {form.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {fieldsCount}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => navigateToSubmissions(form.id)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                      >
                        {form.submissionsCount || 0} Responses
                      </button>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveShareForm(form)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          title="Share & Embed"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigateToBuilder(form.id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600"
                          title="Edit Form"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(form.id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* "Create New Form" Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create New Form
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose how you'd like to start:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* Blank Form Option */}
                <div
                  onClick={() => {
                    setCreateModalOpen(false);
                    navigateToBuilder("new");
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600">
                        Start From Blank Form
                      </h4>
                      <p className="text-xs text-slate-500">
                        Design your custom form from scratch with complete control
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </div>

                {/* Pre-made Templates */}
                <div
                  onClick={async () => {
                    setCreateModalOpen(false);
                    await handleResetPresets();
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600">
                        Seed Pre-built Starter Templates
                      </h4>
                      <p className="text-xs text-slate-500">
                        Instant Contact Us, Feedback Survey, B2B Application & Event Registration
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed & Share Modal */}
      {activeShareForm && (
        <EmbedShareModal
          form={activeShareForm}
          isOpen={Boolean(activeShareForm)}
          onClose={() => setActiveShareForm(null)}
        />
      )}
    </div>
  );
};
