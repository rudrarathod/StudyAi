/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { Upload } from "./pages/Upload";
import { NoteViewer } from "./pages/NoteViewer";
import { AIChat } from "./pages/AIChat";
import { Flashcards } from "./pages/Flashcards";
import { Quizzes } from "./pages/Quizzes";
import { Profile } from "./pages/Profile";
import { Auth } from "./pages/Auth";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            } />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="library" element={<Library />} />
              <Route path="upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="note/:id" element={<NoteViewer />} />
              <Route path="chat" element={
                <ProtectedRoute>
                  <AIChat />
                </ProtectedRoute>
              } />
              <Route path="flashcards" element={
                <ProtectedRoute>
                  <Flashcards />
                </ProtectedRoute>
              } />
              <Route path="quizzes" element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

