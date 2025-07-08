let dados = JSON.parse(localStorage.getItem("dados")) || {
  pratos: [],
  funcionarios: [],
  contas: [],
  margemLucro: 200,
  proporcaoGastos: 16.77,
  quantidadeVendida: 100,
};

// Funções de formatação
function formatNumber(value, maxDecimals = 3) {
  value = Number(value);
  if (isNaN(value)) return "0";
  const fixed = value.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, "");
}

function formatCurrency(value) {
  value = Number(value);
  if (isNaN(value)) return "R$ 0,00";

  let decimalPlaces = 2;
  if (value < 0.01) decimalPlaces = 4;
  else if (value < 0.1) decimalPlaces = 3;

  return "R$ " + value.toFixed(decimalPlaces).replace(".", ",");
}

let categoriaSelecionadaModal = "";
let subcategoriaSelecionadaModal = "";

function openModalAdicionarPrato() {
  const modal = document.getElementById("modalAdicionarPrato");
  modal.classList.add("active");
  document.getElementById("nomePratoInput").value = "";
  document.getElementById("nomePratoInput").focus();

  const categoriaOrigem = document.getElementById("categoriaSelecionada").value;
  document.getElementById("categoriaSelect").value = categoriaOrigem;
  atualizarSubcategoriasModal();
}

function fecharModalAdicionarPrato() {
  document.getElementById("modalAdicionarPrato").classList.remove("active");
}

function adicionarPratoViaModal() {
  const nome = document.getElementById("nomePratoInput").value.trim();
  if (!nome) return;

  const categoria = document.getElementById("categoriaSelect").value;
  const subcategoriaSelect = document.getElementById("subcategoriaSelect");
  const subcategoria =
    subcategoriaSelect.style.display !== "none"
      ? subcategoriaSelect.value
      : null;

  // Define o tipo baseado na categoria/subcategoria
  let tipo = "completo"; // padrão para a maioria dos casos

  if (categoria === "Bebidas") {
    if (["Cachaças", "Cervejas", "Refrigerantes"].includes(subcategoria)) {
      tipo = "simples";
    }
    // Caipirinhas e Sucos permanecem como "completo" (com ingredientes)
  }

  dados.pratos.push({
    nome,
    categoria,
    subcategoria,
    tipo,
    ingredientes: tipo === "completo" ? [] : undefined,
    preco: tipo === "simples" ? 0 : undefined,
    ml: tipo === "simples" ? 0 : undefined,
    expanded: true,
  });

  salvar();
  fecharModalAdicionarPrato();
}
// Adicione esta nova função para atualizar ml
function atualizarMl(i, valor) {
  dados.pratos[i].ml = parseInt(valor) || 0;
  salvar();
}

console.log("Tentando adicionar prato via modal");

function salvar() {
  dados.margemLucro =
    parseFloat(document.getElementById("margemLucro").value) || 0;
  dados.proporcaoGastos =
    parseFloat(document.getElementById("proporcaoGastos").value) || 0;
  dados.quantidadeVendida =
    parseInt(document.getElementById("quantidadeVendida").value) || 1;
  localStorage.setItem("dados", JSON.stringify(dados));
  render();
  console.log("Salvo com sucesso. Pratos agora:", dados.pratos);
}

function showTab(tabId) {
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll("nav button")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
  render();
}

// Adiciona sincronização inicial dos inputs de resumo
function sincronizarCamposResumo() {
  document.getElementById("margemLucro").value = dados.margemLucro;
  document.getElementById("proporcaoGastos").value = dados.proporcaoGastos;
  document.getElementById("quantidadeVendida").value = dados.quantidadeVendida;
}

document.addEventListener("DOMContentLoaded", function () {
  sincronizarCamposResumo();

  if (document.getElementById("resumo").classList.contains("active")) {
    renderResumo();
  }
  render();
});

