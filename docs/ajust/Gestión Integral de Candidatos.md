Within **Sistema CEPS**, **Administración de Candidatos** serves as the central administrative hub that connects initial field recruitment with active operational deployment, overseeing candidate evaluation, documentation, and vacancy assignment 1, 2\.

### 1\. Candidate Inbox and Profile Approval

* **Centralized Inbox:** The basic profile created during field recruitment is sent directly to the administrator's candidate management inbox (*bandeja de administración de candidatos*) 2\.  
* **Phase Gatekeeper:** The administrator reviews this initial profile and approves it to advance the applicant to the evaluation stage 2\.

### 2\. Exam Management & Progress Monitoring

* **Enabling Digital Tests:** The vacancy administrator links the field registration to tablet-based exams using the applicant's unique candidate ID 2, 3\.  
* **Individual Application:** Administrators select and enable specific exams individually for each candidate 4\.  
* **Real-Time Progress Tracking:** The system gives administrators full visibility over test progress, showing who has finished, who is pending, and which exams remain uncompleted 4\.  
* **Results Access:** Candidates only record their answers on tablets without seeing test scores, while administrators retain full access to review all submitted answers 3\.

### 3\. Verification, Blacklisting, and Deployment

* **Active Pool Transition:** Once exams are passed and all documentation is verified, the administrator marks the candidate as "apt" (*persona apta*) and moves them into the available active pool 5\.  
* **Client Vacancy Assignment:** Administrators draw unassigned active guards from this pool and allocate them to specific client vacancies 6\.  
* **Manual Blacklist Control ("No Contratable"):** Administrators maintain manual control over user tables to flag individuals as non-hireable 6\. This administrative flag triggers an instant warning if that candidate tries to apply again in the field 7\.

### 4\. Backend Integrity & Role Governance

* **Role-Based Access:** Candidate administration is restricted to specific administrative roles (such as *Administrador de Vacantes* and *Administrador General*) so users only see authorized views 8\.  
* **Soft Deletes & Relational Offboarding:** Administrators oversee catalog edits and utilize soft deletes to preserve historical data without permanently removing database records 9\. When an administrator offboards an employee, backend relational links ensure the guard is unassigned and the vacancy immediately re-opens for coverage 7, 9\.

💡 Would you like to examine how the candidate self-service portal keeps applicants informed of their status throughout these administrative phases?

&nbsp;