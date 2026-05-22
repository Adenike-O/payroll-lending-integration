# Payroll Lending Integration Platform

Prototype Link- https://adenike-o.github.io/payroll-lending-integration/

### End-to-end product documentation for a regulated payroll-backed lending integration



## What this is

This repository documents the full product design and engineering specification for a **payroll lending integration** between a payment aggregator (PayBridge), a government payroll authority (GovPay), and a regulatory settlement partner (PayrollSync).

The integration enables lenders to offer payroll-backed loans to public sector employees, with repayment deducted at source from salary, while ensuring employees can see their full gross salary and loan deduction as separate, transparent line items on their payslip.

The work here spans the full product lifecycle: from problem definition and regulatory context, through multi-perspective user flow design, to a complete engineering requirements handoff with epics, user stories, acceptance criteria, and a formally defined API routing specification.



## The problem this solves

Public sector employees were taking payroll loans, but the payment infrastructure was deducting loan repayments **before** crediting salary. This meant payslips showed only a net figure, hiding the employee's true gross income. Employees could not accurately declare their salary for mortgages, guarantees, or other financial products that require income verification.

The regulatory authority (GovPay) intervened. They required all loan activity on their payroll beneficiaries to route through PayrollSync so that:

- Every loan is registered and attributable to the correct lender
- Gross salary, loan deduction, and net pay appear as **three separate line items** on the payslip
- The regulator has full visibility of all lending activity on the payroll it manages

This integration is the solution to that mandate.



## What is in this repository

| File / Folder | What it contains |
|---|---|
| `docs/01-product-document.md` | Full product requirements document — problem, stakeholders, product surfaces, end-to-end flow, consent mechanism, commercial model, risks, and open items |
| `docs/02-integration-requirements.md` | 8 epics, 25+ user stories, full checklist acceptance criteria for every story |
| `docs/03-api-flag-specification.md` | Engineering specification for the three-layer WACS transaction flag routing mechanism |
| `docs/04-engineering-handoff.md` | Implementation sequence, system boundaries, test scenarios, environment guidance |
| `prototypes/multi-perspective-flow.html` | Interactive prototype showing the integration from four perspectives: Borrower, Lender, PayBridge, and GovPay/PayrollSync |
| `prototypes/user-flow-diagram.html` | FigJam-reference user flow covering all 8 phases from loan discovery to loan closure, with three repayment scenario branches |



## Live prototype

The multi-perspective prototype will be live and interactive:

**[→ Open the prototype](COMING SOON)**

Switch between four perspectives using the tabs at the top:
- **Borrower** — the mobile experience from loan discovery through to the corrected payslip
- **Lender** — the API calls, salary data callback, mandate submission, and lifecycle operations
- **PayBridge** — the internal processing: consent gate, routing engine, disbursement, WACS registration
- **GovPay / PayrollSync** — the regulatory layer: loan registration, IPPIS payroll run, two-instruction repayment, payslip outcome



## The end-to-end flow

The integration covers eight phases:

**Phase 1 — Loan discovery.** The public sector employee browses loan products on the lender's own app. PayBridge surfaces available products via the lender's WACS token.

**Phase 2 — First consent: salary data sharing.** The lender calls PayBridge's salary data API. PayBridge redirects the employee to a PayBridge-branded consent page where they approve data sharing via OTP. The OTP becomes the `authorisationCode` — the cryptographic link between consent and the eventual mandate.

**Phase 3 — Lender decisioning.** The lender receives the salary history and runs their own credit decision. If the employee cannot support the requested amount, the lender generates a counter-proposition. This decisioning step belongs entirely to the lender, PayBridge has no role here.

**Phase 4 — Second consent: loan agreement and deduction authorisation.** The employee confirms agreement to the loan terms and authorises the repayment deduction from their salary bank. The mandate is never created before this step.

**Phase 5 — Mandate submission and disbursement.** The lender calls PayBridge's mandate API with the full loan payload including the `authorisationCode`. PayBridge validates the code against the stored consent record, disburses via RITS (or confirms lender disbursement per merchant configuration), and creates the direct debit mandate against the employee's salary bank — whichever bank that may be.

