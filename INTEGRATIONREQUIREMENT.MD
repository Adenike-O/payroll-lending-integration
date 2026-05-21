# Integration Requirements — Payroll Lending Platform
**PayBridge × PayrollSync**

| Field | Detail |
|---|---|
| Document Type | Engineering Requirements & Handoff |
| Version | 1.0 |
| Date | April 2026 |
| Owner | Adenike Olatunbosun |
| Status | For Engineering Review |



## How to use this document

Every story follows: **As a / I want / So that**, followed by a checklist of acceptance criteria. A story is Done only when every criterion is checked, unit and integration tests pass, and the PM has signed off in a demo.

A **☐** means the criterion must be verified before the story is closed.



## Prerequisites before Sprint 1 begins

- ☐ PayrollSync sandbox credentials obtained and stored in secrets manager
- ☐ PayrollSync full API documentation received, all endpoint schemas and error codes
- ☐ Security team review of per-lender token architecture completed
- ☐ Legal/Compliance confirmation of audit log retention period in writing
- ☐ At least one lender PayrollSync credential received from PayrollSync operations for sandbox testing



# Epic 1: Lender Onboarding & PayrollSync Credential Management

Every lender must be onboarded to both PayBridge and PayrollSync before any borrower journey can begin. This epic covers new and existing lenders, PayrollSync credential management, and the per-lender token lifecycle.



### Story 1.1 — New lender PayBridge merchant registration

**As a** lender operations team, **I want** to register as a PayBridge merchant and receive an API Key and Merchant ID, **so that** the lender can authenticate against all PayBridge APIs.

**Acceptance criteria:**
- ☐ Lender submits merchant registration with: company name, RC number, account details, contact information
- ☐ System issues a unique Merchant ID and API Key
- ☐ API Key is returned only once and can be regenerated on request
- ☐ Merchant ID and API Key are required headers on every PayBridge API call
- ☐ New merchant has repaymentScenario = null by default, cannot process transactions until set



### Story 1.2 — PayrollSync manual registration and credential issuance

**As a** PayBridge partnerships team, **I want** to coordinate with PayrollSync operations to register each lender and obtain their PayrollSync login credential, **so that** PayBridge can authenticate with PayrollSync on the lender's behalf and the lender's name appears on the employee's payslip.

**Acceptance criteria:**
- ☐ PayBridge partnerships team submits lender details to PayrollSync operations
- ☐ PayrollSync issues a username and password specific to that lender
- ☐ Credential is stored in PayBridge's credential vault, not plain text, not in source code, not in config files
- ☐ No borrower flow for this lender is activated until the PayrollSync credential is stored and validated
- ☐ Process is documented per lender: registration date, PayrollSync account ID, credential storage reference

> **Note:** V1 constraint; PayrollSync has no aggregator model. Each lender requires separate manual registration.



### Story 1.3 — Per-lender PayrollSync token acquisition and storage

**As a** PayBridge integration service, **I want** to call POST /auth/login with each lender's PayrollSync credential and securely store the token, **so that** all PayrollSync API calls for that lender use the correct lender-scoped token.

**Acceptance criteria:**
- ☐ POST /auth/login is called using the lender's PayrollSync username and password
- ☐ Token stored in secrets manager keyed by lender_id + environment
- ☐ Token expiry timestamp stored alongside the token
- ☐ Token is never logged, never returned in API responses, never stored in plain-text database columns
- ☐ Token refresh triggered automatically 5 minutes before expiry
- ☐ HTTP 401 from any PayrollSync call triggers immediate token rotation
- ☐ Lender A's token is never used for any call scoped to lender B
- ☐ Integration test confirms token isolation: call a PayrollSync endpoint for lender A, verify lender B's token was not used



### Story 1.4 — Repayment scenario configuration per merchant

**As** PayBridge operations, **I want** to configure each merchant with a repaymentScenario of INFLIGHT, CREDIT_FIRST, or PAYRROLLSYNC, **so that** PayBridge's routing engine knows which repayment path to apply for every instruction.

