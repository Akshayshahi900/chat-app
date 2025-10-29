"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, AtSign, Edit2, X } from "lucide-react";
import Image from "next/image";

export default function SidebarProfile({ isCollapsed }: React.PropsWithChildren<{ isCollapsed: boolean }>) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "",
    name: "",
    About: "",
    username: "",
    email: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          About: data.user.About || "",
          profilePic: data.user.profilePic || "",
          username: data.user.username || "",
          email: data.user.email || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.secure_url;
  }

  const updateProfileAPI = async (profileData: {
    name: string;
    About: string;
    profilePic: string;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Profile update failed');
    }
    return response.json();
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size should be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, profilePic: cloudinaryUrl }));
      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const backendData = {
        name: formData.name,
        About: formData.About,
        profilePic: formData.profilePic,
      };

      if (!backendData.name || !backendData.About || !backendData.profilePic) {
        setMessage("All fields are required.");
        setIsSubmitting(false);
        return;
      }

      const result = await updateProfileAPI(backendData);
      setUser(result.user);
      setMessage("Profile updated successfully.");
      setIsEditing(false);
      
    } catch (error) {
      console.error("Profile update failed:", error);
      setMessage(error instanceof Error ? error.message : "Profile update failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      profilePic: user?.profilePic || "",
      name: user?.name || "",
      About: user?.About || "",
      username: user?.username || "",
      email: user?.email || ""
    });
    setMessage("");
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <Button
          onClick={() => (window.location.href = "/login")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <User className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      {isCollapsed ? (
        <div className="border-t border-gray-800 bg-gray-900 flex justify-center py-3">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-semibold cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-800 bg-gray-900">
          <div
            className="p-4 cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {isExpanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <AtSign className="w-3.5 h-3.5" />
                  <span className="truncate">{user.username}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsEditing(false)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 text-gray-100 border-l border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-lg font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Profile Image Upload Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold text-3xl overflow-hidden">
                      {formData.profilePic ? (
                        <img
                          src={formData.profilePic}
                          alt={formData.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || "U"
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-400">Click pen icon to change photo</p>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.includes('success') || message.includes('updated') 
                      ? 'bg-green-900/50 text-green-300 border border-green-800' 
                      : 'bg-red-900/50 text-red-300 border border-red-800'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">About</label>
                    <textarea
                      name="About"
                      value={formData.About}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t border-gray-800 space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploading || !formData.name || !formData.About || !formData.profilePic}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-gray-300 hover:bg-gray-800"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}