/**
 * Problem bank with reference C solutions.
 * Stored in localStorage under key 'c-validator-problems'.
 */

export interface ProblemEntry {
  problem: string
  solution: string
  /** Input to pipe to stdin when running (optional) */
  stdin?: string
  /** Expected stdout when running solution with stdin (required for output-based validation) */
  expectedOutput?: string
}

const STORAGE_KEY = 'c-validator-problems'

/** Normalize text for matching: lowercase, trim, collapse whitespace */
export function normalizeProblemText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/** Get all problems from localStorage */
export function getStoredProblems(): ProblemEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Save problems to localStorage */
export function saveProblems(problems: ProblemEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems))
}

/** Find best matching problem by normalized text */
export function findMatchingProblem(
  userProblem: string,
  problems: ProblemEntry[]
): ProblemEntry | null {
  const normalized = normalizeProblemText(userProblem)
  if (!normalized) return null

  // Exact match first
  for (const p of problems) {
    if (normalizeProblemText(p.problem) === normalized) return p
  }

  // Substring match (user text contains stored problem or vice versa)
  for (const p of problems) {
    const storedNorm = normalizeProblemText(p.problem)
    if (normalized.includes(storedNorm) || storedNorm.includes(normalized)) {
      return p
    }
  }

  // Fuzzy: check if key phrases match (for minor wording differences)
  const userWords = new Set(normalized.split(/\s+/).filter((w) => w.length > 2))
  let bestMatch: ProblemEntry | null = null
  let bestScore = 0

  for (const p of problems) {
    const storedNorm = normalizeProblemText(p.problem)
    const storedWords = new Set(storedNorm.split(/\s+/).filter((w) => w.length > 2))
    let matches = 0
    for (const w of userWords) {
      if (storedWords.has(w)) matches++
    }
    const score = matches / Math.max(userWords.size, storedWords.size)
    if (score > 0.85 && score > bestScore) {
      bestScore = score
      bestMatch = p
    }
  }

  return bestMatch
}

/** Seed problems if localStorage is empty or schema outdated */
export function seedProblemsIfNeeded(): void {
  const existing = getStoredProblems()
  const needsSeed =
    existing.length === 0 ||
    (existing.length > 0 && !('expectedOutput' in existing[0]))
  if (!needsSeed) return

  saveProblems(DEFAULT_PROBLEMS)
}