**Acceptance criteria:**
- ☐ Each merchant record has a repaymentScenario field; valid values: INFLIGHT, CREDIT_FIRST, PAYROLLSYNC
- ☐ Field is set only by PayBridge operations via admin console, not settable by the lender or API call
- ☐ Merchant with repaymentScenario = null cannot process salary or repayment transactions, returns configuration error
- ☐ GovPay employers using the PayrollSync payroll lending flow are configured as PAYROLLSYNC
- ☐ Changing a merchant's repaymentScenario requires approval workflow with senior operations sign-off
- ☐ Audit log maintained for all repaymentScenario changes: who, from what, to what, when



### Story 1.5 — Loan product creation and activation

**As a** lender via PayBridge integration, **I want** to create and activate a loan product in PayrollSync, **so that** borrowers can apply for it.

**Acceptance criteria:**
- ☐ PayBridge calls POST /loan-products with: product name, tenure, interest rate, currency (NGN), maximum amount
- ☐ PayrollSync returns productId and status INACTIVE
- ☐ PayBridge calls GET /loan-products/{productId}/activate
- ☐ PayrollSync returns status ACTIVE
- ☐ PayBridge calls GET /loan-products to verify the product appears in the active list
- ☐ Product is not shown to borrowers until status is ACTIVE
- ☐ Product creation and activation logged with lender_id, productId, and timestamp



# Epic 2: Salary Data Request & Consent Gate



### Story 2.1 — Lender salary data request

**As a** lender system, **I want** to call PayBridge's salary data API with borrower details and receive either a consent URL or salary history, **so that** the application can proceed to consent or directly to decisioning.

**Acceptance criteria:**
- ☐ Lender calls POST /salary-data/request with: phoneNumber, accountNumber, bankCode, firstName, lastName, API_KEY, MERCHANT_ID
- ☐ Invalid credentials return 401 Unauthorized
- ☐ Borrower not found returns 404 with error code BORROWER_NOT_FOUND
- ☐ If valid consent exists: return salary history and authorisationCode immediately
- ☐ If no consent: generate consent session, dispatch OTP, return 202 Accepted with consentUrl and sessionRef
- ☐ Salary data is never returned before consent is confirmed, enforced at platform layer



### Story 2.2 — PayBridge consent page display

**As a** public sector employee / borrower, **I want** to see a clearly PayBridge-branded consent page showing exactly what data will be shared, with whom, and for what purpose, **so that** I can make an informed decision.

**Acceptance criteria:**
- ☐ Consent page is hosted on a paybridge.ng domain, not the lender's domain
- ☐ Page displays: PayBridge logo, verified/secure indicator, lender name and logo
- ☐ Page explicitly lists data to be shared: 12 months salary history, employment status, gross salary, existing deductions
- ☐ Page states data is scoped to this application only
- ☐ Page has two clear actions: Approve (triggers OTP) and Decline (terminates session)
- ☐ Page is accessible on mobile browsers without a native app
- ☐ Session expires after 15 minutes with a clear expiry message



### Story 2.3 — OTP dispatch and validation

**As a** PayBridge consent service, **I want** to send a one-time password to the borrower's registered phone and validate their entry, **so that** the system has proof that the account holder personally confirmed consent.

**Acceptance criteria:**
- ☐ OTP is 5 digits, generated using a cryptographically secure random number generator
- ☐ OTP dispatched via SMS to phone number registered against the borrower's payroll account
- ☐ OTP expires after 5 minutes from dispatch
- ☐ Maximum 3 attempts before session is locked, locked session cannot be unlocked by the borrower
- ☐ OTP resend available once after 60-second cooldown
- ☐ OTP stored as salted hash, never in plain text
- ☐ OTP is never logged
- ☐ On valid OTP entry, OTP is immediately marked as used, cannot be validated twice



