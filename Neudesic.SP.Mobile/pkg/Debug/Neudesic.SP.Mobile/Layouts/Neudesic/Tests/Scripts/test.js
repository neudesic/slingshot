/*
 Copyright (c) 2012 Neudesic, LLC

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

module("Announcements");

test("Get All Announcements", function()
{
    stop();
    var announcements = slingshot.getAnnouncements(function (data) {
            ok(data.length > 0, "More than one announcement returned.");
            start();
        },
        function (error) {
            ok(false, error.message);
            start();
        });
});

test("Get Single Announcement", function()
{
    stop();
    var announcement = slingshot.getAnnouncement(2, function(data){
        ok(data.Id == 2, "Single announcement by ID returned.");
        ok(data.Title, "Announcement with non null title returned.");
        start();
    },
        function(error){
            ok(false, error.message);
            start();
    });
});

test("CRUD Announcement item", function()
{
    var announcementTitle = "Test Announcement from unit test";
    var newAnnouncementTitle = "This announcement was modified by the unit test";

    stop();
    var newAnnouncement = new slingshot.announcement(0, announcementTitle, "This is a test announcement");
    // Create a new task
    slingshot.addAnnouncement(newAnnouncement, function(announcementId, response)
    {
        ok(announcementId > 0, "Non negative Id returned from announcement item creation");
        ok(response.statusCode == 201, "HTTP 201 status code returned from SharePoint");

        // Read the task back
        var announcement = slingshot.getAnnouncement(announcementId, function(data){
                ok(data.Title, "Test announcement with non null title returned.");
                ok(data.Title == announcementTitle, "Title of test announcement was expected");

                // Update the title and send back
                data.Title = newAnnouncementTitle;
                slingshot.modifyAnnouncement(data,function(response)
                {
                    ok(response.statusCode == 204, "Correct 204 Response expected from object merge");
                    // Confirm that the title did change
                    var announcement = slingshot.getAnnouncement(announcementId, function(data){
                        ok(data.Title == newAnnouncementTitle, "Announcement title was confirmed to have changed.");

                        // Delete the task to complete the CRUD operation
                        slingshot.deleteAnnouncement(announcementId, function(response){
                            ok(response.statusCode == 204, "Correct 204 Response expected from object delete");
                            start();
                        }, function(error)
                        {
                            // Error with the delete
                            ok(false, error.message);
                            start();
                        });
                    });
                }, function(error)
                {
                    // Error with the update
                    ok(false, error.message);
                    start();
                });
            },
            function(error){
                // Error with the read
                ok(false, error.message);
                start();
            });
    }, function(error)
    {
        // Error with the create
        ok(false, error.message);
        start();
    });
});

module("Tasks");

test("Get All Tasks", function()
{
    stop();
    var tasks = slingshot.getTasks(function (data) {
            ok(data.length > 0, "More than one task returned.");
            start();
        },
        function (error) {
            ok(false, error.message);
            start();
        });
});

test("Get Single Task", function()
{
    stop();
    var announcement = slingshot.getTask(2, function(data){
            ok(data.Id == 2, "Single task by ID returned.");
            ok(data.Title, "Task with non null title returned.");
            start();
        },
        function(error){
            ok(false, error.message);
            start();
        });
});

test("CRUD Task item", function()
{
    var taskTitle = "Test Task from API";
    var newTaskTitle = "This task was modified by the unit test";

    stop();
    var newTask = new slingshot.task(0, taskTitle, "This is a test task", 0);
    // Create a new task
    slingshot.addTask(newTask, function(taskId, response)
    {
        ok(taskId > 0, "Non negative Id returned from task item creation");
        ok(response.statusCode == 201, "HTTP 201 status code returned from SharePoint");

        // Read the task back
        var announcement = slingshot.getTask(taskId, function(data){
                ok(data.Title, "Test Task with non null title returned.");
                ok(data.Title == taskTitle, "Title of test task was expected");

                // Update the title and send back
                data.Title = newTaskTitle;
                slingshot.modifyTask(data,function(response)
                {
                    ok(response.statusCode == 204, "Correct 204 Response expected from object merge");
                    // Confirm that the title did change
                    var announcement = slingshot.getTask(taskId, function(data){
                        ok(data.Title == newTaskTitle, "Task title was confirmed to have changed.");

                        // Delete the task to complete the CRUD operation
                        slingshot.deleteTask(taskId, function(response){
                            ok(response.statusCode == 204, "Correct 204 Response expected from object delete");
                            start();
                        }, function(error)
                        {
                            // Error with the delete
                            ok(false, error.message);
                            start();
                        });
                    });
                }, function(error)
                {
                    // Error with the update
                    ok(false, error.message);
                    start();
                });
            },
            function(error){
                // Error with the read
                ok(false, error.message);
                start();
            });
    }, function(error)
    {
        // Error with the create
        ok(false, error.message);
        start();
    });
});

module("Documents");

test("Get All Documents", function()
{
    stop();
    var tasks = slingshot.getDocuments(slingshot.rootFolder, function (data, fileCount, folderCount) {
            ok(data.length > 0, "More than one document returned.");
            ok(fileCount > 0, "File count OK");
            ok(folderCount > 0, "Folder count OK");
            start();
        },
        function (error) {
            ok(false, error.message);
            start();
        });
});

test("Upload Document", function()
{
    stop();
    slingshot.uploadDocument('/Shared Documents','test.txt','VGhpcyBpcyBhIHRlc3Q=',function(data, response){
        console.log(data);
        console.log(response);
        ok(response.statusCode == 201, "Correct 201 Response expected from document creation");
        start();
    }, function(error)
    {
        console.log(error);
        ok(false, error.message);
        start();
    });
});

module("People");

test("Get All People", function()
{
    stop();
    var people = slingshot.getPeople(function (data) {
            ok(data.length > 0, "More than one person returned.");
            start();
        },
        function (error) {
            ok(false, error.message);
            start();
        });
});

test("Get Single Person", function()
{
    stop();
    var person = slingshot.getPerson(1, function(data){
            ok(data.Id == 1, "Single person by ID returned.");
            ok(data.Name, "Person with non null name returned.");
            start();
        },
        function(error){
            ok(false, error.message);
            start();
        });
});