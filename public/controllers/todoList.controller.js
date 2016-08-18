/*global angular */

(function() {
    angular
        .module("todoListApp")
        .controller("TodoListController", TodoListController);

    TodoListController.$inject = ["todoListDataService"];

    function TodoListController(todoListDataService) {
        var vm = this;

        vm.todos = [];
        vm.filteredTodos = [];

        vm.reloadTodoList = reloadTodoList;
        vm.createTodo = createTodo;
        vm.deleteTodo = deleteTodo;
        vm.completeTodo = completeTodo;
        vm.completedItemCount = completedItemCount;
        vm.remainingItemCount = remainingItemCount;

        vm.filters = {
            "all": function(item) {
                return true;
            }
        };
        vm.currentFilter = "all";

        vm.todoEntryText = "";
        vm.errorText = "";

        activate();

        function activate() {
            return vm.reloadTodoList();
        }

        function reloadTodoList() {
            return todoListDataService.getTodos().then(function(response) {
                if (response.status === 200) {
                    vm.todos = response.data;
                    vm.filteredTodos = vm.todos.filter(vm.filters[vm.currentFilter]);
                } else {
                    vm.errorText =
                        "Failed to get list. Server returned " + response.status + " - " + response.statusText;
                }
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function createTodo() {
            var title = vm.todoEntryText;
            vm.todoEntryText = "";
            todoListDataService.createTodo(title).then(function(response) {
                if (response.status === 201) {
                    reloadTodoList();
                } else {
                    vm.errorText =
                        "Failed to create item. Server returned " + response.status + " - " + response.statusText;
                }
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function deleteTodo(id) {
            todoListDataService.deleteTodo(id).then(function(response) {
                if (response.status === 200) {
                    reloadTodoList();
                } else {
                    vm.errorText =
                        "Failed to delete item. Server returned " + response.status + " - " + response.statusText;
                }
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function completeTodo(id) {
            todoListDataService.updateTodo(id, {
                    isComplete: true
            }).then(function(response) {
                if (response.status === 200) {
                    reloadTodoList();
                } else {
                    vm.errorText =
                        "Failed to complete item. Server returned " + response.status + " - " + response.statusText;
                }
            }).catch(function(ex) {
                console.log("$http error :-S", ex);
            });
        }

        function completedItemCount() {
            return vm.filteredTodos.reduce(function(prev, curr) {
                return prev + (curr.isComplete ? 1 : 0);
            }, 0);
        }

        function remainingItemCount() {
            return vm.filteredTodos.length - completedItemCount();
        }
    }
})();