### Story 2.4 — Consent record creation and authorisationCode return

**As a** PayBridge consent service, **I want** to create a permanent consent record and return the authorisationCode to the lender, **so that** there is an auditable chain from the borrower's approval to every subsequent action.

**Acceptance criteria:**
- ☐ On successful OTP validation, consent record written with: consent_id (UUID), timestamp (UTC), channel, borrower_id, lender_id, data_scope, authorisationCode as hash, session_ref
- ☐ authorisationCode returned to lender is the plain-text OTP value, lender must include it verbatim in the mandate payload
- ☐ Consent record is immutable once written
- ☐ PayBridge sends callback to lender with: status SUCCESS, authorisationCode, customerId, salary history
- ☐ Callback failures retried 3 times at 30-second intervals before CALLBACK_FAILED alert
- ☐ Borrower redirected back to lender's app after consent record is created
- ☐ Confirmation SMS sent to borrower: "You have approved [Lender Name] to access your PayBridge salary data."



# Epic 3: Mandate Submission, Validation & Disbursement



### Story 3.1 — Second consent on lender app

**As a** public sector employee / borrower, **I want** to see a second distinct consent screen confirming my agreement to the loan terms and the repayment deduction, **so that** I have explicitly agreed before any mandate is created.

**Acceptance criteria:**
- ☐ Second consent screen is visually distinct from the first consent screen
- ☐ Screen displays: loan amount, interest rate, monthly instalment, total repayment, first deduction date, repayment bank, account number (last 4 digits)
- ☐ Borrower must take an explicit action to confirm, not just close the screen
- ☐ Declining terminates the application, no mandate submitted to PayBridge
- ☐ No PayBridge API call is made before this confirmation is received



### Story 3.2 — Mandate API intake and authorisationCode validation

**As a** PayBridge mandate service, **I want** to receive the lender's mandate call, validate the authorisationCode, and confirm all required fields, **so that** no loan is activated without proof of borrower consent.

**Acceptance criteria:**
- ☐ PayBridge receives POST /payday/post/loan
- ☐ Required headers validated: API_KEY, MERCHANT_ID, REQUEST_ID, AUTHORIZATION — missing returns 401
- ☐ Required body fields validated: customerId, authorisationCode, authorisationChannel, phoneNumber, accountNumber, currency, loanAmount, collectionAmount, dateOfDisbursement, dateOfCollection, totalCollectionAmount, numberOfRepayments, bankCode
- ☐ Missing required field returns 400 with field-level error message
- ☐ Invalid authorisationCode returns 403 with INVALID_AUTHORISATION_CODE
- ☐ Expired authorisationCode returns 403 with AUTHORISATION_CODE_EXPIRED
- ☐ Already-used authorisationCode returns 409 with AUTHORISATION_CODE_ALREADY_USED
- ☐ Unrecognised bankCode returns 400 with INVALID_BANK_CODE
- ☐ totalCollectionAmount must equal collectionAmount × numberOfRepayments within 1 kobo tolerance



### Story 3.3 — PayBridge-managed disbursement path

**As a** PayBridge disbursement service, **I want** to debit the lender's FundWallet and credit the borrower via RITS when PayBridge is configured as the disburser, **so that** the mandate is only created after the full loan amount has been confirmed as received by the borrower.

**Acceptance criteria:**
- ☐ Merchant disbursementMode = PAYBRIDGE_DISBURSE triggers this path
- ☐ FundWallet balance checked before debit — insufficient balance returns 402 INSUFFICIENT_WALLET_BALANCE
- ☐ FundWallet debited for loanAmount
- ☐ RITS credit to borrower's account at bank identified by bankCode for loanAmount
- ☐ RITS reference stored against mandate record
- ☐ RITS credit failure → reverse FundWallet debit → notify lender → do not create mandate
- ☐ Partial RITS credit → reverse debit → PARTIAL_DISBURSEMENT alert → do not create mandate
- ☐ Mandate created only after full, confirmed RITS credit
- ☐ RITS narration includes lender's name



