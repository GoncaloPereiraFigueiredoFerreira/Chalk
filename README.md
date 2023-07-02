![](https://media.discordapp.net/attachments/733843321671385160/1124986307169501234/image.png)

__Authors__: Gonçalo Ferreira & Rui Braga  
Portuguese Report Version: [PT](https://github.com/GoncaloPereiraFigueiredoFerreira/RPCW-Chalk/blob/main/README_pt.md)  

---

# Index

1. [Pitch and Objectives](#pitch-and-objectives)  
1.1 [Technologies](#tecnologies-involved)
2. [Main Features](#main-features)
3. [System Architecture](#system-architecture)  
3.1 [Frontend Server](#chalk-frontend)  
3.2 [Backend Server](#archival-system)  
3.3 [Authentication Server](#authentication-server)  
3.4 [File Storage Server](#storage-system)  
4. [What's Next](#whats-next)




# Pitch and Objectives

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
- __JWT__ (used for session management)
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




# System Architecture

In this section we'll enter a bit deeper into the system's functionality and how it was implemented. 

The Chalk service is composed of 4 different APIs, each with a distinct part to play in the service:
- The frontend API ([Chalk](#chalk-frontend))
- The backend API ([Archival System](#archival-system))
- An Authentication API ([Authentication Server](#authentication-server))
- The file storage server ([Storage System](#storage-system))


In the figure below it is possible to see how the different system components interact:
![System Architecture](https://media.discordapp.net/attachments/1083491237652332635/1121175465474928760/image.png)
Fig2: System Architecture Overview

This approach to the system design was mainly directed towards an easily scalable system; All the APIs are stateless and replication of the system would be trivial, even for the MongoDB instances that allow replication natively; the only problem would be the replication of the files stored in each Storage System, but we designed the storage system to act as a sort of Content Driven Network (CDN), where we store each file storage server, with it's metadata in the MongoDB Chalk; this way, each server will know where is each file.

## Chalk Frontend

The Chalk Frontend is the service component responsible for moderating client interaction; This application is responsible for serving HTML pages to the client's browser, limiting user acess to pages according to their role in each channel. 

This service utilizes Pug HTML templating, to customize each user's page, according their channel subscriptions and publications.

The sections bellow will demonstrate some of the developed user interfaces

### Dashboard
![](https://media.discordapp.net/attachments/733843321671385160/1125006858957103134/image.png?width=1252&height=614)
Fig3: User Dashboard


- Channel Search

In every page of the application, it is possible to search for a channel, using keywords. If submited, a page containning a list of all the channels will be shown, with every channel that matches those keywords.

- Side bar

Across all pages, it is possible to acess the side bar, that allows users, to sign out or acess the dashboard or the subscribed or published channels


- Toggle Darkmode

In every page of the app, it is possible to toggle darkmode, changing the colors of the interface to a darker tone.

- Dashboard channel infomation aggregation

In the dashboard, all the subscribed channels announcements and important dates are shown, ordered by date, making it easier to navigate to each channel and announcement


### Channel Page
![](https://media.discordapp.net/attachments/733843321671385160/1125005422630293524/image.png?width=1283&height=614)
Fig4: Channel view of a Publisher

- File search

File search can be achieved by using the search bar placed on the top right corner of the content tree. Files that match the keywords used, will appear on the content tree

- Content Tree

The content tree for each channel contains the directory structure associated with said channel. It is fully navigable, as in, an user can enter/leave a directory, that leads to the display of different files, according to the directory that the user is in. It is also possible to create directories, upload new files, delete, access and download files (given that the user has permission to do so).

- Uploading files

In the page dedicated to uploading files, there's a form with an input element for the user to select files to upload, which prompts the rest of the form to appear with input boxes to specify the name and include tags to describe each file. 

- Settings page 

The publisher of a channel has acess to a settings page, where it can edit channel features, check the student list, see all the submissions, add a co-publisher, or completly delete a channel

### File Management
- cache
- upload file
- get files


## Archival System

The archival system manages metainformation that's crucial for the application to operate properly, which includes user data, metadata of the stored files and information about the active channels 

- User Data
- Channels Data
- Files Metadata
- Announcements
- Important Dates

It serves as a backend API to all the Chalk service, providing several routes that allow the users to interact with the state of the application. Routes are grouped according to their actions:
- Acess Routes (acess information about channels, users, etc)
- Ingest Routes (add files, announcements, etc)
- Manage Routes (delete or edit some components)


## Authentication Server

The authentication server is responsible for storing and managing user accounts. Each time a user registers or logs in, the frontend must send the credentials to this service, that will then perform the createUser/loginUser operation, and attribute a JWT token for the user to store in its cookies.  

In order to authenticate tokens created in this server, JWT tokens are generated with a RSA Key Pair; this way a frontend server, will be able to authenticate users using the public key (that is requested every time this server starts).  
 
This API utilizes PassportJS to simplify the process of storing user accounts, by automatically hashing user passwords and providing methods to authenticate users. The user information stored in this API only involves their name, email, level of acess (user or admin) and last acessed and account creation dates.

## Storage System 

The storage system is where the actual files are kept and its funcionalities include storing new files, deleting a file and retrieving files.

- Storing new files: An upload operation is made by sending a single file in the BagIt packaging format. That file (with a .zip extension) is extracted to a certain folder and the integrity of its data is verified. The files are stored if the verification proves to be successful and are named accordingly to their checksums.
- Deleting a file: A delete operation is made by specifying the location of the file to be erased with a HTTP DELETE method.
- Retrieving files: The retrieval of a set of files is achieved by packaging all the files selected (the files are selected by specifying their checksums) into a BagIt bag, which is sent to to the Chalk Frontend.



# What's Next




