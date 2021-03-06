var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays uncompleted TODO item count", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                helpers.getCountLabelText().then(function(text) {
                    assert.equal(text, "0 items remaining.");
                });
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(2);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
        testing.it("increments uncompleted TODO item count", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.getCountLabelText().then(function(text) {
                    assert.equal(text, "1 item remaining.");
                });
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("removes an item", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.deleteTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("delete", "/api/todo/*");
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.deleteTodo("0");
            });
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to delete item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(2);
            helpers.getTodoList().then(function(elements) {
                helpers.deleteTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.deleteTodo("1");
            });
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
    });
    testing.describe("on complete todo item", function() {
        testing.it("item remains in list", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("put", "/api/todo/*");
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to complete item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("shows list item as completed", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.isCompleted("0").then(function(complete) {
                assert.isTrue(complete);
            });
        });
        testing.it("decrements uncompleted TODO item count", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.getCountLabelText().then(function(text) {
                    assert.equal(text, "0 items remaining.");
                });
            });
        });
    });
    testing.describe("on clear completed items", function() {
        testing.it("completed item removed from list", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(1);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.clearCompleted();
            });
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("uncompleted item remains in list", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(2);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.clearCompleted();
            });
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
    });
    testing.describe("on select filter", function() {
        testing.it("all filter does not affect list", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(3);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("1");
            });
            helpers.setListFilter("all");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 3);
            });
        });
        testing.it("active filter shows only incomplete items", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(3);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("1");
            });
            helpers.setListFilter("active");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("completed filter shows only complete items", function() {
            helpers.navigateToSite();
            helpers.addGenericTodos(3);
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("0");
            });
            helpers.getTodoList().then(function(elements) {
                helpers.completeTodo("1");
            });
            helpers.setListFilter("completed");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
});
