const carrinho = new Map();
const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const listaCarrinho = document.querySelector("#lista-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const statusCarrinho = document.querySelector("#status-carrinho");
const finalizarCompra = document.querySelector("#finalizar-compra");
const confirmacaoCompra = document.querySelector("#confirmacao-compra");
const listaConfirmacao = document.querySelector("#lista-confirmacao");
const totalConfirmacao = document.querySelector("#total-confirmacao");
const mensagemCompra = document.querySelector("#mensagem-compra");
const confirmarPedido = document.querySelector("#confirmar-pedido");
const voltarCarrinho = document.querySelector("#voltar-carrinho");
const campoCep = document.querySelector("#cep");
const botaoCalcularFrete = document.querySelector("#calcular-frete");
const resultadoFrete = document.querySelector("#resultado-frete");
const formularioPedido = document.querySelector("form[action='processa-pedido.html']");
const mensagemObrigatoria = "por favor preencha o campo obrigatorio";
const camposObrigatorios = [
  { id: "nome", controle: formularioPedido.querySelector("#nome"), mensagem: mensagemObrigatoria },
  { id: "email", controle: formularioPedido.querySelector("#email"), mensagem: mensagemObrigatoria },
  { id: "senha", controle: formularioPedido.querySelector("#senha"), mensagem: mensagemObrigatoria },
  { id: "nascimento", controle: formularioPedido.querySelector("#nascimento"), mensagem: mensagemObrigatoria },
  { id: "cep", controle: formularioPedido.querySelector("#cep"), mensagem: mensagemObrigatoria },
  { id: "produto", controle: formularioPedido.querySelector("#produto"), mensagem: "Por Favor Adicione um Produto" },
  { id: "quantidade", controle: formularioPedido.querySelector("#quantidade"), mensagem: "Seleciona a quantidade do Produto" },
  { id: "pagamento", controle: formularioPedido.querySelector("#pagamento"), mensagem: "Selecione a Forma de Pagamento" },
  {
    id: "entrega",
    controle: formularioPedido.querySelector("[name='entrega']"),
    alvo: formularioPedido.querySelector("#opcoes-entrega"),
    invalido: () => !formularioPedido.querySelector("[name='entrega']:checked"),
    mensagem: "Seleciona o Metodo de Entrega"
  }
];

function obterTotal() {
  return Array.from(carrinho.values()).reduce(
    (total, produto) => total + produto.preco * produto.quantidade,
    0
  );
}

function renderizarCarrinho(lista, elementoTotal) {
  lista.replaceChildren();

  if (carrinho.size === 0) {
    const itemVazio = document.createElement("li");
    itemVazio.textContent = "Seu carrinho está vazio.";
    lista.append(itemVazio);
  } else {
    for (const produto of carrinho.values()) {
      const item = document.createElement("li");
      const subtotal = produto.preco * produto.quantidade;
      item.textContent = `${produto.nome} x ${produto.quantidade} — ${formatoMoeda.format(subtotal)}`;
      lista.append(item);
    }
  }

  elementoTotal.textContent = `Total: ${formatoMoeda.format(obterTotal())}`;
}

document.addEventListener("click", (evento) => {
  const botaoAdicionar = evento.target.closest(".adicionar-carrinho");
  if (!botaoAdicionar) return;

  const produto = botaoAdicionar.closest("article");
  const nome = produto?.querySelector("h3")?.textContent.trim();
  const textoPreco = produto?.querySelector("span p")?.textContent;
  const precoEncontrado = textoPreco?.match(/[\d.]+,\d{2}/);

  if (!nome || !precoEncontrado) {
    console.error("Não foi possível identificar o nome ou o preço do produto.");
    statusCarrinho.textContent = "Não foi possível adicionar este produto.";
    return;
  }

  const preco = Number(precoEncontrado[0].replace(/\./g, "").replace(",", "."));
  const produtoNoCarrinho = carrinho.get(nome);

  if (produtoNoCarrinho) {
    produtoNoCarrinho.quantidade += 1;
  } else {
    carrinho.set(nome, { nome, preco, quantidade: 1 });
  }

  renderizarCarrinho(listaCarrinho, totalCarrinho);
  statusCarrinho.textContent = `${nome} foi adicionado ao carrinho.`;
});

finalizarCompra.addEventListener("click", () => {
  if (carrinho.size === 0) {
    statusCarrinho.textContent = "Adicione pelo menos um produto antes de finalizar.";
    return;
  }

  renderizarCarrinho(listaConfirmacao, totalConfirmacao);
  mensagemCompra.textContent = "";
  confirmarPedido.hidden = false;
  voltarCarrinho.textContent = "Voltar ao carrinho";
  confirmacaoCompra.showModal();
});

confirmarPedido.addEventListener("click", () => {
  carrinho.clear();
  renderizarCarrinho(listaCarrinho, totalCarrinho);
  statusCarrinho.textContent = "Compra confirmada com sucesso.";
  mensagemCompra.textContent = "Compra confirmada com sucesso. Obrigado pela preferência!";
  confirmarPedido.hidden = true;
  voltarCarrinho.textContent = "Fechar";
});

voltarCarrinho.addEventListener("click", () => {
  confirmacaoCompra.close();
});

botaoCalcularFrete.addEventListener("click", () => {
  const cep = campoCep.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    resultadoFrete.textContent = "Digite um CEP válido de 8 números.";
    return;
  }

  const estimativas = [
    { frete: 19.9, prazo: "3 a 5 dias úteis" },
    { frete: 24.9, prazo: "4 a 6 dias úteis" },
    { frete: 29.9, prazo: "5 a 8 dias úteis" },
    { frete: 34.9, prazo: "7 a 10 dias úteis" },
    { frete: 39.9, prazo: "8 a 12 dias úteis" }
  ];
  const faixa = Math.min(Math.floor(Number(cep[0]) / 2), estimativas.length - 1);
  const estimativa = estimativas[faixa];

  resultadoFrete.textContent =
    `Frete: ${formatoMoeda.format(estimativa.frete)} — prazo estimado: ${estimativa.prazo}.`;
});

