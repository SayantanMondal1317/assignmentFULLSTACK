// reportCard.js

// ==========================================
// P1: Student class [MEDIUM]
// ==========================================
class Student {
  // P1a: Constructor
  constructor(name, scores) {
    this.name = name;
    this.scores = scores;
  }

  // P1b: get average (using a standard loop instead of reduce)
  getAverage() {
    let sum = 0;
    for (let i = 0; i < this.scores.length; i++) {
      sum += this.scores[i];
    }
    const average = sum / this.scores.length;
    return average.toFixed(1); // Returns 1 decimal place
  }

  // P1c: get letterGrade
  // Grading Scale Documentation:
  // A: 90 and above
  // B: 80 to 89.9
  // C: 70 to 79.9
  // D: 60 to 69.9
  // F: Below 60
  getGrade() {
    const avg = parseFloat(this.getAverage());
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B';
    if (avg >= 70) return 'C';
    if (avg >= 60) return 'D';
    return 'F';
  }

  // P1d: summary() - Finds highest and lowest using a loop (No Math.max/min)
  summary() {
    let highest = this.scores[0];
    let lowest = this.scores[0];

    for (let i = 1; i < this.scores.length; i++) {
      if (this.scores[i] > highest) {
        highest = this.scores[i];
      }
      if (this.scores[i] < lowest) {
        lowest = this.scores[i];
      }
    }
    
    return { highest, lowest }; // Returns as an object
  }
}

// ==========================================
// P3b: Switch-based getRemark function
// ==========================================
function getRemark(grade) {
  switch (grade) {
    case 'A': return 'Outstanding performance!';
    case 'B': return 'Great job, keep it up!';
    case 'C': return 'Solid effort, but room to grow.';
    case 'D': return 'Needs significant improvement.';
    case 'F': return 'Failing. Tutoring recommended.';
    default: return 'No remark available.';
  }
}

// ==========================================
// P2: CLI input [MEDIUM]
// ==========================================

// P2a: Parse argv (slicing from index 2)
const args = process.argv.slice(2);

// P2b: Validate (Less than 3 scores -> error + process.exit)
// Note: 1 name + 3 scores means args length must be at least 4
if (args.length < 4) {
  console.error("❌ Error: Invalid input. You must provide a name and at least 3 scores.");
  process.exit(1); 
}

const studentName = args[0];
const examScores = [];

// Convert score arguments to numbers
for (let i = 1; i < args.length; i++) {
  examScores.push(Number(args[i]));
}

// Ensure no invalid text was passed as a score
if (examScores.some(isNaN)) {
  console.error("❌ Error: All scores must be valid numbers.");
  process.exit(1);
}

// ==========================================
// P3: Formatted output [MEDIUM-HARD]
// ==========================================

// Instantiate the class
const student = new Student(studentName, examScores);

// Process the data
const avgScore = parseFloat(student.getAverage());
const grade = student.getGrade();
const { highest, lowest } = student.summary(); // Destructuring the returned object

// P3b: Ternary for PASS/FAIL (≥60)
const passFailStatus = avgScore >= 60 ? 'PASS' : 'FAIL';
const remark = getRemark(grade);

// P3c: Score breakdown (Destructuring using rest syntax)
const [score1, score2, ...remaining] = student.scores;

// P3a: Report card (Template literals only, no + string concatenation)
const output = `
=========================================
          STUDENT REPORT CARD            
=========================================
 Name         : ${student.name}
 Status       : ${passFailStatus}
 Remark       : ${remark}
-----------------------------------------
 Score Breakdown:
   - Score 1  : ${score1}
   - Score 2  : ${score2}
   - Others   : ${remaining.join(', ')}
-----------------------------------------
 High Score   : ${highest}
 Low Score    : ${lowest}
 Final Average: ${student.getAverage()}
 Letter Grade : ${grade}
=========================================
`;

console.log(output);