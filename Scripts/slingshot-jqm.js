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

var DEBUG_ANDROID_THEME = false;

// Function to strip the HTML from a task description
function stripHTML(content)
{
    if (content == null)
    {
        return null;
    }

    if (content.indexOf('<') == 0)
    {
        return $(content).text();
    }
    else
    {
        // Doesn't look like HTML to me
        return content;
    }
}
// Function to show any errors correctly
function showError(listviewElement, errorMessage) {
    if (!errorMessage) errorMessage = "Sorry, an error occurred.  Please check the console log.";
    $(listviewElement).empty();
    $(listviewElement).append(['<li>', errorMessage, '</li>'].join(''));
    $(listviewElement).listview('refresh');
}

// Function to show the details of a single announcement
function showAnnouncement(id) {
    slingshot.getAnnouncement(id, function (data) {
            $('#announcement-id').val(id);
            $('#announcement-title').val(data.Title);
            if (data.Body != null)
            {
                $('#announcement-body').val(stripHTML(data.Body));
            }
            else
            {
                $('#announcement-body').val('');
            }

            $.mobile.changePage('#announcement-details');
        },
        function (error) {
            console.log(error);
        });
}

// Function to display all announcements updating the list view and footer elements
function showAnnouncements(showDeleteIcon) {
    slingshot.getAnnouncements(function (data) {
            $('#announcements-listview').empty();
            for (var x in data) {
                if (showDeleteIcon)
                {
                    $('#announcements-listview').append(['<li data-icon="delete"><a href="javascript:deleteAnnouncement(', data[x].Id, ');">', data[x].Title, '</a></li>'].join(''));
                }
                else
                {
                    $('#announcements-listview').append(['<li><a href="javascript:showAnnouncement(', data[x].Id, ');">', data[x].Title, '</a></li>'].join(''));
                }
            }
            $('#announcements-listview').listview('refresh');
            $('#announcements-footer-text').text([data.length, ' announcement(s) found'].join(''));
        },
        function (error) {
            showError('#announcements-listview');
        });
}

// Function to show a blank task form for addition
function addAnnouncement()
{
    $('#announcement-id').val(-1);  //indicate that this is a new appointment that needs adding
    $('#announcement-title').val('');
    $('#announcement-body').val('');

    $.mobile.changePage('#announcement-details');
}

// Function to respond if cancel button on announcment is pressed
function cancelAnnouncement()
{
    $('#announcement-id').val(0);  // indicate that no action is to be taken
    history.back();  // click the back button
}

function deleteAnnouncement(id){
    if (confirm("Delete this announcement?"))
    {
        slingshot.deleteAnnouncement(id, function(response){
            showAnnouncements();
        });
    }
    else
    {
        // Exit delete mode
        showAnnouncements();
    }
}

