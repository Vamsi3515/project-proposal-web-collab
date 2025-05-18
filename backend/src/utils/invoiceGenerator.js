// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// function createInvoice(invoice, invoiceNumber, logo, signature) {
//   let doc = new PDFDocument({ 
//     size: "A4", 
//     margin: 50,
//     bufferPages: true
//   });

//   // File handling setup
//   const invoiceDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
//   if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });
//   const filePath = path.join(invoiceDir, `invoice_${invoiceNumber}.pdf`);
//   doc.pipe(fs.createWriteStream(filePath));

//   // Generate sections with dynamic positioning
//   let currentY = generateHeader(doc, logo, invoice.businessInfo);
//   currentY = generateCustomerInformation(doc, invoice, invoiceNumber, currentY + 20);
//   currentY = generateInvoiceTable(doc, invoice, currentY + 20);
//   generateFooter(doc, signature, currentY + 50);

//   doc.end();
//   return `/uploads/invoices/invoice_${invoiceNumber}.pdf`;
// }

// function generateHeader(doc, logo, company) {
//   // Logo and Company Info
//   doc.image(logo, 50, 50, { width: 80, align: 'left' });
  
//   doc.fillColor("#2c3e50")
//      .fontSize(16)
//      .text(company.name, 140, 55)
//      .fontSize(9)
//      .fillColor("#666666")
//      .text(company.address1, 140, 75)
//      .text(company.address2, 140, 88);

  // // Invoice Title
  // doc.fontSize(20)
  //    .fillColor("#2c3e50")
  //    .text("INVOICE", doc.page.width - 250, 50, { width: 200, align: "right" });

  // // Contact Info
  // doc.fontSize(9)
  //    .text(`Phone: ${company.phone}`, { 
  //      align: "right",
  //      width: 200,
  //      x: doc.page.width - 50,
  //      y: 75
  //    })
  //    .text(`Email: ${company.email}`, { 
  //      align: "right",
  //      width: 200,
  //      x: doc.page.width - 50,
  //      y: 88
  //    })
  //    .text(company.website, { 
  //      align: "right",
  //      width: 200,
  //      x: doc.page.width - 50,
  //      y: 101
  //    });

//   generateHr(doc, 120);
//   return 130; // Return current Y position
// }

// function generateCustomerInformation(doc, invoice, orderId, yPos) {
//   const startY = yPos + 30;
  
//   // Left Column - Invoice Details
//   doc.fontSize(10)
//      .fillColor("#444444")
//      .text("Invoice Number:", 50, startY)
//      .text(orderId, 150, startY)
//      .text("Invoice Date:", 50, startY + 15)
//      .text(formatDate(new Date()), 150, startY + 15)
//      .text("Project Cost:", 50, startY + 30)
//      .text(formatCurrency(invoice.paymentInfo.total), 150, startY + 30)
//      .text("Balance Due:", 50, startY + 45)
//      .text(formatCurrency(invoice.paymentInfo.dueAmount), 150, startY + 45);

//   // Right Column - Client Info
//   doc.font("Helvetica-Bold")
//      .text(invoice.clientInfo.name, 300, startY)
//      .font("Helvetica")
//      .text(invoice.clientInfo.email, 300, startY + 15)
//      .text(invoice.clientInfo.phone, 300, startY + 30)
//      .text(invoice.clientInfo.college, 300, startY + 45)
//      .text(invoice.clientInfo.domain.replace('/uploads/domains/', ''), 300, startY + 60);

//   generateHr(doc, startY + 80);
//   return startY + 90;
// }

// function generateInvoiceTable(doc, invoice, yPos) {
//   const startY = yPos + 10;
//   const col1 = 50;
//   const col2 = 250;
//   const col3 = doc.page.width - 100;

//   // Table Header
//   doc.font("Helvetica-Bold")
//      .fontSize(10)
//      .fillColor("#ffffff")
//      .rect(col1, startY, doc.page.width - 100, 20)
//      .fill("#2c3e50")
//      .fillColor("#ffffff")
//      .text("Project", col1 + 5, startY + 5)
//      .text("Delivery Date", col2, startY + 5)
//      .text("Amount", col3, startY + 5, { align: "right" });

