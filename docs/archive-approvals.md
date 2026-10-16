# Archive approval workflow

Customer Details contains Archive approvals for the administrator and My archive requests for staff. Staff can request single or bulk archives from the grid or customer editor. Customers stay active until an administrator approves. The administrator may reject, directly archive, or restore records. Physical deletion remains prohibited for every role, preserving the original retention policy.

Requests retain requester identity, timestamps and final decision. The administrator gets pending approval notifications. Staff read only their own requests. Administrator approval archives the customer and resolves the request in one Firestore transaction; concurrent/replayed decisions are rejected. Requests are not deleted. Multiple staff may request the same customer; approving an already-archived customer's pending request safely resolves that request without modifying the customer again.

Security is enforced in firestore.rules, including archive state restrictions on every customer update, not just through UI controls. Request metadata is immutable. Staff cannot review requests or submit them for nonexistent/already archived customers. Active team membership and the existing verified administrator identity are checked server-side.

Run application tests with `npm test`. With Java 21+ installed, run security tests using `npx -y firebase-tools@latest emulators:exec --only firestore --project demo-akshaya-rbac --config firebase.rules-test.json 'node --test tests/archive-rules.mjs'`. Tests use synthetic local data only.

Verification: 29 application tests and 10 Firestore emulator security tests passed on 16 October 2026. Production build and Firebase rules dry-run compilation passed. Staff request confirmation and administrator approval/rejection controls were also verified in the browser using synthetic fixtures.

Rules are a reviewed prototype, not an exhaustive security guarantee. Direct-API duplicate request spam is a residual operational limitation; field bounds prevent oversized documents, UI suppresses duplicate own pending requests, but application-level rate limiting is not implemented. No new customer-data access is granted.
