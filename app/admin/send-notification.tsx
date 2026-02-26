"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface NotificationType {
  value: string;
  label: string;
  requiresOrder?: boolean;
  requiresInvoice?: boolean;
  requiresMessage?: boolean;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  { value: "order_confirmation", label: "Order Confirmation", requiresOrder: true },
  { value: "order_shipped", label: "Order Shipped", requiresOrder: true },
  { value: "order_delivered", label: "Order Delivered", requiresOrder: true },
  { value: "invoice_reminder", label: "Invoice Reminder", requiresInvoice: true },
  { value: "welcome_partner", label: "Welcome Message" },
  { value: "custom", label: "Custom Message", requiresMessage: true },
];

interface SendNotificationProps {
  organizationId: string;
  organizationName: string;
  orderId?: string;
  invoiceId?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "sm" | "default" | "icon";
}

export function SendNotification({
  organizationId,
  organizationName,
  orderId,
  invoiceId,
  variant = "outline",
  size = "sm",
}: SendNotificationProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);

  const selectedType = NOTIFICATION_TYPES.find((t) => t.value === type);
  const canSend =
    type &&
    (!selectedType?.requiresOrder || orderId) &&
    (!selectedType?.requiresInvoice || invoiceId) &&
    (!selectedType?.requiresMessage || customMessage.trim());

  async function handleSend() {
    if (!canSend) return;
    setSending(true);

    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          organizationId,
          orderId,
          invoiceId,
          customMessage: customMessage || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Message sent to ${organizationName}`);
        setOpen(false);
        setType("");
        setCustomMessage("");
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  // Filter available types based on context
  const availableTypes = NOTIFICATION_TYPES.filter((t) => {
    if (t.requiresOrder && !orderId) return false;
    if (t.requiresInvoice && !invoiceId) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <MessageSquare className="h-4 w-4 mr-1" />
          Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Send an iMessage/SMS to {organizationName} via Bloo.io.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Message Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type..." />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType?.requiresMessage && (
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {selectedType && !selectedType.requiresMessage && (
            <p className="text-sm text-muted-foreground">
              A pre-written {selectedType.label.toLowerCase()} message will be
              sent automatically.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!canSend || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-1" />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
