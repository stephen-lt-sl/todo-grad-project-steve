var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        var coveredFiles = ["app.js", "controllers/todoList.controller.js", "services/todoListData.service.js"];
        coveredFiles.forEach(function(filename) {
            router.get("/" + filename, function(req, res) {
                var absPath = path.join(__dirname, "..", "public", filename);
                res.send(instrumenter.instrumentSync(fs.readFileSync("public/" + filename, "utf8"), absPath));
            });
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getCountLabelText = function() {
    return driver.findElement(webdriver.By.id("count-label")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function() {
    var statusText = driver.findElement(webdriver.By.id("statusText"));
    driver.wait(webdriver.until.elementIsVisible(statusText), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.addGenericTodos = function(todoCount) {
    for (var item = 0; item < todoCount; item++) {
        driver.findElement(webdriver.By.id("new-todo")).sendKeys("Todo item " + item.toString());
        driver.findElement(webdriver.By.id("submit-todo")).click();
    }
};

module.exports.deleteTodo = function(id) {
    driver.findElement(webdriver.By.id("deleteButton-" + id.toString())).click();
};

module.exports.completeTodo = function(id) {
    driver.findElement(webdriver.By.id("completeButton-" + id.toString())).click();
};

module.exports.clearCompleted = function(id) {
    driver.findElement(webdriver.By.id("clear-complete-button")).click();
};

module.exports.setListFilter = function(filterType) {
    driver.findElement(webdriver.By.id("filter-" + filterType)).click();
};

module.exports.isCompleted = function(id) {
    return module.exports.getTodoList().then(function(elements) {
        return driver
            .findElement(webdriver.By.id("todoItem-" + id))
            .findElement(webdriver.By.className("completedTodoItem"));
    }).then(function(element) {
        return true;
    }, function(element) {
        return false;
    });
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        router.delete(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "put") {
        router.put(route, function(req, res) {
            res.sendStatus(500);
        });
    }
};
