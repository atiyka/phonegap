var EmployeeView = function(employee) {
 	
	this.initialize = function() {
        this.el = $('<div/>');
        this.el.on('click', '.add-location-btn', this.addLocation);
    };

	this.render = function() {
	    this.el.html(EmployeeView.template(employee));
	    return this;
	};

	this.addLocation = function(event) {
	    event.preventDefault();
	    console.log('addLocation');
	    if ("geolocation" in navigator) {
		    navigator.geolocation.getCurrentPosition(
		        function(position) {
		        	console.log('succeed 1');
		            $('.location', this.el).html(position.coords.latitude + ', ' + position.coords.longitude);
		            console.log('succeed 2');
		        },
		        function(error) {
		        	console.log(error.message);
		            app.showAlert('Error getting location', 'Error');
		        });
		} else {
			app.showAlert('Location not supported', 'Error');
		}
	    return false;
	};

    this.initialize();
}

EmployeeView.template = Handlebars.compile($("#employee-tpl").html());