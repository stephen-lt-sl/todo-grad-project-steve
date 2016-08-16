var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var clearCompleteButton = document.getElementById("clear-complete-button");

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
            var completeButton = document.createElement("button");
            completeButton.onclick = function(event) { completeTodo(todo.id, reloadTodoList); };
            completeButton.innerHTML = "Complete";
            completeButton.classList.add("completeButton");
            completeButton.setAttribute("data-id", todo.id.toString());
            var deleteButton = document.createElement("button");
            deleteButton.onclick = function(event) { deleteTodo(todo.id, reloadTodoList); };
            deleteButton.innerHTML = "Delete";
            deleteButton.classList.add("deleteButton");
            deleteButton.setAttribute("data-id", todo.id.toString());
            listItem.textContent = todo.title;
            listItem.appendChild(completeButton);
            listItem.appendChild(deleteButton);
            listItem.classList.toggle("completedTodoItem", todo.isComplete);
            todoList.appendChild(listItem);
        });
        var completedItemCount = todos.reduce(function(prev, curr) {
            return prev + (curr.isComplete ? 1 : 0);
        }, 0);
        var remainingItemCount = todos.length - completedItemCount;
        countLabel.textContent = (
            remainingItemCount.toString() +
            " item" + (remainingItemCount === 1 ? "" : "s") + " remaining.");
        if (completedItemCount > 0) {
            var completedItems = todos.filter(function(curr) { return curr.isComplete; });
            clearCompleteButton.style.visibility = "visible";
            clearCompleteButton.onclick = function(event) {
                completedItems.forEach(function(item, itemIdx) {
                    deleteTodo(item.id,
                        (itemIdx === completedItems.length - 1 ? reloadTodoList : function() { return; })
                    );
                });
            };
        } else {
            clearCompleteButton.style.visibility = "hidden";
        }
    });
}

reloadTodoList();
