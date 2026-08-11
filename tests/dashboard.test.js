import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Dashboard static entry point references the required assets', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  assert.match(html, /styles\.css/);
  assert.match(html, /script\.js/);
  assert.match(html, /DataTrack/);
});

test('Dashboard analytics feed contains the expected shape', () => {
  const payload = JSON.parse(fs.readFileSync('data/mockData.json', 'utf8'));

  assert.ok(payload.kpis);
  assert.ok(Array.isArray(payload.kpis));
  assert.ok(payload.channels);
  assert.ok(Array.isArray(payload.channels));
  assert.ok(payload.activity);
  assert.ok(Array.isArray(payload.activity));
});

test('Dashboard payload exposes a standard API protocol ingest layer', () => {
  const payload = JSON.parse(fs.readFileSync('data/mockData.json', 'utf8'));

  assert.ok(payload.ingest);
  assert.ok(Array.isArray(payload.ingest.protocols));

  const protocolNames = payload.ingest.protocols.map((entry) => entry.name);
  assert.ok(protocolNames.includes('REST'));
  assert.ok(protocolNames.includes('GraphQL'));
  assert.ok(protocolNames.includes('SOAP'));
  assert.ok(protocolNames.includes('Webhook'));

  assert.ok(payload.ingest.lastSync);
  assert.ok(payload.ingest.totalSources >= payload.ingest.protocols.length);
});
