import type { Metadata } from "next";
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { format, isPast, isToday } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Package,
  Calendar,
  CreditCard,
  MessageSquare,
  Store,
  ShoppingBag,
  Activity,
  Gift,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { orderStatusColors as statusColors, tierColors } from '@/lib/status-colors'
import { TierControl } from './tier-control'
import { SendNotification } from '../../send-notification'
import { InviteClientDialog } from '@/components/invite-client-dialog'
import { EditClientDialog } from './edit-client-dialog'
import { DeleteClientButton } from './delete-client-button'
import { ClientNotes } from './client-notes'
import { calculateHealthScore } from '@/lib/client-health'
import { LoyaltyPanel } from './loyalty-panel'
import { StripeConnectPanel } from './stripe-connect-panel'
import { NewTaskDialog } from '@/components/new-task-dialog'
import { TaskActions } from '@/app/admin/reps/[id]/task-actions'

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  NORMAL: 'bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]',
  LOW: 'bg-gray-100 text-gray-500 border-gray-200',
}

async function getClient(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      addresses: true,
      members: { select: { id: true, name: true, email: true, role: true } },
      orders: {
        include: {
          _count: { select: { items: true } },
          payments: { select: { amount: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      clientNotes: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      conversations: {
        select: { id: true, subject: true, isOpen: true, lastMessageAt: true },
        orderBy: { lastMessageAt: 'desc' },
        take: 5,
      },
      referralsGiven: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          refereeEmail: true,
          refereeName: true,
          status: true,
          creditAmount: true,
          creditedAt: true,
          createdAt: true,
        },
      },
      repTasks: {
        where: { completedAt: null },
        include: { rep: { select: { id: true, name: true } } },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      },
    },
  })
}

