/*global angular */

angular
    .module("todoListApp")
    .factory("todoListDataService", todoListDataService);

todoListDataService.$inject = ["$http"];

function todoListDataService($http) {
    return {
        createTodo: createTodo,
        deleteTodo: deleteTodo,
        updateTodo: updateTodo,
        getTodos: getTodos
    };

    function createTodo(title) {
        return $http({
            method: "POST",
            url: "/api/todo",
            headers: {
                "Content-type": "application/json"
            },
            data: JSON.stringify({
                title: title
            })
        });
    }

    function deleteTodo(id) {
        return $http({
            method: "DELETE",
            url: "/api/todo/" + id
        });
    }

    function updateTodo(id, props) {
        return $http({
            method: "PUT",
            url: "/api/todo/" + id,
            headers: {
                "Content-type": "application/json"
            },
            data: JSON.stringify(props)
        });
    }

    function getTodos() {
        return $http({
            method: "GET",
            url: "/api/todo"
        });
    }
}