// Function to check whether the announcement has been modified and needs updating
function checkIfAnnouncementNeedsUpdating(){
    // get the announcement to do a compare
    var displayedAnnouncement = new slingshot.announcement($('#announcement-id').val(), $('#announcement-title').val(), $('#announcement-body').val());

    // Check if this is a new announcement to be added
    if (displayedAnnouncement.Id == -1)
    {
        if (displayedAnnouncement.Title != '')  // check for mandatory fields
        {
            // New task to be added
            slingshot.addAnnouncement(displayedAnnouncement, function(response){
                $('#announcements-footer-text').text([$('#announcements-footer-text').text(),' - Updating...'].join(''));
                // refresh the list of tasks in case the title was changed
                showAnnouncements();
            }, function(error){
                $('#announcements-footer-text').text("Announcement could not be updated.  Please check log.");
                console.log(error);
            });
        }
    }

    // Check if this is a task that needs modifying
    if (displayedAnnouncement.Id > 0)
    {
        slingshot.getAnnouncement(displayedAnnouncement.Id, function(data){
            var needsUpdating;
            if (displayedAnnouncement.Title != data.Title) needsUpdating = true;
            if (displayedAnnouncement.Body != stripHTML(data.Body)) needsUpdating = true;

            if (needsUpdating)
            {
                slingshot.modifyAnnouncement(displayedAnnouncement, function(response)
                {
                    $('#announcements-footer-text').text([$('#announcements-footer-text').text(),' - Updating...'].join(''));
                    // refresh the list of tasks in case the title was changed
                    showAnnouncements();
                }, function(error)
                {
                    $('#announcements-footer-text').text("Announcement could not be updated.  Please check log.");
                    console.log(error);
                });
            }
        });
    }
}
// Function to show the details of a single task
function showTask(id) {
    slingshot.getTask(id, function (data) {
            $('#task-id').val(id);
            $('#task-title').val(data.Title);
            if (data.Description != null)
            {
                $('#task-description').val(stripHTML(data.Description));
            }
            else
            {
                $('#task-description').val('');
            }

            $.mobile.changePage('#task-details');
            var assignedToPerson = slingshot.getPerson(data.AssignedToId, function(person){
                $('#task-assignedTo').val(person.Name);
            }, function(error){
                console.log(error);
            });
            $('#task-pct-complete').val(data.Complete * 100).slider('refresh');
            $('#task-status').val(data.StatusValue);
            $('#task-outcome').val(data.Outcome);
        },
        function (error) {
            console.log(error);
        });
}

// Function to show the details of a single workflow task
function showWorkflowTask(id) {
    slingshot.getTask(id, function (data) {
            $('#workflow-task-id').val(id);
            $('#workflow-task-title').val(data.Title);
            if (data.Description != null)
            {
                $('#workflow-task-description').val(stripHTML(data.Description));
            }
            else
            {
                $('#workflow-task-description').val('');
            }

            $.mobile.changePage('#workflow-task-details');
            //$('#workflow-task-pct-complete').val(data.Complete * 100).slider('refresh');
            $('#workflow-task-status').val(data.StatusValue);
            var assignedToPerson = slingshot.getPerson(data.AssignedToId, function(person){
                $('#workflow-task-assignedTo').val(person.Name);
            }, function(error){
                console.log(error);
            });

            var dateValue = new Date(parseInt(data.DueDate.substr(6)));
            var displayDate = dateValue.format("mm/dd/yyyy");
            $('#workflow-task-due-date').val(displayDate);
            $('#workflow-task-relatedContent').val(data.RelatedContent.substring(0, data.RelatedContent.lastIndexOf(',')));
            if(data.Outcome!=null)
            {
                $('#workflow-task-outcome').val(data.Outcome);
            }
            else
            {
                $('#workflow-task-outcome').val('');
            }

            $('#workflow-approve-button').unbind();
            $('#workflow-approve-button').bind("click",{Param1:data}, function(event){
                approveDocument(event.data.Param1);
            });

            $('#workflow-reject-button').unbind();
            $('#workflow-reject-button').bind("click", {Param1:data}, function(event){
                rejectDocument(event.data.Param1);
            });

            $('#workflow-document-button').unbind();
            $('#workflow-document-button').bind("click",function(){
                window.open(data.RelatedContent.substring(0,data.RelatedContent.lastIndexOf(',')));
            });

        },
        function (error) {
            console.log(error);
        });
}

//Function to approve a document in an approval workflow
function approveDocument(data){
    data.Outcome="Approved";
    data.Complete=1.00;
    data.StatusValue="Completed";
    var dateValue = new Date(parseInt(data.DueDate.substr(6)));
    data.DueDate=dateValue.format("isoDateTime");
    
    slingshot.updateApprovalItem("Tasks", data, 0, function(data, response)
    {
        // Successful update - let's refresh the task list
        showTasks();
        $.mobile.changePage('#tasks');
    }, function(error)
    {
        console.log(error);
    });
}

