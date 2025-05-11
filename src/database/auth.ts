// src/auth.ts

import { supabase } from "./supabase";

export const signUpWithEmail = async (email: string, password: string) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.error("Error signing up:", error.message);
    return null;
  }
  return user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Error signing in:", error.message);
    return null;
  }
  return user;
};