//   // Table Rows
//   let currentY = startY + 25;
//   invoice.items.forEach((item, index) => {
//     doc.font("Helvetica")
//        .fontSize(9)
//        .fillColor("#444444")
//        .text(item.name, col1 + 5, currentY)
//        .text(formatDeliveryDate(item.deliveryBy), col2, currentY)
//        .text(formatCurrency(item.paid_amt), col3, currentY, { align: "right" });

//     currentY += 20;
//     if(index < invoice.items.length - 1) {
//       generateHr(doc, currentY - 5);
//     }
//   });

//   // Summary Section
//   const summaryY = currentY + 20;
//   doc.font("Helvetica")
//      .text("Subtotal:", col3 - 100, summaryY, { align: "right" })
//      .text(formatCurrency(invoice.paymentInfo.subtotal), col3, summaryY, { align: "right" })
//      .text("Paid To Date:", col3 - 100, summaryY + 20, { align: "right" })
//      .text(formatCurrency(invoice.paymentInfo.total_paid), col3, summaryY + 20, { align: "right" })
//      .font("Helvetica-Bold")
//      .text("Balance Due:", col3 - 100, summaryY + 40, { align: "right" })
//      .text(formatCurrency(invoice.paymentInfo.dueAmount), col3, summaryY + 40, { align: "right" });

//   return summaryY + 60;
// }

// function generateFooter(doc, signature, yPos) {
//   const footerY = yPos + 50;
//   if (signature && fs.existsSync(signature)) {
//     doc.image(signature, 50, footerY, { width: 100 });
//   }

//   doc.fontSize(10)
//      .fillColor("#666666")
//      .text("Issued by:", 50, footerY + 30)
//      .text("Thank you for your business!", { 
//        align: "center", 
//        width: doc.page.width - 100,
//        x: 50,
//        y: footerY + 50
//      });
// }

// // Helper functions remain the same
// function generateHr(doc, y) {
//   doc.strokeColor("#e0e0e0")
//      .lineWidth(1)
//      .moveTo(50, y)
//      .lineTo(doc.page.width - 50, y)
//      .stroke();
// }

// function formatCurrency(cents) {
//   const amount = typeof cents === 'number' ? cents : 0;
//   return "₹" + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
// }

// function formatDate(date) {
//   return date.toLocaleDateString('en-GB');
// }

// function formatDeliveryDate(dateString) {
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
//   } catch {
//     return dateString;
//   }
// }

// module.exports = { createInvoice };







// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// function createInvoice(invoice, invoiceNumber, logo, signature) {
//     let doc = new PDFDocument({
//         size: "A4",
//         margin: 50,
//         bufferPages: true // Prevents content overflow
//     });

//     // Ensure invoices directory exists
//     const invoiceDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
//     if (!fs.existsSync(invoiceDir)) {
//         fs.mkdirSync(invoiceDir, { recursive: true });
//     }

//     const invoiceFileName = `invoice_${invoiceNumber}.pdf`;
//     const filePath = path.join(invoiceDir, invoiceFileName);
//     doc.pipe(fs.createWriteStream(filePath));

//     generateHeader(doc, logo, invoice.businessInfo);
//     generateCustomerInformation(doc, invoice, invoiceNumber);
//     generateInvoiceTable(doc, invoice);
//     generateFooter(doc, signature);

//     doc.end();

//     return `/uploads/invoices/${invoiceFileName}`;
// }

// function generateHeader(doc, logo, company) {
//     const logoWidth = 80;
//     const logoX = 50;
//     const logoY = 50;

//     if (logo && fs.existsSync(logo)) {
//         doc.image(logo, logoX, logoY, { width: logoWidth });
//     }

//     const companyInfoX = logoX + logoWidth + 10;
//     doc.fillColor("#000")
//         .fontSize(12)
//         .text(company.name, companyInfoX, logoY)
//         .fontSize(7)
//         .fillColor("#555")
//         .text(company.address1, companyInfoX, logoY + 13)
//         .text(company.address2, companyInfoX, logoY + 23);

//     doc.fontSize(16)
//         .fillColor("#000")
//         .text("INVOICE", doc.page.width - 150, 50, { align: "right" });

//     doc.fontSize(8)
//         .fillColor("#555")
//         .text(`Phone: ${company.phone}`, doc.page.width - 150, 70, { align: "right" })
//         .text(`Email: ${company.email}`, doc.page.width - 150, 80, { align: "right" })
//         .text(`Website: ${company.website}`, doc.page.width - 150, 90, { align: "right" });

//     generateHr(doc, 110);
// }

