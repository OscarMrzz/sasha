"use client";

import type { ResultadosEventoReporteProps } from "@/components/miBanda/ResultadosEventoReporteTipos";
import React from "react";

/** Maquetación tipo “hoja” para exportar a PDF (html2pdf). No usar como vista principal. */
export const ResultadosEventoReportePdf = React.forwardRef<
  HTMLDivElement,
  ResultadosEventoReporteProps
>(function ResultadosEventoReportePdf(
  {
    perfil,
    evento,
    banda,
    categoria,
    totalGeneral,
    rubricasList,
    puntosRubricas,
    resultados,
    comentariosList,
  },
  ref
) {
  const fed = perfil.federaciones?.nombreFederacion ?? "";
  return (
    <div ref={ref} className="conten-page">
      <section className="  page ">
        <div className="page-header">
          <div className="page-header__left">{fed}</div>
          <div className="page-header__center"></div>
          <div className="page-header__right"></div>
        </div>

        <div className="page-content__portada">
          <div className="page-portada__Titulos">
            <h2 className="page-portada__titulo">
              <span>Evento - </span>
              {evento.LugarEvento.toUpperCase()}
            </h2>
            <p className="page-portada__sub-titulo">{evento.fechaEvento}</p>
          </div>
          <div className="page-portada__detalles-banda">
            <h3 className="page-portada__parrafo-detalle">{banda.nombreBanda}</h3>
            <p className="page-portada__parrafo-detalle">{categoria?.nombreCategoria}</p>
            <p className="page-portada__parrafo-detalle">{totalGeneral}%</p>
          </div>
        </div>
        <div className="page-footer">
          <div>
            <div className="page-footer__left">SASHA</div>
            <div className="page-footer__center"></div>
            <div className="page-footer__right"></div>
          </div>
        </div>
      </section>
      <section className=" page">
        <div className="page-header">
          <div className="page-header__left">{fed}</div>
          <div className="page-header__center"></div>
          <div className="page-header__right"></div>
        </div>

        <div className="page-content">
          <h3 className="titulo-rubrica">Resumen</h3>
          <div className="">
            <p className="caja-total__titulo">Total: </p>
            <span className="caja-total__total">{totalGeneral}%</span>
          </div>

          <div className="page_con ">
            {rubricasList.map((rubrica) => (
              <div key={rubrica.idRubrica} className="page-body__resultados_fila  ">
                <p className="resumen-rubrica__nombre">{rubrica.nombreRubrica}</p>
                <span className="resumen-rubrica__puntos">
                  {puntosRubricas[rubrica.idRubrica] ?? 0} /{" "}
                  {rubrica.puntosRubrica < 0 ? 0 : rubrica.puntosRubrica}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="page-footer">
          <div className="page-footer__left">SASHA</div>
          <div className="page-footer__center"></div>
          <div className="page-footer__right">pag-01</div>
        </div>
      </section>

      <section className="">
        {rubricasList.map((rubrica, index) => (
          <div key={rubrica.idRubrica} className="page">
            <div className="page-header">
              <div className="page-header__left">{fed}</div>
              <div className="page-header__center"></div>
              <div className="page-header__right"></div>
            </div>

            <div className="page-content">
              <h3 className="titulo-rubrica">
                {puntosRubricas[rubrica.idRubrica] ?? 0}% - {rubrica.nombreRubrica}
              </h3>
              <div>
                {resultados.map((resultado) =>
                  resultado.idForaneaRubrica === rubrica.idRubrica ? (
                    <div
                      key={resultado.idRegistroCumplimientoEvaluacion}
                      className="page-body__criterios"
                    >
                      <span className="page-criterio__puntos">{resultado.puntosObtenidos}</span>
                      <div className="page-criterio__conte">
                        <p className="page-criterio__name">{resultado.nombreCriterio} </p>
                        <p className="page-criterio__detalles">{resultado.detalleCumplimiento}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
            <div className="page-footer">
              <div className="page-footer__left">SASHA</div>
              <div className="page-footer__center"></div>
              <div className="page-footer__right">
                pag-{index + 2 < 10 ? `0${index + 2}` : index + 2}
              </div>
            </div>
          </div>
        ))}
      </section>
      {comentariosList.length > 0 &&
        comentariosList.map((comentario, index) => (
          <section key={comentario.idRegistroComentario} className=" page">
            <div className="page-header">
              <div className="page-header__left">{fed}</div>
              <div className="page-header__center"></div>
              <div className="page-header__right"></div>
            </div>
            <div className="page-content">
              <h2 className="text-2xl font-bold text-gray-600">Comentarios y recomendaciones</h2>
              <h3 className="titulo-rubrica">{comentario.rubricas?.nombreRubrica ?? "—"}</h3>
              <div className="page-comentario__conte">
                <p className="page-comentario__detalle">{comentario.comentario}</p>
              </div>
            </div>
            <div className="page-footer">
              <div className="page-footer__left">SASHA</div>
              <div className="page-footer__center"></div>
              <div className="page-footer__right">
                pag-
                {rubricasList.length + index + 2 < 10
                  ? `0${rubricasList.length + index + 2}`
                  : rubricasList.length + index + 2}
              </div>
            </div>
          </section>
        ))}
    </div>
  );
});