### Story 3.4 — Lender-managed disbursement path

**As a** PayBridge mandate service, **I want** to create the mandate without a disbursement event when the lender is configured as disbursement-independent, **so that** lenders who disburse directly can use PayBridge's mandate infrastructure.

**Acceptance criteria:**
- ☐ Merchant disbursementMode = LENDER_DISBURSE triggers this path
- ☐ PayBridge skips FundWallet debit and RITS credit
- ☐ Mandate created immediately
- ☐ Mandate record flagged with disbursementMode = LENDER_DISBURSE
- ☐ Setting disbursementMode = LENDER_DISBURSE requires explicit sign-off from a PayBridge commercial relationship manager



### Story 3.5 — Direct debit mandate creation and dispatch

**As a** PayBridge mandate service, **I want** to create a mandate record and dispatch it to the borrower's salary bank, **so that** the bank is authorised to collect monthly repayments without re-authorisation.

**Acceptance criteria:**
- ☐ Mandate created with: mandate_id (UUID), lender_id, accountNumber, bankCode, loanAmount, collectionAmount, dateOfCollection, numberOfRepayments, totalCollectionAmount, consent_id reference, disbursementMode, status ACTIVE
- ☐ Mandate dispatched to the bank identified by bankCode — any valid Nigerian bank code accepted
- ☐ Bank acknowledgement awaited — no response in 24 hours triggers operations alert
- ☐ Borrower receives SMS: "A direct debit mandate for ₦[collectionAmount]/month has been set up with [Bank Name] for your [Lender Name] loan."



# Epic 4: PayrollSync Loan Registration



### Story 4.1 — PayrollSync borrower onboarding

**As a** PayBridge integration service, **I want** to onboard the employee as a PayrollSync borrower, **so that** a wacsCustomerId exists for use in the loan application.

**Acceptance criteria:**
- ☐ PayBridge calls POST /onboarding/ussd with IPPIS number, phone number, BVN
- ☐ PayrollSync returns onboardingRef and status PENDING
- ☐ PayBridge polls GET /onboarding/{onboardingRef}/status until COMPLETED
- ☐ wacsCustomerId stored against the borrower record
- ☐ Existing wacsCustomerId is reused, onboarding not re-triggered
- ☐ PAYROLLSYNC_ONBOARDING_TIMEOUT alert raised if onboarding does not complete within 10 minutes



### Story 4.2 — PayrollSync loan registration via lender token

**As a** PayBridge integration service, **I want** to register the loan with PayrollSync using the specific lender's token, **so that** PayrollSync records the loan under the correct lender identity and GovPay surfaces the lender's name on the payslip.

**Acceptance criteria:**
- ☐ PayBridge calls POST /loans/application with the specific lender's PayrollSync token in the Authorization header, using a generic PayBridge token is a critical error
- ☐ PayrollSync returns loanRef and status PENDING_DECISION
- ☐ PayBridge polls GET /loans/{loanRef}/status until no longer PENDING_DECISION
- ☐ On APPROVED, PayBridge calls PATCH /loans/{loanRef}/accept
- ☐ loanRef stored against the PayBridge mandate record
- ☐ REJECTED → log rejection, notify lender, mark mandate PAYROLLSYNC_REJECTED, trigger RITS reversal
- ☐ PayrollSync unreachable → retry 5 times with exponential backoff → PAYROLLSYNC_REGISTRATION_FAILED alert



# Epic 5: Repayment Routing Engine



### Story 5.1 — PayrollSync inbound instruction receiver

**As a** PayBridge payment routing service, **I want** to expose a secure endpoint that accepts payment instructions pushed by PayrollSync, **so that** PayrollSync can send salary and repayment instructions that PayBridge executes correctly.

