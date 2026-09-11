"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheckIcon, LockIcon, MailIcon, ArrowRightIcon } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";

  const [form, setForm] = useState({
    email: "admin@roboedu.id",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setErrorMsg(data.error?.message || "Gagal melakukan login admin");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-accent-yellow border-2 border-[#3D2900] shadow-[2px_2px_0px_#3D2900] mb-3">
          <ShieldCheckIcon className="size-6 text-[#3D2900]" />
        </div>
        <h2 className="font-heading text-xl md:text-2xl font-bold uppercase text-foreground">
          Admin Login
        </h2>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Masukkan kredensial administrator untuk mengelola sistem RoboEdu
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl border-2 border-[#3D2900] bg-danger-bg text-danger text-xs font-semibold text-center neo-shadow">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-email"
            className="block font-heading text-xs font-bold uppercase text-foreground"
          >
            Email Admin
          </label>
          <div className="relative">
            <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="admin@roboedu.id"
              className="w-full bg-muted text-foreground border-2 border-[#3D2900] rounded-xl pl-10 pr-4 py-2.5 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="block font-heading text-xs font-bold uppercase text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password admin"
              className="w-full bg-muted text-foreground border-2 border-[#3D2900] rounded-xl pl-10 pr-4 py-2.5 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          id="btn-admin-login"
          type="submit"
          variant="primary"
          size="lg"
          neo
          disabled={isLoading}
          className="w-full uppercase font-body font-bold text-sm mt-2"
        >
          {isLoading ? (
            <>
              <Spinner className="size-4" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Masuk Ke Panel Admin</span>
              <ArrowRightIcon className="size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background font-body">
      <main
        aria-label="Admin Login RoboEdu"
        className="w-full max-w-4xl flex flex-col md:flex-row md:min-h-[550px] bg-card border-2 border-[#3D2900] neo-shadow overflow-hidden rounded-2xl"
      >
        {/* Left Side — Branding Canvas */}
        <div className="w-full md:w-1/2 relative overflow-hidden flex flex-col justify-between bg-accent-soft-blue border-b-2 md:border-b-0 md:border-r-2 border-[#3D2900] p-8 min-h-[260px] md:min-h-0">
          <Image
            src="/images/[Sinergi dan Komitmen Bersama Roboedu Team]Rangkaian profil yang telah ditampilkan merupakan sa.webp"
            alt="RoboEdu Admin Portal"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(36,131,208,0.92) 0%, rgba(36,131,208,0.55) 50%, rgba(36,131,208,0.2) 100%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-20 self-start">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-heading text-xl font-extrabold text-white tracking-tight">
                roboedu
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-white/40 bg-white/20 text-white">
                Admin
              </span>
            </Link>
          </div>

          <div className="relative z-20 self-start mt-auto">
            <p className="text-white/80 font-body text-xs uppercase tracking-widest mb-1">
              Internal Control Panel
            </p>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-sm">
              MANAGE.<br />
              MONITOR.<br />
              CONTROL.
            </h1>
          </div>
        </div>

        {/* Right Side — Form */}
        <Suspense fallback={<div className="w-full md:w-1/2 p-8 flex items-center justify-center"><Spinner /></div>}>
          <AdminLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
