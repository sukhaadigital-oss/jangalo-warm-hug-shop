-- Fix the overly permissive INSERT policy on stock_alert_logs
-- Only allow inserts via service role (edge functions) or admins
DROP POLICY "System can insert alert logs" ON public.stock_alert_logs;

CREATE POLICY "Admins can insert alert logs"
ON public.stock_alert_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));