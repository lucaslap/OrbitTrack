package com.orbittrack.model;

public class TipoObjeto {

    private int id_tipo;
    private String descricao;

    public TipoObjeto(int id_tipo, String descricao) {
        this.id_tipo = id_tipo;
        this.descricao = descricao;
    }

    public int getId_tipo() {
        return id_tipo;
    }

    public void setId_tipo(int id_tipo) {
        this.id_tipo = id_tipo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }


}
