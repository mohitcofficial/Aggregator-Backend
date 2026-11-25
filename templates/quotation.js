const escapeHTML = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const date = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const safeMultiline = (value = "") =>
  escapeHTML(value).replace(/\r?\n/g, "<br />");

const getCustomer = (lead = {}) => ({
  name: lead.companyName || lead.name || "Customer",
  contact: lead.name || "",
  email: lead.email || "",
  phone: lead.phoneNumber || "",
  address: lead.address || "",
});

const renderItems = (items = []) =>
  items
    .map((item, index) => {
      const location = [item.locationName, item.cityName, item.stateName]
        .filter(Boolean)
        .map(escapeHTML)
        .join(", ");

      return `
        <tr>
          <td class="center">${index + 1}</td>

          <td>
            <div class="item-name">
              ${escapeHTML(item.service || "Service")}
            </div>

            ${
              item.planName
                ? `<div class="muted">${escapeHTML(item.planName)}</div>`
                : ""
            }

            ${location ? `<div class="muted">${location}</div>` : ""}
          </td>

          <td class="center">
            ${escapeHTML(item.duration ?? "—")}
            ${escapeHTML(item.durationUnit || "")}
          </td>

          <td class="center">
            ${Number(item.quantity || 0)}
          </td>

          <td class="right">
            ${money(item.unitPrice)}
          </td>

          <td class="right">
            ${money(item.discount || 0)}
          </td>

          <td class="right amount">
            ${money(item.total)}
          </td>
        </tr>
      `;
    })
    .join("");

