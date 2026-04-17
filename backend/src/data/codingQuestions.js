const codingQuestions = [
  {
    id: "two-sum-pair",
    title: "Find Pair With Target Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers and a target, return true if any two numbers add up to target. Otherwise return false.",
    constraints: [
      "Array length can be from 0 to 100000",
      "Values may be negative, zero, or positive",
      "Target can be any integer in 32-bit range",
    ],
    expectedBehavior:
      "Return a boolean value: true when at least one valid pair exists, otherwise false.",
    functionName: "solve",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "true",
      },
      {
        input: "nums = [1, 2, 3], target = 7",
        output: "false",
      },
    ],
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: true },
      { input: [[1, 2, 3, 4], 8], expected: false },
      { input: [[5, 5], 10], expected: true },
      { input: [[-1, 2, 4, 6], 5], expected: true },
      { input: [[], 1], expected: false },
    ],
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    description:
      "Return a new string which is the reverse of the given input string.",
    constraints: [
      "Input can be an empty string",
      "Input can contain letters, digits, and symbols",
      "Preserve character case exactly",
    ],
    expectedBehavior:
      "Return the reversed string without mutating external state.",
    functionName: "solve",
    examples: [
      {
        input: "s = hello",
        output: "olleh",
      },
      {
        input: "s = Interview",
        output: "weivretnI",
      },
    ],
    testCases: [
      { input: ["hello"], expected: "olleh" },
      { input: ["Interview"], expected: "weivretnI" },
      { input: ["a"], expected: "a" },
      { input: [""], expected: "" },
      { input: ["12345"], expected: "54321" },
    ],
  },
  {
    id: "count-vowels",
    title: "Count Vowels",
    difficulty: "Medium",
    description:
      "Given a string, return the number of English vowels (a, e, i, o, u) present in it (case-insensitive).",
    constraints: [
      "Input can be empty",
      "Count vowels in a case-insensitive manner",
      "Only English vowels (a, e, i, o, u) are counted",
    ],
    expectedBehavior:
      "Return an integer representing vowel count for the complete string.",
    functionName: "solve",
    examples: [
      {
        input: "s = OpenRouter",
        output: "5",
      },
      {
        input: "s = rhythm",
        output: "0",
      },
    ],
    testCases: [
      { input: ["OpenRouter"], expected: 5 },
      { input: ["rhythm"], expected: 0 },
      { input: ["AEIOU"], expected: 5 },
      { input: ["interview system"], expected: 4 },
      { input: [""], expected: 0 },
    ],
  },
];

const getQuestionById = (id) => codingQuestions.find((question) => question.id === id);

const getPublicQuestions = () =>
  codingQuestions.map(({ testCases, ...publicQuestion }) => publicQuestion);

module.exports = {
  codingQuestions,
  getQuestionById,
  getPublicQuestions,
};
