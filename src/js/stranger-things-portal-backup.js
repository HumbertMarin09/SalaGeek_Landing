/* ============================================
   STRANGER THINGS PORTAL - UPSIDE DOWN MODE
   Event Duration: Nov 26, 2025 - Jan 1, 2026
   ============================================ */

(function () {
  "use strict";

  // Configuración del evento
  const EVENT_CONFIG = {
    startDate: new Date("2025-11-26"),
    endDate: new Date("2026-01-01"),
    localStorageKey: "upsideDownMode",
    particleCount: 50,
  };

  // Verificar si estamos dentro del período del evento
  function isEventActive() {
    const now = new Date();
    return now >= EVENT_CONFIG.startDate && now <= EVENT_CONFIG.endDate;
  }

  // Si no está activo el evento, no hacer nada
  if (!isEventActive()) {
    console.log("🎬 Stranger Things event no está activo actualmente");
    return;
  }

  console.log("🌀 Stranger Things Portal activado - Upside Down disponible");

  // Función para sonido de entrada al Upside Down (oscuro y dimensional)
  // Función para sonido de entrada al Upside Down (oscuro y dimensional)
  function playEnterUpsideDownSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Oscilador principal (frecuencia baja descendente)
      const mainOsc = audioContext.createOscillator();
      const mainGain = audioContext.createGain();
      mainOsc.type = 'sine';
      mainOsc.frequency.setValueAtTime(100, now);
      mainOsc.frequency.exponentialRampToValueAtTime(30, now + 2);
      mainGain.gain.setValueAtTime(0.4, now);
      mainGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
      
      // Oscilador de terror (disonancia)
      const scaryOsc = audioContext.createOscillator();
      const scaryGain = audioContext.createGain();
      scaryOsc.type = 'sawtooth';
      scaryOsc.frequency.setValueAtTime(150, now);
      scaryOsc.frequency.exponentialRampToValueAtTime(50, now + 2.2);
      scaryGain.gain.setValueAtTime(0.2, now);
      scaryGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
      
      // Ruido para efecto de ruptura
      const bufferSize = audioContext.sampleRate * 1;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 800;
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      
      // RAYO/TRUENO al final - MÁS FUERTE Y REALISTA
      const thunderBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
      const thunderData = thunderBuffer.getChannelData(0);
      for (let i = 0; i < thunderData.length; i++) {
        // Ruido explosivo con múltiples capas de decaimiento
        const decay1 = Math.exp(-i / (audioContext.sampleRate * 0.03)); // Crack inicial rápido
        const decay2 = Math.exp(-i / (audioContext.sampleRate * 0.15)); // Retumbar medio
        const decay3 = Math.exp(-i / (audioContext.sampleRate * 0.3)); // Eco largo
        thunderData[i] = (Math.random() * 2 - 1) * (decay1 * 0.8 + decay2 * 0.5 + decay3 * 0.3);
      }
      const thunder = audioContext.createBufferSource();
      thunder.buffer = thunderBuffer;
      const thunderFilter = audioContext.createBiquadFilter();
      thunderFilter.type = 'bandpass';
      thunderFilter.frequency.value = 400; // Frecuencia más baja para trueno más profundo
      thunderFilter.Q.value = 0.7;
      const thunderGain = audioContext.createGain();
      thunderGain.gain.setValueAtTime(0.85, now + 2.2); // Volumen más alto: 0.6 → 0.85
      thunderGain.gain.exponentialRampToValueAtTime(0.01, now + 3.0); // Decaimiento más largo
      
      // Reverb oscuro
      const convolver = audioContext.createConvolver();
      const reverbBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 3, audioContext.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const channelData = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.8));
        }
      }
      convolver.buffer = reverbBuffer;
      
      // Conectar
      mainOsc.connect(mainGain);
      mainGain.connect(convolver);
      scaryOsc.connect(scaryGain);
      scaryGain.connect(convolver);
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(convolver);
      thunder.connect(thunderFilter);
      thunderFilter.connect(thunderGain);
      thunderGain.connect(convolver);
      convolver.connect(audioContext.destination);
      
      // Iniciar
      mainOsc.start(now);
      scaryOsc.start(now);
      whiteNoise.start(now);
      thunder.start(now + 2.2); // Rayo al final
      
      // Detener
      mainOsc.stop(now + 3);
      scaryOsc.stop(now + 3);
      whiteNoise.stop(now + 1);
      thunder.stop(now + 3.2); // Aumentar duración para que se escuche completo
      
      console.log("🔊 Sonido: Entrando al Upside Down ⚡");
    } catch (error) {
      console.log("⚠️ Web Audio API no disponible:", error);
    }
  }

  // Función para sonido de regreso al mundo normal (relajante y reconfortante)
  function playReturnToNormalSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Oscilador principal (tono suave y cálido)
      const mainOsc = audioContext.createOscillator();
      const mainGain = audioContext.createGain();
      mainOsc.type = 'sine';
      mainOsc.frequency.setValueAtTime(261.63, now); // Do (C4)
      mainOsc.frequency.linearRampToValueAtTime(523.25, now + 1.2); // Do (C5)
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.25, now + 0.3);
      mainGain.gain.linearRampToValueAtTime(0.2, now + 1);
      mainGain.gain.linearRampToValueAtTime(0, now + 2);
      
      // Acorde armónico (Mi - E4)
      const chord1 = audioContext.createOscillator();
      const chord1Gain = audioContext.createGain();
      chord1.type = 'sine';
      chord1.frequency.setValueAtTime(329.63, now);
      chord1.frequency.linearRampToValueAtTime(659.25, now + 1.2);
      chord1Gain.gain.setValueAtTime(0, now + 0.2);
      chord1Gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
      chord1Gain.gain.linearRampToValueAtTime(0, now + 2);
      
      // Acorde armónico (Sol - G4)
      const chord2 = audioContext.createOscillator();
      const chord2Gain = audioContext.createGain();
      chord2.type = 'sine';
      chord2.frequency.setValueAtTime(392.00, now);
      chord2.frequency.linearRampToValueAtTime(784.00, now + 1.2);
      chord2Gain.gain.setValueAtTime(0, now + 0.4);
      chord2Gain.gain.linearRampToValueAtTime(0.12, now + 0.7);
      chord2Gain.gain.linearRampToValueAtTime(0, now + 2);
      
      // Ruido rosa suave (ambiente relajante)
      const bufferSize = audioContext.sampleRate * 1.5;
      const pinkNoise = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const pinkData = pinkNoise.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const pinkNoiseSource = audioContext.createBufferSource();
      pinkNoiseSource.buffer = pinkNoise;
      const pinkFilter = audioContext.createBiquadFilter();
      pinkFilter.type = 'lowpass';
      pinkFilter.frequency.value = 3000;
      const pinkGain = audioContext.createGain();
      pinkGain.gain.setValueAtTime(0, now);
      pinkGain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      pinkGain.gain.linearRampToValueAtTime(0, now + 1.5);
      
      // Reverb suave y cálido
      const convolver = audioContext.createConvolver();
      const reverbBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 1, audioContext.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const channelData = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.2));
        }
      }
      convolver.buffer = reverbBuffer;
      
      // Conectar todo
      mainOsc.connect(mainGain);
      mainGain.connect(convolver);
      chord1.connect(chord1Gain);
      chord1Gain.connect(convolver);
      chord2.connect(chord2Gain);
      chord2Gain.connect(convolver);
      pinkNoiseSource.connect(pinkFilter);
      pinkFilter.connect(pinkGain);
      pinkGain.connect(convolver);
      convolver.connect(audioContext.destination);
      
      // Iniciar
      mainOsc.start(now);
      chord1.start(now + 0.2);
      chord2.start(now + 0.4);
      pinkNoiseSource.start(now);
      
      // Detener
      mainOsc.stop(now + 2.2);
      chord1.stop(now + 2.2);
      chord2.stop(now + 2.2);
      pinkNoiseSource.stop(now + 1.8);
      
      console.log("🔊 Sonido: Regresando al mundo normal ✨");
    } catch (error) {
      console.log("⚠️ Web Audio API no disponible:", error);
    }
  }

  // Sonido de trueno rojo para relámpagos - inicia loop continuo
  function playThunderSound() {
    try {
      // Solo crear y reproducir si no existe
      if (!thunderAudio) {
        thunderAudio = new Audio('/src/sounds/trueno.mp3');
        thunderAudio.volume = 0.5;
        thunderAudio.loop = true;
        thunderAudio.preload = 'auto';
        thunderAudio.autoplay = true; // Forzar autoplay
        
        // Asegurar que el loop funcione
        thunderAudio.addEventListener('ended', function() {
          if (isUpsideDown && thunderAudio) {
            this.currentTime = 0;
            this.play().catch(() => {});
          }
        });
        
        // Manejar errores
        thunderAudio.addEventListener('error', function(e) {
          console.log('Error cargando audio:', e);
        });
        
        // Intentar cargar primero
        thunderAudio.load();
        
        // Reproducir con múltiples intentos
        const attemptPlay = () => {
          const playPromise = thunderAudio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('🔊 Audio de trueno iniciado (52s en loop)');
              waitingForInteraction = false;
            }).catch((error) => {
              console.log('⚠️ Autoplay bloqueado por navegador - usa scroll/click para activar');
              waitingForInteraction = true;
              // NO reintentar automáticamente, esperar interacción del usuario
            });
          }
        };
        
        attemptPlay();
      }
    } catch (error) {
      console.log('Error en playThunderSound:', error);
    }
  }
  
  // Detener audio de trueno
  function stopThunderSound() {
    if (thunderAudio) {
      thunderAudio.pause();
      thunderAudio.currentTime = 0;
      thunderAudio = null;
    }
  }

  // Estado del Upside Down
  let isUpsideDown = localStorage.getItem(EVENT_CONFIG.localStorageKey) === "true";
  let thunderAudio = null; // Audio de trueno en loop
  let waitingForInteraction = false; // Flag para esperar interacción del usuario

  // Función para iniciar audio después de interacción del usuario
  function enableAudioOnInteraction(event) {
    if (waitingForInteraction && isUpsideDown) {
      // Intentar reproducir el audio existente
      if (thunderAudio) {
        const playPromise = thunderAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('🔊 Audio de trueno iniciado tras click/tecla');
            waitingForInteraction = false;
            // Remover listeners
            document.removeEventListener('click', enableAudioOnInteraction);
            document.removeEventListener('keydown', enableAudioOnInteraction);
            document.removeEventListener('touchstart', enableAudioOnInteraction);
          }).catch(() => {
            // Silent fail
          });
        }
      }
    }
  }

  // Crear portal flotante
  function createPortal() {
    const portal = document.createElement("div");
    portal.className = "upside-down-portal";
    portal.setAttribute("role", "button");
    portal.setAttribute("aria-label", "Portal al Upside Down");
    portal.setAttribute("tabindex", "0");

    // Fisura dimensional realista (vertical e irregular)
    portal.innerHTML = `
      <svg class="portal-crack-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradiente realista con menos saturación -->
          <linearGradient id="fissureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.9" />
            <stop offset="15%" style="stop-color:#1a0f2e;stop-opacity:1" />
            <stop offset="35%" style="stop-color:#4a1f3a;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#8b2e2e;stop-opacity:0.95" />
            <stop offset="65%" style="stop-color:#c44a35;stop-opacity:0.9" />
            <stop offset="85%" style="stop-color:#1a0f2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.9" />
          </linearGradient>
          
          <!-- Resplandor sutil interior -->
          <radialGradient id="innerGlow">
            <stop offset="0%" style="stop-color:#c44a35;stop-opacity:0.6" />
            <stop offset="40%" style="stop-color:#8b2e2e;stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:#1a0f2e;stop-opacity:0" />
          </radialGradient>
          
          <!-- Textura realista -->
          <filter id="realistic">
            <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="6" seed="42"/>
            <feDisplacementMap in="SourceGraphic" scale="4"/>
            <feGaussianBlur stdDeviation="0.5"/>
          </filter>
          
          <filter id="subtleGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood flood-color="#8b2e2e" flood-opacity="0.5"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- Sombra profunda -->
          <filter id="depth">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.8"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Resplandor de fondo sutil -->
        <ellipse cx="50" cy="50" rx="20" ry="40" fill="url(#innerGlow)" opacity="0.3" filter="url(#depth)">
          <animate attributeName="rx" values="18;22;18" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="38;42;38" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.25;0.35;0.25" dur="4s" repeatCount="indefinite"/>
        </ellipse>
        
        <!-- Fisura vertical principal (más oscura y realista) -->
        <path d="M 50 5 
                 L 48.5 10 L 51.5 15 L 47.8 20 L 52.2 25 
                 L 49.2 30 L 53.5 35 L 48.3 40 L 51.8 45 L 50 50
                 L 51.7 55 L 48.5 60 L 52.8 65 L 49.3 70
                 L 51.9 75 L 48.6 80 L 51.2 85 L 49.4 90 L 50 95
                 L 50.6 90 L 48.8 85 L 51.4 80 L 48.1 75
                 L 50.7 70 L 47.2 65 L 51.5 60 L 48.3 55 L 50 50
                 L 48.2 45 L 51.7 40 L 46.5 35 L 50.8 30
                 L 47.8 25 L 52.2 20 L 48.5 15 L 51.5 10 Z"
              fill="url(#fissureGradient)"
              opacity="0.98"
              filter="url(#realistic)">
          <animate attributeName="opacity" values="0.95;1;0.95" dur="3.5s" repeatCount="indefinite"/>
        </path>
        
        <!-- Bordes sutiles de la fisura (menos brillantes) -->
        <path d="M 50 5 L 48.5 10 L 51.5 15 L 47.8 20 L 52.2 25 L 49.2 30 L 53.5 35 L 48.3 40 L 51.8 45 L 50 50 L 51.7 55 L 48.5 60 L 52.8 65 L 49.3 70 L 51.9 75 L 48.6 80 L 51.2 85 L 49.4 90 L 50 95"
              stroke="#c44a35" 
              stroke-width="0.8" 
              fill="none"
              opacity="0.5"
              stroke-linecap="round"
              filter="url(#subtleGlow)">
          <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite"/>
        </path>
        
        <path d="M 50 5 L 50.6 10 L 49.4 15 L 52.2 20 L 48.8 25 L 51.2 30 L 47.5 35 L 50.7 40 L 48.3 45 L 50 50 L 48.7 55 L 51.5 60 L 47.8 65 L 50.8 70 L 48.4 75 L 51.6 80 L 49.2 85 L 50.8 90 L 50 95"
              stroke="#8b2e2e" 
              stroke-width="0.6" 
              fill="none"
              opacity="0.4"
              stroke-linecap="round">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3.3s" repeatCount="indefinite"/>
        </path>
        
        <!-- Partículas más sutiles y menos saturadas -->
        ${Array.from({length: 18}, (_, i) => {
          const y = 12 + (i * 4.5);
          const x = 48.5 + Math.random() * 3;
          const size = 0.4 + Math.random() * 0.8;
          const duration = 3 + Math.random() * 2;
          const delay = Math.random() * 3;
          return `
            <circle cx="${x}" cy="${y}" r="${size}" fill="#c44a35" opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
              <animate attributeName="cx" values="${x};${x + (Math.random() - 0.5) * 2};${x}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
            </circle>
          `;
        }).join('')}
        
        <!-- Venas más oscuras y sutiles -->
        ${Array.from({length: 12}, (_, i) => {
          const y = 18 + (i * 6.5);
          const side = i % 2 === 0 ? 1 : -1;
          const endX = 50 + (side * (12 + Math.random() * 12));
          const endY = y + (Math.random() - 0.5) * 8;
          const midX = 50 + (side * (4 + Math.random() * 4));
          const duration = 3 + Math.random() * 1.5;
          return `
            <path d="M 50 ${y} Q ${midX} ${y + (Math.random() - 0.5) * 4}, ${endX} ${endY}" 
                  stroke="#4a1f3a" 
                  stroke-width="0.6" 
                  fill="none"
                  opacity="0.35"
                  stroke-linecap="round">
              <animate attributeName="opacity" values="0.25;0.45;0.25" dur="${duration}s" repeatCount="indefinite"/>
            </path>
          `;
        }).join('')}
        
        <!-- Núcleo más sutil -->
        <ellipse cx="50" cy="50" rx="2.5" ry="5" fill="#c44a35" opacity="0.7" filter="url(#subtleGlow)">
          <animate attributeName="opacity" values="0.6;0.8;0.6" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="4.5;6;4.5" dur="2s" repeatCount="indefinite"/>
        </ellipse>
      </svg>
    `;

    const tooltip = document.createElement("span");
    tooltip.className = "portal-tooltip";
    tooltip.id = "portal-tooltip-text";
    tooltip.textContent = isUpsideDown ? "🏠 Volver al mundo normal" : "🌀 Entrar al Upside Down";
    portal.appendChild(tooltip);

    portal.addEventListener("click", toggleUpsideDown);
    portal.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleUpsideDown();
      }
    });

    // Insertar el portal en el Hero section (donde están las badges)
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
      heroSection.style.position = "relative";
      heroSection.appendChild(portal);
    } else {
      document.body.appendChild(portal);
    }
    
    return portal;
  }

  // Crear banner de evento
  function createBanner() {
    const banner = document.createElement("div");
    banner.className = "stranger-things-banner";
    
    // SVG de cabeza de Demogorgon (más realista y aterrador)
    const demogorgonSVG = `
      <svg class="demogorgon-head" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradiente para piel viscosa -->
          <radialGradient id="skinGradient">
            <stop offset="0%" style="stop-color:#4a3220;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#6b4423;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3a2415;stop-opacity:1" />
          </radialGradient>
          
          <!-- Gradiente para pétalos carnosos -->
          <linearGradient id="petalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#c45555;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#d96b6b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a03e3e;stop-opacity:1" />
          </linearGradient>
          
          <!-- Sombra profunda -->
          <filter id="deepShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Cuello/base -->
        <ellipse cx="50" cy="65" rx="18" ry="12" fill="url(#skinGradient)" opacity="0.9"/>
        
        <!-- Cabeza principal -->
        <ellipse cx="50" cy="48" rx="24" ry="30" fill="url(#skinGradient)" filter="url(#deepShadow)"/>
        
        <!-- Textura de piel (arrugas) -->
        <path d="M 30 40 Q 35 38, 40 40" stroke="#3a2415" stroke-width="1" fill="none" opacity="0.5"/>
        <path d="M 60 40 Q 65 38, 70 40" stroke="#3a2415" stroke-width="1" fill="none" opacity="0.5"/>
        <path d="M 32 55 Q 38 53, 44 55" stroke="#3a2415" stroke-width="1" fill="none" opacity="0.5"/>
        <path d="M 56 55 Q 62 53, 68 55" stroke="#3a2415" stroke-width="1" fill="none" opacity="0.5"/>
        
        <!-- PÉTALOS SUPERIORES (5 pétalos más grandes y carnosos) -->
        <g transform="translate(50, 38)">
          <!-- Pétalo superior extremo izquierdo -->
          <path d="M -14 2 Q -18 -12, -16 -22 Q -14 -26, -12 -22 Q -14 -14, -11 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M -14 2 Q -18 -12, -16 -22 Q -14 -26, -12 -22 Q -14 -14, -11 0 Z;
                             M -14 2 Q -19 -14, -17 -24 Q -15 -28, -13 -24 Q -15 -16, -11 0 Z;
                             M -14 2 Q -18 -12, -16 -22 Q -14 -26, -12 -22 Q -14 -14, -11 0 Z"
                     dur="4s" repeatCount="indefinite"/>
          </path>
          
          <!-- Pétalo superior izquierdo -->
          <path d="M -7 2 Q -10 -16, -8 -26 Q -6 -30, -4 -26 Q -6 -18, -4 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M -7 2 Q -10 -16, -8 -26 Q -6 -30, -4 -26 Q -6 -18, -4 0 Z;
                             M -7 2 Q -11 -18, -9 -28 Q -7 -32, -5 -28 Q -7 -20, -4 0 Z;
                             M -7 2 Q -10 -16, -8 -26 Q -6 -30, -4 -26 Q -6 -18, -4 0 Z"
                     dur="3.5s" repeatCount="indefinite"/>
          </path>
          
          <!-- Pétalo superior central -->
          <path d="M 0 2 Q 0 -18, 0 -28 Q 0 -32, 0 -28 Q 0 -20, 0 0 Z" 
                fill="#e07575" 
                stroke="#8b2020" 
                stroke-width="1.3"
                opacity="0.98">
            <animate attributeName="d" 
                     values="M 0 2 Q 0 -18, 0 -28 Q 0 -32, 0 -28 Q 0 -20, 0 0 Z;
                             M 0 2 Q 0 -20, 0 -30 Q 0 -34, 0 -30 Q 0 -22, 0 0 Z;
                             M 0 2 Q 0 -18, 0 -28 Q 0 -32, 0 -28 Q 0 -20, 0 0 Z"
                     dur="3s" repeatCount="indefinite"/>
          </path>
          
          <!-- Pétalo superior derecho -->
          <path d="M 7 2 Q 10 -16, 8 -26 Q 6 -30, 4 -26 Q 6 -18, 4 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M 7 2 Q 10 -16, 8 -26 Q 6 -30, 4 -26 Q 6 -18, 4 0 Z;
                             M 7 2 Q 11 -18, 9 -28 Q 7 -32, 5 -28 Q 7 -20, 4 0 Z;
                             M 7 2 Q 10 -16, 8 -26 Q 6 -30, 4 -26 Q 6 -18, 4 0 Z"
                     dur="3.5s" repeatCount="indefinite"/>
          </path>
          
          <!-- Pétalo superior extremo derecho -->
          <path d="M 14 2 Q 18 -12, 16 -22 Q 14 -26, 12 -22 Q 14 -14, 11 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M 14 2 Q 18 -12, 16 -22 Q 14 -26, 12 -22 Q 14 -14, 11 0 Z;
                             M 14 2 Q 19 -14, 17 -24 Q 15 -28, 13 -24 Q 15 -16, 11 0 Z;
                             M 14 2 Q 18 -12, 16 -22 Q 14 -26, 12 -22 Q 14 -14, 11 0 Z"
                     dur="4s" repeatCount="indefinite"/>
          </path>
        </g>
        
        <!-- PÉTALOS INFERIORES -->
        <g transform="translate(50, 58)">
          <!-- Pétalo inferior extremo izquierdo -->
          <path d="M -14 -2 Q -18 12, -16 22 Q -14 26, -12 22 Q -14 14, -11 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M -14 -2 Q -18 12, -16 22 Q -14 26, -12 22 Q -14 14, -11 0 Z;
                             M -14 -2 Q -19 14, -17 24 Q -15 28, -13 24 Q -15 16, -11 0 Z;
                             M -14 -2 Q -18 12, -16 22 Q -14 26, -12 22 Q -14 14, -11 0 Z"
                     dur="4s" repeatCount="indefinite"/>
          </path>
          
          <path d="M -7 -2 Q -10 16, -8 26 Q -6 30, -4 26 Q -6 18, -4 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M -7 -2 Q -10 16, -8 26 Q -6 30, -4 26 Q -6 18, -4 0 Z;
                             M -7 -2 Q -11 18, -9 28 Q -7 32, -5 28 Q -7 20, -4 0 Z;
                             M -7 -2 Q -10 16, -8 26 Q -6 30, -4 26 Q -6 18, -4 0 Z"
                     dur="3.5s" repeatCount="indefinite"/>
          </path>
          
          <path d="M 0 -2 Q 0 18, 0 28 Q 0 32, 0 28 Q 0 20, 0 0 Z" 
                fill="#e07575" 
                stroke="#8b2020" 
                stroke-width="1.3"
                opacity="0.98">
            <animate attributeName="d" 
                     values="M 0 -2 Q 0 18, 0 28 Q 0 32, 0 28 Q 0 20, 0 0 Z;
                             M 0 -2 Q 0 20, 0 30 Q 0 34, 0 30 Q 0 22, 0 0 Z;
                             M 0 -2 Q 0 18, 0 28 Q 0 32, 0 28 Q 0 20, 0 0 Z"
                     dur="3s" repeatCount="indefinite"/>
          </path>
          
          <path d="M 7 -2 Q 10 16, 8 26 Q 6 30, 4 26 Q 6 18, 4 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M 7 -2 Q 10 16, 8 26 Q 6 30, 4 26 Q 6 18, 4 0 Z;
                             M 7 -2 Q 11 18, 9 28 Q 7 32, 5 28 Q 7 20, 4 0 Z;
                             M 7 -2 Q 10 16, 8 26 Q 6 30, 4 26 Q 6 18, 4 0 Z"
                     dur="3.5s" repeatCount="indefinite"/>
          </path>
          
          <path d="M 14 -2 Q 18 12, 16 22 Q 14 26, 12 22 Q 14 14, 11 0 Z" 
                fill="url(#petalGradient)" 
                stroke="#7a2020" 
                stroke-width="1.2"
                opacity="0.95">
            <animate attributeName="d" 
                     values="M 14 -2 Q 18 12, 16 22 Q 14 26, 12 22 Q 14 14, 11 0 Z;
                             M 14 -2 Q 19 14, 17 24 Q 15 28, 13 24 Q 15 16, 11 0 Z;
                             M 14 -2 Q 18 12, 16 22 Q 14 26, 12 22 Q 14 14, 11 0 Z"
                     dur="4s" repeatCount="indefinite"/>
          </path>
        </g>
        
        <!-- Garganta profunda y aterradora -->
        <ellipse cx="50" cy="48" rx="12" ry="16" fill="#0a0000" opacity="0.98"/>
        <ellipse cx="50" cy="48" rx="9" ry="12" fill="#000000"/>
        <ellipse cx="50" cy="48" rx="5" ry="8" fill="#0a0000" opacity="0.5"/>
        
        <!-- Dientes irregulares y afilados -->
        <!-- Dientes superiores -->
        <polygon points="42,40 43,36 44,40" fill="#d4d4d4" opacity="0.95"/>
        <polygon points="46,37 47,33 48,37" fill="#e0e0e0" opacity="0.95"/>
        <polygon points="50,36 51,32 52,36" fill="#e8e8e8" opacity="0.98"/>
        <polygon points="54,37 55,33 56,37" fill="#e0e0e0" opacity="0.95"/>
        <polygon points="58,40 59,36 60,40" fill="#d4d4d4" opacity="0.95"/>
        
        <!-- Dientes inferiores -->
        <polygon points="42,56 43,60 44,56" fill="#d4d4d4" opacity="0.95"/>
        <polygon points="46,59 47,63 48,59" fill="#e0e0e0" opacity="0.95"/>
        <polygon points="50,60 51,64 52,60" fill="#e8e8e8" opacity="0.98"/>
        <polygon points="54,59 55,63 56,59" fill="#e0e0e0" opacity="0.95"/>
        <polygon points="58,56 59,60 60,56" fill="#d4d4d4" opacity="0.95"/>
        
        <!-- Venas/textura en pétalos -->
        <path d="M 35 35 Q 40 30, 45 35" stroke="#8b2020" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M 55 35 Q 60 30, 65 35" stroke="#8b2020" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M 35 61 Q 40 66, 45 61" stroke="#8b2020" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M 55 61 Q 60 66, 65 61" stroke="#8b2020" stroke-width="0.5" fill="none" opacity="0.4"/>
      </svg>
    `;
    
    // Emoji de flor estilizado como Demogorgon (rojo carmesí)
    const demogorgonEmoji = `<span class="demogorgon-emoji">🌸</span>`;
    
    banner.innerHTML = `
      ${demogorgonEmoji}
      <strong style="margin: 0 12px;">STRANGER THINGS TEMPORADA 5</strong> ya disponible en Netflix
      ${demogorgonEmoji}
    `;
    
    document.body.appendChild(banner);
  }

  // Crear partículas flotantes (esporas del Upside Down)
  function createParticles() {
    const container = document.createElement("div");
    container.className = "upside-down-particles";

    for (let i = 0; i < EVENT_CONFIG.particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Posición inicial aleatoria
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = 10 + Math.random() * 10 + "s";
      particle.style.animationDelay = Math.random() * 5 + "s";
      particle.style.setProperty("--drift", (Math.random() - 0.5) * 200 + "px");

      // Tamaño variable
      const size = 2 + Math.random() * 3;
      particle.style.width = size + "px";
      particle.style.height = size + "px";

      container.appendChild(particle);
    }

    document.body.appendChild(container);
    return container;
  }

  // Efecto de relámpagos - solo primer trueno para iniciar audio
  function createLightningEffect(isReload = false) {
    const lightning = document.createElement("div");
    lightning.className = "lightning-effect";
    document.body.appendChild(lightning);

    // Función para disparar el relámpago inicial
    function triggerFirstLightning() {
      // Verificar si seguimos en modo Upside Down
      if (!isUpsideDown) return;
      
      // Primer relámpago en el Hero (centro-superior) - MÁS CONTUNDENTE
      const x = 40 + Math.random() * 20; // 40%-60%
      const y = 20 + Math.random() * 20; // 20%-40%
      const intensity = 0.85; // Máxima intensidad

      lightning.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 50, 50, ${intensity}), rgba(200, 0, 0, ${intensity * 0.6}) 30%, transparent 60%)`;
      
      // Iniciar audio en loop
      playThunderSound();
      
      // Efecto de trueno MUCHO MÁS CONTUNDENTE
      // Flash inicial MUY brillante y largo
      lightning.style.opacity = intensity;
      
      setTimeout(() => {
        lightning.style.opacity = 0;
      }, 150);

      // Segundo flash - FUERTE
      setTimeout(() => {
        lightning.style.opacity = intensity * 0.75;
        setTimeout(() => {
          lightning.style.opacity = 0;
        }, 120);
      }, 180);

      // Tercer flash - INTENSO
      setTimeout(() => {
        lightning.style.opacity = intensity * 0.9;
        setTimeout(() => {
          lightning.style.opacity = 0;
        }, 100);
      }, 330);

      // Flash final - resplandor largo y visible
      setTimeout(() => {
        lightning.style.opacity = intensity * 0.5;
        setTimeout(() => {
          lightning.style.opacity = intensity * 0.25;
          setTimeout(() => {
            lightning.style.opacity = 0;
          }, 250);
        }, 180);
      }, 480);
    }

    // Si es recarga, disparar relámpago inmediatamente (500ms), si no, esperar 3 segundos
    const delay = isReload ? 500 : 3000;
    setTimeout(triggerFirstLightning, delay);
  }

  // Efecto glitch aleatorio en títulos
  function triggerRandomGlitch(forceHeroTitle = false) {
    // Verificar si seguimos en modo Upside Down
    if (!isUpsideDown) return;
    
    const titles = document.querySelectorAll("h1, h2, .hero-title");
    if (titles.length === 0) return;

    // Si forceHeroTitle es true, buscar específicamente el .hero-title
    let targetTitle;
    if (forceHeroTitle) {
      targetTitle = document.querySelector(".hero-title");
      if (!targetTitle) {
        targetTitle = titles[Math.floor(Math.random() * titles.length)];
      }
    } else {
      targetTitle = titles[Math.floor(Math.random() * titles.length)];
    }

    targetTitle.style.animation = "none";

    // Force reflow
    void targetTitle.offsetWidth;

    targetTitle.style.animation = "glitchText 0.3s ease-in-out";

    // Programar siguiente glitch - MÁS FRECUENTE
    const nextGlitch = 4000 + Math.random() * 6000; // 4-10 segundos
    setTimeout(triggerRandomGlitch, nextGlitch);
  }

  // Activar/desactivar Upside Down Mode
  function toggleUpsideDown() {
    const body = document.body;
    const portal = document.querySelector(".upside-down-portal");
    const tooltip = document.getElementById("portal-tooltip-text");

    // Transición épica
    body.classList.add("portal-transition");

    setTimeout(() => {
      body.classList.remove("portal-transition");
    }, 2000);

    // Toggle estado
    isUpsideDown = !isUpsideDown;
    localStorage.setItem(EVENT_CONFIG.localStorageKey, isUpsideDown);

    if (isUpsideDown) {
      // Entrar al Upside Down
      body.classList.add("upside-down-mode");
      if (tooltip) tooltip.textContent = "🏠 Volver al mundo normal";

      // Reproducir sonido de entrada
      playEnterUpsideDownSound();

      // DESACTIVAR EASTER EGGS - Bloquear eventos
      disableEasterEggs();

      // Crear partículas
      createParticles();

      // Crear efecto de relámpagos
      createLightningEffect();

      // Iniciar glitches aleatorios - PRIMER GLITCH EN HERO-TITLE (3 seg después de portal)
      setTimeout(() => triggerRandomGlitch(true), 5000);

      // Easter egg en consola
      console.log(
        "%c🌀 Has entrado al Upside Down...",
        "color: #ff0000; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #ff0000;"
      );
      console.log(
        "%c⚠️ Los Easter Eggs están desactivados en esta dimensión",
        "color: #ff6666; font-size: 14px;"
      );
    } else {
      // Volver al mundo normal
      body.classList.remove("upside-down-mode");
      if (tooltip) tooltip.textContent = "🌀 Entrar al Upside Down";

      // Reproducir sonido de regreso
      playReturnToNormalSound();
      
      // Detener audio de trueno
      stopThunderSound();

      // REACTIVAR EASTER EGGS
      enableEasterEggs();

      // Eliminar partículas
      const particles = document.querySelector(".upside-down-particles");
      if (particles) particles.remove();

      // Eliminar efecto de relámpagos
      const lightning = document.querySelector(".lightning-effect");
      if (lightning) lightning.remove();

      console.log(
        "%c🏠 Has vuelto al mundo normal",
        "color: #00ff00; font-size: 20px; font-weight: bold;"
      );
      console.log(
        "%c✅ Easter Eggs reactivados",
        "color: #66ff66; font-size: 14px;"
      );
    }
  }

  // Desactivar Easter Eggs (bloquear interacciones)
  function disableEasterEggs() {
    // Marcar que los Easter Eggs están desactivados
    document.body.setAttribute("data-easter-eggs-disabled", "true");
    console.log("⚠️ Easter Eggs desactivados en Upside Down");
  }

  // Reactivar Easter Eggs
  function enableEasterEggs() {
    document.body.removeAttribute("data-easter-eggs-disabled");
    console.log("✅ Easter Eggs reactivados");
  }

  // Inicializar cuando el DOM esté listo
  function init() {
    // Crear portal
    createPortal();

    // Crear banner
    createBanner();

    // Si ya estaba en modo Upside Down, restaurar estado
    if (isUpsideDown) {
      document.body.classList.add("upside-down-mode");
      createParticles();
      
      // Crear efectos de relámpago (esto dispara el audio) con tiempo reducido para recarga
      createLightningEffect(true); // Pasar flag de recarga
      setTimeout(() => triggerRandomGlitch(true), 5000);
      
      // Configurar listeners para iniciar audio - solo click/tecla/touch (únicos que Chrome acepta)
      document.addEventListener('click', enableAudioOnInteraction, { once: true });
      document.addEventListener('keydown', enableAudioOnInteraction, { once: true });
      document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });
      
      // IMPORTANTE: Reactivar el bloqueo de Easter Eggs
      disableEasterEggs();
    }

    // Mensaje en consola
    console.log(
      "%c🎬 STRANGER THINGS EVENT ACTIVO",
      "color: #ff0000; font-size: 16px; font-weight: bold; background: #000; padding: 10px; border: 2px solid #ff0000;"
    );
    console.log("🌀 Click en el portal flotante para entrar al Upside Down");
    console.log("📅 Evento disponible hasta el 1 de enero de 2026");
  }

  // Esperar a que el DOM esté completamente cargado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Limpiar cuando termine el evento (auto-desactivar el 1 de enero)
  function checkEventEnd() {
    if (!isEventActive() && isUpsideDown) {
      document.body.classList.remove("upside-down-mode");
      document.body.style.paddingTop = "0";
      localStorage.removeItem(EVENT_CONFIG.localStorageKey);

      const portal = document.querySelector(".upside-down-portal");
      const banner = document.querySelector(".stranger-things-banner");
      const particles = document.querySelector(".upside-down-particles");

      if (portal) portal.remove();
      if (banner) banner.remove();
      if (particles) particles.remove();

      console.log("🎬 Stranger Things event ha finalizado");
    }
  }

  // Verificar al cargar y cada hora
  checkEventEnd();
  setInterval(checkEventEnd, 3600000); // 1 hora
})();
