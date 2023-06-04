const COMMON_PATH = "http://127.0.0.1:8000/api/v1";
let username = "";
let userId = 0;
let userRole = "";
let access_token = null;
let eTag = "";

// ------------ OBJETOS ----------------

class Element {
    constructor(id, name, birth, death, image, wiki) {
        this.id = id;
        this.name = name;
        this.birth = birth;
        this.death = death;
        this.image = image;
        this.wiki = wiki;
    }
}

class Product extends Element {
    constructor(id, name, birth, death, image, wiki, relatedEntities, relatedPeople) {
        super(id, name, birth, death, image, wiki);
        this.relatedEntities = relatedEntities;
        this.relatedPeople = relatedPeople;
    }
}

class Entity extends Element {
    constructor(id, name, birth, death, image, wiki, relatedProducts, relatedPeople) {
        super(id, name, birth, death, image, wiki);
        this.relatedProducts = relatedProducts;
        this.relatedPeople = relatedPeople;
    }
}

class Person extends Element {
    constructor(id, name, birth, death, image, wiki, relatedProducts, relatedEntities) {
        super(id, name, birth, death, image, wiki);
        this.relatedProducts = relatedProducts;
        this.relatedEntities = relatedEntities;
    }
}

class User {
    constructor(id, username, password, role, email, birth) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        // this.active = active;
        this.email = email;
        this.birth = birth;
    }
}

// ------------ MÉTODOS REUTILIZABLES ----------------

function clean() {
    let main = document.getElementById("main");
    main.innerHTML = "";
}

function putIndex() {
    let section = document.createElement("section");
    section.innerHTML = '<p onclick="loadIndex()">INICIO</p>'
    return(section);
}

function putUsername() {
    let section = document.createElement("section");
    section.setAttribute("class", "username");
    let p = document.createElement("p");
    let text = document.createTextNode("Usuario: " + username);
    p.appendChild(text);
    section.appendChild(p);
    return(section);
}

// ------------ BD ----------------

function getElementsFromDB(relativePath, f) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.responseType = "json";
    xhr.onload = function () {
        if(xhr.status === 200) {
            eTag = xhr.getResponseHeader("eTag");
            f(JSON.stringify(xhr.response));
        }
        else {
            alert("status " + xhr.status);
            let listName = relativePath.substring(1);
            f(`"${listName}":[]`); // comprobar
        }
    }
    xhr.send();
}

function getFromDB(relativePath, f) {
    let finalPath = COMMON_PATH + relativePath;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.responseType = "json";
    xhr.onload = function () {
        if(xhr.status === 200)
            f(JSON.stringify(xhr.response));
        else
            alert("status " + xhr.status);
    }
    xhr.send();
}

function postToDatabase(relativePath, object, f) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.setRequestHeader("Content-type", "application/json");
    let jsonObject = JSON.stringify(object);
    xhr.onload = () => {
        if(xhr.status === 201){
            alert("Operación realizada con éxito");
            f(xhr.response);
        }
        else {
            alert("Error. Response status = " + xhr.status);
            f(null);
        }
    }
    xhr.send(jsonObject);
}

function putToDatabase(relativePath, object) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("If-Match", eTag);
    let jsonObject = JSON.stringify(object);
    xhr.send(jsonObject);
}

function deleteOnDatabase(relativePath) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = () => {
        if(xhr.status === 204)
            alert("Operación realizada con éxito");
        else
            alert("Error. Response status = " + xhr.status);
    }
    xhr.send();
}

// ------------ HOME ----------------

function start() {
    clean();
    let main = document.getElementById("main");
    let section1 = loginForm();
    let section2 = signupForm();
    main.appendChild(section1);
    main.appendChild(section2);
}

function loginForm() {
    let section = document.createElement("section");
    section.setAttribute("class", "loginForm");
    section.innerHTML = '<form id = "loginForm">';
    section.innerHTML += '<h2>Iniciar sesión</h2>';
    section.innerHTML += '<label for="Usuario" class = "label">Usuario</label>';
    section.innerHTML += '<input id="username" class = "input" type="text" name="Usuario"/>';
    section.innerHTML += '<label for="Contraseña" class = "label">Contraseña</label>';
    section.innerHTML += '<input id="password" class = "input" type="password" name="Contraseña"/>';
    section.innerHTML += '<input class = "button" type="button" name="Login" value="Iniciar sesión" onclick = "login();"/>';
    section.innerHTML += '</form>';
    return(section);
}

function signupForm() {
    let section = document.createElement("section");
    section.setAttribute("class", "signupForm");
    section.innerHTML = '<form id = "signupForm">';
    section.innerHTML += '<h2>Registrarse</h2>';
    section.innerHTML += '<label for="Usuario" class = "label">Usuario</label>';
    section.innerHTML += '<input id="newUsername" class = "input" type="text" name="Usuario"/>';
    section.innerHTML += '<label for="Contraseña" class = "label">Contraseña</label>';
    section.innerHTML += '<input id="newPassword" class = "input" type="password" name="Contraseña"/>';
    section.innerHTML += '<label for="Contraseña2" class = "label">Repetir contraseña</label>';
    section.innerHTML += '<input id="newPassword2" class = "input" type="password" name="Contraseña2"/>';
    section.innerHTML += '<input type="button" class = "button" name="Login" value="Registrarse" onclick = "signup();"/>';
    section.innerHTML += '</form>';
    return(section);
}