//Function to reject a document in an approval workflow
function rejectDocument(data){
    data.Outcome="Rejected";
    data.Complete=1.00;
    data.StatusValue="Completed";
    var dateValue = new Date(parseInt(data.DueDate.substr(6)));
    data.DueDate=dateValue.format("isoDateTime");
    slingshot.updateApprovalItem("Tasks", data, 1, function(data, response)
    {
        // Successful update - let's refresh the task list
        showTasks();
        $.mobile.changePage('#tasks');
    }, function(error)
    {
        console.log(error);
    });
}
// Function to display all tasks updating the list view and footer elements
function showTasks(showDeleteIcon) {
    slingshot.getTasks(function (data) {
            $('#tasks-listview').empty();
            for (var x in data) {
                if (showDeleteIcon)
                {
                    $('#tasks-listview').append(['<li data-icon="delete"><a href="javascript:deleteTask(', data[x].Id, ');">', data[x].Title, '</a></li>'].join(''));
                }
                if(data[x].ContentType.substring(0,8)=="Approval")//data[x].ContentType.contains('Approval') )//data[x] is an approval task
                {
                    $('#tasks-listview').append(['<li><a href="javascript:showWorkflowTask(', data[x].Id, ');">', data[x].Title, '</a></li>'].join(''));
                }
                else
                {
                    $('#tasks-listview').append(['<li><a href="javascript:showTask(', data[x].Id, ');">', data[x].Title, '</a></li>'].join(''));
                }
            }
            $('#tasks-listview').listview('refresh');
            $('#tasks-footer-text').text([data.length, ' task(s) found'].join(''));
        },
        function (error) {
            showError('#tasks-listview');
        });
}

// Function to show a blank task form for addition
function addTask()
{
    $('#task-id').val(-1);  //indicate that this is a new task that needs adding
    $('#task-title').val('');
    $('#task-description').val('');

    $.mobile.changePage('#task-details');
    $('#task-pct-complete').val(0).slider('refresh');
}

// Function to respond if cancel button on task is pressed
function cancelTask()
{
    $('#task-id').val(0);  // indicate that no action is to be taken
    history.back();  // click the back button
}

function deleteTask(id){
    if (confirm("Delete this task?"))
    {
        slingshot.deleteTask(id, function(response){
            showTasks();
        });
    }
    else
    {
        // Exit delete mode
        showTasks();
    }
}

// Function to check whether the task has been modified and needs updating
function checkIfTaskNeedsUpdating(){
    // get the task to do a compare
    var displayedTask = new slingshot.task($('#task-id').val(), $('#task-title').val(), $('#task-description').val(), $('#task-pct-complete').val() / 100, $('#task-status').val());

    // Check if this is a new task to be added
    if (displayedTask.Id == -1)
    {
        if (displayedTask.Title != '')  // check for mandatory fields
        {
            // New task to be added
            slingshot.addTask(displayedTask, function(response){
                $('#tasks-footer-text').text([$('#tasks-footer-text').text(),' - Updating...'].join(''));
                // refresh the list of tasks in case the title was changed
                showTasks();
            }, function(error){
                $('#tasks-footer-text').text("Task could not be updated.  Please check log.");
                console.log(error);
            });
        }
    }

    // Check if this is a task that needs modifying
    if (displayedTask.Id > 0)
    {
        slingshot.getTask(displayedTask.Id, function(data){
            var needsUpdating;
            if (displayedTask.Title != data.Title) needsUpdating = true;
            if (displayedTask.Description != stripHTML(data.Description)) needsUpdating = true;
            if (displayedTask.Complete != data.Complete) needsUpdating = true;
            if(displayedTask.StatusValue != data.StatusValue) needsUpdating = true;

            if (needsUpdating)
            {
                slingshot.modifyTask(displayedTask, function(response)
                {
                    $('#tasks-footer-text').text([$('#tasks-footer-text').text(),' - Updating...'].join(''));
                    // refresh the list of tasks in case the title was changed
                    showTasks();
                }, function(error)
                {
                    $('#tasks-footer-text').text("Task could not be updated.  Please check log.");
                    console.log(error);
                });
            }
        });
    }
}

