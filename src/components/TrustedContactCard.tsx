import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";

type Contact = { name: string; phone: string };
const STORAGE_KEY = "trustedContacts.v1";

const safeGet = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const canClipboard = () =>
  typeof navigator !== "undefined" && !!navigator.clipboard?.writeText;

const copyNumber = async (num: string) => {
  try {
    if (canClipboard()) {
      await navigator.clipboard.writeText(num);
      toast.success("Copied to clipboard");
    } else {
      throw new Error("no-clipboard");
    }
  } catch {
    toast.error("Copy failed. Please select the number and copy it manually.");
  }
};

const isTelSupported = () =>
  typeof window !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function TrustedContactCard() {
  const [contacts, setContacts] = useState<Contact[]>([{ name: "", phone: "" }, { name: "", phone: "" }]);

  useEffect(() => {
    setContacts(safeGet<Contact[]>(STORAGE_KEY, contacts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  const normalizePhone = (v: string) => v.replace(/\s|-/g, "");

  const telHref = (num: string) => `tel:${normalizePhone(num)}`;
  const smsHref = (num: string) => `sms:${normalizePhone(num)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trusted Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((c, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor={`name_${i}`}>Name</Label>
              <Input
                id={`name_${i}`}
                value={c.name}
                onChange={(e) =>
                  setContacts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i], name: e.target.value.slice(0, 64) };
                    return next;
                  })
                }
                placeholder="Friend or family"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`phone_${i}`}>Phone</Label>
              <Input
                id={`phone_${i}`}
                value={c.phone}
                onChange={(e) =>
                  setContacts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i], phone: e.target.value.slice(0, 32) };
                    return next;
                  })
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  try {
                    if (isTelSupported() && c.phone.trim()) {
                      window.location.href = telHref(c.phone);
                    } else {
                      copyNumber(c.phone);
                    }
                  } catch {
                    toast.error(
                      "Something went wrong. Please try again or use the copyable number below. If you are in immediate danger, call your local emergency services right now."
                    );
                  }
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  try {
                    if (c.phone.trim()) {
                      window.location.href = smsHref(c.phone);
                    } else {
                      copyNumber(c.phone);
                    }
                  } catch {
                    toast.error(
                      "Something went wrong. Please try again or use the copyable number below. If you are in immediate danger, call your local emergency services right now."
                    );
                  }
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => copyNumber(c.phone)}
                aria-label="Copy number"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
