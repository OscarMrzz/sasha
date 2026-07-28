"use client";

import EventosCrud from "@/components/eventos/EventosCrud";

export default function SecretariaEventosGestor() {
  return <EventosCrud queryKey={["secretaria", "eventos"]} />;
}
