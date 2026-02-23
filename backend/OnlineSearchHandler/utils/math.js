// matches the cosine similarity of the result

export const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be of the same length");
  }

  let dotProduct = 0;
  let mA = 0;
  let mB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);

  // Safety check: prevent division by zero if a vector is empty/all zeros
  if (mA === 0 || mB === 0) {
    return 0;
  }

  return dotProduct / (mA * mB);
};
