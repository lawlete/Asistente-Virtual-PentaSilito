/**
 * CARGADOR DINÁMICO DE CHATBASE (BURBUJA O IFRAME)
 */

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  const btnCargar = document.getElementById('btnCargar');
  const btnAbrirBurbuja = document.getElementById('btnAbrirBurbuja');
  const iframeContainer = document.getElementById('iframeContainer');
  const chatIframe = document.getElementById('chatIframe');
  const statusText = document.getElementById('statusText');
  const radioModes = document.querySelectorAll('input[name="viewMode"]');

  // Función para extraer el Bot ID limpio ya sea que peguen una URL o el ID solo
  function extraerBotId(inputVal) {
    if (!inputVal) return '';
    let val = inputVal.trim();
    // Si pegaron una URL de Chatbase (ej: https://www.chatbase.co/chatbot-iframe/ID o /chatbot/ID)
    const match = val.match(/chatbase\.co\/(?:chatbot-iframe|chatbot|embed)\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // Si pegaron una URL con parámetro id=...
    const urlMatch = val.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    // Si pasaron directamente el ID
    return val;
  }

  // Cargar burbuja mediante script oficial
  function cargarBurbuja(botId) {
    if (!botId) return;

    // Remover script anterior si existiera
    const scriptExistente = document.getElementById('chatbase-script');
    if (scriptExistente) {
      scriptExistente.remove();
    }

    // Inicializar objeto chatbase si no existe
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
      window.chatbase = (...arguments) => {
        if (!window.chatbase.q) { window.chatbase.q = []; }
        window.chatbase.q.push(arguments);
      };
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === 'q') return target.q;
          return (...args) => target(prop, ...args);
        }
      });
    }

    const script = document.createElement('script');
    script.id = 'chatbase-script';
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.setAttribute('id', botId);
    script.setAttribute('domain', 'www.chatbase.co');
    document.body.appendChild(script);

    statusText.textContent = `Burbuja cargada para el ID: ${botId}`;
    iframeContainer.style.display = 'none';
  }

  // Cargar en Iframe incrustado
  function cargarIframe(botId) {
    if (!botId) return;
    const iframeUrl = `https://www.chatbase.co/chatbot-iframe/${botId}`;
    chatIframe.src = iframeUrl;
    iframeContainer.style.display = 'block';
    statusText.textContent = `Ventana incrustada cargada (${botId})`;
  }

  // Aplicar selección
  function aplicarCarga() {
    const rawVal = chatInput.value;
    const botId = extraerBotId(rawVal);

    if (!botId) {
      alert('Por favor ingresá un ID o URL válida de Chatbase.');
      return;
    }

    const selectedMode = document.querySelector('input[name="viewMode"]:checked').value;

    if (selectedMode === 'bubble') {
      cargarBurbuja(botId);
    } else {
      cargarIframe(botId);
    }
  }

  // Eventos
  btnCargar.addEventListener('click', aplicarCarga);

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      aplicarCarga();
    }
  });

  radioModes.forEach(radio => {
    radio.addEventListener('change', () => {
      aplicarCarga();
    });
  });

  if (btnAbrirBurbuja) {
    btnAbrirBurbuja.addEventListener('click', () => {
      if (typeof window.chatbase === 'function') {
        window.chatbase('open');
      } else {
        alert('La burbuja aún se está inicializando o está en modo ventana.');
      }
    });
  }

  // Carga inicial automática con el ID por defecto
  aplicarCarga();
});
