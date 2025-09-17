# Database Schema

This document outlines the database structure for the application, designed to support the defined user roles and their relationships.

### 1. Users Collection

This collection will store authentication and role information for every user on the platform.

| Field | Type | Description |
| :--- | :--- | :--- |
| **`userId`** | `string` | **(Primary Key)** Unique identifier for the user. |
| `email` | `string` | The user's email address, used for login. Must be unique. |
| `passwordHash` | `string` | A securely hashed version of the user's password. |
| `role` | `enum` | Role of the user (`'Admin'`, `'Company'`, `'Branch'`, `'employee'`). |
| `companyId` | `string` | **(Foreign Key)** Links to the `Companies` collection. Applies to all roles except Admin. |

<br>

### 2. Companies Collection

This collection stores details for each company registered on the platform. A single document can represent a company.

| Field | Type | Description |
| :--- | :--- | :---- |
| **`companyId`** | `string` | **(Primary Key)** Unique identifier for the company. |
| `ownerId` | `string` | **(Foreign Key)** Links to the `userId` of the company owner. |
| `companyName` | `string` | The legal name of the company. |
| `grnPrefix` | `string` | The prefix used for generating Goods Receipt Numbers (e.g., 'CONAG'). |
| `headOfficeAddress`| `string` | The primary address of the company. |
| `officeAddress2` | `string` | An optional secondary address. |
| `city` | `string` | The city of the head office. |
| `pan` | `string` | The company's PAN number. |
| `gstNo` | `string` | The company's GSTIN. |
| `companyContactNo`| `string` | Comma-separated contact numbers. |
| `companyEmail` | `string` | The primary contact email for the company. |
| `createdAt` | `timestamp` | The timestamp when the company was registered. |

<br>

### 3. Branches Collection

This collection holds information about the individual branches associated with a company.

| Field | Type | Description |
| :--- | :--- | :---- |
| **`branchId`** | `string` | **(Primary Key)** Unique identifier for the branch. |
| `companyId` | `string` | **(Foreign Key)** Links to a `companyId` in the `Companies` collection. |
| `name` | `string` | The name of the branch (e.g., "Downtown Warehouse"). |
| `location` | `string` | The physical address of the branch. |
| `createdAt` | `timestamp` | The timestamp when the branch was created. |
