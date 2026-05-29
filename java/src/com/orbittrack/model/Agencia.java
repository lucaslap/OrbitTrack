package com.orbittrack.model;

public class Agencia {

    private int id_agencia;
    private String sigla;
    private String nome;
    private String pais;

    public Agencia(int id_agencia, String sigla, String nome, String pais) {
        this.id_agencia = id_agencia;
        this.sigla = sigla;
        this.nome = nome;
        this.pais = pais;
    }

    public int getId_agencia() {
        return id_agencia;
    }

    public void setId_agencia(int id_agencia) {
        this.id_agencia = id_agencia;
    }

    public String getSigla() {
        return sigla;
    }

    public void setSigla(String sigla) {
        this.sigla = sigla;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }
}
