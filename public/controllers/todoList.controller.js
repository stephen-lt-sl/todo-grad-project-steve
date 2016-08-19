/*global angular */

(function() {
    angular
        .module("todoListApp")
        .controller("TodoListController", TodoListController);

    TodoListController.$inject = ["todoListDataService"];

    function TodoListController(todoListDataService) {
        /* jshint validthis: true */
        var vm = this;

        vm.todos = [];
        vm.filteredTodos = filteredTodos;

        vm.reloadTodoList = reloadTodoList;
        vm.createTodo = createTodo;
        vm.deleteTodo = deleteTodo;
        vm.completeTodo = completeTodo;
        vm.completedItemCount = completedItemCount;
        vm.remainingItemCount = remainingItemCount;
        vm.clearCompleted = clearCompleted;
        vm.getFilters = getFilters;

        vm.updated = true;

        vm.filters = {
            "all": {
                name: "All",
                fn: function(item) {
                    return true;
                }
            },
            "active": {
                name: "Active",
                fn: function(item) {
                    return !item.isComplete;
                }
            },
            "completed": {
                name: "Completed",
                fn: function(item) {
                    return item.isComplete;
                }
            },
        };
        vm.currentFilter = "all";

        vm.todoEntryText = "";
        vm.errorText = "";

        activate();

        function activate() {
            return vm.reloadTodoList();
        }

        function reloadTodoList() {
            vm.updated = false;
            return todoListDataService.getTodos().then(function(response) {
                vm.updated = true;
                vm.todos = response.data;
            }, function(response) {
                vm.updated = true;
                vm.errorText =
                    "Failed to get list. Server returned " + response.status + " - " + response.statusText;
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function createTodo() {
            var title = vm.todoEntryText;
            vm.todoEntryText = "";
            todoListDataService.createTodo(title).then(function(response) {
                reloadTodoList();
            }, function(response) {
                vm.errorText =
                    "Failed to create item. Server returned " + response.status + " - " + response.statusText;
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function deleteTodo(id) {
            todoListDataService.deleteTodo(id).then(function(response) {
                reloadTodoList();
            }, function(response) {
                vm.errorText =
                    "Failed to delete item. Server returned " + response.status + " - " + response.statusText;
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function completeTodo(id) {
            todoListDataService.updateTodo(id, {
                isComplete: true
            }).then(function(response) {
                reloadTodoList();
            }, function(response) {
                vm.errorText =
                    "Failed to complete item. Server returned " + response.status + " - " + response.statusText;
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function completedItemCount() {
            return vm.filteredTodos().reduce(function(prev, curr) {
                return prev + (curr.isComplete ? 1 : 0);
            }, 0);
        }

        function remainingItemCount() {
            return vm.filteredTodos().length - completedItemCount();
        }

        function clearCompleted() {
            vm.filteredTodos().forEach(function(todo) {
                if (todo.isComplete) {
                    vm.deleteTodo(todo.id);
                }
            });
        }

        function filteredTodos() {
            return vm.todos.filter(vm.filters[vm.currentFilter].fn);
        }

        function getFilters() {
            return Object.keys(vm.filters);
        }
    }
})();
