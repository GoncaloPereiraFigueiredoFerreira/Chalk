# RPCW-Chalk

English Report Version: [EN](https://github.com/GoncaloPereiraFigueiredoFerreira/RPCW-Chalk/blob/main/README.md)  

---

## Index

1. [Pitch and Objectives](#pitch-and-objectives)  
1.1 [Technologies](#tecnologies-involved)
2. [Main Features](#main-features)
3. [System Architecture](#system-architecture)  
3.1 [Frontend Server](#chalk-frontend)  
3.2 [Backend Server](#archival-system)  
3.3 [Authentication Server](#authentication-server)  
3.4 [Servidor de Armazenamento de Ficheiros](#sistema-de-armazenamento)  


---

## Pitch and Objectives

Chalk is a web-based platform, that allows the management and distribution of educational resources, mainly developed for a university/college environment. The platform supports multiple features that allow content publishers to organize their channels, arrange deliveries and create announcements for all subscribers.  
With this being said, the main objectives being the development of this service, were:
- Develop a platform that allows file sharing (of any type)
- Allow content publishers, to post Announcements, visible to all subscribed students
- Allow students to post comments under each Announcement
- Have an intuitive structure for file organization and search
- Protect routes according to the user role and the role within each channel

### Technologies Involved

The main technologies used behind this project were:
- __NodeJS__ (the main programming language used in the project)
- __ExpressJS__ (middleware of each API)
- __Tailwind__ (a CSS library that was used for all the web pages)
- __Pug__ (an HTML templating language that simplifies HTML creation)
- __MongoDB__ (the DBMS for the Authentication and Backend Servers)
- __PassportJS__ (to handle user account storage)
- __Docker__ (assembling of all the components and easier deployment of the service)


## Main Features

The main features offered by the Chalk are:
- Users have to register an account to use the platform
- Users may create their own channels, where they can publish new files, announcements, and important dates
- Channels may be protected with an entry code so that only authorized users can subscribe and see all the content
- Users may subscribe to a channel; Subscribed users receive all news about a channel in their dashboard
- Each channel possesses, a name, a banner, an about section, announcements, important dates and a fully navigable file content tree, that allows the publisher to upload files and organize them with directories and file tags
- Publishers may create an important date, that allows a user file submission
- Publishers can download each submission according to the subscriber and the important date associated
- Publishers may add other users as co-publishers, granting them the same privileges
- Publishers may edit their channels, changing the channel's name, banner, or about section
- Publishers may delete uploaded files, created announcements, and important dates
- Publishers may edit announcements
- Both subscribers and publishers may download any content posted in the content tree (multiple file downloads are possible, with the compressing into a .zip)
- The content tree allows for file searching by file name
- Users can find all the created channels in the always visible search bar
- File uploads may be coupled with an automated announcement for notifying subscribers of the new file upload




## System Architecture

In this section we'll enter a bit deeper into the system's functionality and how it was implemented. 

The Chalk service is composed of 4 different APIs, each with a distinct part to play in the service:
- The frontend API ([Chalk](#chalk-frontend))
- The backend API ([Archival System](#archival-system))
- An Authentication API ([Authentication Server](#authentication-server))
- Servidor de Armazenamento de Ficheiros ([Sistema de Armazenamento](#sistema-de-armazenamento))


In the figure below it is possible to see how the different system components interact:
![System Architecture](https://media.discordapp.net/attachments/1083491237652332635/1121175465474928760/image.png)

This approach to the system design was mainly directed towards an easily scalable system; All the APIs are stateless and replication of the system would be trivial, even for the MongoDB instances that allow for replication through the MongoDB replication API; the only problem would be the replication of the files stored in each Storage System, but we designed the storage system to act as a sort of Content Driven Network (CDN), where we store each file storage server, with it's metadata in the MongoDB Chalk; this way, each server will know where is each file.

### Chalk Frontend


### Archival System


### Authentication Server


### Sistema de Armazenamento

O sistema de armazenamento é onde os ficheiros são mantidos e as suas funcionalides incluem armazenamento de novos ficheiros, eliminar um ficheiro e recuperar ficheiros.
- Armazenar novos ficheiros: Uma operação de upload de ficheiros é realizada através do envio de um ficheiro no formato de empacotamento BagIt. Esse ficheiro (com uma extensão .zip) é extraído para uma certa diretoria e é feita a verificação da integridade dos seus dados. Os ficheiros são guardados se a verificação tiver sucesso e são nomeados de acordo com os seus checksums.

- Eliminar um ficheiro: Uma operação de eliminição é feita através da especificação da localização do ficheiro a ser removido com um método HTTP DELETE.

- Recuperação de ficheiros: A recuperação de um conjunto de ficheiros é conseguida ao empacotar todos os ficheiros selecionados (os ficheiros são selecionados especificando os seus checksums) num bag do tipo BagIt, que é enviado para o frontend do Chalk. 