**Acceptance criteria:**
- ☐ PayBridge exposes POST endpoint authenticated via pre-shared API key in X-Api-Key header
- ☐ Endpoint accepts two instruction types: SALARY_CREDIT and LOAN_REPAYMENT
- ☐ Validates: X-Wacs-Origin header (must be WACS_ORIGINATED), wacsRef presence and format, instructionType, all required payload fields
- ☐ Missing X-Wacs-Origin header triggers PAYROLLSYNC_FLAG_MISMATCH alert — transaction held for manual review
- ☐ PayBridge responds 202 Accepted immediately, processing is asynchronous
- ☐ PayBridge sends callback to PayrollSync with final status and RITS reference



### Story 5.2 — Routing engine — three-scenario decision logic

**As a** PayBridge routing engine, **I want** to route every inbound payment instruction to the correct scenario path, **so that** PayrollSync transactions bypass inflight collections, INFLIGHT transactions run the standard model, and CREDIT_FIRST credits before deducting.

**Acceptance criteria:**
- ☐ Routing engine reads repaymentScenario from merchant configuration before processing any instruction
- ☐ **Rule 1 — PAYROLLSYNC path:** repaymentScenario = PAYROLLSYNC AND X-Wacs-Origin = WACS_ORIGINATED → bypass inflight collections, execute as received, log route = PAYROLLSYNC_EXECUTED
- ☐ **Rule 2 — INFLIGHT path:** repaymentScenario = INFLIGHT → run inflight collections, deduct loan, credit net salary and repayment, log route = INFLIGHT_EXECUTED
- ☐ **Rule 3 — CREDIT_FIRST path:** repaymentScenario = CREDIT_FIRST → credit borrower first, collect repayment separately, log route = CREDIT_FIRST_EXECUTED
- ☐ **Rule 4 — Mismatch alert:** repaymentScenario = PAYROLLSYNC AND X-Wacs-Origin absent → hold transaction, log PAYROLLSYNC_FLAG_MISMATCH, alert operations, do not auto-process
- ☐ **Rule 5 — Rogue header alert:** repaymentScenario ≠ PAYROLLSYNC AND X-Wacs-Origin present → process using merchant configured scenario, log PAYROLLSYNC_HEADER_ON_NON_PAYROLLSYNC_MERCHANT
- ☐ Every routing decision logged with: instruction_id, wacsRef, merchant_id, repaymentScenario, rule_applied, timestamp, outcome
- ☐ Routing logs immutable and retained for minimum 7 years
- ☐ **Dedicated UAT test case exists for each of the five rules — each must be signed off by engineering lead and PM before production deployment**



### Story 5.3 — PayrollSync salary credit execution

**As a** PayBridge RITS execution service, **I want** to credit the employee's full gross salary without any deduction, **so that** the employee receives the correct amount and GovPay records it as gross earnings on the payslip.

**Acceptance criteria:**
- ☐ On SALARY_CREDIT instruction routed to PAYROLLSYNC path, PayBridge executes RITS credit for creditAmount to borrower's accountNumber at bankCode
- ☐ RITS narration taken exactly from the instruction's narration field, not modified by PayBridge
- ☐ No loan deduction check run, no inflight collections logic applied, enforced at code level
- ☐ RITS reference stored against wacsRef
- ☐ RITS failure: retry once after 60 seconds → mark FAILED → operations alerted → resolve manually same business day



### Story 5.4 — PayrollSync lender repayment execution

**As a** PayBridge RITS execution service, **I want** to credit the lender's settlement account as a completely separate transaction from the salary credit, **so that** the loan repayment appears as a distinct named line item on the employee's payslip.

**Acceptance criteria:**
- ☐ On LOAN_REPAYMENT instruction, PayBridge executes RITS credit for repaymentAmount to lenderSettlementAccount
- ☐ This RITS transaction is entirely separate from the salary credit, different RITS reference, different narration
- ☐ Narration taken exactly from instruction and must include lender name and month/year
- ☐ No inflight collections applied
- ☐ RITS failure does not affect the salary credit transaction, two instructions are independent



