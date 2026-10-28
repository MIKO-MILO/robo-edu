"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Canvas crop helper ─────────────────────────────────────────────────────────

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: string = "image/jpeg",
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = Math.min(pixelCrop.width, pixelCrop.height, 512);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      mimeType,
      0.9,
    );
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

interface AvatarCropModalProps {
  /** Object URL dari file yang dipilih user */
  imageSrc: string | null;
  mimeType?: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export function AvatarCropModal({
  imageSrc,
  mimeType = "image/jpeg",
  onConfirm,
  onCancel,
  isUploading = false,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return;
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, mimeType);
    onConfirm(blob);
  }

  function handleReset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  return (
    <Dialog open={Boolean(imageSrc)} onOpenChange={(open) => { if (!open && !isUploading) onCancel(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="font-heading text-base font-bold">
            Sesuaikan Foto Profil
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Geser dan zoom untuk memposisikan foto
          </p>
        </DialogHeader>

        {/* ── Crop area ── */}
        <div className="relative w-full aspect-square bg-black/80">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: 0 },
                cropAreaStyle: {
                  border: "3px solid #F5BC00",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                },
              }}
            />
          )}
        </div>

        {/* ── Zoom slider ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-t border-border bg-background">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 accent-primary cursor-pointer"
            aria-label="Zoom"
          />

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reset posisi"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2 px-5 pb-5 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Gunakan Foto
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
