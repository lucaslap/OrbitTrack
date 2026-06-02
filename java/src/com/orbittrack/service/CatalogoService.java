package com.orbittrack.service;

import com.orbittrack.model.ObjetoOrbital;

import java.util.ArrayList;
import java.util.List;

/**
 * Camada de serviço do OrbitTrack.
 *
 * É aqui que vive a regra de negócio: validar dados, gerar
 * identificadores, buscar, atualizar e remover objetos.
 * O menu de console não conhece estas regras — ele apenas
 * conversa com o usuário e chama esta classe.
 *
 * Os dados ficam em memória, em uma lista. Nada é persistido:
 * ao encerrar a aplicação, o catálogo é descartado.
 */
public class CatalogoService {

    // Faixas de validade para os atributos numéricos.
    // São os mesmos limites usados na parte web do projeto.
    public static final double ALTITUDE_MIN_KM = 160.0;
    public static final double ALTITUDE_MAX_KM = 35786.0;
    public static final double INCLINACAO_MIN  = 0.0;
    public static final double INCLINACAO_MAX  = 180.0;

    // "Banco de dados" em memória.
    private final List<ObjetoOrbital> objetos = new ArrayList<>();

    /**
     * Cadastra um novo objeto orbital. O menu já decidiu o tipo
     * (Satélite, Detrito ou Foguete) ao instanciar a subclasse;
     * o serviço só valida os dados e gera o id no formato
     * "PREFIXO-NNN" usando o próprio prefixo da subclasse.
     */
    public ObjetoOrbital cadastrar(ObjetoOrbital novo) {
        if (novo == null) {
            throw new IllegalArgumentException("Objeto não pode ser nulo.");
        }
        validarNome(novo.getNome());
        validarDados(novo.getAltitude(), novo.getInclinacao(),
                     novo.getStatus(), novo.getRisco());

        novo.setId(gerarProximoId(novo.getPrefixoId()));
        objetos.add(novo);
        return novo;
    }

    /**
     * Retorna a lista de objetos cadastrados. Devolve uma cópia
     * para impedir que quem chama altere o catálogo por fora
     * (encapsulamento da coleção).
     */
    public List<ObjetoOrbital> listarTodos() {
        return new ArrayList<>(objetos);
    }

    /**
     * Busca exata por id. Devolve null se não encontrar — o menu
     * trata esse caso e avisa o usuário.
     */
    public ObjetoOrbital buscarPorId(String id) {
        if (id == null) {
            return null;
        }
        for (ObjetoOrbital o : objetos) {
            if (o.getId().equalsIgnoreCase(id)) {
                return o;
            }
        }
        return null;
    }

    /**
     * Busca por trecho do nome, sem diferenciar maiúsculas de
     * minúsculas. Retorna todos os que casarem.
     */
    public List<ObjetoOrbital> buscarPorNome(String trecho) {
        List<ObjetoOrbital> achados = new ArrayList<>();
        if (trecho == null || trecho.isBlank()) {
            return achados;
        }
        String alvo = trecho.toLowerCase();
        for (ObjetoOrbital o : objetos) {
            if (o.getNome().toLowerCase().contains(alvo)) {
                achados.add(o);
            }
        }
        return achados;
    }

    /**
     * Atualiza um objeto existente. O id e o tipo não mudam — só
     * os atributos mutáveis. Devolve true se atualizou, false se
     * o id não existir no catálogo.
     */
    public boolean atualizar(String id, String nome, double altitude,
                             double inclinacao, String status, String risco) {
        ObjetoOrbital alvo = buscarPorId(id);
        if (alvo == null) {
            return false;
        }
        validarNome(nome);
        validarDados(altitude, inclinacao, status, risco);

        alvo.setNome(nome);
        alvo.setAltitude(altitude);
        alvo.setInclinacao(inclinacao);
        alvo.setStatus(status);
        alvo.setRisco(risco);
        return true;
    }

    /**
     * Remove um objeto pelo id. Devolve true se removeu.
     */
    public boolean remover(String id) {
        ObjetoOrbital alvo = buscarPorId(id);
        if (alvo == null) {
            return false;
        }
        objetos.remove(alvo);
        return true;
    }

    /**
     * Quantos objetos estão cadastrados — útil para o cabeçalho
     * do menu.
     */
    public int quantidade() {
        return objetos.size();
    }

    // ---------- Validações privadas ----------

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("O nome não pode ser vazio.");
        }
    }

    private void validarDados(double altitude, double inclinacao,
                              String status, String risco) {
        if (altitude < ALTITUDE_MIN_KM || altitude > ALTITUDE_MAX_KM) {
            throw new IllegalArgumentException(
                "Altitude deve estar entre " + ALTITUDE_MIN_KM
                + " e " + ALTITUDE_MAX_KM + " km.");
        }
        if (inclinacao < INCLINACAO_MIN || inclinacao > INCLINACAO_MAX) {
            throw new IllegalArgumentException(
                "Inclinação deve estar entre " + INCLINACAO_MIN
                + " e " + INCLINACAO_MAX + " graus.");
        }
        if (!ehStatusValido(status)) {
            throw new IllegalArgumentException(
                "Status inválido. Use: " + ObjetoOrbital.STATUS_ATIVO
                + ", " + ObjetoOrbital.STATUS_INATIVO
                + " ou " + ObjetoOrbital.STATUS_CRITICO + ".");
        }
        if (!ehRiscoValido(risco)) {
            throw new IllegalArgumentException(
                "Risco inválido. Use: " + ObjetoOrbital.RISCO_BAIXO
                + ", " + ObjetoOrbital.RISCO_MEDIO
                + ", " + ObjetoOrbital.RISCO_ALTO
                + " ou " + ObjetoOrbital.RISCO_CRITICO + ".");
        }
    }

    private boolean ehStatusValido(String s) {
        return ObjetoOrbital.STATUS_ATIVO.equals(s)
            || ObjetoOrbital.STATUS_INATIVO.equals(s)
            || ObjetoOrbital.STATUS_CRITICO.equals(s);
    }

    private boolean ehRiscoValido(String r) {
        return ObjetoOrbital.RISCO_BAIXO.equals(r)
            || ObjetoOrbital.RISCO_MEDIO.equals(r)
            || ObjetoOrbital.RISCO_ALTO.equals(r)
            || ObjetoOrbital.RISCO_CRITICO.equals(r);
    }

    /**
     * Gera o próximo id para um prefixo dado, no formato
     * "PREFIXO-NNN". Procura o maior número já em uso para
     * aquele prefixo e soma 1 — assim ids removidos não são
     * reaproveitados.
     */
    private String gerarProximoId(String prefixo) {
        int maior = 0;
        for (ObjetoOrbital o : objetos) {
            String idAtual = o.getId();
            if (idAtual == null || !idAtual.startsWith(prefixo + "-")) {
                continue;
            }
            try {
                int n = Integer.parseInt(idAtual.substring(prefixo.length() + 1));
                if (n > maior) {
                    maior = n;
                }
            } catch (NumberFormatException ignorado) {
                // id fora do padrão numérico — ignora, não atrapalha.
            }
        }
        return String.format("%s-%03d", prefixo, maior + 1);
    }
}
