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