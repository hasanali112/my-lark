import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              Welcome to <span className="text-gradient">MyLark</span>
            </h1>
            <p className="text-text-secondary">
              Connect with your team in real-time
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
