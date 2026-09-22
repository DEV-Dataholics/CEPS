Within **Sistema CEPS**, **Gestión Operativa y Vacantes** (Operational & Vacancy Management) represents the core control module that matches qualified security personnel to active client requirements, ensures real-time backend synchronization, and handles employee offboarding 1-3.

### 1\. Matching Active Guards to Client Vacancies

* **Active Element Pool:** Once candidates pass all digital exams and complete document verification, administrators mark them as "apt" (*persona apta*) and transfer them into the active personnel pool 2, 4\.  
* **Client Position Deployment:** Using a dedicated vacancy administration view, administrators pull unassigned active guards from this pool and allocate them directly to open slots and shifts based on client demands 2\.

### 2\. Relational Synchronization & Automatic Vacancy Reopening

* **Backend Relational Integrity:** Operational management depends on interconnected backend tables so that status updates immediately propagate across the entire platform 3\.  
* **Preventing Hidden Vacancies:** When an administrator offboards a guard (*baja de un empleado*), relational database links automatically unassign the employee from their assigned client company and shift 3, 5\. This eliminates data disconnects where a guard is offboarded administratively but still appears active at a client site, which would mask an open, uncovered vacancy (*vacante a cubrir*) 3, 5\.

### 3\. Offboarding Control, Soft Deletes & Blacklisting

* **Multi-Company Offboarding:** Administrators maintain full control to process guard terminations across different companies, locations, and shifts 3\.  
* **Soft Delete Preservation:** To safeguard historical data, system catalogs use soft deletes—inactivating records when removed rather than permanently erasing them from the database 5\.  
* **Administrative Blacklist ("No Contratable"):** Administrators can manually mark users in the system tables as non-hireable (*no contratable*) 2\. This status instantly alerts field recruiters during document scans if an offboarded guard attempts to apply again 2, 3\.

### 4\. Role Governance and View Isolation

* **Access Segmentation:** Operational vacancy control is restricted to authorized roles, specifically the Vacancy Administrator (*Administrador de Vacantes*) and General Administrator 6\.  
* **View Restrictions:** System interfaces are locked across all four core system roles (Candidate, Recruiter, Vacancy Administrator, and General Administrator), ensuring each user only accesses the tools necessary for their operational function 6\.

💡 Would you like to review how the upcoming system demo simulates these four user roles across a complete end-to-end operational workflow?

&nbsp;