function login() {
    let usernameForm = document.getElementById("username").value;
    let passwordForm = document.getElementById("password").value;
    let xhr = new XMLHttpRequest();
    let loginData = {
        "username": usernameForm,
        "password": passwordForm
    };
    xhr.open("POST", "http://127.0.0.1:8000/access_token", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function() {
        if (xhr.status === 200) {
            // coger Authorization de la cabecera de la respuesta
            let authHeader = xhr.getResponseHeader('Authorization');
            // coger el token para hacer peticiones
            access_token = authHeader.split(' ')[1]; // Quitar 'Bearer '
            // coger la parte de los datos
            let data = JSON.parse(atob(access_token.split('.')[1]));
            // meter los datos en username, userId y userRole
            username = data.sub;
            userId = data.uid;
            if(data.scopes == "reader,writer")
                userRole = "writer";
            else
                userRole = "reader";
            // cargar index
            loadIndex();
        } else {
            alert("Error: Status = " + xhr.status);
            start();
        }
    };
    xhr.send(JSON.stringify(loginData));
}

function signup() {
    let usernameForm = document.getElementById("newUsername").value;
    let passwordForm = document.getElementById("newPassword").value;
    let passwordForm2 = document.getElementById("newPassword2").value;
    let email = usernameForm + "@example.com";
    let newUser;
    if(passwordForm === passwordForm2) {
        newUser = {
            "username": usernameForm,
            "email": email,
            "password": passwordForm,
            "role": "reader"
        }
        let xhr = new XMLHttpRequest();
        let finalPath = COMMON_PATH + "/users";
        xhr.open('POST', finalPath, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onload = function() {
            if (xhr.status === 201) {
                alert("STATUS 201"); // eliminar
                let response = JSON.parse(xhr.responseText);
                console.log("Response : \n" + response); // eliminar
                // enviar mensaje de éxito
                alert("Usuario creado correctamente.");
                // cargar index
                start();

            } else {
                alert("Error: Status = " + xhr.status);
                start();
            }
        };
        xhr.send(JSON.stringify(newUser));
    }
    else {
        alert("Error: Las contraseñas no coinciden");
        start();
    }
}

// ------------ INDEX ----------------

function loadIndex() {
    clean();
    let main = document.getElementById("main");
    let username = putUsername();
    main.appendChild(username);
    let form = logoutForm();
    main.appendChild(form);
    let profile = profileForm();
    main.appendChild(profile);
    let elements = loadIndexTable();
    main.appendChild(elements);
    if(userRole === "writer") {
        let userManagement = userManagementForm();
        main.appendChild(userManagement);
    }
}

function logoutForm() {
    let section = document.createElement("section");
    section.innerHTML = '<form>';
    section.innerHTML += '<input type="button" name="Logout" value="Cerrar sesión" onclick="start();"/>';
    section.innerHTML += '</form>';
    return(section);
}

function profileForm() {
    let section = document.createElement("section");
    section.innerHTML = '<form>';
    section.innerHTML += '<input type="button" name="Profile" value="Mi perfil" onclick="loadProfile();"/>';
    section.innerHTML += '</form>';
    return(section);
}

function userManagementForm() {
    let section = document.createElement("section");
    section.innerHTML = '<form>';
    section.innerHTML += '<input type="button" name="UserManagement" value="Gestión de Usuarios" onclick="loadUserManagement();"/>';
    section.innerHTML += '</form>';
    return(section);
}

function loadIndexTable() {
    let section = document.createElement("section");
    let tableProducts = createTable("Productos");
    let tablePeople = createTable("Personas");
    let tableEntities = createTable("Entidades");
    section.appendChild(tableProducts);
    section.appendChild(tablePeople);
    section.appendChild(tableEntities);
    createProductstbody("/products", tableProducts);
    createPeopletbody("/persons", tablePeople);
    createEntitiestbody("/entities", tableEntities);
    return section;
}

function createTable(title) {
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    thead.innerHTML = '<p class = "subtitle">' + title + '</p>';
    table.appendChild(thead);
    let tbody = document.createElement("tbody");
    table.appendChild(tbody);
    return table;
}

function createProductstbody(url, table) {
    getElementsFromDB(url, function(response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        let products = arrayProducts.map(function(item) {
            let p = item.product;
            return new Product(p.id, p.name, null, null, p.imageUrl, null, null, null);
        });

        if(userRole === "reader")
            createReaderProductstbody(products, table);
        else
            createWriterProductstbody(products, table);
    });
}

function createPeopletbody(url, table) {
    getElementsFromDB(url, function(response) {
        let jsonResponse = JSON.parse(response);
        let arrayPeople = jsonResponse.persons;
        let people = arrayPeople.map(function(item) {
            let p = item.person;
            return new Person(p.id, p.name, null, null, p.imageUrl, null, null, null);
        });
        if(userRole === "reader")
            createReaderPeopletbody(people, table);
        else
            createWriterPeopletbody(people, table);
    });
}

function createEntitiestbody(url, table) {
    getElementsFromDB(url, function(response) {
        let jsonResponse = JSON.parse(response);
        let arrayEntities = jsonResponse.entities;
        let entities = arrayEntities.map(function(item) {
            let e = item.entity;
            return new Entity(e.id, e.name, null, null, e.imageUrl, null, null, null);
        });
        if(userRole === "reader")
            createReaderEntitiestbody(entities, table, showEntity);
        else
            createWriterEntitiestbody(entities, table, showEntity, editEntity, deleteEntity, createEntity);
    });
}

function createReaderProductstbody(products, table) {
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let tr = document.createElement("tr");
        let td = document.createElement("td");

        // meter en td la info.
        let img = document.createElement("img");
        img.setAttribute("src", product.image);
        img.setAttribute("alt", product.name);
        img.setAttribute("width", "5%");
        td.appendChild(img);
        let a = document.createElement("a");
        let productName = document.createTextNode(product.name);
        a.appendChild(productName);
        a.setAttribute("id", product.id);
        a.addEventListener('click', showProduct);
        td.appendChild(a);

        tr.appendChild(td);
        table.querySelector("tbody").appendChild(tr);
    }
}

function createReaderPeopletbody(people, table) {
    for (let i = 0; i < people.length; i++) {
        let person = people[i];
        let tr = document.createElement("tr");
        let td = document.createElement("td");

        // meter en td la info.
        let img = document.createElement("img");
        img.setAttribute("src", person.image);
        img.setAttribute("alt", person.name);
        img.setAttribute("width", "5%");
        td.appendChild(img);
        let a = document.createElement("a");
        let personName = document.createTextNode(person.name);
        a.appendChild(personName);
        a.setAttribute("id", person.id);
        a.addEventListener('click', showPerson);
        td.appendChild(a);

        tr.appendChild(td);
        table.querySelector("tbody").appendChild(tr);
    }
}

function createReaderEntitiestbody(entities, table) {
    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let tr = document.createElement("tr");
        let td = document.createElement("td");

        // meter en td la info.
        let img = document.createElement("img");
        img.setAttribute("src", entity.image);
        img.setAttribute("alt", entity.name);
        img.setAttribute("width", "5%");
        td.appendChild(img);
        let a = document.createElement("a");
        let entityName = document.createTextNode(entity.name);
        a.appendChild(entityName);
        a.setAttribute("id", entity.id);
        a.addEventListener('click', showEntity);
        td.appendChild(a);

        tr.appendChild(td);
        table.querySelector("tbody").appendChild(tr);
    }
}

function createWriterProductstbody(products, table) {
    let tr;
    let td;
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        tr = document.createElement("tr");
        td = document.createElement("td");

        // meter en td la info.
        let img = document.createElement("img");
        img.setAttribute("src", product.image);
        img.setAttribute("alt", product.name);
        img.setAttribute("width", "5%");
        td.appendChild(img);
        let a = document.createElement("a");
        let productName = document.createTextNode(product.name);
        a.appendChild(productName);
        a.setAttribute("id", product.id);
        a.addEventListener('click', showProduct);
        td.appendChild(a);
        let editButton = document.createElement("button");
        editButton.setAttribute("id", product.id);
        editButton.type = "button";
        editButton.innerText = "Editar";
        editButton.addEventListener('click', editProduct);
        td.appendChild(editButton);
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("id", product.id);
        deleteButton.type = "button";
        deleteButton.innerText = "Borrar";
        deleteButton.addEventListener('click', deleteProduct);
        td.appendChild(deleteButton);

        tr.appendChild(td);
        table.querySelector("tbody").appendChild(tr);
    }
    tr = document.createElement("tr");
    td = document.createElement("td");
    let createButton = document.createElement("button");
    createButton.type = "button";
    createButton.setAttribute("class", "createButton");
    createButton.innerText = "Crear";
    createButton.addEventListener('click', createProduct);
    td.appendChild(createButton);
    tr.appendChild(td);
    table.querySelector("tbody").appendChild(tr);
}

function createWriterPeopletbody(people, table) {
    let tr;
    let td;
    for (let i = 0; i < people.length; i++) {
        let person = people[i];
        tr = document.createElement("tr");
        td = document.createElement("td");

        // meter en td la info.
        let img = document.createElement("img");
        img.setAttribute("src", person.image);
        img.setAttribute("alt", person.name);
        img.setAttribute("width", "5%");
        td.appendChild(img);
        let a = document.createElement("a");
        let personName = document.createTextNode(person.name);
        a.appendChild(personName);
        a.setAttribute("id", person.id);
        a.addEventListener('click', showPerson);
        td.appendChild(a);
        let editButton = document.createElement("button");
        editButton.setAttribute("id", person.id);
        editButton.type = "button";
        editButton.innerText = "Editar";
        editButton.addEventListener('click', editPerson);
        td.appendChild(editButton);
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("id", person.id);
        deleteButton.type = "button";
        deleteButton.innerText = "Borrar";
        deleteButton.addEventListener('click', deletePerson);
        td.appendChild(deleteButton);

        tr.appendChild(td);
        table.querySelector("tbody").appendChild(tr);
    }
    tr = document.createElement("tr");
    td = document.createElement("td");
    let createButton = document.createElement("button");
    createButton.type = "button";
    createButton.setAttribute("class", "createButton");
    createButton.innerText = "Crear";
    createButton.addEventListener('click', createPerson);
    td.appendChild(createButton);
    tr.appendChild(td);
    table.querySelector("tbody").appendChild(tr);
}

function createWriterEntitiestbody(entities, table) {
    let tr;
    let td;
    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        tr = document.createElement("tr");
        td = document.createElement("td");

        // meter en td la info.
        let img = document.createElement("img");
        img.setAttribute("src", entity.image);
        img.setAttribute("alt", entity.name);
        img.setAttribute("width", "5%");
        td.appendChild(img);
        let a = document.createElement("a");
        let entityName = document.createTextNode(entity.name);
        a.appendChild(entityName);
        a.setAttribute("id", entity.id);
        a.addEventListener('click', showEntity);
        td.appendChild(a);
        let editButton = document.createElement("button");
        editButton.setAttribute("id", entity.id);
        editButton.type = "button";
        editButton.innerText = "Editar";
        editButton.addEventListener('click', editEntity);
        td.appendChild(editButton);
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("id", entity.id);
        deleteButton.type = "button";
        deleteButton.innerText = "Borrar";
        deleteButton.addEventListener('click', deleteEntity);
        td.appendChild(deleteButton);

        tr.appendChild(td);
        table.querySelector("tbody").appendChild(tr);
    }
    tr = document.createElement("tr");
    td = document.createElement("td");
    let createButton = document.createElement("button");
    createButton.type = "button";
    createButton.setAttribute("class", "createButton");
    createButton.innerText = "Crear";
    createButton.addEventListener('click', createEntity);
    td.appendChild(createButton);
    tr.appendChild(td);
    table.querySelector("tbody").appendChild(tr);
}

