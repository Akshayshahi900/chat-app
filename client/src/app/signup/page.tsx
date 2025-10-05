"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
 const [form, setForm] = useState({ 
  name: "", 
  username: "", // Add this
  email: "", 
  password: "" 
});

  // Global change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      console.log(data);

    } catch (err) {
      console.error(err);
    }
    
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-md p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-primary">Sign up</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="rounded-md border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={handleChange}
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="rounded-md border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={handleChange}
          />
        
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="rounded-md border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="rounded-md border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={handleChange}
          />
          <Button type="submit" className="mt-2 w-full" size="lg">
            Sign Up
          </Button>
        </form>
      </div>
    </main>
  );
}
