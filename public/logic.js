const COMMON_PATH = "http://127.0.0.1:8000/api/v1";
let username = "";
let userId = 0;
let userRole = "";
let access_token = null;
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
    constructor(username, password, role, email, birth) {
        this.username = username;
        this.password = password;
        this.role = role;
        // this.active = active;
        this.email = email;
        this.birth = birth;
    }
}

function clean() {
    let main = document.getElementById("main");
    main.innerHTML = "";
}

function getElementsFromDB(relativePath, f) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.responseType = "json";
    xhr.onload = function () {
        if(xhr.status === 200)
            f(JSON.stringify(xhr.response));
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

function postToDatabase(relativePath, object) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.setRequestHeader("Content-type", "application/json");
    let jsonObject = JSON.stringify(object);
    xhr.onload = () => {
        if(xhr.status === 201)
            alert("Operación realizada con éxito");
        else
            alert("Error. Response status = " + xhr.status);
    }
    xhr.send(jsonObject);
}

function putToDatabase(relativePath, object) {
    let finalPath = COMMON_PATH + relativePath;
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', encodeURI(finalPath), true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.setRequestHeader("Content-type", "application/json");
    let jsonObject = JSON.stringify(object);
    xhr.onload = () => {
        if(xhr.status === 209)
            alert("Operación realizada con éxito");
        else
            alert("Error. Response status = " + xhr.status);
    }
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

function putUsername() {
    let section = document.createElement("section");
    section.setAttribute("class", "username");
    let p = document.createElement("p");
    let text = document.createTextNode("Usuario: " + username);
    p.appendChild(text);
    section.appendChild(p);
    return(section);
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
    let username = putUsername();
    let wiki = document.createElement("section");
    wiki.innerHTML = '<iframe src="' + myElement.wiki + '"></iframe>';
    let info = document.createElement("section");
    info.innerHTML = '<h3><b>' + myElement.name + '</b></h3>';
    info.innerHTML += '<h4><b>' + myElement.birth + '</b></h4>';
    info.innerHTML += '<h4><b>' + myElement.death + '</b></h4>';
    info.innerHTML += '<img class="bigImage" src="' + myElement.image + '" alt="' + myElement.name + '" width="10%"/>';
    let related = document.createElement("section");
    let related1 = document.createElement("div");
    related1.setAttribute("class", "foot1");
    let related2 = document.createElement("div");
    related2.setAttribute("class", "foot2");
    main.appendChild(index);
    main.appendChild(username);
    main.appendChild(wiki);
    main.appendChild(info);
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

function putIndex() {
    let section = document.createElement("section");
    section.innerHTML = '<p onclick="loadIndex()">INICIO</p>'
    return(section);
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



// ----------------------------------------------------------------------------------------


function userManagementForm() {
    let section = document.createElement("section");
    section.innerHTML = '<form>';
    section.innerHTML += '<input type="button" name="UserManagement" value="Gestión de Usuarios" onclick="loadUserManagement();"/>';
    section.innerHTML += '</form>';
    return(section);
}

function loadProfile() {
    clean();
    let main = document.getElementById("main");
    let username = putUsername();
    main.appendChild(username);

    // peticion GET /users
    let user = getFromDatabase("/users/" + userId);

    alert(user);

    let form = document.createElement("form");
    form.innerHTML = '<p>Mi perfil</p>';
    form.innerHTML += '<br>';
    form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
    form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + user.username + '" readonly/>';
    form.innerHTML += '<label for = "Password" class = "label">Contraseña</label>';
    form.innerHTML += '<input id = "Password" class = "input" type = "text" name = "Password" value = "' + user.password + '"/>';
    form.innerHTML += '<label for = "Role" class = "label">Rol</label>';
    form.innerHTML += '<input id = "Rol" class = "input" type = "text" name = "Role" value = "' + user.role + '"/>';
    form.innerHTML += '<label for = "Email" class = "label">Email</label>';
    form.innerHTML += '<input id = "Email" class = "input" type = "text" name = "Email" value = "' + user.email + '"/>';
    form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
    form.innerHTML += '<input id = "Birth" class = "input" type = "text" name = "Birth" value = "' + user.birth + '"/>';
    form.innerHTML += '<br>';
    form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
    form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "editElement();"/>';
    main.appendChild(form);
}

function loadUserManagement() {
    clean();
    let main = document.getElementById("main");
    let username = putUsername();
    main.appendChild(username);
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    thead.innerHTML = '<p>Usuarios</p>';
    let tbody = document.createElement("tbody");
    tbody.innerHTML = "";
    let users = JSON.parse(getFromDatabase("/users"));
    for(let i = 0; i < users.length; i++) {
        tbody.innerHTML += '<p>' + users[i].username + '</p>';
        tbody.innerHTML += '<input id = "' + i + '" type = "button" value = "Ver" onclick = "showUser(' + users[i].id + ');"/>';
        tbody.innerHTML += '<input id = "' + i + '" type = "button" value = "Editar" onclick = "editUser(' + users[i].id + ');"/>';
        tbody.innerHTML += '<input id = "' + i + '" type = "button" value = "Eliminar" onclick = "deleteUser(' + users[i].id + ');"/>';
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    main.appendChild(table);
}

function showUser(id) {
    clean();
    let u = JSON.parse(getFromDatabase("/users/" + id));
    let main = document.getElementById("main");
    let form = document.createElement("form");
    form.innerHTML = '<label for = "Name" class = "label">Nombre</label>';
    form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + u.username + '" readonly/>';
    form.innerHTML += '<label for = "Role" class = "label">Rol</label>';
    form.innerHTML += '<input id = "Role" class = "input" type = "text" name = "Role" value = "' + u.role + '" readonly/>';
    form.innerHTML += '<label for = "Email" class = "label">Email</label>';
    form.innerHTML += '<input id = "Email" class = "input" type = "text" name = "Email" value = "' + u.email + '" readonly/>';
    form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
    form.innerHTML += '<input id = "Birth" class = "input" type = "text" name = "Birth" value = "' + user.birth + '" readonly/>';
    form.innerHTML += '<br>';
    form.innerHTML += '<input type = "button" name = "Back" value = "Atrás" onclick = "loadUserManagement();"/>';
    main.appendChild(form);
}

function editUser(id) { // id = user.id => recargar la info guardada en user.
    clean();
    let u = JSON.parse(getFromDatabase("/users/" + id));
    let main = document.getElementById("main");
    let form = document.createElement("form");
    form.innerHTML = '<label for = "Name" class = "label">Nombre</label>';
    form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + u.username + '" readonly/>';
    form.innerHTML += '<label for = "Role" class = "label">Rol</label>';
    form.innerHTML += '<input id = "Role" class = "input" type = "text" name = "Role" value = "' + u.role + '"/>';
    form.innerHTML += '<br>';
    form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadUserManagement();"/>';
    form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "editUserInfo();"/>';
    main.appendChild(form);
}

function editUserInfo() {

}

function deleteUser(id) {
    JSON.parse(deleteOnDatabase("/users/" + id));
    loadUserManagement();
}







function createProduct() {
    clean();
}
function createPerson() {
    clean();
}
function createEntity() {
    clean();
}










function editProduct(event) {
    clean();
    let id = event.target.id;
    getFromDB(`/products/${id}`, function (response) {
        let jsonResponse = JSON.parse(response);
        let product = jsonResponse.product;
        let myProduct = new Product(product.id, product.name, product.birthDate, product.deathDate, product.imageUrl,
            product.wikiUrl, product.entities, product.persons);
        generateEditElementForm(myProduct, "product");
    });
}
function editPerson() {
    clean();
}
function editEntity() {
    clean();
}
function deleteProduct() {
    clean();
}
function deletePerson() {
    clean();
}
function deleteEntity() {
    clean();
}







function generateEditElementForm(myElement, type) {
    let main = document.getElementById("main");
    let index = putIndex();
    let username = putUsername();
    let form = basicEditForm(myElement, type);
    main.appendChild(index);
    main.appendChild(username);
    main.appendChild(form);
    let div1 = document.createElement("div");
    let div2 = document.createElement("div");
    form.appendChild(div1);
    form.appendChild(div2);
    if(type === "product") {
        addProductRelatedEntitiesForm(myElement.relatedEntities, div1);
        // form.innerHTML += addProductRelatedForm(myElement.people);
    }
    else if(type === "entity") {
        alert();
        // form.innerHTML += addEntityRelatedForm(myElement.products);
        // form.innerHTML += addEntityRelatedForm(myElement.people);
    }
    else {
        alert();
        // form.innerHTML += addPersonRelatedForm(myElement.products);
        // form.innerHTML += addPersonRelatedForm(myElement.entities);
    }
    form.innerHTML += '<br>';
    form.innerHTML += '<input type = "button" name = "Cancel" value = "Cancelar" onclick = "loadIndex();"/>';
    form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "editElement();"/>';
}

function basicEditForm(myElement, type) {
    let form = document.createElement("form");
    if(type === "product")
        form.innerHTML = '<h2>Editar producto</h2>';
    else if(type === "entity")
        form.innerHTML = '<h2>Editar entidad</h2>';
    else
        form.innerHTML = '<h2>Editar persona</h2>';
    form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
    form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + myElement.name + '"/>';
    form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
    form.innerHTML += '<input id = "Birth" class = "input" type = "date" name = "Birth" value = "' + myElement.birth + '"/>';
    form.innerHTML += '<label for = "Death" class = "label">Fecha de defunción</label>';
    form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death" value = "' + myElement.death + '"/>';
    form.innerHTML += '<label for = "Image" class = "label">Imagen</label>';
    form.innerHTML += '<input id = "Image" class = "input" type = "text" name = "Image" value = "' + myElement.image + '"/>';
    form.innerHTML += '<label for = "Wiki" class = "label">Wiki</label>';
    form.innerHTML += '<input id = "Wiki" class = "input" type = "text" name = "Wiki" value = "' + myElement.wiki + '"/>';
    return form;
}

function addProductRelatedEntitiesForm(relatedIds, div) {
    let p = document.createElement("p");
    p.innerHTML = 'Entidades relacionadas';
    div.appendChild(p);
    getElementsFromDB(`/entities`, function (response) {
        div.appendChild(p);
        let jsonResponse = JSON.parse(response);
        let arrayEntities = jsonResponse.entities;
        let entities = arrayEntities.map(function(item) {
            let e = item.entity;
            return new Entity(e.id, e.name, null, null, null, null, null, null);
        });
        if(relatedIds !== null) {
            let notFound;
            let entityId;
            for (let i = 0; i < entities.length; i++) {
                entityId = entities[i].id;
                notFound = true;
                for (let j = 0; j < relatedIds.length && notFound; j++)
                    if (entityId === relatedIds[j]) {
                        let article = document.createElement("article");
                        article.innerHTML = `<input id="${entities[i].id}" type="checkbox" checked="checked"/>${entities[i].name}`;
                        div.appendChild(article);
                        let br = document.createElement("br");
                        div.appendChild(br);
                        notFound = false;
                    }
                if (notFound) {
                    let article = document.createElement("article");
                    article.innerHTML = `<input id="${entities[i].id}" type="checkbox"/>${entities[i].name}`;
                    div.appendChild(article);
                    let br = document.createElement("br");
                    div.appendChild(br);
                }
            }
        }
        else
            for(let i = 0; i < entities.length; i++) {
                let article = document.createElement("article");
                article.innerHTML = `<input id="${entities[i].id}" type="checkbox"/>${entities[i].name}`;
                div.appendChild(article);
                let br = document.createElement("br");
                div.appendChild(br);
            }
    });
}




























/*
function loadLocalStorage() {  // eliminar cuando meta los datos en la BD
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

/*
function loadElementInfo() {
    let myElement = getFromLocalStorage("myElement");
    let myElementType = getFromLocalStorageNoParse("myElementType");
    let section = document.getElementById("section");
    section.innerHTML = '<iframe src="' + myElement.wiki + '" alt="' + myElement.name + '"></iframe>';
    let aside = document.getElementById("aside");
    aside.innerHTML = '<h3><b>' + myElement.name + '</b></h3>';
    aside.innerHTML += '<h4><b>' + myElement.birth + '</b></h4>';
    if(myElement.death == "")
        myElement.death = "Vivo";
    aside.innerHTML += '<h4><b>' + myElement.death + '</b></h4>';
    aside.innerHTML += '<img class="bigImage" src="' + myElement.image + '" alt="' + myElement.name + '" width="10%"/>';
    if(myElementType === "productType")
        loadRelatedWithProducts(myElement);
    else if(myElementType === "personType")
        loadRelatedWithPeople(myElement);
    else if(myElementType === "entityType")
        loadRelatedWithEntities(myElement);
    else
        alert("Error: element desconocido.");
}
*/

/*
function loadRelatedWithProducts(myElement) {
    let footer = document.getElementById("footer");

    let div1 = document.createElement("div");
    div1.setAttribute("class", "foot1");
    let p1 = document.createElement("p");
    let title1 = document.createTextNode("Entidades relacionadas");
    p1.appendChild(title1);
    div1.appendChild(p1);
    if(myElement.relatedEntities != undefined)
        for(let i = 0; i < myElement.relatedEntities.length; i++) {
            let article = document.createElement("article");
            let img = document.createElement("img");
            img.setAttribute("src", myElement.relatedEntities[i].image);
            img.setAttribute("alt", myElement.relatedEntities[i].name);
            img.setAttribute("class", "imageFooter");
            article.appendChild(img);
            let a = document.createElement("a");
            let name = document.createTextNode(myElement.relatedEntities[i].name);
            a.appendChild(name);
            a.setAttribute("id", myElement.relatedEntities[i].id);
            a.addEventListener('click', showEntity);
            article.appendChild(a);
            div1.appendChild(article);
        }
    footer.appendChild(div1);

    let div2 = document.createElement("div");
    div2.setAttribute("class", "foot2");
    let p2 = document.createElement("p");
    let title2 = document.createTextNode("Personas relacionadas");
    p2.appendChild(title2);
    div2.appendChild(p2);
    if(myElement.relatedPeople != undefined)
        for(let i = 0; i < myElement.relatedPeople.length; i++) {
            let article = document.createElement("article");
            let img = document.createElement("img");
            img.setAttribute("src", myElement.relatedPeople[i].image);
            img.setAttribute("alt", myElement.relatedPeople[i].name);
            img.setAttribute("class", "imageFooter");
            article.appendChild(img);
            let a = document.createElement("a");
            let name = document.createTextNode(myElement.relatedPeople[i].name);
            a.appendChild(name);
            a.setAttribute("id", myElement.relatedPeople[i].id);
            a.addEventListener('click', showPerson);
            article.appendChild(a);
            div2.appendChild(article);
        }
    footer.appendChild(div2);
}
*/

/*
function loadRelatedWithPeople(myElement) {
    let footer = document.getElementById("footer");

    let div1 = document.createElement("div");
    div1.setAttribute("class", "foot1");
    let p1 = document.createElement("p");
    let title1 = document.createTextNode("Productos relacionados");
    p1.appendChild(title1);
    div1.appendChild(p1);

    let myElementId = myElement.id;
    let products = getFromLocalStorage("products");
    for(let i = 0; i < products.length; i++) {
        let iProduct = products[i].relatedPeople;
        let notFound = true;
        for(let j = 0; j < iProduct.length && notFound; j++)
            if(myElementId == iProduct[j].id) {
                notFound = false;
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", products[i].image);
                img.setAttribute("alt", products[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(products[i].name);
                a.appendChild(name);
                a.setAttribute("id", products[i].id);
                a.addEventListener('click', showProduct);
                article.appendChild(a);
                div1.appendChild(article);
            }
    }
    footer.appendChild(div1);

    let div2 = document.createElement("div");
    div2.setAttribute("class", "foot2");
    let p2 = document.createElement("p");
    let title2 = document.createTextNode("Entidades relacionadas");
    p2.appendChild(title2);
    div2.appendChild(p2);

    let entities = getFromLocalStorage("entities");
    for(let i = 0; i < entities.length; i++) {
        let iEntity = entities[i].relatedPeople;
        let notFound = true;
        for(let j = 0; j < iEntity.length && notFound; j++)
            if(myElementId == iEntity[j].id) {
                notFound = false;
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", entities[i].image);
                img.setAttribute("alt", entities[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(entities[i].name);
                a.appendChild(name);
                a.setAttribute("id", entities[i].id);
                a.addEventListener('click', showEntity);
                article.appendChild(a);
                div2.appendChild(article);
            }
    }
    footer.appendChild(div2);
}
*/

/*
function loadRelatedWithEntities(myElement) {
    let footer = document.getElementById("footer");

    let div1 = document.createElement("div");
    div1.setAttribute("class", "foot1");
    let p1 = document.createElement("p");
    let title1 = document.createTextNode("Productos relacionados");
    p1.appendChild(title1);
    div1.appendChild(p1);

    let myElementId = myElement.id;
    let products = getFromLocalStorage("products");
    for(let i = 0; i < products.length; i++) {
        let iProduct = products[i].relatedEntities;
        let notFound = true;
        for(let j = 0; j < iProduct.length && notFound; j++)
            if(myElementId == iProduct[j].id) {
                notFound = false;
                let article = document.createElement("article");
                let img = document.createElement("img");
                img.setAttribute("src", products[i].image);
                img.setAttribute("alt", products[i].name);
                img.setAttribute("class", "imageFooter");
                article.appendChild(img);
                let a = document.createElement("a");
                let name = document.createTextNode(products[i].name);
                a.appendChild(name);
                a.setAttribute("id", products[i].id);
                a.addEventListener('click', showProduct);
                article.appendChild(a);
                div1.appendChild(article);
            }
    }
    footer.appendChild(div1);

    let div2 = document.createElement("div");
    div2.setAttribute("class", "foot2");
    let p2 = document.createElement("p");
    let title2 = document.createTextNode("Personas relacionadas");
    p2.appendChild(title2);
    div2.appendChild(p2);
    if(myElement.relatedPeople != undefined)
        for(let i = 0; i < myElement.relatedPeople.length; i++) {
            let article = document.createElement("article");
            let img = document.createElement("img");
            img.setAttribute("src", myElement.relatedPeople[i].image);
            img.setAttribute("alt", myElement.relatedPeople[i].name);
            img.setAttribute("class", "imageFooter");
            article.appendChild(img);
            let a = document.createElement("a");
            let name = document.createTextNode(myElement.relatedPeople[i].name);
            a.appendChild(name);
            a.setAttribute("id", myElement.relatedPeople[i].id);
            a.addEventListener('click', showPerson);
            article.appendChild(a);
            div2.appendChild(article);
        }
    footer.appendChild(div2);
}
*/

/*
function createProduct() {
    setLocalStorageNoStringify("myElementType", "productType");
    setLocalStorageNoStringify("action", "create");
    window.location.href = "createOrUpdateElement.html";
}
*/

/*
function createPerson() {
    setLocalStorageNoStringify("myElementType", "personType");
    setLocalStorageNoStringify("action", "create");
    window.location.href = "createOrUpdateElement.html";
}
*/

/*
function createEntity() {
    setLocalStorageNoStringify("myElementType", "entityType");
    setLocalStorageNoStringify("action", "create");
    window.location.href = "createOrUpdateElement.html";
}
*/

/*
function updateProduct(event) {
    let id = event.target.id;
    let products = getFromLocalStorage("products");
    let product = findElementById(products, id);
    setLocalStorage("myElement", product);
    setLocalStorageNoStringify("myElementType", "productType");
    setLocalStorageNoStringify("action", "update");
    window.location.href = "createOrUpdateElement.html";
}
*/

/*
function updatePerson(event) {
    let id = event.target.id;
    let people = getFromLocalStorage("people");
    let person = findElementById(people, id);
    setLocalStorage("myElement", person);
    setLocalStorageNoStringify("myElementType", "personType");
    setLocalStorageNoStringify("action", "update");
    window.location.href = "createOrUpdateElement.html";
}
*/

/*
function updateEntity(event) {
    let id = event.target.id;
    let entities = getFromLocalStorage("entities");
    let entity = findElementById(entities, id);
    setLocalStorage("myElement", entity);
    setLocalStorageNoStringify("myElementType", "entityType");
    setLocalStorageNoStringify("action", "update");
    window.location.href = "createOrUpdateElement.html";
}
*/

/*
function loadCreateOrUpdateElement() {
    let myElementType =  getFromLocalStorageNoParse("myElementType");
    let action = getFromLocalStorageNoParse("action");
    let form = document.getElementById("createOrUpdateElementForm");
    if(action === "create") {
        if(myElementType === "productType")
            form.innerHTML = '<h2>Crear producto</h2>';
        else if(myElementType === "personType")
            form.innerHTML = '<h2>Crear persona</h2>';
        else
            form.innerHTML = '<h2>Crear entidad</h2>';
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
        if(myElementType === "entityType" || myElementType === "productType") {
            let people = getFromLocalStorage("people");
            if(people.length > 0) {
                form.innerHTML += '<p>Personas relacionadas</p>';
                for(let i = 0; i < people.length; i++) 
                    form.innerHTML += '<article><input id="p' + i + '" type="checkbox"/>' + people[i].name + '</article><br>';
            }
            if(myElementType === "productType") {
                let entities = getFromLocalStorage("entities");
                if(entities.length > 0) {
                    form.innerHTML += '<p>Entidades relacionadas</p>';
                    for(let i = 0; i < entities.length; i++) 
                        form.innerHTML += '<article><input id="e' + i + '" type="checkbox"/>' + entities[i].name + '</article><br>';
                }
            }
        }
        form.innerHTML += '<br>';
        form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "editElement();"/>';
    }
    else if(action === "update") {
        let myElement = getFromLocalStorage("myElement");
        if(myElementType === "productType")
            form.innerHTML = '<h2>Editar producto</h2>';
        else if(myElementType === "personType")
            form.innerHTML = '<h2>Editar persona</h2>';
        else
            form.innerHTML = '<h2>Editar entidad</h2>';
        form.innerHTML += '<label for = "Name" class = "label">Nombre</label>';
        form.innerHTML += '<input id = "Name" class = "input" type = "text" name = "Name" value = "' + myElement.name + '"/>';
        form.innerHTML += '<label for = "Birth" class = "label">Fecha de nacimiento</label>';
        let dateArray = myElement.birth.split('/');
        let finalDate = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
        form.innerHTML += '<input id = "Birth" class = "input" type = "date" name = "Birth" value = "' + finalDate + '"/>';
        form.innerHTML += '<label for = "Death" class = "label">Fecha de defunción</label>';
        if(myElement.death == "")
            form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death"/>';
        else {
            dateArray = myElement.death.split('/');
            finalDate = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
            form.innerHTML += '<input id = "Death" class = "input" type = "date" name = "Death" value = "' + finalDate + '"/>';
        }
        form.innerHTML += '<label for = "Image" class = "label">Imagen</label>';
        form.innerHTML += '<input id = "Image" class = "input" type = "text" name = "Image" value = "' + myElement.image + '"/>';
        form.innerHTML += '<label for = "Wiki" class = "label">Wiki</label>';
        form.innerHTML += '<input id = "Wiki" class = "input" type = "text" name = "Wiki" value = "' + myElement.wiki + '"/>';
        if(myElementType === "entityType" || myElementType === "productType") {
            let people = getFromLocalStorage("people");
            if(people.length > 0) {
                form.innerHTML += '<p>Personas relacionadas</p>';
                for(let i = 0; i < people.length; i++) {
                    let notFound = true;
                    for(let j = 0; j < myElement.relatedPeople.length && notFound; j++)
                        if(myElement.relatedPeople[j].id == people[i].id) {
                            notFound = false;
                            form.innerHTML += '<article><input id="p' + i + '" type="checkbox" checked="checked"/>' + people[i].name + '</article><br>';
                        }
                    if(notFound)
                        form.innerHTML += '<article><input id="p' + i + '" type="checkbox"/>' + people[i].name + '</article><br>';
                }
            }
            if(myElementType === "productType") {
                let entities = getFromLocalStorage("entities");
                if(entities.length > 0) {
                    form.innerHTML += '<p>Entidades relacionadas</p>';
                    for(let i = 0; i < entities.length; i++) {
                        let notFound = true;
                        for(let j = 0; j < myElement.relatedEntities.length && notFound; j++)
                            if(myElement.relatedEntities[j].id == entities[i].id) {
                                notFound = false;
                                form.innerHTML += '<article><input id="e' + i + '" type="checkbox" checked="checked"/>' + entities[i].name + '</article><br>';
                            }
                        if(notFound)
                            form.innerHTML += '<article><input id="e' + i + '" type="checkbox"/>' + entities[i].name + '</article><br>';
                    }
                }
            }
        }
        form.innerHTML += '<br>';
        form.innerHTML += '<input type = "button" name = "Submit" value = "Guardar" onclick = "editElement();"/>';
        setLocalStorage("myElementId", myElement.id);
    }
    else
        alert("Error: action erróneo.");
}
*/

/*
function editElement() {
    let myElementType = getFromLocalStorageNoParse("myElementType");
    let action = getFromLocalStorageNoParse("action");
    let name = document.getElementById("Name").value;
    let birth = document.getElementById("Birth").value;
    let death = document.getElementById("Death").value;
    let image = document.getElementById("Image").value;
    let wiki = document.getElementById("Wiki").value;
    if(validateElement(name, birth, image, wiki)) {
        let dateArray = birth.split('-');
        birth = dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0];
        if(death != "") {
            dateArray = death.split('-');
            death = dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0];
        }
        if(action === "create") {
            if(myElementType === "productType") {
                let relatedPeople = [];
                let people = getFromLocalStorage("people");
                for(let i = 0; i < people.length; i++) {
                    let iPerson = document.getElementById("p" + i);
                    if(iPerson.checked)
                        relatedPeople.push(people[i]);
                }
                let relatedEntities = [];
                let entities = getFromLocalStorage("entities");
                for(let i = 0; i < entities.length; i++) {
                    let iEntity = document.getElementById("e" + i);
                    if(iEntity.checked)
                        relatedEntities.push(entities[i]);
                }
                let newProduct = new Product(name, birth, death, image, wiki, relatedPeople, relatedEntities);
                let products = getFromLocalStorage("products");
                products.push(newProduct);
                setLocalStorage("products", products);
            }
            else if(myElementType === "personType") {
                let newPerson = new Person(name, birth, death, image, wiki);
                let people = getFromLocalStorage("people");
                people.push(newPerson);
                setLocalStorage("people", people);
            }
            else if(myElementType === "entityType") {
                let relatedPeople = [];
                let people = getFromLocalStorage("people");
                for(let i = 0; i < people.length; i++) {
                    let iPerson = document.getElementById("p" + i);
                    if(iPerson.checked)
                        relatedPeople.push(people[i]);
                }
                let newEntity = new Entity(name, birth, death, image, wiki, relatedPeople);
                let entities = getFromLocalStorage("entities");
                entities.push(newEntity);
                setLocalStorage("entities", entities);
            }
            else
                alert("Error: elementType erróneo.");
        }
        else if(action === "update") {
            let myElementId = getFromLocalStorage("myElementId");
            if(myElementType === "productType") {
                let relatedPeople = [];
                let people = getFromLocalStorage("people");
                for(let i = 0; i < people.length; i++) {
                    let iPerson = document.getElementById("p" + i);
                    if(iPerson.checked)
                        relatedPeople.push(people[i]);
                }
                let relatedEntities = [];
                let entities = getFromLocalStorage("entities");
                for(let i = 0; i < entities.length; i++) {
                    let iEntity = document.getElementById("e" + i);
                    if(iEntity.checked)
                        relatedEntities.push(entities[i]);
                }
                let products = getFromLocalStorage("products");
                let notFound = true;
                for(let i = 0; i < products.length && notFound; i++)
                    if(myElementId == products[i].id) {
                        products[i].name = name;
                        products[i].birth = birth;
                        products[i].death = death;
                        products[i].image = image;
                        products[i].wiki = wiki;
                        products[i].relatedPeople = relatedPeople;
                        products[i].relatedEntities = relatedEntities;
                        notFound = false;
                    }
                setLocalStorage("products", products);
            }
            else if(myElementType === "personType") {
                let people = getFromLocalStorage("people");
                let notFound = true;
                for(let i = 0; i < people.length && notFound; i++)
                    if(myElementId == people[i].id) {
                        people[i].name = name;
                        people[i].birth = birth;
                        people[i].death = death;
                        people[i].image = image;
                        people[i].wiki = wiki;
                        notFound = false;
                    }
                setLocalStorage("people", people);
                let entities = getFromLocalStorage("entities");
                for(let i = 0; i < entities.length; i++) {
                    let notFound = true;
                    for(let j = 0; j < entities[i].relatedPeople.length && notFound; j++) {
                        if(myElementId == entities[i].relatedPeople[j].id) {
                            entities[i].relatedPeople[j].name = name;
                            entities[i].relatedPeople[j].birth = birth;
                            entities[i].relatedPeople[j].death = death;
                            entities[i].relatedPeople[j].image = image;
                            entities[i].relatedPeople[j].wiki = wiki;
                            notFound = false;
                        }
                    }
                }
                setLocalStorage("entities", entities);
                let products = getFromLocalStorage("products");
                for(let i = 0; i < products.length; i++) {
                    let notFound = true;
                    for(let j = 0; j < products[i].relatedPeople.length && notFound; j++) {
                        if(myElementId == products[i].relatedPeople[j].id) {
                            products[i].relatedPeople[j].name = name;
                            products[i].relatedPeople[j].birth = birth;
                            products[i].relatedPeople[j].death = death;
                            products[i].relatedPeople[j].image = image;
                            products[i].relatedPeople[j].wiki = wiki;
                            notFound = false;
                        }
                    }
                    for(let j = 0; j < products[i].relatedEntities.length; j++)
                        if(products[i].relatedEntities[j].relatedPeople != []) {
                            notFound = true;
                            for(let k = 0; k < products[i].relatedEntities[j].relatedPeople.length; k++) {
                                if(myElementId == products[i].relatedEntities[j].relatedPeople[k].id) {
                                    products[i].relatedEntities[j].relatedPeople[k].name = name;
                                    products[i].relatedEntities[j].relatedPeople[k].birth = birth;
                                    products[i].relatedEntities[j].relatedPeople[k].death = death;
                                    products[i].relatedEntities[j].relatedPeople[k].image = image;
                                    products[i].relatedEntities[j].relatedPeople[k].wiki = wiki;
                                    notFound = false;
                                }
                        }
                    }
                }
                for(let i = 0; i < products.length; i++) {
                    let notFound = true;
                    for(let j = 0; j < products[i].relatedPeople.length && notFound; j++) {
                        if(myElementId == products[i].relatedPeople[j].id) {
                            products[i].relatedPeople[j].name = name;
                            products[i].relatedPeople[j].birth = birth;
                            products[i].relatedPeople[j].death = death;
                            products[i].relatedPeople[j].image = image;
                            products[i].relatedPeople[j].wiki = wiki;
                            notFound = false;
                        }
                    }
                }
                setLocalStorage("products", products);
            }
            else if(myElementType === "entityType") {
                let relatedPeople = [];
                let people = getFromLocalStorage("people");
                for(let i = 0; i < people.length; i++) {
                    let iPerson = document.getElementById("p" + i);
                    if(iPerson.checked)
                        relatedPeople.push(people[i]);
                }
                let entities = getFromLocalStorage("entities");
                let notFound = true;
                for(let i = 0; i < entities.length && notFound; i++)
                    if(myElementId == entities[i].id) {
                        entities[i].name = name;
                        entities[i].birth = birth;
                        entities[i].death = death;
                        entities[i].image = image;
                        entities[i].wiki = wiki;
                        entities[i].relatedPeople = relatedPeople;
                        notFound = false;
                    }
                setLocalStorage("entities", entities);
                let products = getFromLocalStorage("products");
                for(let i = 0; i < products.length; i++) {
                    let notFound = true;
                    for(let j = 0; j < products[i].relatedEntities.length && notFound; j++) {
                        if(myElementId == products[i].relatedEntities[j].id) {
                            products[i].relatedEntities[j].name = name;
                            products[i].relatedEntities[j].birth = birth;
                            products[i].relatedEntities[j].death = death;
                            products[i].relatedEntities[j].image = image;
                            products[i].relatedEntities[j].wiki = wiki;
                            products[i].relatedEntities[j].relatedPeople = relatedPeople;
                            notFound = false;
                        }
                    }
                }
                setLocalStorage("products", products);
            }
        }
        else
            alert("Error: action erróneo.");
        window.location.href = "index.html";
    }
    else {
        alert("Error: Todos los campos son obligatorios");
        loadCreateOrUpdateElement();
    }
}
*/

/*
function validateElement(name, birth, image, wiki) {
    return (name && birth && image && wiki);
}
*/

/*
function OLDdeleteProduct(event) {
    let id = event.target.id;
    let products = getFromLocalStorage("products");
    let notFound = true;
    for(let i = 0; i < products.length && notFound; i++)
        if(products[i].id == id) {
            products.splice(i, 1);
            notFound = false;
        }
    setLocalStorage("products", products);
    loadIndex();
}
*/

/*
function deletePerson(event) {
    let id = event.target.id;
    let people = getFromLocalStorage("people");
    let notFound = true;
    for(let i = 0; i < people.length && notFound; i++)
        if(people[i].id == id) {
            people.splice(i, 1);
            notFound = false;
        }
    setLocalStorage("people", people);
    let entities = getFromLocalStorage("entities");
    for(let i = 0; i < entities.length; i++) {
        let notFound = true;
        for(let j = 0; j < entities[i].relatedPeople.length && notFound; j++) {
            if(id == entities[i].relatedPeople[j].id) {
                entities[i].relatedPeople.splice(j, 1);
                notFound = false;
            }
        }
    }
    setLocalStorage("entities", entities);
    let products = getFromLocalStorage("products");
    for(let i = 0; i < products.length; i++) {
        let notFound = true;
        for(let j = 0; j < products[i].relatedPeople.length && notFound; j++) {
            if(id == products[i].relatedPeople[j].id) {
                products[i].relatedPeople.splice(j, 1);
                notFound = false;
            }
        }
    }
    setLocalStorage("products", products);
    loadIndex();
}
*/

/*
function deleteEntity(event) {
    let id = event.target.id;
    let entities = getFromLocalStorage("entities");
    let notFound = true;
    for(let i = 0; i < entities.length && notFound; i++)
        if(entities[i].id == id) {
            entities.splice(i, 1);
            notFound = false;
        }
    setLocalStorage("entities", entities);
    let products = getFromLocalStorage("products");
    for(let i = 0; i < products.length; i++) {
        let notFound = true;
        for(let j = 0; j < products[i].relatedEntities.length && notFound; j++) {
            if(id == products[i].relatedEntities[j].id) {
                products[i].relatedEntities.splice(j, 1);
                notFound = false;
            }
        }
    }
    setLocalStorage("products", products);
    loadIndex();
}
*/

/*
function getFromLocalStorageNoParse(key) {
    if(window.localStorage.getItem(key))
        return (window.localStorage.getItem(key));
    else
        alert("Error: " + key + " no está en localStorage.");
}
*/

/*
function getFromLocalStorage(key) {
    if(window.localStorage.getItem(key))
        return (JSON.parse(window.localStorage.getItem(key)));
    else
        alert("Error: " + key + " no está en localStorage.");
}
*/

/*
function setLocalStorageNoStringify(key, value) {
    window.localStorage.setItem(key, value);
}
*/

/*
function setLocalStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}
*/

/*
function findElementById(array, id) {
    for(let i = 0; i < array.length; i++)
        if(array[i].id == id)
            return array[i];
    alert("Error: el elemento con id " + id + " no está en " + array + ".");
    return null;
}
*/

/*
function showProduct(event) {
    let id = event.target.id;
    // usar método GET de swagger que devuelve un producto a través de un id.
    let product = getFromDatabase(`/products/${id}`);

    // pasarle a elementInfo.html (loadElementInfo()) product, para que sepa cuál mostrar.
    // ??
    
    window.location.href = "elementInfo.html";
}
*/

/*
function deleteProduct(event) {
    let id = event.target.id;
    deleteOnDatabase(`/products/${id}`)
    loadIndex();
}
*/

/*
function loadProfile() {
    // let user = ?; // usuario a mostrar.
    let profile = document.getElementById("profileForm");
    profile.innerHTML += '<h2>Mi perfil</h2>';
    profile.innerHTML += '<label for = "Username" class = "input" type = "text" name = "Username">Usuario</label>';
    profile.innerHTML += '<input class = "input" type = "text" name = "Usermane" value = "' + user.username + '" readonly/>';
    profile.innerHTML += '<label for = "Password" class = "input" type = "text" name = "Password">Contraseña</label>';
    profile.innerHTML += '<input class = "input" type = "text" name = "Password" value = "' + user.password + '"/>';
    profile.innerHTML += '<label for = "Email" class = "input" type = "text" name = "Email">Email</label>';
    profile.innerHTML += '<input class = "input" type = "text" name = "Email" value = "' + user.email + '"/>';
    profile.innerHTML += '<label for = "Birth" class = "input" type = "text" name = "Birth">Fecha de nacimiento</label>';
    profile.innerHTML += '<input class = "input" type = "date" name = "Birth" value = "' + user.birth + '"/>';
    profile.innerHTML += '<br>';
    profile.innerHTML += '<input type = "button" name = "Save" value = "Guardar" onclick = "??"/>';
}
*/

/*
function loadUserManagement() {
    let table = document.getElementById("usersTable");
    let thead = loadtheadUsers();
    let tbody = loadtbodyUsers();
    table.appendChild(thead);
    table.appendChild(tbody);

    let table2 = document.getElementById("newUsersTable");
    let thead2 = loadtheadNewUsers();
    let tbody2 = loadtbodyNewUsers();
    table2.appendChild(thead2);
    table2.appendChild(tbody2);
}
*/

/*
function loadtheadUsers() {
    let thead = document.createElement("thead");
    let trHead = document.createElement("tr");
    let tdHead1 = document.createElement("td");
    let p1 = document.createElement("p");
    p1.setAttribute("class", "subtitle");
    let text1 = document.createTextNode("Usuario");
    p1.appendChild(text1);
    tdHead1.appendChild(p1);
    trHead.appendChild(tdHead1);
    let tdHead2 = document.createElement("td");
    let p2 = document.createElement("p");
    p2.setAttribute("class", "subtitle");
    let text2 = document.createTextNode("Rol");
    p2.appendChild(text2);
    tdHead2.appendChild(p2);
    trHead.appendChild(tdHead2);
    let tdHead3 = document.createElement("td");
    let p3 = document.createElement("p");
    p3.setAttribute("class", "subtitle");
    let text3 = document.createTextNode("Activo");
    p3.appendChild(text3);
    tdHead3.appendChild(p3);
    trHead.appendChild(tdHead3);
    thead.appendChild(trHead);
    return thead;
}
*/

/*
function loadtbodyUsers() {
    // petición para obtener lista de usuarios. let users = ...
    // poner la info
    // añadir botones para Editar y Eliminar/Borrar
    // return tbody;
}
*/

/*
function loadtheadNewUsers() {
    let thead = document.createElement("thead");
    let trHead = document.createElement("tr");
    let tdHead1 = document.createElement("td");
    let p1 = document.createElement("p");
    p1.setAttribute("class", "subtitle");
    let text1 = document.createTextNode("Usuario");
    p1.appendChild(text1);
    tdHead1.appendChild(p1);
    trHead.appendChild(tdHead1);
    thead.appendChild(trHead);
    return thead;
}
*/

/*
function loadtbodyNewUsers() {
    // petición para obtener lista de nuevos usuarios. let newUsers = ...
    // poner la info
    // añadir botones para Permitir acceso como reader y Permitir acceso como writer
    // return tbody;
}
*/

// -------------------------------------------------------

/*
function showData(authHeader) {
    showToken(authHeader);
    showProducts(authHeader);
    showUsers(authHeader);
}
*/

/*
function showToken(authHeader) {
    let token = authHeader.split(' ')[1];   // Elimina 'Bearer '
    let myData = JSON.parse(atob(token.split('.')[1]));
    console.log("JWT: " + token);
    $('#mytoken').html(
        "User: " + JSON.stringify(myData.sub) +
        " - JWT Scopes: " + JSON.stringify(myData.scopes)
    );
}
*/

/*
function showProducts(authHeader) {
    $.ajax({
        type: "GET",
        url: '/api/v1/products',
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            $('#products').html(JSON.stringify(data));
        }
    })
}
*/

/*
function showUsers(authHeader) { // hacerlo con ajax
    $.ajax({
        type: "GET",
        url: '/api/v1/users',
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            $('#users').html(JSON.stringify(data));
        }
    })
}
*/