// function generateCustomerInformation(doc, invoice, orderId) {
//     const customerInfoTop = 125;
//     const labelX = 50;
//     const valueX = 150;
//     const billToX = 300;

//     doc.fontSize(9)
//         .fillColor("#000")
//         .text("Invoice Number:", labelX, customerInfoTop)
//         .text(orderId, valueX, customerInfoTop)
//         .text("Invoice Date:", labelX, customerInfoTop + 15)
//         .text(formatDate(new Date()), valueX, customerInfoTop + 15)
//         .text("Project Cost:", labelX, customerInfoTop + 30)
//         .text(formatCurrency(invoice.paymentInfo.total), valueX, customerInfoTop + 30)
//         .text("Balance Due:", labelX, customerInfoTop + 45)
//         .text(formatCurrency(invoice.paymentInfo.dueAmount), valueX, customerInfoTop + 45);

//     doc.font("Helvetica-Bold")
//         .text("Bill To:", billToX, customerInfoTop)
//         .font("Helvetica")
//         .text(invoice.clientInfo.name, billToX, customerInfoTop + 15)
//         .text(invoice.clientInfo.email, billToX, customerInfoTop + 30)
//         .text(invoice.clientInfo.college, billToX, customerInfoTop + 45)
//         .fontSize(8)
//         .text(invoice.clientInfo.domain.replace('/uploads/domains/', ''), billToX, customerInfoTop + 60);

//     generateHr(doc, customerInfoTop + 80);
// }

// function generateInvoiceTable(doc, invoice) {
//     const invoiceTableTop = 210; // Move table up slightly
//     const columnWidths = [180, 100, 100];
//     const columnPositions = [50, 50 + columnWidths[0], doc.page.width - 50 - columnWidths[2]];

//     // Table header
//     doc.font("Helvetica-Bold")
//         .fontSize(9)
//         .fillColor("#fff")
//         .rect(50, invoiceTableTop, doc.page.width - 100, 20)
//         .fill("#2c3e50")
//         .fillColor("#fff")
//         .text("Project", columnPositions[0], invoiceTableTop + 6)
//         .text("Delivery Date", columnPositions[1], invoiceTableTop + 6)
//         .text("Amount", columnPositions[2], invoiceTableTop + 6, { align: "right" });

//     // Table rows
//     let currentY = invoiceTableTop + 20;
//     invoice.items.forEach((item, index) => {
//         const bgColor = index % 2 === 0 ? "#f9f9f9" : "#fff";
//         doc.rect(50, currentY, doc.page.width - 100, 15)
//             .fill(bgColor);

//         doc.font("Helvetica")
//             .fontSize(8)
//             .fillColor("#000")
//             .text(item.name, columnPositions[0], currentY + 4)
//             .text(formatDeliveryDate(item.deliveryBy), columnPositions[1], currentY + 4)
//             .text(formatCurrency(item.paid_amt), columnPositions[2], currentY + 4, { align: "right" });

//         currentY += 15;
//     });

//     // Summary section
//     const summaryY = currentY + 10;
//     doc.font("Helvetica")
//         .fontSize(9)
//         .text("Subtotal:", doc.page.width - 180, summaryY, { align: "right" })
//         .text(formatCurrency(invoice.paymentInfo.subtotal), doc.page.width - 50, summaryY, { align: "right" })
//         .text("Paid To Date:", doc.page.width - 180, summaryY + 15, { align: "right" })
//         .text(formatCurrency(invoice.paymentInfo.total_paid), doc.page.width - 50, summaryY + 15, { align: "right" })
//         .font("Helvetica-Bold")
//         .text("Balance Due:", doc.page.width - 180, summaryY + 30, { align: "right" })
//         .text(formatCurrency(invoice.paymentInfo.dueAmount), doc.page.width - 50, summaryY + 30, { align: "right" });
// }

// function generateFooter(doc, signature) {
//     const footerY = 750; // Move footer down slightly

//     // Signature if available
//     if (signature && fs.existsSync(signature)) {
//         doc.image(signature, 50, footerY - 20, { width: 100 });
//     }

//     doc.fontSize(8)
//         .fillColor("#555")
//         .text("Issued by:", 50, footerY + 15)
//         .text("Thank you for your business!", {
//             align: "center",
//             width: doc.page.width - 100,
//             x: 50,
//             y: footerY + 30
//         });
// }

