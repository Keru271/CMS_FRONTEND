'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Tag,
  User,
  ExternalLink,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  Share2,
  Image as ImageIcon,
  Save,
  X,
  RefreshCw,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { BlogPost, BlogPostInput, CMSProduct } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://serene-croissant-868f08.netlify.app';

// Helper to convert ISO or Date to local YYYY-MM-DDTHH:mm string for datetime-local input without timezone shift
const toLocalDatetimeString = (dateInput?: string | Date | null): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('Store Editorial');
  const [featuredImage, setFeaturedImage] = useState('');
  const [category, setCategory] = useState('Lifestyle');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SCHEDULED'>('PUBLISHED');
  const [publishedAt, setPublishedAt] = useState(toLocalDatetimeString());
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // AI Compose Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('Trends & Style');
  const [aiStatus, setAiStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  const handleAiGenerateAndPublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const topic = aiTopic.trim() || 'Essential Styling & Buying Guide for Modern Living';
    setIsAiGenerating(true);
    setAiSuccessMessage('');

    try {
      const generatedTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
      const generatedSlug = generatedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const generatedContent = `## Discover ${generatedTitle}

In today's fast-moving lifestyle, thoughtful craftsmanship and intentional curation make all the difference. When selecting quality essentials for everyday living, having a trusted guide ensures you invest in pieces that stand the test of time.

### Why Quality & Craftsmanship Matter
Every product in our collection is curated with longevity, tactile comfort, and sustainable design in mind. When you choose timeless silhouettes over fast fleeting trends:
- **Lasting Value:** Built with durable materials engineered for daily use.
- **Effortless Versatility:** Designed to complement your personal wardrobe and living spaces seamlessly.
- **Sustainable Footprint:** Fewer replacements mean less waste and a healthier environment.

### Pro Styling & Selection Tips
1. **Focus on Core Foundations:** Start with versatile neutral tones and natural textures.
2. **Layer with Intention:** Mix tactile materials like linen, ceramic, brushed metals, or premium leather.
3. **Care for Your Investment:** Follow manufacturer care instructions to preserve luster and structural integrity.

### Explore the Collection
Ready to elevate your daily routine? Explore our latest arrivals in the store catalog today and enjoy prompt doorstep delivery.`;

      const excerpt = `Explore our expert guide on ${generatedTitle}. Discover curation tips, material benefits, and seasonal recommendations.`;
      const tags = `${aiCategory.toLowerCase().replace(/[^a-z0-9]+/g, ', ')}, trends, 2026, editorial`;

      const created = await cmsService.createBlogPost({
        title: generatedTitle,
        slug: generatedSlug,
        content: generatedContent,
        excerpt,
        category: aiCategory,
        status: aiStatus,
        author: 'Store Editorial',
        tags,
        featuredImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        publishedAt: new Date().toISOString(),
      });

      await fetchPosts();
      setAiSuccessMessage(`🎉 Article "${created.title}" successfully published & updated in CMS!`);
      setTimeout(() => {
        setAiModalOpen(false);
        setAiSuccessMessage('');
        setAiTopic('');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to generate article with AI:', err);
      alert(err.message || 'Failed to generate blog post with AI');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleGenerateBodyWithAi = () => {
    if (!title.trim()) {
      alert('Please enter an Article Title first.');
      return;
    }
    const generated = `## ${title}

Welcome to our comprehensive guide on ${title}. In modern living and lifestyle curation, attention to detail and authentic craftsmanship elevate every experience.

### Key Highlights & Observations
- **Design Philosophy:** Balancing aesthetic harmony with utilitarian functionality.
- **Material Excellence:** Premium sustainable components designed for everyday durability.
- **Styling Versatility:** Pairs effortlessly with existing essentials and statement accents.

### Recommendations & Care
To maximize longevity, adhere to recommended care practices and avoid abrasive conditions. Explore related pieces below to complete your setup.`;

    setContent(generated);
    if (!excerpt) {
      setExcerpt(`Discover expert insights on ${title}. Explore styling recommendations, material benefits, and contemporary trends.`);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getBlogPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await cmsService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchProducts();
  }, []);

  // Real-time ticking timer so scheduled badges update automatically every 5 seconds
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 5000);
    return () => clearInterval(tickTimer);
  }, []);

  // Auto-sync posts from backend every 15 seconds if any scheduled post exists
  useEffect(() => {
    const hasScheduled = posts.some((p) => p.status === 'SCHEDULED');
    if (!hasScheduled) return;

    const syncTimer = setInterval(() => {
      cmsService
        .getBlogPosts()
        .then((data) => {
          if (Array.isArray(data)) setPosts(data);
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(syncTimer);
  }, [posts]);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setContent('');
    setExcerpt('');
    setAuthor('Store Editorial');
    setFeaturedImage('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80');
    setCategory('Stories & Trends');
    setTags('trends, style, guide');
    setStatus('PUBLISHED');
    setPublishedAt(toLocalDatetimeString());
    setMetaTitle('');
    setMetaDescription('');
    setCanonicalUrl('');
    setSelectedProductIds([]);
    setFormError('');
    setEditorOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setExcerpt(post.excerpt || '');
    setAuthor(post.author || 'Store Editorial');
    setFeaturedImage(post.featuredImage || '');
    setCategory(post.category || 'Stories');
    setTags(post.tags || '');
    setStatus(post.status);
    setPublishedAt(toLocalDatetimeString(post.publishedAt || post.createdAt));
    setMetaTitle(post.metaTitle || '');
    setMetaDescription(post.metaDescription || '');
    setCanonicalUrl(post.canonicalUrl || '');

    try {
      setSelectedProductIds(post.relatedProductIds ? JSON.parse(post.relatedProductIds) : []);
    } catch {
      setSelectedProductIds([]);
    }

    setFormError('');
    setEditorOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPost) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      );
      if (!metaTitle) {
        setMetaTitle(val);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Article title is required.');
      return;
    }
    if (!content.trim()) {
      setFormError('Article content cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload: BlogPostInput = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content,
        excerpt: excerpt || content.slice(0, 160) + '...',
        author,
        featuredImage,
        category,
        tags,
        status,
        publishedAt: new Date(publishedAt).toISOString(),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        canonicalUrl,
        relatedProductIds: JSON.stringify(selectedProductIds),
      };

      if (editingPost) {
        await cmsService.updateBlogPost(editingPost.id, payload);
      } else {
        await cmsService.createBlogPost(payload);
      }

      setEditorOpen(false);
      await fetchPosts();
    } catch (err: any) {
      console.error('Failed to save post:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this blog post?')) return;
    try {
      await cmsService.deleteBlogPost(id);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected articles?`))
      return;
    try {
      await cmsService.bulkDeleteBlogPosts(selectedIds);
      setSelectedIds([]);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to bulk delete posts:', err);
    }
  };

  // Helper to determine real-time publication status based on current time
  const getEffectiveStatus = (post: BlogPost): 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' => {
    if (post.status === 'SCHEDULED') {
      if (!post.publishedAt) return 'PUBLISHED';
      const pubTime = new Date(post.publishedAt).getTime();
      if (!isNaN(pubTime) && pubTime <= currentTimestamp) {
        return 'PUBLISHED';
      }
      return 'SCHEDULED';
    }
    return post.status;
  };

  const filteredPosts = posts.filter((p) => {
    const effectiveStatus = getEffectiveStatus(p);
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || effectiveStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

  const publishedCount = posts.filter((p) => getEffectiveStatus(p) === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => getEffectiveStatus(p) === 'DRAFT').length;
  const scheduledCount = posts.filter((p) => getEffectiveStatus(p) === 'SCHEDULED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Blog & Editorial Studio
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Publish rich storytelling, buying guides, and SEO content to drive organic traffic
                and sales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPosts}
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setAiTopic('');
              setAiSuccessMessage('');
              setAiModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            AI Compose
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Article
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.length}</p>
          <span className="text-xs text-slate-400">Published stories & guides</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Live & Active</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </p>
          <span className="text-xs text-slate-400">Indexed on storefront</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Posts</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{scheduledCount}</p>
          <span className="text-xs text-slate-400">Auto-publishing soon</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <Edit2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{draftCount}</p>
          <span className="text-xs text-slate-400">In progress work</span>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={String(c)} value={String(c)}>
                {String(c)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500">{selectedIds.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Blog Posts Grid / Table */}
      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No articles found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Start writing engaging stories, styling tips, or product highlights.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Write First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const effectiveStatus = getEffectiveStatus(post);
            const isFutureScheduled = effectiveStatus === 'SCHEDULED';

            return (
              <div
                key={post.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg backdrop-blur-md shadow-sm flex items-center gap-1 ${
                          effectiveStatus === 'PUBLISHED'
                            ? 'bg-emerald-500/90 text-white'
                            : effectiveStatus === 'SCHEDULED'
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-slate-700/90 text-white'
                        }`}
                      >
                        {isFutureScheduled && <Clock className="w-3 h-3" />}
                        {effectiveStatus}
                      </span>
                      {post.category && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-black/60 text-white rounded-lg backdrop-blur-md">
                          {post.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author || 'Store Editorial'}
                      </span>
                      <span>•</span>
                      {isFutureScheduled ? (
                        <span
                          className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium"
                          title="Scheduled to publish"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(post.publishedAt || post.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                      {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').slice(0, 120) + '...'}
                    </p>

                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {post.tags
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((tagItem) => (
                            <span
                              key={tagItem}
                              className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md"
                            >
                              #{tagItem}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={`${STOREFRONT_URL}/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Live Preview
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                      title="Edit article"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingPost ? 'Edit Blog Article' : 'Compose New Blog Post'}
                </h2>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 flex-1">
              {formError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl">
                  {formError}
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. 10 Minimalist Interior Styling Ideas for 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. minimalist-interior-styling-ideas-2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Category, Author, Status, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Trends, Guides"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
                      setStatus(newStatus);
                      if (newStatus === 'SCHEDULED') {
                        const current = new Date(publishedAt);
                        if (isNaN(current.getTime()) || current <= new Date()) {
                          const bumped = new Date(Date.now() + 60 * 60 * 1000);
                          setPublishedAt(toLocalDatetimeString(bumped));
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PUBLISHED">Published (Live)</option>
                    <option value="SCHEDULED">Scheduled (Future)</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    {status === 'SCHEDULED' ? 'Schedule Release Time *' : 'Publish Date & Time'}
                  </label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Schedule Banner / Helpers */}
              {status === 'SCHEDULED' && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      Scheduled to go live on:{' '}
                      <strong className="font-semibold">
                        {publishedAt
                          ? new Date(publishedAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Set a time'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
                      Quick presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 60 * 60 * 1000);
                        setPublishedAt(toLocalDatetimeString(d));
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/70 rounded-lg text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition font-medium text-[11px]"
                    >
                      +1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        d.setHours(9, 0, 0, 0);
                        setPublishedAt(toLocalDatetimeString(d));
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/70 rounded-lg text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition font-medium text-[11px]"
                    >
                      Tomorrow 9 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        d.setHours(9, 0, 0, 0);
                        setPublishedAt(toLocalDatetimeString(d));
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/70 rounded-lg text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition font-medium text-[11px]"
                    >
                      Next Week
                    </button>
                  </div>
                </div>
              )}

              {/* Featured Image URL & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white"
                  />
                  {featuredImage && (
                    <div className="mt-2 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img
                        src={featuredImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="minimalism, living, 2026, trends"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white"
                  />
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Short Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief teaser for social previews and blog listing cards..."
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Main Article Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                    Article Body Content * (Markdown / Rich HTML)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateBodyWithAi}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/40 rounded-lg border border-violet-200 dark:border-violet-800 transition"
                      title="Generate rich body content using AI"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      AI Write Content
                    </button>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Supports headers (##), bold (**), lists (-)
                    </span>
                  </div>
                </div>
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="## The Art of Minimalist Living&#10;&#10;When curating a contemporary living space, less truly becomes more..."
                  className="w-full font-mono px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Related Products Picker */}
              {products.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      Recommended Products in this Article
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Select products from your catalog to embed as shoppable cards inside the article
                    reader.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-44 overflow-y-auto pr-1">
                    {products.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setSelectedProductIds((prev) =>
                              isSelected ? prev.filter((id) => id !== prod.id) : [...prev, prod.id],
                            );
                          }}
                          className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-indigo-600"
                          />
                          <span className="truncate">{prod.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEO Controls */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                    SEO & Social Meta Tags
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Meta Title (SERP)
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Title for Google search results"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Meta Description (SERP)
                    </label>
                    <input
                      type="text"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="150-160 character summary for search bots"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : editingPost ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Compose Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Editorial & Story Composer
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generate rich, SEO-optimized lifestyle articles & guides in seconds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAiGenerateAndPublish} className="p-6 space-y-4">
              {aiSuccessMessage && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Article Topic or Idea *
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. 10 Minimalist Living & Styling Trends for 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Quick Preset Ideas */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Suggested High-Converting Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Top 10 Interior Styling Trends for 2026',
                    'The Ultimate Care & Longevity Guide for Artisan Goods',
                    'Why Sustainable & Circular Design Matters',
                    'How to Curate the Perfect Capsule Wardrobe',
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setAiTopic(topic)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-violet-50 dark:bg-slate-800 dark:hover:bg-violet-950/50 text-slate-700 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                    >
                      💡 {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Category
                  </label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Trends & Style">Trends & Style</option>
                    <option value="Buying Guides">Buying Guides</option>
                    <option value="Care & Maintenance">Care & Maintenance</option>
                    <option value="Brand Stories">Brand Stories</option>
                    <option value="News & Releases">News & Releases</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={aiStatus}
                    onChange={(e) => setAiStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PUBLISHED">Publish Live (Immediate)</option>
                    <option value="DRAFT">Save as Draft</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAiGenerating || Boolean(aiSuccessMessage)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {isAiGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {aiStatus === 'PUBLISHED' ? 'Generate & Publish' : 'Generate Draft'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
