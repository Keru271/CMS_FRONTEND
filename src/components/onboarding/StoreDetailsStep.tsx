import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@heroui/react';
import { Store, Tag, Globe, Mail, Phone, DollarSign, ArrowRight, ArrowLeft, FastForward } from 'lucide-react';
import { StoreDetails, MerchantUser, StoreIndustryCategory } from '@/src/types';
import { cmsService, DEFAULT_STORE_CATEGORIES } from '@/src/services/cmsService';

interface StoreDetailsStepProps {
  merchant: MerchantUser;
  initialValues?: Partial<StoreDetails>;
  onSubmit: (storeDetails: StoreDetails) => void;
  onBack: () => void;
  onSkip?: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'CAD', symbol: '$', label: 'CAD ($) - Canadian Dollar' },
  { code: 'AUD', symbol: '$', label: 'AUD ($) - Australian Dollar' },
];

const storeDetailsSchema = Yup.object({
  storeName: Yup.string()
    .min(3, 'Store name must be at least 3 characters')
    .required('Store name is required'),
  tagline: Yup.string().required('Tagline or tagline summary is required'),
  category: Yup.string().required('Please select a business category'),
  currency: Yup.string().required('Please select a default store currency'),
  supportEmail: Yup.string()
    .email('Valid support email required')
    .required('Support email is required'),
  supportPhone: Yup.string().required('Support phone number is required'),
});

export const StoreDetailsStep: React.FC<StoreDetailsStepProps> = ({
  merchant,
  initialValues,
  onSubmit,
  onBack,
  onSkip,
}) => {
  const [categories, setCategories] = useState<StoreIndustryCategory[]>(DEFAULT_STORE_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      const remote = await cmsService.getStoreCategories();
      if (remote && remote.length > 0) {
        setCategories(remote);
      }
    };
    fetchCategories();
  }, []);
  const formik = useFormik<StoreDetails>({
    initialValues: {
      storeName: initialValues?.storeName || `${merchant.firstName}'s Official Store`,
      tagline: initialValues?.tagline || 'Premium handcrafted items & modern catalog',
      category: initialValues?.category || 'Tech & Electronics',
      currency: initialValues?.currency || 'USD',
      supportEmail: initialValues?.supportEmail || merchant.email,
      supportPhone: initialValues?.supportPhone || merchant.mobileNumber,
    },
    validationSchema: storeDetailsSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sage-accent text-sage-primary text-[11px] font-bold uppercase tracking-wider border border-sage-border">
            Step 1 of 3
          </span>
          <span className="text-xs font-semibold text-sage-muted truncate">Welcome, {merchant.firstName}!</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-sage-text tracking-tight">
          Configure Storefront Identity
        </h2>
        <p className="text-xs text-sage-muted">
          Set up your brand name, motto, category, operating currency, and support channels.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Brand Name & Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div
              className={`border rounded-2xl px-3.5 py-2 min-h-[48px] bg-sage-input-bg flex items-center gap-3 transition-all shadow-xs ${formik.touched.storeName && formik.errors.storeName
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary focus-within:ring-2 focus-within:ring-sage-primary/20'
                }`}
            >
              <Store className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-sage-muted uppercase block leading-tight">
                  Store Brand Name
                </label>
                <input
                  name="storeName"
                  placeholder="Apex Threads & Co."
                  value={formik.values.storeName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-bold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.storeName && formik.errors.storeName && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.storeName}
              </span>
            )}
          </div>

          <div>
            <div
              className={`border rounded-2xl px-3.5 py-2 min-h-[48px] bg-sage-input-bg flex items-center gap-3 transition-all shadow-xs ${formik.touched.tagline && formik.errors.tagline
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary focus-within:ring-2 focus-within:ring-sage-primary/20'
                }`}
            >
              <Tag className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-sage-muted uppercase block leading-tight">
                  Tagline / Motto
                </label>
                <input
                  name="tagline"
                  placeholder="Elevating everyday essentials"
                  value={formik.values.tagline}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-bold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.tagline && formik.errors.tagline && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.tagline}
              </span>
            )}
          </div>
        </div>

        {/* Business Category Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-sage-text flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sage-primary" />
            <span>Store Industry / Niche</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const selected = formik.values.category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => formik.setFieldValue('category', cat.name)}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex items-center justify-between min-h-[44px] ${selected
                      ? 'border-sage-primary bg-sage-accent text-sage-primary font-extrabold shadow-sm ring-2 ring-sage-primary/20'
                      : 'border-sage-border bg-sage-input-bg text-sage-text hover:border-sage-primary/50'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-xs font-bold">{cat.name}</span>
                  </div>
                  <span className="text-xs text-sage-primary font-bold">
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
          {formik.touched.category && formik.errors.category && (
            <span className="text-[10px] text-sage-danger font-medium">{formik.errors.category}</span>
          )}
        </div>

        {/* Currency & Contact Details */}
        <div className="grid grid-cols-1 items-end sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-medium text-sage-muted block leading-tight mb-1">
              Store Currency
            </label>
            <div className="border border-sage-border rounded-xl px-3 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-2 focus-within:border-sage-primary transition-all">
              <DollarSign className="w-4 h-4 text-sage-primary shrink-0" />
              <select
                name="currency"
                value={formik.values.currency}
                onChange={formik.handleChange}
                className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none cursor-pointer"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div
              className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${formik.touched.supportEmail && formik.errors.supportEmail
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary'
                }`}
            >
              <Mail className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Support Email
                </label>
                <input
                  name="supportEmail"
                  type="email"
                  placeholder="support@store.com"
                  value={formik.values.supportEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.supportEmail && formik.errors.supportEmail && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.supportEmail}
              </span>
            )}
          </div>

          <div>
            <div
              className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${formik.touched.supportPhone && formik.errors.supportPhone
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary'
                }`}
            >
              <Phone className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Support Phone
                </label>
                <input
                  name="supportPhone"
                  type="tel"
                  placeholder="+1 555-0199"
                  value={formik.values.supportPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.supportPhone && formik.errors.supportPhone && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.supportPhone}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-sage-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full sm:w-auto text-sage-muted hover:text-sage-text text-xs font-semibold flex items-center justify-center gap-1.5 py-2.5 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Auth</span>
            </Button>

            {onSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="w-full sm:w-auto text-sage-primary hover:bg-sage-accent text-xs font-bold flex items-center justify-center gap-1 py-2.5 min-h-[44px] rounded-xl"
              >
                <span>Skip for Now</span>
                <FastForward className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <span>Next: Select Template</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
