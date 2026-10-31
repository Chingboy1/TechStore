import "server-only";
import { cache } from "react";
import { supabase } from "./supabase";

export { formatPrice } from "./format";

// Database dùng group_name / price_note, giao diện cũ dùng group / priceNote
const fromRow = ({ group_name, price_note, ...p }) => ({
  ...p,
  group: group_name,
  priceNote: price_note,
});

export const getProducts = cache(async () => {
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) throw error;
  return data.map(fromRow);
});

export const getProduct = cache(async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
});

export const getCategories = cache(async () => {
  const [{ data, error }, products] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    getProducts(),
  ]);
  if (error) throw error;
  return data.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.slug).length,
  }));
});