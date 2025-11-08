import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// --- PDF Configuration ---
// We use a safe, standard font. Registering custom fonts in react-pdf
// requires hosting font files, which is a separate setup step.
const FONT_FAMILY = 'Helvetica';
const ACCENT_COLOR = '#5E35B1'; // Professional Purple
const TEXT_COLOR = '#1A1A1A';
const SUBTEXT_COLOR = '#555555';
const BORDER_COLOR = '#E0E0E0';
const LIGHT_BG_COLOR = '#F9F9F9';

// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    padding: 40,
    backgroundColor: '#fff',
    color: TEXT_COLOR,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sellerDetails: {
    width: '50%',
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: 'contain',
    objectPosition: 'right center',
    alignSelf: 'flex-end',
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 5,
  },
  sellerAddress: {
    fontSize: 9,
    color: SUBTEXT_COLOR,
    lineHeight: 1.4,
  },
  // --- Bill To & Invoice Details ---
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderBottom: 1,
    borderColor: BORDER_COLOR,
    paddingVertical: 10,
    marginBottom: 20,
  },
  billTo: {
    width: '45%',
  },
  invoiceDetails: {
    width: '45%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  detailLabel: {
    width: 90,
    color: SUBTEXT_COLOR,
  },
  detailValue: {
    color: TEXT_COLOR,
    fontWeight: 'bold',
  },
  // --- Table ---
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: LIGHT_BG_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableCol: {
    padding: 8,
  },
  th: {
    fontWeight: 'bold',
    fontSize: 9,
    color: ACCENT_COLOR,
  },
  td: {
    fontSize: 9,
  },
  colItem: { width: '35%' },
  colHsn: { width: '15%' },
  colQty: { width: '10%', textAlign: 'center' },
  colRate: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  // --- Totals ---
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsContainer: {
    width: '45%',
    border: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  totalLabel: {
    color: SUBTEXT_COLOR,
  },
  totalValue: {
    fontWeight: 'bold',
  },
  grandTotal: {
    backgroundColor: ACCENT_COLOR,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  footerCol: {
    width: '30%',
  },
  footerQr: {
    width: '30%',
    alignItems: 'center',
  },
  footerSignature: {
    width: '30%',
    alignItems: 'flex-end',
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    marginBottom: 5,
  },
  footerText: {
    fontSize: 9,
    color: SUBTEXT_COLOR,
    lineHeight: 1.4,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  signatureImage: {
    width: 100,
    height: 40,
  },
  signatureLine: {
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: TEXT_COLOR,
    marginTop: 40,
  },
  signatureText: {
    fontSize: 9,
    color: SUBTEXT_COLOR,
    marginTop: 5,
  },
  notes: {
    fontSize: 9,
    color: SUBTEXT_COLOR,
    textAlign: 'center',
  },
});

const formatCurrency = (num) => {
  const safeNum = Number(num) || 0;
  return safeNum.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAddress = (addr) => {
  if (!addr) return '';
  return [addr.street, addr.city, addr.state, addr.pincode, addr.country]
    .filter(Boolean)
    .join(', ');
};

// This is the React-PDF Template Component
export const InvoiceTemplate = ({ invoiceData, sellerData, qrCodeDataURL, logoDataURL, signatureDataURL }) => {
  const {
    items = [],
    invoiceNumber, invoiceDate, dueDate, placeOfSupply, countryOfSupply,
    clientName, clientAddress, clientGst, clientPan,
    subtotal = 0, discountAmount = 0, taxableAmount = 0,
    cgst = 0, sgst = 0, igst = 0, total = 0,
    earlyPayDiscount = 0, totalDue = 0,
    amountInWords = '',
    termsAndConditions = '', additionalNotes = '',
  } = invoiceData;

  const {
    businessName, address: sellerAddress, gstin: sellerGstin, pan: sellerPan,
    bankDetails,
  } = sellerData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* --- 1. Header (Logo & Seller) --- */}
        <View style={styles.header}>
          <View style={styles.sellerDetails}>
            <Text style={styles.businessName}>{businessName || 'Your Business Name'}</Text>
            <Text style={styles.sellerAddress}>{formatAddress(sellerAddress || {})}</Text>
            {sellerGstin && <Text style={styles.sellerAddress}>GSTIN: {sellerGstin}</Text>}
            {sellerPan && <Text style={styles.sellerAddress}>PAN: {sellerPan}</Text>}
          </View>
          {logoDataURL && <Image src={logoDataURL} style={styles.logo} />}
        </View>

        {/* --- 2. Bill To & Invoice Details --- */}
        <View style={styles.detailsSection}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={[styles.detailValue, { marginBottom: 5 }]}>{clientName || 'Client Name'}</Text>
            <Text style={styles.sellerAddress}>{formatAddress(clientAddress || {})}</Text>
            {clientGst && <Text style={styles.sellerAddress}>GSTIN: {clientGst}</Text>}
            {clientPan && <Text style={styles.sellerAddress}>PAN: {clientPan}</Text>}
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Invoice No:</Text><Text style={styles.detailValue}>{invoiceNumber}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Invoice Date:</Text><Text>{invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : '--'}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Due Date:</Text><Text>{dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '--'}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Place of Supply:</Text><Text>{placeOfSupply || '--'}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Country:</Text><Text>{countryOfSupply || 'India'}</Text></View>
          </View>
        </View>
        
        {/* --- 3. Items Table --- */}
        <View style={styles.table}>
          {/* Header */}
          <View style={[styles.tableHeader, styles.th]}>
            <View style={[styles.tableCol, styles.colItem]}><Text>Item/Description</Text></View>
            <View style={[styles.tableCol, styles.colHsn]}><Text>HSN/SAC</Text></View>
            <View style={[styles.tableCol, styles.colQty]}><Text>Qty</Text></View>
            <View style={[styles.tableCol, styles.colRate, { textAlign: 'right' }]}><Text>Rate</Text></View>
            <View style={[styles.tableCol, styles.colAmount, { textAlign: 'right' }]}><Text>Amount</Text></View>
          </View>
          {/* Rows */}
          {(items.length > 0 ? items : [{}]).map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={[styles.tableCol, styles.td, styles.colItem]}><Text>{item.description}</Text></View>
              <View style={[styles.tableCol, styles.td, styles.colHsn]}><Text>{item.hsnSacCode}</Text></View>
              <View style={[styles.tableCol, styles.td, styles.colQty, { textAlign: 'center' }]}><Text>{item.qty}</Text></View>
              <View style={[styles.tableCol, styles.td, styles.colRate, { textAlign: 'right' }]}><Text>{formatCurrency(item.rate)}</Text></View>
              <View style={[styles.tableCol, styles.td, styles.colAmount, { textAlign: 'right' }]}><Text>{formatCurrency(item.amount)}</Text></View>
            </View>
          ))}
        </View>

        {/* --- 4. Totals --- */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalItem}><Text style={styles.totalLabel}>Sub Total</Text><Text style={styles.totalValue}>Rs. {formatCurrency(subtotal)}</Text></View>
            {discountAmount > 0 && <View style={styles.totalItem}><Text style={styles.totalLabel}>Discount</Text><Text style={styles.totalValue}>- Rs. {formatCurrency(discountAmount)}</Text></View>}
            <View style={styles.totalItem}><Text style={styles.totalLabel}>Taxable Amount</Text><Text style={styles.totalValue}>Rs. {formatCurrency(taxableAmount)}</Text></View>
            {igst > 0 ? (
              <View style={styles.totalItem}><Text style={styles.totalLabel}>IGST</Text><Text style={styles.totalValue}>Rs. {formatCurrency(igst)}</Text></View>
            ) : (
              <>
                <View style={styles.totalItem}><Text style={styles.totalLabel}>CGST</Text><Text style={styles.totalValue}>Rs. {formatCurrency(cgst)}</Text></View>
                <View style={styles.totalItem}><Text style={styles.totalLabel}>SGST</Text><Text style={styles.totalValue}>Rs. {formatCurrency(sgst)}</Text></View>
              </>
            )}
            <View style={[styles.totalItem]}><Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total</Text><Text style={[styles.totalValue]}>Rs. {formatCurrency(total)}</Text></View>
            {earlyPayDiscount > 0 && <View style={styles.totalItem}><Text style={styles.totalLabel}>EarlyPay Discount</Text><Text style={styles.totalValue}>- Rs. {formatCurrency(earlyPayDiscount)}</Text></View>}
            <View style={[styles.totalItem, styles.grandTotal]}><Text>Total Due</Text><Text>Rs. {formatCurrency(totalDue)}</Text></View>
          </View>
        </View>

        {/* --- 5. Amount in Words --- */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Invoice Total (in words)</Text>
          <Text style={{ fontSize: 10, color: SUBTEXT_COLOR }}>{amountInWords || '---'}</Text>
        </View>
        
        {/* --- 6. Footer --- */}
        <View style={styles.footer} fixed>
          <View style={styles.footerTop}>
            {/* Bank Details */}
            <View style={styles.footerCol}>
              <Text style={styles.footerTitle}>Bank & Payment Details</Text>
              <Text style={styles.footerText}>A/C Name: {bankDetails?.accountName}</Text>
              <Text style={styles.footerText}>A/C No: {bankDetails?.accountNumber}</Text>
              <Text style={styles.footerText}>Bank: {bankDetails?.bankName}</Text>
              <Text style={styles.footerText}>IFSC: {bankDetails?.ifscCode}</Text>
            </View>
            
            {/* QR Code */}
            <View style={styles.footerQr}>
              {qrCodeDataURL && <Image src={qrCodeDataURL} style={styles.qrImage} />}
              <Text style={styles.footerTitle}>Scan to Pay (UPI)</Text>
            </View>

            {/* Signature */}
            <View style={styles.footerSignature}>
              {signatureDataURL && <Image src={signatureDataURL} style={styles.signatureImage} />}
              {!signatureDataURL && <View style={styles.signatureLine} />}
              <Text style={styles.signatureText}>Authorized Signature</Text>
            </View>
          </View>
          
          {/* Terms & Notes */}
          <View>
            <Text style={styles.footerTitle}>Terms & Conditions</Text>
            <Text style={styles.footerText}>{termsAndConditions || 'N/A'}</Text>
            {additionalNotes && <Text style={[styles.footerTitle, { marginTop: 10 }]}>Additional Notes</Text>}
            {additionalNotes && <Text style={styles.footerText}>{additionalNotes}</Text>}
          </View>
        </View>

      </Page>
    </Document>
  );
};