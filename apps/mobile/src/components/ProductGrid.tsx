import { View } from "react-native";
import type { Product } from "@demo/data";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "./ui";
import { radius } from "../theme";

/** Responsive flex-wrap product grid. `cols` comes from useLayout().gridColumns. */
export function ProductGrid({
  products,
  loading,
  cols,
  gap,
}: {
  products?: Product[];
  loading: boolean;
  cols: number;
  gap: number;
}) {
  const items = loading ? Array.from({ length: cols * 2 }) : products ?? [];
  const widthPct = `${100 / cols}%` as const;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }}>
      {items.map((item, i) => (
        <View
          key={loading ? i : (item as Product).id}
          style={{ width: widthPct, paddingHorizontal: gap / 2, marginBottom: gap }}
        >
          {loading ? (
            <Skeleton style={{ width: "100%", height: 250, borderRadius: radius.lg }} />
          ) : (
            <ProductCard product={item as Product} />
          )}
        </View>
      ))}
    </View>
  );
}
