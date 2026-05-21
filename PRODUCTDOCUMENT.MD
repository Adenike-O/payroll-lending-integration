# Product Document — Payroll Lending Integration
**PayBridge × PayrollSync**

| Field | Detail |
|---|---|
| Document Type | Product Requirements Document |
| Version | 3.0 |
| Date | April 2026 |
| Owner | Adenike Olatunbosun |
| Status | For Engineering Review |



## Version 3.0 — What changed from v2.0

This version incorporates eight significant updates: (1) a new Lender Onboarding section covering both new and existing lenders; (2) the borrower interaction surface has been corrected; the borrower remains on the lender's app throughout and is only redirected to PayBridge for a dedicated consent page; (3) the consent flow now documents the full OTP mechanism and the authorisationCode chain; (4) the mandate payload is documented in full; (5) the repayment source is corrected — it is the borrower's own salary bank determined by bankCode, not a fixed wallet; (6) mandate lifecycle operations are now covered; (7) the end-to-end flow runs all the way to loan closure; (8) all content is in prose, no tables.



## 1. Executive Summary

This document defines the product requirements, integration architecture, and operational flows for the PayBridge × PayrollSync payroll lending integration. PayBridge acts as a lender aggregator, using its own payroll data and GovPay employment records to originate, book, and settle payroll-backed loans for public sector employees.

### Why this integration exists

PayBridge had historically managed salary payments for public sector employees and operated a direct debit product through which lenders collected loan repayments. Under the previous model, PayBridge deducted loan repayments before crediting salaries. This meant an employee's payslip showed only a single net figure, hiding both their gross income and the loan deduction. Employees could not accurately declare their salary for mortgages, guarantees, or other financial products.

GovPay, as the federal payroll authority, intervened. They banned PayBridge from running loan activity on their payroll beneficiaries without routing through PayrollSync. The integration is the resolution to that ban — a compliance mandate, not an optional product enhancement.

The outcome: employees' payslips now correctly show gross salary, loan repayment, and net pay as three separate visible line items.

### Key outcomes

- Public sector employees gain access to payroll-backed loans with accurate, transparent payslip deduction records
- Lenders gain repayment assurance backed by GovPay salary deduction authority
- PayBridge earns fee revenue on data calls and repayment processing
- PayrollSync and GovPay gain full oversight of all loan activity on their payroll beneficiaries



## 2. Stakeholders & Roles

**GovPay** is the federal payroll authority. GovPay manages salary computation, deduction records, and payslip generation for all federal employees. GovPay processes the monthly payroll and passes salary and deduction data to PayrollSync, which then instructs PayBridge.

**PayrollSync** is the central settlement account holder and intermediary between GovPay and PayBridge. During repayment, PayrollSync receives payroll data from GovPay and pushes two separate payment instructions to PayBridge: one to credit the employee's full gross salary, and one to credit the lender with the repayment amount.

**PayBridge** is the aggregation and execution layer. PayBridge already manages salary payments for public sector employees, meaning PayBridge holds the salary history data used for lender decisioning. PayBridge validates borrowers, manages the consent flow, books loans, handles disbursement via RITS, and executes payment instructions received from PayrollSync.

**Lenders** are the financial institutions that provide loan liquidity. They integrate with PayBridge's API to call salary data, submit loan mandates, and manage the lifecycle of their loan products. Lenders appear on employees' payslips as the creditor.

**Public sector employees** are the end borrowers. They interact with the lender's own application throughout origination and are only redirected to a PayBridge-hosted consent page at a single point in the flow.



## 3. Lender Onboarding

Before any borrower flow can begin, each lender must be onboarded to both PayBridge and PayrollSync. The process differs for new and existing lenders.

### New lenders

A lender that has not previously worked with PayBridge must first register as a merchant on the PayBridge platform. They receive a Merchant ID and API Key. These credentials authenticate all subsequent API calls.

Once the PayBridge merchant profile exists, the lender must be registered with PayrollSync operations. This is currently a manual process. PayrollSync reviews the registration and issues a login credential specific to that lender. PayBridge stores this credential and calls `POST /auth/login` to obtain a token scoped to that lender for all WACS-side API calls.

Loan products are then created via `POST /loan-products` and activated via `GET /loan-products/{productId}/activate`.

Finally, the lender's FundWallet on PayBridge must be funded. This wallet is the source of disbursement funds.

### Existing PayBridge lenders

Existing lenders skip the merchant registration step. Their existing Merchant ID and API Key remain valid. The additional steps required are PayrollSync manual registration, obtaining the PayrollSync credential, and activating loan products on the PayrollSync side.

> **V1 constraint — one credential per lender:** PayrollSync built their API for direct lenders only. No aggregator model exists in V1. Each lender must be individually registered. PayrollSync has committed to building an aggregator model in V2 but the timeline is not confirmed. Until then, if PayBridge uses a generic credential rather than the lender-specific one, PayBridge's name appears as the lender on the employee's payslip, a regulatory and trust issue.