// ------------ CREAR ELEMENTO ----------------

function createProduct() {
    let entities;
    let people;
    getElementsFromDB("/entities", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayEntities = jsonResponse.entities;
        entities = arrayEntities.map(function(item) {
            let e = item.entity;
            return new Entity(e.id, e.name, null, null, null, null, null, null);
        });
        getElementsFromDB("/persons", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayPeople = jsonResponse.persons;
            people = arrayPeople.map(function(item) {
                let p = item.person;
                return new Person(p.id, p.name, null, null, null, null, null, null);
            });
            generateCreateElementForm(entities, people, "product");
        });
    });
}
function createPerson() {
    let products;
    let entities;
    getElementsFromDB("/products", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        products = arrayProducts.map(function(item) {
            let p = item.product;
            return new Product(p.id, p.name, null, null, null, null, null, null);
        });
        getElementsFromDB("/entities", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayEntities = jsonResponse.entities;
            entities = arrayEntities.map(function(item) {
                let e = item.entity;
                return new Entity(e.id, e.name, null, null, null, null, null, null);
            });
            generateCreateElementForm(products, entities, "person");
        });
    });
}
function createEntity() {
    let products;
    let people;
    getElementsFromDB("/products", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        products = arrayProducts.map(function(item) {
            let p = item.product;
            return new Product(p.id, p.name, null, null, null, null, null, null);
        });
        getElementsFromDB("/persons", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayPeople = jsonResponse.persons;
            people = arrayPeople.map(function(item) {
                let p = item.person;
                return new Person(p.id, p.name, null, null, null, null, null, null);
            });
            generateCreateElementForm(products, people, "entity");
        });
    });
}

function generateCreateElementForm(related1, related2, type) {
    clean();
    let main = document.getElementById("main");
    let index = putIndex();
    let username = putUsername();
    let form = document.createElement("form");
    if(type === "product")
        form.innerHTML = '<p>Crear producto</p>';
    else if(type === "entity")
        form.innerHTML = '<p>Crear entidad</p>';
    else
        form.innerHTML = '<p>Crear producto</p>';
    form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
    form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name"/>';
    form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
    form.innerHTML += '<input id = "Birth" class = "input" type = "date" name = "Birth"/>';
    form.innerHTML += '<label for = "Death" class = "label">Fecha de defunción</label>';
    form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death"/>';
    form.innerHTML += '<label for = "Image" class = "label">Imagen</label>';
    form.innerHTML += '<input id = "Image" class = "input" type = "text" name = "Image"/>';
    form.innerHTML += '<label for = "Wiki" class = "label">Wiki</label>';
    form.innerHTML += '<input id = "Wiki" class = "input" type = "text" name = "Wiki"/>';
    form.innerHTML += '<br>';
    if(type === "product")
        form.innerHTML += '<p>Entidades relacionadas</p>';
    else
        form.innerHTML += '<p>Productos relacionados</p>';
    for(let i = 0; i < related1.length; i++)
        form.innerHTML += `<article><input id="r1_${related1[i].id}" type="checkbox"/>${related1[i].name}</article>`;
    if(type === "person")
        form.innerHTML += '<p>Entidades relacionadas</p>';
    else
        form.innerHTML += '<p>Personas relacionadas</p>';
    for(let i = 0; i < related2.length; i++)
        form.innerHTML += `<article><input id="r2_${related2[i].id}" type="checkbox"/>${related2[i].name}</article>`;
    form.innerHTML += '<br>';
    form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
    if(type === "product")
        form.innerHTML += `<input type = "button" name = "Submit" value = "Guardar" onclick = "newProduct();"/>`;
    else if(type === "person")
        form.innerHTML += `<input type = "button" name = "Submit" value = "Guardar" onclick = "newPerson();"/>`;
    else
        form.innerHTML += `<input type = "button" name = "Submit" value = "Guardar" onclick = "newEntity();"/>`;
    main.appendChild(index);
    main.appendChild(username);
    main.appendChild(form);
}

function newProduct() {
    let entities;
    let people;
    getElementsFromDB("/entities", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayEntities = jsonResponse.entities;
        entities = arrayEntities.map(function(item) {
            let e = item.entity;
            return e.id;
        });
        getElementsFromDB("/persons", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayPeople = jsonResponse.persons;
            people = arrayPeople.map(function(item) {
                let p = item.person;
                return p.id;
            });

            let nameForm = document.getElementById("Name").value;
            let birthForm = document.getElementById("Birth").value;
            let deathForm = document.getElementById("Death").value;
            let imageForm = document.getElementById("Image").value;
            let wikiForm = document.getElementById("Wiki").value;
            if(nameForm === "") {
                alert("Error: el campo Nombre es obligatorio");
                createProduct();
            }
            else {
                let checked1 = [];
                for(let i = 0; i < entities.length; i++) {
                    let iEntity = document.getElementById("r1_" + entities[i]);
                    if(iEntity.checked)
                        checked1.push(entities[i]);
                }
                let checked2 = [];
                for(let i = 0; i < people.length; i++) {
                    let iPerson = document.getElementById("r2_" + people[i]);
                    if(iPerson.checked)
                        checked2.push(people[i]);
                }
                let basicProduct = {
                    "name": nameForm,
                    "birthDate": birthForm,
                    "deathDate": deathForm,
                    "imageUrl": imageForm,
                    "wikiUrl": wikiForm
                }
                postToDatabase("/products", basicProduct, function (response) {
                    let product = JSON.parse(response).product;
                    let productId = product.id;
                    for(let i = 0; i < checked1.length; i++) {
                        let request = {
                            "productId": productId,
                            "entityId": checked1[i]
                        }
                        putToDatabase(`/products/${productId}/entities/add/${checked1[i]}`, request);
                    }
                    for(let i = 0; i < checked2.length; i++) {
                        let request = {
                            "productId": productId,
                            "personId": checked2[i]
                        }
                        putToDatabase(`/products/${productId}/persons/add/${checked2[i]}`, request);
                    }
                    loadIndex();
                });
            }
        });
    });
}

function newPerson() {
    let products;
    let entities;
    getElementsFromDB("/products", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        products = arrayProducts.map(function(item) {
            let p = item.product;
            return p.id;
        });
        getElementsFromDB("/entities", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayEntities = jsonResponse.entities;
            entities = arrayEntities.map(function(item) {
                let e = item.entity;
                return e.id;
            });

            let nameForm = document.getElementById("Name").value;
            let birthForm = document.getElementById("Birth").value;
            let deathForm = document.getElementById("Death").value;
            let imageForm = document.getElementById("Image").value;
            let wikiForm = document.getElementById("Wiki").value;
            if(nameForm === "") {
                alert("Error: el campo Nombre es obligatorio");
                createPerson();
            }
            else {
                let checked1 = [];
                for(let i = 0; i < products.length; i++) {
                    let iProduct = document.getElementById("r1_" + products[i]);
                    if(iProduct.checked)
                        checked1.push(products[i]);
                }
                let checked2 = [];
                for(let i = 0; i < entities.length; i++) {
                    let iEntity = document.getElementById("r2_" + entities[i]);
                    if(iEntity.checked)
                        checked2.push(entities[i]);
                }
                let basicPerson = {
                    "name": nameForm,
                    "birthDate": birthForm,
                    "deathDate": deathForm,
                    "imageUrl": imageForm,
                    "wikiUrl": wikiForm
                }
                postToDatabase("/persons", basicPerson, function (response) {
                    let person = JSON.parse(response).person;
                    let personId = person.id;
                    for(let i = 0; i < checked1.length; i++) {
                        let request = {
                            "personId": personId,
                            "productId": checked1[i]
                        }
                        putToDatabase(`/persons/${personId}/products/add/${checked1[i]}`, request);
                    }
                    for(let i = 0; i < checked2.length; i++) {
                        let request = {
                            "personId": personId,
                            "entityId": checked2[i]
                        }
                        putToDatabase(`/persons/${personId}/entities/add/${checked2[i]}`, request);
                    }
                    loadIndex();
                });
            }
        });
    });
}

