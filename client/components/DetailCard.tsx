import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface KV {
  label: string;
  value: React.ReactNode;
}

interface Stat {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success" | "muted" | "accent";
}

interface DetailCardProps {
  title: string;
  subtitle?: string;
  left?: KV[];
  right?: KV[];
  stats?: Stat[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function DetailCard({
  title,
  subtitle,
  left = [],
  right = [],
  stats = [],
  actions,
  children,
}: DetailCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold leading-tight text-primary">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="space-y-3">
            {left.map((kv, i) => (
              <div key={i}>
                <div className="text-xs text-muted-foreground">{kv.label}</div>
                <div className="text-sm">{kv.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {right.map((kv, i) => (
              <div key={i}>
                <div className="text-xs text-muted-foreground">{kv.label}</div>
                <div className="text-sm">{kv.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-lg p-3 text-center flex flex-col gap-1 bg-gradient-to-r from-primary to-primary-light text-white shadow-md"
            >
              <div className="text-xs opacity-90">{s.label}</div>
              <div className="text-lg font-semibold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {children && <div className="bg-muted/30 rounded-lg p-3">{children}</div>}
    </div>
  );
}