async function getClientStats(id: string) {
  const now = new Date()
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const [orderCount, totalSpent, deliveredCount, lastOrder, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { organizationId: id } }),
      prisma.order.aggregate({
        where: { organizationId: id, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { organizationId: id, status: 'DELIVERED' } }),
      prisma.order.findFirst({
        where: { organizationId: id, status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.order.aggregate({
        where: {
          organizationId: id,
          status: { not: 'CANCELLED' },
          createdAt: { gte: twelveMonthsAgo },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
    ])

  const daysSinceLastOrder = lastOrder
    ? Math.floor((now.getTime() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const ordersLast12Months = recentOrders._count.id
  const recentTotal = Number(recentOrders._sum.total ?? 0)
  const avgOrderValue =
    ordersLast12Months > 0 ? recentTotal / ordersLast12Months : 0

  return {
    orderCount,
    totalSpent: totalSpent._sum.total ?? 0,
    deliveredCount,
    daysSinceLastOrder,
    ordersLast12Months,
    avgOrderValue,
  }
}

/** Compute median AOV across all organizations (used for monetary score normalisation). */
async function getMedianAov(): Promise<number> {
  const groups = await prisma.order.groupBy({
    by: ['organizationId'],
    where: { status: { not: 'CANCELLED' } },
    _count: { id: true },
    _sum: { total: true },
  })

  const aovValues = groups
    .filter((g) => g._count.id > 0)
    .map((g) => Number(g._sum.total ?? 0) / g._count.id)

  if (aovValues.length === 0) return 0

  const sorted = [...aovValues].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!currentUser || !['ADMIN', 'OPS', 'SALES_REP'].includes(currentUser.role)) {
    redirect('/')
  }

  const { id } = await params

  let client: Awaited<ReturnType<typeof getClient>> = null
  let stats = {
    orderCount: 0,
    totalSpent: 0 as number | unknown,
    deliveredCount: 0,
    daysSinceLastOrder: null as number | null,
    ordersLast12Months: 0,
    avgOrderValue: 0,
  }
  let medianAov = 0
  let reps: { id: string; name: string }[] = []
  let allOrgs: { id: string; name: string }[] = []

  try {
    ;[client, stats, medianAov, reps, allOrgs] = await Promise.all([
      getClient(id),
      getClientStats(id),
      getMedianAov(),
      prisma.user.findMany({
        where: { role: { in: ['SALES_REP', 'OPS'] } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.organization.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ])
  } catch {
    // DB not connected
  }

  if (!client) notFound()

  const totalSpentNum = Number(stats.totalSpent)
  const avgOrderValue = stats.orderCount > 0 ? totalSpentNum / stats.orderCount : 0

  const clientHealth = calculateHealthScore({
    daysSinceLastOrder: stats.daysSinceLastOrder,
    ordersLast12Months: stats.ordersLast12Months,
    avgOrderValue: stats.avgOrderValue,
    medianAovAllClients: medianAov,
  })

  const clientForEdit = {
    id: client.id,
    name: client.name,
    contactPerson: client.contactPerson,
    email: client.email,
    phone: client.phone,
    website: client.website,
    paymentTerms: client.paymentTerms,
    creditLimit: client.creditLimit ? Number(client.creditLimit) : null,
    isWholesaler: client.isWholesaler,
    isDistributor: client.isDistributor,
    distributorCcEmail: client.distributorCcEmail ?? null,
    notes: client.notes,
  }

  const notesForClient = client.clientNotes.map((n) => ({
    id: n.id,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    author: n.author,
  }))

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
              <Link href="/admin/clients">Clients</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="font-serif text-2xl font-normal">{client.name}</h2>
            <Badge variant="outline" className={`text-sm px-3 py-1 ${tierColors[client.tier] || ''}`}>
              {client.tier}
            </Badge>
            {client.isWholesaler ? (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Store className="h-3 w-3" />
                Wholesaler
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs flex items-center gap-1 text-muted-foreground">
                <ShoppingBag className="h-3 w-3" />
                Standard
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Client since {format(client.createdAt, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EditClientDialog client={clientForEdit} />
          <InviteClientDialog organizationId={client.id} organizationName={client.name} />
          <SendNotification organizationId={client.id} organizationName={client.name} />
          <TierControl organizationId={client.id} currentTier={client.tier} />
          <DeleteClientButton organizationId={client.id} organizationName={client.name} />
        </div>
      </div>

      {/* Health Score Widget */}
      <div className={`border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${clientHealth.bgClass} ${clientHealth.borderClass}`}>
        <div className="flex items-center gap-3">
          <Activity className={`h-5 w-5 ${clientHealth.colorClass}`} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
              Client Health
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-mono font-bold ${clientHealth.colorClass}`}>
                {clientHealth.score}
              </span>
              <span className={`text-sm font-semibold ${clientHealth.colorClass}`}>
                / 100
              </span>
              <span
                className={`ml-1 inline-flex items-center px-2 py-0.5 text-xs font-medium border ${clientHealth.bgClass} ${clientHealth.colorClass} ${clientHealth.borderClass}`}
              >
                {clientHealth.label}
              </span>
            </div>
          </div>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Last order</span>
            <p className="font-medium">
              {stats.daysSinceLastOrder === null
                ? 'Never'
                : stats.daysSinceLastOrder === 0
                ? 'Today'
                : `${stats.daysSinceLastOrder}d ago`}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Orders (12 mo)</span>
            <p className="font-medium">{stats.ordersLast12Months}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Lifetime spend</span>
            <p className="font-medium">
              ${totalSpentNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{stats.orderCount}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Spent</span>
            </div>
            <p className="text-2xl font-bold">
              ${totalSpentNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Order</span>
            </div>
            <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Delivered</span>
            </div>
            <p className="text-2xl font-bold">{stats.deliveredCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{client.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Email:</span>
              <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Phone:</span>
              <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
            </div>
            {client.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Website:</span>
                <a
                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {client.website}
                </a>
              </div>
            )}
            <Separator />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Payment Terms:</span>
              <Badge variant="outline">{client.paymentTerms}</Badge>
            </div>
            {client.creditLimit && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Credit Limit:</span>
                <span className="font-medium">
                  ${Number(client.creditLimit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {client.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1">Internal Notes:</p>
                  <p className="whitespace-pre-wrap text-foreground">{client.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {client.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses on file.</p>
            ) : (
              <div className="space-y-4">
                {client.addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{addr.type}</Badge>
                        {addr.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} {addr.zip}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rep Notes */}
      <ClientNotes
        organizationId={client.id}
        initialNotes={notesForClient}
        currentUserId={userId}
        currentUserRole={currentUser.role}
      />

      {/* Loyalty Points */}
      <LoyaltyPanel organizationId={client.id} />

      {/* Stripe Connect */}
      <StripeConnectPanel organizationId={client.id} />

      {/* Recent Conversations */}
      {client.conversations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/messages">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {client.conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/admin/messages?thread=${conv.id}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors text-sm"
                >
                  <span className="font-medium truncate">{conv.subject}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={conv.isOpen ? 'secondary' : 'outline'} className="text-xs">
                      {conv.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conv.lastMessageAt), 'MMM d')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      {client.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {member.role.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order History ({stats.orderCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {client.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{format(order.createdAt, 'MMM d, yyyy')}</TableCell>
                    <TableCell>{order._count.items}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(order.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[order.status] || ''}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      {client.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(inv.dueDate, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(inv.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {inv.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rep Tasks */}
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg text-[#0A0A0A] flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-[#C8C0B4]" />
            Rep Tasks
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#0A0A0A]/50">
              {client.repTasks.length} open
            </span>
            <NewTaskDialog
              reps={reps}
              orgs={allOrgs}
              defaultOrgId={client.id}
              triggerLabel="Create Task"
            />
          </div>
        </CardHeader>
        <CardContent>
          {client.repTasks.length === 0 ? (
            <p className="text-sm text-[#0A0A0A]/50">
              No open tasks linked to this client.
            </p>
          ) : (
            <div className="space-y-3">
              {client.repTasks.map((task) => {
                const isOverdue =
                  task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate)
                const isDueToday = task.dueDate && isToday(task.dueDate)

                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between py-3 border-b border-[#E5E1DB] last:border-0"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-sm font-medium text-[#0A0A0A]">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                        <span className="text-xs text-[#0A0A0A]/50">
                          {task.rep.name}
                        </span>
                        {task.dueDate && (
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              isOverdue
                                ? 'text-red-600 font-medium'
                                : isDueToday
                                ? 'text-orange-600 font-medium'
                                : 'text-[#0A0A0A]/50'
                            }`}
                          >
                            {isOverdue && (
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                            )}
                            Due {format(task.dueDate, 'MMM d, yyyy')}
                            {isOverdue && ' (overdue)'}
                            {isDueToday && ' (today)'}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-[#0A0A0A]/40 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${priorityColors[task.priority] ?? priorityColors.NORMAL}`}
                      >
                        {task.priority}
                      </Badge>
                      <TaskActions taskId={task.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code + Credits summary */}
          <div className="grid gap-4 sm:grid-cols-3 border border-border bg-muted/30 p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Referral Code</p>
              {client.referralCode ? (
                <p className="font-mono font-medium">{client.referralCode}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Not generated yet</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Available Credits</p>
              <p className="font-semibold">
                ${Number(client.referralCredits).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Referrals</p>
              <p className="font-semibold">{client.referralsGiven.length}</p>
            </div>
          </div>

          {/* Referral link */}
          {client.referralCode && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Referral Link</p>
              <p className="font-mono text-sm text-muted-foreground break-all">
                {process.env.NEXT_PUBLIC_APP_URL || 'https://wholesailhub.com'}/refer/{client.referralCode}
              </p>
            </div>
          )}

          {/* Referrals table */}
          {client.referralsGiven.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.referralsGiven.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>
                      <div>
                        {ref.refereeName && (
                          <p className="font-medium text-sm">{ref.refereeName}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{ref.refereeEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          ref.status === 'CREDITED'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : ref.status === 'CONVERTED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        {ref.status === 'CREDITED'
                          ? 'Credited'
                          : ref.status === 'CONVERTED'
                          ? 'Converted'
                          : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ref.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {ref.status === 'CREDITED' ? (
                        <span className="text-sm font-medium text-green-700">
                          +${Number(ref.creditAmount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          ${Number(ref.creditAmount).toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No referrals made yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
