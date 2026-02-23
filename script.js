document.addEventListener('DOMContentLoaded', () => {
  // === MODAL DE IMAGEM COM ZOOM ===
  const modal = document.createElement('div');
  modal.id = 'modal-img';
  modal.classList.add('modal-img');
  modal.style.display = 'none';

  const modalImg = document.createElement('img');
  Object.assign(modalImg.style, {
    maxWidth: 'none',
    maxHeight: 'none',
    borderRadius: '10px',
    transition: 'transform 0.2s ease',
    transform: 'scale(1)',
    cursor: 'grab',
  });
  modalImg.draggable = false;

  let zoomLevel = 1;
  let isDragging = false;
  let startX, startY, currentX = 0, currentY = 0;

  const zoomControls = document.createElement('div');
  zoomControls.classList.add('zoom-controls');
  zoomControls.innerHTML = `
    <button class="zoom-btn" id="zoom-in">＋</button>
    <button class="zoom-btn" id="zoom-out">－</button>
    <button class="zoom-btn" id="reset">⤾</button>
    <button class="zoom-btn" id="close">✕</button>
  `;

  modal.appendChild(modalImg);
  modal.appendChild(zoomControls);
  document.body.appendChild(modal);

  function updateTransform() {
    modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
  }

  document.querySelectorAll('.zoomavel').forEach(img => {
    img.addEventListener('click', () => {
      const tamanhoInput = document.querySelector(`input[name='tamanho${img.dataset.id}']`);
      if (tamanhoInput) {
        const tamanhoSelecionado = document.querySelector(`input[name='tamanho${img.dataset.id}']:checked`);
        if (!tamanhoSelecionado) {
          alert('Por favor, selecione um tamanho antes de visualizar.');
          return;
        }
      }
      modalImg.src = img.src;
      zoomLevel = 1;
      currentX = 0;
      currentY = 0;
      updateTransform();
      modal.style.display = 'flex';
    });
  });

  modal.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomLevel = Math.min(Math.max(zoomLevel + delta, 1), 4);
    updateTransform();
  }, { passive: false });

  modalImg.addEventListener('mousedown', e => {
    if (zoomLevel <= 1) return;
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    modalImg.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updateTransform();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    modalImg.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
  });

  document.getElementById('zoom-in').addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 4);
    updateTransform();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 1);
    updateTransform();
  });

  document.getElementById('reset').addEventListener('click', () => {
    zoomLevel = 1;
    currentX = 0;
    currentY = 0;
    updateTransform();
  });

  document.getElementById('close').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // === BLOQUEAR ACESSO SEM ESCOLHER TAMANHO ===
  document.querySelectorAll('.selecionar-produto').forEach(botao => {
    botao.addEventListener('click', () => {
      const grupo = botao.dataset.grupo;
      const destino = botao.dataset.destino;
      const selecionado = document.querySelector(`input[name="${grupo}"]:checked`);

      if (!selecionado) {
        alert('Por favor, selecione um tamanho antes de continuar.');
        return;
      }

      localStorage.setItem(`tamanhoSelecionado_${grupo}`, selecionado.value);
      window.location.href = destino;
    });
  });

  // === FALE CONOSCO ===
  const btnContato = document.getElementById("btn-contato");
  const contatoSection = document.getElementById("contato-info");

  btnContato?.addEventListener("click", e => {
    e.preventDefault();
    if (contatoSection.style.display === "none" || !contatoSection.style.display) {
      contatoSection.style.display = "block";
      contatoSection.scrollIntoView({ behavior: "smooth" });
    } else {
      contatoSection.style.display = "none";
    }
  });

  // === CARRINHO ===
  const botoesCarrinho = document.querySelectorAll('.btn-carrinho');
  const modalCarrinho = document.getElementById('modal-carrinho');
  const listaCarrinho = document.getElementById('lista-carrinho');
  const totalCarrinho = document.getElementById('total-carrinho');
  const fecharCarrinho = document.getElementById('fechar-carrinho');
  const botaoAbrirCarrinho = document.getElementById('btn-carrinho');

  let carrinho = [];

  // Criar badge para quantidade de itens no botão carrinho
  let badge = document.createElement('span');
  badge.id = 'badge-carrinho';
  badge.style.cssText = `
    position: absolute;
    top: -5px;
    right: -5px;
    background: red;
    color: white;
    font-weight: bold;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 50%;
    pointer-events: none;
    display: none;
  `;
  botaoAbrirCarrinho.style.position = 'relative';
  botaoAbrirCarrinho.appendChild(badge);

  function atualizarBadge() {
    const quantidadeTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    if (quantidadeTotal > 0) {
      badge.textContent = quantidadeTotal;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  function atualizarCarrinho() {
    listaCarrinho.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
      const li = document.createElement('li');
      const subtotal = item.preco * item.quantidade;
      li.innerHTML = `
        ${item.nome} - Tamanho: ${item.tamanho} (${item.quantidade} unid.) - R$ ${subtotal.toFixed(2)}
        <button class="remover-item botao-remover" data-index="${index}">Remover</button>
      `;
      listaCarrinho.appendChild(li);
      total += subtotal;
    });

    totalCarrinho.textContent = `Total: R$ ${total.toFixed(2)}`;

    // Evento para remover itens
    document.querySelectorAll('.remover-item').forEach(botao => {
      botao.addEventListener('click', () => {
        const index = parseInt(botao.getAttribute('data-index'));
        carrinho.splice(index, 1);
        localStorage.setItem('carrinhoAfroglam', JSON.stringify(carrinho));
        atualizarCarrinho();
        atualizarBadge();
      });
    });

    atualizarBadge();
  }

  botoesCarrinho.forEach(botao => {
    botao.addEventListener('click', () => {
      const containerProduto = botao.closest('.item-produto');
      const nome = botao.getAttribute('data-nome') || 'Produto sem nome';

      // Captura o preço como texto e converte vírgula para ponto
      const precoRaw = botao.getAttribute('data-preco') || '0';
      const preco = parseFloat(precoRaw.replace(',', '.'));

      const quantidadeInput = containerProduto.querySelector('.quantidade');
      const quantidade = parseInt(quantidadeInput?.value || '1');

      const tamanhoSelecionado = containerProduto.querySelector('input[name^="tamanho"]:checked');
      if (!tamanhoSelecionado) {
        alert('Por favor, selecione um tamanho antes de adicionar ao carrinho.');
        return;
      }

      const tamanho = tamanhoSelecionado.value;

      // Adiciona item ao carrinho
      carrinho.push({ nome, preco, quantidade, tamanho });

      // Atualiza localStorage e exibição
      localStorage.setItem('carrinhoAfroglam', JSON.stringify(carrinho));
      atualizarCarrinho();
      atualizarBadge();

      // Exibe o modal do carrinho
      modalCarrinho.style.display = 'flex';
    });
  });

  // Evento para fechar modal do carrinho pelo botão "Fechar"
  fecharCarrinho.addEventListener('click', () => {
    modalCarrinho.style.display = 'none';
  });

  // Fechar modal do carrinho clicando fora do conteúdo
  modalCarrinho.addEventListener('click', (e) => {
    if (e.target === modalCarrinho) {
      modalCarrinho.style.display = 'none';
    }
  });

  // Carregar carrinho salvo no localStorage
  const carrinhoSalvo = localStorage.getItem('carrinhoAfroglam');
  if (carrinhoSalvo) {
    carrinho = JSON.parse(carrinhoSalvo);
    atualizarBadge();
  }
});







