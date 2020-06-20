//********** Form helper ****************//

var model = document.querySelector('#arg-forecast-model');
var upper = document.querySelector('#update-capacity');
var seasonalityMode = document.querySelector('#arg-seasonality-mode');
var seasonalityTypes = document.querySelectorAll('[name="seasonality_type"]');
var updateChartButton = document.querySelector('#update-chart');

// Show logistic regression options
model.addEventListener('change', function(e){
	if(e.target.value == "logistic") {
		// show the logistic rgression options
		document.querySelector('#logistic-limits').style = "display:block";
		console.log('Show the logistic regression options');
	} else {
		// hide the logistic regressiosn options
		document.querySelector('#logistic-limits').style = "display:none";
	}
});

// show seasonality options
// seasonalityMode.addEventListener('change', function(e){
// 	if(e.target.value != "") {
// 		// show the seasonality options
// 		document.querySelector('#seasonality-options').style = "display:block";
// 		console.log('Show the seasonality options');
// 	} else {
// 		// hide the seasonality options
// 		document.querySelector('#seasonality-options').style = "display:none";
// 		console.log('Hide the seasonality options')
// 	}
// });

// has a seasonality type been checked?
function seasonalityTypeChecked(){ 
	var selected = false;
    seasonalityTypes.forEach(function(e){
    	if (e.checked == true) {
        	selected = true;
    	}
	});
	return selected;
}

// form validation function
updateChartButton.addEventListener('click', function formValidation(e){
	if (model.value == "logistic" && upper.value == "") {
		e.stopImmediatePropagation();
		alert("Upper and lower limit required when using a logistic model");
	} else if (document.querySelector('#update-capacity').value % 1 != 0 || document.querySelector('#update-min-saturation').value % 1 != 0) {
		e.stopImmediatePropagation();
		alert("Upper and lower limits need to be integers");
	} else if (model.value == "logistic" && document.querySelector('#update-capacity').value <= document.querySelector('#update-min-saturation').value) {
		e.stopImmediatePropagation();
		alert('Upper limit must be greater than lower limit');
	}
}) 