import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function PDFViewer({ base64Data }: { base64Data: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [base64Data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-3xl aspect-[1/1.4] bg-[var(--muted)] animate-pulse rounded-lg shadow-md flex flex-col items-center justify-center text-[var(--muted-foreground)]">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="font-medium">Loading Document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4" ref={containerRef}>
      {Array.from({ length: numPages }, (_, i) => (
        <PDFPage key={i + 1} pdf={pdf} pageNumber={i + 1} />
      ))}
    </div>
  );
}

function PDFPage({ pdf, pageNumber }: { pdf: pdfjsLib.PDFDocumentProxy | null, pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let renderTask: any = null;
    let isMounted = true;

    const renderPage = async () => {
      try {
        setIsRendering(true);
        const page = await pdf.getPage(pageNumber);
        if (!isMounted) return;
        
        // Calculate scale to fit container width or use a default
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        renderTask = page.render(renderContext as any);
        await renderTask.promise;
        
        if (isMounted) {
          setIsRendering(false);
        }
      } catch (error: any) {
        if (error?.name === 'RenderingCancelledException' || error instanceof pdfjsLib.RenderingCancelledException) {
          // Ignore cancelled renders
        } else {
          console.error(`Error rendering page ${pageNumber}:`, error);
        }
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    // Use a small timeout to prevent React StrictMode from triggering 
    // multiple simultaneous renders on the same canvas
    const timeoutId = setTimeout(() => {
      renderPage();
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber]);

  return (
    <div className={cn(
      "relative bg-white shadow-md rounded-lg overflow-hidden w-full max-w-3xl flex justify-center",
      isRendering ? "aspect-[1/1.4]" : ""
    )}>
      {isRendering && (
        <div className="absolute inset-0 bg-[var(--muted)] animate-pulse flex flex-col items-center justify-center z-10 text-[var(--muted-foreground)]">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm font-medium">Rendering Page {pageNumber}...</p>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className={cn(
          "max-w-full h-auto transition-opacity duration-300",
          isRendering ? "opacity-0 absolute" : "opacity-100 relative"
        )} 
      />
    </div>
  );
}