// Function to show the details of a single person
function showPerson(id) {
    slingshot.getPerson(id, function (data) {
            $('#person-id').val(id);
            $('#person-name').val(data.Name);
            if (data.JobTitle != null)
            {
                $('#person-jobTitle').val(data.JobTitle);
            }
            else
            {
                $('#person-jobTitle').val('');
            }
            if (data.Department != null)
            {
                $('#person-department').val(data.Department);
            }
            else
            {
                $('#person-department').val('');
            }

            $('#person-gravatar').hide();
            if (data.Email)
            {
                $('#person-email').attr('href', ['mailto:',data.Email].join(''));
                try
                {
                    $('#person-gravatar').attr('src',['http://www.gravatar.com/avatar/',MD5(data.Email)].join(''));
                    $('#person-gravatar').show();
                }
                catch (err)
                {
                    // no reference to MD5 library to work out hash for gravatars
                }
            }

            $.mobile.changePage('#person-details');
        },
        function (error) {
            console.log(error);
        });
}

// Function to display all users updating the list view and footer elements
function showPeople() {
    slingshot.getPeople(function (data) {
            $('#people-listview').empty();
            for (var x in data) {
                $('#people-listview').append(['<li><a href="javascript:showPerson(', data[x].Id, ');">', data[x].Name, '</a></li>'].join(''));
            }
            $('#people-listview').listview('refresh');
            $('#people-footer-text').text([data.length, ' people found'].join(''));
        },
        function (error) {
            showError('#people-listview');
        });
}

// var for the current folder
var currentFolder = slingshot.rootFolder;

// Function to display all documents
function showDocuments(folder) {
    if (!folder) folder = slingshot.rootFolder;
    currentFolder = folder;
    slingshot.getDocuments(folder, function (data, fileCount, folderCount) {
        $('#shareddocuments-listview').empty();
        // do we need to add an up folder?
        if (folder != slingshot.rootFolder) {
            $('#shareddocuments-listview').append('<li data-icon="false"><a href="javascript:showDocuments(\'' + encodeURIComponent(folder.substring(0, folder.lastIndexOf(('/')))) + '\')">..</a></li>');
        }
        for (var x in data) {
            if (data[x].isFolder) {
                $('#shareddocuments-listview').append(['<li><a href="javascript:showDocuments(\'', encodeURIComponent(data[x].path + '/' + data[x].name), '\');">', data[x].name, '</a></li>'].join(''));
            }
            else {
                $('#shareddocuments-listview').append(['<li data-icon="false"><a rel="external" target="_blank" href="' + data[x].path + '/' + data[x].name + '">', data[x].name, '</a></li>'].join(''));
            }
        }
        $('#shareddocuments-listview').listview('refresh');
        $('#shareddocuments-footer-text').text([fileCount, ' file(s), ', folderCount, ' folder(s) found'].join(''));
    }, function (error) {
        showError('#shareddocuments-listview');
    });
}

// Function to add a photo through Cordova
function addPhoto(imageSourceType){
    navigator.camera.getPicture(getPictureSuccess, getPictureError, { sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.DATA_URL });
}

function getPictureSuccess(imageData) {
    //TODO: Move to FT.upload once authentication is supported in Cordova
    slingshot.uploadDocument(currentFolder, 'photo.jpg', imageData, function(data, response)
    {
        // Successful upload - let's refresh the file list
        showDocuments(currentFolder);
    }, function(error)
    {
        console.log(error);
    });
}

var getPictureError = function(message)
{
    console.log(message);
};

/*function updateOnlineStatus(newStatus)
{
    if (newStatus != onlineStatus)
    {
        onlineStatus = newStatus;
        if (onlineStatus)
        {
            $('#offline-status').text('SharePoint server is online');
        }
        else
        {
            $('#offline-status').text('SharePoint server is offline');
        }
    }
}

// Task function for background detection of network state
function offlineDetectionTask()
{
    setTimeout(function() {
        $.get('Scripts/pingtest.js', function(data){})
            .success(function(){
                updateOnlineStatus(true);
            })
            .error(function(){
                updateOnlineStatus(false)});
        offlineDetectionTask();
    } , 5000);
}*/