### Story 5.5 — Idempotency for PayrollSync inbound instructions

**As a** PayBridge routing service, **I want** to detect and handle duplicate PayrollSync instructions safely, **so that** retry logic does not cause duplicate salary credits or repayments.

**Acceptance criteria:**
- ☐ wacsRef is the idempotency key
- ☐ On receipt, PayBridge checks processed_refs store for the wacsRef
- ☐ If found: return 200 OK with original RITS reference, no re-processing
- ☐ If not found: process normally and write wacsRef to store on completion
- ☐ processed_refs entries retained for minimum 90 days
- ☐ Idempotency check happens before any RITS transaction is initiated
- ☐ **Integration test:** send same wacsRef twice, verify only one RITS transaction created, second call returns 200 OK with same RITS reference



# Epic 6: Mandate Lifecycle Operations



### Story 6.1 — Send debit instruction

**As a** lender via PayBridge API, **I want** to trigger a specific debit instruction against an active mandate, **so that** repayments are collected on schedule.

**Acceptance criteria:**
- ☐ Lender calls PayBridge debit instruction endpoint with mandate_id, collection_amount, collection_date
- ☐ Inactive or stopped mandates return 409
- ☐ collection_amount exceeding outstanding balance returns 400
- ☐ Debit result returned asynchronously via callback
- ☐ Failed debit retried once after 24 hours with lender notification on both failure and retry result
- ☐ Each debit logged with mandate_id, amount, date, bank response, RITS reference



### Story 6.2 — Stop mandate

**As a** lender or PayBridge operations, **I want** to halt all future deductions on a mandate, **so that** no further money is collected after the stop instruction is issued.

**Acceptance criteria:**
- ☐ Stop mandate initiated by lender via API or by operations via admin console
- ☐ Mandate status updated to STOPPED with stop_reason and stop_timestamp
- ☐ Mandate cancellation instruction dispatched to borrower's bank
- ☐ Bank acknowledgement stored
- ☐ Borrower receives SMS confirmation
- ☐ Stopped mandate cannot be reactivated
- ☐ PayrollSync notified so GovPay can remove deduction from future payroll runs
- ☐ Stop logged with initiator, reason, timestamp, bank acknowledgement



### Story 6.3 — Repayment history query

**As a** lender via PayBridge API, **I want** to retrieve all collections made against a mandate, **so that** I can reconcile my loan book.

**Acceptance criteria:**
- ☐ Lender calls GET /mandates/{mandate_id}/repayments
- ☐ Response includes for each repayment: collection_date, amount, bank_response_code, RITS_reference, wacsRef (if PayrollSync-originated), status
- ☐ Response includes: total collected, outstanding balance, next scheduled collection date
- ☐ Paginated — default 12 records, maximum 60
- ☐ Available for both active and closed mandates



# Epic 7: Loan Closure



### Story 7.1 — Final repayment detection and loan closure

**As a** PayBridge repayment service, **I want** to automatically detect the final repayment and close the loan across all systems, **so that** no further deductions are made and the employee's payslip reflects closure.

**Acceptance criteria:**
- ☐ After each repayment, PayBridge checks: total repayments made = numberOfRepayments AND total collected = totalCollectionAmount
- ☐ On match, mandate marked CLOSED with closure timestamp
- ☐ PayBridge calls relevant PayrollSync endpoint to update loan status to CLOSED
- ☐ Stop mandate instruction issued to borrower's bank
- ☐ PayrollSync notifies GovPay to remove deduction from payroll profile
- ☐ Borrower receives SMS: "Your [Lender Name] payroll loan has been fully repaid."
- ☐ Next payroll run must not include the deduction for this loan



### Story 7.2 — Audit log retention at closure

**As a** PayBridge compliance service, **I want** to retain all loan records for the required regulatory period, **so that** a complete audit trail is available for any dispute or regulatory audit.

