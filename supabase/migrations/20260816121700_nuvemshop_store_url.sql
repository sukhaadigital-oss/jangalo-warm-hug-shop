-- Store the public storefront URL so the frontend can build "buy on Nuvemshop"
-- deep links, without exposing the sensitive access_token stored on the same row.
ALTER TABLE public.nuvemshop_integration ADD COLUMN store_url text;

CREATE VIEW public.nuvemshop_store_info AS
SELECT store_id, store_url
FROM public.nuvemshop_integration
ORDER BY connected_at DESC
LIMIT 1;

GRANT SELECT ON public.nuvemshop_store_info TO anon, authenticated;
