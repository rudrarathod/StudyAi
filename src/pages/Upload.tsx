import React, { useState } from "react";
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up the PDF.js worker using the local file via Vite's ?url import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("private");

  const { addNote } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        if (droppedFile.size > 5 * 1024 * 1024) {
          alert("File is too large. Please upload files smaller than 5MB to ensure processing works.");
          return;
        }
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.split('.')[0]);
      } else {
        alert("Please upload only PDF files.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        if (selectedFile.size > 5 * 1024 * 1024) {
          alert("File is too large. Please upload files smaller than 5MB to ensure processing works.");
          return;
        }
        setFile(selectedFile);
        if (!title) setTitle(selectedFile.name.split('.')[0]);
      } else {
        alert("Please upload only PDF files.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !subject || !user) return;
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      let content = "";
      let fileData = "";
      let mimeType = file.type;
      
      // Read file as base64 for Gemini and rendering
      const base64Promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extract just the base64 part
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        mimeType = 'application/pdf';
        setUploadProgress(30);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
          
          // Update progress based on pages parsed
          setUploadProgress(30 + Math.floor((i / pdf.numPages) * 40));
        }
        content = fullText;
        fileData = await base64Promise;
      } else if (file.type.includes('text')) {
        content = await file.text();
        setUploadProgress(90);
      } else {
        content = `This is a simulated extraction of the file: ${file.name}.\n\nIn a real application, this would be parsed from the PDF or DOCX file using a backend service or a client-side library like pdf.js.\n\nFor now, you can chat with this note, but the AI will only know this placeholder text unless you uploaded a .txt file.`;
        setUploadProgress(90);
      }

      setUploadProgress(100);
      
      // Check for Firestore document size limit (1MB roughly)
      // Base64 encoding + text content + metadata
      const estimatedSize = (fileData.length) + (content.length * 2); // 2 bytes per char for UTF-16 in JS strings
      const FIREBASE_LIMIT = 1000000; // Leave some buffer under 1,048,576

      if (estimatedSize > FIREBASE_LIMIT) {
        const discardPDF = confirm(
          "This file's content plus the original PDF data exceeds Firestore's 1MB limit. " +
          "Would you like to discard the original PDF and keep only the extracted text? " +
          "This will allow all AI features to work, but you won't be able to view the original PDF here."
        );
        
        if (discardPDF) {
          fileData = "";
          // Also truncate content if it's still way too big
          if (content.length * 2 > FIREBASE_LIMIT) {
            content = content.substring(0, FIREBASE_LIMIT / 2 - 1000) + "... [Truncated due to size limit]";
          }
        } else {
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }
      }

      setTimeout(async () => {
        setIsUploading(false);
        
        const newNote = {
          id: Date.now().toString(),
          title,
          subject,
          content,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          author: user.displayName || "Anonymous",
          userId: user.uid,
          date: new Date().toISOString(),
          isPublic: visibility === "public",
          fileData: fileData || undefined,
          mimeType: mimeType || undefined
        };
        
        await addNote(newNote);
        navigate(`/note/${newNote.id}`);
      }, 500);

    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Failed to parse the file. Please try again or upload a different file.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Material</h1>
        <p className="text-[var(--muted-foreground)]">Add new PDFs to your library.</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors",
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/50"
            )}
          >
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
            />
            <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center">
              <div className="mb-4 rounded-full bg-[var(--primary)]/10 p-4 text-[var(--primary)]">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="mb-1 font-semibold">Click to upload or drag and drop</h3>
              <p className="text-sm text-[var(--muted-foreground)]">PDF only (max. 1MB recommended for Firestore)</p>
            </label>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <File className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{file.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!isUploading && uploadProgress !== 100 && (
                <button
                  onClick={() => setFile(null)}
                  className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {uploadProgress === 100 && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full bg-[var(--primary)] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Data Structures - Week 4 Notes"
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject *</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select a subject...</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Networking">Networking</option>
                <option value="Database Systems">Database Systems</option>
                <option value="AI & ML">AI & ML</option>
                <option value="ETC">ETC</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Visibility</label>
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="private">Private (Only me)</option>
                <option value="public">Public (Anyone)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags separated by commas"
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button 
            onClick={() => navigate(-1)}
            className="rounded-full px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title || !subject || isUploading || uploadProgress === 100}
            className="rounded-full bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadProgress === 100 ? "Uploaded" : isUploading ? "Uploading..." : "Upload Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
