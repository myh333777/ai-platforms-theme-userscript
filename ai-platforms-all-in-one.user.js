// ==UserScript==
// @name         AI全平台视觉瘦身、18套主题与品牌伪装 (ChatGPT / Gemini / NotebookLM / AI Studio / Antigravity)
// @namespace    https://tampermonkey.net/
// @version      6.3.0
// @description  五站合一全能版 v6.3.0：新增 Antigravity (antigravity.google.com) 深度视觉瘦身、表格/代码块/气泡适配与品牌伪装；回归官方 CDN/Favicon 纯净轻量链接，支持 18 套双模式主题与自适应黄金排版。
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://gemini.google.com/*
// @match        https://notebook.google.com/*
// @match        https://aistudio.google.com/*
// @match        https://antigravity.google.com/*
// @match        https://antigravity.static.usercontent.goog/*
// @icon         https://www.deepseek.com/favicon.ico
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/myh333777/ai-platforms-theme-userscript/main/ai-platforms-all-in-one.user.js
// @downloadURL  https://raw.githubusercontent.com/myh333777/ai-platforms-theme-userscript/main/ai-platforms-all-in-one.user.js
// ==/UserScript==

(() => {
  'use strict';

  /* =========================================================
     0. 当前站点自动识别与独立配置空间
     ========================================================= */
  const HOST = location.hostname.toLowerCase();
  const SITE_KEY = HOST.includes('notebook.google.com')
    ? 'notebooklm'
    : HOST.includes('aistudio.google.com')
      ? 'aistudio'
      : HOST.includes('antigravity.google.com') || HOST.includes('antigravity.static.usercontent.goog')
        ? 'antigravity'
        : HOST.includes('gemini.google.com')
          ? 'gemini'
          : 'chatgpt';

  const SITE_META = {
    chatgpt:     { label: 'ChatGPT',     nativeName: 'ChatGPT (原生)',     storageKey: 'ai_unified_prefs_v60_chatgpt',     legacyKeys: ['chatgpt_editorial_layout_prefs_v50'] },
    gemini:      { label: 'Gemini',      nativeName: 'Gemini (原生)',      storageKey: 'ai_unified_prefs_v60_gemini',      legacyKeys: ['gemini_editorial_layout_prefs_v31'] },
    notebooklm:  { label: 'NotebookLM',  nativeName: 'NotebookLM (原生)',  storageKey: 'ai_unified_prefs_v60_notebooklm',  legacyKeys: ['nlm_editorial_layout_prefs_v10'] },
    aistudio:    { label: 'AI Studio',   nativeName: 'AI Studio (原生)',   storageKey: 'ai_unified_prefs_v60_aistudio',    legacyKeys: ['ais_editorial_layout_prefs_v10'] },
    antigravity: { label: 'Antigravity', nativeName: 'Antigravity (原生)', storageKey: 'ai_unified_prefs_v60_antigravity', legacyKeys: [] }
  };

  const CURRENT_SITE = SITE_META[SITE_KEY];
  const LAYOUT_STYLE_ID = 'ai-unified-compact-style';
  const BRAND_STYLE_ID = 'ai-unified-brand-style';
  const PANEL_HOST_ID = 'ai-unified-tuner-host';
  const SIDEBAR_MARK = 'data-aiu-sidebar-brand';
  const HEADER_MARK = 'data-aiu-header-brand';

  /* =========================================================
     1. 字体、表格密度、比例预设、品牌库与 18 套双模式主题库
     ========================================================= */
  const FONT_STACKS = {
    sans: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono21: '"Maple Mono NF CN", "Sarasa Gothic SC", "PingFang SC", monospace',
    serif: '"Songti SC", "STSong", "Hiragino Mincho ProN", Georgia, serif'
  };

  const TABLE_DENSITIES = {
    compact: { fontRatio: 0.88, lh: 1.46, padY: '6px',  padX: '10px' },
    normal:  { fontRatio: 0.92, lh: 1.60, padY: '9px',  padX: '14px' },
    relaxed: { fontRatio: 0.96, lh: 1.72, padY: '12px', padX: '17px' }
  };

  const SCALE_PRESETS = {
    compact: { globalScale: 0.90, fontSize: 14.5, lineHeight: 1.48, paraGap: 8,  letterSpacing: 0.012 },
    comfort: { globalScale: 0.94, fontSize: 15.5, lineHeight: 1.49, paraGap: 9,  letterSpacing: 0.015 },
    relaxed: { globalScale: 1.05, fontSize: 17.0, lineHeight: 1.72, paraGap: 12, letterSpacing: 0.018 },
    large:   { globalScale: 1.15, fontSize: 18.5, lineHeight: 1.85, paraGap: 16, letterSpacing: 0.022 }
  };

  const BRAND_PRESETS = Object.freeze({
    deepseek: {
      name: 'DeepSeek',
      icon: 'https://www.deepseek.com/favicon.ico',
      color: '#4d6bfe',
      iconType: 'image/x-icon'
    },
    kimi: {
      name: 'Kimi',
      icon: 'https://www.kimi.com/favicon.ico',
      color: '#7656df',
      iconType: 'image/x-icon'
    },
    doubao: {
      name: '豆包',
      icon: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/new-doubao/128x128.png',
      color: '#5264fb',
      iconType: 'image/png'
    },
    original: {
      name: CURRENT_SITE.nativeName
    }
  });

  function buildThemeVars(cfg, isDark) {
    const isHigh = cfg.tier === 'high';
    const isMid = cfg.tier === 'mid';
    const strongBgAlpha = isHigh ? (isDark ? 0.36 : 0.48) : isMid ? (isDark ? 0.28 : 0.34) : (isDark ? 0.22 : 0.26);

    return {
      '--g-body-color': cfg.body,
      '--g-heading-shadow': isHigh
        ? (isDark ? '0 3px 10px -2px rgba(0, 0, 0, 0.55)' : '0 3px 9px -2px rgba(15, 23, 42, 0.13)')
        : 'none',
      '--g-quote-shadow': isHigh
        ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.45)' : '0 2px 7px rgba(15, 23, 42, 0.08)')
        : 'none',
      '--g-badge-shadow': isHigh ? '0 1px 3px rgba(0, 0, 0, 0.18)' : 'none',

      '--g-h1-color': cfg.h1[0],
      '--g-h1-bg': cfg.h1[1],
      '--g-h1-border': cfg.h1[2],
      '--g-h1-outline': cfg.h1[3],

      '--g-h2-color': cfg.h2[0],
      '--g-h2-bg': cfg.h2[1],
      '--g-h2-border': cfg.h2[2],
      '--g-h2-outline': cfg.h2[3],

      '--g-h3-color': cfg.h3[0],
      '--g-h3-bg': cfg.h3[1],
      '--g-h3-border': cfg.h3[2],
      '--g-h3-badge-bg': isHigh ? cfg.h3[2] : cfg.h3[3],
      '--g-h3-badge-text': isHigh ? '#ffffff' : cfg.h3[0],

      '--g-h4-color': cfg.h4[0],
      '--g-h4-border': cfg.h4[1],

      '--g-strong-color': cfg.strongText,
      '--g-strong-bg': `rgba(${cfg.strongRgb}, ${strongBgAlpha})`,
      '--g-strong-mint-bg': cfg.strongMint[0],
      '--g-strong-mint-color': cfg.strongMint[1],

      '--g-quote-bg': cfg.quote[0],
      '--g-quote-border': cfg.quote[1],
      '--g-quote-text': cfg.quote[2],

      '--g-ol-badge-bg': isHigh ? cfg.ol[2] : cfg.ol[0],
      '--g-ol-badge-text': isHigh ? (cfg.olSolidText || '#ffffff') : cfg.ol[1],
      '--g-ol-badge-border': isHigh ? cfg.ol[2] : cfg.ol[3],
      '--g-ol-sub-bg': cfg.ol[0],
      '--g-ol-sub-text': cfg.ol[1],
      '--g-ul-bullet': cfg.ul[0],
      '--g-ul-sub-bullet': cfg.ul[1],

      '--g-tbl-head-bg': cfg.tbl[0],
      '--g-tbl-head-text': cfg.tbl[1],
      '--g-tbl-head-line': cfg.tbl[2],
      '--g-tbl-text': cfg.tbl[3],
      '--g-tbl-stripe-bg': cfg.tbl[4],
      '--g-tbl-hover-bg': cfg.tbl[5],
      '--g-tbl-border': cfg.tbl[6],

      '--g-code-bg': isDark ? '#161B22' : (cfg.codeBg || '#F7F8FA'),
      '--g-code-header-bg': isDark ? '#1F2630' : (cfg.codeHeadBg || '#ECEFF4'),
      '--g-code-header-text': isDark ? '#94A3B8' : '#4A5568',
      '--g-code-text': isDark ? '#E6EDF3' : '#1F2937',
      '--g-code-border': isDark ? 'rgba(240, 246, 252, 0.16)' : (cfg.codeBorder || '#D8DEE9'),
      '--g-code-token-filter': isDark ? 'none' : 'brightness(0.75) contrast(1.18) saturate(1.18)',

      '--g-inline-code-bg': cfg.inlineCode[0],
      '--g-inline-code-text': cfg.inlineCode[1],
      '--g-inline-code-border': cfg.inlineCode[2],

      '--g-link-color': cfg.link[0],
      '--g-link-hover-bg': cfg.link[1],
      '--g-link-underline': cfg.link[2],
      '--g-hr-color': isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(100, 116, 139, 0.24)',

      '--g-cite-bg': isDark ? 'rgba(56, 189, 248, 0.16)' : cfg.ol[0],
      '--g-cite-text': isDark ? '#7DD3FC' : cfg.ol[1],
      '--g-cite-border': isDark ? 'rgba(56, 189, 248, 0.34)' : cfg.ol[3],

      '--g-elicit-bg': isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(244, 247, 250, 0.82)',
      '--g-elicit-border': isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(148, 163, 184, 0.38)',
      '--g-elicit-title': isDark ? '#94A3B8' : '#475569',
      '--g-elicit-item-bg': isDark ? 'rgba(30, 41, 59, 0.65)' : '#FFFFFF',
      '--g-elicit-item-border': isDark ? 'rgba(148, 163, 184, 0.26)' : '#D6E0EB',
      '--g-elicit-item-text': isDark ? '#E2E8F0' : '#24303F',
      '--g-elicit-item-hover-bg': cfg.link[1],
      '--g-elicit-item-hover-border': cfg.link[0],
      '--g-elicit-icon': cfg.link[0]
    };
  }

  const THEMES = {
    // === 两大新增定制主题 ===
    'scholar-ink': {
      name: '墨韵研读 ★', tier: 'mid', dot: '#1B4965', dot2: '#2D6A4F',
      light: {
        tier: 'mid', body: '#1F2933',
        h1: ['#1B4965', 'linear-gradient(135deg, rgba(27,73,101,0.11), rgba(45,106,79,0.03))', '#1B4965', 'rgba(27,73,101,0.20)'],
        h2: ['#1E5631', 'linear-gradient(90deg, rgba(45,106,79,0.095), rgba(45,106,79,0.02))', '#2D6A4F', 'rgba(45,106,79,0.18)'],
        h3: ['#8C4A19', 'rgba(180,95,32,0.06)', '#B45F20', 'rgba(180,95,32,0.16)'],
        h4: ['#4A4E69', '#6B708E'],
        strongText: '#102A43', strongRgb: '217, 168, 78', strongMint: ['rgba(45,106,79,0.13)', '#1B4332'],
        quote: ['#F8F6F0', '#B08236', '#4A3714'],
        ol: ['rgba(27,73,101,0.12)', '#1B4965', '#1B4965', 'rgba(27,73,101,0.26)'],
        ul: ['#2D6A4F', '#B08236'],
        tbl: ['#E8F0F4', '#163A50', '#BDD0DC', '#243B53', '#F9FBFD', '#EFF5F8', '#D3E0E8'],
        inlineCode: ['#F4F2ED', '#8E352E', '#E2DDD2'],
        link: ['#1B4965', '#E6F0F5', 'rgba(27,73,101,0.38)']
      },
      dark: {
        tier: 'mid', body: '#E4E9EF',
        h1: ['#8ECAE6', 'linear-gradient(135deg, rgba(142,202,230,0.18), rgba(45,106,79,0.05))', '#5FA8D3', 'rgba(142,202,230,0.22)'],
        h2: ['#80ED99', 'linear-gradient(90deg, rgba(82,183,136,0.15), rgba(82,183,136,0.03))', '#52B788', 'rgba(82,183,136,0.20)'],
        h3: ['#F4A261', 'rgba(244,162,97,0.11)', '#E76F51', 'rgba(244,162,97,0.22)'],
        h4: ['#BDB2FF', '#9D8DF1'],
        strongText: '#F8FAFC', strongRgb: '233, 196, 106', strongMint: ['rgba(82,183,136,0.20)', '#B7E4C7'],
        quote: ['rgba(233,196,106,0.12)', '#E9C46A', '#FAEDCD'],
        ol: ['rgba(95,168,211,0.20)', '#BEE9E8', '#3D8BAE', 'rgba(142,202,230,0.32)'],
        ul: ['#52B788', '#E9C46A'],
        tbl: ['#1A2B38', '#D8EEF8', '#2E4A60', '#D3DCE6', 'rgba(255,255,255,0.03)', 'rgba(95,168,211,0.13)', 'rgba(255,255,255,0.14)'],
        inlineCode: ['rgba(255,255,255,0.08)', '#F4A261', 'rgba(255,255,255,0.15)'],
        link: ['#8ECAE6', 'rgba(142,202,230,0.14)', 'rgba(142,202,230,0.38)']
      }
    },
    'studio-slate': {
      name: '极客冷萃 ★', tier: 'mid', dot: '#0E7490', dot2: '#1E293B',
      light: {
        tier: 'mid', body: '#1E293B',
        h1: ['#0F172A', 'linear-gradient(135deg, rgba(14,116,144,0.12), rgba(30,41,59,0.03))', '#0E7490', 'rgba(14,116,144,0.22)'],
        h2: ['#0E7490', 'linear-gradient(90deg, rgba(6,182,212,0.10), rgba(6,182,212,0.02))', '#0891B2', 'rgba(8,145,178,0.18)'],
        h3: ['#4338CA', 'rgba(79,70,229,0.065)', '#4F46E5', 'rgba(79,70,229,0.16)'],
        h4: ['#334155', '#64748B'],
        strongText: '#090D16', strongRgb: '56, 189, 248', strongMint: ['rgba(14,116,144,0.12)', '#164E63'],
        quote: ['#F1F5F9', '#0891B2', '#1E293B'],
        ol: ['rgba(14,116,144,0.13)', '#164E63', '#0E7490', 'rgba(14,116,144,0.28)'],
        ul: ['#0891B2', '#4F46E5'],
        tbl: ['#E2E8F0', '#0F172A', '#94A3B8', '#1E293B', '#F8FAFC', '#ECFEFF', '#CBD5E1'],
        inlineCode: ['#ECFEFF', '#0E7490', '#A5F3FC'],
        link: ['#0369A1', '#E0F2FE', 'rgba(3,105,161,0.38)']
      },
      dark: {
        tier: 'mid', body: '#E2E8F0',
        h1: ['#67E8F9', 'linear-gradient(135deg, rgba(6,182,212,0.20), rgba(14,116,144,0.05))', '#22D3EE', 'rgba(34,211,238,0.24)'],
        h2: ['#93C5FD', 'linear-gradient(90deg, rgba(59,130,246,0.16), rgba(59,130,246,0.03))', '#60A5FA', 'rgba(96,165,250,0.20)'],
        h3: ['#C4B5FD', 'rgba(139,92,246,0.12)', '#A78BFA', 'rgba(167,139,250,0.22)'],
        h4: ['#94A3B8', '#64748B'],
        strongText: '#F8FAFC', strongRgb: '34, 211, 238', strongMint: ['rgba(6,182,212,0.22)', '#CFFAFE'],
        quote: ['rgba(34,211,238,0.11)', '#22D3EE', '#CFFAFE'],
        ol: ['rgba(34,211,238,0.20)', '#CFFAFE', '#0891B2', 'rgba(34,211,238,0.34)'],
        ul: ['#22D3EE', '#A78BFA'],
        tbl: ['#1E293B', '#E0F2FE', '#334155', '#CBD5E1', 'rgba(255,255,255,0.03)', 'rgba(34,211,238,0.12)', 'rgba(255,255,255,0.14)'],
        inlineCode: ['rgba(34,211,238,0.14)', '#67E8F9', 'rgba(34,211,238,0.24)'],
        link: ['#38BDF8', 'rgba(56,189,248,0.14)', 'rgba(56,189,248,0.40)']
      }
    },

    // === Tier 1: 低对比 · 轻盈护眼 ===
    sage: {
      name: '雅绿清透', tier: 'low', dot: '#1E7A5B', dot2: '#EAF1FA',
      light: {
        tier: 'low', body: '#242B33',
        h1: ['#1E3A5F', 'linear-gradient(135deg, rgba(59,111,168,0.085), rgba(59,111,168,0.02))', '#3B6FA8', 'rgba(59,111,168,0.14)'],
        h2: ['#15533E', 'linear-gradient(90deg, rgba(30,122,91,0.075), rgba(30,122,91,0.015))', '#1E7A5B', 'rgba(30,122,91,0.12)'],
        h3: ['#8F431A', 'rgba(194,98,44,0.045)', '#C86D3B', 'rgba(200,109,59,0.14)'],
        h4: ['#5B3E7A', '#8B6BB1'],
        strongText: '#12202E', strongRgb: '230, 175, 65', strongMint: ['rgba(30,122,91,0.10)', '#124534'],
        quote: ['#FAF7F0', '#C89038', '#5C4318'],
        ol: ['rgba(59,111,168,0.11)', '#1E3A5F', '#3B6FA8', 'rgba(59,111,168,0.24)'],
        ul: ['#2E8B6B', '#C28430'],
        tbl: ['#EAF1FA', '#1B3B66', '#C5D7EE', '#2D3748', '#F9FBFD', '#F2F7FC', '#DCE5F0'],
        inlineCode: ['#F6F4F1', '#9B3B3B', '#E6E1DA'],
        link: ['#2B5B84', '#EEF4FA', 'rgba(43,91,132,0.34)']
      },
      dark: {
        tier: 'low', body: '#E2E8F0',
        h1: ['#9EC5FE', 'linear-gradient(135deg, rgba(96,165,250,0.14), rgba(59,130,246,0.04))', '#60A5FA', 'rgba(96,165,250,0.16)'],
        h2: ['#7EE2B8', 'linear-gradient(90deg, rgba(52,211,153,0.12), rgba(16,185,129,0.025))', '#34D399', 'rgba(52,211,153,0.14)'],
        h3: ['#FDBA74', 'rgba(251,146,60,0.09)', '#FB923C', 'rgba(251,146,60,0.20)'],
        h4: ['#D8B4FE', '#C084FC'],
        strongText: '#F8FAFC', strongRgb: '234, 179, 8', strongMint: ['rgba(52,211,153,0.16)', '#A7F3D0'],
        quote: ['rgba(217,119,6,0.11)', '#E5A93C', '#FDE68A'],
        ol: ['rgba(96,165,250,0.18)', '#BFDBFE', '#3B82F6', 'rgba(96,165,250,0.28)'],
        ul: ['#4ADE80', '#FBBF24'],
        tbl: ['#1E2C42', '#DBEAFE', '#334A6E', '#CBD5E1', 'rgba(255,255,255,0.025)', 'rgba(96,165,250,0.09)', 'rgba(255,255,255,0.12)'],
        inlineCode: ['rgba(255,255,255,0.08)', '#FCA5A5', 'rgba(255,255,255,0.13)'],
        link: ['#7DD3FC', 'rgba(125,211,252,0.12)', 'rgba(125,211,252,0.35)']
      }
    },
    warm: {
      name: '暖纸柔护', tier: 'low', dot: '#A67238', dot2: '#F3EDE2',
      light: {
        tier: 'low', body: '#302922',
        h1: ['#3F522B', 'linear-gradient(135deg, rgba(96,125,59,0.09), rgba(96,125,59,0.02))', '#607D3B', 'rgba(96,125,59,0.14)'],
        h2: ['#6B4925', 'linear-gradient(90deg, rgba(166,114,56,0.09), rgba(166,114,56,0.02))', '#A67238', 'rgba(166,114,56,0.14)'],
        h3: ['#8C412E', 'rgba(176,82,58,0.05)', '#B0523A', 'rgba(176,82,58,0.14)'],
        h4: ['#6B4D57', '#9E7682'],
        strongText: '#2A1F14', strongRgb: '217, 159, 64', strongMint: ['rgba(96,125,59,0.12)', '#33461E'],
        quote: ['#FAF6EC', '#C48A3A', '#5E421B'],
        ol: ['rgba(166,114,56,0.11)', '#6B4925', '#A67238', 'rgba(166,114,56,0.25)'],
        ul: ['#607D3B', '#B0523A'],
        tbl: ['#F3EDE2', '#4D3B26', '#DDD2C0', '#383028', '#FCF9F4', '#F6F0E6', '#E6DDD0'],
        inlineCode: ['#F5EFE6', '#8E3E2E', '#E5DACB'],
        link: ['#7B5427', '#F6EFE4', 'rgba(123,84,39,0.35)']
      },
      dark: {
        tier: 'low', body: '#E7E0D6',
        h1: ['#C2D99B', 'linear-gradient(135deg, rgba(163,190,120,0.13), rgba(163,190,120,0.03))', '#A3BE78', 'rgba(163,190,120,0.16)'],
        h2: ['#E6C494', 'linear-gradient(90deg, rgba(217,167,102,0.12), rgba(217,167,102,0.025))', '#D9A766', 'rgba(217,167,102,0.15)'],
        h3: ['#F2A993', 'rgba(224,129,103,0.09)', '#E08167', 'rgba(224,129,103,0.22)'],
        h4: ['#D9B8C4', '#B58999'],
        strongText: '#FFF8EB', strongRgb: '217, 167, 102', strongMint: ['rgba(163,190,120,0.16)', '#CBE2A6'],
        quote: ['rgba(217,167,102,0.11)', '#D9A766', '#F3D9B1'],
        ol: ['rgba(217,167,102,0.16)', '#E6C494', '#C48A3A', 'rgba(217,167,102,0.26)'],
        ul: ['#A3BE78', '#E08167'],
        tbl: ['#2C261F', '#E6D8C3', '#4B4033', '#D6CEC2', 'rgba(255,248,235,0.025)', 'rgba(217,167,102,0.10)', 'rgba(255,244,224,0.13)'],
        inlineCode: ['rgba(255,244,224,0.08)', '#F2A993', 'rgba(255,244,224,0.14)'],
        link: ['#E5BA7E', 'rgba(229,186,126,0.12)', 'rgba(229,186,126,0.35)']
      }
    },
    ocean: {
      name: '静谧蓝灰', tier: 'low', dot: '#3182A8', dot2: '#EBF3F9',
      light: {
        tier: 'low', body: '#232C36',
        h1: ['#1A365D', 'linear-gradient(135deg, rgba(43,108,176,0.09), rgba(43,108,176,0.02))', '#2B6CB0', 'rgba(43,108,176,0.14)'],
        h2: ['#234E68', 'linear-gradient(90deg, rgba(49,130,168,0.08), rgba(49,130,168,0.015))', '#3182A8', 'rgba(49,130,168,0.13)'],
        h3: ['#3C4F76', 'rgba(76,98,145,0.055)', '#556D9E', 'rgba(85,109,158,0.14)'],
        h4: ['#4A5568', '#718096'],
        strongText: '#0F2236', strongRgb: '147, 197, 253', strongMint: ['rgba(49,130,168,0.10)', '#1D4660'],
        quote: ['#F3F7FB', '#4A7BA7', '#2A4365'],
        ol: ['rgba(43,108,176,0.10)', '#1A365D', '#2B6CB0', 'rgba(43,108,176,0.22)'],
        ul: ['#3182A8', '#718096'],
        tbl: ['#EBF2FA', '#1E3A5F', '#C7D8EB', '#2D3748', '#F8FAFD', '#F0F6FC', '#DAE4F0'],
        inlineCode: ['#F2F5F8', '#3B5998', '#DEE5EE'],
        link: ['#2B6CB0', '#EBF4FC', 'rgba(43,108,176,0.34)']
      },
      dark: {
        tier: 'low', body: '#DCE6F2',
        h1: ['#90CDF4', 'linear-gradient(135deg, rgba(99,179,237,0.14), rgba(99,179,237,0.03))', '#63B3ED', 'rgba(99,179,237,0.16)'],
        h2: ['#81E6D9', 'linear-gradient(90deg, rgba(79,209,197,0.12), rgba(79,209,197,0.02))', '#4FD1C5', 'rgba(79,209,197,0.15)'],
        h3: ['#B7C9EE', 'rgba(129,161,218,0.10)', '#7F9CF5', 'rgba(127,156,245,0.20)'],
        h4: ['#CBD5E1', '#94A3B8'],
        strongText: '#F0F9FF', strongRgb: '99, 179, 237', strongMint: ['rgba(79,209,197,0.16)', '#9CF0E5'],
        quote: ['rgba(66,153,225,0.10)', '#63B3ED', '#BEE3F8'],
        ol: ['rgba(99,179,237,0.18)', '#BEE3F8', '#4299E1', 'rgba(99,179,237,0.28)'],
        ul: ['#4FD1C5', '#90CDF4'],
        tbl: ['#1C2B3D', '#CFE5FA', '#2E4766', '#CBD5E1', 'rgba(255,255,255,0.025)', 'rgba(99,179,237,0.10)', 'rgba(255,255,255,0.12)'],
        inlineCode: ['rgba(148,163,184,0.14)', '#90CDF4', 'rgba(148,163,184,0.20)'],
        link: ['#63B3ED', 'rgba(99,179,237,0.12)', 'rgba(99,179,237,0.35)']
      }
    },
    lavender: {
      name: '暮紫薄雾', tier: 'low', dot: '#7A5EA8', dot2: '#F3EFFA',
      light: {
        tier: 'low', body: '#2B2733',
        h1: ['#4A3570', 'linear-gradient(135deg, rgba(122,94,168,0.09), rgba(122,94,168,0.02))', '#7A5EA8', 'rgba(122,94,168,0.15)'],
        h2: ['#2A6068', 'linear-gradient(90deg, rgba(56,128,138,0.08), rgba(56,128,138,0.015))', '#38808A', 'rgba(56,128,138,0.13)'],
        h3: ['#85496E', 'rgba(166,92,138,0.055)', '#A65C8A', 'rgba(166,92,138,0.14)'],
        h4: ['#5D5473', '#8E82AA'],
        strongText: '#1F182B', strongRgb: '196, 181, 253', strongMint: ['rgba(56,128,138,0.11)', '#1E4C53'],
        quote: ['#F7F4FC', '#8B6BB1', '#4A3570'],
        ol: ['rgba(122,94,168,0.11)', '#4A3570', '#7A5EA8', 'rgba(122,94,168,0.24)'],
        ul: ['#38808A', '#A65C8A'],
        tbl: ['#F1EDF8', '#443266', '#D5CAE8', '#332E3D', '#FAF8FD', '#F4EFFA', '#E3DCF0'],
        inlineCode: ['#F6F2F8', '#833B74', '#E5DCE9'],
        link: ['#684B99', '#F3EFFA', 'rgba(104,75,153,0.34)']
      },
      dark: {
        tier: 'low', body: '#E5E0EE',
        h1: ['#C9B6F2', 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.03))', '#A78BFA', 'rgba(167,139,250,0.18)'],
        h2: ['#8DE0EB', 'linear-gradient(90deg, rgba(103,232,249,0.11), rgba(103,232,249,0.02))', '#67E8F9', 'rgba(103,232,249,0.15)'],
        h3: ['#F0ABCE', 'rgba(244,114,182,0.09)', '#F472B6', 'rgba(244,114,182,0.20)'],
        h4: ['#C4B5FD', '#A78BFA'],
        strongText: '#FAF5FF', strongRgb: '167, 139, 250', strongMint: ['rgba(103,232,249,0.15)', '#A5F3FC'],
        quote: ['rgba(167,139,250,0.11)', '#A78BFA', '#DDD6FE'],
        ol: ['rgba(167,139,250,0.18)', '#DDD6FE', '#8B5CF6', 'rgba(167,139,250,0.28)'],
        ul: ['#67E8F9', '#F472B6'],
        tbl: ['#272236', '#DDD6FE', '#42395C', '#D8D2E5', 'rgba(255,255,255,0.025)', 'rgba(167,139,250,0.11)', 'rgba(255,255,255,0.12)'],
        inlineCode: ['rgba(255,255,255,0.08)', '#F9A8D4', 'rgba(255,255,255,0.14)'],
        link: ['#C4B5FD', 'rgba(196,181,253,0.12)', 'rgba(196,181,253,0.35)']
      }
    },
    minimal: {
      name: '素雅极简', tier: 'low', dot: '#525252', dot2: '#F3F4F6',
      light: {
        tier: 'low', body: '#262626',
        h1: ['#171717', '#F5F5F5', '#404040', '#E5E5E5'],
        h2: ['#262626', '#F8F8F8', '#737373', '#EAEAEA'],
        h3: ['#404040', '#FAFAFA', '#A3A3A3', '#E5E5E5'],
        h4: ['#525252', '#D4D4D4'],
        strongText: '#0A0A0A', strongRgb: '0, 0, 0', strongMint: ['#F0F0F0', '#171717'],
        quote: ['#F8F8F8', '#A3A3A3', '#404040'],
        ol: ['#F0F0F0', '#262626', '#525252', '#D4D4D4'],
        ul: ['#525252', '#A3A3A3'],
        tbl: ['#F3F4F6', '#1F2937', '#D1D5DB', '#374151', '#FAFAFA', '#F3F4F6', '#E5E7EB'],
        inlineCode: ['#F3F4F6', '#374151', '#E5E7EB'],
        link: ['#374151', '#F3F4F6', 'rgba(55,65,81,0.35)']
      },
      dark: {
        tier: 'low', body: '#E5E5E5',
        h1: ['#F5F5F5', 'rgba(255,255,255,0.06)', '#A3A3A3', 'rgba(255,255,255,0.12)'],
        h2: ['#E5E5E5', 'rgba(255,255,255,0.04)', '#737373', 'rgba(255,255,255,0.09)'],
        h3: ['#D4D4D4', 'rgba(255,255,255,0.025)', '#525252', 'rgba(255,255,255,0.12)'],
        h4: ['#A3A3A3', '#525252'],
        strongText: '#FFFFFF', strongRgb: '255, 255, 255', strongMint: ['rgba(255,255,255,0.12)', '#F5F5F5'],
        quote: ['rgba(255,255,255,0.04)', '#737373', '#D4D4D4'],
        ol: ['rgba(255,255,255,0.10)', '#E5E5E5', '#737373', 'rgba(255,255,255,0.18)'],
        ul: ['#A3A3A3', '#737373'],
        tbl: ['#262626', '#F5F5F5', '#404040', '#D4D4D4', 'rgba(255,255,255,0.025)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.12)'],
        inlineCode: ['rgba(255,255,255,0.08)', '#D4D4D4', 'rgba(255,255,255,0.14)'],
        link: ['#D4D4D4', 'rgba(255,255,255,0.08)', 'rgba(212,212,212,0.35)']
      }
    },

    // === Tier 2: 中对比 · 结构分明 ===
    forest: {
      name: '苍翠森语', tier: 'mid', dot: '#047857', dot2: '#0F4C5C',
      light: {
        tier: 'mid', body: '#1C242B',
        h1: ['#0F4C5C', 'linear-gradient(135deg, rgba(15,76,92,0.12), rgba(15,76,92,0.03))', '#0F4C5C', 'rgba(15,76,92,0.20)'],
        h2: ['#065F46', 'linear-gradient(90deg, rgba(5,150,105,0.11), rgba(5,150,105,0.02))', '#059669', 'rgba(5,150,105,0.18)'],
        h3: ['#92400E', 'rgba(217,119,6,0.07)', '#D97706', 'rgba(217,119,6,0.18)'],
        h4: ['#115E59', '#0D9488'],
        strongText: '#0B2E22', strongRgb: '16, 185, 129', strongMint: ['rgba(5,150,105,0.14)', '#064E3B'],
        quote: ['#F0FDF4', '#059669', '#064E3B'],
        ol: ['rgba(15,118,110,0.14)', '#115E59', '#0F766E', 'rgba(15,118,110,0.30)'],
        ul: ['#059669', '#D97706'],
        tbl: ['#E2F0EC', '#0F4C3A', '#A7D7C5', '#1F2937', '#F7FBF9', '#ECFDF5', '#CBE4DA'],
        inlineCode: ['#ECFDF5', '#047857', '#C7E8DB'],
        link: ['#0F766E', '#E6F7F4', 'rgba(15,118,110,0.40)']
      },
      dark: {
        tier: 'mid', body: '#E6F0EC',
        h1: ['#5EEAD4', 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(20,184,166,0.05))', '#2DD4BF', 'rgba(45,212,191,0.22)'],
        h2: ['#6EE7B7', 'linear-gradient(90deg, rgba(16,185,129,0.16), rgba(16,185,129,0.04))', '#10B981', 'rgba(16,185,129,0.20)'],
        h3: ['#FCD34D', 'rgba(245,158,11,0.12)', '#F59E0B', 'rgba(245,158,11,0.24)'],
        h4: ['#99F6E4', '#14B8A6'],
        strongText: '#ECFDF5', strongRgb: '52, 211, 153', strongMint: ['rgba(16,185,129,0.22)', '#A7F3D0'],
        quote: ['rgba(16,185,129,0.12)', '#10B981', '#A7F3D0'],
        ol: ['rgba(20,184,166,0.22)', '#99F6E4', '#14B8A6', 'rgba(45,212,191,0.34)'],
        ul: ['#34D399', '#FBBF24'],
        tbl: ['#16302B', '#A7F3D0', '#234E45', '#D1DFDA', 'rgba(255,255,255,0.03)', 'rgba(16,185,129,0.12)', 'rgba(255,255,255,0.14)'],
        inlineCode: ['rgba(16,185,129,0.14)', '#6EE7B7', 'rgba(52,211,153,0.22)'],
        link: ['#5EEAD4', 'rgba(94,234,212,0.12)', 'rgba(94,234,212,0.38)']
      }
    },
    indigo: {
      name: '学院靛蓝', tier: 'mid', dot: '#2563EB', dot2: '#1E3A8A',
      light: {
        tier: 'mid', body: '#1E2430',
        h1: ['#1E3A8A', 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(37,99,235,0.03))', '#2563EB', 'rgba(37,99,235,0.18)'],
        h2: ['#1D4ED8', 'linear-gradient(90deg, rgba(59,130,246,0.10), rgba(59,130,246,0.02))', '#3B82F6', 'rgba(59,130,246,0.16)'],
        h3: ['#B45309', 'rgba(217,119,6,0.065)', '#D97706', 'rgba(217,119,6,0.16)'],
        h4: ['#4338CA', '#6366F1'],
        strongText: '#0F172A', strongRgb: '250, 204, 21', strongMint: ['rgba(37,99,235,0.10)', '#1E3A8A'],
        quote: ['#FFFBEB', '#D97706', '#78350F'],
        ol: ['rgba(37,99,235,0.14)', '#1E40AF', '#2563EB', 'rgba(37,99,235,0.28)'],
        ul: ['#2563EB', '#D97706'],
        tbl: ['#DBEAFE', '#1E3A8A', '#93C5FD', '#1E293B', '#F8FAFC', '#EFF6FF', '#CBD5E1'],
        inlineCode: ['#F1F5F9', '#BE123C', '#CBD5E1'],
        link: ['#1D4ED8', '#DBEAFE', 'rgba(29,78,216,0.38)']
      },
      dark: {
        tier: 'mid', body: '#E2E8F0',
        h1: ['#93C5FD', 'linear-gradient(135deg, rgba(59,130,246,0.20), rgba(59,130,246,0.05))', '#3B82F6', 'rgba(59,130,246,0.22)'],
        h2: ['#A5B4FC', 'linear-gradient(90deg, rgba(99,102,241,0.16), rgba(99,102,241,0.03))', '#818CF8', 'rgba(129,140,248,0.20)'],
        h3: ['#FCD34D', 'rgba(245,158,11,0.12)', '#F59E0B', 'rgba(245,158,11,0.24)'],
        h4: ['#C4B5FD', '#A78BFA'],
        strongText: '#FFFFFF', strongRgb: '250, 204, 21', strongMint: ['rgba(59,130,246,0.20)', '#BFDBFE'],
        quote: ['rgba(245,158,11,0.12)', '#F59E0B', '#FDE68A'],
        ol: ['rgba(59,130,246,0.22)', '#BFDBFE', '#3B82F6', 'rgba(59,130,246,0.36)'],
        ul: ['#60A5FA', '#FBBF24'],
        tbl: ['#1E3A8A', '#F1F5F9', '#3B82F6', '#CBD5E1', 'rgba(255,255,255,0.03)', 'rgba(59,130,246,0.14)', 'rgba(255,255,255,0.15)'],
        inlineCode: ['rgba(255,255,255,0.09)', '#FDA4AF', 'rgba(255,255,255,0.16)'],
        link: ['#60A5FA', 'rgba(59,130,246,0.15)', 'rgba(96,165,250,0.40)']
      }
    },
    amber: {
      name: '琥珀陶韵', tier: 'mid', dot: '#C2410C', dot2: '#7C2D12',
      light: {
        tier: 'mid', body: '#27201B',
        h1: ['#7C2D12', 'linear-gradient(135deg, rgba(194,65,12,0.12), rgba(194,65,12,0.025))', '#C2410C', 'rgba(194,65,12,0.18)'],
        h2: ['#9A3412', 'linear-gradient(90deg, rgba(234,88,12,0.10), rgba(234,88,12,0.02))', '#EA580C', 'rgba(234,88,12,0.16)'],
        h3: ['#0F766E', 'rgba(13,148,136,0.065)', '#0D9488', 'rgba(13,148,136,0.16)'],
        h4: ['#92400E', '#D97706'],
        strongText: '#431407', strongRgb: '251, 146, 60', strongMint: ['rgba(13,148,136,0.12)', '#115E59'],
        quote: ['#FFF7ED', '#EA580C', '#7C2D12'],
        ol: ['rgba(194,65,12,0.13)', '#9A3412', '#C2410C', 'rgba(194,65,12,0.28)'],
        ul: ['#C2410C', '#0D9488'],
        tbl: ['#FFEDD5', '#7C2D12', '#FDBA74', '#292524', '#FFFBF7', '#FFF7ED', '#FED7AA'],
        inlineCode: ['#FEF2F2', '#B91C1C', '#FECACA'],
        link: ['#C2410C', '#FFEDD5', 'rgba(194,65,12,0.36)']
      },
      dark: {
        tier: 'mid', body: '#EDE6DF',
        h1: ['#FDBA74', 'linear-gradient(135deg, rgba(249,115,22,0.20), rgba(249,115,22,0.04))', '#FB923C', 'rgba(251,146,60,0.22)'],
        h2: ['#FDE047', 'linear-gradient(90deg, rgba(234,179,8,0.14), rgba(234,179,8,0.03))', '#EAB308', 'rgba(234,179,8,0.18)'],
        h3: ['#5EEAD4', 'rgba(45,212,191,0.10)', '#2DD4BF', 'rgba(45,212,191,0.22)'],
        h4: ['#FCA5A5', '#F87171'],
        strongText: '#FFFBEB', strongRgb: '251, 146, 60', strongMint: ['rgba(45,212,191,0.18)', '#99F6E4'],
        quote: ['rgba(249,115,22,0.12)', '#FB923C', '#FED7AA'],
        ol: ['rgba(249,115,22,0.22)', '#FED7AA', '#EA580C', 'rgba(251,146,60,0.34)'],
        ul: ['#FB923C', '#2DD4BF'],
        tbl: ['#3B2314', '#FED7AA', '#6D3E20', '#E5DDD5', 'rgba(255,255,255,0.03)', 'rgba(249,115,22,0.12)', 'rgba(255,237,213,0.15)'],
        inlineCode: ['rgba(248,113,113,0.14)', '#FCA5A5', 'rgba(248,113,113,0.22)'],
        link: ['#FDBA74', 'rgba(251,146,60,0.14)', 'rgba(253,186,116,0.38)']
      }
    },
    nordic: {
      name: '极光北欧', tier: 'mid', dot: '#2E5A88', dot2: '#5E81AC',
      light: {
        tier: 'mid', body: '#2E3440',
        h1: ['#2E3440', 'linear-gradient(135deg, rgba(94,129,172,0.14), rgba(94,129,172,0.04))', '#5E81AC', 'rgba(94,129,172,0.22)'],
        h2: ['#2C5E68', 'linear-gradient(90deg, rgba(136,192,208,0.18), rgba(136,192,208,0.04))', '#4C8B9B', 'rgba(76,139,155,0.20)'],
        h3: ['#6C4675', 'rgba(180,142,173,0.10)', '#9B6B94', 'rgba(155,107,148,0.20)'],
        h4: ['#4C566A', '#81A1C1'],
        strongText: '#1F242D', strongRgb: '235, 203, 139', strongMint: ['rgba(143,188,187,0.22)', '#244A4A'],
        quote: ['#ECEFF4', '#5E81AC', '#2E3440'],
        ol: ['rgba(94,129,172,0.16)', '#2E4C72', '#5E81AC', 'rgba(94,129,172,0.32)'],
        ul: ['#4C8B9B', '#B48EAD'],
        tbl: ['#E5E9F0', '#2E3440', '#C3CDDC', '#2E3440', '#F7F9FC', '#ECEFF4', '#D8DEE9'],
        inlineCode: ['#ECEFF4', '#BF616A', '#D8DEE9'],
        link: ['#4C6B94', '#E5E9F0', 'rgba(76,107,148,0.38)']
      },
      dark: {
        tier: 'mid', body: '#ECEFF4',
        h1: ['#88C0D0', 'linear-gradient(135deg, rgba(136,192,208,0.18), rgba(136,192,208,0.04))', '#88C0D0', 'rgba(136,192,208,0.22)'],
        h2: ['#A3BE8C', 'linear-gradient(90deg, rgba(163,190,140,0.16), rgba(163,190,140,0.03))', '#A3BE8C', 'rgba(163,190,140,0.20)'],
        h3: ['#EBCB8B', 'rgba(235,203,139,0.12)', '#EBCB8B', 'rgba(235,203,139,0.22)'],
        h4: ['#B48EAD', '#B48EAD'],
        strongText: '#FFFFFF', strongRgb: '235, 203, 139', strongMint: ['rgba(163,190,140,0.20)', '#C7DFB2'],
        quote: ['rgba(94,129,172,0.15)', '#81A1C1', '#D8DEE9'],
        ol: ['rgba(129,161,193,0.22)', '#D8DEE9', '#5E81AC', 'rgba(129,161,193,0.34)'],
        ul: ['#88C0D0', '#EBCB8B'],
        tbl: ['#2E3440', '#ECEFF4', '#4C566A', '#D8DEE9', 'rgba(255,255,255,0.025)', 'rgba(136,192,208,0.12)', '#434C5E'],
        inlineCode: ['#2E3440', '#EBCB8B', '#434C5E'],
        link: ['#88C0D0', 'rgba(136,192,208,0.14)', 'rgba(136,192,208,0.40)']
      }
    },
    plum: {
      name: '绛紫雅韵', tier: 'mid', dot: '#6D28D9', dot2: '#4C1D95',
      light: {
        tier: 'mid', body: '#241F29',
        h1: ['#4C1D95', 'linear-gradient(135deg, rgba(109,40,217,0.11), rgba(109,40,217,0.025))', '#6D28D9', 'rgba(109,40,217,0.18)'],
        h2: ['#0F766E', 'linear-gradient(90deg, rgba(13,148,136,0.09), rgba(13,148,136,0.02))', '#0D9488', 'rgba(13,148,136,0.16)'],
        h3: ['#9D174D', 'rgba(219,39,119,0.06)', '#DB2777', 'rgba(219,39,119,0.16)'],
        h4: ['#6D28D9', '#8B5CF6'],
        strongText: '#2E1065', strongRgb: '192, 132, 252', strongMint: ['rgba(13,148,136,0.12)', '#115E59'],
        quote: ['#FAF5FF', '#7C3AED', '#4C1D95'],
        ol: ['rgba(109,40,217,0.13)', '#4C1D95', '#6D28D9', 'rgba(109,40,217,0.28)'],
        ul: ['#0D9488', '#DB2777'],
        tbl: ['#EDE9FE', '#4C1D95', '#C4B5FD', '#2D2636', '#FAF8FF', '#F3E8FF', '#DDD6FE'],
        inlineCode: ['#FDF2F8', '#BE185D', '#FBCFE8'],
        link: ['#6D28D9', '#F3E8FF', 'rgba(109,40,217,0.36)']
      },
      dark: {
        tier: 'mid', body: '#EDE9F4',
        h1: ['#C4B5FD', 'linear-gradient(135deg, rgba(139,92,246,0.20), rgba(139,92,246,0.05))', '#8B5CF6', 'rgba(139,92,246,0.22)'],
        h2: ['#5EEAD4', 'linear-gradient(90deg, rgba(20,184,166,0.15), rgba(20,184,166,0.03))', '#2DD4BF', 'rgba(45,212,191,0.20)'],
        h3: ['#F9A8D4', 'rgba(244,114,182,0.12)', '#F472B6', 'rgba(244,114,182,0.22)'],
        h4: ['#DDD6FE', '#A78BFA'],
        strongText: '#FFFFFF', strongRgb: '192, 132, 252', strongMint: ['rgba(45,212,191,0.18)', '#99F6E4'],
        quote: ['rgba(139,92,246,0.13)', '#A78BFA', '#EDE9FE'],
        ol: ['rgba(139,92,246,0.22)', '#DDD6FE', '#7C3AED', 'rgba(167,139,250,0.34)'],
        ul: ['#2DD4BF', '#F472B6'],
        tbl: ['#2A1F42', '#DDD6FE', '#4C3678', '#E2DDF0', 'rgba(255,255,255,0.03)', 'rgba(139,92,246,0.12)', 'rgba(255,255,255,0.14)'],
        inlineCode: ['rgba(244,114,182,0.14)', '#F9A8D4', 'rgba(244,114,182,0.22)'],
        link: ['#C4B5FD', 'rgba(196,181,253,0.14)', 'rgba(196,181,253,0.38)']
      }
    },

    // === Tier 3: 高对比 · 重点突出 ===
    'focus-royal': {
      name: '皇室聚焦', tier: 'high', dot: '#1D4ED8', dot2: '#059669',
      light: {
        tier: 'high', body: '#111827',
        h1: ['#1E3A8A', 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(59,130,246,0.05))', '#1D4ED8', 'rgba(29,78,216,0.28)'],
        h2: ['#065F46', 'linear-gradient(90deg, rgba(5,150,105,0.14), rgba(16,185,129,0.03))', '#059669', 'rgba(5,150,105,0.26)'],
        h3: ['#9A3412', 'rgba(234,88,12,0.09)', '#EA580C', '#EA580C'],
        h4: ['#5B21B6', '#7C3AED'],
        strongText: '#090D16', strongRgb: '250, 204, 21', strongMint: ['rgba(5,150,105,0.18)', '#064E3B'],
        quote: ['#FEF3C7', '#D97706', '#78350F'],
        ol: ['#DBEAFE', '#1E40AF', '#1D4ED8', '#1D4ED8'],
        ul: ['#059669', '#D97706'],
        tbl: ['#1E3A8A', '#FFFFFF', '#1D4ED8', '#111827', '#F8FAFC', '#EFF6FF', '#94A3B8'],
        inlineCode: ['#FEE2E2', '#B91C1C', '#FCA5A5'],
        link: ['#1D4ED8', '#DBEAFE', 'rgba(29,78,216,0.50)']
      },
      dark: {
        tier: 'high', body: '#F8FAFC',
        h1: ['#93C5FD', 'linear-gradient(135deg, rgba(59,130,246,0.26), rgba(37,99,235,0.10))', '#3B82F6', 'rgba(96,165,250,0.34)'],
        h2: ['#6EE7B7', 'linear-gradient(90deg, rgba(16,185,129,0.22), rgba(5,150,105,0.06))', '#10B981', 'rgba(52,211,153,0.30)'],
        h3: ['#FDBA74', 'rgba(249,115,22,0.16)', '#F97316', '#EA580C'],
        h4: ['#D8B4FE', '#A855F7'],
        strongText: '#FFFFFF', strongRgb: '250, 204, 21', strongMint: ['rgba(16,185,129,0.28)', '#A7F3D0'],
        quote: ['rgba(245,158,11,0.18)', '#F59E0B', '#FEF3C7'],
        ol: ['rgba(59,130,246,0.28)', '#93C5FD', '#2563EB', '#3B82F6'],
        ul: ['#10B981', '#F59E0B'],
        tbl: ['#1E3A8A', '#FFFFFF', '#3B82F6', '#F1F5F9', 'rgba(255,255,255,0.04)', 'rgba(59,130,246,0.18)', 'rgba(148,163,184,0.30)'],
        inlineCode: ['rgba(244,63,94,0.18)', '#FDA4AF', 'rgba(253,164,175,0.30)'],
        link: ['#60A5FA', 'rgba(59,130,246,0.22)', 'rgba(96,165,250,0.55)']
      }
    },
    'focus-emerald': {
      name: '锐绿领航', tier: 'high', dot: '#047857', dot2: '#064E3B',
      light: {
        tier: 'high', body: '#0F172A',
        h1: ['#064E3B', 'linear-gradient(135deg, rgba(4,120,87,0.16), rgba(16,185,129,0.05))', '#047857', 'rgba(4,120,87,0.30)'],
        h2: ['#0F766E', 'linear-gradient(90deg, rgba(13,148,136,0.14), rgba(13,148,136,0.03))', '#0D9488', 'rgba(13,148,136,0.26)'],
        h3: ['#B45309', 'rgba(217,119,6,0.09)', '#D97706', '#D97706'],
        h4: ['#1E3A8A', '#2563EB'],
        strongText: '#022C22', strongRgb: '52, 211, 153', strongMint: ['rgba(4,120,87,0.20)', '#064E3B'],
        quote: ['#ECFDF5', '#059669', '#064E3B'],
        ol: ['#D1FAE5', '#065F46', '#047857', '#047857'],
        ul: ['#047857', '#D97706'],
        tbl: ['#064E3B', '#FFFFFF', '#059669', '#111827', '#F0FDF4', '#DCFCE7', '#86EFAC'],
        inlineCode: ['#ECFDF5', '#065F46', '#6EE7B7'],
        link: ['#047857', '#D1FAE5', 'rgba(4,120,87,0.50)']
      },
      dark: {
        tier: 'high', body: '#F8FAFC',
        h1: ['#6EE7B7', 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(5,150,105,0.10))', '#10B981', 'rgba(52,211,153,0.36)'],
        h2: ['#5EEAD4', 'linear-gradient(90deg, rgba(20,184,166,0.22), rgba(20,184,166,0.05))', '#14B8A6', 'rgba(45,212,191,0.30)'],
        h3: ['#FDE047', 'rgba(234,179,8,0.16)', '#EAB308', '#CA8A04'],
        h4: ['#93C5FD', '#3B82F6'],
        strongText: '#FFFFFF', strongRgb: '16, 185, 129', strongMint: ['rgba(16,185,129,0.30)', '#ECFDF5'],
        quote: ['rgba(16,185,129,0.18)', '#10B981', '#D1FAE5'],
        ol: ['rgba(16,185,129,0.28)', '#A7F3D0', '#059669', '#10B981'],
        ul: ['#34D399', '#FBBF24'],
        tbl: ['#064E3B', '#FFFFFF', '#10B981', '#F0FDF4', 'rgba(16,185,129,0.06)', 'rgba(16,185,129,0.18)', 'rgba(52,211,153,0.30)'],
        inlineCode: ['rgba(16,185,129,0.20)', '#6EE7B7', 'rgba(52,211,153,0.35)'],
        link: ['#34D399', 'rgba(16,185,129,0.20)', 'rgba(52,211,153,0.55)']
      }
    },
    'focus-crimson': {
      name: '朱砂批注', tier: 'high', dot: '#B91C1C', dot2: '#1F2937',
      light: {
        tier: 'high', body: '#111827',
        h1: ['#7F1D1D', 'linear-gradient(135deg, rgba(185,28,28,0.14), rgba(220,38,38,0.04))', '#B91C1C', 'rgba(185,28,28,0.28)'],
        h2: ['#991B1B', 'linear-gradient(90deg, rgba(220,38,38,0.11), rgba(220,38,38,0.02))', '#DC2626', 'rgba(220,38,38,0.24)'],
        h3: ['#1E3A8A', 'rgba(37,99,235,0.08)', '#2563EB', '#2563EB'],
        h4: ['#374151', '#4B5563'],
        strongText: '#7F1D1D', strongRgb: '254, 202, 202', strongMint: ['rgba(185,28,28,0.12)', '#7F1D1D'],
        quote: ['#FEF2F2', '#DC2626', '#7F1D1D'],
        ol: ['#FEE2E2', '#991B1B', '#B91C1C', '#B91C1C'],
        ul: ['#DC2626', '#2563EB'],
        tbl: ['#1F2937', '#FFFFFF', '#B91C1C', '#111827', '#F9FAFB', '#FEF2F2', '#9CA3AF'],
        inlineCode: ['#FEE2E2', '#991B1B', '#F87171'],
        link: ['#B91C1C', '#FEE2E2', 'rgba(185,28,28,0.48)']
      },
      dark: {
        tier: 'high', body: '#F8FAFC',
        h1: ['#FCA5A5', 'linear-gradient(135deg, rgba(239,68,68,0.26), rgba(239,68,68,0.08))', '#EF4444', 'rgba(248,113,113,0.34)'],
        h2: ['#FDBA74', 'linear-gradient(90deg, rgba(249,115,22,0.22), rgba(249,115,22,0.05))', '#F97316', 'rgba(251,146,60,0.30)'],
        h3: ['#93C5FD', 'rgba(59,130,246,0.16)', '#3B82F6', '#2563EB'],
        h4: ['#E5E7EB', '#9CA3AF'],
        strongText: '#FFFFFF', strongRgb: '239, 68, 68', strongMint: ['rgba(239,68,68,0.24)', '#FECACA'],
        quote: ['rgba(239,68,68,0.16)', '#EF4444', '#FECACA'],
        ol: ['rgba(239,68,68,0.28)', '#FECACA', '#DC2626', '#EF4444'],
        ul: ['#F87171', '#60A5FA'],
        tbl: ['#2B1B1D', '#FEE2E2', '#DC2626', '#F3F4F6', 'rgba(255,255,255,0.035)', 'rgba(239,68,68,0.16)', 'rgba(248,113,113,0.28)'],
        inlineCode: ['rgba(239,68,68,0.20)', '#FCA5A5', 'rgba(248,113,113,0.32)'],
        link: ['#FCA5A5', 'rgba(239,68,68,0.18)', 'rgba(252,165,165,0.50)']
      }
    },
    'focus-cyber': {
      name: '极客霓虹', tier: 'high', dot: '#0284C7', dot2: '#7C3AED',
      light: {
        tier: 'high', body: '#0F172A',
        h1: ['#0369A1', 'linear-gradient(135deg, rgba(2,132,199,0.16), rgba(6,182,212,0.05))', '#0284C7', 'rgba(2,132,199,0.28)'],
        h2: ['#6D28D9', 'linear-gradient(90deg, rgba(124,58,237,0.14), rgba(124,58,237,0.03))', '#7C3AED', 'rgba(124,58,237,0.24)'],
        h3: ['#BE185D', 'rgba(219,39,119,0.08)', '#DB2777', '#DB2777'],
        h4: ['#0F766E', '#14B8A6'],
        strongText: '#0C4A6E', strongRgb: '56, 189, 248', strongMint: ['rgba(124,58,237,0.14)', '#4C1D95'],
        quote: ['#F0F9FF', '#0284C7', '#0C4A6E'],
        ol: ['#E0F2FE', '#0369A1', '#0284C7', '#0284C7'],
        ul: ['#0284C7', '#7C3AED'],
        tbl: ['#0F172A', '#38BDF8', '#0284C7', '#0F172A', '#F8FAFC', '#E0F2FE', '#94A3B8'],
        inlineCode: ['#EDE9FE', '#6D28D9', '#C4B5FD'],
        link: ['#0284C7', '#E0F2FE', 'rgba(2,132,199,0.50)']
      },
      dark: {
        tier: 'high', body: '#F1F5F9',
        h1: ['#38BDF8', 'linear-gradient(135deg, rgba(56,189,248,0.26), rgba(6,182,212,0.08))', '#0EA5E9', 'rgba(56,189,248,0.36)'],
        h2: ['#C084FC', 'linear-gradient(90deg, rgba(168,85,247,0.22), rgba(168,85,247,0.05))', '#A855F7', 'rgba(192,132,252,0.32)'],
        h3: ['#F472B6', 'rgba(244,114,182,0.16)', '#EC4899', '#DB2777'],
        h4: ['#2DD4BF', '#14B8A6'],
        strongText: '#FFFFFF', strongRgb: '56, 189, 248', strongMint: ['rgba(168,85,247,0.26)', '#E9D5FF'],
        quote: ['rgba(14,165,233,0.16)', '#38BDF8', '#E0F2FE'],
        ol: ['rgba(56,189,248,0.28)', '#E0F2FE', '#0284C7', '#38BDF8'],
        ul: ['#38BDF8', '#C084FC'],
        tbl: ['#0F172A', '#38BDF8', '#0284C7', '#E2E8F0', 'rgba(56,189,248,0.05)', 'rgba(56,189,248,0.16)', 'rgba(56,189,248,0.30)'],
        inlineCode: ['rgba(168,85,247,0.22)', '#E9D5FF', 'rgba(192,132,252,0.35)'],
        link: ['#38BDF8', 'rgba(56,189,248,0.20)', 'rgba(56,189,248,0.55)']
      }
    },
    'focus-ink': {
      name: '墨金锐读', tier: 'high', dot: '#111827', dot2: '#D97706',
      light: {
        tier: 'high', body: '#090D16',
        h1: ['#090D16', 'linear-gradient(135deg, rgba(15,23,42,0.12), rgba(15,23,42,0.03))', '#090D16', 'rgba(15,23,42,0.25)'],
        h2: ['#78350F', 'linear-gradient(90deg, rgba(217,119,6,0.15), rgba(245,158,11,0.03))', '#D97706', 'rgba(217,119,6,0.28)'],
        h3: ['#1E293B', 'rgba(30,41,59,0.07)', '#334155', '#334155'],
        h4: ['#92400E', '#B45309'],
        strongText: '#090D16', strongRgb: '245, 158, 11', strongMint: ['rgba(15,23,42,0.12)', '#090D16'],
        quote: ['#FFFBEB', '#B45309', '#451A03'],
        ol: ['#FEF3C7', '#78350F', '#111827', '#111827'],
        ul: ['#D97706', '#111827'],
        tbl: ['#111827', '#FDE68A', '#D97706', '#090D16', '#F9FAFB', '#FEF3C7', '#9CA3AF'],
        inlineCode: ['#FEF3C7', '#92400E', '#FCD34D'],
        link: ['#B45309', '#FEF3C7', 'rgba(180,83,9,0.50)']
      },
      dark: {
        tier: 'high', body: '#F8FAFC',
        h1: ['#FDE68A', 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(245,158,11,0.06))', '#F59E0B', 'rgba(245,158,11,0.34)'],
        h2: ['#FFFFFF', 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))', '#E5E7EB', 'rgba(255,255,255,0.24)'],
        h3: ['#FDBA74', 'rgba(251,146,60,0.15)', '#FB923C', '#D97706'],
        h4: ['#FDE68A', '#F59E0B'],
        strongText: '#000000', strongRgb: '251, 191, 36', strongMint: ['rgba(245,158,11,0.28)', '#FEF3C7'],
        quote: ['rgba(245,158,11,0.16)', '#F59E0B', '#FEF3C7'],
        ol: ['rgba(245,158,11,0.28)', '#FEF3C7', '#D97706', '#F59E0B'],
        ul: ['#FBBF24', '#FFFFFF'],
        tbl: ['#1C1917', '#FDE68A', '#D97706', '#F3F4F6', 'rgba(255,255,255,0.035)', 'rgba(245,158,11,0.16)', 'rgba(245,158,11,0.32)'],
        inlineCode: ['rgba(245,158,11,0.20)', '#FDE68A', 'rgba(251,191,36,0.34)'],
        link: ['#FBBF24', 'rgba(245,158,11,0.18)', 'rgba(251,191,36,0.55)']
      }
    },
    'focus-aaa': {
      name: '极清高反差', tier: 'high', dot: '#000000', dot2: '#1D4ED8',
      light: {
        tier: 'high', body: '#000000',
        h1: ['#000000', '#EFF6FF', '#1D4ED8', '#93C5FD'],
        h2: ['#000000', '#ECFDF5', '#047857', '#6EE7B7'],
        h3: ['#000000', '#FFF7ED', '#C2410C', '#C2410C'],
        h4: ['#000000', '#4338CA'],
        strongText: '#000000', strongRgb: '253, 224, 71', strongMint: ['#A7F3D0', '#000000'],
        quote: ['#FEF9C3', '#A16207', '#000000'],
        ol: ['#DBEAFE', '#000000', '#000000', '#000000'],
        ul: ['#000000', '#1D4ED8'],
        tbl: ['#000000', '#FFFFFF', '#000000', '#000000', '#F3F4F6', '#FEF9C3', '#4B5563'],
        inlineCode: ['#FEE2E2', '#991B1B', '#EF4444'],
        link: ['#0038A8', '#DBEAFE', '#0038A8']
      },
      dark: {
        tier: 'high', body: '#FFFFFF',
        h1: ['#FFFFFF', 'rgba(59,130,246,0.30)', '#60A5FA', '#60A5FA'],
        h2: ['#FFFFFF', 'rgba(16,185,129,0.26)', '#34D399', '#34D399'],
        h3: ['#FFFFFF', 'rgba(249,115,22,0.24)', '#FB923C', '#EA580C'],
        h4: ['#FFFFFF', '#A78BFA'],
        strongText: '#FFFFFF', strongRgb: '234, 179, 8', strongMint: ['rgba(16,185,129,0.38)', '#FFFFFF'],
        quote: ['rgba(234,179,8,0.22)', '#FACC15', '#FFFFFF'],
        ol: ['rgba(59,130,246,0.35)', '#FFFFFF', '#2563EB', '#60A5FA'],
        ul: ['#FFFFFF', '#FACC15'],
        tbl: ['#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', 'rgba(255,255,255,0.06)', 'rgba(250,204,21,0.22)', 'rgba(255,255,255,0.45)'],
        inlineCode: ['rgba(244,63,94,0.28)', '#FFFFFF', '#FB7185'],
        link: ['#7DD3FC', 'rgba(56,189,248,0.28)', '#7DD3FC']
      }
    }
  };

  // 分站点智能默认配置（NotebookLM / AI Studio / Gemini 默认更紧凑，彻底解决偏宽偏大问题）
  const SITE_DEFAULT_OVERRIDES = {
    chatgpt: {
      globalScale: 0.94, fontSize: 15.5, lineHeight: 1.49, paraGap: 9, letterSpacing: 0.015,
      headingScale: 0.96, tableDensity: 'compact', codeMaxHeight: '320px',
      contentWidth: 860, colorTheme: 'sage', btnBottom: 140
    },
    gemini: {
      globalScale: 0.92, fontSize: 15.0, lineHeight: 1.64, paraGap: 9, letterSpacing: 0.010,
      headingScale: 0.95, tableDensity: 'compact', codeMaxHeight: '300px',
      contentWidth: 800, colorTheme: 'sage', btnBottom: 95
    },
    notebooklm: {
      globalScale: 0.90, fontSize: 14.5, lineHeight: 1.60, paraGap: 8, letterSpacing: 0.010,
      headingScale: 0.95, tableDensity: 'compact', codeMaxHeight: '280px',
      contentWidth: 760, colorTheme: 'scholar-ink', btnBottom: 88
    },
    aistudio: {
      globalScale: 0.90, fontSize: 14.5, lineHeight: 1.58, paraGap: 8, letterSpacing: 0.010,
      headingScale: 0.95, tableDensity: 'compact', codeMaxHeight: '280px',
      contentWidth: 820, colorTheme: 'studio-slate', btnBottom: 88
    },
    antigravity: {
      globalScale: 0.92, fontSize: 14.5, lineHeight: 1.58, paraGap: 8, letterSpacing: 0.010,
      headingScale: 0.95, tableDensity: 'compact', codeMaxHeight: '300px',
      contentWidth: 840, colorTheme: 'studio-slate', btnBottom: 92
    }
  };

  const DEFAULT_PREFS = {
    scaleLocked: true,
    globalScale: 0.92,
    fontFamily: 'sans',
    fontSize: 15.0,
    lineHeight: 1.64,
    letterSpacing: 0.010,
    paraGap: 9,
    headingScale: 0.95,
    tableDensity: 'compact',
    codeMaxHeight: '300px',
    widthMode: 'standard',
    contentWidth: 820,
    alignMode: 'justify',
    colorTheme: 'sage',
    strongStyle: 'soft-gold',
    elicitMode: 'pill',
    codeCollapse: 'auto',
    chromeMode: 'compact',
    brandPreset: 'deepseek',
    btnRight: 18,
    btnBottom: 95,
    ...SITE_DEFAULT_OVERRIDES[SITE_KEY]
  };

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function roundStep(val, step) {
    return Number((Math.round(val / step) * step).toFixed(4));
  }

  function storageGet(key) {
    try {
      if (typeof GM_getValue === 'function') {
        const gmVal = GM_getValue(key, null);
        if (gmVal !== null && gmVal !== undefined && gmVal !== '') return gmVal;
      }
    } catch {}
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageSet(key, val) {
    try {
      if (typeof GM_setValue === 'function') GM_setValue(key, val);
    } catch {}
    try {
      localStorage.setItem(key, val);
    } catch {}
  }

  function loadPrefs() {
    try {
      const raw = storageGet(CURRENT_SITE.storageKey);
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!THEMES[parsed.colorTheme]) parsed.colorTheme = DEFAULT_PREFS.colorTheme;
        if (!BRAND_PRESETS[parsed.brandPreset]) parsed.brandPreset = DEFAULT_PREFS.brandPreset;
        return { ...DEFAULT_PREFS, ...parsed };
      }
      for (const oldKey of CURRENT_SITE.legacyKeys) {
        const prevRaw = storageGet(oldKey);
        if (!prevRaw) continue;
        const prev = typeof prevRaw === 'string' ? JSON.parse(prevRaw) : prevRaw;
        const migrated = { ...DEFAULT_PREFS, ...prev };
        if (!THEMES[migrated.colorTheme]) migrated.colorTheme = DEFAULT_PREFS.colorTheme;
        if (!BRAND_PRESETS[migrated.brandPreset]) migrated.brandPreset = DEFAULT_PREFS.brandPreset;
        return migrated;
      }
      return { ...DEFAULT_PREFS };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }

  function savePrefs(prefs) {
    storageSet(CURRENT_SITE.storageKey, JSON.stringify(prefs));
  }

  function syncPrefsToAllSites(prefs) {
    const payload = JSON.stringify(prefs);
    for (const meta of Object.values(SITE_META)) {
      storageSet(meta.storageKey, payload);
    }
  }

  let currentPrefs = loadPrefs();
  let ratioAnchor = buildAnchorFromPrefs(currentPrefs);

  function buildAnchorFromPrefs(prefs) {
    return {
      baseScale: clamp(Number(prefs.globalScale) || 0.92, 0.78, 1.30),
      fontSize: clamp(Number(prefs.fontSize) || DEFAULT_PREFS.fontSize, 12.5, 22.0),
      lineHeight: clamp(Number(prefs.lineHeight) || DEFAULT_PREFS.lineHeight, 1.35, 2.20),
      paraGap: clamp(Number(prefs.paraGap) ?? DEFAULT_PREFS.paraGap, 2, 32),
      letterSpacing: clamp(Number(prefs.letterSpacing) ?? DEFAULT_PREFS.letterSpacing, 0, 0.06)
    };
  }

  function detectDarkMode() {
    const html = document.documentElement;
    const body = document.body;
    if (
      html?.classList?.contains('dark') ||
      body?.classList?.contains('dark-theme') ||
      body?.classList?.contains('dark') ||
      html?.getAttribute('data-theme') === 'dark'
    ) {
      return true;
    }
    if (
      html?.classList?.contains('light') ||
      body?.classList?.contains('light-theme') ||
      body?.classList?.contains('light') ||
      html?.getAttribute('data-theme') === 'light'
    ) {
      return false;
    }
    return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  }

  function applyThemeVars(themeKey, isDark) {
    const root = document.documentElement;
    if (!root) return;
    const theme = THEMES[themeKey] || THEMES[DEFAULT_PREFS.colorTheme] || THEMES.sage;
    const cfg = isDark ? theme.dark : theme.light;
    const vars = buildThemeVars(cfg, isDark);
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
    root.setAttribute('data-aiu-site', SITE_KEY);
    root.setAttribute('data-aiu-dark', isDark ? '1' : '0');
    root.setAttribute('data-aiu-theme', themeKey);
    const host = document.getElementById(PANEL_HOST_ID);
    if (host) {
      host.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }

  function syncThemeMode() {
    const isDark = detectDarkMode();
    applyThemeVars(currentPrefs.colorTheme || DEFAULT_PREFS.colorTheme, isDark);
    return isDark;
  }

  function applyPrefsToRoot(prefs) {
    const root = document.documentElement;
    if (!root) return;

    const fs = Number.isFinite(Number(prefs.fontSize)) ? Number(prefs.fontSize) : DEFAULT_PREFS.fontSize;
    const lh = Number.isFinite(Number(prefs.lineHeight)) ? Number(prefs.lineHeight) : DEFAULT_PREFS.lineHeight;
    const ls = Number.isFinite(Number(prefs.letterSpacing)) ? Number(prefs.letterSpacing) : DEFAULT_PREFS.letterSpacing;
    const pg = Number.isFinite(Number(prefs.paraGap)) ? Number(prefs.paraGap) : DEFAULT_PREFS.paraGap;
    const cw = Number.isFinite(Number(prefs.contentWidth)) ? Number(prefs.contentWidth) : DEFAULT_PREFS.contentWidth;
    const gs = Number.isFinite(Number(prefs.globalScale)) ? Number(prefs.globalScale) : DEFAULT_PREFS.globalScale;
    const hs = Number.isFinite(Number(prefs.headingScale)) ? Number(prefs.headingScale) : DEFAULT_PREFS.headingScale;
    const fontCss = FONT_STACKS[prefs.fontFamily] || FONT_STACKS.sans;
    const tbl = TABLE_DENSITIES[prefs.tableDensity] || TABLE_DENSITIES.compact;

    const widthCss = prefs.widthMode === 'full' ? (SITE_KEY === 'chatgpt' || SITE_KEY === 'gemini' || SITE_KEY === 'antigravity' ? '92vw' : '96%') : `${cw}px`;

    let textAlign = 'justify';
    let textAlignLast = 'auto';
    if (prefs.alignMode === 'left') {
      textAlign = 'left';
      textAlignLast = 'auto';
    } else if (prefs.alignMode === 'justify-all') {
      textAlign = 'justify';
      textAlignLast = 'justify';
    }

    root.style.setProperty('--aiu-font-family', fontCss);
    root.style.setProperty('--aiu-compact-text-size', `${fs}px`);
    root.style.setProperty('--aiu-compact-line-height', `${lh}`);
    root.style.setProperty('--aiu-compact-letter-spacing', `${ls}em`);
    root.style.setProperty('--aiu-compact-para-gap', `${pg}px`);
    root.style.setProperty('--aiu-compact-content-width', widthCss);
    root.style.setProperty('--aiu-scale-factor', `${gs}`);
    root.style.setProperty('--aiu-heading-scale', `${hs}`);
    root.style.setProperty('--aiu-tbl-font-ratio', `${tbl.fontRatio}`);
    root.style.setProperty('--aiu-tbl-lh', `${tbl.lh}`);
    root.style.setProperty('--aiu-tbl-pad-y', tbl.padY);
    root.style.setProperty('--aiu-tbl-pad-x', tbl.padX);
    root.style.setProperty('--aiu-code-max-width', '100%');
    root.style.setProperty('--aiu-code-max-height', prefs.codeMaxHeight || '300px');
    root.style.setProperty('--aiu-text-align', textAlign);
    root.style.setProperty('--aiu-text-align-last', textAlignLast);

    root.setAttribute('data-aiu-chrome', prefs.chromeMode || 'compact');
    root.setAttribute('data-aiu-elicit', prefs.elicitMode || 'pill');
    root.setAttribute('data-aiu-strong-style', prefs.strongStyle || 'soft-gold');
    syncThemeMode();
  }

  /* =========================================================
     2. 统一编辑级排版 CSS + 四站点专属瘦身 CSS（含 NotebookLM & AI Studio 真实 DOM 适配）
     ========================================================= */
  const MSG_SCOPE = ':is([data-markdown-text-style="assistant-message"], [data-dil-response], [data-message-author-role="assistant"] .markdown, .markdown-main-panel, .markdown, labs-tailwind-doc-viewer, element-list-renderer, ms-cmark-node.cmark-node, [data-markdown-root])';
  const TBL_WRAPPER = ':is([data-markdown-text-style="assistant-message"], [data-dil-response], [data-message-author-role="assistant"], .markdown-main-panel, .markdown, labs-tailwind-doc-viewer, element-list-renderer, ms-cmark-node.cmark-node, [data-d-component="table"], [data-d-table-viewport="true"], [data-markdown-root], .md-table-host)';
  const STRONG_NODES = ':is(strong, b, [data-d-style="bold"], [data-d-default-strong]:not(:has(strong, b))):not(.code):not(a):not(code):not(button):not(th):not([data-d-component="badge"]):not([data-d-component="caption"]):not([data-d-component="button"]):not(:where(a, code, button, th, h1, h2, h3, h4, .paragraph.heading1, .paragraph.heading2, .paragraph.heading3, .paragraph.heading4, [data-d-component="badge"], [data-d-component="caption"], [data-d-component="button"]) *)';
  const STRONG_SELECTOR = `${MSG_SCOPE} :is(.paragraph.normal, .list-item, [data-d-component="text"], p, li) ${STRONG_NODES}, ${TBL_WRAPPER} td ${STRONG_NODES}`;

  const SHARED_EDITORIAL_CSS = `
    /* 消除 AI Studio 内层 <ms-cmark-node> 嵌套包装盒对布局的干扰 */
    ms-cmark-node:not(.cmark-node) {
      display: contents !important;
    }

    /* 通用排版基调与正文颜色 */
    ${MSG_SCOPE} {
      display: block !important;
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
      font-family: var(--aiu-font-family) !important;
      font-size: var(--aiu-compact-text-size) !important;
      line-height: var(--aiu-compact-line-height) !important;
      letter-spacing: var(--aiu-compact-letter-spacing) !important;
      color: var(--g-body-color) !important;
      -webkit-font-smoothing: antialiased;
    }

    ${MSG_SCOPE} :is(.paragraph.normal, .paragraph.list-item, p, li, ul, ol, blockquote) {
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
      letter-spacing: inherit !important;
    }

    ${MSG_SCOPE} :is(.paragraph.normal, .paragraph.list-item, p, li, ul, ol, blockquote):not(:where(th, td, [data-spacing="activity"], [data-markdown-text-tone="tertiary"], [class*="activity-header"]) *) {
      color: var(--g-body-color) !important;
    }

    ${MSG_SCOPE} :is(.paragraph.normal, .paragraph.list-item, p, li, blockquote p):not(:where(th, td) *) {
      text-align: var(--aiu-text-align) !important;
      text-align-last: var(--aiu-text-align-last) !important;
      text-justify: inter-character !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
      hyphens: auto !important;
      -webkit-hyphens: auto !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    /* 统一段落间距（覆盖传统 Markdown <p>、NotebookLM .paragraph.normal 与 ChatGPT DIL 文本块；排除表格、DIL容器盒子与活动流） */
    html body ${MSG_SCOPE} :is(.paragraph.normal:not(li), p):not(:where(li, td, th, blockquote, pre, button, [data-d-component="badge"], [data-d-component="caption"], [data-d-component="box"], [data-d-component="row"], [data-spacing="activity"], [data-markdown-text-tone="tertiary"]) *) {
      margin-top: 0 !important;
      margin-bottom: var(--aiu-compact-para-gap) !important;
    }

    html body ${MSG_SCOPE} > :is(.paragraph.normal, p):last-child,
    html body ${MSG_SCOPE} > :last-child > :is(.paragraph.normal, p):last-child {
      margin-bottom: 0 !important;
    }

    /* ChatGPT DIL / Codex 渲染器中的无 <p> 纯文本段落块 */
    html body :is([data-dil-response], [data-markdown-text-style="assistant-message"]) > :is([data-d-component="text"], [data-d-component="paragraph"], div):not(:last-child):not(:has(p, ul, ol, table, pre, blockquote, h1, h2, h3, h4, hr, iframe, [data-code-block])) {
      margin-top: 0 !important;
      margin-bottom: var(--aiu-compact-para-gap) !important;
    }

    html body :is([data-dil-response], [data-markdown-text-style="assistant-message"]) [data-d-component="text"]:not(:last-child):not([data-d-inline]):not(:where(th, td, p, li, h1, h2, h3, h4, blockquote, button, a, [data-d-component="box"], [data-d-component="row"], [data-spacing="activity"]) *):not(:has(p, ul, ol, table, pre, blockquote, h1, h2, h3, h4)) {
      margin-top: 0 !important;
      margin-bottom: var(--aiu-compact-para-gap) !important;
    }

    /* 重点加粗标注（含 DIL data-d-component="text" 与表格 td 单元格内加粗） */
    ${STRONG_SELECTOR} {
      color: var(--g-strong-color) !important;
      font-weight: 600 !important;
      border-radius: 3px !important;
    }

    :root[data-aiu-strong-style="none"] :is(${STRONG_SELECTOR}) {
      background: transparent !important;
      padding: 0 !important;
    }

    :root[data-aiu-strong-style="soft-gold"] :is(${STRONG_SELECTOR}) {
      background: linear-gradient(transparent 54%, var(--g-strong-bg) 54%) !important;
      padding: 0 3px !important;
    }

    :root[data-aiu-strong-style="mint"] :is(${STRONG_SELECTOR}) {
      background: var(--g-strong-mint-bg) !important;
      color: var(--g-strong-mint-color) !important;
      padding: 1px 5px !important;
      border-radius: 4px !important;
    }

    ${MSG_SCOPE} :is(p, li, td):not(:where(th) *) :is(i, em) {
      color: var(--g-strong-color) !important;
      opacity: 0.90 !important;
    }

    /* 链接与分隔线 */
    ${MSG_SCOPE} a:not([href*="vertexaisearch.cloud.google.com"]) {
      color: var(--g-link-color) !important;
      text-decoration: none !important;
      border-bottom: 1px solid var(--g-link-underline) !important;
      padding-bottom: 1px;
      border-radius: 2px;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    ${MSG_SCOPE} a:not([href*="vertexaisearch.cloud.google.com"]):hover {
      background-color: var(--g-link-hover-bg) !important;
      border-bottom-color: var(--g-link-color) !important;
    }

    ${MSG_SCOPE} :is(hr, hr.horizontal-rule) {
      border: none !important;
      border-top: 1px dashed var(--g-hr-color) !important;
      margin: calc(13px * var(--aiu-scale-factor)) 0 !important;
    }

    /* 四级标题（同时兼容 .paragraph.heading1~4 与原生 h1~h4） */
    ${MSG_SCOPE} :is(.paragraph.heading1, .paragraph.heading2, .paragraph.heading3, .paragraph.heading4, h1, h2, h3, h4) {
      font-family: var(--aiu-font-family) !important;
      font-weight: 600 !important;
      letter-spacing: -0.01em !important;
      text-align: left !important;
      text-align-last: left !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      overflow-wrap: break-word !important;
    }

    ${MSG_SCOPE} :is(.paragraph.heading1, .paragraph.heading2, .paragraph.heading3, .paragraph.heading4, h1, h2, h3, h4) :is(strong, b) {
      background: transparent !important;
      color: inherit !important;
      padding: 0 !important;
      font-weight: inherit !important;
    }

    ${MSG_SCOPE} :is(.paragraph.heading1, h1) {
      font-size: calc(var(--aiu-compact-text-size) * 1.30 * var(--aiu-heading-scale)) !important;
      line-height: 1.38 !important;
      color: var(--g-h1-color) !important;
      background: var(--g-h1-bg) !important;
      border: 1px solid var(--g-h1-outline) !important;
      border-left: 4px solid var(--g-h1-border) !important;
      box-shadow: var(--g-heading-shadow) !important;
      border-radius: 7px !important;
      padding: calc(7px * var(--aiu-scale-factor)) calc(13px * var(--aiu-scale-factor)) !important;
      margin: calc(16px * var(--aiu-scale-factor)) 0 calc(8px * var(--aiu-scale-factor)) !important;
    }

    ${MSG_SCOPE} :is(.paragraph.heading2, h2) {
      font-size: calc(var(--aiu-compact-text-size) * 1.15 * var(--aiu-heading-scale)) !important;
      line-height: 1.40 !important;
      color: var(--g-h2-color) !important;
      background: var(--g-h2-bg) !important;
      border: 1px solid var(--g-h2-outline) !important;
      border-left: 3.5px solid var(--g-h2-border) !important;
      box-shadow: var(--g-heading-shadow) !important;
      border-radius: 7px !important;
      padding: calc(6px * var(--aiu-scale-factor)) calc(12px * var(--aiu-scale-factor)) !important;
      margin: calc(14px * var(--aiu-scale-factor)) 0 calc(6px * var(--aiu-scale-factor)) !important;
    }

    ${MSG_SCOPE} :is(.paragraph.heading3, h3) {
      font-size: calc(var(--aiu-compact-text-size) * 1.06 * var(--aiu-heading-scale)) !important;
      line-height: 1.42 !important;
      color: var(--g-h3-color) !important;
      background: var(--g-h3-bg) !important;
      border-left: 3px solid var(--g-h3-border) !important;
      border-radius: 6px !important;
      padding: calc(4px * var(--aiu-scale-factor)) 10px calc(4px * var(--aiu-scale-factor)) 30px !important;
      margin: calc(11px * var(--aiu-scale-factor)) 0 calc(5px * var(--aiu-scale-factor)) !important;
      position: relative !important;
    }

    ${MSG_SCOPE} :is(.paragraph.heading3, h3)::before {
      content: "§" !important;
      position: absolute !important;
      left: 7px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 17px !important;
      height: 17px !important;
      line-height: 17px !important;
      border-radius: 4px !important;
      background-color: var(--g-h3-badge-bg) !important;
      color: var(--g-h3-badge-text) !important;
      font-size: 10.5px !important;
      font-weight: 700 !important;
      text-align: center !important;
      box-shadow: var(--g-badge-shadow) !important;
    }

    ${MSG_SCOPE} :is(.paragraph.heading4, h4) {
      font-size: calc(var(--aiu-compact-text-size) * 1.01 * var(--aiu-heading-scale)) !important;
      line-height: 1.42 !important;
      color: var(--g-h4-color) !important;
      border-left: 2.5px solid var(--g-h4-border) !important;
      padding-left: 9px !important;
      margin: calc(9px * var(--aiu-scale-factor)) 0 calc(4px * var(--aiu-scale-factor)) 2px !important;
    }

    ${MSG_SCOPE} > :first-child { margin-top: 0 !important; }

    /* 徽章化列表（穿透 Angular 结构化中间组件） */
    ${MSG_SCOPE} :is(ul, ol) {
      margin: 3px 0 var(--aiu-compact-para-gap) !important;
      padding-left: 0 !important;
      list-style: none !important;
      max-width: 100% !important;
    }

    ${MSG_SCOPE} ol { counter-reset: aiu-ol-counter !important; }
    ${MSG_SCOPE} ol li {
      counter-increment: aiu-ol-counter !important;
      position: relative !important;
      padding-left: 27px !important;
      margin-top: calc(var(--aiu-compact-para-gap) * 0.48) !important;
    }

    ${MSG_SCOPE} ol li::before {
      content: counter(aiu-ol-counter) !important;
      position: absolute !important;
      left: 0 !important;
      top: calc(var(--aiu-compact-line-height) * 0.5em - 9.5px) !important;
      width: 19px !important;
      height: 19px !important;
      line-height: 17px !important;
      border-radius: 5px !important;
      background-color: var(--g-ol-badge-bg) !important;
      color: var(--g-ol-badge-text) !important;
      border: 1px solid var(--g-ol-badge-border) !important;
      box-sizing: border-box !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      text-align: center !important;
      text-align-last: center !important;
      letter-spacing: 0 !important;
      box-shadow: var(--g-badge-shadow) !important;
    }

    ${MSG_SCOPE} :is(ol, ul) li ol { counter-reset: aiu-sub-ol-counter !important; margin-top: 4px !important; }
    ${MSG_SCOPE} :is(ol, ul) li ol li { counter-increment: aiu-sub-ol-counter !important; padding-left: 24px !important; }
    ${MSG_SCOPE} :is(ol, ul) li ol li::before {
      content: counter(aiu-sub-ol-counter) !important;
      width: 17px !important;
      height: 17px !important;
      line-height: 15px !important;
      border-radius: 50% !important;
      background-color: var(--g-ol-sub-bg) !important;
      color: var(--g-ol-sub-text) !important;
      font-size: 10.5px !important;
      box-shadow: none !important;
    }

    ${MSG_SCOPE} ul li {
      position: relative !important;
      padding-left: 18px !important;
      margin-top: calc(var(--aiu-compact-para-gap) * 0.4) !important;
    }

    ${MSG_SCOPE} ul li::before {
      content: "" !important;
      position: absolute !important;
      left: 4px !important;
      top: calc(var(--aiu-compact-line-height) * 0.5em - 3px) !important;
      width: 6px !important;
      height: 6px !important;
      border-radius: 50% !important;
      background-color: var(--g-ul-bullet) !important;
      border: none !important;
    }

    ${MSG_SCOPE} :is(ul, ol) li ul { margin-top: 4px !important; }
    ${MSG_SCOPE} :is(ul, ol) li ul li::before {
      width: 5px !important;
      height: 5px !important;
      top: calc(var(--aiu-compact-line-height) * 0.5em - 2.5px) !important;
      background-color: transparent !important;
      border: 1.5px solid var(--g-ul-sub-bullet) !important;
    }

    ${MSG_SCOPE} li p { padding-left: 0 !important; margin: 0 0 calc(var(--aiu-compact-para-gap) * 0.35) !important; }
    ${MSG_SCOPE} li p:last-child { margin-bottom: 0 !important; }
    ${MSG_SCOPE} :is(ul, ol) > li:first-child,
    ${MSG_SCOPE} :is(ul, ol) > ms-cmark-node:first-child > li,
    ${MSG_SCOPE} :is(ul, ol) > labs-tailwind-structural-element-view-v2:first-child > paragraph-element-view > li { margin-top: 0 !important; }

    /* 引用卡片 */
    ${MSG_SCOPE} blockquote {
      margin: calc(9px * var(--aiu-scale-factor)) 0 !important;
      padding: calc(8px * var(--aiu-scale-factor)) 14px !important;
      background-color: var(--g-quote-bg) !important;
      border-left: 3.5px solid var(--g-quote-border) !important;
      box-shadow: var(--g-quote-shadow) !important;
      border-radius: 0 7px 7px 0 !important;
      color: var(--g-quote-text) !important;
      font-style: normal !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    ${MSG_SCOPE} blockquote p::before,
    ${MSG_SCOPE} blockquote p::after { content: none !important; display: none !important; }
    ${MSG_SCOPE} blockquote p { margin: 0 0 calc(var(--aiu-compact-para-gap) * 0.45) !important; color: inherit !important; }
    ${MSG_SCOPE} blockquote p:last-child { margin-bottom: 0 !important; }

    /* 表格全宽两端铺满 + 仅超宽大表水平滚动（兼容 ChatGPT DIL TableViewport / Table-s3u64B 与 Gemini table-block） */
    ${MSG_SCOPE} > div,
    ${TBL_WRAPPER} div:has(table) {
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }

    ${TBL_WRAPPER} :is(div:has(> table), .horizontal-scroll-wrapper, .table-block-component, response-element:has(table), table-block, .table-block, .table-content, [data-d-component="table"], [data-d-table-viewport="true"]),
    [data-d-component="table"],
    [data-d-table-viewport="true"] {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      background: transparent !important;
      box-sizing: border-box !important;
    }

    ${TBL_WRAPPER} :is(.table-content, div:has(> table)),
    [data-d-table-viewport="true"] {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: thin !important;
      -webkit-mask-image: none !important;
      mask-image: none !important;
      padding-top: 0 !important;
      padding-bottom: 1px !important;
      margin-top: calc(6px * var(--aiu-scale-factor)) !important;
      margin-bottom: calc(12px * var(--aiu-scale-factor)) !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) {
      display: table !important;
      width: 100% !important;
      min-width: 100% !important;
      max-width: none !important;
      table-layout: auto !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      margin: calc(6px * var(--aiu-scale-factor)) 0 calc(12px * var(--aiu-scale-factor)) !important;
      border: 1px solid var(--g-tbl-border) !important;
      border-radius: 8px !important;
      background: transparent !important;
      box-shadow: none !important;
      font-family: var(--aiu-font-family) !important;
      font-size: calc(var(--aiu-compact-text-size) * var(--aiu-tbl-font-ratio)) !important;
      line-height: var(--aiu-tbl-lh) !important;
      text-align: left !important;
      text-align-last: left !important;
      box-sizing: border-box !important;
    }

    ${TBL_WRAPPER} :is([data-d-table-viewport="true"], .table-content, div:has(> table)) table:not([role="grid"]) {
      margin: 0 !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) tr {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) :is(thead tr, tr:has(> th):not(:has(> td)), th) {
      background-color: var(--g-tbl-head-bg) !important;
      color: var(--g-tbl-head-text) !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) th {
      font-weight: 600 !important;
      padding: var(--aiu-tbl-pad-y) var(--aiu-tbl-pad-x) !important;
      border-top: none !important;
      border-left: none !important;
      border-bottom: 1.5px solid var(--g-tbl-head-line) !important;
      border-right: 1px solid var(--g-tbl-border) !important;
      box-shadow: none !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
      vertical-align: middle !important;
      text-align: left !important;
      text-align-last: left !important;
      min-width: 0 !important;
      max-width: none !important;
      box-sizing: border-box !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) th:last-child,
    ${TBL_WRAPPER} table:not([role="grid"]) tbody td:last-child { border-right: none !important; }

    ${TBL_WRAPPER} table:not([role="grid"]) tbody td {
      color: var(--g-tbl-text) !important;
      background-color: transparent !important;
      padding: var(--aiu-tbl-pad-y) var(--aiu-tbl-pad-x) !important;
      border-top: none !important;
      border-left: none !important;
      border-bottom: 1px solid var(--g-tbl-border) !important;
      border-right: 1px solid var(--g-tbl-border) !important;
      box-shadow: none !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
      vertical-align: top !important;
      text-align: var(--aiu-text-align) !important;
      text-align-last: left !important;
      min-width: 0 !important;
      max-width: none !important;
      box-sizing: border-box !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) tbody tr:last-child td { border-bottom: none !important; }

    /* 四角圆角裁切，防止表头背景或斑马纹溢出圆角边框 */
    ${TBL_WRAPPER} table:not([role="grid"]) thead > tr:first-child > :first-child,
    ${TBL_WRAPPER} table:not([role="grid"]):not(:has(> thead)) > tbody > tr:first-child > :first-child {
      border-top-left-radius: 7px !important;
    }
    ${TBL_WRAPPER} table:not([role="grid"]) thead > tr:first-child > :last-child,
    ${TBL_WRAPPER} table:not([role="grid"]):not(:has(> thead)) > tbody > tr:first-child > :last-child {
      border-top-right-radius: 7px !important;
    }
    ${TBL_WRAPPER} table:not([role="grid"]) tbody > tr:last-child > :first-child {
      border-bottom-left-radius: 7px !important;
    }
    ${TBL_WRAPPER} table:not([role="grid"]) tbody > tr:last-child > :last-child {
      border-bottom-right-radius: 7px !important;
    }

    /* 斑马纹与悬停高亮（兼容 thead+tbody 与 ChatGPT DIL 无 thead 的 tbody 首行表头） */
    ${TBL_WRAPPER} table:not([role="grid"]):has(> thead) tbody tr:not(:has(> th)):nth-child(even) > td,
    ${TBL_WRAPPER} table:not([role="grid"]):not(:has(> thead)) tbody:not(:has(> tr:first-child > th)) tr:not(:has(> th)):nth-child(even) > td,
    ${TBL_WRAPPER} table:not([role="grid"]):not(:has(> thead)) tbody:has(> tr:first-child > th) tr:not(:has(> th)):nth-child(odd) > td {
      background-color: var(--g-tbl-stripe-bg) !important;
    }
    ${TBL_WRAPPER} table:not([role="grid"]) tbody tr:not(:has(> th)):hover > td {
      background-color: var(--g-tbl-hover-bg) !important;
    }

    /* 6列及以上超宽表：保障非紧凑列最低可读宽度，自动触发视口横向滚动 */
    ${TBL_WRAPPER} table:not([role="grid"]):has(tr:first-child > :nth-child(6)) :is(th, td):not([data-aiu-col-compact="1"]) {
      min-width: 6em !important;
    }

    /* 单元格内嵌段落/文本组件（如 ChatGPT DIL <p class="TextBase-kDAqPL"> / <span data-d-component="text">）继承样式 */
    html body ${TBL_WRAPPER} table:not([role="grid"]) :is(th, td) :is(p, div, span, li, strong, b, em, i, [data-d-component="text"]) {
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
      letter-spacing: inherit !important;
      text-align: inherit !important;
      text-align-last: inherit !important;
      overflow-wrap: inherit !important;
      word-break: inherit !important;
      white-space: inherit !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    html body ${TBL_WRAPPER} table:not([role="grid"]) :is(th, td) :is(p, div, span, li, [data-d-component="text"]):not(strong):not(b):not(code) {
      padding: 0 !important;
    }
    html body ${TBL_WRAPPER} table:not([role="grid"]) :is(th, td) > :is(p, div) + :is(p, div) {
      margin-top: 4px !important;
    }
    html body ${TBL_WRAPPER} table:not([role="grid"]) th :is(p, div, span, li, strong, b, em, i, a, [data-d-component="text"]) {
      color: inherit !important;
      background: transparent !important;
    }
    html body ${TBL_WRAPPER} table:not([role="grid"]) td :is(p, div, span, li, [data-d-component="text"]):not(strong):not(b):not(a):not(code):not(em):not(i) {
      color: inherit !important;
    }
    html body ${TBL_WRAPPER} table:not([role="grid"]) :is(th, td) code {
      font-size: 0.92em !important;
    }

    ${TBL_WRAPPER} table:not([role="grid"]) th[data-aiu-nowrap-th="1"] { white-space: nowrap !important; }
    ${TBL_WRAPPER} table:not([role="grid"]) :is(th, td)[data-aiu-col-compact="1"] {
      white-space: nowrap !important;
      text-align: center !important;
      text-align-last: center !important;
    }

    /* DIL 结构化容器卡片（Box / Row / Badge / Divider）自适应紧凑美化 */
    :is([data-d-component="box"][data-d-has-border], [data-d-component="box"][data-d-direction="col"]:has(> [data-d-component="row"]), .Box-JYjgF4[data-d-has-border]) {
      padding: calc(9px * var(--aiu-scale-factor)) calc(12px * var(--aiu-scale-factor)) !important;
      gap: calc(6px * var(--aiu-scale-factor)) !important;
      border-radius: 9px !important;
      border: 1px solid var(--g-tbl-border) !important;
      background-color: var(--g-tbl-stripe-bg) !important;
      box-sizing: border-box !important;
      margin: calc(6px * var(--aiu-scale-factor)) 0 calc(10px * var(--aiu-scale-factor)) !important;
    }

    /* 彻底消除 DIL Box 内部段落的下外边距，避免与 flex 布局 gap 叠加造成间距膨胀 */
    [data-d-component="box"] :is(p, [data-d-component="text"]) {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    /* DIL 行容器（指标项与状态徽章）垂直居中与紧凑对齐 */
    :is([data-d-component="row"], [data-d-component="box"][data-d-direction="row"]) {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      min-height: calc(23px * var(--aiu-scale-factor)) !important;
      gap: 8px !important;
    }

    /* DIL 细分割线收紧 */
    :is([data-d-component="divider"], .Divider-aIXBUs) {
      margin: calc(3px * var(--aiu-scale-factor)) 0 !important;
      border: none !important;
      border-top: 1px solid var(--g-tbl-border) !important;
      opacity: 0.85 !important;
    }

    /* DIL 徽章（通过 / 未通过等）保持紧凑并与文字完美垂直对齐 */
    :is([data-d-component="badge"], [class*="Badge-"]) {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      padding: 2.5px 8px !important;
      border-radius: 9999px !important;
      font-size: 11.5px !important;
      font-weight: 500 !important;
      white-space: nowrap !important;
      flex-shrink: 0 !important;
    }

    /* 消除 ChatGPT 遮罩层 Edges-nCUHEi 产生的额外阴影与多重边框 */
    :is(.Edges-nCUHEi, [class*="Edges-"]) {
      display: none !important;
    }

    /* 卡片内部嵌套表格消除二次冗余边距 */
    [data-d-component="box"] :is([data-d-component="table"], [data-d-table-viewport="true"]) {
      margin-top: calc(2px * var(--aiu-scale-factor)) !important;
      margin-bottom: calc(2px * var(--aiu-scale-factor)) !important;
    }

    /* 行内代码与公式 */
    ${MSG_SCOPE} :is(code:not(pre code), code.code, b.code),
    code[data-d-component="code"] {
      display: inline !important;
      white-space: normal !important;
      word-break: break-all !important;
      overflow-wrap: anywhere !important;
      background-color: var(--g-inline-code-bg) !important;
      color: var(--g-inline-code-text) !important;
      border: 1px solid var(--g-inline-code-border) !important;
      padding: 1px 5px !important;
      margin: 0 2px !important;
      border-radius: 4px !important;
      font-size: calc(var(--aiu-compact-text-size) * 0.86) !important;
      font-weight: 600 !important;
    }

    .katex-display, .math-block {
      margin: 8px 0 !important;
      max-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      text-align: center !important;
    }

    /* 通用代码折叠按钮与折叠态 */
    .aiu-code-fold-btn {
      display: inline-flex !important;
      align-items: center !important;
      margin-left: 8px !important;
      padding: 1px 8px !important;
      border-radius: 999px !important;
      border: 1px solid rgba(100, 116, 139, 0.32) !important;
      background: rgba(255, 255, 255, 0.78) !important;
      color: var(--g-link-color) !important;
      font-size: 10.5px !important;
      font-weight: 600 !important;
      line-height: 16px !important;
      cursor: pointer !important;
    }

    html[data-aiu-dark="1"] .aiu-code-fold-btn {
      background: rgba(30, 41, 59, 0.88) !important;
      border-color: rgba(148, 163, 184, 0.30) !important;
    }

    [data-aiu-code-folded="1"] pre,
    [data-aiu-code-folded="1"] .code-container,
    [data-aiu-code-folded="1"] > div:not(:first-child) {
      display: none !important;
    }

    pre[data-aiu-standalone-pre="1"] {
      position: relative !important;
      margin: 8px 0 !important;
      padding: 28px 12px 10px !important;
      border-radius: 8px !important;
      border: 1px solid var(--g-code-border) !important;
      background-color: var(--g-code-bg) !important;
      color: var(--g-code-text) !important;
      max-height: var(--aiu-code-max-height) !important;
      overflow: auto !important;
      box-sizing: border-box !important;
    }

    .aiu-standalone-toolbar {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 26px !important;
      padding: 0 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      background-color: var(--g-code-header-bg) !important;
      color: var(--g-code-header-text) !important;
      border-bottom: 1px solid var(--g-code-border) !important;
      font-size: 11px !important;
      user-select: none !important;
    }

    pre[data-aiu-standalone-pre="1"][data-aiu-code-folded="1"] {
      display: block !important;
      max-height: 28px !important;
      height: 28px !important;
      padding-bottom: 0 !important;
      overflow: hidden !important;
    }

    #${PANEL_HOST_ID} {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `;

  const SITE_SPECIFIC_CSS = {
    chatgpt: `
      :root,
      [class*="--thread-content-max-width"] {
        --thread-content-responsive-max-width: var(--aiu-compact-content-width) !important;
        --thread-content-max-width: var(--aiu-compact-content-width) !important;
      }

      /* 仅对真正的居中对话容器设置 max-width 与自动左右外边距，避免外层 flex-1 容器左偏 */
      [data-thread-user-message-navigation-content="true"] {
        width: 100% !important;
        max-width: calc(var(--aiu-compact-content-width) + var(--thread-body-inline-padding, 0px) * 2) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        transition: max-width 0.18s ease !important;
      }

      form[data-chatgpt-composer],
      [data-composer-layout="multiline"],
      [data-composer-body] {
        width: 100% !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      /* 防止项目页与首页输入框在输入或按回车切换 multiline 时高度坍缩消失 */
      [data-composer-body] {
        min-height: 46px !important;
        height: auto !important;
        overflow: visible !important;
      }
      [data-composer-input],
      [data-rich-text-layout] {
        min-height: 24px !important;
        height: auto !important;
        max-height: 36vh !important;
        overflow-y: auto !important;
      }
      .ProseMirror[data-composer-markdown] {
        min-height: 24px !important;
        height: auto !important;
      }

      .ProseMirror[data-composer-markdown],
      .ProseMirror[data-composer-markdown] p,
      #prompt-textarea {
        text-align: left !important;
        text-align-last: left !important;
      }

      /* ChatGPT 活动流 / 思考链 / 步骤调用（data-spacing="activity"）紧凑与美化 */
      :is([data-spacing="activity"], .stack-eQ550z, .detail-kV0yGe) {
        gap: calc(4px * var(--aiu-scale-factor)) !important;
        padding-top: 2px !important;
        padding-bottom: 3px !important;
        margin: calc(4px * var(--aiu-scale-factor)) 0 !important;
        --conversation-activity-gap: 4px !important;
      }

      :is([data-spacing="activity"], .detail-kV0yGe) :is(.MarkdownRoot-rZKhxa, [data-markdown-text-tone="tertiary"]) {
        font-size: calc(var(--aiu-compact-text-size) * 0.85) !important;
        line-height: 1.40 !important;
        color: var(--color-text-tertiary, #8e8ea0) !important;
      }

      :is([data-spacing="activity"], .detail-kV0yGe) :is(p, .Paragraph-kKnbIo) {
        font-size: inherit !important;
        line-height: inherit !important;
        color: inherit !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      :is([data-spacing="activity"], .detail-kV0yGe) :is(.group\/activity-header, [class*="activity-header"]) {
        min-height: calc(20px * var(--aiu-scale-factor)) !important;
        padding: 1px 0 !important;
        gap: 4px !important;
      }

      :is([data-spacing="activity"], .detail-kV0yGe) :is(.summary-fnAD_7, [class*="summary-"]) {
        font-size: calc(var(--aiu-compact-text-size) * 0.85) !important;
        line-height: 1.40 !important;
      }

      :is([data-spacing="activity"], .detail-kV0yGe) svg {
        opacity: 0.75 !important;
      }

      /* 全链路锁定外层容器宽度 + 表格两端铺满 / 仅超宽大表水平滚动 */
      [data-message-author-role="assistant"],
      [data-message-author-role="assistant"] > div,
      [data-message-author-role="assistant"] div:has(table),
      [data-message-author-role="assistant"] div:has([data-d-table-viewport="true"]),
      [data-dil-response],
      [data-dil-response] > div,
      .markdown,
      .markdown > div,
      [data-turn-key] > div {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      .markdown div:has(> table),
      [data-message-author-role="assistant"] div:has(> table),
      [data-d-table-viewport="true"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        padding-bottom: 1px !important;
        box-sizing: border-box !important;
      }
      .markdown table:not([role="grid"]),
      [data-message-author-role="assistant"] table:not([role="grid"]),
      [data-d-table-viewport="true"] table:not([role="grid"]) {
        width: 100% !important;
        min-width: 100% !important;
        max-width: none !important;
        table-layout: auto !important;
      }
      .markdown :is(th, td):not([data-aiu-col-compact="1"]),
      [data-message-author-role="assistant"] :is(th, td):not([data-aiu-col-compact="1"]),
      [data-d-table-viewport="true"] :is(th, td):not([data-aiu-col-compact="1"]) {
        white-space: normal !important;
        word-break: normal !important;
        overflow-wrap: break-word !important;
      }

      [data-code-block="true"] {
        border-radius: 8px !important;
        border: 1px solid var(--g-code-border) !important;
        background-color: var(--g-code-bg) !important;
        overflow: hidden !important;
        margin: 8px 0 !important;
      }
      [data-code-block="true"] > [data-markdown-copy="exclude"] {
        display: flex !important;
        align-items: center !important;
        padding: 3px 10px !important;
        min-height: 28px !important;
        background-color: var(--g-code-header-bg) !important;
        color: var(--g-code-header-text) !important;
        border-bottom: 1px solid var(--g-code-border) !important;
        font-size: 11.5px !important;
      }
      [data-code-block="true"] pre {
        max-height: var(--aiu-code-max-height) !important;
        overflow: auto !important;
        background-color: var(--g-code-bg) !important;
        color: var(--g-code-text) !important;
      }
      [data-user-message-bubble="true"],
      [data-message-author-role="user"] .whitespace-pre-wrap,
      #prompt-textarea {
        font-family: var(--aiu-font-family) !important;
        font-size: var(--aiu-compact-text-size) !important;
        line-height: var(--aiu-compact-line-height) !important;
      }

      /* 收紧对话轮次与连续 Tool Call（MCP / AgentDock 卡片）的上下间距 */
      [data-turn-key], article[data-testid^="conversation-turn-"] {
        padding-top: 3px !important;
        padding-bottom: 3px !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }
      :root[data-aiu-chrome="compact"] :is([data-turn-key], article[data-testid^="conversation-turn-"]):has(iframe, [data-message-author-role="tool"], [data-testid*="tool"]),
      :root[data-aiu-chrome="compact"] [data-message-author-role="tool"] {
        padding-top: 1px !important;
        padding-bottom: 1px !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }
      :root[data-aiu-chrome="compact"] div:has(> iframe) {
        margin-top: 2px !important;
        margin-bottom: 2px !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      :root[data-aiu-chrome="compact"] [data-message-author-role="assistant"] > div:has(iframe) {
        margin-top: 2px !important;
        margin-bottom: 2px !important;
        gap: 4px !important;
      }

      /* 隐藏底部附属说明（ChatGPT for Teachers / 模型训练声明） */
      :root[data-aiu-chrome="compact"] [class*="ComposerBannerPortal"]:has(.text-codex-description),
      :root[data-aiu-chrome="compact"] [data-markdown-copy="exclude"]:has(.text-codex-description),
      :root[data-aiu-chrome="compact"] .text-codex-description[data-markdown-copy="exclude"],
      :root[data-aiu-chrome="compact"] [data-aiu-disclaimer="1"] {
        display: none !important;
      }
      [data-aiu-hide-invite="1"] { display: none !important; }
    `,
    gemini: `
      .conversation-container,
      .input-area-container {
        width: calc(100% - 28px) !important;
        max-width: var(--aiu-compact-content-width) !important;
        box-sizing: border-box !important;
        transition: max-width 0.18s ease !important;
      }
      .conversation-container :is(model-response, response-container, .response-container, .response-content, model-response-content, structured-content-container, message-content, .markdown-main-panel, .markdown) {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        padding-right: 0 !important;
        margin-right: 0 !important;
        box-sizing: border-box !important;
      }

      /* 顶栏与左侧导航栏（lr26-theme / enable-sidenav-v2）紧凑瘦身 */
      :root[data-aiu-chrome="compact"] :is(.bard-header, top-bar-actions, .header-container) {
        min-height: 44px !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container {
        font-family: var(--aiu-font-family) !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .mat-mdc-list-item.gem-nav-list-item {
        --mdc-list-list-item-one-line-container-height: 34px !important;
        min-height: 34px !important;
        height: 34px !important;
        padding-top: 2px !important;
        padding-bottom: 2px !important;
        border-radius: 8px !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .mat-mdc-list-item .title-text {
        font-family: var(--aiu-font-family) !important;
        font-size: 13px !important;
        line-height: 1.35 !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .leading-icon-container {
        margin-right: 10px !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .leading-icon-container mat-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .expandable-section-header-row {
        min-height: 30px !important;
        height: 30px !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .expandable-section-title {
        font-family: var(--aiu-font-family) !important;
        font-size: 12px !important;
        font-weight: 600 !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .section-divider {
        margin: 4px 12px !important;
      }
      :root[data-aiu-chrome="compact"] .overflow-container .desktop-controls {
        padding-top: 2px !important;
        padding-bottom: 4px !important;
      }
      :root[data-aiu-chrome="compact"] sidenav-mavatar-footer .mavatar-footer-row {
        min-height: 40px !important;
        padding: 4px 8px !important;
      }
      :root[data-aiu-chrome="compact"] sidenav-mavatar-footer .mavatar-container,
      :root[data-aiu-chrome="compact"] sidenav-mavatar-footer .mavatar-image {
        width: 26px !important;
        height: 26px !important;
      }
      :root[data-aiu-chrome="compact"] sidenav-mavatar-footer .mavatar-user-name {
        font-family: var(--aiu-font-family) !important;
        font-size: 12.5px !important;
        line-height: 1.25 !important;
      }
      :root[data-aiu-chrome="compact"] sidenav-mavatar-footer .mavatar-tier-label {
        font-size: 11px !important;
        line-height: 1.2 !important;
      }

      /* 用户提问与输入框 */
      .query-text, .text-input-field, rich-textarea .ql-editor {
        font-family: var(--aiu-font-family) !important;
        font-size: var(--aiu-compact-text-size) !important;
        line-height: var(--aiu-compact-line-height) !important;
      }
      .user-query-bubble-with-background { padding: 8px 14px !important; border-radius: 18px !important; }

      /* 表格字体与行高强制同步缩放 + 单元格内 span 继承（覆盖 Gemini 原生 table-block 字号） */
      html body .markdown :is(table-block, .table-block, .table-content, table) {
        font-family: var(--aiu-font-family) !important;
        font-size: calc(var(--aiu-compact-text-size) * var(--aiu-tbl-font-ratio)) !important;
        line-height: var(--aiu-tbl-lh) !important;
      }
      html body .markdown :is(thead th, tbody td, th, td) {
        font-family: var(--aiu-font-family) !important;
        font-size: calc(var(--aiu-compact-text-size) * var(--aiu-tbl-font-ratio)) !important;
        line-height: var(--aiu-tbl-lh) !important;
        padding: var(--aiu-tbl-pad-y) var(--aiu-tbl-pad-x) !important;
      }
      html body .markdown :is(th, td) :is(p, div, span, li, strong, b, em, i) {
        font-family: inherit !important;
        font-size: inherit !important;
        line-height: inherit !important;
        margin: 0 !important;
        text-align: inherit !important;
        text-align-last: inherit !important;
      }
      html body .markdown :is(th, td) :is(p, div, span, li) {
        color: inherit !important;
      }
      .markdown .table-block .table-footer {
        min-height: 22px !important;
        height: 22px !important;
        padding: 0 6px !important;
        opacity: 0.62 !important;
        transition: opacity 0.15s ease !important;
      }
      .markdown .table-block:hover .table-footer { opacity: 1 !important; }
      .markdown .table-block .table-footer button.mdc-icon-button {
        width: 22px !important;
        height: 22px !important;
        padding: 1px !important;
      }

      /* Gemini 结构化步骤组件 (<sequence>) 主题化与紧凑化 */
      .markdown .attachment-container {
        margin: calc(6px * var(--aiu-scale-factor)) 0 calc(10px * var(--aiu-scale-factor)) !important;
      }
      .markdown sequence,
      .markdown .sequence-container {
        display: block !important;
        margin: 4px 0 !important;
        padding: 0 !important;
      }
      .markdown .sequence-event {
        padding-bottom: calc(8px * var(--aiu-scale-factor)) !important;
      }
      .markdown .sequence-event:last-child { padding-bottom: 0 !important; }
      .markdown .sequence-event-marker {
        width: 21px !important;
        height: 21px !important;
        min-width: 21px !important;
        line-height: 19px !important;
        border-radius: 6px !important;
        background-color: var(--g-ol-badge-bg) !important;
        color: var(--g-ol-badge-text) !important;
        border: 1px solid var(--g-ol-badge-border) !important;
        font-family: var(--aiu-font-family) !important;
        font-size: 11.5px !important;
        font-weight: 700 !important;
        box-shadow: var(--g-badge-shadow) !important;
      }
      .markdown .sequence-event-line {
        background-color: var(--g-hr-color) !important;
      }
      .markdown .sequence-event-title {
        font-family: var(--aiu-font-family) !important;
        font-size: calc(var(--aiu-compact-text-size) * 1.03) !important;
        line-height: 1.42 !important;
        font-weight: 600 !important;
        color: var(--g-h3-color) !important;
        margin-bottom: 2px !important;
      }
      .markdown .sequence-event-subtitle {
        font-family: var(--aiu-font-family) !important;
        font-size: calc(var(--aiu-compact-text-size) * 0.85) !important;
        line-height: 1.4 !important;
        color: var(--g-link-color) !important;
        opacity: 0.88 !important;
        margin-bottom: 4px !important;
      }
      .markdown .sequence-event-description,
      .markdown .sequence-event-description :is(structured-node-sequence, structured-text) {
        font-family: var(--aiu-font-family) !important;
        font-size: var(--aiu-compact-text-size) !important;
        line-height: var(--aiu-compact-line-height) !important;
        color: var(--g-body-color) !important;
      }

      /* 代码块双层边框消除与紧凑头 */
      code-block > .code-block {
        margin: 8px 0 !important;
        border-radius: 8px !important;
        border: 1px solid var(--g-code-border) !important;
        background-color: var(--g-code-bg) !important;
        overflow: hidden !important;
      }
      code-block .formatted-code-block-internal-container {
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      .code-block-decoration, code-block .header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 3px 10px !important;
        min-height: 28px !important;
        background-color: var(--g-code-header-bg) !important;
        color: var(--g-code-header-text) !important;
        border-bottom: 1px solid var(--g-code-border) !important;
        font-size: 11.5px !important;
      }
      .code-block-decoration .buttons,
      code-block .header .buttons {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
      }
      .code-block-decoration :is(button:not(.aiu-code-fold-btn), mat-icon, gem-icon-button, svg),
      code-block .header :is(button:not(.aiu-code-fold-btn), mat-icon, gem-icon-button, svg) {
        color: var(--g-code-header-text) !important;
      }
      code-block pre,
      code-block pre code,
      code-block .code-container {
        background-color: var(--g-code-bg) !important;
        color: var(--g-code-text) !important;
      }
      code-block pre {
        max-height: var(--aiu-code-max-height) !important;
        overflow: auto !important;
      }
      :root[data-aiu-dark="0"] code-block pre code {
        filter: var(--g-code-token-filter) !important;
      }

      /* 追问建议容器与标题 */
      :root[data-aiu-elicit="hidden"] .elicitations-container { display: none !important; }
      .elicitations-container {
        margin: 10px 0 4px !important;
        padding: 8px 12px !important;
        border-radius: 9px !important;
        background-color: var(--g-elicit-bg) !important;
        border: 1px dashed var(--g-elicit-border) !important;
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
      }
      .elicitations-container .elicitations-message {
        width: 100% !important;
        flex-basis: 100% !important;
        font-family: var(--aiu-font-family) !important;
        font-size: calc(var(--aiu-compact-text-size) * 0.88) !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        color: var(--g-h3-color) !important;
        margin: 0 0 2px !important;
      }
      .elicitations-container .elicitation-item {
        padding: 4px 10px !important;
        min-height: 27px !important;
        border-radius: 7px !important;
        border: 1px solid var(--g-elicit-item-border) !important;
        background-color: var(--g-elicit-item-bg) !important;
        color: var(--g-elicit-item-text) !important;
        font-size: calc(var(--aiu-compact-text-size) * 0.85) !important;
      }
      :root[data-aiu-elicit="list"] .elicitations-container { flex-direction: column !important; }
      :root[data-aiu-elicit="list"] .elicitations-container .elicitation-item { width: 100% !important; }
      p:has(a[data-test-id="footer-privacy-notice-link"]), hallucination-disclaimer { display: none !important; }
    `,
    notebooklm: `
      :root[data-aiu-chrome="compact"] :is(header, .notebook-header, mat-toolbar.mat-toolbar-single-row) {
        min-height: 44px !important;
        height: 44px !important;
        padding-top: 2px !important;
        padding-bottom: 2px !important;
      }
      :root[data-aiu-chrome="compact"] :is(.notebook-container, .panels-container, .workspace-container, main) {
        gap: 8px !important;
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }
      :root[data-aiu-chrome="compact"] :is(.panel-header, .sources-header, .studio-header, .chat-header) {
        min-height: 36px !important;
        padding: 5px 12px !important;
      }
      :root[data-aiu-chrome="compact"] :is(.source-item, .source-row, .studio-card, .note-card, .artifact-item) {
        padding-top: 5px !important;
        padding-bottom: 5px !important;
        margin-bottom: 4px !important;
      }
      :root[data-aiu-chrome="compact"] chat-panel-header .cover-image {
        min-height: 0 !important;
        padding: 10px 14px 8px !important;
        margin-bottom: 6px !important;
        border-radius: 10px !important;
      }
      :root[data-aiu-chrome="compact"] chat-panel-header .cover-image[style*="none"] .cover-image-empty-icon {
        display: none !important;
      }
      :root[data-aiu-chrome="compact"] chat-panel-header .cover-title {
        font-size: calc(var(--aiu-compact-text-size) * 1.24) !important;
        line-height: 1.32 !important;
        margin: 2px 0 4px !important;
        font-weight: 700 !important;
      }
      .notebook-summary .summary-content {
        padding: 9px 13px !important;
        border-radius: 8px !important;
        background-color: var(--g-quote-bg) !important;
        border-left: 3.5px solid var(--g-h1-border) !important;
        color: var(--g-body-color) !important;
        font-family: var(--aiu-font-family) !important;
        font-size: calc(var(--aiu-compact-text-size) * 0.94) !important;
        line-height: 1.58 !important;
      }
      .notebook-summary .summary-content p { margin: 0 !important; color: inherit !important; }
      .notebook-summary .summary-content strong { color: var(--g-strong-color) !important; font-weight: 600 !important; }
      .chat-panel-content { padding-left: 12px !important; padding-right: 12px !important; box-sizing: border-box !important; }
      :is(chat-panel-header, .chat-panel-empty-state, .date-separator, .chat-message-pair, .chat-message, .chat-input-wrapper, .chat-bottom-bar) {
        width: 100% !important;
        max-width: var(--aiu-compact-content-width) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box !important;
        transition: max-width 0.18s ease !important;
      }
      .chat-message-pair { margin-bottom: 8px !important; }
      mat-card.from-user-message-card-content { border-radius: 14px !important; box-shadow: none !important; }
      mat-card-content.from-user-message-inner-content { padding: 7px 13px !important; }
      .from-user-message-inner-content :is(.md3-body-text, p) {
        font-family: var(--aiu-font-family) !important;
        font-size: var(--aiu-compact-text-size) !important;
        line-height: var(--aiu-compact-line-height) !important;
        margin: 0 !important;
        text-align: left !important;
        text-align-last: left !important;
      }
      mat-card.to-user-message-card-content {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
      }
      mat-card-content.to-user-message-inner-content { padding: 2px !important; }
      thinking-chain-view .thinking-chain {
        margin: 0 0 8px !important;
        border-radius: 8px !important;
        border: 1px dashed var(--g-hr-color) !important;
        background-color: var(--g-quote-bg) !important;
      }
      thinking-chain-view .thinking-chain__header { min-height: 28px !important; padding: 3px 10px !important; font-size: 12px !important; }
      mat-card-actions.message-actions { min-height: 28px !important; padding: 2px 0 0 !important; margin-top: 2px !important; opacity: 0.78 !important; }
      button.citation-marker,
      .citation-marker {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 18px !important;
        height: 18px !important;
        padding: 0 5px !important;
        margin: 0 2px !important;
        border-radius: 999px !important;
        background-color: var(--g-cite-bg) !important;
        color: var(--g-cite-text) !important;
        border: 1px solid var(--g-cite-border) !important;
        font-size: 10.5px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        vertical-align: 1px !important;
      }
      button.citation-marker mat-icon,
      .citation-marker mat-icon {
        font-size: 13px !important;
        width: 13px !important;
        height: 13px !important;
        line-height: 13px !important;
        color: inherit !important;
      }
    `,
    aistudio: `
      :root[data-aiu-chrome="compact"] :is(ms-header-bar, ms-navbar header, mat-toolbar.mat-toolbar-single-row) {
        min-height: 44px !important;
        height: 44px !important;
        padding-top: 2px !important;
        padding-bottom: 2px !important;
      }
      :root[data-aiu-chrome="compact"] :is(ms-run-settings, .settings-panel, .right-panel) {
        padding: 8px 10px !important;
      }
      ms-thought-chunk {
        display: block !important;
        margin: 2px 0 8px !important;
        border-radius: 8px !important;
        border: 1px dashed var(--g-hr-color) !important;
        background-color: var(--g-quote-bg) !important;
        overflow: hidden !important;
      }
      ms-thought-chunk .top-panel-header,
      ms-thought-chunk .mat-expansion-panel-header {
        min-height: 30px !important;
        height: auto !important;
        padding: 3px 10px !important;
        font-size: 12px !important;
      }
      ms-thought-chunk .thought-panel ms-cmark-node.cmark-node {
        font-size: calc(var(--aiu-compact-text-size) * 0.88) !important;
        line-height: 1.52 !important;
        opacity: 0.90 !important;
      }
      :root[data-aiu-chrome="compact"] ms-hallucinations-disclaimer { display: none !important; }
      :is(ms-chat-turn, .chat-turn-container, ms-prompt-input-wrapper, .prompt-input-wrapper) {
        width: 100% !important;
        max-width: var(--aiu-compact-content-width) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box !important;
        transition: max-width 0.18s ease !important;
      }
      .chat-turn-container { padding: 6px 12px !important; margin-bottom: 4px !important; }
      .chat-turn-container.user .turn-content {
        padding: 8px 14px !important;
        border-radius: 12px !important;
        background-color: var(--g-quote-bg) !important;
        border: 1px solid var(--g-hr-color) !important;
      }
      .chat-turn-container.user ms-cmark-node.cmark-node p { text-align: left !important; text-align-last: left !important; }
      ms-cmark-node.cmark-node a[href*="vertexaisearch.cloud.google.com"] {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 17px !important;
        height: 17px !important;
        padding: 0 4px !important;
        margin: 0 1px !important;
        border-radius: 999px !important;
        background-color: var(--g-ol-badge-bg) !important;
        color: var(--g-ol-badge-text) !important;
        border: 1px solid var(--g-ol-badge-border) !important;
        text-decoration: none !important;
        font-size: 10.5px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        vertical-align: 1px !important;
      }
      ms-grounding-sources {
        display: block !important;
        margin-top: 8px !important;
        padding: 6px 10px !important;
        border-radius: 8px !important;
        background-color: var(--g-quote-bg) !important;
        border: 1px solid var(--g-hr-color) !important;
      }
      ms-grounding-sources p.title { font-size: 11.5px !important; font-weight: 600 !important; margin: 0 0 4px !important; opacity: 0.85 !important; }
      ms-grounding-sources ol {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 4px 6px !important;
        max-height: 68px !important;
        overflow-y: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        list-style: none !important;
      }
      ms-grounding-sources ol li {
        padding: 1px 7px !important;
        margin: 0 !important;
        border-radius: 999px !important;
        background-color: var(--g-inline-code-bg) !important;
        border: 1px solid var(--g-hr-color) !important;
        font-size: 11px !important;
      }
      ms-grounding-sources ol li::before { content: none !important; }
      ms-grounding-sources ol li a { color: var(--g-link-color) !important; border: none !important; }
      ms-search-entry-point .search-entry-container { margin-top: 6px !important; padding: 6px 10px !important; border-radius: 8px !important; }
      ms-search-entry-point .chip { height: 24px !important; padding: 0 9px !important; font-size: 11px !important; }
      ms-code-block {
        display: block !important;
        margin: 8px 0 !important;
        border-radius: 8px !important;
        border: 1px solid var(--g-code-border) !important;
        background-color: var(--g-code-bg) !important;
        overflow: hidden !important;
      }
      ms-code-block .code-block-header, ms-code-block header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        min-height: 28px !important;
        padding: 2px 10px !important;
        background-color: var(--g-code-header-bg) !important;
        color: var(--g-code-header-text) !important;
        border-bottom: 1px solid var(--g-code-border) !important;
        font-size: 11.5px !important;
      }
      ms-code-block pre {
        max-height: var(--aiu-code-max-height) !important;
        overflow: auto !important;
        background-color: var(--g-code-bg) !important;
        color: var(--g-code-text) !important;
      }
    `,
    antigravity: `
      :root[data-aiu-site="antigravity"],
      [data-testid="overview-panel-host"],
      [data-testid="conversation-view"],
      [data-testid="autoscroll-viewport"] {
        --max-conversation-width: var(--aiu-compact-content-width) !important;
      }
      html body [data-testid="autoscroll-viewport"] > div.mx-auto,
      html body [data-testid="conversation-view"] div.mx-auto:has([data-testid="agent-input-box"]),
      html body div.w-full:has(> div > div > [data-testid="agent-input-box"]) {
        max-width: var(--aiu-compact-content-width) !important;
      }
      :root[data-aiu-chrome="compact"] [data-main-content-header="true"] {
        height: 36px !important;
        min-height: 36px !important;
      }
      :root[data-aiu-chrome="compact"] [data-main-content-header="true"] > div {
        min-height: 36px !important;
      }
      :root[data-aiu-chrome="compact"] div.absolute.left-0.top-0[style*="height: 40px"] {
        height: 36px !important;
      }
      :root[data-aiu-chrome="compact"] [data-testid="agent-input-box"] {
        padding-bottom: 0 !important;
      }
      :root[data-aiu-chrome="compact"] [data-testid="autoscroll-viewport"] > div > div > div[style*="height: 48px"] {
        height: 24px !important;
      }
      html body [data-markdown-root] > style + * {
        margin-top: 0 !important;
      }
      html body [data-markdown-root] :is(ul, ol) {
        padding-left: 0 !important;
        padding-inline-start: 0 !important;
        list-style: none !important;
      }
      html body [data-markdown-root] h1 {
        margin: calc(16px * var(--aiu-scale-factor)) 0 calc(8px * var(--aiu-scale-factor)) !important;
      }
      html body [data-markdown-root] h2 {
        margin: calc(14px * var(--aiu-scale-factor)) 0 calc(6px * var(--aiu-scale-factor)) !important;
      }
      html body [data-markdown-root] h3 {
        margin: calc(11px * var(--aiu-scale-factor)) 0 calc(5px * var(--aiu-scale-factor)) !important;
        padding: calc(4px * var(--aiu-scale-factor)) 10px calc(4px * var(--aiu-scale-factor)) 30px !important;
      }
      html body [data-markdown-root] h4 {
        margin: calc(9px * var(--aiu-scale-factor)) 0 calc(4px * var(--aiu-scale-factor)) 2px !important;
      }
      [data-markdown-root] .markdown-alert {
        margin: 8px 0 !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        background-color: var(--g-quote-bg) !important;
      }
      [data-markdown-root] .markdown-alert p {
        margin-bottom: 4px !important;
      }
      [data-markdown-root] .markdown-alert p:last-child {
        margin-bottom: 0 !important;
      }
      [data-testid="user-input-step"] {
        padding-top: 14px !important;
      }
      .agy-user-bubble-frame {
        background: var(--g-hr-color) !important;
        border-radius: 12px !important;
      }
      [data-testid="user-message-bubble"].agy-user-bubble {
        padding: 7px 12px !important;
        border-radius: 11px !important;
        background-color: var(--g-quote-bg) !important;
        color: var(--g-body-color) !important;
      }
      [data-testid="user-message-content"] > div {
        font-family: var(--aiu-font-family) !important;
        font-size: var(--aiu-compact-text-size) !important;
        line-height: var(--aiu-compact-line-height) !important;
        letter-spacing: var(--aiu-compact-letter-spacing) !important;
        color: var(--g-body-color) !important;
        text-align: left !important;
        text-align-last: left !important;
      }
      [data-markdown-root] .md-table-host[data-width-mode] {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        margin: 8px 0 !important;
        margin-inline: 0 !important;
        transform: none !important;
      }
      [data-markdown-root] [data-md-table] > table > :is(thead, tbody) > tr > :is(th, td) > div {
        min-width: 0 !important;
        max-width: 100% !important;
        width: auto !important;
      }
      [data-markdown-root] .agy-md-table.md-table-frame {
        border: none !important;
        border-radius: 8px !important;
        overflow: visible !important;
        width: 100% !important;
      }
      [data-markdown-root] .md-table-scroll {
        overflow-x: auto !important;
        overflow-y: hidden !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      [data-markdown-root] pre {
        margin: 8px 0 !important;
        padding: 0 !important;
        border: none !important;
        background: transparent !important;
        white-space: normal !important;
      }
      [data-markdown-root] pre > div {
        border-radius: 8px !important;
        border: 1px solid var(--g-code-border) !important;
        background-color: var(--g-code-bg) !important;
        overflow: hidden !important;
        margin: 0 !important;
      }
      [data-markdown-root] pre > div > div:first-child {
        min-height: 28px !important;
        padding: 2px 10px !important;
        background-color: var(--g-code-header-bg) !important;
        color: var(--g-code-header-text) !important;
        border-bottom: 1px solid var(--g-code-border) !important;
        font-size: 11.5px !important;
      }
      [data-markdown-root] pre > div > div:first-child .font-sans {
        font-size: 11.5px !important;
        color: var(--g-code-header-text) !important;
      }
      [data-markdown-root] pre .p-3 {
        padding: 8px 12px !important;
      }
      [data-markdown-root] pre .code-block {
        max-height: var(--aiu-code-max-height) !important;
        overflow: auto !important;
        background-color: var(--g-code-bg) !important;
        color: var(--g-code-text) !important;
        font-size: calc(var(--aiu-compact-text-size) * 0.88) !important;
        line-height: 1.50 !important;
        filter: var(--g-code-token-filter) !important;
      }
      [data-markdown-root] pre[data-aiu-code-folded="1"] > div > div:not(:first-child) {
        display: none !important;
      }
    `
  };

  const gmStyleNodes = new Map();

  function getOpenShadowRoots() {
    const roots = [];
    if (!document.body) return roots;
    const walk = (node) => {
      for (const el of node.querySelectorAll('*')) {
        if (el.id === PANEL_HOST_ID || !el.shadowRoot) continue;
        roots.push(el.shadowRoot);
        walk(el.shadowRoot);
      }
    };
    try { walk(document.body); } catch {}
    return roots;
  }

  function injectCssString(id, cssText) {
    const targetParent = document.head || document.documentElement;
    let style = document.getElementById(id) || gmStyleNodes.get(id);

    if (style && style.isConnected) {
      if (style.textContent !== cssText) style.textContent = cssText;
      if (targetParent && style.parentNode !== targetParent) {
        targetParent.appendChild(style);
      } else if (targetParent && targetParent.lastElementChild !== style && id !== BRAND_STYLE_ID) {
        targetParent.appendChild(style);
      }
    } else if (typeof GM_addStyle === 'function') {
      try {
        const gmEl = GM_addStyle(cssText);
        if (gmEl && gmEl.nodeType === 1) {
          gmEl.id = id;
          gmStyleNodes.set(id, gmEl);
          style = gmEl;
        }
      } catch {}
    }

    if (!style || !style.isConnected) {
      if (targetParent) {
        style = document.createElement('style');
        style.id = id;
        style.textContent = cssText;
        targetParent.appendChild(style);
      }
    }

    if (SITE_KEY === 'antigravity') {
      for (const sr of getOpenShadowRoots()) {
        let srStyle = sr.getElementById?.(id) || sr.querySelector(`style[data-aiu-id="${id}"]`);
        if (!srStyle) {
          srStyle = document.createElement('style');
          srStyle.setAttribute('data-aiu-id', id);
          sr.appendChild(srStyle);
        }
        if (srStyle.textContent !== cssText) srStyle.textContent = cssText;
      }
    }
  }

  /* =========================================================
     3. 四站统一无刷新品牌与 Logo 伪装引擎
     ========================================================= */
  let originalFaviconsSnapshot = null;

  function captureOriginalFavicons() {
    if (originalFaviconsSnapshot) return;
    const links = Array.from(document.querySelectorAll('head link[rel*="icon"]'));
    if (links.length) {
      originalFaviconsSnapshot = links.map(l => ({
        rel: l.rel,
        href: l.href,
        type: l.type || '',
        media: l.getAttribute('media') || '',
        sizes: l.getAttribute('sizes') || ''
      }));
    }
  }

  function markSiteLogos() {
    if (!document.body) return;
    if (SITE_KEY === 'chatgpt') {
      for (const sr of document.querySelectorAll('span.sr-only')) {
        if (sr.textContent.trim() !== 'ChatGPT') continue;
        const wrapper = sr.parentElement;
        if (wrapper?.tagName === 'SPAN' && wrapper.querySelector(':scope > svg[role="img"]')) {
          wrapper.setAttribute(SIDEBAR_MARK, '1');
        }
      }
    } else if (SITE_KEY === 'gemini') {
      for (const sel of ['bard-logo', '.bard-logo-container', '[data-test-id="logo"]', '[data-test-id="bard-logo"]', '[data-test-id="gemini-logo"]']) {
        for (const el of document.querySelectorAll(sel)) {
          if (el.matches('a[data-test-id="side-nav-sparkle-button"], a.side-nav-sparkle-button')) continue;
          el.setAttribute(HEADER_MARK, '1');
        }
      }
      for (const el of document.querySelectorAll('header a, header button, top-bar-actions a, top-bar-actions button, bard-sidenav a, bard-sidenav button, side-navigation-v2 a, side-navigation-v2 button, .bard-header a, .bard-header button')) {
        if (el.matches('a[data-test-id="side-nav-sparkle-button"], a.side-nav-sparkle-button')) continue;
        if (el.closest('[data-test-id="side-nav-sparkle-button"], [data-test-id="new-chat-button"], [data-test-id="conversation"], [data-test-id="project-item-button-gem"], [data-test-id="side-nav-menu-button"]')) continue;
        const box = el.getBoundingClientRect();
        if (box.width <= 0 || box.height <= 0 || box.top > 88 || box.left > 320) continue;
        const href = el.getAttribute('href') || '';
        const aria = el.getAttribute('aria-label') || '';
        const txt = (el.textContent || '').trim();
        const hasGemIcon = !!el.querySelector('mat-icon[data-mat-icon-name*="gemini"], mat-icon[fonticon*="gemini"]');
        if (href === '/app' || href === '/' || /Gemini/i.test(aria) || /^(Google\s*)?Gemini$/i.test(txt) || hasGemIcon) {
          el.setAttribute(HEADER_MARK, '1');
        }
      }
      for (const node of document.querySelectorAll('top-bar-actions span, top-bar-actions div, bard-sidenav span, bard-sidenav div, .bard-header span')) {
        if (node.children.length > 0 || node.closest(`[${HEADER_MARK}="1"], [data-test-id="side-nav-sparkle-button"]`)) continue;
        const box = node.getBoundingClientRect();
        if (box.width <= 0 || box.height <= 0 || box.top > 88 || box.left > 280 || box.height > 48) continue;
        if (/^(Google\s*)?Gemini$/i.test((node.textContent || '').trim())) {
          node.setAttribute(HEADER_MARK, '1');
        }
      }
    } else if (SITE_KEY === 'notebooklm') {
      for (const el of document.querySelectorAll('header a, header button, .notebook-header a, .logo-container')) {
        const box = el.getBoundingClientRect();
        if (box.width <= 0 || box.height <= 0 || box.left > 260 || box.top > 90) continue;
        if (/NotebookLM/i.test(el.textContent || '') || /NotebookLM/i.test(el.getAttribute('aria-label') || '') || (el.querySelector('svg, img') && box.left < 80)) {
          el.setAttribute(HEADER_MARK, '1');
          break;
        }
      }
    } else if (SITE_KEY === 'aistudio') {
      for (const sel of ['ms-navbar a[href="/"]', 'ms-navbar a[href="/welcome"]', 'ms-header-bar a[href="/"]', 'ms-marketing-nav nav > a:first-of-type']) {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(HEADER_MARK, '1');
      }
    } else if (SITE_KEY === 'antigravity') {
      const roots = [document, ...getOpenShadowRoots()];
      for (const rt of roots) {
        for (const span of rt.querySelectorAll('span')) {
          if (span.children.length > 0) continue;
          const txt = (span.textContent || '').trim();
          if (txt !== 'Antigravity') continue;
          const box = span.getBoundingClientRect();
          if (box.width <= 0 || box.height <= 0 || box.top > 88 || box.left > 320) continue;
          const target = span.parentElement?.tagName === 'SPAN' ? span.parentElement : span;
          target.setAttribute(HEADER_MARK, '1');
        }
      }
    }
  }

  let isApplyingBrand = false;

  function applyBrandSpoof() {
    if (isApplyingBrand) return;
    isApplyingBrand = true;
    try {
      const key = currentPrefs.brandPreset || 'deepseek';
      const b = BRAND_PRESETS[key];
      const oldStyle = document.getElementById(BRAND_STYLE_ID);

      captureOriginalFavicons();

      if (!b || key === 'original') {
        if (oldStyle) oldStyle.remove();
        document.documentElement?.removeAttribute('data-aiu-brand');
        for (const el of document.querySelectorAll('[data-aiu-orig-ph]')) {
          const orig = el.getAttribute('data-aiu-orig-ph');
          if (el.hasAttribute('data-placeholder')) el.setAttribute('data-placeholder', orig);
          if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', orig);
          if (el.tagName === 'P' && el.closest('[data-testid="agent-input-box"]')) el.textContent = orig;
          el.removeAttribute('data-aiu-orig-ph');
        }
        document.querySelector('link[data-aiu-brand-icon="1"]')?.remove();
        if (originalFaviconsSnapshot?.length) {
          const curIcons = Array.from(document.querySelectorAll('head link[rel*="icon"]'));
          curIcons.forEach((link, idx) => {
            const snap = originalFaviconsSnapshot[idx];
            if (!snap) return;
            link.href = snap.href;
            if (snap.type) link.type = snap.type;
            if (snap.media) link.setAttribute('media', snap.media);
            if (snap.sizes) link.setAttribute('sizes', snap.sizes);
          });
        }
        return;
      }

      document.documentElement?.setAttribute('data-aiu-brand', key);
      const escIcon = b.icon.startsWith('data:') ? b.icon : b.icon.replace(/["'()\\\s]/g, ch => '\\' + ch);
      const escName = b.name.replace(/["\\]/g, ch => '\\' + ch);

      const brandCss = `
      a[aria-label="ChatGPT logo"] > svg,
      a[aria-label="ChatGPT logo"] > img,
      [data-header-wordmark] > span:not([data-octane-product-card-chevron]),
      [data-header-wordmark] > svg:not([data-octane-product-card-chevron]),
      [data-test-id="logo"] > *,
      a[aria-label="Gemini"] > *,
      .bard-logo-container a > *,
      a[data-test-id="side-nav-sparkle-button"] > *,
      a.side-nav-sparkle-button > *,
      [${HEADER_MARK}="1"] > * {
        display: none !important;
      }

      a[aria-label="ChatGPT logo"],
      [data-test-id="logo"],
      a[aria-label="Gemini"],
      .bard-logo-container a,
      a[data-test-id="side-nav-sparkle-button"],
      a.side-nav-sparkle-button,
      [${HEADER_MARK}="1"] {
        font-size: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
      }

      a[aria-label="ChatGPT logo"]::before,
      [data-header-wordmark]::before,
      [data-test-id="logo"]::before,
      a[aria-label="Gemini"]::before,
      .bard-logo-container a::before,
      a[data-test-id="side-nav-sparkle-button"]:has(.gemini-sidenav-text.expanded)::before,
      a.side-nav-sparkle-button:has(.gemini-sidenav-text.expanded)::before,
      [${HEADER_MARK}="1"]::before {
        content: "${escName}";
        display: inline-flex !important;
        align-items: center;
        min-height: 26px;
        padding-left: 28px;
        background: url("${escIcon}") no-repeat left center / 21px 21px;
        font-size: 16.5px;
        font-weight: 700;
        color: ${b.color};
        line-height: 26px;
        letter-spacing: -0.2px;
        white-space: nowrap;
      }

      a[data-test-id="side-nav-sparkle-button"]:not(:has(.gemini-sidenav-text.expanded))::before,
      a.side-nav-sparkle-button:not(:has(.gemini-sidenav-text.expanded))::before {
        content: "";
        display: inline-block !important;
        width: 22px;
        height: 22px;
        background: url("${escIcon}") no-repeat center / 22px 22px;
      }

      [${SIDEBAR_MARK}="1"] > svg[role="img"] { display: none !important; }
      [${SIDEBAR_MARK}="1"] { font-size: 0 !important; white-space: nowrap !important; }
      [${SIDEBAR_MARK}="1"]::before {
        content: "" !important;
        display: inline-block !important;
        vertical-align: -4px !important;
        width: 21px !important;
        height: 21px !important;
        margin-right: 7px !important;
        background: url("${escIcon}") no-repeat center / contain !important;
      }
      [${SIDEBAR_MARK}="1"]::after {
        content: "${escName}" !important;
        display: inline-block !important;
        vertical-align: middle !important;
        color: ${b.color} !important;
        font-size: 17px !important;
        font-weight: 700 !important;
        line-height: 26px !important;
      }

      .ProseMirror[data-composer-markdown] > p[data-placeholder]::before,
      [data-composer-markdown] > p[data-placeholder]::before {
        content: "询问 ${escName}" !important;
      }
    `;

      injectCssString(BRAND_STYLE_ID, brandCss);
      markSiteLogos();

      // 替换输入提示词
      for (const p of document.querySelectorAll('[data-placeholder]')) {
        const val = p.getAttribute('data-placeholder') || '';
        if (/ChatGPT|Gemini/i.test(val) && !p.hasAttribute('data-aiu-orig-ph')) {
          p.setAttribute('data-aiu-orig-ph', val);
          p.setAttribute('data-placeholder', `询问 ${b.name}`);
        }
      }
      for (const ta of document.querySelectorAll('textarea[placeholder], input[placeholder]')) {
        const ph = ta.getAttribute('placeholder') || '';
        if (/开始输入|Start typing|Type something|Ask|NotebookLM|AI Studio|Gemini/i.test(ph) && !ta.hasAttribute('data-aiu-orig-ph')) {
          ta.setAttribute('data-aiu-orig-ph', ph);
          ta.setAttribute('placeholder', `询问 ${b.name}...`);
        }
      }
      if (SITE_KEY === 'antigravity') {
        const roots = [document, ...getOpenShadowRoots()];
        for (const rt of roots) {
          for (const phEl of rt.querySelectorAll('[data-testid="agent-input-box"] p, [data-lexical-editor="true"] + p')) {
            const txt = (phEl.textContent || '').trim();
            if (!phEl.hasAttribute('data-aiu-orig-ph') && !/Ask anything|询问 /i.test(txt)) continue;
            if (!phEl.hasAttribute('data-aiu-orig-ph')) {
              phEl.setAttribute('data-aiu-orig-ph', txt);
            }
            const nextPh = `询问 ${b.name}，@ 引用，/ 触发指令`;
            if (phEl.textContent !== nextPh) phEl.textContent = nextPh;
          }
        }
      }

      // ChatGPT 隐藏邀请成员按钮
      if (SITE_KEY === 'chatgpt') {
        for (const btn of document.querySelectorAll('button')) {
          const label = (btn.innerText || btn.textContent || '').trim().replace(/\s+/g, ' ');
          if (label === '邀请团队成员' || label === 'Invite team members') {
            const outer = btn.parentElement;
            const target = outer && outer.tagName === 'DIV' && outer.children.length === 1 ? outer : btn;
            target.setAttribute('data-aiu-hide-invite', '1');
          }
        }
      }

      // 替换浏览器标签页图标（同步覆盖 icon 与 shortcut icon）
      const icons = document.querySelectorAll('head link[rel*="icon"]');
      let regularIconCount = 0;
      icons.forEach(link => {
        if (/apple-touch-icon/i.test(link.rel)) return;
        regularIconCount++;
        if (link.getAttribute('href') !== b.icon) link.setAttribute('href', b.icon);
        if (link.type !== b.iconType) link.type = b.iconType;
        if (link.hasAttribute('media')) link.removeAttribute('media');
        if (link.hasAttribute('sizes')) link.removeAttribute('sizes');
      });
      if (!regularIconCount && document.head && !document.querySelector('link[data-aiu-brand-icon="1"]')) {
        const icon = document.createElement('link');
        icon.rel = 'icon';
        icon.href = b.icon;
        icon.type = b.iconType;
        icon.dataset.aiuBrandIcon = '1';
        document.head.appendChild(icon);
      }

      if (document.title && /ChatGPT|Gemini|NotebookLM|Google AI Studio|AI Studio|Antigravity/i.test(document.title)) {
        document.title = document.title.replace(/ChatGPT|Gemini|NotebookLM|Google AI Studio|AI Studio|Antigravity/gi, b.name);
      }
    } finally {
      isApplyingBrand = false;
    }
  }

  /* =========================================================
     4. 全平台代码块智能折叠 + 英文断点(<wbr>) + 短列防折行
     ========================================================= */
  function setCodeBlockFolded(container, folded, lineCount) {
    if (folded) container.setAttribute('data-aiu-code-folded', '1');
    else container.removeAttribute('data-aiu-code-folded');
    const btn = container.querySelector('.aiu-code-fold-btn');
    if (btn) btn.textContent = folded ? `展开代码 (${lineCount}行)` : `收起 (${lineCount}行)`;
  }

  function enhanceCodeBlocks(applyGlobalPolicy = false) {
    // 1) 结构化代码块容器（ChatGPT DIL / Gemini code-block / AI Studio ms-code-block）
    const structuredBlocks = document.querySelectorAll('[data-code-block="true"], code-block, ms-code-block');
    for (const block of structuredBlocks) {
      if (block.closest('[data-is-streaming="true"], .result-streaming, .streaming')) continue;
      const pre = block.querySelector('pre');
      const header = block.querySelector(':scope > [data-markdown-copy="exclude"], .code-block-decoration, .code-block-header, header') || block.querySelector('div:first-child:has(button)');
      if (!pre || !header) continue;

      const lineCount = Math.max(1, (pre.textContent || '').split('\n').length);
      const btnTarget = header.querySelector('.buttons') || header;
      let btn = header.querySelector('.aiu-code-fold-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'aiu-code-fold-btn';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const nextFolded = block.getAttribute('data-aiu-code-folded') !== '1';
          block.dataset.aiuUserToggled = '1';
          setCodeBlockFolded(block, nextFolded, Number(block.dataset.aiuLineCount || lineCount));
        });
        if (btnTarget !== header && btnTarget.firstChild) {
          btnTarget.insertBefore(btn, btnTarget.firstChild);
        } else {
          btnTarget.appendChild(btn);
        }
      }

      block.dataset.aiuLineCount = String(lineCount);
      if (applyGlobalPolicy) delete block.dataset.aiuUserToggled;
      if (!block.dataset.aiuUserToggled) {
        const mode = currentPrefs.codeCollapse || 'auto';
        setCodeBlockFolded(block, mode === 'all' || (mode === 'auto' && lineCount > 8), lineCount);
      } else {
        setCodeBlockFolded(block, block.getAttribute('data-aiu-code-folded') === '1', lineCount);
      }
    }

    // 1.5) Antigravity <pre> 内嵌 .code-block 容器
    for (const pre of document.querySelectorAll('[data-markdown-root] pre')) {
      const codeBody = pre.querySelector('.code-block');
      const header = pre.querySelector(':scope > div > div:first-child');
      if (!codeBody || !header) continue;
      if (pre.closest('[data-is-streaming="true"], .result-streaming, .streaming')) continue;

      const lineNodes = pre.querySelectorAll('.code-line');
      const lineCount = Math.max(1, lineNodes.length || (codeBody.textContent || '').split('\n').length);
      const actionWrap = header.querySelector('.justify-end') || header;
      let btn = actionWrap.querySelector('.aiu-code-fold-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'aiu-code-fold-btn';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const nextFolded = pre.getAttribute('data-aiu-code-folded') !== '1';
          pre.dataset.aiuUserToggled = '1';
          setCodeBlockFolded(pre, nextFolded, Number(pre.dataset.aiuLineCount || lineCount));
        });
        actionWrap.insertBefore(btn, actionWrap.firstChild);
      }

      pre.dataset.aiuLineCount = String(lineCount);
      if (applyGlobalPolicy) delete pre.dataset.aiuUserToggled;
      if (!pre.dataset.aiuUserToggled) {
        const mode = currentPrefs.codeCollapse || 'auto';
        setCodeBlockFolded(pre, mode === 'all' || (mode === 'auto' && lineCount > 8), lineCount);
      } else {
        setCodeBlockFolded(pre, pre.getAttribute('data-aiu-code-folded') === '1', lineCount);
      }
    }

    // 2) 独立 <pre> 代码块（NotebookLM / 通用 Markdown）
    for (const pre of document.querySelectorAll('.markdown pre, .message-content pre, ms-cmark-node pre')) {
      if (pre.querySelector('.code-block')) continue;
      if (pre.closest('[data-code-block="true"], code-block, ms-code-block')) continue;
      if (pre.closest('[data-is-streaming="true"], .result-streaming, .streaming')) continue;
      pre.setAttribute('data-aiu-standalone-pre', '1');
      const codeEl = pre.querySelector('code') || pre;
      const lineCount = Math.max(1, (codeEl.textContent || '').split('\n').length);

      let toolbar = pre.querySelector('.aiu-standalone-toolbar');
      if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'aiu-standalone-toolbar';
        const langSpan = document.createElement('span');
        const langMatch = (codeEl.className || '').match(/language-([a-zA-Z0-9_-]+)/);
        langSpan.textContent = langMatch ? langMatch[1].toUpperCase() : 'CODE';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'aiu-code-fold-btn';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const nextFolded = pre.getAttribute('data-aiu-code-folded') !== '1';
          pre.dataset.aiuUserToggled = '1';
          setCodeBlockFolded(pre, nextFolded, Number(pre.dataset.aiuLineCount || lineCount));
        });
        toolbar.appendChild(langSpan);
        toolbar.appendChild(btn);
        pre.insertBefore(toolbar, pre.firstChild);
      }

      pre.dataset.aiuLineCount = String(lineCount);
      if (applyGlobalPolicy) delete pre.dataset.aiuUserToggled;
      if (!pre.dataset.aiuUserToggled) {
        const mode = currentPrefs.codeCollapse || 'auto';
        setCodeBlockFolded(pre, mode === 'all' || (mode === 'auto' && lineCount > 8), lineCount);
      } else {
        setCodeBlockFolded(pre, pre.getAttribute('data-aiu-code-folded') === '1', lineCount);
      }
    }
  }

  const SKIP_TAGS = new Set([
    'PRE', 'CODE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT',
    'SVG', 'MATH', 'BUTTON', 'MAT-ICON', 'SOURCES-CAROUSEL-INLINE', 'SOURCE-INLINE-CHIP', 'SOURCE-FOOTNOTE'
  ]);

  function appendTextWithWbr(parent, rawText, insideTable = false) {
    const tokenRe = /[A-Za-z0-9\/._-]{7,}/g;
    let lastIdx = 0, match, changed = false;

    while ((match = tokenRe.exec(rawText)) !== null) {
      if (match.index > lastIdx) {
        parent.appendChild(document.createTextNode(rawText.slice(lastIdx, match.index)));
      }
      const token = match[0];
      if (insideTable && token.length < 24) {
        parent.appendChild(document.createTextNode(token));
        lastIdx = tokenRe.lastIndex;
        continue;
      }
      const parts = token.split(/([\/._-])/);
      for (const part of parts) {
        if (!part) continue;
        if (/^[\/._-]$/.test(part)) {
          parent.appendChild(document.createTextNode(part));
          parent.appendChild(document.createElement('wbr'));
          changed = true;
          continue;
        }
        const camelParts = part.split(/(?<=[a-z])(?=[A-Z])/);
        for (let i = 0; i < camelParts.length; i++) {
          const cp = camelParts[i];
          if (i > 0) {
            parent.appendChild(document.createElement('wbr'));
            changed = true;
          }
          if (cp.length >= 8 && /^[A-Za-z]+$/.test(cp)) {
            let pos = 0;
            while (pos < cp.length) {
              if (pos > 0) {
                parent.appendChild(document.createElement('wbr'));
                changed = true;
              }
              const rem = cp.length - pos;
              const take = rem >= 8 ? 5 : rem;
              parent.appendChild(document.createTextNode(cp.slice(pos, pos + take)));
              pos += take;
            }
          } else {
            parent.appendChild(document.createTextNode(cp));
          }
        }
      }
      lastIdx = tokenRe.lastIndex;
    }

    if (lastIdx < rawText.length) {
      parent.appendChild(document.createTextNode(rawText.slice(lastIdx)));
    }
    return changed;
  }

  function getVisualWidth(str) {
    let w = 0;
    for (const ch of str) w += ch.charCodeAt(0) > 255 ? 2 : 1;
    return w;
  }

  function markCompactTableColumns(rootNode) {
    if (!rootNode || rootNode.nodeType !== 1) return;
    if (document.querySelector('[data-testid="stop-button"]')) return;
    const tables = rootNode.matches?.('table')
      ? [rootNode]
      : Array.from(rootNode.querySelectorAll?.('table') || []);

    for (const table of tables) {
      if (table.closest('[data-is-streaming="true"], .result-streaming, .streaming')) continue;
      if (table.getAttribute('role') === 'grid') continue;
      const rows = Array.from(table.rows || []);
      if (!rows.length) continue;

      const headerCells = Array.from(rows[0]?.cells || []);
      for (let c = 0; c < headerCells.length; c++) {
        const th = headerCells[c];
        if (!th || th.tagName !== 'TH' || th.colSpan > 1) continue;
        const thText = (th.textContent || '').trim();
        const thWidth = getVisualWidth(thText);
        if (!thText || thWidth > 8) {
          th.removeAttribute('data-aiu-nowrap-th');
          th.removeAttribute('data-aiu-col-compact');
          continue;
        }

        th.setAttribute('data-aiu-nowrap-th', '1');
        let allShortCells = thWidth <= 6 && rows.length > 1;
        if (allShortCells) {
          for (let r = 1; r < rows.length; r++) {
            const cell = rows[r]?.cells?.[c];
            const cellText = (cell?.textContent || '').trim();
            if (!cell || cell.colSpan > 1 || getVisualWidth(cellText) > 6) {
              allShortCells = false;
              break;
            }
          }
        }
        if (allShortCells) {
          th.setAttribute('data-aiu-col-compact', '1');
          for (let r = 1; r < rows.length; r++) {
            rows[r]?.cells?.[c]?.setAttribute('data-aiu-col-compact', '1');
          }
        } else {
          th.removeAttribute('data-aiu-col-compact');
          for (let r = 1; r < rows.length; r++) {
            rows[r]?.cells?.[c]?.removeAttribute('data-aiu-col-compact');
          }
        }
      }
    }
  }

  function enhanceWordBreaksInContainer(rootNode) {
    if (!rootNode || rootNode.nodeType !== 1) return;
    if (document.querySelector('[data-testid="stop-button"]')) return;
    const selector = '[data-markdown-text-style="assistant-message"] p, [data-markdown-text-style="assistant-message"] li, [data-dil-response] p, [data-dil-response] li, .markdown p, .markdown li, [data-d-table-viewport="true"] p, labs-tailwind-doc-viewer .paragraph.normal, labs-tailwind-doc-viewer .paragraph.list-item, ms-cmark-node.cmark-node p, ms-cmark-node.cmark-node li, [data-markdown-root] p, [data-markdown-root] li';
    const targets = rootNode.matches?.(selector)
      ? [rootNode]
      : Array.from(rootNode.querySelectorAll?.(selector) || []);

    for (const elNode of targets) {
      if (elNode.dataset.aiuWbrDone === '1') continue;
      if (elNode.closest('[data-is-streaming="true"], .result-streaming, .streaming, ms-grounding-sources, ms-search-entry-point')) continue;

      const insideTable = Boolean(elNode.closest('table'));
      const walker = document.createTreeWalker(elNode, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !/[A-Za-z0-9\/._-]{7,}/.test(node.nodeValue)) {
            return NodeFilter.FILTER_REJECT;
          }
          let p = node.parentElement;
          while (p && p !== elNode) {
            if (SKIP_TAGS.has(p.tagName) || p.classList?.contains('katex') || p.classList?.contains('citation-marker')) {
              return NodeFilter.FILTER_REJECT;
            }
            p = p.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const textNodes = [];
      let cur;
      while ((cur = walker.nextNode())) textNodes.push(cur);

      for (const tNode of textNodes) {
        const span = document.createElement('span');
        if (appendTextWithWbr(span, tNode.nodeValue, insideTable)) {
          tNode.parentNode?.replaceChild(span, tNode);
        }
      }
      elNode.dataset.aiuWbrDone = '1';
    }
  }

  function installCompactStyle() {
    applyPrefsToRoot(currentPrefs);
    const fullCss = SHARED_EDITORIAL_CSS + '\n' + (SITE_SPECIFIC_CSS[SITE_KEY] || '');
    injectCssString(LAYOUT_STYLE_ID, fullCss);
  }

  /* =========================================================
     5. 挂在 <html> 根节点的抗遮挡可拖拽悬浮设置中心（四站通用）
     ========================================================= */
  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null) continue;
      if (k === 'className') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style') node.style.cssText = v;
      else if (k === 'dataset') {
        for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
      } else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else {
        node.setAttribute(k, String(v));
      }
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  const PANEL_CSS = `
    :host {
      all: initial;
      display: block;
      position: fixed;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    .toggle-btn {
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1.5px solid #2B5B84;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #1E3A5F;
      font-size: 12px;
      font-weight: 700;
      cursor: grab;
      opacity: 0.95;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.16);
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      user-select: none;
      touch-action: none;
    }
    .toggle-btn:active { cursor: grabbing; }
    .toggle-btn:hover, .toggle-btn.active {
      opacity: 1;
      border-color: #1D4ED8;
      color: #1D4ED8;
      box-shadow: 0 6px 18px rgba(29, 78, 216, 0.25);
    }
    .panel {
      display: none;
      position: fixed;
      z-index: 2147483647;
      width: 364px;
      max-height: 82vh;
      overflow-y: auto;
      padding: 13px 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.38);
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.22);
      color: #1e293b;
      font-size: 12px;
      line-height: 1.4;
    }
    .panel.open { display: block; }
    :host([data-theme="dark"]) .toggle-btn {
      background: rgba(30, 41, 59, 0.95);
      color: #7DD3FC;
      border-color: #60A5FA;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.55);
    }
    :host([data-theme="dark"]) .panel {
      background: rgba(22, 27, 34, 0.98);
      color: #e2e8f0;
      border-color: rgba(148, 163, 184, 0.26);
      box-shadow: 0 16px 42px rgba(0, 0, 0, 0.68);
    }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; gap: 6px; }
    .title { font-weight: 700; font-size: 13px; color: #1E3A5F; }
    :host([data-theme="dark"]) .title { color: #7DD3FC; }
    .site-pill {
      font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
      background: rgba(43, 91, 132, 0.12); color: #1E3A5F;
    }
    :host([data-theme="dark"]) .site-pill { background: rgba(96, 165, 250, 0.18); color: #93C5FD; }
    .tabs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 3px;
      border-radius: 8px;
      background: rgba(148, 163, 184, 0.14);
      margin-bottom: 10px;
    }
    .tab-btn {
      padding: 5px 4px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font-size: 11.5px;
      font-weight: 600;
      opacity: 0.72;
      cursor: pointer;
    }
    .tab-btn.active {
      background: #ffffff;
      color: #1E3A5F;
      opacity: 1;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.10);
    }
    :host([data-theme="dark"]) .tab-btn.active { background: #2D3748; color: #7DD3FC; }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; }
    .row { margin-bottom: 9px; }
    .row-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-weight: 500; gap: 6px; }
    .val { font-variant-numeric: tabular-nums; font-weight: 700; color: #1E7A5B; font-size: 11.5px; white-space: nowrap; }
    :host([data-theme="dark"]) .val { color: #6EE7B7; }
    .slider-line { display: flex; align-items: center; gap: 6px; }
    .step-btn {
      width: 22px; height: 20px; flex: 0 0 22px; border-radius: 5px;
      border: 1px solid rgba(148, 163, 184, 0.38); background: transparent; color: inherit;
      font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0;
    }
    .step-btn:hover { border-color: #2B5B84; color: #2B5B84; }
    input[type="range"] { width: 100%; height: 4px; accent-color: #2B5B84; cursor: pointer; margin: 0; }
    .lock-bar {
      display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; margin-bottom: 9px;
      border-radius: 8px; background: rgba(30, 122, 91, 0.08); border: 1px solid rgba(30, 122, 91, 0.18);
    }
    .lock-desc { font-size: 11px; line-height: 1.35; opacity: 0.9; }
    .lock-btn {
      padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(30, 122, 91, 0.35);
      background: transparent; color: #15533E; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;
    }
    .lock-btn.active { background: #1E7A5B; color: #fff; border-color: #1E7A5B; }
    .presets-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin-bottom: 4px; }
    .presets-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 4px; }
    .presets-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 4px; }
    .theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 6px; }
    .tier-label { font-size: 10.5px; font-weight: 600; opacity: 0.72; margin: 4px 0 3px; }
    .preset-btn {
      padding: 5px 4px; border-radius: 6px; border: 1px solid rgba(148, 163, 184, 0.38);
      background: transparent; color: inherit; font-size: 11px; font-weight: 600; cursor: pointer;
      white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
    }
    .preset-btn:hover { border-color: #2B5B84; }
    .preset-btn.active { background: #2B5B84; color: #fff; border-color: #2B5B84; }
    :host([data-theme="dark"]) .preset-btn.active { background: #3B82F6; border-color: #3B82F6; }
    .swatch { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1px solid rgba(128, 128, 128, 0.35); }
    .footer { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-top: 9px; padding-top: 8px; border-top: 1px solid rgba(148, 163, 184, 0.24); }
    .action-btn { padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(148, 163, 184, 0.4); background: transparent; color: inherit; font-size: 11px; cursor: pointer; }
    .action-btn:hover { border-color: #2B5B84; color: #2B5B84; }
  `;

  let panelApi = null;

  function applyHostButtonPosition(host) {
    if (!host) return;
    const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const right = clamp(Number(currentPrefs.btnRight ?? DEFAULT_PREFS.btnRight), 8, Math.max(8, vw - 130));
    const bottom = clamp(Number(currentPrefs.btnBottom ?? DEFAULT_PREFS.btnBottom), 8, Math.max(8, vh - 46));
    host.style.setProperty('position', 'fixed', 'important');
    host.style.setProperty('right', `${right}px`, 'important');
    host.style.setProperty('bottom', `${bottom}px`, 'important');
    host.style.setProperty('left', 'auto', 'important');
    host.style.setProperty('top', 'auto', 'important');
    host.style.setProperty('z-index', '2147483647', 'important');
  }

  function mountTunerWidget() {
    if (window.self !== window.top) return;
    const mountParent = document.documentElement || document.body;
    if (!mountParent) return;
    const existing = document.getElementById(PANEL_HOST_ID);
    if (existing) {
      applyHostButtonPosition(existing);
      return;
    }

    const host = document.createElement('div');
    host.id = PANEL_HOST_ID;
    mountParent.appendChild(host);
    applyHostButtonPosition(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const styleEl = document.createElement('style');
    styleEl.textContent = PANEL_CSS;
    shadow.appendChild(styleEl);

    const valRefs = {};
    const rangeRefs = {};

    function makeSliderRow(label, key, min, max, step, onInput, extraStyle = '') {
      const valSpan = h('span', { className: 'val' });
      const range = h('input', { type: 'range', min, max, step, onInput: () => onInput(Number(range.value)) });
      const minusBtn = h('button', { type: 'button', className: 'step-btn', text: '-', dataset: { stepTarget: key, delta: String(-step) } });
      const plusBtn = h('button', { type: 'button', className: 'step-btn', text: '+', dataset: { stepTarget: key, delta: String(step) } });
      valRefs[key] = valSpan;
      rangeRefs[key] = range;
      return h('div', { className: 'row', style: extraStyle },
        h('div', { className: 'row-head' }, h('span', { text: label }), valSpan),
        h('div', { className: 'slider-line' }, minusBtn, range, plusBtn)
      );
    }

    function makePresetBtn(text, dataObj, title = '') {
      const props = { type: 'button', className: 'preset-btn', text, dataset: dataObj };
      if (title) props.title = title;
      return h('button', props);
    }

    const lockBtn = h('button', { type: 'button', className: 'lock-btn active', text: '🔗 联动中' });
    const paneScale = h('div', { className: 'tab-pane active', dataset: { pane: 'scale' } },
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '一键黄金比例预设' })),
        h('div', { className: 'presets-4' },
          makePresetBtn('紧凑(推荐)', { scalePreset: 'compact' }, '14.5px · 行距1.60 · 段距8px'),
          makePresetBtn('标准', { scalePreset: 'comfort' }, '15.5px · 行距1.70 · 段距10px'),
          makePresetBtn('舒展', { scalePreset: 'relaxed' }, '17px · 行距1.82 · 段距14px'),
          makePresetBtn('大字', { scalePreset: 'large' }, '18.5px · 行距1.92 · 段距18px')
        )
      ),
      makeSliderRow('整体同比例缩放（字号·行间率·段距）', 'globalScale', 0.78, 1.30, 0.02, v => applyGlobalScale(v)),
      h('div', { className: 'lock-bar' },
        h('span', { className: 'lock-desc', text: '调字号时自动按比例联动行间率与段距' }),
        lockBtn
      ),
      makeSliderRow('字体大小', 'fontSize', 12.5, 22.0, 0.5, v => applyFontSizeChange(v)),
      makeSliderRow('行间率（行高倍数）', 'lineHeight', 1.35, 2.20, 0.02, v => updateAndApply({ lineHeight: v }, { refreshAnchor: true })),
      makeSliderRow('段落间距', 'paraGap', 2, 32, 1, v => updateAndApply({ paraGap: v }, { refreshAnchor: true })),
      makeSliderRow('文字间距（字距）', 'letterSpacing', 0, 0.06, 0.005, v => updateAndApply({ letterSpacing: v }, { refreshAnchor: true })),
      makeSliderRow('标题相对大小比例', 'headingScale', 0.80, 1.25, 0.05, v => updateAndApply({ headingScale: v }), 'margin-bottom:2px;')
    );

    const widthValSpan = h('span', { className: 'val' });
    const widthRange = h('input', {
      type: 'range', min: 620, max: 1400, step: 20,
      onInput: () => updateAndApply({ widthMode: 'custom', contentWidth: Number(widthRange.value) })
    });
    valRefs.contentWidth = widthValSpan;
    rangeRefs.contentWidth = widthRange;

    const paneLayout = h('div', { className: 'tab-pane', dataset: { pane: 'layout' } },
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '中英字体' })),
        h('div', { className: 'presets-3' },
          makePresetBtn('苹方现代', { font: 'sans' }),
          makePresetBtn('Maple 2:1', { font: 'mono21' }),
          makePresetBtn('学术宋体', { font: 'serif' })
        )
      ),
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '两端对齐模式' })),
        h('div', { className: 'presets-3' },
          makePresetBtn('智能两端', { align: 'justify' }),
          makePresetBtn('全行含末行', { align: 'justify-all' }),
          makePresetBtn('传统左对齐', { align: 'left' })
        )
      ),
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '主阅读列宽度' }), widthValSpan),
        h('div', { className: 'presets-3' },
          makePresetBtn('紧凑 760', { mode: 'standard', w: '760' }),
          makePresetBtn('标准 860', { mode: 'wide', w: '860' }),
          makePresetBtn('全宽铺满', { mode: 'full', w: '1240' })
        ),
        h('div', { className: 'slider-line', style: 'margin-top:4px;' },
          h('button', { type: 'button', className: 'step-btn', text: '-', dataset: { stepTarget: 'contentWidth', delta: '-20' } }),
          widthRange,
          h('button', { type: 'button', className: 'step-btn', text: '+', dataset: { stepTarget: 'contentWidth', delta: '20' } })
        )
      ),
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '界面外壳瘦身' })),
        h('div', { className: 'presets-2' },
          makePresetBtn('紧凑工作台', { chrome: 'compact' }),
          makePresetBtn('原生间距', { chrome: 'normal' })
        )
      ),
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '表格内部松紧度' })),
        h('div', { className: 'presets-3' },
          makePresetBtn('紧凑密排', { tbl: 'compact' }),
          makePresetBtn('舒适标准', { tbl: 'normal' }),
          makePresetBtn('舒展宽松', { tbl: 'relaxed' })
        )
      ),
      h('div', { className: 'row', style: 'margin-bottom:2px;' },
        h('div', { className: 'row-head' }, h('span', { text: '代码块默认折叠' })),
        h('div', { className: 'presets-3' },
          makePresetBtn('智能折叠', { code: 'auto' }),
          makePresetBtn('全部折叠', { code: 'all' }),
          makePresetBtn('全部展开', { code: 'none' })
        )
      )
    );

    function makeThemeGrid(tierKey) {
      const items = Object.entries(THEMES).filter(([, t]) => t.tier === tierKey);
      return h('div', { className: 'theme-grid' },
        items.map(([key, t]) =>
          h('button', { type: 'button', className: 'preset-btn', dataset: { ctheme: key } },
            h('span', { className: 'swatch', style: `background:linear-gradient(135deg, ${t.dot} 55%, ${t.dot2} 55%)` }),
            h('span', { text: t.name })
          )
        )
      );
    }

    const paneTheme = h('div', { className: 'tab-pane', dataset: { pane: 'theme' } },
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '18 套双模式主题（日间/夜间全适配）' })),
        h('div', { className: 'tier-label', text: '中对比 · 专属研读/调试与结构层次' }),
        makeThemeGrid('mid'),
        h('div', { className: 'tier-label', text: '低对比 · 轻盈护眼（长时间沉浸阅读）' }),
        makeThemeGrid('low'),
        h('div', { className: 'tier-label', text: '高对比 · 重点突出（快速扫读抓重点）' }),
        makeThemeGrid('high')
      ),
      h('div', { className: 'row' },
        h('div', { className: 'row-head' }, h('span', { text: '重点加粗标注风格' })),
        h('div', { className: 'presets-3' },
          makePresetBtn('纯正加粗', { strong: 'none' }),
          makePresetBtn('暖金底线', { strong: 'soft-gold' }),
          makePresetBtn('薄荷微底', { strong: 'mint' })
        )
      ),
      h('div', { className: 'row', style: 'margin-bottom:2px;' },
        h('div', { className: 'row-head' }, h('span', { text: '界面品牌与 Logo 伪装' })),
        h('div', { className: 'presets-4' },
          makePresetBtn('DeepSeek', { brand: 'deepseek' }),
          makePresetBtn('Kimi', { brand: 'kimi' }),
          makePresetBtn('豆包', { brand: 'doubao' }),
          makePresetBtn('原生', { brand: 'original' })
        )
      )
    );

    const tabBtns = [
      h('button', { type: 'button', className: 'tab-btn active', text: '排版比例', dataset: { tab: 'scale' } }),
      h('button', { type: 'button', className: 'tab-btn', text: '版面瘦身', dataset: { tab: 'layout' } }),
      h('button', { type: 'button', className: 'tab-btn', text: '18套主题', dataset: { tab: 'theme' } })
    ];
    const tabPanes = [paneScale, paneLayout, paneTheme];

    const resetBtn = h('button', { type: 'button', className: 'action-btn', text: '恢复本站默认' });
    const syncAllBtn = h('button', { type: 'button', className: 'action-btn', text: '同步到5站', title: '将当前主题、字体与伪装同步到 ChatGPT/Gemini/NotebookLM/AI Studio/Antigravity' });
    const closeBtn = h('button', { type: 'button', className: 'action-btn', text: '收起' });

    const panel = h('div', { className: 'panel' },
      h('div', { className: 'header' },
        h('span', { className: 'title', text: 'AI 全平台排版与主题中心' }),
        h('span', { className: 'site-pill', text: CURRENT_SITE.label })
      ),
      h('div', { className: 'tabs' }, tabBtns),
      paneScale,
      paneLayout,
      paneTheme,
      h('div', { className: 'footer' }, resetBtn, syncAllBtn, closeBtn)
    );

    const toggleBtn = h('button', {
      type: 'button',
      className: 'toggle-btn',
      text: 'Aa 排版·主题',
      title: `当前站点：${CURRENT_SITE.label}（点击打开设置面板，可拖拽，快捷键 Alt+A）`
    });

    shadow.appendChild(panel);
    shadow.appendChild(toggleBtn);
    syncThemeMode();

    const scalePresetBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-scale-preset]'));
    const stepBtns = Array.from(shadow.querySelectorAll('.step-btn'));
    const presetBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-mode]'));
    const fontBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-font]'));
    const alignBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-align]'));
    const tblBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-tbl]'));
    const cthemeBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-ctheme]'));
    const strongBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-strong]'));
    const codeBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-code]'));
    const chromeBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-chrome]'));
    const brandBtns = Array.from(shadow.querySelectorAll('.preset-btn[data-brand]'));

    function isSamePreset(p, item) {
      return Math.abs(p.fontSize - item.fontSize) < 0.05 &&
        Math.abs(p.lineHeight - item.lineHeight) < 0.015 &&
        Math.abs(p.paraGap - item.paraGap) < 0.5;
    }

    function positionPanelInViewport() {
      if (!panel.classList.contains('open')) return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const btnRect = toggleBtn.getBoundingClientRect();
      const pw = Math.min(364, vw - 20);
      panel.style.width = `${pw}px`;
      const ph = panel.offsetHeight || 420;

      let left = clamp(btnRect.right - pw, 10, Math.max(10, vw - pw - 10));
      let top = btnRect.top - ph - 10;
      if (top < 10) top = btnRect.bottom + 10;
      if (top + ph > vh - 10) top = Math.max(10, vh - ph - 10);

      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(top)}px`;
    }

    function syncUI() {
      rangeRefs.globalScale.value = currentPrefs.globalScale;
      rangeRefs.fontSize.value = currentPrefs.fontSize;
      rangeRefs.lineHeight.value = currentPrefs.lineHeight;
      rangeRefs.paraGap.value = currentPrefs.paraGap;
      rangeRefs.letterSpacing.value = currentPrefs.letterSpacing;
      rangeRefs.headingScale.value = currentPrefs.headingScale;
      rangeRefs.contentWidth.value = currentPrefs.contentWidth;

      valRefs.globalScale.textContent = `${Math.round(currentPrefs.globalScale * 100)}%`;
      valRefs.fontSize.textContent = `${currentPrefs.fontSize}px`;
      valRefs.lineHeight.textContent = Number(currentPrefs.lineHeight).toFixed(2);
      valRefs.paraGap.textContent = `${currentPrefs.paraGap}px`;
      valRefs.letterSpacing.textContent = `${Number(currentPrefs.letterSpacing).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}em`;
      valRefs.headingScale.textContent = `${Number(currentPrefs.headingScale).toFixed(2)}×`;
      valRefs.contentWidth.textContent = currentPrefs.widthMode === 'full' ? '全宽铺满' : `${currentPrefs.contentWidth}px`;

      lockBtn.classList.toggle('active', Boolean(currentPrefs.scaleLocked));
      lockBtn.textContent = currentPrefs.scaleLocked ? '🔗 联动中' : '🔓 已独立';

      scalePresetBtns.forEach(btn => {
        const preset = SCALE_PRESETS[btn.dataset.scalePreset];
        btn.classList.toggle('active', Boolean(preset && isSamePreset(currentPrefs, preset)));
      });
      presetBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === currentPrefs.widthMode));
      fontBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.font === currentPrefs.fontFamily));
      alignBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.align === currentPrefs.alignMode));
      tblBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tbl === (currentPrefs.tableDensity || 'compact')));
      cthemeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.ctheme === (currentPrefs.colorTheme || DEFAULT_PREFS.colorTheme)));
      strongBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.strong === (currentPrefs.strongStyle || 'soft-gold')));
      codeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.code === (currentPrefs.codeCollapse || 'auto')));
      chromeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.chrome === (currentPrefs.chromeMode || 'compact')));
      brandBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.brand === (currentPrefs.brandPreset || 'deepseek')));
    }

    function updateAndApply(patch, options = {}) {
      const { refreshAnchor = false, forceCodePolicy = false } = options;
      currentPrefs = { ...currentPrefs, ...patch };
      if (refreshAnchor) ratioAnchor = buildAnchorFromPrefs(currentPrefs);
      applyPrefsToRoot(currentPrefs);
      applyBrandSpoof();
      savePrefs(currentPrefs);
      syncUI();
      if (forceCodePolicy) enhanceCodeBlocks(true);
      if (window.self === window.top && SITE_KEY === 'antigravity') {
        for (const frame of document.querySelectorAll('iframe')) {
          try {
            frame.contentWindow?.postMessage({ __aiuPrefsSync: true, prefs: currentPrefs, forceCodePolicy }, '*');
          } catch {}
        }
      }
      requestAnimationFrame(positionPanelInViewport);
    }

    function applyGlobalScale(newScale) {
      const s = clamp(roundStep(newScale, 0.02), 0.78, 1.30);
      const factor = s / (ratioAnchor.baseScale || 0.92);
      const newFs = clamp(roundStep(ratioAnchor.fontSize * factor, 0.5), 12.5, 22.0);
      const newLh = clamp(roundStep(ratioAnchor.lineHeight * (1 + (factor - 1) * 0.45), 0.02), 1.35, 2.20);
      const newPg = clamp(Math.round(ratioAnchor.paraGap * Math.pow(factor, 1.25)), 2, 32);
      const newLs = clamp(roundStep(ratioAnchor.letterSpacing * factor, 0.005), 0, 0.06);
      updateAndApply({ globalScale: s, fontSize: newFs, lineHeight: newLh, paraGap: newPg, letterSpacing: newLs });
    }

    function applyFontSizeChange(newFsRaw) {
      const newFs = clamp(roundStep(newFsRaw, 0.5), 12.5, 22.0);
      if (!currentPrefs.scaleLocked) {
        const approxScale = clamp(roundStep(newFs / DEFAULT_PREFS.fontSize * 0.92, 0.02), 0.78, 1.30);
        updateAndApply({ fontSize: newFs, globalScale: approxScale }, { refreshAnchor: true });
        return;
      }
      const factor = newFs / (ratioAnchor.fontSize || DEFAULT_PREFS.fontSize);
      const newScale = clamp(roundStep((ratioAnchor.baseScale || 0.92) * factor, 0.02), 0.78, 1.30);
      const newLh = clamp(roundStep(ratioAnchor.lineHeight * (1 + (factor - 1) * 0.45), 0.02), 1.35, 2.20);
      const newPg = clamp(Math.round(ratioAnchor.paraGap * Math.pow(factor, 1.25)), 2, 32);
      const newLs = clamp(roundStep(ratioAnchor.letterSpacing * factor, 0.005), 0, 0.06);
      updateAndApply({ globalScale: newScale, fontSize: newFs, lineHeight: newLh, paraGap: newPg, letterSpacing: newLs });
    }

    function togglePanel(forceOpen) {
      syncThemeMode();
      const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');
      panel.classList.toggle('open', willOpen);
      toggleBtn.classList.toggle('active', willOpen);
      if (willOpen) {
        syncUI();
        requestAnimationFrame(positionPanelInViewport);
      }
    }

    let dragging = false, moved = false, startX = 0, startY = 0, startRight = 18, startBottom = 95;
    toggleBtn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true; moved = false; startX = e.clientX; startY = e.clientY;
      startRight = Number(currentPrefs.btnRight ?? DEFAULT_PREFS.btnRight);
      startBottom = Number(currentPrefs.btnBottom ?? DEFAULT_PREFS.btnBottom);
      toggleBtn.setPointerCapture?.(e.pointerId);
    });
    toggleBtn.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.hypot(dx, dy) > 4) moved = true;
      if (!moved) return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      currentPrefs.btnRight = clamp(Math.round(startRight - dx), 8, Math.max(8, vw - 130));
      currentPrefs.btnBottom = clamp(Math.round(startBottom - dy), 8, Math.max(8, vh - 46));
      applyHostButtonPosition(host);
      positionPanelInViewport();
    });
    toggleBtn.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      toggleBtn.releasePointerCapture?.(e.pointerId);
      if (moved) savePrefs(currentPrefs);
    });
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (moved) { moved = false; return; }
      togglePanel();
    });

    tabBtns.forEach(btn => btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      tabPanes.forEach(p => p.classList.toggle('active', p.dataset.pane === btn.dataset.tab));
      requestAnimationFrame(positionPanelInViewport);
    }));

    closeBtn.addEventListener('click', () => togglePanel(false));
    document.addEventListener('click', (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(host) && e.target !== host && panel.classList.contains('open')) togglePanel(false);
    });

    lockBtn.addEventListener('click', () => updateAndApply({ scaleLocked: !currentPrefs.scaleLocked }, { refreshAnchor: true }));
    scalePresetBtns.forEach(btn => btn.addEventListener('click', () => {
      const preset = SCALE_PRESETS[btn.dataset.scalePreset];
      if (preset) updateAndApply({ ...preset }, { refreshAnchor: true });
    }));
    stepBtns.forEach(btn => btn.addEventListener('click', () => {
      const target = btn.dataset.stepTarget, delta = Number(btn.dataset.delta);
      if (target === 'globalScale') applyGlobalScale(currentPrefs.globalScale + delta);
      else if (target === 'fontSize') applyFontSizeChange(currentPrefs.fontSize + delta);
      else if (target === 'lineHeight') updateAndApply({ lineHeight: clamp(roundStep(currentPrefs.lineHeight + delta, 0.02), 1.35, 2.20) }, { refreshAnchor: true });
      else if (target === 'paraGap') updateAndApply({ paraGap: clamp(Math.round(currentPrefs.paraGap + delta), 2, 32) }, { refreshAnchor: true });
      else if (target === 'letterSpacing') updateAndApply({ letterSpacing: clamp(roundStep(currentPrefs.letterSpacing + delta, 0.005), 0, 0.06) }, { refreshAnchor: true });
      else if (target === 'headingScale') updateAndApply({ headingScale: clamp(roundStep(currentPrefs.headingScale + delta, 0.05), 0.80, 1.25) });
      else if (target === 'contentWidth') updateAndApply({ widthMode: 'custom', contentWidth: clamp(Math.round(currentPrefs.contentWidth + delta), 620, 1400) });
    }));

    presetBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ widthMode: btn.dataset.mode, contentWidth: Number(btn.dataset.w) })));
    fontBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ fontFamily: btn.dataset.font })));
    alignBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ alignMode: btn.dataset.align })));
    tblBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ tableDensity: btn.dataset.tbl })));
    cthemeBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ colorTheme: btn.dataset.ctheme })));
    strongBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ strongStyle: btn.dataset.strong })));
    codeBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ codeCollapse: btn.dataset.code }, { forceCodePolicy: true })));
    chromeBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ chromeMode: btn.dataset.chrome })));
    brandBtns.forEach(btn => btn.addEventListener('click', () => updateAndApply({ brandPreset: btn.dataset.brand })));

    resetBtn.addEventListener('click', () => {
      updateAndApply({ ...DEFAULT_PREFS }, { refreshAnchor: true, forceCodePolicy: true });
      applyHostButtonPosition(host);
    });

    syncAllBtn.addEventListener('click', () => {
      syncPrefsToAllSites(currentPrefs);
      const orig = syncAllBtn.textContent;
      syncAllBtn.textContent = '✓ 已同步4站';
      setTimeout(() => { syncAllBtn.textContent = orig; }, 1400);
    });

    panelApi = {
      toggle: togglePanel,
      setBrand: (brandKey) => { if (BRAND_PRESETS[brandKey]) updateAndApply({ brandPreset: brandKey }); },
      resetPosition: () => {
        currentPrefs.btnRight = DEFAULT_PREFS.btnRight;
        currentPrefs.btnBottom = DEFAULT_PREFS.btnBottom;
        savePrefs(currentPrefs);
        applyHostButtonPosition(host);
      },
      syncAll: () => syncPrefsToAllSites(currentPrefs)
    };
    syncUI();
  }

  function registerMenusAndShortcuts() {
    try {
      if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand(`🎛️ 打开/收起 ${CURRENT_SITE.label} 排版面板 (Alt+A)`, () => { mountTunerWidget(); panelApi?.toggle(); });
        for (const [key, item] of Object.entries(BRAND_PRESETS)) {
          GM_registerMenuCommand(`🎭 切换品牌伪装：${item.name}`, () => { mountTunerWidget(); panelApi?.setBrand(key); });
        }
        GM_registerMenuCommand('🔄 同步当前配置到全部 4 个 AI 站点', () => { panelApi?.syncAll(); });
        GM_registerMenuCommand('📍 重置悬浮按钮位置', () => { mountTunerWidget(); panelApi?.resetPosition(); });
      }
    } catch {}

    window.addEventListener('keydown', (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        mountTunerWidget();
        panelApi?.toggle();
      }
    });
  }

  let observersStarted = false;
  function startObserver() {
    installCompactStyle();
    mountTunerWidget();
    applyBrandSpoof();

    if (document.body) {
      enhanceWordBreaksInContainer(document.body);
      markCompactTableColumns(document.body);
      enhanceCodeBlocks(false);
    }

    if (observersStarted) return;
    observersStarted = true;

    if (document.documentElement) {
      new MutationObserver(() => {
        if (!document.getElementById(LAYOUT_STYLE_ID)) installCompactStyle();
        if (!document.getElementById(PANEL_HOST_ID)) mountTunerWidget();
        syncThemeMode();
      }).observe(document.documentElement, { childList: true, attributes: true, attributeFilter: ['class', 'data-theme'] });
    }

    const bindHead = () => {
      if (!document.head) return;
      new MutationObserver(() => {
        if (!isApplyingBrand && (currentPrefs.brandPreset || 'deepseek') !== 'original') {
          applyBrandSpoof();
        }
      }).observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'rel'] });
    };
    if (document.head) bindHead();
    else document.addEventListener('DOMContentLoaded', bindHead, { once: true });

    const bindBody = () => {
      if (!document.body) return;
      installCompactStyle();
      applyBrandSpoof();
      new MutationObserver(() => syncThemeMode()).observe(document.body, { attributes: true, attributeFilter: ['class'] });
      let domTimer = null;
      new MutationObserver(() => {
        if (!document.getElementById(PANEL_HOST_ID)) mountTunerWidget();
        if (domTimer) return;
        domTimer = setTimeout(() => {
          domTimer = null;
          installCompactStyle();
          applyBrandSpoof();
          enhanceWordBreaksInContainer(document.body);
          markCompactTableColumns(document.body);
          enhanceCodeBlocks(false);
        }, 350);
      }).observe(document.body, { childList: true, subtree: true });
    };

    if (document.body) bindBody();
    else document.addEventListener('DOMContentLoaded', bindBody, { once: true });

    window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', syncThemeMode);
    if (window.self !== window.top && SITE_KEY === 'antigravity') {
      const applyIncomingPrefs = (nextPrefs, forceCodePolicy = false) => {
        if (!nextPrefs || typeof nextPrefs !== 'object') return;
        currentPrefs = { ...DEFAULT_PREFS, ...nextPrefs };
        applyPrefsToRoot(currentPrefs);
        applyBrandSpoof();
        if (forceCodePolicy) enhanceCodeBlocks(true);
      };
      try {
        if (typeof GM_addValueChangeListener === 'function') {
          GM_addValueChangeListener(CURRENT_SITE.storageKey, (_name, _oldVal, newVal, remote) => {
            if (!remote && newVal === undefined) return;
            try {
              const parsed = typeof newVal === 'string' ? JSON.parse(newVal) : newVal;
              applyIncomingPrefs(parsed, true);
            } catch {}
          });
        }
      } catch {}
      window.addEventListener('message', (e) => {
        if (e.data && e.data.__aiuPrefsSync) {
          applyIncomingPrefs(e.data.prefs, Boolean(e.data.forceCodePolicy));
        }
      });
    }
    window.addEventListener('resize', () => {
      const host = document.getElementById(PANEL_HOST_ID);
      if (host) applyHostButtonPosition(host);
    }, { passive: true });
  }

  registerMenusAndShortcuts();
  if (document.documentElement) {
    applyPrefsToRoot(currentPrefs);
    startObserver();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }
})();
