import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProductGrid } from "../../components/ProductGrid";
import { EmptyState, Chip } from "../../components/ui";
import { useSearch } from "../../lib/hooks";
import { colors, spacing, radius, fontSize, shadow, MAX_CONTENT_WIDTH, useLayout } from "../../theme";

const SUGGESTIONS = ["Bananas", "Milk", "Bread", "Eggs", "Coffee", "Avocado", "Chicken", "Paneer"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const layout = useLayout();
  const search = useSearch(query);

  const results = search.data ?? [];
  const showResults = query.trim().length > 0;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={[styles.headerInner, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter }]}>
          {layout.isMobile && <Text style={styles.title}>Search</Text>}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search for groceries…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCorrect={false}
              returnKeyType="search"
              autoFocus={!layout.isMobile}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        <View style={[styles.content, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter }]}>
          {!showResults ? (
            <>
              <Text style={styles.suggestLabel}>Popular searches</Text>
              <View style={styles.suggestWrap}>
                {SUGGESTIONS.map((s) => (
                  <Chip key={s} label={s} onPress={() => setQuery(s)} />
                ))}
              </View>
            </>
          ) : results.length === 0 && !search.isLoading ? (
            <EmptyState
              icon="search-outline"
              title="No results found"
              subtitle={`We couldn't find anything for "${query}". Try another search.`}
            />
          ) : (
            <>
              {!search.isLoading && (
                <Text style={styles.resultCount}>
                  {results.length} result{results.length === 1 ? "" : "s"} for "{query}"
                </Text>
              )}
              <ProductGrid
                products={results}
                loading={search.isLoading}
                cols={layout.gridColumns}
                gap={spacing.lg}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerSafe: { backgroundColor: colors.surface, ...shadow.nav, zIndex: 2 },
  headerInner: {
    width: "100%",
    alignSelf: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: "500" },

  content: { width: "100%", alignSelf: "center", paddingTop: spacing.xl },
  suggestLabel: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  suggestWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },

  resultCount: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
