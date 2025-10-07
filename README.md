# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## User Roles

The application is designed with three distinct user roles, each with specific permissions and responsibilities:

### 1. Admin (Super Admin)
The top-level administrator for the entire platform. Their primary role is to manage the companies that use the service.
- **Key Responsibilities:**
  - Create and manage company accounts.
  - Assign and update user licenses (e.g., Trial, Bronze, Gold).
  - View platform-wide sales, revenue, and membership reports.
  - Configure global settings like marketing templates and coupon codes.

### 2. Company
The owner or primary manager of a logistics business registered on the platform. This role has full control over their own company's data and operations.
- **Key Responsibilities:**
  - Create, edit, and manage all bookings.
  - Add and manage their own branches and staff members.
  - Access company-specific reports (e.g., booking reports, tax reports).
  - Configure company settings, such as LR/Challan number formats, print layouts, and default charges.
  - Manage master data lists (Customers, Items, Vehicles, etc.).

### 3. Branch
A user who operates under a specific branch of a company. Their access is typically restricted to the data and operations of their assigned branch.
- **Key Responsibilities:**
  - Create and manage bookings originating from their branch.
  - View and manage local stock.
  - Participate in the dispatch (challan) process for their location.
  - Cannot access company-wide settings or master data.
