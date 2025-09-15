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

<br>

### 2. Profiles Collection

This collection will store additional profile information, linked to the `Users` collection. This keeps authentication data separate from profile data.

| Field | Type | Description |
| :--- | :--- | :--- |
| **`userId`** | `string` | **(Primary Key & Foreign Key)** Links to a `userId` in the Users collection. |
| `firstName` | `string` | The user's first name. |
| `lastName` | `string` | The user's last name. |
| `companyId` | `string` | *(Optional)* Foreign key linking to the `Companies` collection. |
| `branchId` | `string` | *(Optional)* Foreign key linking to the `Branches` collection. |
| `createdAt` | `timestamp` | The timestamp when the profile was created. |

<br>

### 3. Companies Collection

This collection stores details for each company registered on the platform.

| Field | Type | Description |
| :--- | :--- | :---- |
| **`companyId`** | `string` | **(Primary Key)** Unique identifier for the company. |
| `name` | `string` | The legal name of the company. |
| `ownerId` | `string` | Foreign key linking to the `userId` of the company owner. |
| `createdAt` | `timestamp` | The timestamp when the company was registered. |

<br>

### 4. Branches Collection

This collection holds information about the individual branches associated with a company.

| Field | Type | Description |
| :--- | :--- | :---- |
| **`branchId`** | `string` | **(Primary Key)** Unique identifier for the branch. |
| `companyId` | `string` | **(Foreign Key)** Links to a `companyId` in the `Companies` collection. |
| `name` | `string` | The name of the branch (e.g., "Downtown Warehouse"). |
| `location` | `string` | The physical address of the branch. |
| `createdAt` | `timestamp` | The timestamp when the branch was created. |
