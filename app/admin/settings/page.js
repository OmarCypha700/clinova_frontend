"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings2, Lock, LockOpen, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

// ─── individual flag definition ───────────────────────────────────────────────
// Add new flags here; the page renders them automatically.

const FLAG_DEFINITIONS = [
  {
    key: "care_plan_lock_on_submit",
    group: "Care Plan",
    label: "Lock care plan after submission",
    description:
      "When enabled, a care plan is locked the moment an examiner submits it and cannot be edited or rescored. " +
      "When disabled, any examiner can overwrite a previously submitted care plan score.",
    icon: Lock,
    iconOff: LockOpen,
    // Optional: warn before turning a flag OFF (destructive direction)
    confirmOff: {
      title: "Allow care plan rescoring?",
      body: "Turning this off means examiners can overwrite already-submitted care plan scores. Any previously locked care plans will remain locked — only new submissions will be affected.",
    },
  },
  // ── Add future flags here ──────────────────────────────────────────────────
//   {
//     key: "reconciliation_required",
//     group: "Reconciliation",
//     label: "Require reconciliation before grades are finalised",
//     description: "...",
//     icon: ShieldCheck,
//   },
];

// Group flags by their group label
function groupFlags(defs) {
  return defs.reduce((acc, def) => {
    if (!acc[def.group]) acc[def.group] = [];
    acc[def.group].push(def);
    return acc;
  }, {});
}

// ─── component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // key of the flag currently saving
  const [confirm, setConfirm] = useState(null); // { def, newValue }

  // ── fetch settings ───────────────────────────────────────────────────────────

  useEffect(() => {
    api
      .get("/exams/settings/")
      .then((res) => setSettings(res.data))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  // ── toggle handler ───────────────────────────────────────────────────────────

  const applyToggle = async (key, newValue) => {
    setSaving(key);
    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      const res = await api.patch("/exams/settings/", { [key]: newValue });
      setSettings(res.data);
      toast.success("Setting saved");
    } catch {
      // Revert
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      toast.error("Failed to save setting");
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = (def, newValue) => {
    // If turning OFF and the flag has a confirmOff prompt, show dialog first
    if (!newValue && def.confirmOff) {
      setConfirm({ def, newValue });
      return;
    }
    applyToggle(def.key, newValue);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const groups = groupFlags(FLAG_DEFINITIONS);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-muted rounded-lg mt-0.5">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure application behaviour and feature flags. Changes take
            effect immediately.
          </p>
        </div>
      </div>

      {/* Last-updated banner */}
      {!loading && settings?.updated_at && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Last updated{" "}
          <strong>{new Date(settings.updated_at).toLocaleString()}</strong>
          {settings.updated_by_name && (
            <>
              {" "}
              by <strong>{settings.updated_by_name}</strong>
            </>
          )}
        </div>
      )}

      {/* Flag groups */}
      {Object.entries(groups).map(([group, defs]) => (
        <Card key={group}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {group}
            </CardTitle>
            <CardDescription>
              Configure {group.toLowerCase()} behaviour
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-0 p-0">
            {defs.map((def, idx) => {
              const isOn = settings?.[def.key] ?? false;
              const isSaving = saving === def.key;
              const Icon = isOn ? def.icon : (def.iconOff ?? def.icon);

              return (
                <div key={def.key}>
                  {idx > 0 && <Separator />}

                  <div className="flex items-start gap-4 p-6">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                        isOn ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isOn ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Label
                          htmlFor={def.key}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {def.label}
                        </Label>
                        <Badge
                          variant={isOn ? "default" : "secondary"}
                          className={`text-xs transition-colors ${
                            isOn
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isOn ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {def.description}
                      </p>
                    </div>

                    {/* Toggle */}
                    <div className="shrink-0 flex items-center gap-2 mt-0.5">
                      {loading ? (
                        <Skeleton className="h-6 w-11 rounded-full" />
                      ) : (
                        <Switch
                          id={def.key}
                          checked={isOn}
                          disabled={isSaving}
                          onCheckedChange={(checked) =>
                            handleToggle(def, checked)
                          }
                          aria-label={def.label}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Empty state (no flags defined yet — shouldn't happen in practice) */}
      {!loading && FLAG_DEFINITIONS.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No feature flags are configured yet.
          </CardContent>
        </Card>
      )}

      {/* ── Confirmation dialog (shown when turning a flag OFF) ── */}
      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.def.confirmOff?.title ?? "Change this setting?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.def.confirmOff?.body ??
                "Are you sure you want to disable this feature?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                applyToggle(confirm.def.key, confirm.newValue);
                setConfirm(null);
              }}
            >
              Yes, disable it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
