'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@heroui/react';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MerchantUser } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';

interface MerchantAuthModalProps {
  onSuccess: (merchant: MerchantUser, mode: 'register' | 'login' | 'verify') => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'verify';
  emailForVerification?: string;
}

const phoneRegExp = /^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/;
const uppercaseRegExp = /[A-Z]/;
const lowercaseRegExp = /[a-z]/;
const numberRegExp = /[0-9]/;
const specialCharRegExp = /[^A-Za-z0-9]/;

const registerSchema = Yup.object({
  firstName: Yup.string()
    .min(4, 'First name must be greater than 3 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(1, 'Last name is required')
    .required('Last name is required'),
  mobileNumber: Yup.string()
    .matches(phoneRegExp, 'Please enter a valid mobile number')
    .required('Mobile number is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(uppercaseRegExp, 'Password must contain at least 1 uppercase letter')
    .matches(lowercaseRegExp, 'Password must contain at least 1 lowercase letter')
    .matches(numberRegExp, 'Password must contain at least 1 number')
    .matches(specialCharRegExp, 'Password must contain at least 1 special character')
    .required('Password is required'),
});

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string().required('Password is required'),
});

const forgotSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
});

const verifySchema = Yup.object({
  otp: Yup.string()
    .length(6, 'Verification code must be 6 digits')
    .required('Verification code is required'),
});

