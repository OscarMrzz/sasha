"use client";

import { useEffect, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { dataBaseSupabase } from "@/lib/supabase";

type UseCheckoutRealtimeOptions = {
  queryClient: QueryClient;
  idBanda?: string;
  idEvento?: string;
  onCheckoutChange?: () => void;
};

function refetchCheckoutQueries(
  queryClient: QueryClient,
  idBanda?: string,
  idEvento?: string,
) {
  if (idBanda) {
    void queryClient.refetchQueries({
      queryKey: ["checkout-notif-llegada", idBanda],
    });
    void queryClient.refetchQueries({
      queryKey: ["checkout-notif-ingreso", idBanda],
    });
  }

  if (idEvento) {
    void queryClient.refetchQueries({
      queryKey: ["checkout-evento", idEvento],
    });
    void queryClient.refetchQueries({
      queryKey: ["checkout-historial", idEvento],
    });
    void queryClient.refetchQueries({
      queryKey: ["checkout-entrada", idEvento],
    });
    void queryClient.refetchQueries({
      queryKey: ["checkout-consulta", "filas", idEvento],
    });
  }
}

export function useCheckoutRealtime({
  queryClient,
  idBanda,
  idEvento,
  onCheckoutChange,
}: UseCheckoutRealtimeOptions) {
  const onChangeRef = useRef(onCheckoutChange);
  onChangeRef.current = onCheckoutChange;

  useEffect(() => {
    if (!idBanda && !idEvento) return;

    let removed = false;
    let channel: RealtimeChannel | null = null;

    const handleChange = () => {
      refetchCheckoutQueries(queryClient, idBanda, idEvento);
      onChangeRef.current?.();
    };

    void dataBaseSupabase.auth.getSession().then(({ data: { session } }) => {
      if (removed) return;
      if (session?.access_token) {
        dataBaseSupabase.realtime.setAuth(session.access_token);
      }

      channel = dataBaseSupabase
        .channel(`checkout-rt-${idBanda ?? "all"}-${idEvento ?? "all"}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "checkout" },
          handleChange,
        )
        .subscribe();
    });

    const {
      data: { subscription },
    } = dataBaseSupabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        dataBaseSupabase.realtime.setAuth(session.access_token);
      }
    });

    return () => {
      removed = true;
      subscription.unsubscribe();
      if (channel) void dataBaseSupabase.removeChannel(channel);
    };
  }, [idBanda, idEvento, queryClient]);
}