// Funções para Pratos
function adicionarPrato() {
  const nome = prompt("Nome do item:");
  if (!nome) return;

  const categoria = document.getElementById("categoriaSelecionada").value;
  const subcategoria =
    categoria === "Bebidas"
      ? document.getElementById("subcategoriaSelecionada").value
      : null;

  const tipo =
    categoria === "Bebidas" &&
    ["Cachaças", "Cervejas", "Refrigerantes"].includes(subcategoria)
      ? "simples"
      : "completo";

  dados.pratos.push({
    nome,
    categoria,
    subcategoria,
    tipo,
    ingredientes: tipo === "completo" ? [] : undefined,
    preco: tipo === "simples" ? 0 : undefined,
    expanded: true,
  });
  salvar();
}

function removerPrato(i) {
  if (confirm("Remover este prato?")) {
    dados.pratos.splice(i, 1);
    salvar();
  }
}

function togglePrato(i) {
  dados.pratos[i].expanded = !dados.pratos[i].expanded;
  render();
}

function adicionarIngrediente(i) {
  dados.pratos[i].ingredientes.push({
    nome: "",
    valor: 0,
    peso: 1000,
    usado: 0,
    unidade: "g",
  });
  salvar();
}

function removerIngrediente(i, j) {
  if (confirm("Remover este ingrediente?")) {
    dados.pratos[i].ingredientes.splice(j, 1);
    salvar();
  }
}

function atualizarIngrediente(i, j, campo, valor) {
  if (campo === "nome" || campo === "unidade") {
    dados.pratos[i].ingredientes[j][campo] = valor;
  } else {
    const numValue = Number(valor.toString().replace(",", ".")) || 0;
    dados.pratos[i].ingredientes[j][campo] = numValue;
  }
  salvar();
}

function calcularCustoIngrediente(ing) {
  let pesoEmGramas = Number(ing.peso);
  let usadoEmGramas = Number(ing.usado);

  switch (ing.unidade) {
    case "kg":
      pesoEmGramas = ing.peso * 1000;
      usadoEmGramas = ing.usado * 1000;
      break;
    case "L":
      pesoEmGramas = ing.peso * 1000;
      usadoEmGramas = ing.usado * 1000;
      break;
    case "un":
      pesoEmGramas = ing.peso;
      usadoEmGramas = ing.usado;
      break;
  }

  const custoUn = ing.valor / pesoEmGramas;
  const custoPrato = custoUn * usadoEmGramas;

  return {
    custoUn: Math.round(custoUn * 1000000) / 1000000,
    custoPrato: Math.round(custoPrato * 100) / 100,
  };
}

