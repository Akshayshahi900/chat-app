"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Correct import for App Router

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize router

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        console.log("Login successful:", data);
        console.log(` token is ${data.token}`);
        
        // Redirect to profile page (you can change this to /chat later)
        router.push("/profile");
      } else {
        console.error("Login failed:", data.message);
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-md p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-primary">Log in</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            className="rounded-md border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            className="rounded-md border border-border bg-input px-4py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button 
            type="submit" 
            className="mt-2 w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        
        {/* Optional: Add a link to signup page */}
        <p className="text-center mt-4 text-gray-400">
          Don't have an account?{" "}
          <button 
            onClick={() => router.push("/signup")}
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </main>
  );
}