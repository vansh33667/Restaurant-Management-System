"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser, getItems, type WorkerSalary } from "@/lib/storage"
import { Printer, FileText } from "lucide-react"
import {
  Document,
  Packer,
  Paragraph,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
  WidthType,
  AlignmentType,
} from "docx"

export default function SalarySummaryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [salaries, setSalaries] = useState<WorkerSalary[]>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    if (currentUser.role !== "Cashier") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)
    loadSalaries()
  }, [router, selectedMonth])

  const loadSalaries = () => {
    const allSalaries = getItems<WorkerSalary>("workerSalaries")
    const monthSalaries = allSalaries.filter((s) => s.month === selectedMonth)
    setSalaries(monthSalaries)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportWord = async () => {
    const monthName = new Date(selectedMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const grandTotal = salaries.reduce((sum, s) => sum + s.finalSalary, 0)

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Padharo Thal and Banquet",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: "Heading1",
            }),
            new Paragraph({
              text: `Monthly Salary Report – ${monthName}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              style: "Heading2",
            }),
            new DocxTable({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new DocxTableRow({
                  children: [
                    new DocxTableCell({
                      children: [new Paragraph({ text: "Worker Name", bold: true })],
                      shading: { fill: "E5E7EB" },
                    }),
                    new DocxTableCell({
                      children: [new Paragraph({ text: "Monthly Salary", bold: true })],
                      shading: { fill: "E5E7EB" },
                    }),
                    new DocxTableCell({
                      children: [new Paragraph({ text: "Advance", bold: true })],
                      shading: { fill: "E5E7EB" },
                    }),
                    new DocxTableCell({
                      children: [new Paragraph({ text: "Bonus", bold: true })],
                      shading: { fill: "E5E7EB" },
                    }),
                    new DocxTableCell({
                      children: [new Paragraph({ text: "Final Salary", bold: true })],
                      shading: { fill: "E5E7EB" },
                    }),
                  ],
                }),
                ...salaries.map(
                  (salary) =>
                    new DocxTableRow({
                      children: [
                        new DocxTableCell({ children: [new Paragraph(salary.workerName)] }),
                        new DocxTableCell({ children: [new Paragraph(`₹${salary.monthlySalary.toLocaleString()}`)] }),
                        new DocxTableCell({ children: [new Paragraph(`₹${salary.advance.toLocaleString()}`)] }),
                        new DocxTableCell({ children: [new Paragraph(`₹${salary.bonus.toLocaleString()}`)] }),
                        new DocxTableCell({
                          children: [new Paragraph({ text: `₹${salary.finalSalary.toLocaleString()}`, bold: true })],
                        }),
                      ],
                    }),
                ),
                new DocxTableRow({
                  children: [
                    new DocxTableCell({
                      children: [new Paragraph({ text: "Grand Total", bold: true })],
                      columnSpan: 4,
                      shading: { fill: "FEF3C7" },
                    }),
                    new DocxTableCell({
                      children: [new Paragraph({ text: `₹${grandTotal.toLocaleString()}`, bold: true })],
                      shading: { fill: "FEF3C7" },
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({
              text: "",
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: `Generated Date: ${new Date().toLocaleDateString()}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Generated By: ${user.name} (Cashier)`,
            }),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Salary_Report_${monthName.replace(" ", "_")}_Padharo_Thal.docx`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  const grandTotal = salaries.reduce((sum, s) => sum + s.finalSalary, 0)
  const monthName = new Date(selectedMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-section {
            padding: 40px;
          }
        }
      `}</style>

      <div className="flex h-screen bg-background">
        <div className="no-print">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 print-section">
            <div className="flex items-center justify-between no-print">
              <h1 className="text-3xl font-bold">Monthly Salary Summary</h1>
              <div className="flex items-center gap-4">
                <Label>Select Month:</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date()
                      date.setMonth(date.getMonth() - i)
                      const value = date.toISOString().slice(0, 7)
                      return (
                        <SelectItem key={value} value={value}>
                          {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Padharo Thal and Banquet</CardTitle>
                <p className="text-lg text-muted-foreground">Monthly Salary Report – {monthName}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker Name</TableHead>
                        <TableHead className="text-right">Monthly Salary</TableHead>
                        <TableHead className="text-right">Advance</TableHead>
                        <TableHead className="text-right">Bonus</TableHead>
                        <TableHead className="text-right font-bold">Final Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No salary records for this month
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {salaries.map((salary) => (
                            <TableRow key={salary.id}>
                              <TableCell className="font-medium">{salary.workerName}</TableCell>
                              <TableCell className="text-right">₹{salary.monthlySalary.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{salary.advance.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{salary.bonus.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-bold text-lg">
                                ₹{salary.finalSalary.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-amber-50 dark:bg-amber-950">
                            <TableCell colSpan={4} className="text-right font-bold text-xl">
                              Grand Total
                            </TableCell>
                            <TableCell className="text-right font-bold text-2xl text-primary">
                              ₹{grandTotal.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center pt-4 border-t no-print">
                  <div className="text-sm text-muted-foreground">
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                    <p>By: {user.name} (Cashier)</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handlePrint} variant="outline" className="gap-2 bg-transparent">
                      <Printer className="h-4 w-4" />
                      Print Report
                    </Button>
                    <Button onClick={handleExportWord} className="gap-2">
                      <FileText className="h-4 w-4" />
                      Export to Word
                    </Button>
                  </div>
                </div>

                <div className="hidden print:block text-sm text-muted-foreground pt-4 border-t">
                  <p>Generated Date: {new Date().toLocaleDateString()}</p>
                  <p>Generated By: {user.name} (Cashier)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}