function renderPratos() {
  const container = document.getElementById("pratos-container");
  container.innerHTML = "";

  dados.pratos.forEach((prato, i) => {
    let totalPrato = 0;
    if (prato.tipo === "completo") {
      totalPrato = prato.ingredientes.reduce((sum, ing) => {
        const { custoPrato } = calcularCustoIngrediente(ing);
        return sum + custoPrato;
      }, 0);
    } else {
      totalPrato = prato.preco;
    }

    let html = `
      <div class="prato-card">
        <div class="prato-header" onclick="togglePrato(${i})">
          <h3>${prato.nome} <small>(${prato.categoria}${
      prato.subcategoria ? " > " + prato.subcategoria : ""
    })</small></h3>
          <span class="prato-total">${formatCurrency(totalPrato)}</span>
          <span class="toggle-icon">${prato.expanded ? "▼" : "▶"}</span>
          <button class="remove-btn" onclick="event.stopPropagation(); removerPrato(${i})">❌</button>
        </div>
    `;

    if (prato.expanded) {
      if (prato.tipo === "completo") {
        html += `
          <div class="ingredientes-container">
            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Valor</th>
                  <th>Quantidade</th>
                  <th>Usado</th>
                  <th>Unidade</th>
                  <th>Custo/Un</th>
                  <th>Custo Prato</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
        `;

        if (prato.ingredientes.length === 0) {
          html += `<div style="padding: 16px; color: #ccc;">Sem ingredientes adicionados.</div>`;
        }

        prato.ingredientes.forEach((ing, j) => {
          const { custoUn, custoPrato } = calcularCustoIngrediente(ing);

          html += `
            <tr>
              <td><input value="${
                ing.nome
              }" onchange="atualizarIngrediente(${i}, ${j}, 'nome', this.value)"></td>
              <td>
                <div class="currency-input">
                  <span>R$</span>
                  <input type="number" step="0.0001" value="${
                    ing.valor % 1 === 0 ? ing.valor : ing.valor.toFixed(4)
                  }"
                         onchange="atualizarIngrediente(${i}, ${j}, 'valor', this.value)"
                         class="no-spin">
                </div>
              </td>
              <td><input type="number" step="0.0001" value="${formatNumber(
                ing.peso,
                4
              )}"
                         onchange="atualizarIngrediente(${i}, ${j}, 'peso', this.value)"
                         class="no-spin"></td>
              <td><input type="number" step="0.0001" value="${formatNumber(
                ing.usado,
                4
              )}"
                         onchange="atualizarIngrediente(${i}, ${j}, 'usado', this.value)"
                         class="no-spin"></td>
              <td>
                <select onchange="atualizarIngrediente(${i}, ${j}, 'unidade', this.value)">
                  <option value="g" ${
                    ing.unidade === "g" ? "selected" : ""
                  }>g</option>
                  <option value="kg" ${
                    ing.unidade === "kg" ? "selected" : ""
                  }>kg</option>
                  <option value="L" ${
                    ing.unidade === "L" ? "selected" : ""
                  }>L</option>
                  <option value="un" ${
                    ing.unidade === "un" ? "selected" : ""
                  }>Un</option>
                </select>
              </td>
              <td>${formatCurrency(custoUn)}</td>
              <td>${formatCurrency(custoPrato)}</td>
              <td><button onclick="removerIngrediente(${i}, ${j})">❌</button></td>
            </tr>
          `;
        });

        html += `
              </tbody>
            </table>
            <button onclick="adicionarIngrediente(${i})">+ Adicionar Ingrediente</button>
          </div>
        `;
      } else {
        html += `
    <div style="padding: 20px;">
      ${
        prato.categoria === "Bebidas"
          ? `
        <div class="bebida-campos">
          <label>
            Preço:
            <div class="currency-input">
              <span>R$</span>
              <input type="number" step="0.01" class="no-spin" value="${
                prato.preco || 0
              }" onchange="atualizarPrecoSimples(${i}, this.value)">
            </div>
          </label>
          <label>
            ML:
            <input type="number" class="no-spin" value="${
              prato.ml || 0
            }" onchange="atualizarMl(${i}, this.value)">
          </label>
        </div>
      `
          : `
        <label>
          Preço:
          <div class="currency-input">
            <span>R$</span>
            <input type="number" step="0.01" class="no-spin" value="${
              prato.preco || 0
            }" onchange="atualizarPrecoSimples(${i}, this.value)">
          </div>
        </label>
      `
      }
    </div>
  `;
      }
    }

    html += `</div>`;
    container.innerHTML += html;
  });
}

function atualizarPrecoSimples(i, valor) {
  dados.pratos[i].preco = parseFloat(valor) || 0;
  salvar();
}

// Funções para Funcionários
function adicionarFuncionario() {
  dados.funcionarios.push({ nome: "", salario: 0, qtd: 1 });
  salvar();
}

function removerFuncionario(i) {
  if (confirm("Remover este funcionário?")) {
    dados.funcionarios.splice(i, 1);
    salvar();
  }
}

function renderFuncionarios() {
  const body = document.getElementById("funcionarios-body");
  body.innerHTML = "";
  dados.funcionarios.forEach((f, i) => {
    const total = f.salario * f.qtd;
    body.innerHTML += `<tr>
          <td><input value="${
            f.nome
          }" onchange="dados.funcionarios[${i}].nome=this.value; salvar()"></td>
          <td>
            <div class="currency-input">
              <span>R$</span>
              <input type="number" step="0.01" value="${
                f.salario % 1 === 0 ? f.salario : f.salario.toFixed(2)
              }" 
                     onchange="dados.funcionarios[${i}].salario=parseFloat(this.value)||0; salvar()" 
                     class="no-spin">
            </div>
          </td>
          <td><input type="number" value="${
            f.qtd
          }" onchange="dados.funcionarios[${i}].qtd=parseInt(this.value)||1; salvar()" class="no-spin"></td>
          <td>${formatCurrency(total)}</td>
          <td><button onclick="removerFuncionario(${i})">❌</button></td>
        </tr>`;
  });
}