## 4. PayBridge Product Surfaces

### 4.1 Payroll Referencing — Data Referencing Service

The Data Referencing service retrieves a public sector employee's employment record and salary payment history. PayBridge already manages salary payments for these employees, meaning the salary history data lives within PayBridge's own systems. This is PayBridge's proprietary data, not sourced from PayrollSync.

What changes with this integration is the addition of a formal consent gate before any salary data is shared with a lender.

Fee: **₦400 per successful data call**.

### 4.2 Lender Aggregation Layer (New)

PayBridge acts as the intermediary between lenders, PayrollSync, and GovPay to orchestrate end-to-end loan origination. PayBridge does not appear as the lender to the employee. The actual lender's name is recorded in PayrollSync and surfaced on the payslip.

### 4.3 RITS — Interbank Transfer Service

RITS is PayBridge's existing interbank transfer service and is the mechanism used for loan disbursement. When a loan is accepted and the authorisationCode is validated, PayBridge debits the lender's FundWallet and credits the employee's bank account via RITS.

### 4.4 Direct Debit — Repayment Processing

**What changes (critical):** The current PayBridge direct debit flow runs a service called inflight collections before processing any salary payment. This service checks whether the account being credited has an active loan obligation and, if so, deducts the repayment before crediting net salary. This logic must be bypassed entirely for PayrollSync-originated transactions.

Under the PayrollSync integration, inflight collections must not run when a PayrollSync-flagged instruction is received. PayrollSync sends PayBridge two separate instructions per employee per month: one for the full gross salary and one for the lender repayment. PayBridge executes both as received, resulting in two separate RITS transactions and two separate payslip line items.

> **Open item D1:** The exact field name, value, and position (HTTP header or request body) of the PayrollSync transaction flag must be defined by engineering before this routing logic is built.



## 5. Consent Flow & the authorisationCode Chain

### How the flow works

The civil servant starts on the lender's app. They browse loan products, select one, enter their loan details including the salary bank account from which repayments will be deducted, and submit. The lender's app calls PayBridge's salary data API.

PayBridge checks for an existing consent record. Finding none, it generates a consent session and returns a consent URL to the lender. The lender redirects the employee to this URL, a dedicated, PayBridge-branded consent page.

On PayBridge's consent page, the employee reviews what data will be shared and with whom. They approve by requesting an OTP, entering the code when it arrives, and submitting. PayBridge validates the OTP, stores the consent record, and sends a callback to the lender containing the salary history and the **authorisationCode**.

### The authorisationCode chain

The authorisationCode is the OTP the employee just entered. It is the binding link between the borrower's consent event and the loan mandate the lender will submit. When the lender calls PayBridge's mandate API, they must include this authorisationCode in the payload. PayBridge validates it against the stored consent record before processing the mandate. If the code does not match, the mandate is rejected.

In the mandate payload:
- `"authorisationCode": "73573"` — the OTP value
- `"authorisationChannel": "USSD"` — how consent was given
- `"customerId"` — the borrower identifier from the consent callback

### Consent record requirements

Every consent event must be recorded with: timestamp, channel, borrower identifier, lender identity, data scope, and authorisationCode. Audit trail must be retained for regulatory purposes. Consent is revocable — revocation propagates to stop future data sharing.



## 6. End-to-End Flow

### Phase 1: Loan discovery
Employee browses products on the lender's app. PayBridge returns active products via `GET /loan-products` using the lender's PayrollSync token.

### Phase 2: Salary data request and consent
Lender calls PayBridge salary data API. PayBridge checks for consent, finds none, generates a consent session and returns a consent URL. Employee is redirected to PayBridge's consent page, approves via OTP, and is redirected back to the lender's app.

### Phase 3: Lender decisioning
Lender receives salary history and authorisationCode. Lender's own decisioning engine evaluates whether the employee qualifies for the requested amount. If not, a counter-proposition is generated. The lender optionally calls `GET /customers/{ippis}/eligibility` on PayrollSync for an independent eligibility score. This is an add-on, not a gate. The credit decision belongs entirely to the lender.

### Phase 4: Second consent — loan agreement and deduction authorisation
Employee sees a second, distinct consent screen on the lender's app confirming loan terms and authorising the repayment deduction from their salary bank account. **The mandate is never created before this step.**

### Phase 5: Mandate submission and disbursement
Lender calls `POST /payday/post/loan` with the full payload including the authorisationCode. PayBridge validates the code, resolves the bankCode to identify the employee's salary bank, and dispatches the direct debit mandate to that institution.

**Two disbursement paths:**

If PayBridge is configured as the disburser for this lender, PayBridge debits the lender's FundWallet and credits the employee via RITS. Mandate is created only after confirmed full disbursement.

If the lender is configured as disbursement-independent, PayBridge creates the mandate straight without requiring a disbursement event. The lender bears responsibility for confirming disbursement on their side.

