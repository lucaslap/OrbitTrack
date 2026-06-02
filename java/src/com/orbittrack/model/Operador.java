package com.orbittrack.model;

public class Operador {

    private int id_operador;
    private String nome;
    private char nivel_acesso;
    private String estacao;

    public Operador(int id_operador, String nome, char nivel_acesso, String estacao) {
        this.id_operador = id_operador;
        this.nome = nome;
        this.nivel_acesso = nivel_acesso;
        this.estacao = estacao;
    }

    public int getId_operador() {
        return id_operador;
    }

    public void setId_operador(int id_operador) {
        this.id_operador = id_operador;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public char getNivel_acesso() {
        return nivel_acesso;
    }

    public void setNivel_acesso(char nivel_acesso) {
        this.nivel_acesso = nivel_acesso;
    }

    public String getEstacao() {
        return estacao;
    }

    public void setEstacao(String estacao) {
        this.estacao = estacao;
    }
}
