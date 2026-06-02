package com.orbittrack.model;

import java.time.LocalDateTime;

public class ObjetoOrbital {

    private int id_objeto;
    private String nome;
    private int id_tipo;
    private int id_agencia;
    private int id_sessao;
    private double altitude_km;
    private double inclinacao_graus;
    private String status;
    private String nivel_risco;
    private LocalDateTime data_cadastro;

    public ObjetoOrbital(int id_objeto, String nome, int id_tipo, int id_agencia, int id_sessao, double altitude_km, double inclinacao_graus, String status, String nivel_risco, LocalDateTime data_cadastro) {
        this.id_objeto = id_objeto;
        this.nome = nome;
        this.id_tipo = id_tipo;
        this.id_agencia = id_agencia;
        this.id_sessao = id_sessao;
        this.altitude_km = altitude_km;
        this.inclinacao_graus = inclinacao_graus;
        this.status = status;
        this.nivel_risco = nivel_risco;
        this.data_cadastro = data_cadastro;
    }

    public int getId_objeto() {
        return id_objeto;
    }

    public void setId_objeto(int id_objeto) {
        this.id_objeto = id_objeto;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public int getId_tipo() {
        return id_tipo;
    }

    public void setId_tipo(int id_tipo) {
        this.id_tipo = id_tipo;
    }

    public int getId_agencia() {
        return id_agencia;
    }

    public void setId_agencia(int id_agencia) {
        this.id_agencia = id_agencia;
    }

    public int getId_sessao() {
        return id_sessao;
    }

    public void setId_sessao(int id_sessao) {
        this.id_sessao = id_sessao;
    }

    public double getAltitude_km() {
        return altitude_km;
    }

    public void setAltitude_km(double altitude_km) {
        this.altitude_km = altitude_km;
    }

    public double getInclinacao_graus() {
        return inclinacao_graus;
    }

    public void setInclinacao_graus(double inclinacao_graus) {
        this.inclinacao_graus = inclinacao_graus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNivel_risco() {
        return nivel_risco;
    }

    public void setNivel_risco(String nivel_risco) {
        this.nivel_risco = nivel_risco;
    }

    public LocalDateTime getData_cadastro() {
        return data_cadastro;
    }

    public void setData_cadastro(LocalDateTime data_cadastro) {
        this.data_cadastro = data_cadastro;
    }
}
