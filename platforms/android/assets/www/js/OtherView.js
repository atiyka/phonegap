var OtherView = function() {
	this.initialize = function() {
        this.el = $('<div/>');
        this.el.on('click', '#create-c', this.create);
        this.el.on('click', '#find-c', this.find);
        this.el.on('click', '#delete-c', this.delete);

        this.el.on('click', '#take-picture', this.takePicture);

        this.el.on('click', '#dConfirm', this.confirm);
        this.el.on('click', '#dPrompt', this.prompt);
        this.el.on('click', '#dBeep', this.beep);

        this.el.on('click', '#vib2', this.vibrate2);
        this.el.on('click', '#vib5', this.vibrate5);

        this.el.on('click', '#fRead', this.readFile);
        this.el.on('click', '#fWrite', this.writeFile);
        this.el.on('click', '#fDelete', this.deleteFile);
    };

	this.render = function() {
	    this.el.html(OtherView.template());
	    return this;
	};

	//--------------------------------------------
	// CONTACTS
	//--------------------------------------------
	this.create = function() {
		if (!navigator.contacts) {
	        app.showAlert("Contacts API not supported", "Error");
	        return;
	    }

		var myContact = navigator.contacts.create({"displayName": "Test User"});
		myContact.save(contactSuccess, contactError);

		function contactSuccess() {
		  app.showAlert("Contact is saved!", 'Done')
		}

		function contactError(message) {
		  app.showAlert('Failed because: ' + message, 'Error');
		}
	}

	this.find = function() {
		var options = new ContactFindOptions();
		options.filter = "";
		options.multiple = true;

		fields = ["displayName"];
		navigator.contacts.find(fields, contactfindSuccess, contactfindError, options);

		function contactfindSuccess(contacts) {
		  var container = $('#found-contacts');
		  container.html('');
		  for (var i = 0; i < contacts.length; i++) {
		  	container.append(contacts[i].displayName + '<br />');
		  }
		}

		function contactfindError(message) {
		  app.showAlert('Failed because: ' + message, 'Error');
		}
	}

	this.delete = function() {
		var options = new ContactFindOptions();
		options.filter = "Test User";
		options.multiple = false;
		fields = ["displayName"];

		navigator.contacts.find(fields, contactfindSuccess, contactfindError, options);

		function contactfindSuccess(contacts) {
			var contact = contacts[0];
			contact.remove(contactRemoveSuccess, contactRemoveError);

			function contactRemoveSuccess(contact) {
			   app.showAlert("Contact Deleted", 'Done');
			}

			function contactRemoveError(message) {
			   app.showAlert('Failed because: ' + message, 'Error');
			}
		}

		function contactfindError(message) {
		    app.showAlert('Failed because: ' + message, 'Error');
		}
	}


	//--------------------------------------------
	// CAMERA
	//--------------------------------------------
	this.takePicture = function() {
		var width = window.screen.width - 8;
		console.log(width);
		navigator.camera.getPicture(onSuccess, onFail, { 
		  quality: 50,
		  destinationType: Camera.DestinationType.DATA_URL,
		  targetWidth: width,
		  saveToPhotoAlbum: true
		});

		function onSuccess(imageData) {
		  var image = document.getElementById('my-pic');
		  image.src = "data:image/jpeg;base64," + imageData;
		}

		function onFail(message) {
		  alert('Failed because: ' + message);
		}
	}


	//--------------------------------------------
	// DIALOGS
	//--------------------------------------------
	this.confirm = function(){
		var message = "Am I Confirm Dialog?";
		var title = "CONFIRM";
		var buttonLabels = "Yes,Cancel,No";

		navigator.notification.confirm(message, confirmCallback, title, buttonLabels);

		function confirmCallback(buttonIndex) {
		  app.showAlert("You clicked " + buttonIndex + " button!");
		}
	}

	this.prompt = function(){
		var message = "Am I Prompt Dialog?";
		var title = "PROMPT";
		var buttonLabels = ["OK"];
		var defaultText = "Default"

		navigator.notification.prompt(message, promptCallback, title, buttonLabels, defaultText);

		function promptCallback(result) {
		  app.showAlert("You clicked " + result.buttonIndex + " button! \n" + 
		     "You entered " +  result.input1);
		}
	}

	this.beep = function(){
		var times = 2;
   		navigator.notification.beep(times);
	}

	//--------------------------------------------
	// VIBRATION
	//--------------------------------------------
	this.vibrate2 = function(){
		var pattern = [1000, 500, 1000];
	   	navigator.vibrate(pattern);
	}

	this.vibrate5 = function(){
		var pattern = [100, 500, 300, 500, 700, 500, 300, 500, 100];
	   	navigator.vibrate(pattern);
	}

	//--------------------------------------------
	// FILE SYSTEM
	//--------------------------------------------
	
	this.readFile = function(){
		var type = window.TEMPORARY;
		var size = 5*1024*1024;

		window.requestFileSystem(type, size, successCallback, errorCallback)

		function successCallback(fs) {

		  fs.root.getFile('log.txt', {}, function(fileEntry) {

		     fileEntry.file(function(file) {
		        var reader = new FileReader();

		        reader.onloadend = function(e) {
		           $('#textRead').html(nl2br(this.result));
		        };

		        reader.readAsText(file);

		     }, errorCallback);

		  }, errorCallback);
		}

		function errorCallback(error) {
		  app.showAlert("ERROR: " + error.code)
		}
	}


	this.writeFile = function(){
		var type = window.TEMPORARY;
		var size = 5*1024*1024;

		window.requestFileSystem(type, size, successCallback, errorCallback)

		var self = this;
		function successCallback(fs) {

		  fs.root.getFile('log.txt', {create: true, exclusive: false}, function(fileEntry) {

		     fileEntry.createWriter(function(fileWriter) {
		        fileWriter.onwriteend = function(e) {
		           console.log('Write completed.');
		        };

		        fileWriter.onerror = function(e) {
		           app.showAlert('Write failed: ' + e.toString(), 'Error');
		        };

				var message = "What to write?";
				var title = "Write";
				var buttonLabels = ["OK"];
				var defaultText = ""

				navigator.notification.prompt(message, promptCallback, title, buttonLabels, defaultText);

				function promptCallback(result) {
				  	var blob = new Blob([result.input1+'\n'], {type: 'text/plain'});
		        	
					try {
		                fileWriter.seek(fileWriter.length);
		            }
		            catch (e) {
		                console.log("file doesn't exist!");
		            }
		        	fileWriter.write(blob);
				}
		        
		     }, errorCallback);

		  }, errorCallback);

		}

		function errorCallback(error) {
		  app.showAlert("Code: " + error.code, 'Error')
		}
	}

	this.deleteFile = function(){
		var type = window.TEMPORARY;
		var size = 5*1024*1024;

		window.requestFileSystem(type, size, successCallback, errorCallback)

		function successCallback(fs) {
		  fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

		     fileEntry.remove(function() {
		        app.showAlert('File removed.');
		        $('#textRead').html('');
		     }, errorCallback);

		  }, errorCallback);
		}

		function errorCallback(error) {
		  app.showAlert("ERROR: " + error.code)
		}
	}

    this.initialize();
}

OtherView.template = Handlebars.compile($("#other-tpl").html());

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}