-- Allow authenticated users to insert their own admin role (only for initial setup)
-- In production, you might want to remove this after initial setup
CREATE POLICY "Users can insert their own role during signup" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);