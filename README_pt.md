![](https://media.discordapp.net/attachments/733843321671385160/1124986307169501234/image.png)

__Autores__: Gonçalo Ferreira & Rui Braga  
English Report Version: [EN](https://github.com/GoncaloPereiraFigueiredoFerreira/RPCW-Chalk/blob/main/README.md)  

---



# Índice

1. [Introdução e Objectivos](#introdução-e-objetivos)  
1.1 [Tecnologias](#tecnologias-envolvidas)  
2. [Principais Funcionalidades](#funcionalidades-principais)  
3. [Arquitetura do sistema](#arquitetura-do-sistema)  
3.1 [Servidor Frontend](#chalk-frontend)  
3.2 [Servidor Backend](#archival-system)  
3.3 [Servidor de Autenticação](#authentication-server)  
3.4 [Servidor de armazenamento de arquivos](#sistema-de-armazenamento)  
4. [Trabalho Futuro](#trabalho-futuro)  



# Introdução e Objetivos

Chalk é uma plataforma web, que permite a gestão e distribuição de recursos educacionais, desenvolvidos principalmente para um ambiente de universidade/faculdade. A plataforma oferece suporte a múltiplas funcionalidades que permitem aos publicadores de conteúdo organizar os seus canais, agendar entregas e criar anúncios para todos os subscritores.
Posto isto, os principais objetivos o desenvolvimento deste serviço, foram:
- Desenvolver uma plataforma que permita a partilha de arquivos (de qualquer tipo)
- Permitir que os publicadores de conteúdo postem anúncios, visíveis para todos os alunos inscritos
- Permitir que os alunos postem comentários em qualquer anúncio
- Interface intuitiva para a demonstração de ficheiros
- Proteger rotas de acordo com a função do utilizador e a função em cada canal

## Tecnologias Envolvidas

As principais tecnologias utilizadas neste projeto foram:
- __NodeJS__ (linguagem de programação principal utilizada no projeto)
- __ExpressJS__ (middleware de cada API)
- __Tailwind__ (uma biblioteca CSS usada em todas as páginas da web)
- __Pug__ (uma linguagem de modelagem HTML que simplifica a criação de HTML)
- __MongoDB__ (SGBD para os servidores de autenticação e backend)
- __PassportJS__ (para gestão de contas de utilizador)
- __JWT__ (usado para gestão de sessões)
- __Docker__ (para montagem de todos os componentes e "deployment" mais fácil do serviço)

# Funcionalidades Principais

As principais funcionalidades do serviço Chalk são:
- Os utilizadores deverão realizar o registo de uma conta antes de começar a utilizar a plataforma
- Os utilizadores poderão criar os seus próprios canais, onde poderão publicar ficheiros novos, anúncios e datas importantes
- Os canais poderão ser protegidos com um código de entrada, de forma a que apenas a utilizadores subscritos poderão ver os contéudos do mesmo
- Utilizadores podem subscrever a um Canal
- Na dashboard de cada utilizador, são apresentados todos os anúncios e datas importantes, de todos os canais subscritos e publicados
- A página de um canal demonstra o nome, um banner, uma secção com a descrição do canal, os anúncios publicados, as datas importantes marcadas e uma árvore de contéudos, completamente navegável (onde o publicador poderá carregar ficheiros e ordenar os mesmos em diretorias)
- Publicadores poderão criar datas importantes, que podem ser configuradas como submissões de ficheiros
- Publicadores poderão descarregar cada submissão de acordo com a data importante e o aluno que a submeteu
- É possivel a adição de outro utilizador como publicador de conteúdos, com os mesmos privilégios do publicador original
- Publicadores poderão editar os seus canais, alterando o nome, banner, descrição ou código de entrada
- Publicadores poderão apagar o seu canal por completo
- Publicadores poderão apagar ficheiros carregados, anúncios e datas importates
- Publicadores podem também editar anúncios
- Todos os ficheiros nos conteúdos são descarregáveis por subscritores e publicadores (poderão ser descarregados vários ficheiros simultaneamente, que serão comprimidos num ficheiro zip)
- É possível a pesquisa de ficheiros num canal, através da barra de pesquisa
- Utilizadores poderão encontrar todos os canais criados na barra de pesquisa vísivel na barra superior
- Ficheiros carregados poderão ser acompanhados por um anúncio automático que notifica os subscritores em caso de um novo anúncio ser criado

# Arquitetura do sistema

Nesta secção exploraremos a funcionalidade do sistema bem como, como foi implementado.  

O serviço Chalk é composto por 4 APIs diferentes, cada uma com papel distinto na aplicação:
- O frontend API ([Chalk](#chalk-frontend))
- O backend API ([Archival System](#archival-system))
- A Authentication API ([Authentication Server](#authentication-server))
- Servidor de Armazenamento de Ficheiros ([Sistema de Armazenamento](#sistema-de-armazenamento))


Na figura abaixo é possivel observar como é que os diferentes componentes interagem:
![System Architecture](https://media.discordapp.net/attachments/1083491237652332635/1121175465474928760/image.png)

Fig2: Vista geral sobre a arquitetura do sistema

Esta abordagem ao design do sistema, foi desenvolvida com a facilidade de escalabilidade do sistema em mente; Todas as  APIs são "stateless" e a sua replicação seria trivial, até para as instancias da base de dados MongoDB que permitem a replicação nativamente; O único problema poderia ser na replicação dos ficheiros no interior do Storage System, mas desenhamos este sistema para agir como uma especie de CDN (rede de distribuição de conteúdos); na meta informação de cada ficheiro é guardado qual o servidor que guarda o ficheiro na sua integra


## Chalk Frontend

O frontend do Chalk é o componente do serviço responsável por moderar a interação do cliente com a aplicação; Esta aplicação serve as páginas HTML ao browser do cliente de acordo com os seus dados e papel em cada canal.

Este serviço utiliza Pug HTML templating para customizar a página de cada utilizador, de acordo as suas subscrições e canais publicados.

As secções abaixo irão demonstrar algumas das interfaces de utilizador desenvolvidas.

### Dashboard
![](https://media.discordapp.net/attachments/733843321671385160/1125006858957103134/image.png?width=1252&height=614)
Fig3: Dashboard do utilizador

- Pesquisa por canal

Em qualquer página da aplicação é possível procurar por um canal, utilizando keywords. Quando submitidas, uma página com uma listagem de canais será apresentada, com todos os canais que dão match a essas keywords

- Barra lateral

Em todas as paǵinas da aplicação é possível aceder à barra lateral que permite desligar a sessão, ou aceder à dashboard ou canais subscritos.

- Acionar o modo escuro

Em qualquer página da aplicação é possível ligar o modo escuro, alterando as cores da interface gráfica para um tom de cores mais escuro

- Agregação de informações de canais

Na dashboard, serão apresnetados todos os anúncios e datas importantes de todos os canais subscritos, ordenados pela sua data, tornando a navegação mais fácil para cada canal ou anúncio.


### Channel Page
![](https://media.discordapp.net/attachments/733843321671385160/1125005422630293524/image.png?width=1283&height=614)
Fig4: Vista de um canal para um publicador

- Pesquisa por ficheiros

A pesquisa por ficheiros poderá ser realizada na barra de pesquisa localizada no canto superior direito da árvore de contéudos. A pesquisa é feita com base no nome do ficheiro, e os ficheiros cujo nome corresponda à pesquisa, aparecerão na árvore.

- Definições

O publicador de um canal tem acesso à página das definições, onde pode editar o canal, obter a lista de alunos subscritos, verificar submissões, adicionar um novo publicador ou apagar por completo o canal

- Árvore de conteúdo

A árvore de conteúdo de cada canal contém a estrutura de diretorias associada a esse canal. É totalmente navegável, ou seja, um utilizador pode entrar/sair de uma diretoria, o que leva à exibição de diferentes arquivos, de acordo com o diretório em que o utilizador se encontra. Também é possível criar diretorias, fazer upload de novos arquivos, apagar, acessar e baixar arquivos (desde que o utilizador tenha permissão para fazê-lo).

Para gerir e otimizar a passagem de ficheiros pelo servidor foi necessário implementar alguns protocolos. Para fazer upload de ficheiros (sejam ficheiros para a árvore de conteúdo ou submissões), o servidor faz um "bag" com os ficheiros selecionados pelo utilizador no formato de empacotamento BagIt, que é enviado ao sistema de armazenamento e alguma metainformação é enviada ao servidor de backend. Para buscar ficheiros, o servidor mantém uma cache para diminuir os tempos de latência e antes que qualquer pedido seja feito ao servidor de armazenamento, verifica-se se algum dos ficheiros pedidos existe na cache. Se um ficheiro estiver presente na cache não é requisitado e os que não estiverem presentes são pedidos ao servidor de armazenamento. Em resposta a este pedido, o frontend do Chalk recebe um "bag", que é extraído e a integridade do seu conteúdo é verificada e depois, enviado ao utilizador (ou mantido numa diretoria pública caso o utilizador pretenda apenas visualizar o ficheiro selecionado). 


### Upload Files Page

![](https://i.imgur.com/MF63wbO.png)
Fig5: Upload de ficheiros (dark mode)

Na página dedicada ao upload de arquivos, há um formulário com um elemento de entrada para o utilizador selecionar os arquivos a serem carregados, o que causa que o restante do formulário apareça com caixas de entrada para especificar o nome e incluir tags para descrever cada arquivo.

![](https://i.imgur.com/G0IZz0i.png)
Fig6: Formulário dinâmico (dark mode)

Existe também a opção de fazer uma anúncio automático para notificar outros utilizadores que novos ficheiros foram adicionados.


## Archival System

O Archival System gere a metainformação crucial para o bom funcionamento do aplicativo, que inclui dados do utilizador, metadados dos arquivos armazenados e informações sobre os canais ativos

- Dados do utilizador
- Dados de Canais
- Metadados de arquivos
- Anúncios
- Datas importantes

Esta serve como uma API de backend para todo o serviço Chalk, fornecendo várias rotas que permitem aos utilizadores interagir com o estado do aplicativo. As rotas são agrupadas de acordo com suas ações:
- Rotas de Acesso (acesso a informações sobre canais, utilizadores, etc)
- Rotas de Ingestão (adicionar arquivos, anúncios, etc)
- Rotas de Gestão (excluir ou editar alguns componentes)

## Authentication Server

O servidor de autenticação é responsável por armazenar e gerenciar contas de utilizadores. Cada vez que um utilizador se regista ou faz login, o frontend deve enviar as credenciais para este serviço, que fará a operação createUser/loginUser, e atribuirá um token JWT para o utilizador armazenar em seus cookies.

Para autenticar os tokens criados neste servidor, os tokens JWT são gerados com um par de chaves RSA; desta forma um servidor frontend, poderá autenticar utilizadores utilizando a chave pública (que é solicitada toda vez que este servidor inicia).
 
Essa API utiliza o PassportJS para simplificar o processo de armazenamento de contas de utilizador, fazendo hashing automaticamente das senhas de utilizador e fornecendo métodos para autenticar utilizadores. As informações do utilizador armazenadas nesta API envolvem apenas o nome, e-mail, nível de acesso (utilizador ou admin) e datas do último acesso e criação da conta.



## Sistema de Armazenamento

O sistema de armazenamento é onde os ficheiros são mantidos e as suas funcionalides incluem armazenamento de novos ficheiros, eliminar um ficheiro e recuperar ficheiros.
- Armazenar novos ficheiros: Uma operação de upload de ficheiros é realizada através do envio de um ficheiro no formato de empacotamento BagIt. Esse ficheiro (com uma extensão .zip) é extraído para uma certa diretoria e é feita a verificação da integridade dos seus dados. Os ficheiros são guardados se a verificação tiver sucesso e são nomeados de acordo com os seus checksums.

- Eliminar um ficheiro: Uma operação de eliminição é feita através da especificação da localização do ficheiro a ser removido com um método HTTP DELETE.

- Recuperação de ficheiros: A recuperação de um conjunto de ficheiros é conseguida ao empacotar todos os ficheiros selecionados (os ficheiros são selecionados especificando os seus checksums) num bag do tipo BagIt, que é enviado para o frontend do Chalk. 


# Trabalho Futuro

Após um periodo de descanso (bem necessário), ainda existiriam algumas features que o grupo gostaria de desenvolver mais aprofundadamente:

- Pesquisa de ficheiros baseada em Tags
- Mais operações de administração para admin, incluindo "account bans" e gestão de subscrições
- Google e outras plataformas como forma de autenticação
- Criação de salas de video-reuniões
- Testes Online
