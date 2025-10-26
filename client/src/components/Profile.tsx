"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, AtSign, Edit2, X } from "lucide-react";
import Image from "next/image";
import { profile } from "console";
import { set } from "date-fns";
// import { User } from "../../../../shared/types";

export default function SidebarProfile({ isCollapsed }: React.PropsWithChildren<{ isCollapsed: boolean }>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "", // this to store cloudinary url
    name: "",
    About: "",
  });
  const [saving, setSaving] = useState(false);
  const [isUploading , setIsUploading] = useState(false);
  const [isSubmitting , setIsSubmitting] = useState(false);
  const [message ,setMessage] = useState("");
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

  const updateProfileAPI = async (profileData :{
    name:string;
    About:string;
    profilePic:string;
  })=>{
    const response = await fetch (`${process.env.NeXT_PUBLIC_SERVER_URL}/api/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    
    });
    if (!response.ok) {
      throw new Error('Profile update failed');
    }
    return response.json();
  }


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file) return;

    // validation for file type
    if(!file.type.startsWith("image/")){
      setMessage("Please select a valid image file.");
      return;
    }

    //validatioin file size(max 5mb)
    if(file.size > 5 * 1024 * 1024){
      setMessage("File size should be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try{
      const cloudinaryUrl = await uploadToCloudinary(file);
      setFormData((prev => ({...prev, profilePic: cloudinaryUrl})));
      setMessage("Image uploaded successfully.");
    }
    catch(error){
      console.error("Upload failed:", error);
      setMessage("Image upload failed. Please try again.");
    }
    finally{
      setIsUploading(false);
    }
  };
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name , value } = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    setMessage(""); //clear message on input change
  };


  const handleSubmit = async (e:React.FormEvent) =>{
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try{
      const backendData ={
        name:formData.name,
        About:formData.About,
        profilePic:formData.profilePic,
      };

      //validate required fields 
      if(!backendData.name || !backendData.About || !backendData.profilePic){
        setMessage("All fields are required.");
        setIsSubmitting(false);
        return;
      }
      const result = await updateProfileAPI(backendData);
      setMessage("Profile updated successfully.");

      console.log("Profile updated:", result.user);


    }
    catch(error){
      console.error("Profile update failed:", error);
      setMessage(error instanceof Error ? error.message : "Profile update failed. Please try again.");
    }
    finally{
      setIsSubmitting(false);
    }
  };

  const handleCancel =() =>{
    setFormData({
      profilePic:'',
      name:'',
      About:'',
    });
    setMessage("Changes discarded.");
  }
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
      } else {
        console.error("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
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
          {/* Compact section */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold">
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
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expanded details */}
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

      {/* Edit Profile Panel */}
      {isEditing && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsEditing(false)} />

          <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 text-gray-100 border-l border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-lg font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold text-3xl">
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
                  <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800 hover:bg-gray-700">
                    Change Photo
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-800 space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-gray-300 hover:bg-gray-800"
                  onClick={() => {
                    setFormData({
                      name: user.name || "",
                      username: user.username || "",
                      email: user.email || "",
                    });
                    setIsEditing(false);
                  }}
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
