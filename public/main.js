var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var clearCompleteButton = document.getElementById("clear-complete-button");
var filterSelector = document.getElementById("todo-filters");

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

var currentTodoListFilter = "all";

// Add filters to page as buttons
Object.keys(listFilters).forEach(function(key) {
    var filterButton = document.createElement("button");
    filterButton.onclick = function() {
        currentTodoListFilter = key;
        reloadTodoList();
    };
    filterButton.innerHTML = key.charAt(0).toUpperCase() + key.substring(1);
    filterButton.classList.add("button");
    filterButton.setAttribute("id", "filter-" + key);
    filterSelector.appendChild(filterButton);
    return filterButton;
});

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    fetch("/api/todo", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title
        })
    }).then(function(response) {
        if (response.status === 201) {
            callback();
        } else {
            error.textContent =
                "Failed to create item. Server returned " + response.status + " - " + response.statusText;
        }
    }).catch(function(ex) {
        console.log("Fetch error :-S", ex);
    });
}

function deleteTodo(id, callback) {
    fetch("/api/todo/" + id, {
        method: "DELETE"
    }).then(function(response) {
        if (response.status === 200) {
            callback();
        } else {
            error.textContent =
                "Failed to delete item. Server returned " + response.status + " - " + response.statusText;
        }
    }).catch(function(ex) {
        console.log("Fetch error :-S", ex);
    });
}

function completeTodo(id, callback) {
    fetch("/api/todo/" + id, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            isComplete: true
        })
    }).then(function(response) {
        if (response.status === 200) {
            callback();
        } else {
            error.textContent =
                "Failed to complete item. Server returned " + response.status + " - " + response.statusText;
        }
    }).catch(function(ex) {
        console.log("Fetch error :-S", ex);
    });
}

function getTodoList(callback) {
    fetch("/api/todo", {
        method: "GET"
    }).then(function(response) {
        if (response.status === 200) {
            response.json().then(function(data) {
                callback(data);
            });
        } else {
            error.textContent =
                "Failed to get list. Server returned " + response.status + " - " + response.statusText;
        }
    }).catch(function(ex) {
        console.log("Fetch error :-S", ex);
    });
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
        var filteredTodos = todos.filter(listFilters[currentTodoListFilter]);
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
        var completedItemCount = filteredTodos.reduce(function(prev, curr) {
            return prev + (curr.isComplete ? 1 : 0);
        }, 0);
        var remainingItemCount = filteredTodos.length - completedItemCount;
        countLabel.textContent = (
            remainingItemCount.toString() +
            " item" + (remainingItemCount === 1 ? "" : "s") + " remaining.");
        if (completedItemCount > 0) {
            var completedItems = filteredTodos.filter(function(curr) { return curr.isComplete; });
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

// Interval between list refreshes in ms
var todoListRefreshRate = 4 * 1000;

reloadTodoList();
setInterval(reloadTodoList, todoListRefreshRate);
