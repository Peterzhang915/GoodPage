"use client";

import React, { useEffect, useState } from "react";
import PhotoGallery from "@/components/gallery/PhotoGallery";
import { themeColors } from "@/styles/theme";
import type { GalleryImage } from "@/lib/types";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      // 只请求 show_in_albums=true 的图片
      const res = await fetch("/api/gallery/photos?category=Albums&include_hidden=false");
      const data = await res.json();
      if (data.success) setImages(data.data);
      setLoading(false);
    }
    fetchImages();
  }, []);

  return (
    <div className="">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1
          className={`text-3xl md:text-4xl font-serif font-bold mb-8 border-b select-none pb-3 ${themeColors.textColorPrimary}`}
        >
          Lab Photo Gallery
        </h1>
        {/* 只传递可见图片 */}
        <PhotoGallery images={images} loading={loading} />
      </main>
    </div>
  );
}