/** Default problem bank with solutions */
const DEFAULT_PROBLEMS: ProblemEntry[] = [
  {
    problem: 'Print all numbers from 1 to N that are divisible by K (use N = 120, K = 4).',
    solution: `#include <stdio.h>

int main() {
    int N = 120, K = 4, i;
    for (i = 1; i <= N; i++) {
        if (i % K == 0)
            printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: '4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 72 76 80 84 88 92 96 100 104 108 112 116 120',
  },
  {
    problem: 'Print all numbers from 1 to N that are divisible by K (use N = 150, K = 5).',
    solution: `#include <stdio.h>

int main() {
    int N = 150, K = 5, i;
    for (i = 1; i <= N; i++) {
        if (i % K == 0)
            printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: '5 10 15 20 25 30 35 40 45 50 55 60 65 70 75 80 85 90 95 100 105 110 115 120 125 130 135 140 145 150',
  },
  {
    problem: 'Print all numbers from 1 to N that are divisible by K (use N = 200, K = 9).',
    solution: `#include <stdio.h>

int main() {
    int N = 200, K = 9, i;
    for (i = 1; i <= N; i++) {
        if (i % K == 0)
            printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: '9 18 27 36 45 54 63 72 81 90 99 108 117 126 135 144 153 162 171 180 189 198',
  },
  {
    problem: 'Print all numbers from 1 to N that are divisible by K (use N = 100, K = 7).',
    solution: `#include <stdio.h>

int main() {
    int N = 100, K = 7, i;
    for (i = 1; i <= N; i++) {
        if (i % K == 0)
            printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: '7 14 21 28 35 42 49 56 63 70 77 84 91 98',
  },
  {
    problem: 'Create a simple calculator that performs addition, subtraction, multiplication, and division using a switch statement.',
    solution: `#include <stdio.h>

int main() {
    char op;
    double a, b;
    printf("Enter operator (+, -, *, /): ");
    scanf(" %c", &op);
    printf("Enter two numbers: ");
    scanf("%lf %lf", &a, &b);
    switch (op) {
        case '+': printf("%.2f + %.2f = %.2f\\n", a, b, a + b); break;
        case '-': printf("%.2f - %.2f = %.2f\\n", a, b, a - b); break;
        case '*': printf("%.2f * %.2f = %.2f\\n", a, b, a * b); break;
        case '/':
            if (b != 0)
                printf("%.2f / %.2f = %.2f\\n", a, b, a / b);
            else
                printf("Error: Division by zero\\n");
            break;
        default: printf("Invalid operator\\n");
    }
    return 0;
}`,
    stdin: '+ 10 3',
    expectedOutput: 'Enter operator (+, -, *, /): Enter two numbers: 10.00 + 3.00 = 13.00',
  },
  {
    problem: 'Find the largest of three numbers using both if-else and the ternary operator.',
    solution: `#include <stdio.h>

int main() {
    int a, b, c, max_if, max_ternary;
    printf("Enter three numbers: ");
    scanf("%d %d %d", &a, &b, &c);
    if (a >= b && a >= c) max_if = a;
    else if (b >= a && b >= c) max_if = b;
    else max_if = c;
    max_ternary = (a >= b && a >= c) ? a : (b >= c ? b : c);
    printf("Largest (if-else): %d\\n", max_if);
    printf("Largest (ternary): %d\\n", max_ternary);
    return 0;
}`,
    stdin: '5 9 2',
    expectedOutput: 'Enter three numbers: Largest (if-else): 9\nLargest (ternary): 9',
  },
  {
    problem: 'Read 10 integers into an array, then find and print the largest element.',
    solution: `#include <stdio.h>

int main() {
    int arr[10], i, max;
    printf("Enter 10 integers: ");
    for (i = 0; i < 10; i++)
        scanf("%d", &arr[i]);
    max = arr[0];
    for (i = 1; i < 10; i++)
        if (arr[i] > max) max = arr[i];
    printf("Largest element: %d\\n", max);
    return 0;
}`,
    stdin: '3 7 2 9 1 8 4 6 5 10',
    expectedOutput: 'Enter 10 integers: Largest element: 10',
  },
  {
    problem: 'Read 6 integers into an array, then find and print the largest element.',
    solution: `#include <stdio.h>

int main() {
    int arr[6], i, max;
    printf("Enter 6 integers: ");
    for (i = 0; i < 6; i++)
        scanf("%d", &arr[i]);
    max = arr[0];
    for (i = 1; i < 6; i++)
        if (arr[i] > max) max = arr[i];
    printf("Largest element: %d\\n", max);
    return 0;
}`,
    stdin: '1 5 3 9 2 4',
    expectedOutput: 'Enter 6 integers: Largest element: 9',
  },
  {
    problem: 'Read 8 integers into an array, then find and print the largest element.',
    solution: `#include <stdio.h>

int main() {
    int arr[8], i, max;
    printf("Enter 8 integers: ");
    for (i = 0; i < 8; i++)
        scanf("%d", &arr[i]);
    max = arr[0];
    for (i = 1; i < 8; i++)
        if (arr[i] > max) max = arr[i];
    printf("Largest element: %d\\n", max);
    return 0;
}`,
    stdin: '2 4 6 8 1 3 5 7',
    expectedOutput: 'Enter 8 integers: Largest element: 8',
  },
  {
    problem: 'Read 5 integers into an array, then find and print the largest element.',
    solution: `#include <stdio.h>

int main() {
    int arr[5], i, max;
    printf("Enter 5 integers: ");
    for (i = 0; i < 5; i++)
        scanf("%d", &arr[i]);
    max = arr[0];
    for (i = 1; i < 5; i++)
        if (arr[i] > max) max = arr[i];
    printf("Largest element: %d\\n", max);
    return 0;
}`,
    stdin: '10 20 30 40 25',
    expectedOutput: 'Enter 5 integers: Largest element: 40',
  },
  {
    problem: 'Read a name using fgets and print a personalized greeting.',
    solution: `#include <stdio.h>
#include <string.h>

int main() {
    char name[100];
    printf("Enter your name: ");
    fgets(name, 100, stdin);
    name[strcspn(name, "\\n")] = 0;
    printf("Hello, %s! Welcome.\\n", name);
    return 0;
}`,
    stdin: 'Alice',
    expectedOutput: 'Enter your name: Hello, Alice! Welcome.',
  },
  {
    problem: 'Check whether a given string is a palindrome.',
    solution: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    int i, len, flag = 1;
    printf("Enter a string: ");
    fgets(s, 100, stdin);
    s[strcspn(s, "\\n")] = 0;
    len = strlen(s);
    for (i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) {
            flag = 0;
            break;
        }
    }
    if (flag) printf("Palindrome\\n");
    else printf("Not a palindrome\\n");
    return 0;
}`,
    stdin: 'racecar',
    expectedOutput: 'Enter a string: Palindrome',
  },
  {
    problem: 'Write a function to calculate the factorial of a non-negative integer.',
    solution: `#include <stdio.h>

long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int n;
    printf("Enter a non-negative integer: ");
    scanf("%d", &n);
    if (n < 0) {
        printf("Invalid input\\n");
        return 1;
    }
    printf("Factorial of %d = %ld\\n", n, factorial(n));
    return 0;
}`,
    stdin: '5',
    expectedOutput: 'Enter a non-negative integer: Factorial of 5 = 120',
  },
  {
    problem: 'Implement a function to reverse an array in-place.',
    solution: `#include <stdio.h>

void reverse_array(int arr[], int n) {
    int i, temp;
    for (i = 0; i < n / 2; i++) {
        temp = arr[i];
        arr[i] = arr[n - 1 - i];
        arr[n - 1 - i] = temp;
    }
}

int main() {
    int arr[100], n, i;
    printf("Enter number of elements: ");
    scanf("%d", &n);
    printf("Enter elements: ");
    for (i = 0; i < n; i++) scanf("%d", &arr[i]);
    reverse_array(arr, n);
    printf("Reversed array: ");
    for (i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,
    stdin: '4 1 2 3 4',
    expectedOutput: 'Enter number of elements: Enter elements: Reversed array: 4 3 2 1',
  },
  {
    problem: 'Print a full pyramid pattern of stars with height H = 4.',
    solution: `#include <stdio.h>

int main() {
    int H = 4, i, j;
    for (i = 1; i <= H; i++) {
        for (j = 1; j <= H - i; j++) printf(" ");
        for (j = 1; j <= 2 * i - 1; j++) printf("*");
        printf("\\n");
    }
    return 0;
}`,
    stdin: '',
    expectedOutput: '   *\n  ***\n *****\n*******',
  },
  {
    problem: 'Print a full pyramid pattern of stars with height H = 6.',
    solution: `#include <stdio.h>

int main() {
    int H = 6, i, j;
    for (i = 1; i <= H; i++) {
        for (j = 1; j <= H - i; j++) printf(" ");
        for (j = 1; j <= 2 * i - 1; j++) printf("*");
        printf("\\n");
    }
    return 0;
}`,
    stdin: '',
    expectedOutput: '     *\n    ***\n   *****\n  *******\n *********\n***********',
  },
  {
    problem: 'Print a full pyramid pattern of stars with height H = 7.',
    solution: `#include <stdio.h>

int main() {
    int H = 7, i, j;
    for (i = 1; i <= H; i++) {
        for (j = 1; j <= H - i; j++) printf(" ");
        for (j = 1; j <= 2 * i - 1; j++) printf("*");
        printf("\\n");
    }
    return 0;
}`,
    stdin: '',
    expectedOutput: '      *\n     ***\n    *****\n   *******\n  *********\n ***********\n*************',
  },
  {
    problem: 'Print a full pyramid pattern of stars with height H = 5.',
    solution: `#include <stdio.h>

int main() {
    int H = 5, i, j;
    for (i = 1; i <= H; i++) {
        for (j = 1; j <= H - i; j++) printf(" ");
        for (j = 1; j <= 2 * i - 1; j++) printf("*");
        printf("\\n");
    }
    return 0;
}`,
    stdin: '',
    expectedOutput: '    *\n   ***\n  *****\n *******\n*********',
  },
  {
    problem: 'Count the number of vowels and consonants in a given string.',
    solution: `#include <stdio.h>
#include <ctype.h>

int main() {
    char s[100];
    int vowels = 0, consonants = 0, i;
    printf("Enter a string: ");
    fgets(s, 100, stdin);
    for (i = 0; s[i]; i++) {
        char c = tolower(s[i]);
        if (c >= 'a' && c <= 'z') {
            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
                vowels++;
            else
                consonants++;
        }
    }
    printf("Vowels: %d, Consonants: %d\\n", vowels, consonants);
    return 0;
}`,
    stdin: 'hello',
    expectedOutput: 'Enter a string: Vowels: 2, Consonants: 3',
  },
  {
    problem: 'Write a function that checks if a number is prime and uses it to display all prime numbers up to 100.',
    solution: `#include <stdio.h>

int is_prime(int n) {
    int i;
    if (n < 2) return 0;
    for (i = 2; i * i <= n; i++)
        if (n % i == 0) return 0;
    return 1;
}

int main() {
    int i;
    printf("Primes up to 100: ");
    for (i = 2; i <= 100; i++)
        if (is_prime(i)) printf("%d ", i);
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: 'Primes up to 100: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97',
  },
  {
    problem: 'Write a function that calculates the sum of diagonal elements of a 2D array (matrix).',
    solution: `#include <stdio.h>

int diagonal_sum(int mat[][10], int n) {
    int i, sum = 0;
    for (i = 0; i < n; i++)
        sum += mat[i][i];
    return sum;
}

int main() {
    int mat[10][10], n, i, j;
    printf("Enter matrix size: ");
    scanf("%d", &n);
    printf("Enter matrix elements: ");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &mat[i][j]);
    printf("Sum of diagonal: %d\\n", diagonal_sum(mat, n));
    return 0;
}`,
    stdin: '3 1 2 3 4 5 6 7 8 9',
    expectedOutput: 'Enter matrix size: Enter matrix elements: Sum of diagonal: 15',
  },
  {
    problem: 'Write a C program to swap the values of two integers using a temporary variable.',
    solution: `#include <stdio.h>

int main() {
    int a, b, temp;
    printf("Enter two integers: ");
    scanf("%d %d", &a, &b);
    temp = a;
    a = b;
    b = temp;
    printf("After swap: a = %d, b = %d\\n", a, b);
    return 0;
}`,
    stdin: '10 20',
    expectedOutput: 'Enter two integers: After swap: a = 20, b = 10',
  },
  {
    problem: 'Write a C program that takes an integer input and checks whether it is even or odd using the modulo operator.',
    solution: `#include <stdio.h>

int main() {
    int n;
    printf("Enter an integer: ");
    scanf("%d", &n);
    if (n % 2 == 0)
        printf("%d is even\\n", n);
    else
        printf("%d is odd\\n", n);
    return 0;
}`,
    stdin: '7',
    expectedOutput: 'Enter an integer: 7 is odd',
  },
  {
    problem: 'Write a C program to convert temperature from Fahrenheit to Celsius.',
    solution: `#include <stdio.h>

int main() {
    float f, c;
    printf("Enter temperature in Fahrenheit: ");
    scanf("%f", &f);
    c = (f - 32) * 5 / 9;
    printf("%.2f Fahrenheit = %.2f Celsius\\n", f, c);
    return 0;
}`,
    stdin: '212',
    expectedOutput: 'Enter temperature in Fahrenheit: 212.00 Fahrenheit = 100.00 Celsius',
  },
  {
    problem: 'Write a C program that converts a lowercase alphabet character to uppercase and explain the process.',
    solution: `#include <stdio.h>

int main() {
    char c;
    printf("Enter a lowercase letter: ");
    scanf(" %c", &c);
    if (c >= 'a' && c <= 'z')
        c = c - 32;
    printf("Uppercase: %c\\n", c);
    return 0;
}`,
    stdin: 'a',
    expectedOutput: 'Enter a lowercase letter: Uppercase: A',
  },
  {
    problem: 'Write a function to check if a number is prime and use it to print all prime numbers up to 100. (5 points)',
    solution: `#include <stdio.h>

int is_prime(int n) {
    int i;
    if (n < 2) return 0;
    for (i = 2; i * i <= n; i++)
        if (n % i == 0) return 0;
    return 1;
}

int main() {
    int i;
    printf("Primes up to 100: ");
    for (i = 2; i <= 100; i++)
        if (is_prime(i)) printf("%d ", i);
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: 'Primes up to 100: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97',
  },
  {
    problem: 'Write a function that takes a 2D array (matrix) and returns the sum of its main diagonal elements. (5 points)',
    solution: `#include <stdio.h>

int diagonal_sum(int mat[][10], int n) {
    int i, sum = 0;
    for (i = 0; i < n; i++)
        sum += mat[i][i];
    return sum;
}

int main() {
    int mat[10][10], n, i, j;
    printf("Enter matrix size: ");
    scanf("%d", &n);
    printf("Enter matrix elements: ");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &mat[i][j]);
    printf("Sum of diagonal: %d\\n", diagonal_sum(mat, n));
    return 0;
}`,
    stdin: '3 1 2 3 4 5 6 7 8 9',
    expectedOutput: 'Enter matrix size: Enter matrix elements: Sum of diagonal: 15',
  },
  {
    problem: 'Write a C program to swap the values of two integer variables using a third temporary variable. (5 points)',
    solution: `#include <stdio.h>

int main() {
    int a, b, temp;
    printf("Enter two integers: ");
    scanf("%d %d", &a, &b);
    temp = a;
    a = b;
    b = temp;
    printf("After swap: a = %d, b = %d\\n", a, b);
    return 0;
}`,
    stdin: '10 20',
    expectedOutput: 'Enter two integers: After swap: a = 20, b = 10',
  },
  {
    problem: 'Write a C program that takes an integer from the user and checks whether the number is even or odd using the modulo operator. (5 points)',
    solution: `#include <stdio.h>

int main() {
    int n;
    printf("Enter an integer: ");
    scanf("%d", &n);
    if (n % 2 == 0)
        printf("%d is even\\n", n);
    else
        printf("%d is odd\\n", n);
    return 0;
}`,
    stdin: '7',
    expectedOutput: 'Enter an integer: 7 is odd',
  },
  {
    problem: 'Write a C program to convert a temperature from Fahrenheit to Celsius using the formula C = (F − 32) × 5 / 9. (5 points)',
    solution: `#include <stdio.h>

int main() {
    float f, c;
    printf("Enter temperature in Fahrenheit: ");
    scanf("%f", &f);
    c = (f - 32) * 5 / 9;
    printf("%.2f Fahrenheit = %.2f Celsius\\n", f, c);
    return 0;
}`,
    stdin: '212',
    expectedOutput: 'Enter temperature in Fahrenheit: 212.00 Fahrenheit = 100.00 Celsius',
  },
  {
    problem: 'Write a C program that reads a lowercase letter from the user and converts it to uppercase.Explain the logic used.',
    solution: `#include <stdio.h>

int main() {
    char c;
    printf("Enter a lowercase letter: ");
    scanf(" %c", &c);
    if (c >= 'a' && c <= 'z')
        c = c - 32;
    printf("Uppercase: %c\\n", c);
    return 0;
}`,
    stdin: 'a',
    expectedOutput: 'Enter a lowercase letter: Uppercase: A',
  },
  {
    problem: 'Write a function to check whether a number is prime and print all prime numbers up to 100 using that function.',
    solution: `#include <stdio.h>

int is_prime(int n) {
    int i;
    if (n < 2) return 0;
    for (i = 2; i * i <= n; i++)
        if (n % i == 0) return 0;
    return 1;
}

int main() {
    int i;
    printf("Primes up to 100: ");
    for (i = 2; i <= 100; i++)
        if (is_prime(i)) printf("%d ", i);
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: 'Primes up to 100: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97',
  },
  {
    problem: 'Write a function that receives a 2D array and returns the sum of the elements on its main diagonal.',
    solution: `#include <stdio.h>

int diagonal_sum(int mat[][10], int n) {
    int i, sum = 0;
    for (i = 0; i < n; i++)
        sum += mat[i][i];
    return sum;
}

int main() {
    int mat[10][10], n, i, j;
    printf("Enter matrix size: ");
    scanf("%d", &n);
    printf("Enter matrix elements: ");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &mat[i][j]);
    printf("Sum of diagonal: %d\\n", diagonal_sum(mat, n));
    return 0;
}`,
    stdin: '3 1 2 3 4 5 6 7 8 9',
    expectedOutput: 'Enter matrix size: Enter matrix elements: Sum of diagonal: 15',
  },
  {
    problem: 'Write a C program that swaps two integer values using a third variable.',
    solution: `#include <stdio.h>

int main() {
    int a, b, temp;
    printf("Enter two integers: ");
    scanf("%d %d", &a, &b);
    temp = a;
    a = b;
    b = temp;
    printf("After swap: a = %d, b = %d\\n", a, b);
    return 0;
}`,
    stdin: '10 20',
    expectedOutput: 'Enter two integers: After swap: a = 20, b = 10',
  },
  {
    problem: 'Write a C program that accepts an integer and checks if it is even or odd.',
    solution: `#include <stdio.h>

int main() {
    int n;
    printf("Enter an integer: ");
    scanf("%d", &n);
    if (n % 2 == 0)
        printf("%d is even\\n", n);
    else
        printf("%d is odd\\n", n);
    return 0;
}`,
  },
  {
    problem: 'Write a C program to convert a given temperature from Fahrenheit to Celsius using the correct formula.',
    solution: `#include <stdio.h>

int main() {
    float f, c;
    printf("Enter temperature in Fahrenheit: ");
    scanf("%f", &f);
    c = (f - 32) * 5 / 9;
    printf("%.2f Fahrenheit = %.2f Celsius\\n", f, c);
    return 0;
}`,
    stdin: '212',
    expectedOutput: 'Enter temperature in Fahrenheit: 212.00 Fahrenheit = 100.00 Celsius',
  },
  {
    problem: 'Write a C program that reads a lowercase letter and converts it to uppercase. Explain your answer.',
    solution: `#include <stdio.h>

int main() {
    char c;
    printf("Enter a lowercase letter: ");
    scanf(" %c", &c);
    if (c >= 'a' && c <= 'z')
        c = c - 32;
    printf("Uppercase: %c\\n", c);
    return 0;
}`,
  },
  {
    problem: 'Write a function that determines whether a given number is prime and displays all prime numbers between 1 and 100.',
    solution: `#include <stdio.h>

int is_prime(int n) {
    int i;
    if (n < 2) return 0;
    for (i = 2; i * i <= n; i++)
        if (n % i == 0) return 0;
    return 1;
}

int main() {
    int i;
    printf("Primes up to 100: ");
    for (i = 2; i <= 100; i++)
        if (is_prime(i)) printf("%d ", i);
    printf("\\n");
    return 0;
}`,
    stdin: '',
    expectedOutput: 'Primes up to 100: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97',
  },
  {
    problem: 'Write a function that accepts a square matrix and calculates the sum of its diagonal elements.',
    solution: `#include <stdio.h>

int diagonal_sum(int mat[][10], int n) {
    int i, sum = 0;
    for (i = 0; i < n; i++)
        sum += mat[i][i];
    return sum;
}

int main() {
    int mat[10][10], n, i, j;
    printf("Enter matrix size: ");
    scanf("%d", &n);
    printf("Enter matrix elements: ");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &mat[i][j]);
    printf("Sum of diagonal: %d\\n", diagonal_sum(mat, n));
    return 0;
}`,
    stdin: '3 1 2 3 4 5 6 7 8 9',
    expectedOutput: 'Enter matrix size: Enter matrix elements: Sum of diagonal: 15',
  },
  {
    problem: 'Write a C program to interchange the values of two integers using a temporary variable.',
    solution: `#include <stdio.h>

int main() {
    int a, b, temp;
    printf("Enter two integers: ");
    scanf("%d %d", &a, &b);
    temp = a;
    a = b;
    b = temp;
    printf("After swap: a = %d, b = %d\\n", a, b);
    return 0;
}`,
    stdin: '10 20',
    expectedOutput: 'Enter two integers: After swap: a = 20, b = 10',
  },
  {
    problem: 'Write a C program that reads an integer and determines whether it is even or odd using the modulo operator.',
    solution: `#include <stdio.h>

int main() {
    int n;
    printf("Enter an integer: ");
    scanf("%d", &n);
    if (n % 2 == 0)
        printf("%d is even\\n", n);
    else
        printf("%d is odd\\n", n);
    return 0;
}`,
  },
  {
    problem: 'Write a C program to convert Fahrenheit temperature into Celsius. (5 points)',
    solution: `#include <stdio.h>

int main() {
    float f, c;
    printf("Enter temperature in Fahrenheit: ");
    scanf("%f", &f);
    c = (f - 32) * 5 / 9;
    printf("%.2f Fahrenheit = %.2f Celsius\\n", f, c);
    return 0;
}`,
    stdin: '212',
    expectedOutput: 'Enter temperature in Fahrenheit: 212.00 Fahrenheit = 100.00 Celsius',
  },
  {
    problem: 'Write a C program that converts a lowercase character to uppercase and explain how it works.',
    solution: `#include <stdio.h>

int main() {
    char c;
    printf("Enter a lowercase letter: ");
    scanf(" %c", &c);
    if (c >= 'a' && c <= 'z')
        c = c - 32;
    printf("Uppercase: %c\\n", c);
    return 0;
}`,
    stdin: 'a',
    expectedOutput: 'Enter a lowercase letter: Uppercase: A',
  },
]
