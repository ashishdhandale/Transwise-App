
'use server';

import { collection, doc, runTransaction, getDoc, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase'; // Assumes firebase is initialized and exported from here
import { getCurrentFinancialYear } from '@/lib/utils';


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
