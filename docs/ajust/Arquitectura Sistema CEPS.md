Within **Sistema CEPS**, **Controles y Lógica del Sistema** (System Controls and Logic) represent the underlying architectural rules, database relationships, and governance mechanisms that ensure operational consistency, data integrity, and access security across all modules 1-3.

### 1\. Transversal ID & Single-Profile Lifecycle

* **Universal Identifier:** The system automatically generates a unique candidate ID or QR code during initial field registration, which serves as a transversal key throughout the recruitment lifecycle and eventually converts into the official employee ID 4\.  
* **Centralized Data Linking:** This single ID ties together candidate document scans, public tablet exam submissions, status updates in the applicant portal, and final vacancy deployment 4, 5\.

### 2\. Manual Blacklisting & Real-Time Field Verification

* **Administrative "No Contratable" Flag:** Administrators maintain direct control over user tables to manually mark individuals as non-hireable (*no contratable*) 6\.  
* **Instant Database Queries:** When recruiters scan identity documents in the field, the system instantly queries the backend database 2\. If a candidate was flagged as non-hireable, the system immediately displays an ineligibility notification ("*candidato sin posibilidad de aplicación*"), preventing recruiters from wasting time on redundant applications 2\.

### 3\. Relational Backend Synchronization & Offboarding Logic

* **Relational Table Integrity:** All modules—recruitment, candidate profiling, exam scores, client shifts, and company assignments—are interconnected through relational database tables 2\.  
* **Cascading Offboarding:** When an administrator offboards an employee (*baja de un empleado*), relational logic automatically unassigns the guard from their client company and shift 2, 7\. This prevents data disconnects where a terminated employee remains assigned on paper, ensuring unassigned vacancies immediately surface for replacement coverage 2, 7\.

### 4\. Soft Delete Data Preservation

* **Inactive Data Marking:** System catalogs implement a **soft delete** mechanism for edits and removals 7\.  
* **Preserving Historical Records:** Deleting a record updates its status to inactive without permanently erasing it from the physical database, safeguarding historical logs for system audits and reporting 7\.

### 5\. Role-Based Governance & View Isolation

* **Four System Roles:** Access is strictly partitioned across four distinct roles: Candidate (*Candidato*), Field Recruiter (*Reclutador*), Vacancy Administrator (*Administrador de Vacantes*), and General Administrator (*Administrador General*) 3\.  
* **Restricted Interfaces:** The platform enforces locked views (*vistas bloqueadas*) so each user role can only view and interact with data relevant to their specific operational responsibilities 3\. For example, candidates can check their application status via their candidate portal, but cannot view administrative management screens or exam score answers 3-5.

💡 Would you like to map out a complete end-to-end user journey for the upcoming system demo across these four roles?

&nbsp;