package com.orbittrack.model;

/**
 * Subclasse concreta de ObjetoOrbital.
 * Representa um satélite ativo ou inativo em órbita.
 * Define o tipo legível e o prefixo de id ("SAT") que o
 * serviço usa para gerar identificadores como "SAT-001".
 */
public class Satelite extends ObjetoOrbital {

    public Satelite(String id, String nome, double altitude,
                    double inclinacao, String status, String risco) {
        super(id, nome, altitude, inclinacao, status, risco);
    }

    @Override
    public String getTipo() {
        return "Satélite";
    }

    @Override
    public String getPrefixoId() {
        return "SAT";
    }
}
