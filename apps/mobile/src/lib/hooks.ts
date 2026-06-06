import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchCategory,
  fetchProducts,
  fetchProduct,
  fetchFeatured,
  fetchSearch,
} from "./api";

export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

export const useCategory = (id: string) =>
  useQuery({ queryKey: ["category", id], queryFn: () => fetchCategory(id), enabled: !!id });

export const useProducts = (params?: { category?: string; badge?: string; sort?: string }) =>
  useQuery({ queryKey: ["products", params], queryFn: () => fetchProducts(params) });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ["product", id], queryFn: () => fetchProduct(id), enabled: !!id });

export const useFeatured = () =>
  useQuery({ queryKey: ["featured"], queryFn: fetchFeatured });

export const useSearch = (query: string) =>
  useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.trim().length > 0,
  });
