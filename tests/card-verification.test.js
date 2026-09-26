import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewedCardMatches } from '../lib/_card-verification.js';
const card = { citizenId: '1234567890123', fullName: 'Test Member', birthDate: '1982-11-18' };
const matches = (body, id = card.citizenId, name = card.fullName, birth = card.birthDate) => reviewedCardMatches(body, id, name, birth);
test('only a reviewed card matching the saved identity qualifies', () => {
  assert.equal(matches({ cardReviewed: true, cardEvidence: card }), true);
  assert.equal(matches({ cardReviewed: false, cardEvidence: card }), false);
  assert.equal(matches({ cardReviewed: true }), false);
  assert.equal(matches({ cardReviewed: true, cardEvidence: card }, '1234567890129'), false);
  assert.equal(matches({ cardReviewed: true, cardEvidence: card }, card.citizenId, 'Other Person'), false);
  assert.equal(matches({ cardReviewed: true, cardEvidence: card }, card.citizenId, card.fullName, '1980-01-01'), false);
  assert.equal(matches({}), false);
});