function limparErroCampo(campoObrigatorio) {
  const { controle, alvo = controle } = campoObrigatorio;
  const idMensagem = `${campoObrigatorio.id}-erro-obrigatorio`;
  document.getElementById(idMensagem)?.remove();
  controle.removeAttribute("aria-invalid");
  alvo.removeAttribute("aria-invalid");

  const descricoes = (alvo.getAttribute("aria-describedby") || "")
    .split(" ")
    .filter((id) => id && id !== idMensagem);
  if (descricoes.length > 0) {
    alvo.setAttribute("aria-describedby", descricoes.join(" "));
  } else {
    alvo.removeAttribute("aria-describedby");
  }
}

function mostrarErroCampo(campoObrigatorio) {
  const { controle, alvo = controle } = campoObrigatorio;
  const idMensagem = `${campoObrigatorio.id}-erro-obrigatorio`;
  let mensagem = document.getElementById(idMensagem);

  if (!mensagem) {
    mensagem = document.createElement("p");
    mensagem.id = idMensagem;
    mensagem.className = "mensagem-campo-obrigatorio";
    mensagem.setAttribute("role", "alert");
    mensagem.textContent = campoObrigatorio.mensagem;
    alvo.insertAdjacentElement("beforebegin", mensagem);
  }

  controle.setAttribute("aria-invalid", "true");
  alvo.setAttribute("aria-invalid", "true");
  const descricoes = (alvo.getAttribute("aria-describedby") || "")
    .split(" ")
    .filter(Boolean);
  if (!descricoes.includes(idMensagem)) {
    alvo.setAttribute("aria-describedby", [...descricoes, idMensagem].join(" "));
  }
}

formularioPedido.addEventListener("submit", (evento) => {
  let primeiroCampoInvalido;

  for (const campo of camposObrigatorios) {
    const invalido = campo.invalido
      ? campo.invalido()
      : campo.controle.value.trim() === "";
    if (invalido) {
      mostrarErroCampo(campo);
      primeiroCampoInvalido ||= campo.controle;
    } else {
      limparErroCampo(campo);
    }
  }

  if (primeiroCampoInvalido) {
    evento.preventDefault();
    primeiroCampoInvalido.focus();
    return;
  }

  if (!formularioPedido.checkValidity()) {
    evento.preventDefault();
    formularioPedido.reportValidity();
  }
});

for (const campo of camposObrigatorios) {
  const controles = campo.id === "entrega"
    ? formularioPedido.querySelectorAll("[name='entrega']")
    : [campo.controle];

  for (const controle of controles) {
    controle.addEventListener("input", () => {
      const invalido = campo.invalido
        ? campo.invalido()
        : campo.controle.value.trim() === "";
      if (!invalido) {
        limparErroCampo(campo);
      }
    });
    controle.addEventListener("change", () => {
      const invalido = campo.invalido
        ? campo.invalido()
        : campo.controle.value.trim() === "";
      if (!invalido) {
        limparErroCampo(campo);
      }
    });
  }
}

formularioPedido.addEventListener("reset", () => {
  resultadoFrete.textContent = "";
  for (const campo of camposObrigatorios) {
    limparErroCampo(campo);
  }
});

renderizarCarrinho(listaCarrinho, totalCarrinho);
