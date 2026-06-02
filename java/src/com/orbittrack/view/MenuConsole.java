package com.orbittrack.view;

import com.orbittrack.model.Detrito;
import com.orbittrack.model.Foguete;
import com.orbittrack.model.ObjetoOrbital;
import com.orbittrack.model.Satelite;
import com.orbittrack.service.CatalogoService;

import java.util.List;
import java.util.Scanner;

/**
 * Camada de interação com o usuário.
 *
 * Esta classe não conhece regras de negócio: ela só lê do
 * teclado, formata a saída e delega para o CatalogoService.
 * Toda validação de altitude, inclinação, status e risco
 * acontece dentro do serviço — o menu apenas captura as
 * exceções e mostra a mensagem.
 */
public class MenuConsole {

    private final CatalogoService service;
    private final Scanner scanner;

    public MenuConsole(CatalogoService service) {
        this.service = service;
        this.scanner = new Scanner(System.in);
    }

    /**
     * Laço principal do menu. Roda até o usuário escolher "Sair".
     */
    public void executar() {
        System.out.println();
        System.out.println("===========================================");
        System.out.println("  OrbitTrack — Catálogo de Objetos Orbitais");
        System.out.println("===========================================");

        boolean continuar = true;
        while (continuar) {
            mostrarMenu();
            int opcao = lerInt("Opção: ", 0, 5);
            System.out.println();

            switch (opcao) {
                case 1:
                    cadastrarObjeto();
                    break;
                case 2:
                    listarObjetos();
                    break;
                case 3:
                    buscarObjeto();
                    break;
                case 4:
                    atualizarObjeto();
                    break;
                case 5:
                    removerObjeto();
                    break;
                case 0:
                    continuar = false;
                    System.out.println("Encerrando o OrbitTrack. Até logo!");
                    break;
            }
        }
    }

    private void mostrarMenu() {
        System.out.println();
        System.out.println("--- Menu (" + service.quantidade() + " objetos no catálogo) ---");
        System.out.println("1) Cadastrar objeto orbital");
        System.out.println("2) Listar todos");
        System.out.println("3) Buscar (por id ou nome)");
        System.out.println("4) Atualizar objeto");
        System.out.println("5) Remover objeto");
        System.out.println("0) Sair");
    }

    // ---------- Operações ----------

    private void cadastrarObjeto() {
        System.out.println(">> Cadastro de objeto orbital");

        int tipo = lerTipo();
        String nome = lerTexto("Nome: ");
        double altitude = lerDouble(
            "Altitude (km, " + CatalogoService.ALTITUDE_MIN_KM
            + "–" + CatalogoService.ALTITUDE_MAX_KM + "): ");
        double inclinacao = lerDouble(
            "Inclinação (graus, " + CatalogoService.INCLINACAO_MIN
            + "–" + CatalogoService.INCLINACAO_MAX + "): ");
        String status = lerStatus();
        String risco = lerRisco();

        ObjetoOrbital novo = criarPorTipo(tipo, nome, altitude, inclinacao, status, risco);

        try {
            ObjetoOrbital salvo = service.cadastrar(novo);
            System.out.println("✓ Cadastrado: " + salvo);
        } catch (IllegalArgumentException e) {
            System.out.println("✗ Não foi possível cadastrar: " + e.getMessage());
        }
    }

    private void listarObjetos() {
        System.out.println(">> Lista de objetos orbitais");
        List<ObjetoOrbital> todos = service.listarTodos();
        if (todos.isEmpty()) {
            System.out.println("(catálogo vazio)");
            return;
        }
        for (ObjetoOrbital o : todos) {
            System.out.println(o);
        }
    }

    private void buscarObjeto() {
        System.out.println(">> Busca");
        System.out.println("1) Por id");
        System.out.println("2) Por nome");
        int modo = lerInt("Opção: ", 1, 2);

        if (modo == 1) {
            String id = lerTexto("ID (ex.: SAT-001): ");
            ObjetoOrbital achado = service.buscarPorId(id);
            if (achado == null) {
                System.out.println("Nenhum objeto com id '" + id + "'.");
            } else {
                System.out.println(achado);
            }
        } else {
            String trecho = lerTexto("Trecho do nome: ");
            List<ObjetoOrbital> achados = service.buscarPorNome(trecho);
            if (achados.isEmpty()) {
                System.out.println("Nenhum objeto com nome contendo '" + trecho + "'.");
            } else {
                System.out.println("Encontrados: " + achados.size());
                for (ObjetoOrbital o : achados) {
                    System.out.println(o);
                }
            }
        }
    }