function newEntity() {
    let products;
    let people;
    getElementsFromDB("/products", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        products = arrayProducts.map(function(item) {
            let p = item.product;
            return p.id;
        });
        getElementsFromDB("/persons", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayPeople = jsonResponse.persons;
            people = arrayPeople.map(function(item) {
                let p = item.person;
                return p.id;
            });

            let nameForm = document.getElementById("Name").value;
            let birthForm = document.getElementById("Birth").value;
            let deathForm = document.getElementById("Death").value;
            let imageForm = document.getElementById("Image").value;
            let wikiForm = document.getElementById("Wiki").value;
            if(nameForm === "") {
                alert("Error: el campo Nombre es obligatorio");
                createPerson();
            }
            else {
                let checked1 = [];
                for(let i = 0; i < products.length; i++) {
                    let iProduct = document.getElementById("r1_" + products[i].id);
                    if(iProduct.checked)
                        checked1.push(products[i].id);
                }
                let checked2 = [];
                for(let i = 0; i < people.length; i++) {
                    let iPerson = document.getElementById("r2_" + people[i].id);
                    if(iPerson.checked)
                        checked2.push(people[i].id);
                }
                let basicEntity = {
                    "name": nameForm,
                    "birthDate": birthForm,
                    "deathDate": deathForm,
                    "imageUrl": imageForm,
                    "wikiUrl": wikiForm
                }
                postToDatabase("/entities", basicEntity, function (response) {
                    let entity = JSON.parse(response).entity;
                    let entityId = entity.id;
                    for(let i = 0; i < checked1.length; i++) {
                        let request = {
                            "entityId": entityId,
                            "productId": checked1[i]
                        }
                        putToDatabase(`/entities/${entityId}/products/add/${checked1[i]}`, request);
                    }
                    for(let i = 0; i < checked2.length; i++) {
                        let request = {
                            "entityId": entityId,
                            "personId": checked2[i]
                        }
                        putToDatabase(`/entities/${entityId}/persons/add/${checked2[i]}`, request);
                    }
                    loadIndex();
                });
            }
        });
    });
}

// ------------ VER ELEMENTO ----------------

function showProduct(event) {
    clean();
    let id = event.target.id;
    getFromDB(`/products/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let product = jsonResponse.product;
        let myProduct = new Product(product.id, product.name, product.birthDate, product.deathDate, product.imageUrl,
            product.wikiUrl, product.entities, product.persons);
        generateElementInfo(myProduct, "product");
    });
}
function showPerson(event) {
    clean();
    let id = event.target.id;
    getFromDB(`/persons/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let person = jsonResponse.person;
        let myPerson = new Person(person.id, person.name, person.birthDate, person.deathDate, person.imageUrl,
            person.wikiUrl, person.products, person.entities);
        generateElementInfo(myPerson, "person");
    });
}
function showEntity(event) {
    clean();
    let id = event.target.id;
    getFromDB(`/entities/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let entity = jsonResponse.entity;
        let myEntity = new Entity(entity.id, entity.name, entity.birthDate, entity.deathDate, entity.imageUrl,
            entity.wikiUrl, entity.products, entity.persons);
        generateElementInfo(myEntity, "entity");
    });
}

function generateElementInfo(myElement, type) {
    let main = document.getElementById("main");
    let index = putIndex();
    main.appendChild(index);
    let username = putUsername();
    main.appendChild(username);
    if(myElement.wiki !== null) {
        let wiki = document.createElement("section");
        wiki.innerHTML = '<iframe src="' + myElement.wiki + '"></iframe>';
        main.appendChild(wiki);
    }
    let info = document.createElement("section");
    info.innerHTML = '<h3><b>' + myElement.name + '</b></h3>';
    if(myElement.birth !== null)
        info.innerHTML += '<h4><b>' + myElement.birth + '</b></h4>';
    if(myElement.death !== null)
        info.innerHTML += '<h4><b>' + myElement.death + '</b></h4>';
    if(myElement.image !== null)
        info.innerHTML += '<img class="bigImage" src="' + myElement.image + '" alt="' + myElement.name + '" width="10%"/>';
    main.appendChild(info);
    let related = document.createElement("section");
    let related1 = document.createElement("div");
    related1.setAttribute("class", "foot1");
    let related2 = document.createElement("div");
    related2.setAttribute("class", "foot2");
    related.appendChild(related1);
    related.appendChild(related2);
    main.appendChild(related);
    if(type === "product") {
        productRelatedEntities(myElement.id, myElement.relatedEntities, related1);
        productRelatedPeople(myElement.id, myElement.relatedPeople, related2);
    }
    else if(type === "person") {
        personRelatedProducts(myElement.id, myElement.relatedProducts, related1);
        personRelatedEntities(myElement.id, myElement.relatedEntities, related2);
    }
    else {
        entityRelatedProducts(myElement.id, myElement.relatedProducts, related1);
        entityRelatedPeople(myElement.id, myElement.relatedPeople, related2);
    }
}

function productRelatedEntities(id, array, section) {
    let p = document.createElement("p");
    let title = document.createTextNode("Entidades relacionadas");
    p.appendChild(title);
    section.appendChild(p);
    if(array !== null)
        getFromDB(`/products/${id}/entities`, function (response) {
            let jsonResponse = JSON.parse(response);
            let elements;
            let arrayEntities = jsonResponse.entities;
            elements = arrayEntities.map(function (item) {
                let e = item.entity;
                return new Entity(e.id, e.name, null, null, e.imageUrl, null, null, null);
            })
            for(let i = 0; i < elements.length; i++) {
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", elements[i].image);
                img.setAttribute("alt", elements[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(elements[i].name);
                a.appendChild(name);
                a.setAttribute("id", elements[i].id);
                a.addEventListener('click', showEntity);
                article.appendChild(a);
                section.appendChild(article);
            }
        });
}

function productRelatedPeople(id, array, section) {
    let p = document.createElement("p");
    let title = document.createTextNode("Personas relacionadas");
    p.appendChild(title);
    section.appendChild(p);
    if(array !== null)
        getFromDB(`/products/${id}/persons`, function (response) {
            let jsonResponse = JSON.parse(response);
            let elements;
            let arrayPeople = jsonResponse.persons;
            elements = arrayPeople.map(function (item) {
                let p = item.person;
                return new Person(p.id, p.name, null, null, p.imageUrl, null, null, null);
            })
            for(let i = 0; i < elements.length; i++) {
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", elements[i].image);
                img.setAttribute("alt", elements[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(elements[i].name);
                a.appendChild(name);
                a.setAttribute("id", elements[i].id);
                a.addEventListener('click', showPerson);
                article.appendChild(a);
                section.appendChild(article);
            }
        });
}

function personRelatedProducts(id, array, section) {
    let p = document.createElement("p");
    let title = document.createTextNode("Productos relacionados");
    p.appendChild(title);
    section.appendChild(p);
    if(array !== null)
        getFromDB(`/persons/${id}/products`, function (response) {
            let jsonResponse = JSON.parse(response);
            let elements;
            let arrayProducts = jsonResponse.products;
            elements = arrayProducts.map(function (item) {
                let p = item.product;
                return new Product(p.id, p.name, null, null, p.imageUrl, null, null, null);
            })
            for(let i = 0; i < elements.length; i++) {
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", elements[i].image);
                img.setAttribute("alt", elements[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(elements[i].name);
                a.appendChild(name);
                a.setAttribute("id", elements[i].id);
                a.addEventListener('click', showProduct);
                article.appendChild(a);
                section.appendChild(article);
            }
        });
}

function personRelatedEntities(id, array, section) {
    let p = document.createElement("p");
    let title = document.createTextNode("Entidades relacionadas");
    p.appendChild(title);
    section.appendChild(p);
    if(array !== null)
        getFromDB(`/persons/${id}/entities`, function (response) {
            let jsonResponse = JSON.parse(response);
            let elements;
            let arrayEntities = jsonResponse.entities;
            elements = arrayEntities.map(function (item) {
                let e = item.entity;
                return new Entity(e.id, e.name, null, null, e.imageUrl, null, null, null);
            })
            for(let i = 0; i < elements.length; i++) {
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", elements[i].image);
                img.setAttribute("alt", elements[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(elements[i].name);
                a.appendChild(name);
                a.setAttribute("id", elements[i].id);
                a.addEventListener('click', showEntity);
                article.appendChild(a);
                section.appendChild(article);
            }
        });
}

function entityRelatedProducts(id, array, section) {
    let p = document.createElement("p");
    let title = document.createTextNode("Productos relacionados");
    p.appendChild(title);
    section.appendChild(p);
    if(array !== null)
        getFromDB(`/entities/${id}/products`, function (response) {
            let jsonResponse = JSON.parse(response);
            let elements;
            let arrayProducts = jsonResponse.products;
            elements = arrayProducts.map(function (item) {
                let p = item.product;
                return new Product(p.id, p.name, null, null, p.imageUrl, null, null, null);
            })
            for(let i = 0; i < elements.length; i++) {
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", elements[i].image);
                img.setAttribute("alt", elements[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(elements[i].name);
                a.appendChild(name);
                a.setAttribute("id", elements[i].id);
                a.addEventListener('click', showProduct);
                article.appendChild(a);
                section.appendChild(article);
            }
        });
}

function entityRelatedPeople(id, array, section) {
    let p = document.createElement("p");
    let title = document.createTextNode("Personas relacionadas");
    p.appendChild(title);
    section.appendChild(p);
    if(array !== null)
        getFromDB(`/entities/${id}/persons`, function (response) {
            let jsonResponse = JSON.parse(response);
            let elements;
            let arrayPeople = jsonResponse.persons;
            elements = arrayPeople.map(function (item) {
                let p = item.person;
                return new Person(p.id, p.name, null, null, p.imageUrl, null, null, null);
            })
            for(let i = 0; i < elements.length; i++) {
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", elements[i].image);
                img.setAttribute("alt", elements[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(elements[i].name);
                a.appendChild(name);
                a.setAttribute("id", elements[i].id);
                a.addEventListener('click', showPerson);
                article.appendChild(a);
                section.appendChild(article);
            }
        });
}

// ------------ EDITAR ELEMENTO ----------------

function editProduct(event) {
    let id = event.target.id;
    getFromDB(`/products/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let product = jsonResponse.product;
        let myProduct = new Product(product.id, product.name, product.birthDate, product.deathDate, product.imageUrl,
            product.wikiUrl, product.entities, product.persons);
        generateEditProductForm(myProduct);
    });
}
function editPerson(event) {
    let id = event.target.id;
    getFromDB(`/persons/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let person = jsonResponse.person;
        let myPerson = new Person(person.id, person.name, person.birthDate, person.deathDate, person.imageUrl,
            person.wikiUrl, person.products, person.entities);
        generateEditPersonForm(myPerson);
    });
}
function editEntity(event) {
    let id = event.target.id;
    getFromDB(`/entities/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let entity = jsonResponse.entity;
        let myEntity = new Entity(entity.id, entity.name, entity.birthDate, entity.deathDate, entity.imageUrl,
            entity.wikiUrl, entity.products, entity.persons);
        generateEditEntityForm(myEntity);
    });
}

