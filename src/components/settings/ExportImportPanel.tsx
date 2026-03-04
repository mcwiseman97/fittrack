"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ExportImportPanel() {
  const [importing, setImporting] = useState(false)

  const handleExport = (format: "json" | "workouts-csv" | "nutrition-csv") => {
    window.location.href = `/api/export?format=${format}`
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith(".json")) { toast.error("Only JSON imports are supported"); return }

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) toast.success("Data imported successfully")
      else toast.error("Import failed — invalid format")
    } catch {
      toast.error("Failed to parse JSON file")
    } finally {
      setImporting(false)
      e.target.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Portability</CardTitle>
        <CardDescription>Export your data or import a previous backup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Export</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              className="gap-2"
            >
              <FileJson className="w-4 h-4" />
              Full Backup (JSON)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("workouts-csv")}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Workouts (CSV)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("nutrition-csv")}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Nutrition (CSV)
            </Button>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Import</p>
          <p className="text-xs text-muted-foreground">
            Import a JSON backup. This will merge data — existing records are preserved.
          </p>
          <label className="inline-flex">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4" />
                {importing ? "Importing..." : "Import JSON Backup"}
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              className="sr-only"
              onChange={handleImport}
              disabled={importing}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
