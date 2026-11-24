// 1. Dados de conexão do Supabase
// Troque pelos dados do SEU projeto (Project Settings > API Keys).
// Use só a chave pública (sb_publishable_... ou anon). Nunca a service_role / sb_secret_.
const SUPABASE_URL = "https://hadhdvwgcyshnopmzphz.supabase.co";
const SUPABASE_KEY = "sb_publishable_aztB6clxw4r_4qQFsckQqw_IO1_nlvu";

// 2. Criar conexão
const conexao = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Selecionar elementos da tela
const campoTarefa = document.getElementById("tarefa");
const botaoAdicionar = document.getElementById("btnAdicionar");
const listaTarefas = document.getElementById("listaTarefas");
const mensagem = document.getElementById("mensagem");
const contador = document.getElementById("contador");
const botoesFiltro = document.querySelectorAll(".filtro");

// Filtro escolhido: "todas", "pendentes" ou "concluidas"
let filtroAtual = "todas";

// 4. Buscar tarefas no banco
async function carregarTarefas() {
  mensagem.textContent = "Carregando...";

  const { data, error } = await conexao
    .from("tarefas")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    mensagem.textContent = "Erro ao carregar tarefas.";
    console.error(error);
    return;
  }

  // Desafio: quantidade de tarefas pendentes
  const pendentes = data.filter(function(t) { return !t.concluida; }).length;
  contador.textContent = pendentes === 1
    ? "1 tarefa pendente"
    : pendentes + " tarefas pendentes";

  // Desafio: filtro de tarefas concluídas
  const visiveis = data.filter(function(t) {
    if (filtroAtual === "pendentes") return !t.concluida;
    if (filtroAtual === "concluidas") return t.concluida;
    return true;
  });

  listaTarefas.innerHTML = "";

  if (data.length === 0) {
    mensagem.textContent = "Nenhuma tarefa cadastrada.";
  } else if (visiveis.length === 0) {
    mensagem.textContent = "Nenhuma tarefa neste filtro.";
  } else {
    mensagem.textContent = "";
  }

  visiveis.forEach(function(tarefa) {
    const card = document.createElement("div");
    card.className = "tarefa-card";
    if (tarefa.concluida) {
      card.classList.add("concluida");
    }

    const titulo = document.createElement("span");
    titulo.textContent = tarefa.titulo;

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const botaoConcluir = document.createElement("button");
    botaoConcluir.textContent = tarefa.concluida ? "Desfazer" : "Concluir";
    botaoConcluir.onclick = function() {
      alterarTarefa(tarefa.id, !tarefa.concluida);
    };

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.onclick = function() {
      excluirTarefa(tarefa.id);
    };

    acoes.appendChild(botaoConcluir);
    acoes.appendChild(botaoExcluir);
    card.appendChild(titulo);
    card.appendChild(acoes);
    listaTarefas.appendChild(card);
  });
}

// 5. Cadastrar uma tarefa
async function adicionarTarefa() {
  const titulo = campoTarefa.value.trim();

  if (titulo === "") {
    alert("Digite uma tarefa!");
    return;
  }

  const { error } = await conexao
    .from("tarefas")
    .insert({ titulo: titulo });

  if (error) {
    alert("Erro ao cadastrar tarefa.");
    console.error(error);
    return;
  }

  campoTarefa.value = "";
  carregarTarefas();
}

// 6. Alterar situação da tarefa
async function alterarTarefa(id, situacao) {
  const { error } = await conexao
    .from("tarefas")
    .update({ concluida: situacao })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar tarefa.");
    console.error(error);
    return;
  }

  carregarTarefas();
}

// 7. Excluir tarefa
async function excluirTarefa(id) {
  if (!confirm("Deseja excluir esta tarefa?")) {
    return;
  }

  const { error } = await conexao
    .from("tarefas")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir tarefa.");
    console.error(error);
    return;
  }

  carregarTarefas();
}

// 8. Eventos
botaoAdicionar.addEventListener("click", adicionarTarefa);

// Enter no campo também adiciona
campoTarefa.addEventListener("keydown", function(e) {
  if (e.key === "Enter") adicionarTarefa();
});

// Botões de filtro
botoesFiltro.forEach(function(botao) {
  botao.addEventListener("click", function() {
    botoesFiltro.forEach(function(b) { b.classList.remove("ativo"); });
    botao.classList.add("ativo");
    filtroAtual = botao.dataset.filtro;
    carregarTarefas();
  });
});

// 9. Carregar tarefas ao abrir aplicativo
carregarTarefas();

// 10. PWA: registrar o Service Worker para o app poder ser instalado
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("./sw.js")
      .catch(function(erro) {
        console.error("Erro ao registrar o Service Worker:", erro);
      });
  });
}
