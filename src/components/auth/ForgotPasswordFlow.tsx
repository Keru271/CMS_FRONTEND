'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';

const uppercaseRegExp = /[A-Z]/;
const lowercaseRegExp = /[a-z]/;
const numberRegExp = /[0-9]/;
const specialCharRegExp = /[^A-Za-z0-9]/;

const getPasswordStrength = (pwd: string) => {
  const checks = {
    length: pwd.length >= 6,
    uppercase: uppercaseRegExp.test(pwd),
    lowercase: lowercaseRegExp.test(pwd),
    number: numberRegExp.test(pwd),
    special: specialCharRegExp.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

export const ForgotPasswordFlow: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-read email or token from URL params if present
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    if (urlEmail) {
      setEmail(urlEmail);
      requestFormik.setFieldValue('email', urlEmail);
    }
    if (urlToken) {
      setResetToken(urlToken);
      verifyFormik.setFieldValue('otp', urlToken);
      if (urlEmail) {
        setStep('verify');
      }
    }
  }, [searchParams]);

  // STEP 1: Request Reset Code Formik
  const requestFormik = useFormik({
    initialValues: {
      email: email || '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email address is required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        const res = await cmsService.forgotPassword(values.email);
        setEmail(values.email);
        if (res.resetToken) {
          setResetToken(res.resetToken);
          verifyFormik.setFieldValue('otp', res.resetToken);
        }
        setStep('verify');
        setResendCooldown(30);
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || 'Failed to send password reset code.';
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // STEP 2: Verify Code Formik
  const verifyFormik = useFormik({
    initialValues: {
      otp: resetToken || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, 'Verification code must be exactly 6 digits')
        .required('Verification code is required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        await cmsService.verifyResetToken(email, values.otp);
        setResetToken(values.otp);
        setStep('reset');
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || 'Invalid or expired verification code.';
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // STEP 3: Reset Password Formik
  const resetFormik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(uppercaseRegExp, 'Must contain at least 1 uppercase letter')
        .matches(lowercaseRegExp, 'Must contain at least 1 lowercase letter')
        .matches(numberRegExp, 'Must contain at least 1 number')
        .matches(specialCharRegExp, 'Must contain at least 1 special character')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        await cmsService.resetPassword({
          email,
          token: resetToken,
          newPassword: values.newPassword,
        });
        setStep('success');
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Resend Code Handler
  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return;
    setServerError(null);
    setResendSuccessMsg(null);
    try {
      const res = await cmsService.forgotPassword(email);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        verifyFormik.setFieldValue('otp', res.resetToken);
      }
      setResendSuccessMsg('A fresh verification code has been sent!');
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
      setServerError(err.response?.data?.message || 'Failed to resend reset code.');
    }
  };

  const passwordStrength = getPasswordStrength(resetFormik.values.newPassword);

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-[#121212] flex items-center justify-center p-3 sm:p-6 md:p-10 selection:bg-slate-900 selection:text-white dark:selection:bg-[#00E5FF] dark:selection:text-black">
      {/* Main Split Layout Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-0 md:min-h-[620px]">
        {/* Left Column: Botanical Artwork */}
        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-[#181818] p-4 sm:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#2C2C2E]">
          <div className="relative w-full max-w-xs sm:max-w-md flex flex-col items-center justify-center py-2 sm:py-6 text-center">
            <img
              src="/auth_illustration.png"
              alt="Botanical Greenhouse Illustration"
              className="w-full h-auto max-h-[240px] sm:max-h-[320px] md:max-h-[400px] object-contain drop-shadow-sm"
            />
            <div className="mt-4 space-y-1">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Multi-Factor Merchant Protection</span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Recover your store dashboard access with end-to-end cryptographic verification.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form Panel */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-between relative bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white">
          {/* Top Header Link */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#00E5FF] hover:underline transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign in</span>
            </Link>

            <Link
              href="/register"
              className="px-5 sm:px-6 py-1.5 rounded-full border border-slate-300 dark:border-[#2C2C2E] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:border-slate-900 dark:hover:border-[#00E5FF] hover:text-slate-900 dark:hover:text-[#00E5FF] transition-all bg-slate-50 dark:bg-[#252525] cursor-pointer"
            >
              Create Account
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            {/* ── STEP 1: REQUEST CODE ────────────────────────────────────── */}
            {step === 'request' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Forgot Password?
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    No worries! Enter your registered merchant email address and we’ll send you a
                    6-digit recovery code.
                  </p>
                </div>

                {serverError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
                    <span>⚠️ {serverError}</span>
                    <button
                      type="button"
                      onClick={() => setServerError(null)}
                      className="text-red-400 hover:text-red-600 ml-2 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={requestFormik.handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Merchant Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.g. merchant@store.com"
                        {...requestFormik.getFieldProps('email')}
                        className={`w-full pl-9 pr-4 py-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                          requestFormik.touched.email && requestFormik.errors.email
                            ? 'border-red-500 bg-red-50/20 text-red-900 dark:text-red-200'
                            : 'border-slate-300 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#161616] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-900 dark:focus:border-[#00E5FF] focus:bg-white dark:focus:bg-[#161616]'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                    {requestFormik.touched.email && requestFormik.errors.email && (
                      <span className="text-[11px] text-red-500 font-medium mt-1 block">
                        {requestFormik.errors.email}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-[#00E5FF] dark:hover:bg-[#38e1ff] text-white dark:text-[#121212] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Recovery Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Recovery Code</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2: VERIFY OTP ─────────────────────────────────────── */}
            {step === 'verify' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-xs">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Check Your Inbox
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We sent a 6-digit recovery code to{' '}
                    <strong className="text-slate-900 dark:text-white font-semibold">{email}</strong>.
                  </p>
                </div>

                {/* Simulated Quick-Fill Badge */}
                {resetToken && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                        Simulated Demo Token
                      </span>
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm tracking-widest">
                        {resetToken}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => verifyFormik.setFieldValue('otp', resetToken)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                {serverError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
                    <span>⚠️ {serverError}</span>
                    <button
                      type="button"
                      onClick={() => setServerError(null)}
                      className="text-red-400 hover:text-red-600 ml-2 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                {resendSuccessMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
                    <span>✓ {resendSuccessMsg}</span>
                    <button
                      type="button"
                      onClick={() => setResendSuccessMsg(null)}
                      className="text-emerald-500 hover:text-emerald-700 ml-2 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={verifyFormik.handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      6-Digit Recovery Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      {...verifyFormik.getFieldProps('otp')}
                      className={`w-full text-center tracking-[0.4em] py-3.5 rounded-xl border text-lg font-mono font-black focus:outline-none transition-all ${
                        verifyFormik.touched.otp && verifyFormik.errors.otp
                          ? 'border-red-500 bg-red-50/20 text-red-900 dark:text-red-200'
                          : 'border-slate-300 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#161616] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-900 dark:focus:border-[#00E5FF] focus:bg-white dark:focus:bg-[#161616]'
                      }`}
                    />
                    {verifyFormik.touched.otp && verifyFormik.errors.otp && (
                      <span className="text-[11px] text-red-500 font-medium mt-1 block">
                        {verifyFormik.errors.otp}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-[#00E5FF] dark:hover:bg-[#38e1ff] text-white dark:text-[#121212] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      Change email
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendCode}
                      className="text-slate-900 dark:text-[#00E5FF] font-bold hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── STEP 3: RESET PASSWORD ─────────────────────────────────── */}
            {step === 'reset' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Set New Password
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Create a strong, unique password for{' '}
                    <strong className="text-slate-900 dark:text-white font-semibold">{email}</strong>.
                  </p>
                </div>

                {serverError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
                    <span>⚠️ {serverError}</span>
                    <button
                      type="button"
                      onClick={() => setServerError(null)}
                      className="text-red-400 hover:text-red-600 ml-2 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={resetFormik.handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...resetFormik.getFieldProps('newPassword')}
                        className={`w-full pl-9 pr-10 py-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                          resetFormik.touched.newPassword && resetFormik.errors.newPassword
                            ? 'border-red-500 bg-red-50/20 text-red-900 dark:text-red-200'
                            : 'border-slate-300 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#161616] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-900 dark:focus:border-[#00E5FF] focus:bg-white dark:focus:bg-[#161616]'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                      <span className="text-[11px] text-red-500 font-medium mt-1 block">
                        {resetFormik.errors.newPassword}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...resetFormik.getFieldProps('confirmPassword')}
                        className={`w-full pl-9 pr-10 py-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                          resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword
                            ? 'border-red-500 bg-red-50/20 text-red-900 dark:text-red-200'
                            : 'border-slate-300 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#161616] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-900 dark:focus:border-[#00E5FF] focus:bg-white dark:focus:bg-[#161616]'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                      <span className="text-[11px] text-red-500 font-medium mt-1 block">
                        {resetFormik.errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  {/* Password Strength Checklist */}
                  <div className="p-3.5 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200 dark:border-[#2C2C2E] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>Password Strength:</span>
                      <span
                        className={
                          passwordStrength.score >= 5
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : passwordStrength.score >= 3
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-400'
                        }
                      >
                        {passwordStrength.score >= 5
                          ? 'Strong'
                          : passwordStrength.score >= 3
                            ? 'Medium'
                            : 'Weak'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
                      >
                        <span>{passwordStrength.checks.length ? '✓' : '○'}</span>
                        <span>6+ Characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
                      >
                        <span>{passwordStrength.checks.uppercase ? '✓' : '○'}</span>
                        <span>Uppercase Letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
                      >
                        <span>{passwordStrength.checks.lowercase ? '✓' : '○'}</span>
                        <span>Lowercase Letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
                      >
                        <span>{passwordStrength.checks.number ? '✓' : '○'}</span>
                        <span>Number (0-9)</span>
                      </div>
                      <div
                        className={`col-span-2 flex items-center gap-1 ${passwordStrength.checks.special ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
                      >
                        <span>{passwordStrength.checks.special ? '✓' : '○'}</span>
                        <span>Special Character (!@#$%)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || passwordStrength.score < 5}
                    className="w-full min-h-[46px] py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-[#00E5FF] dark:hover:bg-[#38e1ff] text-white dark:text-[#121212] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Reset Password & Finish</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 4: SUCCESS CONFIRMATION ───────────────────────────── */}
            {step === 'success' && (
              <div className="space-y-6 text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Password Reset Complete!
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Your password has been successfully updated. You can now log into your store
                    using your new credentials.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full min-h-[46px] py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-[#00E5FF] dark:hover:bg-[#38e1ff] text-white dark:text-[#121212] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer Security Note */}
          <div className="pt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-[#2C2C2E] mt-6">
            🔒 Protected by 256-bit TLS encryption & session token security.
          </div>
        </div>
      </div>
    </div>
  );
};
