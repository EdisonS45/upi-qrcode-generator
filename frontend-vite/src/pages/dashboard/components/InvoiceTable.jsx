import toast from "react-hot-toast";
import { format } from "date-fns";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // You'd get this from Shadcn
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

// You would run `npx shadcn-ui@latest add badge` to get this
const BadgeComponent = ({ variant, children }) => {
  const colors = {
    Paid: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Overdue: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
        colors[variant] || "bg-gray-100 text-gray-800"
      }`}
    >
      {children}
    </span>
  );
};
const getErrorFromBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        resolve(json.message || "Unknown server error");
      } catch (e) {
        resolve("Failed to parse error response");
      }
    };
    reader.onerror = () => {
      reject("Failed to read error blob");
    };
    reader.readAsText(blob);
  });
};

export default function InvoiceTable({ invoices }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case "Paid":
        return "Paid";
      case "Pending":
        return "Pending";
      case "Overdue":
        return "Overdue";
      default:
        return "default";
    }
  };

  const openPdf = async (invoiceId, invoiceNumber) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: "blob", // Important
      });

      // Success: The server returned a PDF
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error opening PDF:", error);

      // --- IMPROVEMENT IS HERE ---
      // Check if the error response is a blob (which contains our JSON error)
      if (error.response && error.response.data instanceof Blob) {
        const errorMessage = await getErrorFromBlob(error.response.data);
        toast.error(`Could not open PDF: ${errorMessage}`);
      } else {
        toast.error("Could not open PDF.");
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice._id}>
            <TableCell className="font-medium">{invoice.clientName}</TableCell>
            <TableCell>{formatCurrency(invoice.total)}</TableCell>
            <TableCell>
              <BadgeComponent variant={getStatusVariant(invoice.status)}>
                {invoice.status}
              </BadgeComponent>
            </TableCell>
            <TableCell>
              {format(new Date(invoice.invoiceDate), "dd-MM-yyyy")}
            </TableCell>
            <TableCell>{invoice.invoiceNumber}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openPdf(invoice._id, invoice.invoiceNumber)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
