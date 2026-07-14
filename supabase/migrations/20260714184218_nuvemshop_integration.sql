-- Store the Nuvemshop OAuth connection (one store per shop, keeps the current access token)
CREATE TABLE public.nuvemshop_integration (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id text NOT NULL UNIQUE,
    access_token text NOT NULL,
    scope text,
    connected_by uuid REFERENCES auth.users(id),
    connected_at timestamp with time zone NOT NULL DEFAULT now(),
    last_synced_at timestamp with time zone,
    last_sync_status text,
    last_sync_error text,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.nuvemshop_integration ENABLE ROW LEVEL SECURITY;

-- Access tokens are sensitive: only admins may read or manage this table.
-- Edge functions use the service role key and bypass RLS entirely.
CREATE POLICY "Admins can view nuvemshop integration"
ON public.nuvemshop_integration FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage nuvemshop integration"
ON public.nuvemshop_integration FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_nuvemshop_integration_updated_at
BEFORE UPDATE ON public.nuvemshop_integration
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Link local products/stock rows back to their Nuvemshop source so re-syncs upsert instead of duplicating
ALTER TABLE public.products ADD COLUMN nuvemshop_product_id bigint UNIQUE;
ALTER TABLE public.product_stock ADD COLUMN nuvemshop_variant_id bigint UNIQUE;