// function generateHr(doc, y) {
//     doc.strokeColor("#e0e0e0")
//         .lineWidth(0.7) // Slightly thinner line
//         .moveTo(50, y)
//         .lineTo(doc.page.width - 50, y)
//         .stroke();
// }

// function formatCurrency(cents) {
//     const amount = typeof cents === 'number' ? cents : 0;
//     return amount.toLocaleString('en-IN', {
//         style: 'currency',
//         currency: 'INR',
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });
// }

// function formatDate(date) {
//     const d = new Date(date);
//     const day = d.getDate().toString().padStart(2, '0');
//     const month = (d.getMonth() + 1).toString().padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`; // DD/MM/YYYY format
// }

// function formatDeliveryDate(dateString) {
//     try {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-GB', {
//             weekday: 'short',
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric'
//         });
//     } catch {
//         return dateString; // Fallback to original if parsing fails
//     }
// }

// module.exports = { createInvoice };

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { randomInt } = require('crypto');

dejavuFontPath = path.join(__dirname, '..', '..', 'assets/fonts', 'DejaVuSans.ttf');

//create new invoice
function createInvoice(invoice, invoiceNumber, logo, signature) {
    let doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true
    });

    doc.registerFont('DejaVu', dejavuFontPath);

    const invoiceDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
    if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoiceFileName = `invoice_${invoiceNumber}.pdf`;
    const filePath = path.join(invoiceDir, invoiceFileName);
    doc.pipe(fs.createWriteStream(filePath));

    generateHeader(doc, logo, invoice);
    generateCustomerInformation(doc, invoice, invoiceNumber);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc, signature);

    doc.end();

    return `/uploads/invoices/${invoiceFileName}`;
}

//generate invoice header
function generateHeader(doc, logo, invoice) {
    const logoWidth = 200;
    const logoX = 20;
    const logoY = -30;

    if (logo && fs.existsSync(logo)) {
        doc.image(logo, logoX, logoY, { width: logoWidth });
    }

    const invoiceTextX = logoX + logoWidth+ 40;

    doc.fontSize(16)
        .fillColor("#000")
        .text("INVOICE", invoiceTextX,50);

    doc.fillColor("#000")
        .fontSize(10)
        .text(invoice.bussinessInfo.name, doc.page.width - 230, 30, { align: "right" })
        .fontSize(7)
        .fillColor("#555")
        .text(invoice.bussinessInfo.address1, doc.page.width - 230, 45, { align: "right" })
        .text(invoice.bussinessInfo.address2, doc.page.width - 230, 55, { align: "right" });

    doc.fontSize(8)
        .fillColor("#555")
        .text(`Phone: ${invoice.bussinessInfo.phone}`, doc.page.width - 230, 70, { align: "right" })
        .text(`Email: ${invoice.bussinessInfo.email}`, doc.page.width - 230, 80, { align: "right" })
        .text(`Website: ${invoice.bussinessInfo.website}`, doc.page.width - 230, 90, { align: "right" });

    generateHr(doc, 110);
}

//generate customer information
function generateCustomerInformation(doc, invoice, orderId) {
    const customerInfoTop = 125;
    const labelX = 80;
    const valueX = 150;
    const billToX = 400;

    doc.font('DejaVu')
      .fontSize(9)
      .fillColor("#000")
      .text("Invoice Number : ", labelX, customerInfoTop)
      .text(orderId, valueX+10, customerInfoTop)
      .text("Invoice Date : ", labelX, customerInfoTop + 15)
      .text(formatDate(new Date()), valueX, customerInfoTop + 15)
      .text("Project Cost : ", labelX, customerInfoTop + 30)
      .text(formatCurrency(invoice.paymentInfo.total), valueX, customerInfoTop + 30)
      .text("Balance Due : ", labelX, customerInfoTop + 45)
      .text(formatCurrency(invoice.paymentInfo.dueAmount), valueX, customerInfoTop + 45);

    doc.font("Helvetica-Bold")
        .text("Bill To:", billToX-30, customerInfoTop)
        .font("Helvetica")
        .text("Name   :  ", billToX-30, customerInfoTop + 15)
        .text(invoice.clientInfo.name, billToX+5, customerInfoTop + 15)
        .text("Email   : ", billToX-30, customerInfoTop + 30)
        .text(invoice.clientInfo.email, billToX+5, customerInfoTop + 30)
        .text("College : ", billToX-30, customerInfoTop + 45)
        .text(invoice.clientInfo.college, billToX+5, customerInfoTop + 45)
        .fontSize(8)
        .text("Domain  : ", billToX-30, customerInfoTop + 60)
        .text(invoice.clientInfo.domain, billToX+5, customerInfoTop + 60);

    generateHr(doc, customerInfoTop + 80);
}

