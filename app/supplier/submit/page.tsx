'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Loader2 } from 'lucide-react'

const CATEGORIES = [
  'Truffles',
  'Caviar',
  'Salumi & Charcuterie',
  'Specialty Mushrooms',
  'Artisan Cheese',
  'Seafood',
  'Foie Gras & Duck',
  'Premium Oils & Condiments',
  'Specialty Produce',
  'Other',
]

const UNITS = ['kg', 'lb', 'oz', 'each', 'case']

export default function SupplierSubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    productName: '',
    category: '',
    quantity: '',
    unit: '',
    pricePerUnit: '',
    expectedArrival: '',
    notes: '',
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/supplier/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: form.productName,
          category: form.category,
          quantity: parseFloat(form.quantity),
          unit: form.unit,
          pricePerUnit: parseFloat(form.pricePerUnit),
          expectedArrival: form.expectedArrival,
          notes: form.notes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-14 w-14 text-[#0A0A0A]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0A0A0A] mb-2">
          Submission Received
        </h2>
        <p className="text-[#0A0A0A]/60 mb-8">
          Our team will review your submission within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#C8C0B4]/20 rounded-none min-h-[44px]"
            onClick={() => {
              setSuccess(false)
              setForm({
                productName: '',
                category: '',
                quantity: '',
                unit: '',
                pricePerUnit: '',
                expectedArrival: '',
                notes: '',
              })
            }}
          >
            Submit Another
          </Button>
          <Button
            className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none min-h-[44px]"
            onClick={() => router.push('/supplier/submissions')}
          >
            View Submissions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          New Inventory Submission
        </h1>
        <p className="text-sm text-[#0A0A0A]/50 mt-1">
          Submit product details for our team to review.
        </p>
      </div>

      <Card className="border-[#E5E1DB] bg-[#F9F7F4] rounded-none">
        <CardHeader className="border-b border-[#E5E1DB]">
          <CardTitle className="font-serif text-lg text-[#0A0A0A]">Product Details</CardTitle>
          <CardDescription className="text-[#0A0A0A]/50">
            All fields marked * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="productName" className="text-[#0A0A0A] text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="productName"
                placeholder="e.g. Black Perigord Truffle"
                value={form.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                required
                className="border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-[#0A0A0A] text-sm font-medium">
                Category *
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => handleChange('category', val)}
                required
              >
                <SelectTrigger className="border-[#C8C0B4] bg-[#F9F7F4] focus:ring-[#0A0A0A] rounded-none">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#C8C0B4]">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="rounded-none">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-[#0A0A0A] text-sm font-medium">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 50"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                  className="border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-[#0A0A0A] text-sm font-medium">
                  Unit *
                </Label>
                <Select
                  value={form.unit}
                  onValueChange={(val) => handleChange('unit', val)}
                  required
                >
                  <SelectTrigger className="border-[#C8C0B4] bg-[#F9F7F4] focus:ring-[#0A0A0A] rounded-none">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#C8C0B4]">
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u} className="rounded-none">
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Per Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="pricePerUnit" className="text-[#0A0A0A] text-sm font-medium">
                Price Per Unit ($) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 text-sm">$</span>
                <Input
                  id="pricePerUnit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.pricePerUnit}
                  onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                  required
                  className="pl-7 border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
                />
              </div>
            </div>

            {/* Expected Arrival Date */}
            <div className="space-y-1.5">
              <Label htmlFor="expectedArrival" className="text-[#0A0A0A] text-sm font-medium">
                Expected Arrival Date *
              </Label>
              <Input
                id="expectedArrival"
                type="date"
                value={form.expectedArrival}
                onChange={(e) => handleChange('expectedArrival', e.target.value)}
                required
                className="border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[#0A0A0A] text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Origin, certifications, special handling requirements, etc."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 border border-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !form.productName || !form.category || !form.quantity || !form.unit || !form.pricePerUnit || !form.expectedArrival}
              className="w-full bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px] rounded-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Inventory'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
