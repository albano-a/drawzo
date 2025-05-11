// src/storage.ts

import { supabase } from "./supabase";

export const uploadDrawing = async (file: File, userId: string) => {
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("drawings")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading file:", error.message);
    return null;
  }
  return data?.path;
};
