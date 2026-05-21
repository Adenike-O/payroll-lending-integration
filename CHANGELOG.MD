# Changelog

All notable changes to this project are documented here.



## v3.0 — April 2026

### Added
- Lender onboarding section covering both new and existing lenders
- Full OTP mechanism and authorisationCode chain documented end to end
- Mandate payload field annotations with data lineage from consent step
- Mandate lifecycle operations: send debit, stop mandate, modify, query history
- End-to-end flow extended to loan closure including IPPIS deregistration
- Two disbursement paths: PayBridge-managed and lender-managed, with merchant configuration
- Bank-agnostic mandate design; bankCode determines repayment institution

### Changed
- Borrower interaction surface corrected — borrower remains on lender's app throughout; PayBridge only appears as a redirected consent page
- Salary data source corrected — PayBridge owns this data from its existing payroll operations, not sourced from PayrollSync
- Repayment source corrected — deducted from borrower's own salary bank via bankCode, not a fixed wallet

### Removed
- All table formatting, document is now fully prose, copyable throughout



## v2.0 — March 2026

### Added
- Correct regulatory context: integration exists because regulator banned the previous deduction model
- Three repayment scenarios formally defined: Inflight, Credit First, PayrollSync
- Repayment direction reversal documented: PayrollSync calls PayBridge at repayment phase
- Per-lender token management documented
- V1 constraint (no aggregator model) formally documented with risk statement
- Risk register with severity ratings and mitigations

### Changed
- Salary data ownership corrected to PayBridge's own payroll records
- PayrollSync eligibility check repositioned as optional lender add-on, not a gate
- Commercial model updated with correct fee trigger points



## v1.0 — February 2026

### Added
- Initial product document
- Executive summary and regulatory background
- Stakeholder roles
- Product surfaces: Data Referencing, Lender Aggregation, RITS, Direct Debit
- End-to-end flow (Phases 1–4)
- Consent flow overview
- Commercial model
- Open items register
- Assumptions and risks
- Next steps



## Prototype releases

### Multi-perspective prototype v2 — April 2026
- Four perspective tabs: Borrower, Lender, PayBridge, GovPay/PayrollSync
- Correct consent flow: lender app → PayBridge consent page → OTP → back to lender app
- Mandate payload shown with field annotations
- Mandate lifecycle operations screen
- Three-scenario repayment split in PayBridge and GovPay perspectives
- Corrected payslip outcome screen

### Multi-perspective prototype v1 — March 2026
- Single linear flow prototype
- Seven screens covering discovery through payslip
- All screens on mobile device frame
- Context panel with API notes

### User flow diagram — April 2026
- FigJam-reference diagram
- Four swim lanes: Borrower, Lender, PayBridge, GovPay/PayrollSync
- Eight phases with correct shape notation
- Three repayment scenarios as parallel columns
- Open items panel at foot of diagram