'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductReviewData, ReviewMetricsData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  ShieldCheck,
  CornerDownRight,
  Send,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

export const ReviewStudio: React.FC = () => {
  const [reviews, setReviews] = useState<ProductReviewData[]>([]);
  const [metrics, setMetrics] = useState<ReviewMetricsData>({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 5.0,
    ratingDistribution: { fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [starFilter, setStarFilter] = useState<number | 0>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingReview, setEditingReview] = useState<ProductReviewData | null>(null);
  const [replyingReview, setReplyingReview] = useState<ProductReviewData | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit Review Form State
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    verified: true,
    status: 'APPROVED' as 'APPROVED' | 'PENDING' | 'REJECTED' | 'SPAM',
  });

  useEffect(() => {
    loadReviews();
  }, [statusFilter, starFilter]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getReviews({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        rating: starFilter === 0 ? undefined : starFilter,
        search: searchQuery || undefined,
      });
      setReviews(data.reviews || []);
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      showToast('Failed to load product reviews', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  // Status Change (Approve / Reject / Spam)
  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SPAM') => {
    try {
      await cmsService.updateReviewStatus(id, newStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      showToast(`Review status updated to ${newStatus}`);
      // Refresh metrics in background
      loadReviews();
    } catch (err) {
      showToast('Failed to update review status', 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rev: ProductReviewData) => {
    setEditingReview(rev);
    setEditForm({
      rating: rev.rating,
      title: rev.title || '',
      comment: rev.comment,
      verified: rev.verified,
      status: rev.status as any,
    });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setIsActionLoading(true);
    try {
      const res = await cmsService.editReview(editingReview.id, editForm);
      setReviews((prev) =>
        prev.map((r) => (r.id === editingReview.id ? { ...r, ...res.review } : r))
      );
      setEditingReview(null);
      showToast('Review details updated successfully');
    } catch (err) {
      showToast('Failed to edit review', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open Reply Modal
  const handleOpenReply = (rev: ProductReviewData) => {
    setReplyingReview(rev);
    setAdminReplyInput(rev.adminReply || '');
  };

  // Save Reply
  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !adminReplyInput.trim()) return;

    setIsActionLoading(true);
    try {
      const res = await cmsService.replyToReview(replyingReview.id, adminReplyInput.trim());
      setReviews((prev) =>
        prev.map((r) =>
          r.id === replyingReview.id
            ? { ...r, adminReply: adminReplyInput.trim(), adminReplyAt: new Date().toISOString() }
            : r
        )
      );
      setReplyingReview(null);
      showToast('Official merchant reply published!');
    } catch (err) {
      showToast('Failed to post reply', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Review
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;

    try {
      await cmsService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Review deleted permanently');
      loadReviews();
    } catch (err) {
      showToast('Failed to delete review', 'error');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      (r.userEmail && r.userEmail.toLowerCase().includes(q)) ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      r.comment.toLowerCase().includes(q) ||
      (r.productTitle && r.productTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            <span>Product Reviews & Moderation</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor customer feedback, approve ratings, edit reviews, and post official store replies across your catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReviews}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-xs font-extrabold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Average Rating */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Average Rating</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-foreground">
                {metrics.averageRating}
              </span>
              <span className="text-xs text-amber-500 font-bold">/ 5.0</span>
            </div>
            <div className="flex text-amber-400 text-xs mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>{s <= Math.round(metrics.averageRating) ? '★' : '☆'}</span>
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center text-xl font-bold">
            ⭐
          </div>
        </div>

        {/* Metric 2: Total Reviews */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Total Customer Reviews</span>
            <div className="text-3xl font-black text-slate-900 dark:text-foreground mt-1">
              {metrics.totalReviews}
            </div>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">
              {metrics.approvedReviews} Published
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center text-xl font-bold">
            💬
          </div>
        </div>

        {/* Metric 3: Pending Queue */}
        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between cursor-pointer transition ${
            statusFilter === 'PENDING'
              ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
              : 'bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Pending Moderation</span>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {metrics.pendingReviews}
            </div>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">
              Requires Review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 flex items-center justify-center text-xl font-bold">
            ⏳
          </div>
        </div>

        {/* Metric 4: Moderated / Rejected */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Flagged / Rejected</span>
            <div className="text-3xl font-black text-rose-600 mt-1">
              {metrics.rejectedReviews}
            </div>
            <span className="text-xs text-slate-400 font-semibold mt-1 block">
              Spam or Declined
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
        </div>
      </div>

      {/* Main Review Management Table & Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
        {/* Filter Navigation Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-5">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'All Reviews', count: metrics.totalReviews },
              { key: 'PENDING', label: 'Pending Approval', count: metrics.pendingReviews },
              { key: 'APPROVED', label: 'Approved', count: metrics.approvedReviews },
              { key: 'REJECTED', label: 'Rejected / Spam', count: metrics.rejectedReviews },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    statusFilter === tab.key
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Star Filter & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={starFilter}
              onChange={(e) => setStarFilter(parseInt(e.target.value, 10))}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold"
            >
              <option value="0">All Star Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search reviews or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Loading product reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto text-2xl">
              ⭐
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-foreground">No Reviews Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No customer reviews match the selected filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-border bg-slate-50/40 dark:bg-accent/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row: Product + Customer + Rating + Status Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Product Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-border">
                      {rev.productImage ? (
                        <img src={rev.productImage} alt={rev.productTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">📦</div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-foreground">
                          {rev.userName}
                        </span>
                        {rev.verified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                        {rev.userEmail && (
                          <span className="text-xs text-slate-400 font-mono">({rev.userEmail})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Product: {rev.productTitle || 'Store Product'}
                        </span>
                        <span>•</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating + Status Badge */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex text-amber-400 text-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>{star <= rev.rating ? '★' : '☆'}</span>
                      ))}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : rev.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                </div>

                {/* Review Body */}
                <div className="space-y-1 text-xs">
                  {rev.title && (
                    <h4 className="font-black text-sm text-slate-900 dark:text-foreground">
                      "{rev.title}"
                    </h4>
                  )}
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-border">
                    {rev.comment}
                  </p>
                </div>

                {/* Store Owner Reply Box */}
                {rev.adminReply && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      <div className="flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Official Merchant Reply</span>
                        {rev.adminReplyAt && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({new Date(rev.adminReplyAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenReply(rev)}
                        className="text-[11px] font-bold underline hover:text-indigo-900"
                      >
                        Edit Reply
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                      {rev.adminReply}
                    </p>
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-border">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Helpful Upvotes: {rev.helpfulCount || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Toggle Buttons */}
                    {rev.status !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-accent hover:bg-rose-100 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Reply Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReply(rev)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-extrabold flex items-center gap-1 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{rev.adminReply ? 'Update Reply' : 'Reply to Customer'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rev)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                      title="Edit review details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-rose-50 text-rose-500 transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT REVIEW MODAL */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="text-base font-black text-slate-900 dark:text-foreground">
                Edit Product Review
              </h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Star Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Review Comment
                </label>
                <textarea
                  rows={4}
                  required
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Moderation Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                  >
                    <option value="APPROVED">APPROVED (Published)</option>
                    <option value="PENDING">PENDING (In Review)</option>
                    <option value="REJECTED">REJECTED (Declined)</option>
                    <option value="SPAM">SPAM (Flagged)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.verified}
                      onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Verified Buyer Badge
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg disabled:opacity-50"
                >
                  {isActionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLY TO REVIEW MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-foreground">
                  Reply as Store Owner
                </h3>
                <p className="text-xs text-slate-400">
                  Replying to {replyingReview.userName}'s review
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Original Review Snippet */}
            <div className="p-3.5 bg-slate-50 dark:bg-accent/30 rounded-2xl border border-slate-100 dark:border-border text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Customer: {replyingReview.userName} ({replyingReview.rating}★)
              </span>
              <p className="text-slate-500 italic truncate">"{replyingReview.comment}"</p>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Store Response *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thank the customer, address their feedback, or explain exchange options..."
                  value={adminReplyInput}
                  onChange={(e) => setAdminReplyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isActionLoading ? 'Publishing...' : 'Publish Store Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