### Phase 6: Loan registration with PayrollSync and GovPay
PayBridge registers the loan with PayrollSync using the lender's PayrollSync token. PayrollSync notifies GovPay. GovPay records the loan on the employee's payroll profile; lender name, monthly deduction, first deduction date.

> **Chain:** PayBridge → PayrollSync → GovPay. GovPay only knows about the loan because of this chain.

### Phase 7: Monthly repayment cycle
GovPay processes payroll. GovPay sends PayBridge a salary credit instruction directly. GovPay tells PayrollSync to collect the repayment. PayrollSync routes that instruction through PayBridge to credit the lender.

PayBridge receives both instructions, detects the PayrollSync flag, bypasses inflight collections, and executes both via RITS as separate transactions. Two transactions = two payslip line items = transparent, correct payslip.

### Phase 8: Loan closure
On the final repayment, PayBridge marks the mandate closed, issues a stop instruction to the employee's bank, and PayrollSync notifies GovPay to remove the deduction from the payroll profile. The next payslip carries no loan deduction.



## 7. Commercial Model

**Data call fee:** ₦400 per successful salary data retrieval. Charged to the lender each time their system triggers a salary history request. Revenue share between PayBridge and PayrollSync is TBD.

**Repayment processing fee:** 1.5% of the repayment amount, charged each time a loan repayment is executed through the PayrollSync-to-PayBridge instruction flow. Split between PayBridge and PayrollSync, ratio is subject to commercial agreement.

**Lender settlement fee:** Structure, timing, and reconciliation process are undefined. Must be agreed before UAT.



## 8. Assumptions

- GovPay provides reliable employment and salary data via the agreed API endpoints
- Lenders maintain funded FundWallet accounts on PayBridge at all times
- PayrollSync pushes instructions to PayBridge in a structured format with consistent field definitions
- All participating lenders complete PayrollSync manual registration before any borrower flow goes live
- The PayrollSync transaction flag can be implemented within PayBridge's existing switching infrastructure through configuration changes only



## 9. Open Items & Decisions Required

**Q1 — Customer ID source:** Is the customerId in the mandate payload the GovPay employee number directly, or a separate identifier generated by the consent/onboarding endpoint? *Owner: PayBridge PM + GovPay*

**Q2 — PayrollSync V2 aggregator timeline:** When will PayrollSync build the aggregator model? The V1 per-lender credential approach is not scalable. *Owner: PayBridge partnerships*

**Q3 — PayrollSync inbound instruction mechanism:** How does PayrollSync push payment instructions to PayBridge? Webhook, polling, or push API? What is the SLA and retry behaviour? *Owner: Engineering + PayrollSync*

**D1 — PayrollSync transaction flag:** What is the exact field name, value, and position that identifies a PayrollSync-originated request so inflight collections can be bypassed? **Most critical technical decision in the integration.** *Owner: Engineering + Product*

**D2 — Consent channel:** What channel delivers the OTP: USSD, SMS, or both? What is the fallback if delivery fails? *Owner: Product + Engineering*

**D3 — Per-lender token management:** How are PayrollSync tokens stored, encrypted, refreshed, and rotated securely? *Owner: Engineering + Security*

**D4 — Lender settlement fee:** Undefined. Must be resolved before go-live. *Owner: Finance + Business*

**D5 — Revenue share split:** The split of the 1.5% repayment fee and ₦400 data call fee between PayBridge and PayrollSync is unconfirmed. *Owner: Business + Legal*

**D6 — Audit log retention:** What is the required retention period for consent records and RITS transaction logs? *Owner: Legal + Compliance*



## 10. Risks

**Critical:** PayrollSync flag not implemented correctly → double-deduction of loan repayment. Mitigation: precision flag specification, peer review, dedicated UAT test cases for all five routing rules.

**Critical:** Consent not captured before data retrieval → NDPR violation. Mitigation: consent gate enforced at platform layer, not application layer.

**High:** Wrong lender token used on loan registration → PayBridge appears as lender on payslip. Mitigation: lender token binding enforced at application layer.

**High:** Per-lender credential management creates security surface. Mitigation: secure token vault with automated refresh and access controls.

**Medium:** RITS failure at disbursement after wallet debit. Mitigation: wallet debit reversed on RITS failure, mandate not created.

**Medium:** Revenue share and settlement terms unresolved at launch. Mitigation: escalate D4 and D5 before UAT.



## 11. Next Steps

1. Resolve open items Q1, Q3, D1, and D2 through joint session with PayrollSync and GovPay
2. Confirm PayrollSync transaction flag specification with engineering (D1)
3. Define and sign off consent flow channel and OTP delivery mechanism (D2)
4. Confirm per-lender token architecture with engineering and security (D3)
5. Finalise revenue share and lender settlement terms (D4, D5)
6. Obtain full PayrollSync API documentation with all endpoint schemas and error codes
7. Write integration requirements from this document



*Company names and identifiers in this document have been anonymised. All financial figures are illustrative.*