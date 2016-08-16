var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var clearCompleteButton = document.getElementById("clear-complete-button");

// Filters for items within the todo list; may not be combined
var listFilters = {
    // Shows all items
    "all": function(item) {
        return true;
    },
    // Shows only incomplete items
    "active": function(item) {
        return !item.isComplete;
    },
    // Shows only complete items
    "completed": function(item) {
        return item.isComplete;
    }
};
// The list filter currently being used, shows "all" by default
var currentFilter = "all";

// Set up filter buttons
document.getElementById("filter-all").onclick = function(){
    currentFilter = "all";
    reloadTodoList();
};
document.getElementById("filter-active").onclick = function(){
    currentFilter = "active";
    reloadTodoList();
};
document.getElementById("filter-completed").onclick = function(){
    currentFilter = "completed";
    reloadTodoList();
};

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

function makeListButton(text, classType, id, onclick) {
    var button = document.createElement("button");
    button.onclick = onclick;
    button.innerHTML = text;
    button.classList.add("button", classType);
    button.setAttribute("data-id", id.toString());
    button.setAttribute("id", classType + "-" + id.toString());
    return button;
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        var filteredTodos = todos.filter(listFilters[currentFilter]);
        filteredTodos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var completeButton = makeListButton("Complete", "completeButton", todo.id, function(event) {
                completeTodo(todo.id, reloadTodoList);
            });
            var deleteButton = makeListButton("Delete", "deleteButton", todo.id, function(event) {
                deleteTodo(todo.id, reloadTodoList);
            });
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
