export const calculateQuotation = (items, taxMode = "exclusive") => {
  let subtotal = 0;
  let discountTotal = 0;
  let taxableAmount = 0;
  let taxTotal = 0;

  const calculatedItems = items.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const rate = Math.max(0, Number(item.taxRate) || 0);

    const gross = unitPrice * quantity;

    const requestedDiscount =
      item.discountType === "percentage"
        ? gross * (Math.min(100, Math.max(0, Number(item.discount) || 0)) / 100)
        : Math.min(gross, Math.max(0, Number(item.discount) || 0));

    const net = gross - requestedDiscount;

    let taxable = net;
    let tax = 0;
    let total = net;

    if (taxMode === "exclusive") {
      tax = net * (rate / 100);
      total = net + tax;
    } else if (taxMode === "inclusive") {
      tax = rate > 0 ? net - net / (1 + rate / 100) : 0;
      taxable = net - tax;
      total = net;
    }

    subtotal += gross;
    discountTotal += requestedDiscount;
    taxableAmount += taxable;
    taxTotal += tax;

    return {
      ...item,
      quantity,
      unitPrice,
      discount: Number(item.discount) || 0,
      taxableAmount: Number(taxable.toFixed(2)),
      taxAmount: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  });

  return {
    items: calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountTotal.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    grandTotal: Number(
      calculatedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2),
    ),
  };
};

import puppeteer from "puppeteer";

export const generateQuotationPDF = async (html) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
