// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { LogOut, User, Mail, AtSign, Edit2, X } from "lucide-react";
// interface ProfileProps {
//   isCollapsed: boolean;
// }
// interface UserType{
//   id:string;
//   name:string;
//   username:string;
//   profilePic?:string | null;
//   email:string;
// }
// export default function Profile({ isCollapsed }: ProfileProps) {
//   const [user, setUser] = useState<UserType|null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//   });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(data => {
//         setUser(data.user);
//         setFormData({
//           name: data.user.name || "",
//           username: data.user.username || "",
//           email: data.user.email || "",
//         });
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//     window.location.href = "/login";
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     const token = localStorage.getItem("token");
    
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/update`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//         setIsEditing(false);
//       } else {
//         console.error("Failed to update profile");
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-4 border-t border-gray-800">
//         {isCollapsed ? (
//           <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse mx-auto" />
//         ) : (
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
//             <div className="flex-1 space-y-2">
//               <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
//               <div className="h-2 bg-gray-800 rounded animate-pulse w-1/2" />
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="p-4 border-t border-gray-800">
//         {isCollapsed ? (
//           <button
//             onClick={() => window.location.href = "/login"}
//             className="w-full p-2 hover:bg-gray-800 rounded transition-colors flex items-center justify-center"
//             title="Sign In"
//           >
//             <User className="w-5 h-5 text-gray-400" />
//           </button>
//         ) : (
//           <Button 
//             onClick={() => window.location.href = "/login"}
//             className="w-full bg-blue-600 hover:bg-blue-700"
//             variant="outline"
//           >
//             <User className="w-4 h-4 mr-2" />
//             Sign In
//           </Button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="border-t border-gray-800 bg-gray-900">
//         {/* Collapsed View - Avatar Only */}
//         {isCollapsed ? (
//           <div className="p-4 flex justify-center">
//             <button
//               onClick={() => setIsEditing(true)}
//               className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-blue-500 transition-all"
//               title={user.name}
//             >
//               {user.profilePic ? (
//                 <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" />
//               ) : (
//                 user.name?.charAt(0).toUpperCase() || "U"
//               )}
//             </button>
//           </div>
//         ) : (
//           <>
//             {/* Expanded View - Compact */}
//             <div 
//               className="p-4 cursor-pointer hover:bg-gray-800 transition-colors"
//               onClick={() => setIsExpanded(!isExpanded)}
//             >
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold">
//                   {user.profilePic ? (
//                     <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" />
//                   ) : (
//                     user.name?.charAt(0).toUpperCase() || "U"
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-100 truncate">
//                     {user.name}
//                   </p>
//                   <p className="text-xs text-gray-400 truncate">
//                     {user.email}
//                   </p>
//                 </div>
//                 <svg 
//                   className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
//                   fill="none" 
//                   stroke="currentColor" 
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>
//             </div>

//             {/* Expanded Details */}
//             {isExpanded && (
//               <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-center gap-2 text-gray-400">
//                     <AtSign className="w-3.5 h-3.5" />
//                     <span className="truncate">{user.username}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-gray-400">
//                     <Mail className="w-3.5 h-3.5" />
//                     <span className="truncate">{user.email}</span>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-2">
//                   <button
//                     className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded text-sm transition-colors flex items-center justify-center gap-2"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setIsEditing(true);
//                     }}
//                   >
//                     <Edit2 className="w-3.5 h-3.5" />
//                     Edit
//                   </button>
//                   <button
//                     className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded text-sm transition-colors flex items-center justify-center gap-2"
//                     onClick={handleLogout}
//                   >
//                     <LogOut className="w-3.5 h-3.5" />
//                     Log out
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Edit Panel - Slides in from right */}
//       {isEditing && (
//         <>
//           {/* Backdrop */}
//           <div 
//             className="fixed inset-0 bg-black/70 z-40 transition-opacity"
//             onClick={() => setIsEditing(false)}
//           />
          
//           {/* Side Panel */}
//           <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-800">
//             <div className="h-full flex flex-col">
//               {/* Header */}
//               <div className="flex items-center justify-between p-6 border-b border-gray-800">
//                 <h2 className="text-xl font-semibold text-gray-100">Edit Profile</h2>
//                 <button
//                   onClick={() => setIsEditing(false)}
//                   className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-100"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Content */}
//               <div className="flex-1 overflow-y-auto p-6">
//                 <div className="space-y-6">
//                   {/* Avatar Section */}
//                   <div className="flex flex-col items-center gap-4">
//                     <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold text-3xl">
//                       {user.profilePic ? (
//                         <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" />
//                       ) : (
//                         user.name?.charAt(0).toUpperCase() || "U"
//                       )}
//                     </div>
//                     <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded transition-colors text-sm">
//                       Change Photo
//                     </button>
//                   </div>

//                   {/* Form Fields */}
//                   <div className="space-y-4">
//                     <div>
//                       <label className="text-sm font-medium text-gray-100 mb-2 block">
//                         Name
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
//                         placeholder="Your name"
//                       />
//                     </div>

//                     <div>
//                       <label className="text-sm font-medium text-gray-100 mb-2 block">
//                         Username
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.username}
//                         onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                         className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
//                         placeholder="@username"
//                       />
//                     </div>

//                     <div>
//                       <label className="text-sm font-medium text-gray-100 mb-2 block">
//                         Email
//                       </label>
//                       <input
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                         className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
//                         placeholder="your@email.com"
//                       />
//                     </div>

//                     <div>
//                       <label className="text-sm font-medium text-gray-400 mb-2 block">
//                         User ID
//                       </label>
//                       <input
//                         type="text"
//                         value={user.id}
//                         disabled
//                         className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-500 cursor-not-allowed"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="p-6 border-t border-gray-800 space-y-3">
//                 <button
//                   className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   onClick={handleSave}
//                   disabled={saving}
//                 >
//                   {saving ? "Saving..." : "Save Changes"}
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors"
//                   onClick={() => {
//                     setFormData({
//                       name: user.name || "",
//                       username: user.username || "",
//                       email: user.email || "",
//                     });
//                     setIsEditing(false);
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// }