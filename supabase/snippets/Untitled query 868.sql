ALTER TABLE public.checkout REPLICA IDENTITY FULL;

CREATE POLICY "checkout_sync_authenticated_receive"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "checkout_sync_authenticated_send"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);