const getPasswordStrength = (pwd: string) => {
  const checks = {
    length: pwd.length >= 6,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

export const MerchantAuthModal: React.FC<MerchantAuthModalProps> = ({
  onSuccess,
  initialMode = 'signin',
  emailForVerification = 'adhithya@gmail.com',
}) => {
  const [authMode] = useState<'signin' | 'signup' | 'forgot' | 'verify'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [latestToken, setLatestToken] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Google Authentication State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = sessionStorage.getItem('cms_latest_verification_token');
      if (savedToken) {
        setLatestToken(savedToken);
      }
    }
  }, []);

  const handleContinueWithGoogle = async (emailToUse?: string, nameToUse?: string) => {
    const finalEmail = emailToUse || googleEmail || 'merchant@gmail.com';
    const finalName = nameToUse || googleName || 'Google Merchant';

    setIsGoogleProcessing(true);
    setServerError(null);

    try {
      const res = await cmsService.continueWithGoogle({
        email: finalEmail,
        name: finalName,
      });

      setIsGoogleModalOpen(false);

      if (res.user) {
        onSuccess(res.user, res.isNewUser ? 'register' : 'login');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Google authentication failed. Please try again.';
      setServerError(msg);
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  // REGISTER FORMIK
  const registerFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      password: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        const response = await cmsService.registerMerchant(values);
        if (response.verificationToken) {
          setLatestToken(response.verificationToken);
        }
        onSuccess(values, 'register');
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || 'Registration failed. Please try again.';
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const pwdStrength = getPasswordStrength(registerFormik.values.password);

  // LOGIN FORMIK
  const loginFormik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        const res = await cmsService.loginMerchant(values.email, values.password);
        if (res.requiresVerification) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('cms_pending_verification_email', res.email || values.email);
            if (res.verificationToken) {
              sessionStorage.setItem('cms_latest_verification_token', res.verificationToken);
            }
          }
          const nameParts = ((res as any).name || '').trim().split(' ');
          const derivedFirstName = nameParts[0] || '';
          const derivedLastName = nameParts.slice(1).join(' ') || '';
          onSuccess(
            {
              firstName: derivedFirstName,
              lastName: derivedLastName,
              mobileNumber: (res as any).phone || '',
              email: res.email || values.email,
            },
            'verify'
          );
        } else if (res.user) {
          onSuccess(res.user, 'login');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // FORGOT PASSWORD FORMIK
  const forgotFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotSchema,
    onSubmit: async () => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        await new Promise((res) => setTimeout(res, 800));
        setResetSent(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // EMAIL VERIFICATION FORMIK
  const verifyFormik = useFormik({
    initialValues: {
      otp: latestToken || '',
    },
    enableReinitialize: true,
    validationSchema: verifySchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        await cmsService.verifyMerchantEmail(emailForVerification, values.otp);
        onSuccess(
          {
            firstName: 'Merchant',
            lastName: 'Owner',
            mobileNumber: '+1 555-0199',
            email: emailForVerification,
          },
          'register'
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Invalid verification code.';
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setServerError(null);
    setResendSuccessMsg(null);
    try {
      const data = await cmsService.resendVerificationCode(emailForVerification);
      if (data.verificationToken) {
        setLatestToken(data.verificationToken);
        verifyFormik.setFieldValue('otp', data.verificationToken);
      }
      setResendSuccessMsg(data.message || 'A new verification code has been sent!');
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend verification code.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-3 sm:p-6 md:p-10 selection:bg-sage-primary selection:text-white">
      {/* Main Split Layout Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-card border border-sage-border rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-0 md:min-h-[620px]">
        {/* Left Column: Botanical Greenhouse Artwork */}
        <div className="w-full md:w-1/2 bg-[#fafcfb] dark:bg-muted/20 p-4 sm:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-sage-border">
          <div className="relative w-full max-w-xs sm:max-w-md flex items-center justify-center py-2 sm:py-6">
            <img
              src="/auth_illustration.png"
              alt="Serene Greenhouse Yoga & Botanical Illustration"
              className="w-full h-auto max-h-[260px] sm:max-h-[360px] md:max-h-[460px] object-contain drop-shadow-sm"
            />
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-between relative bg-white dark:bg-card text-sage-text">
          {/* Top Right Action Button */}
          <div className="flex justify-end mb-4 md:mb-6">
            {authMode === 'signin' ? (
              <Link
                href="/register"
                className="px-5 sm:px-6 py-1.5 rounded-full border border-sage-border text-sage-muted font-medium text-xs hover:border-sage-primary hover:text-sage-primary transition-all"
              >
                Sign up
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 sm:px-6 py-1.5 rounded-full border border-sage-border text-sage-muted font-medium text-xs hover:border-sage-primary hover:text-sage-primary transition-all"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            {/* Header Title & Subtitle */}
            <div className="mb-5 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-sage-text tracking-tight">
                {authMode === 'verify'
                  ? 'Verify Your Email'
                  : authMode === 'forgot'
                    ? 'Forgot Password'
                    : authMode === 'signup'
                      ? 'Create Merchant Account'
                      : 'Welcome back'}
              </h1>
              <p className="text-xs text-sage-muted mt-1">
                {authMode === 'verify'
                  ? `We've sent a 6-digit verification code to ${emailForVerification}. Enter the code below to activate your account.`
                  : authMode === 'forgot'
                    ? "Enter your email address and we'll send a password reset link."
                    : authMode === 'signup'
                      ? 'Enter your merchant details to register your account.'
                      : 'Enter your email & password'}
              </p>
            </div>

            {/* SERVER ERROR BANNER */}
            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
                <span>{serverError}</span>
                <button
                  type="button"
                  onClick={() => setServerError(null)}
                  className="text-red-400 hover:text-red-600 ml-2 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* RESEND CODE SUCCESS BANNER */}
            {resendSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
                <span>{resendSuccessMsg}</span>
                <button
                  type="button"
                  onClick={() => setResendSuccessMsg(null)}
                  className="text-emerald-400 hover:text-emerald-600 ml-2 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* OTP VERIFICATION HELPER */}
            {authMode === 'verify' && latestToken && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                <div>
                  <span className="font-medium">Verification Code: </span>
                  <span className="font-mono font-bold text-sm tracking-widest">{latestToken}</span>
                </div>
                <button
                  type="button"
                  onClick={() => verifyFormik.setFieldValue('otp', latestToken)}
                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                >
                  Use Code
                </button>
              </div>
            )}

            {/* EMAIL VERIFICATION FORM */}
            {authMode === 'verify' && (
              <form onSubmit={verifyFormik.handleSubmit} className="space-y-4">
                <div>
                  <div
                    className={`border rounded-xl px-4 py-3 min-h-[48px] bg-sage-input-bg flex items-center gap-3.5 transition-all ${verifyFormik.touched.otp && verifyFormik.errors.otp
                        ? 'border-sage-danger focus-within:border-sage-danger'
                        : 'border-sage-border focus-within:border-sage-primary'
                      }`}
                  >
                    <KeyRound className="w-5 h-5 text-sage-primary shrink-0" />
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-sage-muted block leading-tight">
                        6-Digit Verification Code
                      </label>
                      <input
                        name="otp"
                        type="text"
                        maxLength={6}
                        placeholder="849201"
                        value={verifyFormik.values.otp}
                        onChange={verifyFormik.handleChange}
                        onBlur={verifyFormik.handleBlur}
                        className="w-full bg-transparent text-sm sm:text-base font-mono font-bold tracking-widest text-sage-text outline-none"
                      />
                    </div>
                  </div>
                  {verifyFormik.touched.otp && verifyFormik.errors.otp && (
                    <span className="text-[11px] text-sage-danger font-medium mt-1 block">
                      {verifyFormik.errors.otp}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-sage-muted pt-1">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendCode}
                    className="font-semibold text-sage-primary hover:underline disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="w-full min-h-[44px] py-3.5 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Email & Continue</span>
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/register"
                    className="text-xs font-semibold text-sage-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Registration</span>
                  </Link>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'forgot' && (
              <div className="w-full space-y-4">
                {resetSent ? (
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-xl bg-sage-accent text-sage-primary text-xs font-semibold flex items-center gap-2 border border-sage-border">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Password reset link sent! Check your email.</span>
                    </div>
                    <Link
                      href="/login"
                      className="text-xs font-semibold text-sage-primary hover:underline inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Login</span>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={forgotFormik.handleSubmit} className="space-y-4">
                    <div className="border border-sage-border rounded-xl px-4 py-2.5 min-h-[48px] bg-sage-input-bg flex items-center gap-3.5 focus-within:border-sage-primary transition-all">
                      <Mail className="w-5 h-5 text-sage-primary shrink-0" />
                      <div className="flex-1">
                        <label className="text-[11px] font-medium text-sage-muted block leading-tight">
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="adhithya@gmail.com"
                          value={forgotFormik.values.email}
                          onChange={forgotFormik.handleChange}
                          onBlur={forgotFormik.handleBlur}
                          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-sage-text placeholder:text-sage-muted outline-none"
                        />
                      </div>
                    </div>
                    {forgotFormik.touched.email && forgotFormik.errors.email && (
                      <span className="text-[11px] text-sage-danger font-medium block -mt-2">
                        {forgotFormik.errors.email}
                      </span>
                    )}

                    <Button
                      type="submit"
                      isDisabled={isSubmitting}
                      className="w-full min-h-[44px] py-3 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <Link
                        href="/login"
                        className="text-xs font-semibold text-sage-primary hover:underline inline-flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Login</span>
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* SIGN UP FORM WITH VALIDATION */}
            {authMode === 'signup' && (
              <form onSubmit={registerFormik.handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div
                      className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${registerFormik.touched.firstName && registerFormik.errors.firstName
                          ? 'border-sage-danger focus-within:border-sage-danger'
                          : 'border-sage-border focus-within:border-sage-primary'
                        }`}
                    >
                      <User className="w-4 h-4 text-sage-primary shrink-0" />
                      <div className="flex-1">
                        <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                          First Name
                        </label>
                        <input
                          name="firstName"
                          placeholder="Adhithya"
                          value={registerFormik.values.firstName}
                          onChange={registerFormik.handleChange}
                          onBlur={registerFormik.handleBlur}
                          className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                        />
                      </div>
                    </div>
                    {registerFormik.touched.firstName && registerFormik.errors.firstName && (
                      <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                        {registerFormik.errors.firstName}
                      </span>
                    )}
                  </div>

                  <div>
                    <div
                      className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${registerFormik.touched.lastName && registerFormik.errors.lastName
                          ? 'border-sage-danger focus-within:border-sage-danger'
                          : 'border-sage-border focus-within:border-sage-primary'
                        }`}
                    >
                      <User className="w-4 h-4 text-sage-primary shrink-0" />
                      <div className="flex-1">
                        <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                          Last Name
                        </label>
                        <input
                          name="lastName"
                          placeholder="Kumar"
                          value={registerFormik.values.lastName}
                          onChange={registerFormik.handleChange}
                          onBlur={registerFormik.handleBlur}
                          className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                        />
                      </div>
                    </div>
                    {registerFormik.touched.lastName && registerFormik.errors.lastName && (
                      <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                        {registerFormik.errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div
                    className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${registerFormik.touched.mobileNumber && registerFormik.errors.mobileNumber
                        ? 'border-sage-danger focus-within:border-sage-danger'
                        : 'border-sage-border focus-within:border-sage-primary'
                      }`}
                  >
                    <Phone className="w-4 h-4 text-sage-primary shrink-0" />
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                        Mobile Number
                      </label>
                      <input
                        name="mobileNumber"
                        type="tel"
                        placeholder="+1 555-0199"
                        value={registerFormik.values.mobileNumber}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                      />
                    </div>
                  </div>
                  {registerFormik.touched.mobileNumber && registerFormik.errors.mobileNumber && (
                    <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                      {registerFormik.errors.mobileNumber}
                    </span>
                  )}
                </div>

                <div>
                  <div
                    className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${registerFormik.touched.email && registerFormik.errors.email
                        ? 'border-sage-danger focus-within:border-sage-danger'
                        : 'border-sage-border focus-within:border-sage-primary'
                      }`}
                  >
                    <Mail className="w-4 h-4 text-sage-primary shrink-0" />
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="adhithya@gmail.com"
                        value={registerFormik.values.email}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                      />
                    </div>
                  </div>
                  {registerFormik.touched.email && registerFormik.errors.email && (
                    <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                      {registerFormik.errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <div
                    className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${registerFormik.touched.password && registerFormik.errors.password
                        ? 'border-sage-danger focus-within:border-sage-danger'
                        : 'border-sage-border focus-within:border-sage-primary'
                      }`}
                  >
                    <Lock className="w-4 h-4 text-sage-primary shrink-0" />
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                        Password
                      </label>
                      <input
                        name="password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerFormik.values.password}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="p-1 text-sage-muted hover:text-sage-primary transition focus:outline-none"
                      tabIndex={-1}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4 text-sage-muted hover:text-sage-text" />
                      ) : (
                        <Eye className="w-4 h-4 text-sage-primary" />
                      )}
                    </button>
                  </div>
                  {registerFormik.touched.password && registerFormik.errors.password && (
                    <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                      {registerFormik.errors.password}
                    </span>
                  )}

                  {/* Password Strength Meter & Live Checklist */}
                  {registerFormik.values.password && (
                    <div className="mt-2 p-2.5 rounded-xl bg-sage-input-bg/70 border border-sage-border/60 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-sage-muted">
                          Strength:{' '}
                          <span
                            className={
                              pwdStrength.score <= 1
                                ? 'text-red-500 font-bold'
                                : pwdStrength.score === 2
                                  ? 'text-orange-500 font-bold'
                                  : pwdStrength.score <= 4
                                    ? 'text-amber-500 font-bold'
                                    : 'text-emerald-500 font-bold'
                            }
                          >
                            {pwdStrength.score <= 1
                              ? 'Weak'
                              : pwdStrength.score === 2
                                ? 'Fair'
                                : pwdStrength.score <= 4
                                  ? 'Good'
                                  : 'Strong'}
                          </span>
                        </span>
                        <div className="flex-1 flex gap-1 h-1.5 max-w-[140px]">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`flex-1 h-full rounded-full transition-all duration-300 ${lvl <= pwdStrength.score
                                  ? pwdStrength.score <= 1
                                    ? 'bg-red-500'
                                    : pwdStrength.score === 2
                                      ? 'bg-orange-500'
                                      : pwdStrength.score <= 4
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px]">
                        <div
                          className={`flex items-center gap-1.5 font-medium ${pwdStrength.checks.uppercase
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-sage-muted'
                            }`}
                        >
                          <span>{pwdStrength.checks.uppercase ? '✓' : '○'}</span>
                          <span>1 Uppercase (A-Z)</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 font-medium ${pwdStrength.checks.lowercase
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-sage-muted'
                            }`}
                        >
                          <span>{pwdStrength.checks.lowercase ? '✓' : '○'}</span>
                          <span>1 Lowercase (a-z)</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 font-medium ${pwdStrength.checks.number
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-sage-muted'
                            }`}
                        >
                          <span>{pwdStrength.checks.number ? '✓' : '○'}</span>
                          <span>1 Number (0-9)</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 font-medium ${pwdStrength.checks.special
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-sage-muted'
                            }`}
                        >
                          <span>{pwdStrength.checks.special ? '✓' : '○'}</span>
                          <span>1 Special Char (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="w-full min-h-[44px] py-3 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create Account</span>
                  )}
                </Button>
              </form>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={loginFormik.handleSubmit} className="space-y-4">
                <div>
                  <div className="border border-sage-border rounded-xl px-4 py-2.5 min-h-[48px] bg-sage-input-bg flex items-center gap-3.5 focus-within:border-sage-primary transition-all">
                    <Mail className="w-5 h-5 text-sage-primary shrink-0" />
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-sage-muted block leading-tight">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="adhithya@gmail.com"
                        value={loginFormik.values.email}
                        onChange={loginFormik.handleChange}
                        onBlur={loginFormik.handleBlur}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-sage-text placeholder:text-sage-muted outline-none"
                      />
                    </div>
                  </div>
                  {loginFormik.touched.email && loginFormik.errors.email && (
                    <span className="text-[11px] text-sage-danger font-medium mt-1 block">
                      {loginFormik.errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <div className="border border-sage-border rounded-xl px-4 py-2.5 min-h-[48px] bg-sage-input-bg flex items-center gap-3.5 focus-within:border-sage-primary transition-all">
                    <Lock className="w-5 h-5 text-sage-primary shrink-0" />
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-sage-muted block leading-tight">
                        Password
                      </label>
                      <input
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginFormik.values.password}
                        onChange={loginFormik.handleChange}
                        onBlur={loginFormik.handleBlur}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-sage-text placeholder:text-sage-muted outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="p-1 text-sage-muted hover:text-sage-primary transition focus:outline-none"
                      tabIndex={-1}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4 text-sage-muted hover:text-sage-text" />
                      ) : (
                        <Eye className="w-4 h-4 text-sage-primary" />
                      )}
                    </button>
                  </div>
                  {loginFormik.touched.password && loginFormik.errors.password && (
                    <span className="text-[11px] text-sage-danger font-medium mt-1 block">
                      {loginFormik.errors.password}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${rememberMe ? 'bg-sage-primary' : 'bg-sage-border'
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${rememberMe ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-sage-text">Remember me</span>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-sage-danger hover:underline shrink-0"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="w-full min-h-[44px] py-3.5 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
              </form>
            )}

            {/* Social Login Options */}
            {authMode !== 'verify' && (
              <div className="mt-6 sm:mt-8">
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-dashed border-sage-border w-full" />
                  <span className="bg-white dark:bg-card px-3 text-[11px] text-sage-muted font-medium absolute">
                    Or Login with
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmail('');
                      setGoogleName('');
                      setIsGoogleModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-full border border-sage-border hover:border-sage-primary text-xs font-semibold text-sage-text flex items-center justify-center gap-2.5 transition-all bg-white dark:bg-card hover:bg-sage-accent/50 min-h-[42px] cursor-pointer shadow-xs active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.01 10.04.01 12c0 1.96.46 3.8 1.28 5.42l3.99-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleContinueWithGoogle('demo.merchant@facebook.com', 'Facebook Merchant')}
                    className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-full border border-sage-border hover:border-sage-primary text-xs font-semibold text-sage-text flex items-center justify-center gap-2.5 transition-all bg-white dark:bg-card hover:bg-sage-accent/50 min-h-[42px] cursor-pointer shadow-xs active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE GOOGLE SIGN-IN MODAL DIALOG                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.01 10.04.01 12c0 1.96.46 3.8 1.28 5.42l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sign in with Google
                  </h3>
                  <p className="text-xs text-slate-500">to continue to OmniStore CMS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Choose an Account:
              </span>

              {/* Quick Select Accounts */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isGoogleProcessing}
                  onClick={() => handleContinueWithGoogle('balakeerthi2710@gmail.com', 'Keerthivasan B')}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 flex items-center gap-3 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                    K
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600">
                      Keerthivasan B
                    </strong>
                    <span className="text-[11px] text-slate-500 truncate block">
                      balakeerthi2710@gmail.com
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition">
                    Continue →
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isGoogleProcessing}
                  onClick={() => handleContinueWithGoogle('adhithya.merchant@gmail.com', 'Adhithya Kumar')}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 flex items-center gap-3 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600">
                      Adhithya Kumar
                    </strong>
                    <span className="text-[11px] text-slate-500 truncate block">
                      adhithya.merchant@gmail.com
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition">
                    Continue →
                  </span>
                </button>
              </div>

              {/* Or Custom Google Account Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Or enter another Google account:
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Alex Rivera)"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Google Email (e.g. alex@gmail.com)"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={isGoogleProcessing || !googleEmail.trim()}
                  onClick={() => handleContinueWithGoogle()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGoogleProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Continue with Custom Account</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
