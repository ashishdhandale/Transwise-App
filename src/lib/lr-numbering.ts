
'use server';

import { firestore } from '@/firebase/config';
import { collection, doc, runTransaction, getDoc } from 'firebase/firestore';

/**
 * Determines the current financial year string.
 * The financial year starts on April 1st.
 * @returns {string} The financial year in "YYYY-YY" format (e.g., "2024-25").
 */
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed (January is 0)
  let startYear = now.getFullYear();

  // If the current month is before April, the financial year started last year.
  if (currentMonth < 3) {
    startYear -= 1;
  }

  const endYear = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYear}`;
}

/**
 * Generates the next sequential LR number within a Firestore transaction.
 * @param companyCode - The unique code for the company.
 * @param branchCode - The unique code for the branch.
 * @returns {Promise<string>} The next formatted LR number.
 * @throws Will throw an error if the transaction fails.
 */
export async function generateNextLrNumber(companyCode: string, branchCode: string): Promise<string> {
  const financialYear = getCurrentFinancialYear();
  const sequenceDocRef = doc(
    firestore,
    `sequences/${companyCode}/branches/${branchCode}/years/${financialYear}/documents/lrSequence`
  );

  try {
    const newSerialNumber = await runTransaction(firestore, async (transaction) => {
      const sequenceDoc = await transaction.get(sequenceDocRef);
      
      const currentSerial = sequenceDoc.exists() ? sequenceDoc.data().currentSerial : 0;
      const nextSerial = currentSerial + 1;
      
      transaction.set(sequenceDocRef, { currentSerial: nextSerial }, { merge: true });
      
      return nextSerial;
    });

    // Format the serial number with leading zeros
    const formattedSerial = String(newSerialNumber).padStart(4, '0');

    return `${companyCode}/${branchCode}/${financialYear}/${formattedSerial}`;
  } catch (e) {
    console.error("Transaction failed: ", e);
    throw new Error("Failed to generate LR number. Please try again.");
  }
}

/**
 * Validates if a manually entered LR number already exists for the given scope.
 * @param companyCode - The company code.
 *- The branch code.
 * @param financialYear - The financial year.
 * @param manualLrNumber - The LR number to validate.
 * @returns {Promise<boolean>} True if the LR number is unique, false otherwise.
 */
export async function isLrNumberUnique(
    companyCode: string, 
    manualLrNumber: string
): Promise<boolean> {
  // We can create a composite query key in the document itself to check for uniqueness.
  // For this example, we assume lorryReceipts are stored under a path that includes company,
  // and we query against the `lrNumber` field.
  // In a real-world scenario with large data, you might use a separate collection
  // of just LR numbers for faster lookups.
  
  const q = query(
      collection(firestore, `companies/${companyCode}/lorryReceipts`), 
      where("lrNumber", "==", manualLrNumber)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}