export const generateQuotationHTML = (
  quotation,
  email = "sales@virtualxcel.in",
) => {
  const customer = getCustomer(quotation.leadId || {});

  const quotationNumber = escapeHTML(quotation.quotationNumber || "—");
  const items = quotation.items || [];

  const taxLabel = quotation.taxMode === "inclusive" ? "Tax included" : "Tax";

  const notes = quotation.notes
    ? `
      <section class="content-section">
        <div class="section-heading">Notes</div>
        <div class="paragraph">${safeMultiline(quotation.notes)}</div>
      </section>
    `
    : "";

  const terms = quotation.terms
    ? `
      <section class="content-section">
        <div class="section-heading">Terms & Conditions</div>
        <div class="paragraph">${safeMultiline(quotation.terms)}</div>
      </section>
    `
    : "";

  // --------------------------------
  // WHAT YOU GET
  // --------------------------------

  const whatYouGet = `
    <section class="content-section benefits-section">
      <div class="section-heading">What You Get</div>

      <div class="benefits-grid">

        <div class="benefit-item">
          <span class="benefit-number">01</span>
          <div>
            <strong>Premium Business Address</strong>
            <p>
              Use your premium office address on visiting cards,
              letterheads, mailers, websites and all business
              communications until the agreement expiry date.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">02</span>
          <div>
            <strong>Registered Address Transfer</strong>
            <p>
              Shift your existing company's registered address
              to the address provided by VirtualXcel.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">03</span>
          <div>
            <strong>New Business Registration</strong>
            <p>
              Use the provided address for registering your
              new business entity.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">04</span>
          <div>
            <strong>GST Registration</strong>
            <p>
              Use the address for GST registration,
              subject to applicable requirements.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">05</span>
          <div>
            <strong>Registration Verification Support</strong>
            <p>
              Business and GST registration verification
              support at the venue.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">06</span>
          <div>
            <strong>Bank Account Verification Support</strong>
            <p>
              Verification support for opening your
              company's current account.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">07</span>
          <div>
            <strong>Mail & Courier Receiving</strong>
            <p>
              Mail and courier receiving services are
              included in the plan.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">08</span>
          <div>
            <strong>Courier Sending & Forwarding</strong>
            <p>
              Courier sending and forwarding facilities
              are available at additional courier charges.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">09</span>
          <div>
            <strong>Temporary Company Signage</strong>
            <p>
              Temporary company signage board during
              the verification process.
            </p>
          </div>
        </div>

        <div class="benefit-item">
          <span class="benefit-number">10</span>
          <div>
            <strong>Exceptional Customer Support</strong>
            <p>
              Dedicated customer support throughout
              your virtual office journey.
            </p>
          </div>
        </div>

      </div>
    </section>
  `;

  // --------------------------------
  // DOCUMENTS PROVIDED
  // --------------------------------

  const documentsProvided = `
    <section class="content-section documents-section">
      <div class="section-heading">Documents We Provide</div>

      <p class="section-description">
        VirtualXcel provides the following documents and
        supporting paperwork for your virtual office requirements:
      </p>

      <div class="document-list">

        <div class="document-item">
          <span class="document-check">✓</span>
          <span>Rent Agreement</span>
        </div>

        <div class="document-item">
          <span class="document-check">✓</span>
          <span>No Objection Certificate (NOC)</span>
        </div>

        <div class="document-item">
          <span class="document-check">✓</span>
          <span>Utility Bill (Electricity Bill)</span>
        </div>

        <div class="document-item">
          <span class="document-check">✓</span>
          <span>Master Agreement / NOC (if applicable)</span>
        </div>

        <div class="document-item">
          <span class="document-check">✓</span>
          <span>
            Additional supporting documents as required
            in response to queries raised by MCA / ROC / GST authorities.
          </span>
        </div>

      </div>
    </section>
  `;

  // --------------------------------
  // PAYMENT DETAILS
  // --------------------------------

  const paymentDetails = `
    <section class="content-section payment-section">
      <div class="section-heading">Payment Details</div>

      <div class="payment-card">

        <div class="payment-card-heading">
          UPI Payment
        </div>

        <div class="payment-body">
          <div class="payment-detail-row">
            <span>UPI ID</span>
            <strong>virtualxcelsolutions.62843126@hdfcbank</strong>
          </div>
        </div>

      </div>

      <div class="payment-card">

        <div class="payment-card-heading">
          Bank Account Details
        </div>

        <div class="payment-body">

          <div class="payment-detail-row">
            <span>Account Holder</span>
            <strong>Virtualxcel Solutions Pvt Ltd</strong>
          </div>

          <div class="payment-detail-row">
            <span>Account Number</span>
            <strong>50200098118104</strong>
          </div>

          <div class="payment-detail-row">
            <span>IFSC Code</span>
            <strong>HDFC0000043</strong>
          </div>

          <div class="payment-detail-row">
            <span>Bank Name</span>
            <strong>HDFC BANK</strong>
          </div>

          <div class="payment-detail-row">
            <span>Bank Address</span>
            <strong>No E 143, Saket, New Delhi - 110017</strong>
          </div>

        </div>
      </div>

      <div class="payment-note">
        <strong>Payment Instructions</strong>
        <p>
          Please complete the payment and share the payment receipt,
          UTR number or transaction details with our team to
          initiate your booking.
        </p>
      </div>
    </section>
  `;

  // --------------------------------
  // BOOKING PROCESS
  // --------------------------------

  const bookingProcess = `
    <section class="content-section process-section">
      <div class="section-heading">
        Virtual Office Booking Process
      </div>

      <div class="process-intro">
        Follow these simple steps to get your VirtualXcel
        virtual office up and running.
      </div>

      <div class="process-timeline">

        <div class="process-step">
          <div class="process-number">01</div>

          <div class="process-content">
            <strong>Payment & Booking Confirmation</strong>

            <p>
              Complete the payment and share the receipt,
              UTR number or transaction details.
              Your particular booking ID will then be generated.
            </p>
          </div>
        </div>

        <div class="process-step">
          <div class="process-number">02</div>

          <div class="process-content">
            <strong>Document Collection</strong>

            <p>
              Your booking will be assigned to our documentation team.
              You will receive an email from
              <strong>operation@virtualxcel.in</strong>
              containing the list of required documents.
            </p>
          </div>
        </div>

        <div class="process-step">
          <div class="process-number">03</div>

          <div class="process-content">
            <strong>Agreement Draft & Approval</strong>

            <p>
              Our team will prepare the agreement draft for your approval.
              The draft will be shared via email for signing,
              along with the details of two witnesses.
            </p>
          </div>
        </div>

        <div class="process-step">
          <div class="process-number">04</div>

          <div class="process-content">
            <strong>Final Document Delivery</strong>

            <p>
              After completing the approval and signing process,
              you will receive the final agreement copy along
              with the NOC and utility bill.
            </p>
          </div>
        </div>

        <div class="process-step">
          <div class="process-number">05</div>

          <div class="process-content">
            <strong>Booking Completion</strong>

            <p>
              The complete process generally takes a maximum of
              <strong>3–4 working days</strong>, subject to timely
              submission of documents and approvals.
              Timelines may vary in exceptional cases and
              depending on state-specific requirements.
            </p>
          </div>
        </div>

      </div>
    </section>
  `;

  // --------------------------------
  // RETURN HTML
  // --------------------------------

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Quotation ${quotationNumber}</title>

  <style>

    * {
      box-sizing: border-box;
    }

    html {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      margin: 0;
      background: #eef1f5;
      color: #273247;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.55;
    }

    .document {
      width: 210mm;
      min-height: 297mm;
      margin: 24px auto;
      padding: 17mm 16mm;
      background: #fff;
      box-shadow: 0 5px 28px rgba(22, 39, 65, .10);
    }

    .top-accent {
      height: 5px;
      background: #c99b4b;
      margin: -17mm -16mm 25px;
    }

    /* HEADER */

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 23px;
      border-bottom: 1px solid #e5e9ef;
    }

    .brand {
      color: #172b4d;
      font-size: 28px;
      line-height: 1.1;
      font-weight: 800;
      letter-spacing: -.8px;
    }

    .brand span {
      color: #c99b4b;
    }

    .tagline {
      margin-top: 5px;
      color: #8992a1;
      font-size: 9px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }

    .company-info {
      margin-top: 13px;
      color: #697487;
      font-size: 10px;
      line-height: 1.8;
    }

    .quotation-heading {
      min-width: 190px;
      text-align: right;
    }

    .quotation-heading h1 {
      margin: 0 0 9px;
      color: #172b4d;
      font-size: 25px;
      letter-spacing: 1.2px;
    }

    .quotation-number {
      color: #c99b4b;
      font-size: 12px;
      font-weight: 700;
    }

    .meta {
      margin-top: 10px;
      color: #697487;
      line-height: 1.9;
    }

    /* COMMON SECTIONS */

    .section {
      margin-top: 25px;
    }

    .section-heading {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 13px;
      color: #172b4d;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .8px;
      text-transform: uppercase;
    }

    .section-heading:before {
      content: "";
      width: 4px;
      height: 15px;
      background: #c99b4b;
      border-radius: 3px;
      flex-shrink: 0;
    }

    .content-section {
      margin-top: 28px;
    }

    .section-description {
      color: #697487;
      margin: 0 0 13px;
      line-height: 1.8;
    }

    /* CUSTOMER */

    .customer-card {
      padding: 15px 17px;
      background: #f6f8fb;
      border: 1px solid #edf0f4;
      border-radius: 5px;
    }

    .customer-name {
      color: #172b4d;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .customer-detail {
      color: #697487;
      line-height: 1.8;
    }

    .customer-detail strong {
      color: #39465a;
    }

    /* TABLE */

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th {
      padding: 11px 8px;
      background: #172b4d;
      color: #fff;
      font-size: 9px;
      text-align: left;
      font-weight: 700;
      letter-spacing: .3px;
    }

    td {
      padding: 12px 8px;
      border-bottom: 1px solid #e9edf2;
      vertical-align: top;
      color: #39465a;
    }

    tbody tr:nth-child(even) {
      background: #fafbfd;
    }

    .center {
      text-align: center;
    }

    .right {
      text-align: right;
      white-space: nowrap;
    }

    .item-name {
      color: #172b4d;
      font-size: 10px;
      font-weight: 700;
    }

    .muted {
      color: #8590a0;
      font-size: 9px;
      margin-top: 3px;
    }

    .amount {
      color: #172b4d;
      font-weight: 700;
    }

    /* PRICE SUMMARY */

    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .summary {
      width: 270px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding: 7px 2px;
      border-bottom: 1px solid #edf0f4;
      color: #697487;
    }

    .summary-row strong {
      color: #273247;
      white-space: nowrap;
    }

    .grand-total {
      margin-top: 8px;
      padding: 13px 12px;
      background: #172b4d;
      border-radius: 4px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .grand-total span {
      font-size: 11px;
      font-weight: 700;
    }

    .grand-total strong {
      color: #f1cf8b;
      font-size: 17px;
      white-space: nowrap;
    }

    /* BENEFITS */

    .benefits-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 11px;
    }

    .benefit-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      background: #f7f8fa;
      border: 1px solid #edf0f4;
      border-radius: 5px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .benefit-number {
      flex-shrink: 0;
      color: #c99b4b;
      font-size: 12px;
      font-weight: 800;
    }

    .benefit-item strong {
      display: block;
      color: #172b4d;
      font-size: 10px;
      margin-bottom: 4px;
    }

    .benefit-item p {
      margin: 0;
      color: #697487;
      font-size: 9px;
      line-height: 1.7;
    }

    /* DOCUMENTS */

    .document-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
      padding: 15px;
      background: #f7f8fa;
      border: 1px solid #edf0f4;
      border-radius: 5px;
    }

    .document-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: #39465a;
      font-size: 10px;
      line-height: 1.7;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .document-check {
      color: #c99b4b;
      font-weight: 800;
      font-size: 13px;
    }

    /* PAYMENT */

    .payment-card {
      margin-top: 12px;
      border: 1px solid #e8ecf1;
      border-radius: 5px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .payment-card-heading {
      padding: 11px 14px;
      background: #172b4d;
      color: #fff;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: .4px;
    }

    .payment-body {
      padding: 5px 14px;
    }

    .payment-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      padding: 10px 0;
      border-bottom: 1px solid #edf0f4;
    }

    .payment-detail-row:last-child {
      border-bottom: none;
    }

    .payment-detail-row span {
      color: #697487;
      font-size: 10px;
      flex-shrink: 0;
    }

    .payment-detail-row strong {
      color: #172b4d;
      font-size: 10px;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .payment-note {
      margin-top: 12px;
      padding: 12px;
      background: #f8f3e9;
      border-left: 3px solid #c99b4b;
      color: #795e31;
      font-size: 10px;
      line-height: 1.7;
    }

    .payment-note p {
      margin: 4px 0 0;
    }

    /* BOOKING PROCESS */

    .process-intro {
      margin-bottom: 17px;
      color: #697487;
      font-size: 10px;
    }

    .process-timeline {
      margin-top: 15px;
    }

    .process-step {
      display: flex;
      gap: 14px;
      position: relative;
      padding-bottom: 22px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .process-step:last-child {
      padding-bottom: 0;
    }

    .process-number {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      width: 31px;
      height: 31px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #172b4d;
      color: #f1cf8b;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
    }

    .process-step:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 15px;
      top: 31px;
      bottom: 0;
      width: 1px;
      background: #d9c49b;
    }

    .process-content {
      padding-top: 3px;
    }

    .process-content strong {
      color: #172b4d;
      font-size: 11px;
    }

    .process-content p {
      margin: 5px 0 0;
      color: #697487;
      font-size: 10px;
      line-height: 1.8;
    }

    /* NOTES & TERMS */

    .paragraph {
      color: #697487;
      line-height: 1.8;
    }

    /* SIGNATURE */

    .signature-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 40px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .signature {
      width: 210px;
      text-align: center;
      color: #172b4d;
    }

    .signature-image {
      display: block;
      width: 150px;
      height: 65px;
      object-fit: contain;
      margin: 0 auto 3px;
    }

    .signature-line {
      border-top: 1px solid #aeb6c2;
      margin-bottom: 8px;
    }

    .signature strong {
      display: block;
      font-size: 10px;
    }

    .signature small {
      display: block;
      margin-top: 3px;
      color: #8992a1;
      font-size: 9px;
      font-weight: 400;
    }

    /* FOOTER */

    .footer {
      margin-top: 35px;
      padding-top: 13px;
      border-top: 1px solid #e5e9ef;
      text-align: center;
      color: #8992a1;
      font-size: 9px;
      line-height: 1.8;
    }

    .footer strong {
      color: #172b4d;
    }

    /* PAGE SETTINGS */

    @page {
      size: A4;
      margin: 0;
    }

    @media screen {
      .document {
        min-height: 297mm;
      }
    }

    @media print {

      body {
        background: #fff;
      }

      .document {
        width: 210mm;
        min-height: 297mm;
        margin: 0;
        box-shadow: none;
      }

      .benefit-item,
      .document-item,
      .payment-card,
      .process-step,
      .summary-wrap,
      .signature-area {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      thead {
        display: table-header-group;
      }

      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

    }

    @media screen and (max-width: 768px) {

      .document {
        width: 100%;
        padding: 20px;
        margin: 0;
      }

      .top-accent {
        margin: -20px -20px 25px;
      }

      .header {
        gap: 12px;
      }

      .quotation-heading {
        min-width: 130px;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }

      .payment-detail-row {
        gap: 10px;
      }

    }

  </style>
</head>

<body>

  <main class="document">

    <div class="top-accent"></div>

    <!-- HEADER -->

    <header class="header">

      <div>

        <div class="brand">
          Virtual<span>Xcel</span>
        </div>

        <div class="tagline">
          Work Anywhere, Grow Everywhere
        </div>

        <div class="company-info">
          Virtual Office & Business Solutions<br />
          Email: ${escapeHTML(email)}<br />
          Website: www.virtualxcel.in
        </div>

      </div>

      <div class="quotation-heading">

        <h1>QUOTATION</h1>

        <div class="quotation-number">
          ${quotationNumber}
        </div>

        <div class="meta">
          <div>
            <strong>Date:</strong>
            ${date(quotation.createdAt)}
          </div>

          <div>
            <strong>Valid Until:</strong>
            ${date(quotation.validUntil)}
          </div>
        </div>

      </div>

    </header>

    <!-- CUSTOMER DETAILS -->

    <section class="section">

      <div class="section-heading">
        Prepared For
      </div>

      <div class="customer-card">

        <div class="customer-name">
          ${escapeHTML(customer.name)}
        </div>

        <div class="customer-detail">

          ${
            customer.contact && customer.contact !== customer.name
              ? `<div><strong>Contact Person:</strong> ${escapeHTML(customer.contact)}</div>`
              : ""
          }

          ${
            customer.email
              ? `<div><strong>Email:</strong> ${escapeHTML(customer.email)}</div>`
              : ""
          }

          ${
            customer.phone
              ? `<div><strong>Phone:</strong> ${escapeHTML(customer.phone)}</div>`
              : ""
          }

          ${
            customer.address
              ? `<div><strong>Address:</strong> ${escapeHTML(customer.address)}</div>`
              : ""
          }

        </div>

      </div>

    </section>

    <!-- QUOTATION ITEMS -->

    <section class="section">

      <div class="section-heading">
        Quotation Details
      </div>

      <table>

        <thead>
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 31%">Service Description</th>
            <th style="width: 12%">Duration</th>
            <th style="width: 7%">Qty</th>
            <th style="width: 15%">Unit Price</th>
            <th style="width: 13%">Discount</th>
            <th style="width: 17%">Total</th>
          </tr>
        </thead>

        <tbody>
          ${
            items.length
              ? renderItems(items)
              : `<tr><td colspan="7" class="center">No quotation items found.</td></tr>`
          }
        </tbody>

      </table>

    </section>

    <!-- PRICE SUMMARY -->

    <section class="summary-wrap">

      <div class="summary">

        <div class="summary-row">
          <span>Subtotal</span>
          <strong>${money(quotation.subtotal)}</strong>
        </div>

        <div class="summary-row">
          <span>Discount</span>
          <strong>${money(quotation.discountTotal)}</strong>
        </div>

        <div class="summary-row">
          <span>Taxable Amount</span>
          <strong>${money(quotation.taxableAmount)}</strong>
        </div>

        <div class="summary-row">
          <span>${taxLabel}</span>
          <strong>${money(quotation.taxTotal)}</strong>
        </div>

        <div class="grand-total">
          <span>Grand Total</span>
          <strong>${money(quotation.grandTotal)}</strong>
        </div>

      </div>

    </section>

    <!-- VIRTUAL OFFICE BENEFITS -->

    ${whatYouGet}

    <!-- DOCUMENTS -->

    ${documentsProvided}

    <!-- PAYMENT DETAILS -->

    ${paymentDetails}

    <!-- BOOKING PROCESS -->

    ${bookingProcess}

    <!-- NOTES -->

    ${notes}

    <!-- TERMS -->

    ${terms}

    <!-- AUTHORIZED SIGNATURE -->

    <section class="signature-area">

      <div class="signature">

        <img
          src="/images/authorized-signature.png"
          alt="Authorized Signature"
          class="signature-image"
        />

        <div class="signature-line"></div>

        <strong>Authorized Signatory</strong>

        <small>
          VirtualXcel Solutions Private Limited
        </small>

      </div>

    </section>

    <!-- FOOTER -->

    <footer class="footer">

      <strong>VirtualXcel</strong><br />

      Thank you for considering our services.<br />

      www.virtualxcel.in | ${escapeHTML(email)}

    </footer>

  </main>

</body>
</html>
  `;
};
