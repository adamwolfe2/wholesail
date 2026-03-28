'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, MapPin, Plus, Star, Trash2, CreditCard, User, Bell, Check, FileText, Building2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface Address {
  id: string
  type: 'BILLING' | 'SHIPPING'
  street: string
  city: string
  state: string
  zip: string
  isDefault: boolean
}

interface BusinessProfile {
  name: string
  contactPerson: string
  phone: string
  email: string
}

interface NotificationPrefs {
  emailDropAlerts: boolean
  emailOrderUpdates: boolean
  smsOrderUpdates: boolean
  emailWeeklyDigest: boolean
}

const NOTIF_DEFAULTS: NotificationPrefs = {
  emailDropAlerts: true,
  emailOrderUpdates: true,
  smsOrderUpdates: true,
  emailWeeklyDigest: true,
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressLoading, setAddressLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    type: 'SHIPPING' as 'BILLING' | 'SHIPPING',
  })

  const [bizProfile, setBizProfile] = useState<BusinessProfile | null>(null)
  const [bizLoading, setBizLoading] = useState(true)
  const [bizEditing, setBizEditing] = useState(false)
  const [bizForm, setBizForm] = useState({ contactPerson: '', phone: '' })
  const [bizSaving, setBizSaving] = useState(false)
  const [bizSaved, setBizSaved] = useState(false)
  const [bizError, setBizError] = useState('')

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(NOTIF_DEFAULTS)
  const [notifLoading, setNotifLoading] = useState(true)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/client/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch {
      setFetchError(true)
    } finally {
      setAddressLoading(false)
    }
  }, [])

  const fetchBizProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/client/profile')
      if (res.ok) {
        const data = await res.json()
        setBizProfile(data.profile)
        setBizForm({ contactPerson: data.profile.contactPerson, phone: data.profile.phone })
      }
    } catch {
      setFetchError(true)
    } finally {
      setBizLoading(false)
    }
  }, [])

  const fetchNotifPrefs = useCallback(async () => {
    try {
      const res = await fetch('/api/client/notification-preferences')
      if (res.ok) {
        const data = await res.json()
        setNotifPrefs({ ...NOTIF_DEFAULTS, ...data.prefs })
      }
    } catch {
      setFetchError(true)
    } finally {
      setNotifLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      fetchAddresses()
      fetchNotifPrefs()
      fetchBizProfile()
    } else if (isLoaded) {
      setAddressLoading(false)
      setNotifLoading(false)
      setBizLoading(false)
    }
  }, [isLoaded, user, fetchAddresses, fetchNotifPrefs, fetchBizProfile])

  async function handleBizSave(e: React.FormEvent) {
    e.preventDefault()
    setBizSaving(true)
    setBizError('')
    setBizSaved(false)
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bizForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      setBizProfile(data.profile)
      setBizEditing(false)
      setBizSaved(true)
      toast.success('Business profile saved.')
      setTimeout(() => setBizSaved(false), 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setBizError(msg)
      toast.error(msg)
    } finally {
      setBizSaving(false)
    }
  }

  async function handleNotifToggle(key: keyof NotificationPrefs) {
    const previous = notifPrefs[key]
    const updated = { ...notifPrefs, [key]: !previous }
    setNotifPrefs(updated)
    setNotifSaving(true)
    setNotifSaved(false)
    try {
      const res = await fetch('/api/client/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: updated[key] }),
      })
      if (res.ok) {
        setNotifSaved(true)
        setTimeout(() => setNotifSaved(false), 2500)
      } else {
        setNotifPrefs(prev => ({ ...prev, [key]: previous }))
      }
    } catch {
      setNotifPrefs(prev => ({ ...prev, [key]: previous }))
      toast.error('Failed to save preference. Please try again.')
    } finally {
      setNotifSaving(false)
    }
  }

  async function handleDeleteAddress(id: string) {
    setDeletingId(id)
    setAddressError('')
    try {
      const res = await fetch(`/api/client/addresses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Address deleted.')
        setAddresses((prev) => prev.filter((a) => a.id !== id))
      } else {
        toast.error('Failed to delete address.')
        setAddressError('Failed to delete address')
      }
    } catch {
      toast.error('Network error — please try again.')
      setAddressError('Network error — please try again')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefaultId(id)
    setAddressError('')
    try {
      const res = await fetch(`/api/client/addresses/${id}`, { method: 'PATCH' })
      if (res.ok) {
        const address = addresses.find((a) => a.id === id)
        if (address) {
          setAddresses((prev) =>
            prev.map((a) =>
              a.type === address.type
                ? { ...a, isDefault: a.id === id }
                : a
            )
          )
          toast.success('Default address updated.')
        }
      } else {
        toast.error('Failed to set default address.')
        setAddressError('Failed to set default address')
      }
    } catch {
      toast.error('Network error — please try again.')
      setAddressError('Network error — please try again')
    } finally {
      setSettingDefaultId(null)
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    setAddingAddress(true)
    setAddressError('')
    try {
      const res = await fetch('/api/client/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Address added.')
        setAddresses((prev) => [...prev, data.address])
        setShowAddForm(false)
        setNewAddress({ street: '', city: '', state: '', zip: '', type: 'SHIPPING' })
      } else {
        toast.error('Failed to add address.')
        setAddressError('Failed to add address')
      }
    } catch {
      toast.error('Network error — please try again.')
      setAddressError('Network error — please try again')
    } finally {
      setAddingAddress(false)
    }
  }

  if (!isLoaded) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading settings">
          <Loader2 className="h-8 w-8 animate-spin text-sand" />
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-2xl">
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">Account Settings</h1>
          <p className="text-sm text-ink/50 mt-1">Manage your profile and preferences</p>
        </div>

        {/* 1. Profile */}
        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-sand" />
              <CardTitle className="font-serif text-lg text-ink">Profile</CardTitle>
            </div>
            <CardDescription className="text-ink/50">Your Clerk account information</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-4">
                  {user.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
                      alt="Avatar"
                      className="h-12 w-12 rounded-none object-cover border border-sand"
                    />
                  )}
                  <div>
                    <p className="font-medium text-ink">
                      {user.fullName || user.firstName || 'No name set'}
                    </p>
                    <p className="text-sm text-ink/50">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-ink/40 bg-sand/10 px-3 py-2 border border-sand/30">
                  Profile details are managed through Clerk. Use the account button in the sidebar to update your name, email, or password.
                </p>
              </>
            ) : (
              <p className="text-sm text-ink/50">Not signed in.</p>
            )}
          </CardContent>
        </Card>

        {/* 2. Business Information */}
        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sand" />
                <CardTitle className="font-serif text-lg text-ink">Business Information</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {bizSaved && (
                  <span className="flex items-center gap-1 text-xs text-ink/60">
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </span>
                )}
                {!bizEditing && bizProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBizForm({ contactPerson: bizProfile.contactPerson, phone: bizProfile.phone })
                      setBizEditing(true)
                      setBizError('')
                    }}
                    className="border-sand text-ink/60 hover:text-ink hover:bg-sand/20 rounded-none text-xs min-h-[32px]"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <CardDescription className="text-ink/50">
              Your business contact details. Contact your rep to update your business name.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {bizLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-sand" />
              </div>
            ) : bizEditing ? (
              <form onSubmit={handleBizSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-ink/60 uppercase tracking-wider">Business Name</Label>
                  <p className="text-sm text-ink/50 bg-sand/10 px-3 py-2 border border-sand/30">
                    {bizProfile?.name} <span className="text-xs">(contact your rep to update)</span>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPerson" className="text-xs text-ink/60 uppercase tracking-wider">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    required
                    value={bizForm.contactPerson}
                    onChange={(e) => setBizForm((p) => ({ ...p, contactPerson: e.target.value }))}
                    placeholder="John Smith"
                    className="border-sand bg-cream focus-visible:ring-ink rounded-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bizPhone" className="text-xs text-ink/60 uppercase tracking-wider">Phone *</Label>
                  <Input
                    id="bizPhone"
                    required
                    type="tel"
                    value={bizForm.phone}
                    onChange={(e) => setBizForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(310) 555-0100"
                    className="border-sand bg-cream focus-visible:ring-ink rounded-none text-sm"
                  />
                </div>
                {bizError && (
                  <p className="text-xs text-red-600 border border-red-200 bg-red-50 px-3 py-2">{bizError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={bizSaving}
                    className="bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[36px] text-sm"
                  >
                    {bizSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setBizEditing(false); setBizError('') }}
                    className="border-sand text-ink hover:bg-sand/20 rounded-none min-h-[36px] text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : bizProfile ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">Business Name</p>
                  <p className="text-ink font-medium">{bizProfile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">Contact Person</p>
                  <p className="text-ink">{bizProfile.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-ink">{bizProfile.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-ink/50 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-ink">{bizProfile.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/50">No business profile on file.</p>
            )}
          </CardContent>
        </Card>

        {/* 4. Delivery Preferences */}
        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sand" />
              <CardTitle className="font-serif text-lg text-ink">Delivery Preferences</CardTitle>
            </div>
            <CardDescription className="text-ink/50">
              Manage your shipping and billing addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {addressError && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 border border-destructive/20">{addressError}</p>
            )}
            {addressLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-sand" />
              </div>
            ) : addresses.length === 0 && !showAddForm ? (
              <p className="text-sm text-ink/50">No addresses on file.</p>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-sand/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-sand text-ink/60 rounded-none text-xs">
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge className="bg-ink text-cream rounded-none text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-ink">{address.street}</p>
                      <p className="text-xs text-ink/50">
                        {address.city}, {address.state} {address.zip}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!address.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-sand text-ink/60 hover:text-ink hover:bg-sand/20 rounded-none min-h-[36px] text-xs px-2"
                          onClick={() => handleSetDefault(address.id)}
                          disabled={settingDefaultId === address.id}
                        >
                          {settingDefaultId === address.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Star className="h-3 w-3 mr-1" />
                          )}
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sand text-ink/40 hover:text-ink hover:bg-sand/20 rounded-none min-h-[36px] px-2"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={deletingId === address.id}
                      >
                        {deletingId === address.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddForm ? (
              <form onSubmit={handleAddAddress} className="space-y-3 border border-sand/50 p-4">
                <p className="text-sm font-medium text-ink">Add New Address</p>
                <div className="space-y-1.5">
                  <Label htmlFor="address-type" className="text-xs text-ink/60">Type</Label>
                  <Select
                    value={newAddress.type}
                    onValueChange={(v) => setNewAddress((p) => ({ ...p, type: v as 'BILLING' | 'SHIPPING' }))}
                  >
                    <SelectTrigger className="border-sand bg-cream focus:ring-ink rounded-none text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-sand">
                      <SelectItem value="SHIPPING" className="rounded-none">Shipping</SelectItem>
                      <SelectItem value="BILLING" className="rounded-none">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address-street" className="text-xs text-ink/60">Street *</Label>
                  <Input
                    id="address-street"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
                    placeholder="123 Main St"
                    className="border-sand bg-cream focus-visible:ring-ink rounded-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="address-city" className="text-xs text-ink/60">City *</Label>
                    <Input
                      id="address-city"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                      placeholder="New York"
                      className="border-sand bg-cream focus-visible:ring-ink rounded-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address-state" className="text-xs text-ink/60">State *</Label>
                    <Input
                      id="address-state"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                      placeholder="NY"
                      maxLength={2}
                      className="border-sand bg-cream focus-visible:ring-ink rounded-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address-zip" className="text-xs text-ink/60">ZIP *</Label>
                    <Input
                      id="address-zip"
                      required
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress((p) => ({ ...p, zip: e.target.value }))}
                      placeholder="10001"
                      className="border-sand bg-cream focus-visible:ring-ink rounded-none text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={addingAddress}
                    className="bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[36px] text-sm"
                  >
                    {addingAddress ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Save Address
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-sand text-ink hover:bg-sand/20 rounded-none min-h-[36px] text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="border-sand text-ink/60 hover:text-ink hover:bg-sand/20 rounded-none"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Address
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 5. Notification Preferences */}
        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sand" />
                <CardTitle className="font-serif text-lg text-ink">Notification Preferences</CardTitle>
              </div>
              {notifSaved && (
                <span className="flex items-center gap-1 text-xs text-ink/60">
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              {notifSaving && !notifSaved && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sand" />
              )}
            </div>
            <CardDescription className="text-ink/50">
              Choose which notifications you receive. Changes save automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-0 divide-y divide-sand/30">
            {notifLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-sand" />
              </div>
            ) : (
              ([
                {
                  key: 'emailDropAlerts' as const,
                  label: 'Email: Drop Alerts',
                  desc: 'New product arrivals and limited drops',
                },
                {
                  key: 'emailOrderUpdates' as const,
                  label: 'Email: Order Updates',
                  desc: 'Status changes, confirmations, and shipping notifications',
                },
                {
                  key: 'smsOrderUpdates' as const,
                  label: 'SMS: Order Updates',
                  desc: 'Text messages for order confirmations and shipping',
                },
                {
                  key: 'emailWeeklyDigest' as const,
                  label: 'Email: Weekly Specials',
                  desc: 'Weekly product highlights and promotions',
                },
              ] as const).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink/50 mt-0.5">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[item.key]}
                    onCheckedChange={() => handleNotifToggle(item.key)}
                    disabled={notifSaving}
                    aria-label={item.label}
                    className="data-[state=checked]:bg-ink ml-4 shrink-0"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 6. Payment History */}
        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-sand" />
              <CardTitle className="font-serif text-lg text-ink">Payments</CardTitle>
            </div>
            <CardDescription className="text-ink/50">
              View your payment history and transaction records
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-ink/60">
              All payments are processed securely. View your full payment history, transaction references, and invoice links.
            </p>
            <Button
              asChild
              className="bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[44px]"
            >
              <Link href="/client-portal/payments">
                <CreditCard className="h-4 w-4 mr-2" />
                View Payment History
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 7. Documents */}
        <Card className="border-sand bg-cream rounded-none">
          <CardHeader className="border-b border-sand/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sand" />
              <CardTitle className="font-serif text-lg text-ink">Documents</CardTitle>
            </div>
            <CardDescription className="text-ink/50">
              Download your personalized wholesale documents
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-sand/50">
              <div>
                <p className="text-sm font-medium text-ink">Wholesale Price List</p>
                <p className="text-xs text-ink/50 mt-0.5">
                  Your personalized price list with tier discounts applied. PDF format.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-sand text-ink hover:bg-sand/20 rounded-none min-h-[40px] shrink-0"
              >
                <a href="/api/client/price-list" download>
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
