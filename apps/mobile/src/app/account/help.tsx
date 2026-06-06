import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { AccountHeader } from "../../components/AccountHeader";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH } from "../../theme";

const FAQS = [
  { q: "How fast is delivery?", a: "Most orders arrive in 25–35 minutes. You'll see a live ETA and tracker on your order screen once you check out." },
  { q: "What are the delivery charges?", a: "Delivery is ₹29 on orders under ₹499, and free above that. Charges are always shown before you pay." },
  { q: "Which payment methods do you accept?", a: "UPI, credit/debit cards, and cash on delivery. You can manage saved methods under Profile → Payment methods." },
  { q: "Can I change my delivery address?", a: "Yes — add or edit addresses under Profile → Delivery addresses, or pick a different one at checkout." },
  { q: "What if an item is out of stock?", a: "We'll notify you and suggest a replacement, or refund that item instantly to your original payment method." },
  { q: "How do I track my order?", a: "Open the order from your Profile → Recent orders to see a live status tracker from Confirmed to Delivered." },
  { q: "What is your return policy?", a: "Not happy with a fresh item? Report it within 24 hours from the order screen and we'll refund or replace it, no questions asked." },
];

const CONTACT: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }[] = [
  { icon: "chatbubbles-outline", title: "Chat with us", sub: "Avg. reply in 2 min" },
  { icon: "mail-outline", title: "Email support", sub: "support@freshcart.app" },
  { icon: "call-outline", title: "Call us", sub: "1800-200-FRESH · 8am–10pm" },
];

export default function HelpScreen() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.root}>
      <AccountHeader title="Help & support" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
          {/* Contact options */}
          <View style={styles.contactRow}>
            {CONTACT.map((c) => (
              <Pressable key={c.title} style={({ pressed }) => [styles.contactCard, pressed && styles.pressed]}>
                <View style={styles.contactIcon}>
                  <Ionicons name={c.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.contactTitle}>{c.title}</Text>
                <Text style={styles.contactSub}>{c.sub}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Frequently asked questions</Text>
          <View style={styles.faqCard}>
            {FAQS.map((f, i) => {
              const expanded = open === i;
              return (
                <View key={i} style={[styles.faqItem, i < FAQS.length - 1 && styles.faqBorder]}>
                  <Pressable style={styles.faqHead} onPress={() => setOpen(expanded ? null : i)}>
                    <Text style={styles.faqQ}>{f.q}</Text>
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
                  </Pressable>
                  {expanded && <Text style={styles.faqA}>{f.a}</Text>}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { paddingVertical: spacing.lg, alignItems: "center", paddingBottom: 40 },
  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg },
  contactRow: { flexDirection: "row", gap: spacing.md },
  contactCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.borderLight, ...shadow.soft },
  contactIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  contactTitle: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text, textAlign: "center" },
  contactSub: { fontSize: 10, color: colors.textMuted, fontWeight: "600", textAlign: "center" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  faqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, overflow: "hidden" },
  faqItem: { padding: spacing.lg },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  faqQ: { flex: 1, fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  faqA: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 21, marginTop: spacing.sm },
});
