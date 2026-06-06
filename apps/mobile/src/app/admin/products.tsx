import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, Category } from "@demo/data";
import { AdminShell } from "../../components/admin/AdminShell";
import { SmartImage } from "../../components/SmartImage";
import { adminApi } from "../../lib/admin";
import { colors, spacing, radius, fontSize, shadow, formatPrice } from "../../theme";

type Draft = Partial<Product> & { _isNew?: boolean };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const products = useQuery({ queryKey: ["admin", "products"], queryFn: adminApi.products });
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: adminApi.categories });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["products"] }); // storefront
    qc.invalidateQueries({ queryKey: ["featured"] });
  };

  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: invalidate,
  });

  const list = (products.data ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <AdminShell title="Products">
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.addBtn} onPress={() => setDraft({ _isNew: true, inStock: true })}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Add product</Text>
        </Pressable>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.th, styles.colProduct]}>Product</Text>
          <Text style={[styles.th, styles.colCat]}>Category</Text>
          <Text style={[styles.th, styles.colPrice]}>Price</Text>
          <Text style={[styles.th, styles.colStock]}>Stock</Text>
          <Text style={[styles.th, styles.colActions]}>Actions</Text>
        </View>

        {products.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ padding: spacing.xl }} />
        ) : list.length === 0 ? (
          <Text style={styles.emptyRow}>No products match "{search}".</Text>
        ) : (
          list.map((p) => (
            <View key={p.id} style={styles.row}>
              <View style={[styles.colProduct, styles.productCell]}>
                <SmartImage source={p} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.productUnit}>{p.unitSize}</Text>
                </View>
              </View>
              <Text style={[styles.td, styles.colCat]} numberOfLines={1}>
                {categories.data?.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}
              </Text>
              <View style={styles.colPrice}>
                <Text style={styles.price}>{formatPrice(p.price)}</Text>
                {p.compareAtPrice ? (
                  <Text style={styles.compareAt}>{formatPrice(p.compareAtPrice)}</Text>
                ) : null}
              </View>
              <View style={styles.colStock}>
                <View style={[styles.stockPill, { backgroundColor: p.inStock ? colors.primarySurface : colors.saleSurface }]}>
                  <Text style={[styles.stockText, { color: p.inStock ? colors.primaryDark : colors.sale }]}>
                    {p.inStock ? "In stock" : "Out"}
                  </Text>
                </View>
              </View>
              <View style={[styles.colActions, styles.actionsCell]}>
                <Pressable style={styles.iconBtn} onPress={() => setDraft({ ...p })}>
                  <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => del.mutate(p.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.sale} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {draft && (
        <ProductEditor
          draft={draft}
          categories={categories.data ?? []}
          onClose={() => setDraft(null)}
          onSaved={() => {
            invalidate();
            setDraft(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function ProductEditor({
  draft,
  categories,
  onClose,
  onSaved,
}: {
  draft: Draft;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Draft>(draft);
  const isNew = !!draft._isNew;

  const save = useMutation({
    mutationFn: async () => {
      const payload: Partial<Product> = {
        name: form.name,
        categoryId: form.categoryId ?? categories[0]?.id,
        price: Number(form.price) || 0,
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        unitSize: form.unitSize || "1 unit",
        image: form.image,
        description: form.description,
        inStock: form.inStock ?? true,
      };
      return isNew ? adminApi.createProduct(payload) : adminApi.updateProduct(form.id!, payload);
    },
    onSuccess: onSaved,
  });

  const set = (k: keyof Draft, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isNew ? "Add product" : "Edit product"}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <Field label="Name">
              <TextInput style={styles.input} value={form.name ?? ""} onChangeText={(v) => set("name", v)} placeholder="e.g. Alphonso Mangoes" placeholderTextColor={colors.textMuted} />
            </Field>

            <View style={styles.formRow}>
              <Field label="Price (₹)" style={{ flex: 1 }}>
                <TextInput style={styles.input} value={String(form.price ?? "")} onChangeText={(v) => set("price", v)} keyboardType="numeric" placeholder="199" placeholderTextColor={colors.textMuted} />
              </Field>
              <Field label="Compare-at (₹)" style={{ flex: 1 }}>
                <TextInput style={styles.input} value={String(form.compareAtPrice ?? "")} onChangeText={(v) => set("compareAtPrice", v)} keyboardType="numeric" placeholder="optional" placeholderTextColor={colors.textMuted} />
              </Field>
            </View>

            <Field label="Unit / size">
              <TextInput style={styles.input} value={form.unitSize ?? ""} onChangeText={(v) => set("unitSize", v)} placeholder="e.g. 1 kg box" placeholderTextColor={colors.textMuted} />
            </Field>

            <Field label="Category">
              <View style={styles.chips}>
                {categories.map((c) => {
                  const active = (form.categoryId ?? categories[0]?.id) === c.id;
                  return (
                    <Pressable key={c.id} onPress={() => set("categoryId", c.id)} style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.emoji} {c.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Image URL">
              <TextInput style={styles.input} value={form.image ?? ""} onChangeText={(v) => set("image", v)} placeholder="https://…" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
            </Field>

            <Field label="Description">
              <TextInput style={[styles.input, styles.textarea]} value={form.description ?? ""} onChangeText={(v) => set("description", v)} placeholder="Short description…" placeholderTextColor={colors.textMuted} multiline />
            </Field>

            <Pressable style={styles.stockToggle} onPress={() => set("inStock", !(form.inStock ?? true))}>
              <Ionicons name={form.inStock ?? true ? "checkbox" : "square-outline"} size={22} color={colors.primary} />
              <Text style={styles.stockToggleText}>In stock</Text>
            </Pressable>

            {save.isError && <Text style={styles.error}>{(save.error as Error).message}</Text>}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, save.isPending && { opacity: 0.7 }]} onPress={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveText}>{isNew ? "Create product" : "Save changes"}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text, outlineStyle: "none" } as any,
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  addBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.sm },

  table: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadow.soft,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerRow: { backgroundColor: colors.surfaceAlt },
  th: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.3, textTransform: "uppercase" },
  td: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  emptyRow: { padding: spacing.xl, textAlign: "center", color: colors.textMuted },

  colProduct: { flex: 3 },
  colCat: { flex: 2 },
  colPrice: { flex: 1.2 },
  colStock: { flex: 1.2 },
  colActions: { width: 90 },

  productCell: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  thumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  productName: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  productUnit: { fontSize: fontSize.xs, color: colors.textMuted },
  price: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  compareAt: { fontSize: fontSize.xs, color: colors.textMuted, textDecorationLine: "line-through" },
  stockPill: { alignSelf: "flex-start", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  stockText: { fontSize: 11, fontWeight: "800" },
  actionsCell: { flexDirection: "row", gap: spacing.xs },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  modal: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadow.floating,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text },
  form: { padding: spacing.lg, gap: spacing.lg },
  formRow: { flexDirection: "row", gap: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    outlineStyle: "none",
  } as any,
  textarea: { minHeight: 70, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  chipText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark },
  stockToggle: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stockToggleText: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  error: { color: colors.sale, fontSize: fontSize.sm, fontWeight: "600" },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cancelBtn: { paddingHorizontal: spacing.lg, paddingVertical: 11, borderRadius: radius.md },
  cancelText: { fontSize: fontSize.md, fontWeight: "700", color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 11, borderRadius: radius.md, minWidth: 140, alignItems: "center" },
  saveText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
