-- Seeds the single global watchlist so the demo never opens on an empty table.
-- This is the source of truth: the Home page reads these rows directly rather
-- than falling back to a hardcoded list, which would otherwise let the 10-stock
-- cap be exceeded (the API counts rows, a fallback list has none).
INSERT INTO watchlist (symbol) VALUES
  ('NVDA'), ('AAPL'), ('MSFT'), ('GOOGL'), ('AMZN'),
  ('META'), ('AVGO'), ('TSLA'), ('AMD'), ('PLTR')
ON CONFLICT (symbol) DO NOTHING;
