import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  User,
  Briefcase,
  Package,
  Thermometer,
  DollarSign,
  CreditCard,
  Truck,
  Users,
  Layers,
  Palette,
  FileText,
  Search,
  CalendarCheck,
} from "lucide-react";
import { IntakeActions } from "./intake-actions";
import { WebsiteIntelligence } from "./website-intelligence";

export const metadata: Metadata = { title: "Intake Details" };
export const dynamic = "force-dynamic";

export default async function AdminIntakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user
    .findUnique({ where: { id: userId }, select: { role: true } })
    .catch(() => null);

  if (!dbUser || !["ADMIN", "OPS"].includes(dbUser.role)) {
    redirect("/");
  }

  const { id } = await params;
  const intake = await getIntakeSubmissionById(id).catch(() => null);
  if (!intake) notFound();

  // Serialize for client components
  const serializedIntake = {
    id: intake.id,
    companyName: intake.companyName,
    shortName: intake.shortName,
    website: intake.website,
    location: intake.location,
    contactName: intake.contactName,
    contactEmail: intake.contactEmail,
    contactPhone: intake.contactPhone,
    contactRole: intake.contactRole,
    annualRevenue: intake.annualRevenue,
    industry: intake.industry,
    productCategories: intake.productCategories,
    skuCount: intake.skuCount,
    coldChain: intake.coldChain,
    currentOrdering: intake.currentOrdering,
    activeClients: intake.activeClients,
    avgOrderValue: intake.avgOrderValue,
    paymentTerms: intake.paymentTerms,
    deliveryCoverage: intake.deliveryCoverage,
    selectedFeatures: intake.selectedFeatures,
    primaryColor: intake.primaryColor,
    hasBrandGuidelines: intake.hasBrandGuidelines,
    additionalNotes: intake.additionalNotes,
    targetDomain: intake.targetDomain,
    goLiveTimeline: intake.goLiveTimeline,
    minimumOrderValue: intake.minimumOrderValue,
    logoUrl: intake.logoUrl,
    brandSecondaryColor: intake.brandSecondaryColor,
    inspirationUrls: intake.inspirationUrls,
    reviewedAt: intake.reviewedAt?.toISOString() ?? null,
    archivedAt: intake.archivedAt?.toISOString() ?? null,
    createdAt: intake.createdAt.toISOString(),
    project: intake.project
      ? { id: intake.project.id, status: intake.project.status }
      : null,
  };

  return (
    <div className="space-y-6 max-w-5xl">
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
              <Link href="/admin/intakes">Intakes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{intake.companyName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal">{intake.companyName}</h2>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-sm text-ink/50">
            Submitted{" "}
            {new Date(intake.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {intake.calBooked && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
              <CalendarCheck className="h-3 w-3" />
              Call booked
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — 4 detail cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Company & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sand" />
                Company &amp; Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-ink/50 text-xs mb-0.5">Company Name</p>
                  <p className="font-medium">{intake.companyName}</p>
                </div>
                {intake.shortName && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5">Short Name</p>
                    <p className="font-medium">{intake.shortName}</p>
                  </div>
                )}
                {intake.website && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Website
                    </p>
                    <a
                      href={
                        intake.website.startsWith("http")
                          ? intake.website
                          : `https://${intake.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-ink"
                    >
                      {intake.website}
                    </a>
                  </div>
                )}
                {intake.location && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                    </p>
                    <p>{intake.location}</p>
                  </div>
                )}
                {intake.annualRevenue && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Annual Revenue
                    </p>
                    <p>{intake.annualRevenue}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                    <User className="h-3 w-3" /> Contact Name
                  </p>
                  <p className="font-medium">{intake.contactName}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <a href={`mailto:${intake.contactEmail}`} className="hover:underline">
                    {intake.contactEmail}
                  </a>
                </div>
                {intake.contactPhone && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <a href={`tel:${intake.contactPhone}`} className="hover:underline">
                      {intake.contactPhone}
                    </a>
                  </div>
                )}
                {intake.contactRole && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Role
                    </p>
                    <p>{intake.contactRole}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Distribution Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <Truck className="h-4 w-4 text-sand" />
                Distribution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-ink/50 text-xs mb-1">Industry</p>
                  <Badge variant="outline" className="text-xs">
                    {intake.industry}
                  </Badge>
                </div>
                {intake.skuCount && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <Package className="h-3 w-3" /> SKU Count
                    </p>
                    <p>{intake.skuCount}</p>
                  </div>
                )}
                {intake.activeClients && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Active Clients
                    </p>
                    <p>{intake.activeClients}</p>
                  </div>
                )}
                {intake.avgOrderValue && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Avg Order Value
                    </p>
                    <p>{intake.avgOrderValue}</p>
                  </div>
                )}
                {intake.deliveryCoverage && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Delivery Coverage
                    </p>
                    <p>{intake.deliveryCoverage}</p>
                  </div>
                )}
                <div>
                  <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                    <Thermometer className="h-3 w-3" /> Cold Chain
                  </p>
                  <p>{intake.coldChain === "yes" ? "Required" : "Not required"}</p>
                </div>
              </div>

              {intake.paymentTerms.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-ink/50 text-xs mb-1.5 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> Payment Terms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {intake.paymentTerms.map((term) => (
                        <Badge key={term} variant="outline" className="text-xs">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {intake.currentOrdering.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-ink/50 text-xs mb-1.5">
                      Current Ordering Methods
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {intake.currentOrdering.map((method) => (
                        <Badge key={method} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {intake.productCategories && (
                <>
                  <Separator />
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Product Categories
                    </p>
                    <p className="text-ink/80">{intake.productCategories}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Selected Features */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal">
                Selected Features
                <span className="ml-2 text-sm font-normal text-ink/40">
                  ({intake.selectedFeatures.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {intake.selectedFeatures.length === 0 ? (
                <p className="text-sm text-ink/50">No features selected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {intake.selectedFeatures.map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="text-xs bg-neutral-100 text-neutral-700 border-neutral-200"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <Palette className="h-4 w-4 text-sand" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-4 flex-wrap">
                {intake.primaryColor && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 border border-shell shrink-0"
                      style={{ backgroundColor: intake.primaryColor }}
                    />
                    <div>
                      <p className="text-ink/50 text-xs mb-0.5">Primary Color</p>
                      <p className="font-mono font-medium">{intake.primaryColor}</p>
                    </div>
                  </div>
                )}
                {intake.brandSecondaryColor && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 border border-shell shrink-0"
                      style={{ backgroundColor: intake.brandSecondaryColor }}
                    />
                    <div>
                      <p className="text-ink/50 text-xs mb-0.5">Secondary Color</p>
                      <p className="font-mono font-medium">{intake.brandSecondaryColor}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-ink/50 text-xs mb-0.5 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Brand Guidelines
                  </p>
                  <p>{intake.hasBrandGuidelines || "Not specified"}</p>
                </div>
                {intake.logoUrl && (
                  <div>
                    <p className="text-ink/50 text-xs mb-0.5">Logo URL</p>
                    <a
                      href={intake.logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono hover:underline truncate block"
                    >
                      {intake.logoUrl}
                    </a>
                  </div>
                )}
              </div>

              {intake.inspirationUrls && intake.inspirationUrls.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-ink/50 text-xs mb-1.5">Inspiration Sites</p>
                    <div className="space-y-1">
                      {intake.inspirationUrls.filter(Boolean).map((url, i) => (
                        <a
                          key={i}
                          href={url.startsWith("http") ? url : `https://${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-mono hover:underline text-ink/70"
                        >
                          <Globe className="h-3 w-3" />
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {intake.additionalNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-ink/50 text-xs mb-1">Additional Notes</p>
                    <p className="text-ink/80 whitespace-pre-wrap leading-relaxed">
                      {intake.additionalNotes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 5: Website Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg font-normal flex items-center gap-2">
                <Search className="h-4 w-4 text-sand" />
                Website Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WebsiteIntelligence
                intakeId={intake.id}
                intakeWebsite={intake.website ?? null}
                initialScrapeData={intake.scrapeData as Record<string, unknown> | null}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column — actions */}
        <div>
          <IntakeActions intake={serializedIntake} />
        </div>
      </div>
    </div>
  );
}
