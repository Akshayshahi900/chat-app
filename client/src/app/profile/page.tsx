"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-md p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-primary">
          Your Profile
        </h1>

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : user ? (
          <div className="flex flex-col gap-4">
            <p className="text-gray-300 text-center">
              Welcome, <span className="font-medium text-foreground">{user.name}</span>
            </p>
            <div className="space-y-2">
              <p className="text-gray-400">Email: {user.email}</p>
              <p className="text-gray-400">Username: {user.username}</p>
              <p className="text-gray-400">User ID: {user.id}</p>
              <p className="text-gray-400">Profile Picture: {user.profilePic ? "Uploaded" : "None"}</p>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => {
                localStorage.removeItem("token");
                setUser(null);
                // Optional: redirect to login page
                // window.location.href = "/login";
              }}
            >
              Log out
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Not logged in</p>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}