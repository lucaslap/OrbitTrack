package com.orbittrack.model;

/**
 * Subclasse concreta de ObjetoOrbital.
 * Representa um detrito espacial (lixo orbital): fragmentos,
 * peças de satélites desativados, estágios de foguete quebrados,
 * etc. Prefixo de id "DEB" (debris).
 */
public class Detrito extends ObjetoOrbital {

    public Detrito(String id, String nome, double altitude,
                   double inclinacao, String status, String risco) {
        super(id, nome, altitude, inclinacao, status, risco);
    }

    @Override
    public String getTipo() {
        return "Detrito";
    }

    @Override
    public String getPrefixoId() {
        return "DEB";
    }
}
