import test from "node:test";
import assert from 'node:assert/strict';


import {calculateGradeAverage} from "../src/modules/assessments/grades.service.js";

test("calculates weighted average", () => {
  const result = calculateGradeAverage([{grade: 7,weight: 2},{grade: 8,weight: 3},{grade: 9,weight: 1}]);

  assert.equal(result, 7.83);
});

test("ignores assessments without grades", () => {
  const result = calculateGradeAverage([
    {
      grade: 8,
      weight: 2
    },
    {
      grade: null,
      weight: 3
    }
  ]);

  assert.equal(result, 8);
});

test("returns null when there are no grades", () => {
  const result = calculateGradeAverage([
    {
      grade: null,
      weight: 2
    }
  ]);

  assert.equal(result, null);
});

test("accepts a valid zero grade", () => {
  const result = calculateGradeAverage([
    {
      grade: 0,
      weight: 1
    }
  ]);

  assert.equal(result, 0);
});

test("rejects invalid weights", () => {
  assert.throws(() => {
    calculateGradeAverage([
      {
        grade: 8,
        weight: 0
      }
    ]);
  });
});
test("returns null for an empty assessment list", () => {
  const result = calculateGradeAverage([]);

  assert.equal(result, null);
});
test("calculates average with equal weights", () => {
  const result = calculateGradeAverage([
    { grade: 6, weight: 3 },
    { grade: 8, weight: 3 }
  ]);

  assert.equal(result, 7);
});
test("accepts maximum grade", () => {
  const result = calculateGradeAverage([
    { grade: 10, weight: 1 },
    { grade: 10, weight: 10 }
  ]);

  assert.equal(result, 10);
});
test("rejects negative grades", () => {
  assert.throws(
    () => calculateGradeAverage([
      { grade: -1, weight: 2 }
    ]),
    /invalid assessment values/
  );
});
test("rejects grades greater than ten", () => {
  assert.throws(
    () => calculateGradeAverage([
      { grade: 10.5, weight: 2 }
    ]),
    /invalid assessment values/
  );
});
test("rejects non-integer weights", () => {
  assert.throws(
    () => calculateGradeAverage([
      { grade: 8, weight: 1.5 }
    ]),
    /invalid assessment values/
  );
});
test("calculates average with five different weights", () => {
  const result = calculateGradeAverage([
    { grade: 6, weight: 1 },
    { grade: 7, weight: 2 },
    { grade: 8, weight: 3 },
    { grade: 9, weight: 4 },
    { grade: 10, weight: 5 }
  ]);

  assert.equal(result, 8.67);
});