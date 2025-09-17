# Booking Database Schema

This document outlines the proposed database structure for storing all data related to a single booking transaction. This schema is designed to be normalized to reduce data redundancy and improve data integrity.

### 1. `Bookings` Collection

This is the main collection for storing the high-level details of each booking. Each document represents a single Goods Receipt (GR).

| Field | Type | Description |
| :--- | :--- | :--- |
| **`bookingId`** | `string` | **(Primary Key)** A unique identifier for the booking document (e.g., UUID). |
| `grNumber` | `string` | **(Indexed, Unique)** The human-readable Goods Receipt Number (e.g., `CONGP01`). |
| `companyId` | `string` | **(Foreign Key)** Links to the `Companies` collection. |
| `branchId` | `string` | **(Foreign Key)** Links to the `Branches` collection where the booking was made. |
| `bookingDate` | `timestamp` | The date and time the booking was created. |
| `loadType` | `string` | The type of load (e.g., 'PTL' for Part Truck Load, 'FTL' for Full Truck Load). |
| `fromStationId` | `string` | **(Foreign Key)** Links to the ID of the origin city in the `Cities` master collection. |
| `toStationId` | `string` | **(Foreign Key)** Links to the ID of the destination city in the `Cities` master collection. |
| `bookingType` | `string` | The payment type for the booking (e.g., 'FOC', 'PAID', 'TOPAY', 'TBB'). |
| `senderId` | `string` | **(Foreign Key)** Links to the `Customers` collection for the consignor. |
| `receiverId` | `string` | **(Foreign Key)** Links to the `Customers` collection for the consignee. |
| `bookingNote` | `string` | Private marks or notes associated with the booking. |
| `status` | `string` | The current status of the booking (e.g., 'In Stock', 'In Transit', 'Delivered'). |
| `grandTotal` | `number` | The final calculated grand total for the booking. |
| `createdById` | `string` | **(Foreign Key)** Links to the `Users` collection for the user who created the booking. |
| `createdAt` | `timestamp` | Timestamp of when the booking document was created. |

<br>

### 2. `BookingItems` Collection

This collection stores the line items for each booking. There is a one-to-many relationship between a `Booking` and `BookingItems`.

| Field | Type | Description |
| :--- | :--- | :--- |
| **`itemId`** | `string` | **(Primary Key)** A unique identifier for this specific line item. |
| `bookingId` | `string` | **(Foreign Key)** Links back to the parent `Bookings` document. |
| `ewbNo` | `string` | E-Way Bill number, if applicable. |
| `itemName` | `string` | The name of the item being shipped. |
| `description` | `string` | A description of the item. |
| `quantity` | `number` | The number of units for this item. |
| `actualWeight` | `number` | The actual weight of the item. |
| `chargeableWeight`| `number` | The weight used for freight calculation. |
| `rate` | `number` | The rate applied. |
| `freightOn` | `string` | The basis for freight calculation (e.g., 'Act.wt', 'Chg.wt', 'Fixed'). |
| `lumpsum` | `number` | The calculated or fixed freight amount for this line item. |
| `privateMark` | `string` | Any private mark specific to this item. |
| `invoiceNo` | `string` | The invoice number related to this item. |
| `declaredValue` | `number` | The declared value of the item. |
| `customFields` | `map` | An object to store key-value pairs for any custom columns created by the user. |

<br>

### 3. `BookingCharges` Collection

This collection stores the various additional charges applied to a booking.

| Field | Type | Description |
| :--- | :--- | :--- |
| **`chargeId`** | `string` | **(Primary Key)** Unique ID for the charge entry. |
| `bookingId` | `string` | **(Foreign Key)** Links back to the parent `Bookings` document. |
| `chargeName` | `string` | The name of the charge (e.g., 'Builty Charge', 'Door Delivery'). |
| `value` | `number` | The amount for this charge. |

*Note: This could also be stored as an array of objects directly within the `Bookings` document if the charges don't need to be queried independently.*

<br>

### 4. `BookingInstructions` Collection

This collection stores the delivery instructions for a booking.

| Field | Type | Description |
| :--- | :--- | :--- |
| **`instructionId`** | `string` | **(Primary Key)** Unique ID for the instruction entry. |
| `bookingId` | `string` | **(Foreign Key)** Links back to the parent `Bookings` document. |
| `insurance` | `string` | e.g., 'Yes' or 'No'. |
| `deliveryAt` | `string` | e.g., 'Godown Deliv' or 'Door Deliv'. |
| `deliveryPoint` | `string` | The specific delivery point. |
| `podRequired` | `string` | Proof of Delivery required ('Yes'/'No'). |
| `attachCC` | `string` | Attach Consignee Copy ('Yes'/'No'). |
| `priority` | `string` | e.g., 'Express', 'Standard'. |
| `printFormat` | `string` | e.g., 'Custom Copy'. |

*Note: Like charges, these could also be stored as a single object within the `Bookings` document.*
