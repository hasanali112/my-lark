"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function VerifyAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiFetch("/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          skipAuthRefresh: true,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }

        if (typeof window !== "undefined") {
          const accessToken = data.data?.access_token || data.access_token;
          const refreshToken = data.data?.refresh_token || data.refresh_token;

          if (accessToken) {
            localStorage.setItem("auth_token", accessToken);
          }
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
        }
        setStatus("success");
        setMessage("Your account has been verified!");

        // Redirect to chat after a brief moment
        setTimeout(() => {
          router.push("/community/chat");
        }, 1500);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Something went wrong during verification.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="text-center space-y-6">
      {status === "loading" && (
        <div className="space-y-6">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Verifying Account
            </h2>
            <p className="text-text-secondary">
              Please wait while we verify your email...
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
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
            <h2 className="text-2xl font-bold text-text-primary">Success!</h2>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-text-secondary text-sm">
              Redirecting you to chat...
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Verification Failed
            </h2>
            <p className="text-red-600 font-medium">{message}</p>
          </div>
          <div className="space-y-4 pt-4">
            <Link href="/auth/register" className="block">
              <Button variant="outline" className="w-full">
                Try Registering Again
              </Button>
            </Link>
            <Link
              href="/auth/login"
              className="block text-sm text-text-secondary hover:text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyAccountContent />
    </Suspense>
  );
}
