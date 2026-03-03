# LifeOS v2

Sistema pessoal de gestão de vida — Tallis & Yasmin.

## Iniciar

```bash
npm install
npm run dev
```

## Logins

| Usuário | Senha        |
|---------|-------------|
| tallis  | tallis0724@ |
| yasmin  | yasmin0724@ |

Cada usuário tem seus próprios dados isolados no localStorage.

## Funcionalidades

### 🔐 Login
- Tela de entrada com animação de boas-vindas personalizada pelo nome
- Dados separados por usuário

### 🏠 Home
- Saudação com nome e horário
- 🔥 Streak de dias de uso com chama animada
- Resumo financeiro do mês
- Pomodoros e hábitos do dia
- Grid de atividade anual

### 💰 Finanças
- **Extrato**: Lista de movimentações com filtro por mês, gráfico de categorias, exportar PDF
- **Lançar**: Entrada/saída com categoria, recorrência, data
- **Divisão %**: Sliders para contas/investimentos/lazer com base no salário
- **Metas**: Criar e acompanhar metas financeiras com barra de progresso

### ⏱ Pomodoro
- Timer com fase de trabalho + pausa curta + pausa longa
- Todos os tempos editáveis
- Botão para pular fase
- Barra de progresso, contagem de ciclos visuais

### ✅ Hábitos
- Calendário mensal por hábito
- Streak de dias seguidos
- Dot de status diário

### 🔗 Links
- Salvar links com título, URL, descrição e categoria
- Favoritos com favicon automático
- Filtro por categoria
- Edição inline

## Stack
React 18 + TypeScript + Tailwind CSS + Vite