//generate billing table
function generateInvoiceTable(doc, invoice) {
    const invoiceTableTop = 210;
    const columnWidths = [180, 100, 70];
    const columnPositions = [50, 50 + columnWidths[0], doc.page.width - 50 - columnWidths[2] - 30];

    doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#fff")
        .rect(50, invoiceTableTop, doc.page.width - 100, 20)
        .fill("#2c3e50")
        .fillColor("#fff")
        .text("Project", columnPositions[0], invoiceTableTop + 6)
        .text("Delivery Date", columnPositions[1], invoiceTableTop + 6)
        .text("Amount", columnPositions[2], invoiceTableTop + 6, { align: "right" });

    let currentY = invoiceTableTop + 20;
    invoice.items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? "#f9f9f9" : "#fff";
        doc.rect(50, currentY, doc.page.width - 100, 15)
            .fill(bgColor);

        doc.font("DejaVu")
            .fontSize(8)
            .fillColor("#000")
            .text(item.name, columnPositions[0], currentY + 4)
            .text(formatDeliveryDate(item.deliveryBy), columnPositions[1], currentY + 4)
            .text(formatCurrency(item.paid_amt), columnPositions[2], currentY + 4, { align: "right" });

        currentY += 15;
    });

    const summaryY = currentY + 10;
    const summaryX = doc.page.width - 50;

    doc.font("DejaVu")
        .fontSize(9)
        .text("Subtotal : ", summaryX-300, summaryY, { align: "center" })
        .text(formatCurrency(invoice.paymentInfo.subtotal), summaryX - 80, summaryY)
        .text("Paid To Date : ", summaryX-300, summaryY + 15, { align: "center" })
        .text(formatCurrency(invoice.paymentInfo.total_paid), summaryX - 80, summaryY + 15)
        .font("Helvetica-Bold")
        .text("Balance Due : ", summaryX-300, summaryY + 30, { align: "center" })
        .text(formatCurrency(invoice.paymentInfo.dueAmount), summaryX - 80, summaryY + 30);
}

//generate invoice footer
function generateFooter(doc, signature) {
    const footerY = 750;

    if (signature && fs.existsSync(signature)) {
        doc.image(signature, 50, footerY - 20, { width: 100 });
    }

    doc.fontSize(8)
        .fillColor("#555")
        .text("Issued by:", 50, footerY + 15)
        .text("Thank you for your business!", {
            align: "center",
            width: doc.page.width - 100,
            x: 50,
            y: footerY + 30
        });
}

function generateHr(doc, y) {
    doc.strokeColor("#e0e0e0")
        .lineWidth(0.7)
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .stroke();
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDeliveryDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
}

module.exports = { createInvoice };

//testing formate
// // Example usage with your invoice data structure
// const invoiceData = {
//     bussinessInfo: {
//         name: 'HUGU TECHNOLOGIES',
//         address1: '# 2nd Floor, Chenna Complex,Opp Mega Theatre',
//         address2: 'Pillar No P-1542,Near Dilsukhnagar, Hyderabad',
//         phone: '+91 8106803105, +91 6303063542',
//         email: 'info@hugotechnologies.in',
//         website: 'http://www.hugotechnologies.in'
//     },
//     clientInfo: {
//         name: "Some Client Name",
//         email: "client@example.com",
//         phone: "Some College",
//         college: "SITAM",
//         domain: "web devlopment",
//       },
//     items: [
//         {
//             name: "ai resume maker",
//             deliveryBy: "Wed May 28 2025 00:00:00 GMT-0530 (India Standard Time)",
//             paid_amt: 1200
//         }
//     ],
//     paymentInfo: {
//         subtotal: 1200,
//         total_paid: 1200,
//         dueAmount: 8800,
//         total: 10000
//     }
// };

// const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');
// const signatureImagePath = path.join(__dirname, '..', '..', 'assets', 'signature.png');
// const invoiceNumber = invoiceData.invoiceNumber;

// const invoicePath = createInvoice(invoiceData, 13257365751, logoPath, signatureImagePath)+randomInt(10);
// console.log('Invoice generated at:', invoicePath);