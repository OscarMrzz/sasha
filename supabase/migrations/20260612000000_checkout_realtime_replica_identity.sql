-- Realtime Broadcast/Presence requiere políticas en realtime.messages (Supabase 2024+).
-- Sin esto, los mensajes broadcast se pierden silenciosamente.

ALTER TABLE public.checkout REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime'
      AND tablename = 'messages'
      AND policyname = 'checkout_sync_authenticated_receive'
  ) THEN
    CREATE POLICY "checkout_sync_authenticated_receive"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime'
      AND tablename = 'messages'
      AND policyname = 'checkout_sync_authenticated_send'
  ) THEN
    CREATE POLICY "checkout_sync_authenticated_send"
      ON realtime.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
