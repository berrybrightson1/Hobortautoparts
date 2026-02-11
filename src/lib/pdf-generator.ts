import jsPDF from "jspdf"
import "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: any) => jsPDF
    }
}

interface QuoteData {
    id: string
    date: string
    customer: {
        name: string
        email: string
        phone: string
    }
    vehicle: {
        year: string
        make: string
        model: string
        vin: string
    }
    parts: {
        type: string
        category: string
        price: string
    }[]
    total: string
}

export const generateQuotePDF = (data: QuoteData) => {
    const doc = new jsPDF()

    // --- Header ---
    // Logo placeholder (orange square for now)
    doc.setFillColor(249, 115, 22) // Primary Orange
    doc.rect(14, 10, 10, 10, "F")

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(30, 41, 59) // Slate 800
    doc.text("HOBORT AUTO EXPRESS", 28, 17)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139) // Slate 500
    doc.text("Ghana's #1 US Parts Hub", 28, 22)

    // Invoice Details
    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59)
    doc.text(`QUOTE #${data.id}`, 196, 15, { align: "right" })
    doc.text(`Date: ${data.date}`, 196, 20, { align: "right" })

    // --- Customer & Vehicle Info ---
    doc.setDrawColor(226, 232, 240) // Slate 200
    doc.line(14, 30, 196, 30)

    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Customer Details", 14, 40)
    doc.text("Vehicle Information", 110, 40)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105) // Slate 600

    // Customer
    doc.text(data.customer.name, 14, 46)
    doc.text(data.customer.email, 14, 51)
    doc.text(data.customer.phone, 14, 56)

    // Vehicle
    doc.text(`${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`, 110, 46)
    doc.text(`VIN: ${data.vehicle.vin}`, 110, 51)

    // --- Parts Table ---
    doc.autoTable({
        startY: 65,
        head: [["Part Description", "Category", "Est. Price"]],
        body: data.parts.map((part) => [part.type, part.category, part.price]),
        headStyles: {
            fillColor: [30, 58, 138], // Primary Blue
            textColor: 255,
            fontStyle: "bold",
        },
        styles: {
            cellPadding: 4,
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: [241, 245, 249]
        }
    })

    // --- Total ---
    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(30, 41, 59)
    doc.text(`Total Estimate: ${data.total}`, 196, finalY, { align: "right" })

    // --- Footer ---
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184) // Slate 400
    doc.text("NOTE: This is an estimate based on current US market prices. Final invoice may vary by +/- 5%.", 14, finalY + 20)
    doc.text("Valid for 7 days from generation.", 14, finalY + 25)

    // Save
    doc.save(`Hobort_Quote_${data.id}.pdf`)
}