**Phase 6 — PayrollSync loan registration.** PayBridge registers the loan with PayrollSync using the specific lender's token, which records the lender's name (not PayBridge's) in the payroll system. PayrollSync notifies GovPay. The loan now appears on the employee's payroll profile.

**Phase 7 — Monthly repayment.** GovPay processes payroll and sends two separate instructions to PayBridge via PayrollSync: (1) credit the employee's full gross salary, (2) credit the lender with the repayment amount. PayBridge detects the PayrollSync flag and bypasses its standard inflight collections logic, executing both instructions independently. Two RITS transactions. Two payslip line items.

**Phase 8 — Loan closure.** On the final repayment, PayBridge marks the mandate closed, issues a stop instruction to the employee's bank, and PayrollSync notifies GovPay to remove the deduction from the payroll profile. The next payslip shows no loan deduction.



## The three repayment scenarios

A key engineering challenge was that PayBridge already operated two existing repayment models. The new PayrollSync integration needed to run alongside them without collision.

**Inflight** — the current model. PayBridge debits the employer for the full salary, deducts the loan repayment internally, and credits the net salary to the employee. The payslip shows only the net figure.

**Credit First** — PayBridge credits the employee in full first and collects the repayment separately. Used for certain consumer lending products.

**PayrollSync (new)** — GovPay sends PayBridge two separate instructions per employee per month. PayBridge executes both without applying any internal deduction logic. Full gross salary credit + separate lender repayment. Transparent payslip.

The routing engine resolves which path to apply using a three-layer flag mechanism: merchant-level configuration (primary), an HTTP header on inbound instructions (secondary verification), and a request body reference field (audit trail). The full specification is in `docs/03-api-flag-specification.md`.



## Engineering epics

| Epic | Scope |
|---|---|
| Epic 1 | Lender onboarding, WACS credential management, per-lender token lifecycle |
| Epic 2 | Salary data request, consent gate, OTP flow, authorisationCode chain |
| Epic 3 | Mandate submission, authorisationCode validation, two disbursement paths |
| Epic 4 | PayrollSync loan registration, GovPay payroll profile update |
| Epic 5 | Repayment routing engine; three-scenario flag logic, inbound receiver, idempotency |
| Epic 6 | Mandate lifecycle; debit instructions, stop mandate, repayment history |
| Epic 7 | Loan closure; final repayment detection, payslip correction, audit archiving |
| Epic 8 | Monitoring, alerting, flag mismatch detection, daily reconciliation |



## Key design decisions

**The authorisationCode chain.** The OTP the employee enters on PayBridge's consent page travels all the way into the lender's mandate API call as the `authorisationCode` field. PayBridge validates this code against the stored consent record before activating any loan. This is the mechanism that ensures no loan is disbursed without the employee's explicit, verifiable consent.

**Bank-agnostic mandate.** The `bankCode` field in the mandate payload determines which institution receives the direct debit mandate. This can be any bank, the employee selects their salary bank during the application. The system does not restrict repayment to any specific wallet or institution.

**Disbursement-conditional mandate creation.** Where PayBridge manages disbursement, the mandate is created only after a successful RITS credit is confirmed. A failed disbursement blocks mandate creation and reverses the lender wallet debit. This prevents the system from collecting repayments for loans the employee never received.

**Per-lender token isolation.** Because the regulatory partner (PayrollSync) does not yet have an aggregator API model, PayBridge holds a separate PayrollSync token for each lender and uses the correct one for every API call. The lender's name on the payslip is derived from whose token is used at loan registration. This is enforced at the code level.



## Methodology and tools

This project was documented using an AI-augmented product workflow. The problem context, regulatory detail, business logic, technical specifications, and design decisions were sourced from stakeholder sessions, line manager feedback, and API documentation review. AI tooling was used to structure, formalise, and render the documentation, all directional and content decisions were made by the PM.

**Documentation tools:** Markdown, Word (via docx generation), HTML prototypes
**Design reference:** FigJam-ready flow diagram with correct shape notation (ovals, diamonds, parallelograms, cylinders, document shapes, fork/join bars)
**Prototyping:** HTML/CSS/JS interactive prototype with four actor perspectives
**Specification approach:** Epics → User Stories (As a / I want / So that) → Checklist acceptance criteria


## What this demonstrates

For any team reviewing this as part of a hiring process:

This repository demonstrates the ability to take a complex, multi-party regulated integration and produce documentation that is useful to engineers, legible to business stakeholders, and traceable to specific user outcomes. The work covers API design literacy, consent and data privacy requirements, financial transaction routing logic, regulatory compliance constraints, and stakeholder-specific communication, without losing sight of the borrower experience that the entire system exists to serve.

The corrected payslip at the end of Phase 7 is not a technical deliverable. It is a human outcome: a public sector employee who can now prove what they actually earn. The engineering specification exists to make that possible.



## Version history

See `CHANGELOG.MD` for the full version history of this project.



*This project was built as part of a real product integration engagement. Company names and employee identifiers have been anonymised.*
