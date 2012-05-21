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

var slingshot;
slingshot = new
    function () {
        // private methods and properties
        var Debug = function (sender, message) {
            if (slingshot.verbose) {
                console.log([new Date().getTime(), " : ", "slingshot.", sender, " : ", message].join(""));
            }
        };

        var Error = function (sender, message) {
            console.error([new Date().getTime(), " : ", "slingshot.", sender, " : ", message].join(""));
        };

        // public variables
        this.verbose = true;
        this.announcementsUri = '/_vti_bin/listdata.svc/Announcements';
        this.tasksUri = '/_vti_bin/listdata.svc/Tasks';
        this.documentsUri = '/_vti_bin/listdata.svc/SharedDocuments';
        this.userInformationUri = '/_vti_bin/listdata.svc/UserInformationList';
        this.rootFolder = '/Shared Documents';

        // Function to retrieve an ODATA object by Id
        var getObject = function(uri, id, callback, errorCallback)
        {
            Debug('getObject',[uri,id].join(','));
            OData.request({
                requestUri:[uri, '(', id, ')'].join('')
            }, function (data) {
                callback(data);
            }, function (error) {
                errorCallback(error);
            });
        };

        // Function to retrieve an array of ODATA objects
        var getObjects = function(uri, callback, errorCallback)
        {
            Debug('getObjects',[uri].join(','));
            OData.request({
                requestUri:uri
            }, function (data) {
                callback(data);
            }, function (error) {
                errorCallback(error);
            });
        };

        // Function to add an ODATA object
        var addObject = function(uri, newObject, callback, errorCallback)
        {
            Debug('addObject',[uri, newObject.Id, newObject.Title].join(','));
            OData.request({
                requestUri:uri,
                method:"POST",
                data: newObject
            }, function (data, response)
            {
                callback(data, response);
            }, function (error)
            {
                errorCallback(error);
            });
        };

        // Function to modify an ODATA object
        var modifyObject = function(uri, modifiedObject, callback, errorCallback)
        {
            Debug('modifyObject',[uri, modifiedObject.Id, modifiedObject.Title].join(','));
            OData.request({
                requestUri:[uri, '(', modifiedObject.Id, ')'].join(''),
                method:"POST",
                headers:{"X-HTTP-Method":"MERGE","If-Match":"*"},
                data: modifiedObject
            }, function (data,response)
            {
                callback(response);
            }, function (error)
            {
                errorCallback(error);
            });
        };

        // Function to delete an ODATA object
        var deleteObject = function(uri, id, callback, errorCallback)
        {
            Debug('deleteObject',[uri, id].join(','));
            OData.request({
                requestUri:[uri, '(', id, ')'].join(''),
                method:"POST",
                headers:{"X-HTTP-Method":"DELETE","If-Match":"*"}
            }, function (data,response)
            {
                callback(response);
            }, function (error)
            {
                errorCallback(error);
            });
        };

        // Used to map ODATA objects directly to JS Announcement objects
        var mapAnnouncement = function(data)
        {
            return new slingshot.announcement(data.Id, data.Title, data.Body);
        }

        // JS class for a sharepoint announcement
        this.announcement = function (Id, Title, Body) {
            this.Id = Id;
            this.Title = Title;
            this.Body = Body;
        };

        // Used to map ODATA objects directly to JS Task objects
        var mapTask = function(data)
        {
            return new slingshot.task(data.Id, data.Title, data.Description, data.Complete);
        };

        // JS class for a sharepoint task
        this.task = function (Id, Title, Description, Complete) {
            this.Id = Id;
            this.Title = Title;
            this.Description = Description;
            this.Complete = Complete;
        };

        // JS class for a sharepoint file
        this.file = function (id, name, path) {
            this.id = id;
            this.name = name;
            this.path = path;
            this.isFolder = false;
        };

        // JS class for a sharepoint folder
        this.folder = function (id, name, path) {
            this.id = id;
            this.name = name;
            this.path = path;
            this.isFolder = true;
        };

        // Used to map ODATA objects directly to JS Person objects
        var mapPerson = function(data)
        {
            return new slingshot.person(data.Id, data.Name, data.Department, data.JobTitle, data.EMail);
        };

        // JS class for a person
        this.person = function(Id, Name, Department, JobTitle, Email) {
            this.Id = Id;
            this.Name = Name;
            this.Department = Department;
            this.JobTitle = JobTitle;
            this.Email = Email;
        };

        // Function to retrieve a single announcement by Id
        this.getAnnouncement = function (id, callback, errorCallback) {
            getObject(this.announcementsUri, id, function(data)
                {
                    callback(mapAnnouncement(data));
                },
                function(error){
                    errorCallback(error);
                });
        };

        // Function to retrieve an array of all announcements
        this.getAnnouncements = function (callback, errorCallback) {
            var announcements = new Array();
            getObjects(this.announcementsUri, function(data){
                $.each(data, function (index, value) {
                    for (var x in value) {
                        var announcement = mapAnnouncement(value[x]);
                        announcements.push(announcement);
                    }
                });
                callback(announcements);
            }, function(error){
                errorCallback(error);
            });
        };

        // Function to create a new announcement
        this.addAnnouncement = function (newAnnouncement, callback, errorCallback)
        {
            addObject(this.announcementsUri, newAnnouncement, function(data, response){
                callback(data.Id, response);
            }, function (error){
                errorCallback(error);
            });
        };

        // Function to modify an announcement
        this.modifyAnnouncement = function(modifiedAnnouncement, callback, errorCallback)
        {
            modifyObject(this.announcementsUri, modifiedAnnouncement, function(response){
                callback(response);
            }, function(error){
                errorCallback(error);
            });
        };

        // Function to delete an announcement
        this.deleteAnnouncement = function(id, callback, errorCallback)
        {
            deleteObject(this.announcementsUri, id, function(response)
            {
                callback(response);
            }, function(error)
            {
                errorCallback(error);
            });
        };

        // Function to retrieve a single task by Id
        this.getTask = function (id, callback, errorCallback) {
            getObject(this.tasksUri, id, function(data)
            {
                callback(mapTask(data));
            },
            function(error){
                errorCallback(error);
            });
        };

        // Function to retrieve an array of all tasks
        this.getTasks = function (callback, errorCallback) {
            var tasks = new Array();
            getObjects(this.tasksUri, function(data){
                $.each(data, function (index, value) {
                    for (var x in value) {
                        var task = mapTask(value[x]);
                        tasks.push(task);
                    }
                });
                callback(tasks);
            }, function(error){
                errorCallback(error);
            });
        };

        // Function to create a new task
        this.addTask = function (newTask, callback, errorCallback)
        {
            addObject(this.tasksUri, newTask, function(data, response){
                callback(data.Id, response);
            }, function (error){
                errorCallback(error);
            });
        };

        // Function to modify a task
        this.modifyTask = function(modifiedTask, callback, errorCallback)
        {
            modifyObject(this.tasksUri, modifiedTask, function(response){
                callback(response);
            }, function(error){
                errorCallback(error);
            });
        };

        // Function to delete a task
        this.deleteTask = function(id, callback, errorCallback)
        {
            deleteObject(this.tasksUri, id, function(response)
            {
                callback(response);
            }, function(error)
            {
                errorCallback(error);
            });
        };

        // Function to retrieve a single user by Id
        this.getPerson = function (id, callback, errorCallback) {
            getObject(this.userInformationUri, id, function(data)
                {
                    callback(mapPerson(data));
                },
                function(error){
                    errorCallback(error);
                });
        };

        // Function to retrieve an array of all users
        this.getPeople = function (callback, errorCallback) {
            var people = new Array();
            getObjects(this.userInformationUri, function(data){
                $.each(data, function (index, value) {
                    for (var x in value) {
                        if (value[x].ContentType == "Person")
                        {
                            var person = mapPerson(value[x]);
                            people.push(person);
                        }
                    }
                });
                callback(people);
            }, function(error){
                errorCallback(error);
            });
        };

        // Function to retrieve an array of all documents
        this.getDocuments = function (folder, callback, errorCallback) {
            var documents = new Array();
            var fileCount = 0;
            var folderCount = 0;
            getObjects(this.documentsUri, function(data){
                $.each(data, function (index, value) {
                    for (var x in value) {
                        // Look for files on the current path
                        if ((value[x].Path == folder) && (value[x].ContentType == "Document")) {
                            var newFile = new slingshot.file(value[x].Id, value[x].Name, value[x].Path);
                            documents.push(newFile);
                            fileCount++;
                        }
                        // Display folders on the current path
                        if ((value[x].Path == folder) && (value[x].ContentType == "Folder")) {
                            var newFolder = new slingshot.folder(value[x].Id, value[x].Name, value[x].Path);
                            documents.push(newFolder);
                            folderCount++;
                        }
                    }
                });
                callback(documents, fileCount, folderCount);
            }, function(error){
                errorCallback(error);
            });
        };
    };

