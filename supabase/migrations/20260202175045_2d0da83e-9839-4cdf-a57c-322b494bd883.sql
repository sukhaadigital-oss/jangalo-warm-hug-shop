-- Create table for stock by size
CREATE TABLE public.product_stock (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size text NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    min_stock_alert integer NOT NULL DEFAULT 3,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(product_id, size)
);

-- Enable RLS
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Public can read stock
CREATE POLICY "Stock is publicly readable"
ON public.product_stock
FOR SELECT
USING (true);

-- Only admins can manage stock
CREATE POLICY "Admins can insert stock"
ON public.product_stock
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update stock"
ON public.product_stock
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete stock"
ON public.product_stock
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_product_stock_updated_at
BEFORE UPDATE ON public.product_stock
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table to store notification settings
CREATE TABLE public.notification_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    whatsapp_number text,
    whatsapp_api_type text DEFAULT 'z-api', -- 'z-api' or 'evolution'
    whatsapp_instance_id text,
    whatsapp_token text,
    whatsapp_api_url text,
    notify_low_stock boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own settings
CREATE POLICY "Users can view own notification settings"
ON public.notification_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
ON public.notification_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create log table for sent notifications
CREATE TABLE public.stock_alert_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size text NOT NULL,
    quantity_at_alert integer NOT NULL,
    notification_sent_at timestamp with time zone NOT NULL DEFAULT now(),
    notification_type text NOT NULL DEFAULT 'whatsapp'
);

-- Enable RLS
ALTER TABLE public.stock_alert_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view alert logs"
ON public.stock_alert_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert alert logs"
ON public.stock_alert_logs
FOR INSERT
WITH CHECK (true);