# Activity-Logger

• [Introdução](#introdução)  
• [Funcionalidades](#funcionalidades)  
• [Tecnologias](#tecnologias)  
• [Instalação](#instalação)  
• [Licença](#licença)  

## Introdução

Activity-Logger é um aplicativo de monitoramento que roda em background. A cada intervalo, exibe uma pergunta sobre a atividade atual do usuário. Respostas são salvas e visualizadas na interface UserData, com opções de filtro. Suporte português e inglês.<br/>ㅤ<br/>
![gifDemonstração](public/showGif3.gif)

## Funcionalidades

**Monitoramento Discreto** ⏲️: A aplicação é executada em segundo plano, exibindo as perguntas em intervalos configurados.

**Histórico e Filtragem** 📊: Todas as respostas são armazenadas no firestore e podem ser facilmente acessadas. O usuário pode visualizar seu histórico completo e editar registros passados.

**Configurações Personalizadas** ⚙️: O usuário tem controle total sobre a aplicação, podendo configurar desde o intervalo entre as perguntas até os dias e horários de monitoramento.

**Visualização de Dados** 📊: A interface principal exibe todas respostas, que podem ser filtradas e editadas.

**Autenticação** 🔐: As credenciais são gerenciadas pelo Firebase Authentication.

## Tecnologias

![Electron](https://img.shields.io/badge/-Electron-282C34?style=flat&logo=electron&logoColor=478CBF) Utilizado para desenvolver o aplicativo, permitindo a criação multiplataforma.

![React](https://img.shields.io/badge/-React-282C34?style=flat&logo=react&logoColor=61DAFB) Utilizado como interface do usuário, usa componentes reutilizáveis e gerenciamento de estado via React Context.

![TypeScript](https://img.shields.io/badge/-TypeScript-282C34?style=flat&logo=typescript&logoColor=3178C6) Utilizado para adicionar tipagem estática e aumentanr a segurança do código, facilitando a manutenção e prevenindo erros.

![Firebase](https://img.shields.io/badge/-Firebase-282C34?style=flat&logo=firebase&logoColor=FFCA28) Utilizado para gerenciar autenticação dos usuários (via email/senha) e armazenamento de dados em tempo real.

## Instalação

### • Pré-requisitos
Tenha o [Node.js](https://nodejs.org/en/download/package-manager)🛠️ instalado em sua máquina para poder executar o aplicativo.

### • Passos para instalação

• Clone o repositório:

```sh
git clone https://github.com/LucasMartins717/Activity-Logger
```

• Acesse o diretório do projeto:

```sh
cd Activity-Logger
```

• Instale as dependências:

```sh
npm install
```

• Inicie o aplicativo:

```sh
npm run dev
```

## Licença

• Este projeto utiliza a Licença MIT. Para mais informações, consulte o arquivo [LICENSE](./LICENSE).