    private void atualizarObjeto() {
        System.out.println(">> Atualizar objeto");
        String id = lerTexto("ID do objeto a atualizar: ");
        ObjetoOrbital atual = service.buscarPorId(id);
        if (atual == null) {
            System.out.println("Nenhum objeto com id '" + id + "'.");
            return;
        }

        System.out.println("Atual: " + atual);
        System.out.println("Digite os novos valores (o tipo e o id não mudam):");

        String nome = lerTexto("Novo nome: ");
        double altitude = lerDouble(
            "Nova altitude (km, " + CatalogoService.ALTITUDE_MIN_KM
            + "–" + CatalogoService.ALTITUDE_MAX_KM + "): ");
        double inclinacao = lerDouble(
            "Nova inclinação (graus, " + CatalogoService.INCLINACAO_MIN
            + "–" + CatalogoService.INCLINACAO_MAX + "): ");
        String status = lerStatus();
        String risco = lerRisco();

        try {
            boolean ok = service.atualizar(atual.getId(), nome, altitude, inclinacao, status, risco);
            if (ok) {
                System.out.println("✓ Atualizado: " + service.buscarPorId(atual.getId()));
            } else {
                System.out.println("✗ Objeto não encontrado.");
            }
        } catch (IllegalArgumentException e) {
            System.out.println("✗ Não foi possível atualizar: " + e.getMessage());
        }
    }

    private void removerObjeto() {
        System.out.println(">> Remover objeto");
        String id = lerTexto("ID do objeto a remover: ");
        ObjetoOrbital alvo = service.buscarPorId(id);
        if (alvo == null) {
            System.out.println("Nenhum objeto com id '" + id + "'.");
            return;
        }

        System.out.println("Vai remover: " + alvo);
        String confirma = lerTexto("Confirma? (s/N): ");
        if (!confirma.equalsIgnoreCase("s")) {
            System.out.println("Operação cancelada.");
            return;
        }
        service.remover(alvo.getId());
        System.out.println("✓ Removido.");
    }

    // ---------- Auxiliares de entrada ----------

    private int lerInt(String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt);
            String linha = scanner.nextLine().trim();
            try {
                int n = Integer.parseInt(linha);
                if (n < min || n > max) {
                    System.out.println("Digite um número entre " + min + " e " + max + ".");
                    continue;
                }
                return n;
            } catch (NumberFormatException e) {
                System.out.println("Entrada inválida. Tente de novo.");
            }
        }
    }

    private double lerDouble(String prompt) {
        while (true) {
            System.out.print(prompt);
            // Aceita vírgula decimal (padrão pt-BR) convertendo para ponto.
            String linha = scanner.nextLine().trim().replace(',', '.');
            try {
                return Double.parseDouble(linha);
            } catch (NumberFormatException e) {
                System.out.println("Número inválido. Use, por exemplo, 550 ou 550.5.");
            }
        }
    }

    private String lerTexto(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    private int lerTipo() {
        System.out.println("Tipo:");
        System.out.println("  1) Satélite");
        System.out.println("  2) Detrito");
        System.out.println("  3) Foguete");
        return lerInt("Tipo (1-3): ", 1, 3);
    }

    private String lerStatus() {
        System.out.println("Status:");
        System.out.println("  1) " + ObjetoOrbital.STATUS_ATIVO);
        System.out.println("  2) " + ObjetoOrbital.STATUS_INATIVO);
        System.out.println("  3) " + ObjetoOrbital.STATUS_CRITICO);
        int op = lerInt("Status (1-3): ", 1, 3);
        switch (op) {
            case 1: return ObjetoOrbital.STATUS_ATIVO;
            case 2: return ObjetoOrbital.STATUS_INATIVO;
            default: return ObjetoOrbital.STATUS_CRITICO;
        }
    }

    private String lerRisco() {
        System.out.println("Risco:");
        System.out.println("  1) " + ObjetoOrbital.RISCO_BAIXO);
        System.out.println("  2) " + ObjetoOrbital.RISCO_MEDIO);
        System.out.println("  3) " + ObjetoOrbital.RISCO_ALTO);
        System.out.println("  4) " + ObjetoOrbital.RISCO_CRITICO);
        int op = lerInt("Risco (1-4): ", 1, 4);
        switch (op) {
            case 1: return ObjetoOrbital.RISCO_BAIXO;
            case 2: return ObjetoOrbital.RISCO_MEDIO;
            case 3: return ObjetoOrbital.RISCO_ALTO;
            default: return ObjetoOrbital.RISCO_CRITICO;
        }
    }

    /**
     * Cria a subclasse correta conforme o tipo escolhido no menu.
     * O id é passado como null — o CatalogoService gera o id
     * definitivo no formato PREFIXO-NNN ao cadastrar.
     */
    private ObjetoOrbital criarPorTipo(int tipo, String nome, double altitude,
                                       double inclinacao, String status, String risco) {
        switch (tipo) {
            case 1: return new Satelite(null, nome, altitude, inclinacao, status, risco);
            case 2: return new Detrito(null,  nome, altitude, inclinacao, status, risco);
            default: return new Foguete(null, nome, altitude, inclinacao, status, risco);
        }
    }
}
