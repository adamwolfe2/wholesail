import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const levels = await prisma.inventoryLevel.findMany({
      select: { productId: true, quantityOnHand: true },
      where: { quantityOnHand: { lte: 5, gt: 0 } }, // only return low-stock items
    })
    const map: Record<string, number> = {}
    for (const l of levels) {
      map[l.productId] = l.quantityOnHand
    }
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}
