# Verifica Eleição

MVP de um site para analisar prints de notícias e mensagens eleitorais com inteligência artificial (Gemini).

## Estrutura

- `frontend/` — site estático, publicado no GitHub Pages.
- `backend/` — API Node.js que protege a chave da IA, publicada no Render.

Na raiz do repositório:

- `render.yaml` — configuração do backend no Render.
- `.github/workflows/pages.yml` — publica `frontend/` no GitHub Pages a cada envio para a `main`.

## 1. Rodar no computador

```bash
cd verifica-eleicao-mvp/backend
npm install
```

Copie `.env.example` para `.env` e coloque sua chave do Google AI Studio:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.1-flash-lite
FRONTEND_ORIGIN=*
PORT=3000
GEMINI_WEB_SEARCH=false
RATE_LIMIT_PER_HOUR=20
```

Inicie com `npm start` e abra `frontend/index.html` no navegador. Quando aberto no computador, o site usa automaticamente `http://localhost:3000`.

## 2. Configurações

| Variável | Para que serve |
| --- | --- |
| `GEMINI_MODEL` | Modelo principal. |
| `GEMINI_FALLBACK_MODELS` | Modelos reserva, separados por vírgula, usados quando o principal está sobrecarregado. |
| `GEMINI_WEB_SEARCH` | `true` ativa a pesquisa no Google para checar as notícias. Exige faturamento ativo na conta do Gemini. Sem cota, a análise é feita sem pesquisa. |
| `RATE_LIMIT_PER_HOUR` | Máximo de análises por pessoa (IP) por hora. |
| `FRONTEND_ORIGIN` | Endereço do site autorizado a usar a API (ex.: `https://usuario.github.io`). |

## 3. Publicar

1. **Backend (Render):** crie uma conta em render.com, escolha *New → Blueprint* e selecione este repositório. Preencha `GEMINI_API_KEY` e `FRONTEND_ORIGIN`.
2. **Frontend:** em `frontend/script.js`, troque `PRODUCTION_API_URL` pelo endereço do Render seguido de `/api/analyze`.
3. **GitHub Pages:** no GitHub, vá em *Settings → Pages* e em *Source* escolha **GitHub Actions**.

No plano gratuito, o Render desliga o servidor após 15 minutos sem uso; a primeira análise depois disso pode demorar cerca de 1 minuto.

## Próximas melhorias

- Fact Check Explorer e fontes oficiais do TSE;
- comparação de múltiplas fontes;
- histórico opcional;
- metodologia de avaliação da evidência.

Nunca coloque `GEMINI_API_KEY` no JavaScript do frontend.
