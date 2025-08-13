const { generatePostmanCollection } = require('./src/lib/postman.ts');

// Test data
const prompt = "What is the capital of France?";
const context = "Please provide a brief answer.";
const responses = [
  {
    provider: "ollama:llama3.2:3b",
    content: "The capital of France is Paris."
  }
];

// Generate collection
const collection = generatePostmanCollection(prompt, context, responses);

// Print the collection
console.log(JSON.stringify(collection, null, 2));
