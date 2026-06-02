package com.orbittrack;

import com.orbittrack.model.Detrito;
import com.orbittrack.model.Foguete;
import com.orbittrack.model.ObjetoOrbital;
import com.orbittrack.model.Satelite;
import com.orbittrack.service.CatalogoService;
import com.orbittrack.view.MenuConsole;

/**
 * Ponto de entrada do OrbitTrack (módulo Java).
 *
 * Monta o sistema:
 *   1) cria o serviço (lista em memória);
 *   2) carrega alguns objetos de exemplo para a demonstração
 *      não começar vazia;
 *   3) entrega o serviço para o menu de console e inicia o laço.
 *
 * É a única classe que conhece todas as camadas — model,
 * service e view — porque é o "montador" da aplicação.
 */
public class Main {

    public static void main(String[] args) {
        CatalogoService service = new CatalogoService();
        carregarDadosExemplo(service);

        MenuConsole menu = new MenuConsole(service);
        menu.executar();
    }

    /**
     * Pré-carga de dados. Os nomes e parâmetros são inspirados em
     * objetos reais (Starlink, Iridium, Cosmos, Falcon) só para a
     * demonstração ficar plausível — nenhum dado vem de fora.
     * O id é passado como null e gerado pelo serviço.
     */
    private static void carregarDadosExemplo(CatalogoService service) {
        service.cadastrar(new Satelite(
            null, "Starlink-2891", 550, 53,
            ObjetoOrbital.STATUS_ATIVO, ObjetoOrbital.RISCO_BAIXO));

        service.cadastrar(new Satelite(
            null, "NOAA-19", 870, 99,
            ObjetoOrbital.STATUS_ATIVO, ObjetoOrbital.RISCO_MEDIO));

        service.cadastrar(new Detrito(
            null, "Fragmento Cosmos-2251", 790, 74,
            ObjetoOrbital.STATUS_CRITICO, ObjetoOrbital.RISCO_ALTO));

        service.cadastrar(new Detrito(
            null, "Restos Iridium-33", 790, 86,
            ObjetoOrbital.STATUS_INATIVO, ObjetoOrbital.RISCO_MEDIO));

        service.cadastrar(new Foguete(
            null, "Estágio Falcon-9", 340, 53,
            ObjetoOrbital.STATUS_INATIVO, ObjetoOrbital.RISCO_BAIXO));

        service.cadastrar(new Foguete(
            null, "Estágio Long March 5B", 200, 41,
            ObjetoOrbital.STATUS_CRITICO, ObjetoOrbital.RISCO_CRITICO));
    }
}
