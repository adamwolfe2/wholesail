import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const levels = await prisma.inventoryLevel.findMany({
      select: { productId: true, quantityOnHand: true },
      where: { quantityOnHand: { lte: 5, gt: 0 } }, // only return low-stock items
      take: 500,
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
