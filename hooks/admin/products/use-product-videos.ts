import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UUID } from "@/types";
import type { VideoItem } from "@/components/admin/products/product-video-manager";

// ─────────────────────────────────────────────────────────────────────────────
// API helpers (langsung fetch, tidak pakai http client agar support FormData besar)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchProductVideos(productId: UUID): Promise<VideoItem[]> {
  const res = await fetch(`/api/admin/products/${productId}/videos`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal memuat video");
  return json.data as VideoItem[];
}

async function uploadProductVideo(
  productId: UUID,
  file: File,
  title?: string,
): Promise<VideoItem> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await fetch(`/api/admin/products/${productId}/videos`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal upload video");
  return json.data as VideoItem;
}

async function deleteProductVideo(videoId: UUID): Promise<void> {
  const res = await fetch(`/api/admin/product-videos/${videoId}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal hapus video");
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useProductVideos(productId: UUID | undefined) {
  return useQuery({
    queryKey: ["admin", "product-videos", productId],
    queryFn: () => fetchProductVideos(productId!),
    enabled: !!productId,
  });
}

export function useUploadProductVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      file,
      title,
    }: {
      productId: UUID;
      file: File;
      title?: string;
    }) => uploadProductVideo(productId, file, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-videos", variables.productId],
      });
    },
  });
}

export function useDeleteProductVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoId,
      productId,
    }: {
      videoId: UUID;
      productId?: UUID;
    }) => deleteProductVideo(videoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-videos", variables.productId],
      });
    },
  });
}
