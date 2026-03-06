"use client";

import React, { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage(null);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/resend-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend email");
      }

      setResendMessage({
        type: "success",
        text: "Verification email resent successfully!",
      });
    } catch (err: any) {
      setResendMessage({ type: "error", text: err.message });
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Check your email
          </h2>
          <p className="text-text-secondary">
            We've sent a verification link to <strong>{formData.email}</strong>
          </p>
        </div>

        <div className="space-y-4 pt-4">
          {resendMessage && (
            <p
              className={`text-sm ${resendMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {resendMessage.text}
            </p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Resending..." : "Resend Verification Email"}
          </Button>
          <Link
            href="/auth/login"
            className="block text-sm text-text-secondary hover:text-primary hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Account...
          </div>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