**Acceptance criteria:**
- ☐ Closure package archived: all consent records, mandate records, RITS references, wacsRef values, PayrollSync API logs, routing decision logs, SMS confirmations
- ☐ Retention period minimum 7 years from loan closure (Legal/Compliance to confirm in writing before this story enters development)
- ☐ Archived records in immutable, access-controlled store
- ☐ Retrievable by mandate_id, loanRef, or borrower_id
- ☐ Access restricted to Compliance, Legal, authorised Operations roles



# Epic 8: Monitoring, Alerting & Reconciliation



### Story 8.1 — PayrollSync flag mismatch alerting

**As a** PayBridge operations monitoring service, **I want** immediate alerts when a PayrollSync-configured merchant sends an instruction without the required flag, **so that** the team can investigate before a financial error occurs.

**Acceptance criteria:**
- ☐ Alert PAYROLLSYNC_FLAG_MISMATCH raised when repaymentScenario = PAYROLLSYNC but X-Wacs-Origin header absent
- ☐ Alert PAYROLLSYNC_HEADER_ON_NON_PAYROLLSYNC_MERCHANT raised when header present but repaymentScenario ≠ PAYROLLSYNC
- ☐ Both alerts delivered within 60 seconds of detection
- ☐ Held transactions visible in operations queue with alert reason and original payload
- ☐ Manual releases logged with operator identity, timestamp, resolution reason



### Story 8.2 — PayrollSync API availability monitoring

**As a** PayBridge integration monitoring service, **I want** to continuously monitor PayrollSync API availability, **so that** failures are detected within minutes.

**Acceptance criteria:**
- ☐ PayBridge pings PayrollSync GET /loan-products every 5 minutes using a monitoring credential
- ☐ HTTP 2xx within 5 seconds = HEALTHY
- ☐ HTTP 5xx or timeout = DEGRADED alert
- ☐ Three consecutive DEGRADED signals = PAYROLLSYNC_API_DOWN with escalation
- ☐ P95 latency exceeding 3 seconds triggers PAYROLLSYNC_SLOW alert



### Story 8.3 — Daily reconciliation

**As a** PayBridge reconciliation service, **I want** to run a daily reconciliation comparing PayrollSync records against PayBridge mandate records and RITS logs, **so that** any discrepancy is detected within one business day.

**Acceptance criteria:**
- ☐ Daily reconciliation job runs at 23:00 WAT
- ☐ For each active PayrollSync-registered loan, PayBridge compares: PayrollSync outstanding balance vs PayBridge mandate outstanding balance vs sum of RITS repayment transactions
- ☐ Any three-way mismatch flagged as RECONCILIATION_DISCREPANCY with loan reference, discrepancy amount, and source
- ☐ Report delivered to Finance and Operations by 07:00 WAT
- ☐ Discrepancies exceeding ₦10,000 trigger immediate alert regardless of time



# Appendix A: PayrollSync Transaction Flag Specification

This resolves open item D1.

## Three-layer flag approach

**Layer 1 — Merchant configuration (primary):** Each GovPay employer/merchant is configured with repaymentScenario = "PAYROLLSYNC". This is the ground truth. Set by PayBridge operations only. Cannot be overridden by an inbound request.

**Layer 2 — Inbound HTTP header (secondary verification):** All PayrollSync-originated instructions must carry the header `X-Wacs-Origin: WACS_ORIGINATED`. If absent on a PAYROLLSYNC merchant, transaction is held and PAYROLLSYNC_FLAG_MISMATCH alert is raised.

**Layer 3 — Request body field (audit trail):** All instructions must include `"wacsRef"` — a PayrollSync-generated reference ID. Format: `WACS_SAL_{YYYYMMDD}_{sequence}` for salary, `WACS_REP_{YYYYMMDD}_{sequence}` for repayment. Not used for routing — used for idempotency and reconciliation.

## Routing rules summary

