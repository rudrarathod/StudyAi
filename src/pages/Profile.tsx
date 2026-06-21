import React, { useState } from "react";
import { User, Mail, BookOpen, Layers, CheckSquare, LogOut, Bell, Shield, Moon, Sun, Key } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export function Profile() {
  const { notes, flashcards, currentQuiz, userProfile, updateUserProfile } = useAppContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.displayName || userProfile.name, email: user?.email || userProfile.email });
  
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [isKeySaved, setIsKeySaved] = useState(false);

  const handleSaveGeminiKey = () => {
    localStorage.setItem("GEMINI_API_KEY", geminiKey.trim());
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    try {
      if (user) {
        // Update auth profile
        await updateProfile(user, { displayName: editForm.name });
        
        // Update firestore document
        await updateDoc(doc(db, 'users', user.uid), {
          name: editForm.name,
          email: editForm.email
        });
      }
      updateUserProfile({ name: editForm.name, email: editForm.email });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    await logout();
    setShowSignOutModal(false);
    navigate("/auth");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-[var(--muted-foreground)]">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Left Column: User Info & Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              <User className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold">{user?.displayName || userProfile.name}</h2>
            <div className="mt-1 flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Mail className="h-4 w-4" />
              <span>{user?.email || userProfile.email}</span>
            </div>
            <button 
              onClick={() => {
                setEditForm({ name: userProfile.name, email: userProfile.email });
                setShowEditModal(true);
              }}
              className="mt-6 w-full rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Edit Profile
            </button>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Notes Uploaded</span>
                </div>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Flashcards Created</span>
                </div>
                <span className="font-medium">{flashcards.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                  <CheckSquare className="h-4 w-4" />
                  <span className="text-sm">Quizzes Taken</span>
                </div>
                <span className="font-medium">{currentQuiz ? 1 : 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Account Settings</h3>
            <div className="space-y-1">
              <button 
                onClick={() => {
                  setEditForm({ name: userProfile.name, email: userProfile.email });
                  setShowEditModal(true);
                }}
                className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--muted)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Personal Information</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Update your name and email</p>
                  </div>
                </div>
              </button>
              
              <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--muted)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Password & Security</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Manage your password</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Preferences</h3>
            <div className="space-y-1">
              <button 
                onClick={() => updateUserProfile({ notificationsEnabled: !userProfile.notificationsEnabled })}
                className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--muted)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {userProfile.notificationsEnabled ? "On" : "Off"}
                    </p>
                  </div>
                </div>
                <div className={`h-5 w-9 rounded-full transition-colors ${userProfile.notificationsEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--muted-foreground)]'} relative`}>
                  <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${userProfile.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </button>
              
              <button 
                onClick={() => updateUserProfile({ darkMode: !userProfile.darkMode })}
                className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--muted)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
                    {userProfile.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Appearance</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {userProfile.darkMode ? "Dark Mode" : "Light Mode"}
                    </p>
                  </div>
                </div>
                <div className={`h-5 w-9 rounded-full transition-colors ${userProfile.darkMode ? 'bg-[var(--primary)]' : 'bg-[var(--muted-foreground)]'} relative`}>
                  <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${userProfile.darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </button>

              <div className="p-3 border-t border-[var(--border)] mt-2">
                <p className="text-sm font-medium mb-3">Color Theme</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'default', label: 'Default', color: 'bg-indigo-500' },
                    { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-pink-500' },
                    { id: 'tropical', label: 'Tropical', color: 'bg-teal-500' },
                    { id: 'rose', label: 'Rose', color: 'bg-rose-500' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateUserProfile({ theme: theme.id as any })}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all border",
                        userProfile.theme === theme.id 
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" 
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                      )}
                    >
                      <div className={cn("h-2 w-2 rounded-full", theme.color)}></div>
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-4 font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" />
              AI Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--muted-foreground)]">Gemini API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Paste your Gemini API Key here"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <button
                    onClick={handleSaveGeminiKey}
                    className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--primary)]/90 active:scale-95 shrink-0"
                  >
                    {isKeySaved ? "Saved!" : "Save"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Your key is stored only in your local browser storage. Get a free API Key from the{" "}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--primary)] font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    Google AI Studio
                  </a>.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowSignOutModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="rounded-lg px-4 py-2 font-medium hover:bg-[var(--muted)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirm Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={() => setShowSignOutModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[var(--card)] p-6 shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Sign Out?</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowSignOutModal(false)}
                className="rounded-lg px-4 py-2 font-medium hover:bg-[var(--muted)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSignOut}
                className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
