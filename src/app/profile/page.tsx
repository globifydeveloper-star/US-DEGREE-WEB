"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileDashboard from "@/components/userprofile/ProfileDashboard";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protected route: bounce unauthenticated visitors back home (login is a
  // modal triggered from the navbar, so there is no dedicated /login route).
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center py-32">
          <Spin size="large" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFBFD] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-6">
        <ProfileDashboard
          authUser={{
            displayName: user.displayName,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          }}
        />
      </div>
      <Footer />
    </main>
  );
}
