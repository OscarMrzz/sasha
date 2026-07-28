
select copas.id_copas,copas.id_foranea_evento, "registroEventos"."LugarEvento", "registroEventos".tipo_evento, "registroEventos"."idForaneaRegion", bandas."nombreBanda",bandas."idForaneaCategoria", copas.lugar,copas.tipo from copas
join "registroEventos"
on "registroEventos"."idEvento"= copas.id_foranea_evento
join bandas
on bandas."idBanda"= copas.id_foranea_banda

  WHERE (
            ("registroEventos".tipo_evento = 'regional' AND "registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")
            OR "registroEventos".tipo_evento = 'nacional'
          )
      AND EXTRACT(YEAR FROM "registroEventos"."fechaEvento") = EXTRACT(YEAR FROM CURRENT_DATE)