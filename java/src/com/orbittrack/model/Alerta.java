package com.orbittrack.model;

import java.time.LocalDate;

public class Alerta {

    private int id_alerta;
    private int id_objeto_primario;
    private int id_objeto_secundario;
    private int id_operador;
    private double probabilidade;
    private int janela_conjuncao;
    private String severidade;
    private String situacao;

    public Alerta(int id_alerta, int id_objeto_primario, int id_objeto_secundario, int id_operador, double probabilidade, int janela_conjuncao, String severidade, String situacao) {
        this.id_alerta = id_alerta;
        this.id_objeto_primario = id_objeto_primario;
        this.id_objeto_secundario = id_objeto_secundario;
        this.id_operador = id_operador;
        this.probabilidade = probabilidade;
        this.janela_conjuncao = janela_conjuncao;
        this.severidade = severidade;
        this.situacao = situacao;
    }

    public int getId_alerta() {
        return id_alerta;
    }

    public void setId_alerta(int id_alerta) {
        this.id_alerta = id_alerta;
    }

    public int getId_objeto_primario() {
        return id_objeto_primario;
    }

    public void setId_objeto_primario(int id_objeto_primario) {
        this.id_objeto_primario = id_objeto_primario;
    }

    public int getId_objeto_secundario() {
        return id_objeto_secundario;
    }

    public void setId_objeto_secundario(int id_objeto_secundario) {
        this.id_objeto_secundario = id_objeto_secundario;
    }

    public int getId_operador() {
        return id_operador;
    }

    public void setId_operador(int id_operador) {
        this.id_operador = id_operador;
    }

    public double getProbabilidade() {
        return probabilidade;
    }

    public void setProbabilidade(double probabilidade) {
        this.probabilidade = probabilidade;
    }

    public int getJanela_conjuncao() {
        return janela_conjuncao;
    }

    public void setJanela_conjuncao(int janela_conjuncao) {
        this.janela_conjuncao = janela_conjuncao;
    }

    public String getSeveridade() {
        return severidade;
    }

    public void setSeveridade(String severidade) {
        this.severidade = severidade;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }
}
