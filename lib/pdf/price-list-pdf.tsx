import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 48,
    backgroundColor: "#F9F7F4",
    color: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 2,
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  orgName: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
    color: "#0A0A0A",
  },
  tierBadge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 3,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 9,
    color: "#71717a",
    textAlign: "right",
    marginTop: 2,
  },
  divider: {
    borderBottom: "1.5 solid #0A0A0A",
    marginBottom: 20,
  },
  thinDivider: {
    borderBottom: "1 solid #E5E1DB",
    marginBottom: 14,
    marginTop: 4,
  },
  categoryHeader: {
    backgroundColor: "#0A0A0A",
    padding: "7 12",
    marginBottom: 0,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryHeaderText: {
    color: "#F9F7F4",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    flex: 1,
  },
  tableColumnHeaders: {
    flexDirection: "row",
    padding: "5 12",
    borderBottom: "1 solid #E5E1DB",
    backgroundColor: "#F0EDE8",
  },
  colHeaderText: {
    fontSize: 8,
    color: "#71717a",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: "7 12",
    borderBottom: "1 solid #E5E1DB",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "7 12",
    borderBottom: "1 solid #E5E1DB",
    backgroundColor: "#FDFCFA",
  },
  cell: {
    fontSize: 9,
    color: "#0A0A0A",
  },
  cellMuted: {
    fontSize: 9,
    color: "#71717a",
    fontStyle: "italic",
  },
  cellGold: {
    fontSize: 9,
    color: "#B8860B",
    fontFamily: "Helvetica-Bold",
  },
  // column widths
  colProduct: { flex: 4 },
  colUnit: { flex: 1.5, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colYourPrice: { flex: 1.8, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTop: "1 solid #E5E1DB",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#C8C0B4",
  },
  noteBox: {
    marginTop: 24,
    padding: "10 12",
    border: "1 solid #E5E1DB",
  },
  noteText: {
    fontSize: 8,
    color: "#71717a",
    lineHeight: 1.5,
  },
})

interface PriceListProduct {
  name: string
  unit: string
  price: number | null // null = market rate
  category: string
  marketRate: boolean
}

interface PriceListPDFProps {
  orgName: string
  tier: "NEW" | "REPEAT" | "VIP"
  generatedAt: string
  discounts: { category: string; discountPct: number }[]
  products: PriceListProduct[]
}

const TIER_DISPLAY: Record<string, string> = {
  NEW: "New Partner",
  REPEAT: "Repeat Partner",
  VIP: "VIP Partner",
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function applyDiscount(
  price: number,
  category: string,
  discounts: { category: string; discountPct: number }[]
): number {
  // Category-specific discount takes precedence over "All Categories"
  const categoryDiscount = discounts.find((d) => d.category === category)
  const allDiscount = discounts.find((d) => d.category === "All Categories")
  const discount = categoryDiscount ?? allDiscount
  if (!discount || discount.discountPct === 0) return price
  return price * (1 - discount.discountPct / 100)
}

export function PriceListPDF({
  orgName,
  tier,
  generatedAt,
  discounts,
  products,
}: PriceListPDFProps) {
  // Group products by category
  const categoryMap = new Map<string, PriceListProduct[]>()
  for (const product of products) {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, [])
    }
    categoryMap.get(product.category)!.push(product)
  }

  const categories = Array.from(categoryMap.keys()).sort()

  const tierColor = tier === "VIP" ? "#B8860B" : tier === "REPEAT" ? "#1E40AF" : "#6B7280"
  const hasAnyDiscount = discounts.length > 0

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Wholesail</Text>
            <Text style={styles.brandSub}>Wholesail</Text>
            <Text style={styles.brandSub}>wholesailhub.com</Text>
            <Text style={styles.brandSub}>orders@wholesailhub.com</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>Wholesale Price List</Text>
            <Text style={styles.orgName}>{orgName}</Text>
            <Text style={{ ...styles.tierBadge, color: tierColor }}>
              {TIER_DISPLAY[tier] ?? tier}
            </Text>
            <Text style={styles.dateText}>Generated {generatedAt}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Table column headers row */}
        <View style={styles.tableColumnHeaders}>
          <Text style={{ ...styles.colHeaderText, ...styles.colProduct }}>Product</Text>
          <Text style={{ ...styles.colHeaderText, ...styles.colUnit }}>Unit</Text>
          <Text style={{ ...styles.colHeaderText, ...styles.colPrice }}>List Price</Text>
          <Text style={{ ...styles.colHeaderText, ...styles.colYourPrice }}>
            Your Price{hasAnyDiscount ? " *" : ""}
          </Text>
        </View>

        {/* Products grouped by category */}
        {categories.map((category) => {
          const categoryProducts = categoryMap.get(category) ?? []
          return (
            <View key={category}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryHeaderText}>{category}</Text>
              </View>
              {categoryProducts.map((product, i) => {
                const yourPrice =
                  product.marketRate || product.price === null
                    ? null
                    : applyDiscount(product.price, category, discounts)
                const isDiscounted =
                  yourPrice !== null &&
                  product.price !== null &&
                  yourPrice < product.price

                return (
                  <View
                    key={product.name}
                    style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <Text style={{ ...styles.cell, ...styles.colProduct }}>{product.name}</Text>
                    <Text style={{ ...styles.cell, ...styles.colUnit }}>{product.unit}</Text>
                    <Text style={{ ...styles.cell, ...styles.colPrice }}>
                      {product.marketRate || product.price === null
                        ? "Market Rate"
                        : formatCurrency(product.price)}
                    </Text>
                    <Text
                      style={{
                        ...(isDiscounted ? styles.cellGold : styles.cell),
                        ...styles.colYourPrice,
                      }}
                    >
                      {product.marketRate || yourPrice === null
                        ? "Market Rate"
                        : formatCurrency(yourPrice)}
                    </Text>
                  </View>
                )
              })}
            </View>
          )
        })}

        {/* Notes */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            * Prices reflect your {TIER_DISPLAY[tier] ?? tier} tier discount.
            Market rate items are priced at the time of order — contact your rep for current rates.
            All prices are subject to change without notice. This price list is for wholesale ordering only.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Wholesail · Wholesale Price List
          </Text>
          <Text style={styles.footerText}>Confidential — not for redistribution</Text>
        </View>
      </Page>
    </Document>
  )
}