// Funções para Contas Fixas
function adicionarConta() {
  dados.contas.push({ nome: "", valor: 0 });
  salvar();
}

function removerConta(i) {
  if (confirm("Remover esta conta?")) {
    dados.contas.splice(i, 1);
    salvar();
  }
}

function renderContas() {
  const body = document.getElementById("contas-body");
  body.innerHTML = "";
  dados.contas.forEach((c, i) => {
    body.innerHTML += `<tr>
          <td><input value="${
            c.nome
          }" onchange="dados.contas[${i}].nome=this.value; salvar()"></td>
          <td>
            <div class="currency-input">
              <span>R$</span>
              <input type="number" step="0.01" value="${
                c.valor % 1 === 0 ? c.valor : c.valor.toFixed(2)
              }" 
                     onchange="dados.contas[${i}].valor=parseFloat(this.value)||0; salvar()" 
                     class="no-spin">
            </div>
          </td>
          <td><button onclick="removerConta(${i})">❌</button></td>
        </tr>`;
  });
}

// Função para Resumo
function renderResumo() {
  const selectPrato = document.getElementById("pratoSelecionado");
  const pratoSalvo = localStorage.getItem("pratoSelecionadoResumo");
  const pratoSelecionadoAtual = pratoSalvo ?? selectPrato.value;

  selectPrato.innerHTML = '<option value="-1">Todos os pratos (média)</option>';

  dados.pratos.forEach((prato, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = prato.nome;
    selectPrato.appendChild(option);
  });

  if (pratoSelecionadoAtual !== "-1" && dados.pratos[pratoSelecionadoAtual]) {
    selectPrato.value = pratoSelecionadoAtual;
  } else {
    selectPrato.value = "-1";
  }

  const pratoIndex = parseInt(selectPrato.value);
  const totalSalarios = dados.funcionarios.reduce(
    (s, f) => s + Number(f.salario) * Number(f.qtd),
    0
  );
  const totalContas = dados.contas.reduce((s, c) => s + Number(c.valor), 0);
  const totalFixos = Number(totalSalarios) + Number(totalContas);
  const proporcao = Number(dados.proporcaoGastos) / 100;
  const qtdVendida = Number(dados.quantidadeVendida) || 1;

  const adicional = (proporcao * totalFixos) / qtdVendida;
  const margemLucro = Number(dados.margemLucro) / 100;

  let custoPrato = 0;
  if (pratoIndex >= 0 && pratoIndex < dados.pratos.length) {
    custoPrato = dados.pratos[pratoIndex].ingredientes.reduce((t, ing) => {
      const { custoPrato } = calcularCustoIngrediente(ing);
      return t + custoPrato;
    }, 0);
  } else {
    const custos = dados.pratos.map((p) =>
      p.ingredientes.reduce((t, ing) => {
        const { custoPrato } = calcularCustoIngrediente(ing);
        return t + custoPrato;
      }, 0)
    );
    custoPrato =
      custos.length > 0 ? custos.reduce((a, b) => a + b, 0) / custos.length : 0;
  }

  const precoFinal =
    (Number(custoPrato) + Number(adicional)) * (1 + Number(margemLucro));

  document.getElementById("totalFixos").textContent =
    formatCurrency(totalFixos);
  document.getElementById("adicionalPorPrato").textContent =
    formatCurrency(adicional);
  document.getElementById("custoPratoSelecionado").textContent =
    formatCurrency(custoPrato);
  document.getElementById("precoFinal").textContent =
    formatCurrency(precoFinal);

  // Atualiza detalhes da fórmula
  document.getElementById("detalheFormula").textContent = `(${formatCurrency(
    custoPrato
  )} + ${formatCurrency(adicional)}) × (1 + ${
    dados.margemLucro
  }%) = ${formatCurrency(precoFinal)}`;
}

function render() {
  renderPratos();
  renderFuncionarios();
  renderContas();

  if (document.getElementById("resumo").classList.contains("active")) {
    renderResumo();
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("resumo").classList.contains("active")) {
    renderResumo();
  }
  render();
});

function salvarPratoSelecionadoResumo() {
  const valor = document.getElementById("pratoSelecionado").value;
  localStorage.setItem("pratoSelecionadoResumo", valor);
  renderResumo();
}