// Init function that runs on Cordova-enabled applications
function onDeviceReady()
{
    console.log("onDeviceReady - Cordova is ready to go");

    // tell Slingshot that it's running in a Cordova wrapper
    slingshot.runningInCordova = true;

    // Cordova is installed and ready to run - enable any device specific UI hooks
    $('#documents-photo-button').show();
    $('#logout-button').show();
    $('#logout-button').click(function(){
        //TODO - clear the credentials
        $.mobile.changePage("login.html", { transition: "slideup"});
    });
    $('#offline-status').show();

    $('#login-home').live('pagecreate',function()
    {
        $('#login-form input:submit').click(function(event){
            event.preventDefault();
            var validCredentials = true;

            slingshot.username = $('#username-title').val();
            if (slingshot.username == "")
            {
                validCredentials = false;
                alert("Please enter a valid username");
                $('#username-title').focus();
                return;
            }
            slingshot.password = $('#password-title').val();
            if (slingshot.password == "")
            {
                validCredentials = false;
                alert("Please enter your password");
                $('#password-title').focus();
                return;
            }
            slingshot.server = $('#slingshot-host').val();
            if (slingshot.server == "")
            {
                validCredentials = false;
                alert("Please enter the server name");
                $('#slingshot-host').focus();
                return;
            }
            //TODO - check that these are valid credentials - use a simple AJAX call to the server
            //TODO - add an offline check box also
            //Update the offline status accordingly
            $('#offline-status').text('Connected to '+slingshot.server);

            if (validCredentials) $.mobile.changePage("index.html", { transition: "slidedown"});
        });
    });

    // redirect to the Cordova login page
    $.mobile.changePage("login.html");
}

function isAndroid(){
    return navigator.userAgent.indexOf("Android") > 0;
}

function isiOS(){
    return ( navigator.userAgent.indexOf("iPhone") > 0 || navigator.userAgent.indexOf("iPad") > 0);
}

$('#home').live('pagecreate', function(){
    console.log("Welcome to Slingshot!");

    if(isAndroid()){
        console.log("android detected");
        DEBUG_ANDROID_THEME = true;
        $("script").attr("src", "Styles/Android/jquery.mobile.android-theme.js").appendTo("head");
        $("script").attr("src", "Scripts/Android/cordova-1.8.1.js").appendTo("head");
    }else if(isiOS()){
        console.log("ios detected");
        $("script").attr("src", "Scripts/iOS/cordova-1.8.1.js").appendTo("head");
    }

    console.log("Adding event listener for Cordova");
    document.addEventListener("deviceready", onDeviceReady, false);
});
$('#announcements').live('pageshow', function () {
    showAnnouncements();
});
$('#announcement-details').live('pageshow', function() {
    if (!$('#announcement-id').val())
    {
        $.mobile.changePage('#announcements');
    }
});
$('#announcement-details').live('pagehide', function(){
    checkIfAnnouncementNeedsUpdating();
});
$('#announcements-listview').live('swipeleft',function(){
    showAnnouncements(true);
});
$('#announcements-listview').live('swiperight',function(){
    showAnnouncements();
});
$('#tasks').live('pageshow', function () {
    showTasks();
});
$('#task-details').live('pageshow', function() {
    if (!$('#task-id').val())
    {
        $.mobile.changePage('#tasks');
    }
});
$('#task-details').live('pagehide', function(){
    checkIfTaskNeedsUpdating();
});
$('#tasks-listview').live('swipeleft',function(){
    showTasks(true);
});
$('#tasks-listview').live('swiperight',function(){
    showTasks();
});
$('#documents').live('pageshow', function () {
    showDocuments();
});
$('#people').live('pageshow', function () {
    showPeople();
});
$('#person-details').live('pageshow', function() {
    if (!$('#person-id').val())
    {
        $.mobile.changePage('#people');
    }
});