| Rule | Condition | Action |
|---|---|---|
| 1 — PAYROLLSYNC | repaymentScenario = PAYROLLSYNC AND X-Wacs-Origin = WACS_ORIGINATED | Bypass inflight collections, execute as received |
| 2 — INFLIGHT | repaymentScenario = INFLIGHT | Run inflight collections normally |
| 3 — CREDIT_FIRST | repaymentScenario = CREDIT_FIRST | Credit first, collect separately |
| 4 — Mismatch alert | repaymentScenario = PAYROLLSYNC AND header absent | Hold, alert operations |
| 5 — Rogue header | repaymentScenario ≠ PAYROLLSYNC AND header present | Use configured scenario, log alert |

## Idempotency

wacsRef is the idempotency key. Processed wacsRef values retained 90 days minimum. Duplicate instructions return 200 OK with original response, no re-processing.



# Appendix B: Engineering Handoff

## Implementation sequence

Build in this order to minimise dependency blockages:

1. Per-lender PayrollSync token store and refresh manager — nothing else can begin without this
2. PayBridge consent page and OTP flow — no PayrollSync dependency, can build and test independently
3. Salary data request handler — depends on step 2
4. PayrollSync authentication call — depends on step 1
5. PayrollSync loan product management — depends on step 4
6. PayrollSync user onboarding — depends on step 4
7. Mandate intake endpoint — depends on steps 2 and 4
8. RITS disbursement integration — depends on step 7
9. PayrollSync loan registration — depends on steps 4 and 7
10. Routing engine with three-scenario flag logic — most complex step, requires dedicated UAT
11. Mandate lifecycle operations — depends on step 7
12. Loan closure logic — depends on steps 9 and 10
13. Audit log retention — can be built in parallel with steps 2–12

## Test scenarios required

**Consent flow:** valid OTP, invalid OTP, expired OTP, OTP resend, duplicate consent, consent revocation

**Mandate flow:** valid authorisationCode, expired code, mismatched code, Remita-disburse path success, RITS credit failure, lender-disburse path, insufficient wallet balance

**Routing engine:** all five rules must have dedicated UAT test cases signed off by engineering lead and PM before production deployment

**Idempotency:** same wacsRef sent twice, verify only one RITS transaction created

**Token management:** expiry and refresh, HTTP 401 rotation, token isolation between lenders

**Loan closure:** final repayment, stop mandate, GovPay deregistration, payslip no longer shows deduction



# Appendix C: Open Items — Resolved

**D1 — PayrollSync transaction flag:** Resolved. Three-layer approach defined in Appendix A. Five routing rules defined. Each requires a dedicated UAT test signed off before production.

**D2 — OTP channel:** Resolved. SMS to phone registered against borrower's payroll account. authorisationChannel = "USSD" for V1 per existing PayBridge convention.

**D3 — Per-lender token management:** Resolved. Defined in Story 1.3. Security team review is a prerequisite for Story 1.3 to enter development.

**D4 — Lender settlement fee:** Pending — blocks UAT sign-off. Commercial and legal teams must agree before go-live.

**D5 — Revenue share split:** Pending — blocks UAT sign-off.

**D6 — Audit log retention:** Resolved in principle — minimum 7 years. Legal/Compliance must confirm in writing before Story 7.2 enters development.

**Q1 — Customer ID source:** Resolved. customerId in the mandate payload is the identifier returned by PayBridge's consent callback. wacsCustomerId from PayrollSync onboarding is used for PayrollSync-side calls. Two distinct identifiers — both must be stored.

**Q2 — PayrollSync V2 aggregator timeline:** Pending. Escalate at every quarterly business review with PayrollSync.

**Q3 — PayrollSync inbound instruction mechanism:** Resolved. Push model — PayrollSync calls PayBridge's POST endpoint. Authenticated via pre-shared API key. PayBridge responds 202 Accepted, processes asynchronously. SLA: instructions delivered within 30 minutes of GovPay payroll processing completing.



*Company names and identifiers in this document have been anonymised.*