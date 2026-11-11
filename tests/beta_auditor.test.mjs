import test from 'node:test';
import assert from 'node:assert/strict';
import { BetaAuditor } from '../src/beta_auditor.mjs';

test('BetaAuditor.getBugReports - returns 5 high-quality actionable reports', () => {
  const bugs = BetaAuditor.getBugReports();
  assert.equal(bugs.length, 5);

  for (const b of bugs) {
    assert.ok(b.id.startsWith('SSR-BUG-'));
    assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(b.severity));
    assert.ok(b.title.length > 10);
    assert.ok(b.reproductionSteps.length >= 3);
    assert.ok(b.suggestedFix.length > 20);
    assert.ok(b.codeSnippet.length > 10);
  }
});

test('BetaAuditor.getActionableFeedback - returns product recommendations', () => {
  const feedback = BetaAuditor.getActionableFeedback();
  assert.ok(feedback.length >= 4);

  for (const f of feedback) {
    assert.ok(f.title.length > 5);
    assert.ok(f.suggestion.length > 20);
  }
});

test('BetaAuditor.formatFeedbackSubmission - formats valid markdown payload', () => {
  const wallet = '32647Bri8KhJQE11x26iF7fpae9nouCJSZ8Y2VPpq5yM';
  const handle = '@LBCron';
  const formatted = BetaAuditor.formatFeedbackSubmission(wallet, handle);

  assert.ok(formatted.includes('SSR.FUN Beta Feedback & Technical Security Audit'));
  assert.ok(formatted.includes(wallet));
  assert.ok(formatted.includes(handle));
  assert.ok(formatted.includes('SSR-BUG-01'));
  assert.ok(formatted.includes('SSR-BUG-05'));
});