function generateEditProductForm(myProduct) {
    let entities;
    let people;
    getElementsFromDB("/entities", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayEntities = jsonResponse.entities;
        entities = arrayEntities.map(function(item) {
            let e = item.entity;
            return new Entity(e.id, e.name, null, null, null, null, null, null);
        });
        getElementsFromDB("/persons", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayPeople = jsonResponse.persons;
            people = arrayPeople.map(function(item) {
                let p = item.person;
                return new Person(p.id, p.name, null, null, null, null, null, null);
            });

            // cargar formulario
            clean();
            let main = document.getElementById("main");
            let index = putIndex();
            main.appendChild(index);
            let username = putUsername();
            main.appendChild(username);
            let form = document.createElement("form");
            form.innerHTML = '<h2>Editar producto</h2>';
            form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
            form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + myProduct.name + '"/>';
            form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
            form.innerHTML += '<input id = "Birth" class = "input" type = "date" name = "Birth" value = "' + myProduct.birth + '"/>';
            form.innerHTML += '<label for = "Death" class = "label">Fecha de defunción</label>';
            form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death" value = "' + myProduct.death + '"/>';
            form.innerHTML += '<label for = "Image" class = "label">Imagen</label>';
            form.innerHTML += '<input id = "Image" class = "input" type = "text" name = "Image" value = "' + myProduct.image + '"/>';
            form.innerHTML += '<label for = "Wiki" class = "label">Wiki</label>';
            form.innerHTML += '<input id = "Wiki" class = "input" type = "text" name = "Wiki" value = "' + myProduct.wiki + '"/>';
            main.appendChild(form);

            // cargar relacionados
            let div1 = document.createElement("div");
            form.appendChild(div1);
            div1.innerHTML += '<p>Entidades relacionadas</p>';
            let notFound;
            for(let i = 0; i < entities.length; i++) {
                notFound = true;
                for(let j = 0; j < myProduct.relatedEntities.length && notFound; j++)
                    if(entities[i].id === myProduct.relatedEntities[j]) {
                        div1.innerHTML += `<input id="r1_${entities[i].id}" type="checkbox" checked="checked"/>${entities[i].name}`;
                        notFound = false;
                    }
                if(notFound)
                    div1.innerHTML += `<input id="r1_${entities[i].id}" type="checkbox"/>${entities[i].name}`;
            }
            let div2 = document.createElement("div");
            form.appendChild(div2);
            div2.innerHTML += '<p>Personas relacionadas</p>';
            for(let i = 0; i < people.length; i++) {
                notFound = true;
                for(let j = 0; j < myProduct.relatedPeople.length && notFound; j++)
                    if(people[i].id === myProduct.relatedPeople[j]) {
                        div2.innerHTML += `<input id="r2_${people[i].id}" type="checkbox" checked="checked"/>${people[i].name}`;
                        notFound = false;
                    }
                if(notFound)
                    div2.innerHTML += `<input id="r2_${people[i].id}" type="checkbox"/>${people[i].name}`;
            }

            form.innerHTML += '<br>';
            form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
            form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "updateProduct(' + myProduct.id + ');"/>';
        });
    });
}

function generateEditPersonForm(myPerson) {
    let products;
    let entities;
    getElementsFromDB("/products", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        products = arrayProducts.map(function(item) {
            let p = item.product;
            return new Product(p.id, p.name, null, null, null, null, null, null);
        });
        getElementsFromDB("/entities", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayEntities = jsonResponse.entities;
            entities = arrayEntities.map(function(item) {
                let e = item.entity;
                return new Entity(e.id, e.name, null, null, null, null, null, null);
            });

            // cargar formulario
            clean();
            let main = document.getElementById("main");
            let index = putIndex();
            main.appendChild(index);
            let username = putUsername();
            main.appendChild(username);
            let form = document.createElement("form");
            form.innerHTML = '<h2>Editar persona</h2>';
            form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
            form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + myPerson.name + '"/>';
            form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
            form.innerHTML += '<input id = "Birth" class = "input" type = "date" name = "Birth" value = "' + myPerson.birth + '"/>';
            form.innerHTML += '<label for = "Death" class = "label">Fecha de defunción</label>';
            form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death" value = "' + myPerson.death + '"/>';
            form.innerHTML += '<label for = "Image" class = "label">Imagen</label>';
            form.innerHTML += '<input id = "Image" class = "input" type = "text" name = "Image" value = "' + myPerson.image + '"/>';
            form.innerHTML += '<label for = "Wiki" class = "label">Wiki</label>';
            form.innerHTML += '<input id = "Wiki" class = "input" type = "text" name = "Wiki" value = "' + myPerson.wiki + '"/>';
            main.appendChild(form);

            // cargar relacionados
            let div1 = document.createElement("div");
            form.appendChild(div1);
            div1.innerHTML += '<p>Productos relacionados</p>';
            let notFound;
            for(let i = 0; i < products.length; i++) {
                notFound = true;
                for(let j = 0; j < myPerson.relatedProducts.length && notFound; j++)
                    if(products[i].id === myPerson.relatedProducts[j]) {
                        div1.innerHTML += `<input id="r1_${products[i].id}" type="checkbox" checked="checked"/>${products[i].name}`;
                        notFound = false;
                    }
                if(notFound)
                    div1.innerHTML += `<input id="r1_${products[i].id}" type="checkbox"/>${products[i].name}`;
            }
            let div2 = document.createElement("div");
            form.appendChild(div2);
            div2.innerHTML += '<p>Entidades relacionadas</p>';
            for(let i = 0; i < entities.length; i++) {
                notFound = true;
                for(let j = 0; j < myPerson.relatedEntities.length && notFound; j++)
                    if(entities[i].id === myPerson.relatedEntities[j]) {
                        div2.innerHTML += `<input id="r2_${entities[i].id}" type="checkbox" checked="checked"/>${entities[i].name}`;
                        notFound = false;
                    }
                if(notFound)
                    div2.innerHTML += `<input id="r2_${entities[i].id}" type="checkbox"/>${entities[i].name}`;
            }

            form.innerHTML += '<br>';
            form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
            form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "updatePerson(' + myPerson.id + ');"/>';
        });
    });
}

