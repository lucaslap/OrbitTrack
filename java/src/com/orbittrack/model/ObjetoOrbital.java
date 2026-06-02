package com.orbittrack.model;

/**
 * Classe base do domínio do OrbitTrack.
 *
 * Representa um objeto monitorado em órbita. É abstrata porque
 * todo objeto cadastrado precisa ser de um tipo concreto:
 * Satélite, Detrito ou Foguete. A herança permite que o sistema
 * trate todos os objetos de forma uniforme (polimorfismo) e que
 * cada subclasse defina o seu próprio tipo e prefixo de id.
 */
public abstract class ObjetoOrbital {

    // Valores aceitos para "status". Usar constantes evita strings
    // mágicas espalhadas pelo código e centraliza o vocabulário do
    // domínio. A camada de serviço usa isto para validar entradas.
    public static final String STATUS_ATIVO   = "Ativo";
    public static final String STATUS_INATIVO = "Inativo";
    public static final String STATUS_CRITICO = "Crítico";

    // Valores aceitos para "risco" de colisão.
    public static final String RISCO_BAIXO   = "Baixo";
    public static final String RISCO_MEDIO   = "Médio";
    public static final String RISCO_ALTO    = "Alto";
    public static final String RISCO_CRITICO = "Crítico";

    // Atributos privados — encapsulamento. Só são acessados de fora
    // pelos getters/setters.
    private String id;
    private String nome;
    private double altitude;     // em quilômetros
    private double inclinacao;   // em graus
    private String status;
    private String risco;

    // Construtor protegido: só as subclasses podem chamar.
    // Reforça que ObjetoOrbital nunca é instanciado diretamente.
    protected ObjetoOrbital(String id, String nome, double altitude,
                            double inclinacao, String status, String risco) {
        this.id = id;
        this.nome = nome;
        this.altitude = altitude;
        this.inclinacao = inclinacao;
        this.status = status;
        this.risco = risco;
    }

    // Métodos abstratos: cada subclasse responde com o seu tipo
    // legível ("Satélite") e o prefixo do id ("SAT"). É aqui que
    // o polimorfismo aparece.
    public abstract String getTipo();
    public abstract String getPrefixoId();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public double getAltitude() {
        return altitude;
    }

    public void setAltitude(double altitude) {
        this.altitude = altitude;
    }

    public double getInclinacao() {
        return inclinacao;
    }

    public void setInclinacao(double inclinacao) {
        this.inclinacao = inclinacao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRisco() {
        return risco;
    }

    public void setRisco(String risco) {
        this.risco = risco;
    }

    @Override
    public String toString() {
        return String.format(
            "[%s] %-20s | %-8s | alt: %7.1f km | inc: %5.1f° | status: %-8s | risco: %s",
            id, nome, getTipo(), altitude, inclinacao, status, risco
        );
    }
}
