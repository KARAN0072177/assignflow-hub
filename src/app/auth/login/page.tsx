"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  GraduationCap, 
  BookOpen,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
        return;
      }

      // 🔑 Fetch current user to know role
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meRes.ok || !meData.user) {
        setError("Failed to load user");
        return;
      }

      // 🔀 Role-based redirect
      if (meData.user.role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-white">
              Welcome Back
            </h1>
            <p className="text-blue-100 text-center text-sm mt-1">
              Sign in to your college account
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your college email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:shadow"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In to Account</span>
                  </>
                )}
              </button>

              {/* Demo Accounts Hint */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Demo Accounts
                </p>
                <p className="text-xs text-blue-600">
                  Student: student@college.edu • Teacher: teacher@college.edu
                </p>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">New to platform?</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <button
                onClick={() => router.push("/auth/register")}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors group"
                disabled={loading}
              >
                <span>Create a new account</span>
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => router.push("/privacy")}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => router.push("/terms")}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Help Center
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              © {new Date().getFullYear()} College Portal. All rights reserved.
            </p>
          </div>
        </div>

        {/* Role-based Login Hint */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Student Login</p>
                <p className="text-xs text-gray-600">Access courses & assignments</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Teacher Login</p>
                <p className="text-xs text-gray-600">Manage classes & grades</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}