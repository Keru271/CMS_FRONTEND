"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Inbox,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  Tag,
  MessageSquare,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { CMSForm, FormSubmission, FormSubmissionStatus, FormField } from "@/src/types";
import { cmsService } from "@/src/services/cmsService";

interface Props {
  initialFormId?: string;
  onBackToForms?: () => void;
}

export const FormSubmissionsStudio: React.FC<Props> = ({
  initialFormId,
  onBackToForms,
}) => {
  const [forms, setForms] = useState<CMSForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>(initialFormId || "ALL");
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null);
  const [staffNotes, setStaffNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    ALL: 0,
    NEW: 0,
    REVIEWED: 0,
    RESOLVED: 0,
    SPAM: 0,
  });

  // Fetch available forms for dropdown selector
  useEffect(() => {
    const loadForms = async () => {
      try {
        const list = await cmsService.getForms();
        setForms(list);
      } catch (err) {
        console.error("Failed to load forms list", err);
      }
    };
    loadForms();
  }, []);

  // Fetch submissions based on filters
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      if (selectedFormId && selectedFormId !== "ALL") {
        const res = await cmsService.getFormSubmissions(selectedFormId, {
          status: selectedStatus,
          search: searchQuery,
          page,
          limit: 25,
        });
        setSubmissions(res.submissions);
        setTotalCount(res.total);
        setTotalPages(res.totalPages || 1);
      } else {
        const res = await cmsService.getAllSubmissions({
          status: selectedStatus,
          search: searchQuery,
          page,
          limit: 25,
        });
        setSubmissions(res.submissions);
        setTotalCount(res.total);
        setTotalPages(res.totalPages || 1);
        if (res.counts) setStatusCounts(res.counts);
      }
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
    setSelectedIds([]);
  }, [selectedFormId, selectedStatus, page]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadSubmissions();
  };

  const handleStatusChange = async (submissionId: string, newStatus: FormSubmissionStatus) => {
    try {
      await cmsService.updateSubmission(submissionId, { status: newStatus });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
      );
      if (activeSubmission && activeSubmission.id === submissionId) {
        setActiveSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeSubmission) return;
    setSavingNotes(true);
    try {
      await cmsService.updateSubmission(activeSubmission.id, { notes: staffNotes });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === activeSubmission.id ? { ...s, notes: staffNotes } : s))
      );
      setActiveSubmission((prev) => (prev ? { ...prev, notes: staffNotes } : null));
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await cmsService.deleteSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (activeSubmission?.id === id) setActiveSubmission(null);
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete submission", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} submissions?`)) return;
    try {
      await cmsService.bulkDeleteSubmissions(selectedIds);
      setSubmissions((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      setTotalCount((prev) => Math.max(0, prev - selectedIds.length));
    } catch (err) {
      console.error("Failed to bulk delete", err);
    }
  };

  const handleExportCsv = async () => {
    if (selectedFormId && selectedFormId !== "ALL") {
      try {
        const blob = await cmsService.exportSubmissionsCsv(selectedFormId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submissions-${selectedFormId}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error("Export failed", err);
      }
    } else {
      // Export current loaded table
      if (submissions.length === 0) return;
      const headers = ["ID", "Form", "Status", "Name", "Email", "Date", "Data"];
      const rows = submissions.map((s) => [
        `"${s.id}"`,
        `"${s.form?.title || ""}"`,
        `"${s.status}"`,
        `"${s.submitterName || ""}"`,
        `"${s.submitterEmail || ""}"`,
        `"${s.createdAt}"`,
        `"${JSON.stringify(s.data).replace(/"/g, '""')}"`,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-submissions-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentForm = useMemo(() => {
    if (selectedFormId === "ALL") return null;
    return forms.find((f) => f.id === selectedFormId || f.slug === selectedFormId);
  }, [forms, selectedFormId]);

  const formFields: FormField[] = useMemo(() => {
    if (!currentForm) return [];
    return currentForm.fields || (currentForm.fieldsJson ? JSON.parse(currentForm.fieldsJson) : []);
  }, [currentForm]);

  const getStatusBadge = (status: FormSubmissionStatus) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            New
          </span>
        );
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Reviewed
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        );
      case "SPAM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            Spam
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Studio Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          {onBackToForms && (
            <button
              onClick={onBackToForms}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              title="Back to Forms"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Form Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage responses, triage incoming inquiries, and export customer data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Form Selector Dropdown */}
          <select
            value={selectedFormId}
            onChange={(e) => {
              setSelectedFormId(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Forms</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title} ({f.submissionsCount || 0})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setRefreshing(true);
              loadSubmissions();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-500" : ""}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-xl text-sm font-medium shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Submissions
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalCount}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            New / Unread
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {statusCounts.NEW || 0}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Under Review
          </p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {statusCounts.REVIEWED || 0}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Resolved
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {statusCounts.RESOLVED || 0}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All" },
            { id: "NEW", label: "New" },
            { id: "REVIEWED", label: "Reviewed" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "SPAM", label: "Spam" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedStatus === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-900 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      </div>

      {/* Submissions Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading submissions data...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Submissions Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || selectedStatus !== "ALL"
                ? "Try clearing your filters or search query to see other responses."
                : "Share your form or embed it into your site to start collecting submissions."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        submissions.length > 0 && selectedIds.length === submissions.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitter</th>
                  {selectedFormId === "ALL" && <th className="p-4">Form</th>}
                  <th className="p-4">Submitted Answers</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id);
                  const dataEntries = Object.entries(sub.data || {});

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                        isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                      onClick={() => {
                        setActiveSubmission(sub);
                        setStaffNotes(sub.notes || "");
                      }}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(sub.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={sub.status}
                            onChange={(e) =>
                              handleStatusChange(sub.id, e.target.value as FormSubmissionStatus)
                            }
                            className="text-xs font-medium py-1 px-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="NEW">New</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="SPAM">Spam</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {sub.submitterName || "Anonymous"}
                        </div>
                        {sub.submitterEmail && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {sub.submitterEmail}
                          </div>
                        )}
                      </td>

                      {selectedFormId === "ALL" && (
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {sub.form?.title || "Form"}
                          </span>
                        </td>
                      )}

                      <td className="p-4 max-w-xs truncate">
                        <div className="flex flex-wrap gap-1">
                          {dataEntries.slice(0, 2).map(([key, val]) => (
                            <span
                              key={key}
                              className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs truncate max-w-[140px]"
                            >
                              <strong>{key}:</strong> {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                          ))}
                          {dataEntries.length > 2 && (
                            <span className="text-xs text-slate-400 self-center">
                              +{dataEntries.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setActiveSubmission(sub);
                              setStaffNotes(sub.notes || "");
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-rose-600 transition"
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-500">
          <span>
            Showing {submissions.length} of {totalCount} submissions
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Submission Modal / Slide-over */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submission Details
                  </h3>
                  {getStatusBadge(activeSubmission.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: {activeSubmission.id} •{" "}
                  {new Date(activeSubmission.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Submitter Info Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Submitter Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {activeSubmission.submitterName || "Anonymous"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {activeSubmission.submitterEmail || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">IP Address</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {activeSubmission.submitterIp || "—"}
                  </span>
                </div>
              </div>

              {/* Answers Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Responses & Answers
                </h4>
                <div className="space-y-3">
                  {Object.entries(activeSubmission.data || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <div className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                        {Array.isArray(val) ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {val.map((item, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded-md text-xs"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : typeof val === "boolean" ? (
                          val ? "Yes / Agreed" : "No"
                        ) : (
                          String(val)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Notes Notepad */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Staff Notes & Resolution Log
                </h4>
                <textarea
                  rows={3}
                  placeholder="Add internal notes about this inquiry, actions taken, or customer follow-up..."
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {savingNotes ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer with Status Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Triage:</span>
                <button
                  onClick={() => handleStatusChange(activeSubmission.id, "REVIEWED")}
                  className="px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-900 hover:bg-amber-100"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleStatusChange(activeSubmission.id, "RESOLVED")}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100"
                >
                  Mark Resolved
                </button>
              </div>

              <button
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
