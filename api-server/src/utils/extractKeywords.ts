function extractKeywords(text: string) {
  if (!text) return [];

  // Convert text to lowercase and remove punctuation using regex
  const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, "");

  // Split the text into words based on spaces
  const words = cleanedText.split(/\s+/);

  // Filter out words that are too short (less than 3 characters)
  const filteredWords = words.filter((word) => word.length >= 3);

  // Create a Set to store unique keywords
  const uniqueKeywords = new Set(filteredWords);

  // Return the keywords as an array
  return Array.from(uniqueKeywords);
}

// Example usage for title, url, and text of a post
export function extractPostKeywords({
  title,
  text,
  url,
}: {
  title: string;
  url?: string;
  text?: string;
}) {
  let keywords: string[] = [];

  // Extract keywords from title, url, and text
  keywords = keywords.concat(extractKeywords(title));
  keywords = keywords.concat(extractKeywords(url ?? ""));
  keywords = keywords.concat(extractKeywords(text ?? ""));

  // Remove any duplicate keywords using a Set
  return Array.from(new Set(keywords));
}