function generateEditEntityForm(myEntity) {
    let products;
    let people;
    getElementsFromDB("/products", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayProducts = jsonResponse.products;
        products = arrayProducts.map(function(item) {
            let p = item.product;
            return new Product(p.id, p.name, null, null, null, null, null, null);
        });
        getElementsFromDB("/persons", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayPeople = jsonResponse.persons;
            people = arrayPeople.map(function(item) {
                let p = item.person;
                return new Person(p.id, p.name, null, null, null, null, null, null);
            });

            // cargar formulario
            clean();
            let main = document.getElementById("main");
            let index = putIndex();
            main.appendChild(index);
            let username = putUsername();
            main.appendChild(username);
            let form = document.createElement("form");
            form.innerHTML = '<h2>Editar entidad</h2>';
            form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
            form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + myEntity.name + '"/>';
            form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
            form.innerHTML += '<input id = "Birth" class = "input" type = "date" name = "Birth" value = "' + myEntity.birth + '"/>';
            form.innerHTML += '<label for = "Death" class = "label">Fecha de defunción</label>';
            form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death" value = "' + myEntity.death + '"/>';
            form.innerHTML += '<label for = "Image" class = "label">Imagen</label>';
            form.innerHTML += '<input id = "Image" class = "input" type = "text" name = "Image" value = "' + myEntity.image + '"/>';
            form.innerHTML += '<label for = "Wiki" class = "label">Wiki</label>';
            form.innerHTML += '<input id = "Wiki" class = "input" type = "text" name = "Wiki" value = "' + myEntity.wiki + '"/>';
            main.appendChild(form);

            // cargar relacionados
            let div1 = document.createElement("div");
            form.appendChild(div1);
            div1.innerHTML += '<p>Productos relacionados</p>';
            let notFound;
            for(let i = 0; i < products.length; i++) {
                notFound = true;
                for(let j = 0; j < myEntity.relatedProducts.length && notFound; j++)
                    if(products[i].id === myEntity.relatedProducts[j]) {
                        div1.innerHTML += `<input id="r1_${products[i].id}" type="checkbox" checked="checked"/>${products[i].name}`;
                        notFound = false;
                    }
                if(notFound)
                    div1.innerHTML += `<input id="r1_${products[i].id}" type="checkbox"/>${products[i].name}`;
            }
            let div2 = document.createElement("div");
            form.appendChild(div2);
            div2.innerHTML += '<p>Personas relacionadas</p>';
            for(let i = 0; i < people.length; i++) {
                notFound = true;
                for(let j = 0; j < myEntity.relatedPeople.length && notFound; j++)
                    if(people[i].id === myEntity.relatedPeople[j]) {
                        div2.innerHTML += `<input id="r2_${people[i].id}" type="checkbox" checked="checked"/>${people[i].name}`;
                        notFound = false;
                    }
                if(notFound)
                    div2.innerHTML += `<input id="r2_${people[i].id}" type="checkbox"/>${people[i].name}`;
            }

            form.innerHTML += '<br>';
            form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
            form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "updateEntity(' + myEntity.id + ');"/>';
        });
    });
}

function backToIndex() {
    loadIndex();
}

function updateProduct(productId) {
    let nameForm = document.getElementById("Name").value;
    let birthForm = document.getElementById("Birth").value;
    let deathForm = document.getElementById("Death").value;
    let imageForm = document.getElementById("Image").value;
    let wikiForm = document.getElementById("Wiki").value;
    if(nameForm === "") {
        alert("Error: el campo Nombre es obligatorio");
        loadIndex();
    }
    else {
        let entities;
        let people;
        getElementsFromDB("/entities", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayEntities = jsonResponse.entities;
            entities = arrayEntities.map(function (item) {
                let e = item.entity;
                return e.id;
            });
            getElementsFromDB("/persons", function (response) {
                let jsonResponse = JSON.parse(response);
                let arrayPeople = jsonResponse.persons;
                people = arrayPeople.map(function (item) {
                    let p = item.person;
                    return p.id;
                });
                getElementsFromDB(`/products/${productId}`, function (response) {
                    let jsonResponse = JSON.parse(response);
                    let product = jsonResponse.product;
                    let checked1Before = product.entities;
                    let checked2Before = product.persons;

                    let checked1After = [];
                    for (let i = 0; i < entities.length; i++) {
                        let iEntity = document.getElementById("r1_" + entities[i]);
                        if (iEntity.checked)
                            checked1After.push(entities[i]);
                    }
                    let checked2After = [];
                    for (let i = 0; i < people.length; i++) {
                        let iPerson = document.getElementById("r2_" + people[i]);
                        if (iPerson.checked)
                            checked2After.push(people[i]);
                    }
                    let basicProduct = {
                        "name": nameForm,
                        "birthDate": birthForm,
                        "deathDate": deathForm,
                        "imageUrl": imageForm,
                        "wikiUrl": wikiForm
                    }
                    putToDatabase(`/products/${productId}`, basicProduct);
                    let notFound;
                    let foundBefore;
                    let foundAfter;
                    for (let i = 0; i < entities.length; i++) {
                        notFound = true;
                        foundBefore = false;
                        for (let j = 0; j < checked1Before.length && notFound; j++)
                            if (entities[i] === checked1Before[j]) {
                                foundBefore = true;
                                notFound = false;
                            }
                        notFound = true;
                        foundAfter = false;
                        for (let j = 0; j < checked1After.length && notFound; j++)
                            if (entities[i] === checked1After[j]) {
                                foundAfter = true;
                                notFound = false;
                            }
                        if (foundBefore === true && foundAfter === false) {
                            let request = {
                                "productId": productId,
                                "entityId": entities[i]
                            }
                            putToDatabase(`/products/${productId}/entities/rem/${entities[i]}`, request);
                        } else if (foundBefore === false && foundAfter === true) {
                            let request = {
                                "productId": productId,
                                "entityId": entities[i]
                            }
                            putToDatabase(`/products/${productId}/entities/add/${entities[i]}`, request);
                        }
                    }

                    for (let i = 0; i < people.length; i++) {
                        notFound = true;
                        foundBefore = false;
                        for (let j = 0; j < checked2Before.length && notFound; j++)
                            if (people[i] === checked2Before[j]) {
                                foundBefore = true;
                                notFound = false;
                            }
                        notFound = true;
                        foundAfter = false;
                        for (let j = 0; j < checked2After.length && notFound; j++)
                            if (people[i] === checked2After[j]) {
                                foundAfter = true;
                                notFound = false;
                            }
                        if (foundBefore === true && foundAfter === false) {
                            let request = {
                                "productId": productId,
                                "personId": people[i]
                            }
                            putToDatabase(`/products/${productId}/persons/rem/${people[i]}`, request);
                        } else if (foundBefore === false && foundAfter === true) {
                            let request = {
                                "productId": productId,
                                "personId": people[i]
                            }
                            putToDatabase(`/products/${productId}/persons/add/${people[i]}`, request);
                        }
                    }
                    backToIndex();
                });
            });
        });
    }
}

