"use client";

import EventosCrud from "@/component/eventos/EventosCrud";

export default function SecretariaEventosGestor() {
  return <EventosCrud queryKey={["secretaria", "eventos"]} />;
}
