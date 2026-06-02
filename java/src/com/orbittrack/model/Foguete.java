package com.orbittrack.model;

/**
 * Subclasse concreta de ObjetoOrbital.
 * Representa um foguete ou estágio de foguete em órbita.
 * Prefixo de id "ROC" (rocket).
 */
public class Foguete extends ObjetoOrbital {

    public Foguete(String id, String nome, double altitude,
                   double inclinacao, String status, String risco) {
        super(id, nome, altitude, inclinacao, status, risco);
    }

    @Override
    public String getTipo() {
        return "Foguete";
    }

    @Override
    public String getPrefixoId() {
        return "ROC";
    }
}
