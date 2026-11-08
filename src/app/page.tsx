"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 shadow-sm">
              <img
                className="h-7 w-7 rounded-lg object-cover cursor-pointer"
                src="https://media.flaticon.com/dist/min/img/home/cards-products-section/circles/animated.png"
                alt="Call-Me"
              />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-gray-900 cursor-pointer">
              Call-Me
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">

            <Button
              onClick={() => router.push("/auth")}
              className="flex-1 sm:flex-none rounded-xl bg-gray-900 px-5 text-white hover:bg-gray-800 cursor-pointer shadow-sm transition"
            >
              Sign Up
            </Button>

            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl border-gray-300 bg-white px-5 text-gray-900 hover:bg-gray-100 cursor-pointer transition"
            >
              Login
            </Button>

          </div>
        </div>
      </header>

      <main className="px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">

        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl">

            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
              Welcome to Call-Me
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Connect with people.
              <span className="block text-gray-500">
                Start conversations today.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Join the Call-Me community and start connecting with
              others today. Create your account and become part of
              the community.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">

              <Button
                onClick={() => router.push("/auth")}
                className="rounded-xl bg-gray-900 px-7 py-6 text-white hover:bg-gray-800 cursor-pointer shadow-md transition"
              >
                Get Started
              </Button>

              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="rounded-xl border-gray-300 bg-white px-7 py-6 text-gray-900 hover:bg-gray-100 cursor-pointer transition"
              >
                Login to Account
              </Button>

            </div>

          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-lg">✓</span>
              </div>

              <h2 className="font-bold text-gray-900">
                Easy to Use
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Simple and clean experience designed for everyone.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-lg">🔒</span>
              </div>

              <h2 className="font-bold text-gray-900">
                Secure
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your account and profile information are protected.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-lg">⚡</span>
              </div>

              <h2 className="font-bold text-gray-900">
                Fast & Responsive
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enjoy a smooth experience across desktop, tablet,
                and mobile.
              </p>
            </div>

          </div>

        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Call-Me. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