function updatePerson(personId) {
    let nameForm = document.getElementById("Name").value;
    let birthForm = document.getElementById("Birth").value;
    let deathForm = document.getElementById("Death").value;
    let imageForm = document.getElementById("Image").value;
    let wikiForm = document.getElementById("Wiki").value;
    if(nameForm === "") {
        alert("Error: el campo Nombre es obligatorio");
        loadIndex();
    }
    else {
        let products;
        let entities;
        getElementsFromDB("/products", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayProducts = jsonResponse.products;
            products = arrayProducts.map(function (item) {
                let p = item.product;
                return p.id;
            });
            getElementsFromDB("/entities", function (response) {
                let jsonResponse = JSON.parse(response);
                let arrayEntities = jsonResponse.entities;
                entities = arrayEntities.map(function (item) {
                    let e = item.entity;
                    return e.id;
                });
                getElementsFromDB(`/persons/${personId}`, function (response) {
                    let jsonResponse = JSON.parse(response);
                    let person = jsonResponse.person;
                    let checked1Before = person.products;
                    let checked2Before = person.entities;

                    let checked1After = [];
                    for (let i = 0; i < products.length; i++) {
                        let iProduct = document.getElementById("r1_" + products[i]);
                        if (iProduct.checked)
                            checked1After.push(products[i]);
                    }
                    let checked2After = [];
                    for (let i = 0; i < entities.length; i++) {
                        let iEntity = document.getElementById("r2_" + entities[i]);
                        if (iEntity.checked)
                            checked2After.push(entities[i]);
                    }
                    let basicPerson = {
                        "name": nameForm,
                        "birthDate": birthForm,
                        "deathDate": deathForm,
                        "imageUrl": imageForm,
                        "wikiUrl": wikiForm
                    }
                    putToDatabase(`/persons/${personId}`, basicPerson);
                    let notFound;
                    let foundBefore;
                    let foundAfter;
                    for (let i = 0; i < products.length; i++) {
                        notFound = true;
                        foundBefore = false;
                        for (let j = 0; j < checked1Before.length && notFound; j++)
                            if (products[i] === checked1Before[j]) {
                                foundBefore = true;
                                notFound = false;
                            }
                        notFound = true;
                        foundAfter = false;
                        for (let j = 0; j < checked1After.length && notFound; j++)
                            if (products[i] === checked1After[j]) {
                                foundAfter = true;
                                notFound = false;
                            }
                        if (foundBefore === true && foundAfter === false) {
                            let request = {
                                "personId": personId,
                                "productId": products[i]
                            }
                            putToDatabase(`/persons/${personId}/products/rem/${products[i]}`, request);
                        } else if (foundBefore === false && foundAfter === true) {
                            let request = {
                                "personId": personId,
                                "productId": products[i]
                            }
                            putToDatabase(`/persons/${personId}/products/add/${products[i]}`, request);
                        }
                    }

                    for (let i = 0; i < entities.length; i++) {
                        notFound = true;
                        foundBefore = false;
                        for (let j = 0; j < checked2Before.length && notFound; j++)
                            if (entities[i] === checked2Before[j]) {
                                foundBefore = true;
                                notFound = false;
                            }
                        notFound = true;
                        foundAfter = false;
                        for (let j = 0; j < checked2After.length && notFound; j++)
                            if (entities[i] === checked2After[j]) {
                                foundAfter = true;
                                notFound = false;
                            }
                        if (foundBefore === true && foundAfter === false) {
                            let request = {
                                "personId": personId,
                                "entityId": entities[i]
                            }
                            putToDatabase(`/persons/${personId}/entities/rem/${entities[i]}`, request);
                        } else if (foundBefore === false && foundAfter === true) {
                            let request = {
                                "personId": personId,
                                "entityid": entities[i]
                            }
                            putToDatabase(`/persons/${personId}/entities/add/${entities[i]}`, request);
                        }
                    }
                    backToIndex();
                });
            });
        });
    }
}

function updateEntity(entityId) {
    let nameForm = document.getElementById("Name").value;
    let birthForm = document.getElementById("Birth").value;
    let deathForm = document.getElementById("Death").value;
    let imageForm = document.getElementById("Image").value;
    let wikiForm = document.getElementById("Wiki").value;
    if(nameForm === "") {
        alert("Error: el campo Nombre es obligatorio");
        loadIndex();
    }
    else {
        let products;
        let people;
        getElementsFromDB("/products", function (response) {
            let jsonResponse = JSON.parse(response);
            let arrayProducts = jsonResponse.products;
            products = arrayProducts.map(function (item) {
                let p = item.product;
                return p.id;
            });
            getElementsFromDB("/persons", function (response) {
                let jsonResponse = JSON.parse(response);
                let arrayPeople = jsonResponse.persons;
                people = arrayPeople.map(function (item) {
                    let p = item.person;
                    return p.id;
                });
                getElementsFromDB(`/entities/${entityId}`, function (response) {
                    let jsonResponse = JSON.parse(response);
                    let entity = jsonResponse.entity;
                    let checked1Before = entity.products;
                    let checked2Before = entity.persons;

                    let checked1After = [];
                    for (let i = 0; i < products.length; i++) {
                        let iProduct = document.getElementById("r1_" + products[i]);
                        if (iProduct.checked)
                            checked1After.push(products[i]);
                    }
                    let checked2After = [];
                    for (let i = 0; i < people.length; i++) {
                        let iPerson = document.getElementById("r2_" + people[i]);
                        if (iPerson.checked)
                            checked2After.push(people[i]);
                    }
                    let basicEntity = {
                        "name": nameForm,
                        "birthDate": birthForm,
                        "deathDate": deathForm,
                        "imageUrl": imageForm,
                        "wikiUrl": wikiForm
                    }
                    putToDatabase(`/entities/${entityId}`, basicEntity);
                    let notFound;
                    let foundBefore;
                    let foundAfter;
                    for (let i = 0; i < products.length; i++) {
                        notFound = true;
                        foundBefore = false;
                        for (let j = 0; j < checked1Before.length && notFound; j++)
                            if (products[i] === checked1Before[j]) {
                                foundBefore = true;
                                notFound = false;
                            }
                        notFound = true;
                        foundAfter = false;
                        for (let j = 0; j < checked1After.length && notFound; j++)
                            if (products[i] === checked1After[j]) {
                                foundAfter = true;
                                notFound = false;
                            }
                        if (foundBefore === true && foundAfter === false) {
                            let request = {
                                "entityId": entityId,
                                "productId": products[i]
                            }
                            putToDatabase(`/entities/${entityId}/products/rem/${products[i]}`, request);
                        } else if (foundBefore === false && foundAfter === true) {
                            let request = {
                                "entityId": entityId,
                                "productId": products[i]
                            }
                            putToDatabase(`/entities/${entityId}/products/add/${products[i]}`, request);
                        }
                    }

                    for (let i = 0; i < people.length; i++) {
                        notFound = true;
                        foundBefore = false;
                        for (let j = 0; j < checked2Before.length && notFound; j++)
                            if (people[i] === checked2Before[j]) {
                                foundBefore = true;
                                notFound = false;
                            }
                        notFound = true;
                        foundAfter = false;
                        for (let j = 0; j < checked2After.length && notFound; j++)
                            if (people[i] === checked2After[j]) {
                                foundAfter = true;
                                notFound = false;
                            }
                        if (foundBefore === true && foundAfter === false) {
                            let request = {
                                "entityId": entityId,
                                "personId": people[i]
                            }
                            putToDatabase(`/entities/${entityId}/persons/rem/${people[i]}`, request);
                        } else if (foundBefore === false && foundAfter === true) {
                            let request = {
                                "entityId": entityId,
                                "personId": people[i]
                            }
                            putToDatabase(`/entities/${entityId}/persons/add/${people[i]}`, request);
                        }
                    }
                    backToIndex();
                });
            });
        });
    }
}

// ------------ ELIMINAR ELEMENTO ----------------

function deleteProduct(event) {
    let id = event.target.id;
    deleteOnDatabase(`/products/${id}`);
    backToIndex();
}
function deletePerson(event) {
    let id = event.target.id;
    deleteOnDatabase(`/persons/${id}`);
    backToIndex();
}
function deleteEntity(event) {
    let id = event.target.id;
    deleteOnDatabase(`/entities/${id}`);
    backToIndex();
}

