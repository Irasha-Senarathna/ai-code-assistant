function chunkText(text, chunkSize = 500) {
  const sentences = text.split(". ");
  const chunks = [];

  let current = "";

  for (let sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence + ". ";
    }
  }

  if (current) chunks.push(current);

  return chunks;
}

module.exports = { chunkText };