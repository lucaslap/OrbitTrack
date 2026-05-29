package com.orbittrack.model;

import java.time.LocalDateTime;

public class SessaoCadastro {
    private int id_sessao;
    private int id_operador;
    private LocalDateTime iniciada_em;
    private LocalDateTime encerrada_em;

    public SessaoCadastro(int id_sessao, int id_operador, LocalDateTime iniciada_em, LocalDateTime encerrada_em) {
        this.id_sessao = id_sessao;
        this.id_operador = id_operador;
        this.iniciada_em = iniciada_em;
        this.encerrada_em = encerrada_em;
    }

    public int getId_sessao() {
        return id_sessao;
    }

    public void setId_sessao(int id_sessao) {
        this.id_sessao = id_sessao;
    }

    public int getId_operador() {
        return id_operador;
    }

    public void setId_operador(int id_operador) {
        this.id_operador = id_operador;
    }

    public LocalDateTime getIniciada_em() {
        return iniciada_em;
    }

    public void setIniciada_em(LocalDateTime iniciada_em) {
        this.iniciada_em = iniciada_em;
    }

    public LocalDateTime getEncerrada_em() {
        return encerrada_em;
    }

    public void setEncerrada_em(LocalDateTime encerrada_em) {
        this.encerrada_em = encerrada_em;
    }
}