// ------------ PERFIL ----------------

function loadProfile() {
    clean();
    let main = document.getElementById("main");
    let index = putIndex();
    main.appendChild(index);
    let username = putUsername();
    main.appendChild(username);

    getElementsFromDB(`/users/${userId}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let user = jsonResponse.user;
        let myUser = new User(null, user.username, null, user.role, user.email, null); // cambiar birth por null cuando lo meta como atrib en la BD
        let form = document.createElement("form");
        form.innerHTML = '<p>Mi perfil</p>';
        form.innerHTML += '<br>';
        form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
        form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + user.username + '" readonly/>';
        form.innerHTML += '<label for = "Role" class = "label">Rol</label>';
        form.innerHTML += '<input id = "Role" class = "input" type = "text" name = "Role" value = "' + myUser.role + '" readonly/>';
        form.innerHTML += '<label for = "Email" class = "label">Email</label>';
        form.innerHTML += '<input id = "Email" class = "input" type = "text" name = "Email" value = "' + myUser.email + '"/>';
        // form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
        // form.innerHTML += '<input id = "Birth" class = "input" type = "text" name = "Birth" value = "' + user.birth + '"/>';
        form.innerHTML += '<br>';
        form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
        form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "editProfile();"/>';
        form.innerHTML += '<br><br><br>';
        form.innerHTML += '<label for = "newPassword" class = "label">Nueva contraseña</label>';
        form.innerHTML += '<input id = "newPassword" class = "input" type = "password" name = "newPassword"/>';
        form.innerHTML += '<label for = "newPassword2" class = "label">Repita la nueva contraseña</label>';
        form.innerHTML += '<input id = "newPassword2" class = "input" type = "password" name = "newPassword2"/>';
        form.innerHTML += '<input type = "button" name = "Change password" value = "Cambiar contraseña" onclick = "changePassword();"/>';
        main.appendChild(form);
    });
}

function editProfile() {
    let email = document.getElementById("Email").value;
    // let birth = document.getElementById("Birth").value;
    let editedUser = {
        "username": username,
        "email": email,
        "role": userRole
    }
    putToDatabase(`/users/${userId}`, editedUser);
    loadIndex();
}

function changePassword() {
    let newPassword = document.getElementById("newPassword").value;
    let newPassword2 = document.getElementById("newPassword2").value;
    if(newPassword === newPassword2) {
        let editedUser = {
            "username": username,
            "password": newPassword,
            "role": userRole
        }
        putToDatabase(`/users/${userId}`, editedUser);
        loadIndex();
    }
    else {
        alert("Error: Las contraseñas no coinciden");
        loadProfile();
    }
}

// ------------ GESTIÓN DE USUARIOS ----------------

function loadUserManagement() {
    getElementsFromDB("/users", function (response) {
        let jsonResponse = JSON.parse(response);
        let arrayUsers = jsonResponse.users;
        let users = arrayUsers.map(function(item) {
            let u = item.user;
            return new User(u.id, u.username, null, u.role, null, null);
        });
        clean();
        let main = document.getElementById("main");
        let index = putIndex();
        main.appendChild(index);
        let username = putUsername();
        main.appendChild(username);
        let table = document.createElement("table");
        let thead = document.createElement("thead");
        thead.innerHTML = '<p>Usuarios</p>';
        let tbody = document.createElement("tbody");
        tbody.innerHTML = "";
        for(let i = 0; i < users.length; i++) {
            let id = users[i].id;
            if(id !== userId) {
                tbody.innerHTML += `<p>${users[i].username}</p>`;
                tbody.innerHTML += '<input type = "button" value = "Ver" onclick = "showUser(' + id + ');"/>';
                if(users[i].role === "READER")
                    tbody.innerHTML += '<input type = "button" value = "Cambiar a rol writer" onclick = "editUser(' + id + ');"/>';
                else
                    tbody.innerHTML += '<input type = "button" value = "Cambiar a rol reader" onclick = "editUser(' + id + ');"/>';
                tbody.innerHTML += '<input type = "button" value = "Eliminar" onclick = "deleteUser(' + id + ');"/>';
            }
            else
                tbody.innerHTML += `<p>${users[i].username} (Tú)</p>`;
        }
        table.appendChild(thead);
        table.appendChild(tbody);
        main.appendChild(table);
    });
}

function showUser(id) {
    getElementsFromDB(`/users/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let user = jsonResponse.user;
        let myUser = new User(null, user.username, null, user.role, user.email, null); // cambiar user.birth por null cuando lo meta
        clean();
        let main = document.getElementById("main");
        let index = putIndex();
        main.appendChild(index);
        let username = putUsername();
        main.appendChild(username);
        let form = document.createElement("form");
        form.innerHTML = '<label for = "Name" class = "label">Nombre</label>';
        form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + myUser.username + '" readonly/>';
        form.innerHTML += '<label for = "Role" class = "label">Rol</label>';
        form.innerHTML += '<input id = "Role" class = "input" type = "text" name = "Role" value = "' + myUser.role + '" readonly/>';
        form.innerHTML += '<label for = "Email" class = "label">Email</label>';
        form.innerHTML += '<input id = "Email" class = "input" type = "text" name = "Email" value = "' + myUser.email + '" readonly/>';
        // form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
        // form.innerHTML += '<input id = "Birth" class = "input" type = "text" name = "Birth" value = "' + myUser.birth + '" readonly/>';
        form.innerHTML += '<br>';
        form.innerHTML += '<input type = "button" name = "Back" value = "Atrás" onclick = "loadUserManagement();"/>';
        main.appendChild(form);
    });
}

function editUser(id) {
    getElementsFromDB(`/users/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let user = jsonResponse.user;
        let username = user.username;
        let newRole;
        if(user.role === "READER")
            newRole = "writer";
        else
            newRole = "reader";
        let editedUser = {
            "username": username,
            "role": newRole
        }
        putToDatabase(`/users/${id}`, editedUser);
        loadIndex();
    });
}

function deleteUser(id) {
    deleteOnDatabase(`/users/${id}`);
    loadUserManagement();
}








/*   // eliminar cuando meta los datos en la BD
function loadLocalStorage() {
    let person = new Person("Tim Berners-Lee", "08/06/1955", "", "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg", "https://es.wikipedia.org/wiki/Tim_Berners-Lee");
    let entity = new Entity("CERN", "29/09/1954", "", "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/CERN_logo.svg/1200px-CERN_logo.svg.png", "https://es.wikipedia.org/wiki/Organizaci%C3%B3n_Europea_para_la_Investigaci%C3%B3n_Nuclear", [person]);
    let product = new Product("HTML", "01/01/1980", "", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/HTML5_logo_black.svg/2048px-HTML5_logo_black.svg.png", "https://es.wikipedia.org/wiki/HTML", [person], [entity]);
    let person2 = new Person("Håkon Wium Lie", "26/07/1965", "", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/H%C3%A5kon-Wium-Lie-2009-03.jpg/1200px-H%C3%A5kon-Wium-Lie-2009-03.jpg", "https://en.wikipedia.org/wiki/H%C3%A5kon_Wium_Lie");
    let entity2 = new Entity("IBM", "16/06/1911", "", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1200px-IBM_logo.svg.png", "https://es.wikipedia.org/wiki/IBM", []);
    let product2 = new Product("CSS", "17/12/1996", "", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/1200px-CSS3_logo_and_wordmark.svg.png", "https://es.wikipedia.org/wiki/CSS", [person2], []);
    let person3 = new Person("Brendan Eich", "01/01/1961", "", "https://upload.wikimedia.org/wikipedia/commons/d/d1/Brendan_Eich_Mozilla_Foundation_official_photo.jpg", "https://es.wikipedia.org/wiki/Brendan_Eich");
    let entity3 = new Entity("Netscape Communications", "04/04/1994", "", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Netscape_logo.svg/320px-Netscape_logo.svg.png", "https://es.wikipedia.org/wiki/Netscape_Communications_Corporation", [person3]);
    let product3 = new Product("Javascript", "04/12/1995", "", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/1200px-Unofficial_JavaScript_logo_2.svg.png", "https://es.wikipedia.org/wiki/JavaScript", [person3], [entity3]);
}
*/