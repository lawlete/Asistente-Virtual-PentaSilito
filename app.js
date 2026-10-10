/**
 * LOGICA DEL SIMULADOR ACA SILCHECK & QA PLAYGROUND PENTASILITO
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const perfilSelect = document.getElementById('perfilSelect');
  const currentProfileName = document.getElementById('currentProfileName');
  const btnOpenChat = document.getElementById('btnOpenChat');
  const btnCloseChat = document.getElementById('btnCloseChat');
  const btnCheckStatus = document.getElementById('btnCheckStatus');
  const widgetStatusBadge = document.getElementById('widgetStatusBadge');
  const copyToast = document.getElementById('copyFeedback');
  const btnVerPlanFree = document.getElementById('btnVerPlanFree');
  const planAnalysisSection = document.getElementById('planAnalysisSection');

  // 1. Selector de Perfiles (Productor, Acopio, Embolsador, Reciclaje)
  if (perfilSelect && currentProfileName) {
    perfilSelect.addEventListener('change', (e) => {
      const selectedText = perfilSelect.options[perfilSelect.selectedIndex].text.split(' ')[0];
      currentProfileName.textContent = selectedText;
      mostrarToast(`Perfil cambiado a: ${selectedText}`);
    });
  }

  // 2. Control de API de Chatbase
  function getChatbaseState() {
    try {
      if (typeof window.chatbase === 'function') {
        const state = window.chatbase('getState');
        return state || 'initialized';
      }
    } catch (err) {
      console.warn('Error al consultar estado de Chatbase:', err);
    }
    return 'pending';
  }

  function actualizarEstadoWidget() {
    const estado = getChatbaseState();
    if (widgetStatusBadge) {
      if (estado === 'initialized' || typeof window.chatbase === 'function') {
        widgetStatusBadge.innerHTML = '<span class="dot-status active"></span> PentaSilito Conectado';
      } else {
        widgetStatusBadge.innerHTML = '<span class="dot-status"></span> Esperando script...';
      }
    }
  }

  // Verificar estado periódicamente en los primeros segundos
  let checkCount = 0;
  const statusInterval = setInterval(() => {
    actualizarEstadoWidget();
    checkCount++;
    if (checkCount > 15) clearInterval(statusInterval);
  }, 1000);

  if (btnOpenChat) {
    btnOpenChat.addEventListener('click', () => {
      if (typeof window.chatbase === 'function') {
        window.chatbase('open');
        mostrarToast('Abriendo ventana de chat...');
      } else {
        mostrarToast('El widget aún se está cargando...');
      }
    });
  }

  if (btnCloseChat) {
    btnCloseChat.addEventListener('click', () => {
      if (typeof window.chatbase === 'function') {
        window.chatbase('close');
        mostrarToast('Cerrando ventana de chat...');
      }
    });
  }

  if (btnCheckStatus) {
    btnCheckStatus.addEventListener('click', () => {
      actualizarEstadoWidget();
      mostrarToast(`Estado del widget: ${getChatbaseState()}`);
    });
  }

  // 3. Prompts Rápidos de Prueba (Copiar y abrir chat)
  function copiarAlPortapapeles(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('¡Pregunta copiada! Pegala en la burbuja de PentaSilito.');
      }).catch(() => {
        copiarFallback(texto);
      });
    } else {
      copiarFallback(texto);
    }

    // Abrir automáticamente la burbuja de chat para conveniencia del tester
    if (typeof window.chatbase === 'function') {
      window.chatbase('open');
    }
  }

  function copiarFallback(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      mostrarToast('¡Pregunta copiada! Pegala en la burbuja de PentaSilito.');
    } catch (e) {
      mostrarToast('Seleccioná el texto para copiarlo.');
    }
    document.body.removeChild(textarea);
  }

  function mostrarToast(mensaje) {
    if (!copyToast) return;
    copyToast.textContent = mensaje;
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 3200);
  }

  // Asignar eventos a los chips de prompts de prueba
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-copy');
      if (promptText) {
        copiarAlPortapapeles(promptText);
      }
    });
  });

  // Asignar eventos a los botones "Preguntar a PentaSilito" dentro de las tarjetas
  document.querySelectorAll('.btn-ask-bot').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.getAttribute('data-prompt');
      if (promptText) {
        copiarAlPortapapeles(promptText);
      }
    });
  });

  // 4. Navegación rápida hacia el análisis del Plan Free
  if (btnVerPlanFree && planAnalysisSection) {
    btnVerPlanFree.addEventListener('click', () => {
      planAnalysisSection.scrollIntoView({ behavior: 'smooth' });
      planAnalysisSection.style.transition = 'box-shadow 0.3s ease';
      planAnalysisSection.style.boxShadow = '0 0 0 3px #F59E0B';
      setTimeout(() => {
        planAnalysisSection.style.boxShadow = '';
      }, 1800);
    });
  }

  // 5. Tabs de Categoría de Bolsas (Activas, Abiertas, Calidad)
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mostrarToast(`Filtrando: ${tab.textContent}`);
    });
  });

  // 6. Botones de filtro de ejemplo
  const btnFiltrar = document.getElementById('btnFiltrar');
  const btnLimpiarFiltro = document.getElementById('btnLimpiarFiltro');
  const filtroInput = document.getElementById('filtroBolsas');

  if (btnFiltrar && filtroInput) {
    btnFiltrar.addEventListener('click', () => {
      mostrarToast(`Búsqueda aplicada: "${filtroInput.value}"`);
    });
  }

  if (btnLimpiarFiltro && filtroInput) {
    btnLimpiarFiltro.addEventListener('click', () => {
      filtroInput.value = '';
      mostrarToast('Filtro de búsqueda restablecido.');
    });
  }
});
