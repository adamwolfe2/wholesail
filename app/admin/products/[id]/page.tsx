import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PriceHistoryChart } from "./price-history-chart";
import { DistributorAssignmentCard } from "./distributor-assignment";

export const metadata: Metadata = { title: "Product Details" };

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  let product: Awaited<ReturnType<typeof getProduct>> = null;
  let distributors: { id: string; name: string; email: string }[] = [];

  try {
    [product, distributors] = await Promise.all([
      getProduct(id),
      prisma.organization.findMany({
        where: { isDistributor: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      }),
    ]);
  } catch {
    // DB not connected
  }

  if (!product) {
    notFound();
  }

  const currentPrice = Number(product.price);

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#0A0A0A]/50 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04] rounded-none -ml-2"
            >
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Products
              </Link>
            </Button>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
            {product.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className="text-xs border-[#E5E1DB] text-[#0A0A0A]/60"
            >
              {product.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                product.available
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {product.available ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <Button
          asChild
          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none shrink-0"
        >
          <Link href="/admin/products">Edit in Catalog</Link>
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Current Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">
              ${currentPrice.toFixed(2)}
            </div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">{product.unit}</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Category
            </CardTitle>
            <Tag className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold font-serif text-[#0A0A0A]">
              {product.category}
            </div>
            {product.minimumOrder && (
              <p className="text-xs text-[#0A0A0A]/40 mt-1">
                Min order: {product.minimumOrder}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Availability
            </CardTitle>
            {product.available ? (
              <ToggleRight className="h-4 w-4 text-green-500" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-[#C8C0B4]" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-semibold font-serif ${
                product.available ? "text-green-700" : "text-[#0A0A0A]/40"
              }`}
            >
              {product.available ? "Available" : "Unavailable"}
            </div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">
              Updated {format(product.updatedAt, "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Flags
            </CardTitle>
            <Package className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 mt-1">
              {product.marketRate && (
                <Badge
                  variant="outline"
                  className="text-xs border-[#E5E1DB] text-[#0A0A0A]/60"
                >
                  Market Rate
                </Badge>
              )}
              {product.prepayRequired && (
                <Badge
                  variant="outline"
                  className="text-xs border-orange-200 text-orange-700 bg-orange-50"
                >
                  Prepay
                </Badge>
              )}
              {product.coldChainRequired && (
                <Badge
                  variant="outline"
                  className="text-xs border-blue-200 text-blue-700 bg-blue-50"
                >
                  Cold Chain
                </Badge>
              )}
              {!product.marketRate &&
                !product.prepayRequired &&
                !product.coldChainRequired && (
                  <span className="text-xs text-[#0A0A0A]/30">None</span>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {product.description && (
        <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#0A0A0A]/70 whitespace-pre-wrap">
              {product.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Distributor Assignment */}
      <DistributorAssignmentCard
        productId={product.id}
        currentDistributorId={product.distributorOrgId ?? null}
        currentDistributorName={product.distributorOrg?.name ?? null}
        distributors={distributors}
      />

      {/* Price History */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#C8C0B4]" />
            Price History
          </CardTitle>
          <CardDescription className="text-[#0A0A0A]/50">
            Tracked price changes over time. Price edits made from the product
            catalog are recorded automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PriceHistoryChart productId={product.id} currentPrice={currentPrice} />
        </CardContent>
      </Card>
    </div>
  );
}

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      price: true,
      unit: true,
      description: true,
      minimumOrder: true,
      available: true,
      marketRate: true,
      prepayRequired: true,
      coldChainRequired: true,
      sortOrder: true,
      distributorOrgId: true,
      distributorOrg: { select: { name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
}
