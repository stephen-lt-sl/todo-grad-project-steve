var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send(JSON.stringify({
        title: title
    }));
}

function deleteTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function completeTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to complete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send(JSON.stringify({
        isComplete: true
    }));
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var compButton = document.createElement("button");
            compButton.onclick = function(event) { completeTodo(todo.id, reloadTodoList); };
            compButton.innerHTML = "Complete";
            compButton.classList.add("button", "completeButton");
            compButton.setAttribute("data-id", todo.id.toString());
            var delButton = document.createElement("button");
            delButton.onclick = function(event) { deleteTodo(todo.id, reloadTodoList); };
            delButton.innerHTML = "Delete";
            delButton.classList.add("button", "deleteButton");
            delButton.setAttribute("data-id", todo.id.toString());
            listItem.textContent = todo.title;
            listItem.appendChild(compButton);
            listItem.appendChild(delButton);
            listItem.classList.toggle("completedTodoItem", todo.isComplete);
            todoList.appendChild(listItem);
        });
        var remainingItems = todos.reduce(function(prev, curr) {
            return prev + (curr.isComplete ? 0 : 1);
        }, 0);
        countLabel.textContent = (
            remainingItems.toString() +
            " item" + (remainingItems === 1 ? "" : "s") + " remaining.");
    });
}

reloadTodoList();
