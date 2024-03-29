$(document).ready(function() {
	// **** Connect SocketIO **** //
	// start up a SocketIO connection to the server - http(s):// needs to be set as http when run locally, and https when pushed to production.
	var socket = io.connect('https://' + document.domain + ':' + location.port);
	// The callback function is invoked when a connection with the server is established.
	socket.on('connect', function() {
		// Successful connection message
		socket.emit('connection_msg', {
			data: 'I\'m connected!'
		});
	});
	// **** DOWNLOAD FORECAST FUNCTION AS A CSV **** //
	function convertArrayOfObjectsToCSV(args) {
		var result, ctr, keys, columnDelimiter, lineDelimiter, data;
		data = args.data || null;
		if (data == null || !data.length) {
			return null;
		}
		columnDelimiter = args.columnDelimiter || ',';
		lineDelimiter = args.lineDelimiter || '\n';
		keys = Object.keys(data[0]);
		result = '';
		result += keys.join(columnDelimiter);
		result += lineDelimiter;
		data.forEach(function(item) {
			ctr = 0;
			keys.forEach(function(key) {
				if (ctr > 0) result += columnDelimiter;
				result += item[key];
				ctr++;
			});
			result += lineDelimiter;
		});
		return result;
	}
	// send data from ga api call
	var ga_result;
	var APIMetric;

	function sendGaData() {
		// selected metric  
		var APIMetricName = document.querySelector('#ga-metrics').value;
		// custom metric value
		var customAPIMetricName = document.querySelector('#custom-metric').value;
		// metric to use in API call
		if (!customAPIMetricName) {
			APIMetric = APIMetricName;
		} else {
			APIMetric = customAPIMetricName;
		}
		gapi.client.request({
			path: '/v4/reports:batchGet',
			root: 'https://analyticsreporting.googleapis.com/',
			method: 'POST',
			body: {
				reportRequests: [{
					includeEmptyRows: 'true',
					viewId: document.querySelectorAll(".ViewSelector2-item select")[2].value, // change this to document.querySelectorAll(".ViewSelector2-item select")[2].value
					dateRanges: [{
						startDate: document.querySelectorAll('.DateRangeSelector-item input')[0].value,
						endDate: document.querySelectorAll('.DateRangeSelector-item input')[1].value
					}],
					metrics: [{
						expression: APIMetric
					}],
					dimensions: [{
						name: 'ga:date'
					}]
				}]
			}
		}).then(displayResults, console.error.bind(console));
	}

	function displayResults(response) {
		var formattedJson = JSON.stringify(response.result, null, 2);
		ga_result = formattedJson;
		var ga_result_json = JSON.parse(ga_result);
		ga_data = ga_result_json.reports[0].data.rows.map(function(x) {
			return {
				Date: x.dimensions.toString(),
				[APIMetric]: parseInt(x.metrics[0].values[0])
			}
		})
		console.log(ga_data)
		socket.emit('send_csv', {
			data: ga_data
		});
		$('.nav-tabs a[href="#three"]').tab('show')
		window.scrollTo(0, 0);
		window.dataLayer.push({
		'event': 'GA data uploaded'
		});
	}
	$(document).on("click", "#review-ga-data", sendGaData)
	// function to get list of segments
	function listSegments() {
		var request = gapi.client.analytics.management.segments.list();
		request.execute(addOptions);
	}

	function addOptions(results) {
		if (results && !results.error) {
			var segments = results.items;
			var segmentList = [];
			for (var i = 0, segment; segment = segments[i]; i++) {
				segmentList.push({
					'option': segment.name,
					'id': segment.id
				});
			}
			console.log(segmentList);
			var select = document.getElementById("custom-segment");
			var options = segmentList;
			options.forEach(function(segment) {
				var opt = segment.option;
				var id = segment.id;
				var el = document.createElement("option");
				el.textContent = opt;
				el.value = id;
				select.appendChild(el);
			});
		}
	}
	$('#more-ga-options-button').on('click', function() {
		listSegments();
	})
	// Reload function
	$('#reload-button').on('click', function() {
		// Refresh the app
		$('.nav-tabs a[href="#two"]').tab('show')
	});
	// show more forecast options
	$('#more-forecast-options-button').on('click', function() {
		// Refresh the app
		$('#more-forecast-options').slideDown();
		$('#more-forecast-options-button').hide();
	});
	// Show advanced GA options
	$('#more-ga-options-button').on('click', function() {
		// Refresh the app
		$('#more-ga-options').slideDown();
		$('#ga-metrics').hide();
		$('#more-ga-options-button').hide();
		$('#fewer-ga-options-button').show();
	});
	// Hide advanced GA options
	$('#fewer-ga-options-button').on('click', function() {
		// Refresh the app
		$('#more-ga-options').slideUp();
		$('#ga-metrics').show();
		$('#more-ga-options-button').show();
		$('#fewer-ga-options-button').hide();
		$('#custom-metric')[0].value = "";
	});
	// Back to GA button
	$('#ga-data').on('click', function() {
		// Refresh the app
		$('.nav-tabs a[href="#two"]').tab('show')
	});
	// Back to preview button
	$('#review-data').on('click', function() {
		// Refresh the app
		$('.nav-tabs a[href="#three"]').tab('show')
	});
	// Configure Forecast
	$('#configure-forecast').on('click', function() {
		// Refresh the app
		$('.nav-tabs a[href="#four"]').tab('show')
	});
	// show logistic regression options
	$('[value="logistic"]').on('click', function() {
		// Refresh the app
		$('#logistic-regression-options').slideDown();
	});
	$('[value="linear"]').on('click', function() {
		// Refresh the app
		$('#logistic-regression-options').slideUp();
	});
	// GA sign out
	$('#logout').on('click', function() {
		gapi.analytics.auth.signOut();
		$('#logout').hide();
		$('.nav-tabs a[href="#one"]').tab('show')
	});
	// **** Step 2: Review Data + Setup Model - Responses from Server Side **** //
	socket.on('render_uploaded_csv_data', function(msg) {
		/*

		Background:
		The User has successfully uploaded their data to the client and it has been parsed within app.py. The server side emits an array of data back to the client as the 'render_uploaded_csv_data' web socket event, which this function is listening for.

		If the event is successfully sent from the server side, it then parses the msg (or data) that is being sent.

		The data (ie. msg.data:  which gets stored in the variable arr below) that was sent from the server side contains an array of information about the original csv that was uploaded, including:

		arr[0]: ["Month", "Sales of shampoo over a three year period"]
		arr[1]: Original Data as Key:Value pair array. eg [ {Month: "2012-01-01", Sales of shampoo over a three year period: 266},...]
		arr[2]: Detecting Time Unit eg. ["months", "M", "monthly"]
		arr[3]: list containing 1) count of dates 2) metric mean 3) metric std 4) metric minimum 5) metric maximum
		arr[4]: Original Dataset as a list [4][0] is the dimension, while [4][1] is the metric data.

		The data stored in arr is then rendered on Step 2: Review Data + Setup Model

		*/
		// store msg.data into a variable called arr
		var arr = msg.data;
		// Declare variables based on the data within arr to be used in this function
		var titleOfChart = arr[0][1] + ' trended' // Chart Title
		var timeframe = arr[2][0]; // Timeframe: eg. months, days or years - used for setup model question
		var stats_list = arr[3]; // list containing 1) count of dates 2) metric mean 3) metric std 4) metric minimum 5) metric maximum
		var time_unit_count = stats_list[0]; // Count of time units / dates
		var metric_mean = stats_list[1]; // Mean value of the metric array
		var metric_std = stats_list[2]; // Standard Deviation value of the metric array
		var metric_min = stats_list[3]; // Min value of the metric array
		var metric_max = stats_list[4]; // Max value of the metric array
		var original_dataset = arr[4]; // Array of lists for dimensions and metrics to be used in the chartjs graph
		var original_dimension = original_dataset[0]; // List of dimensions used in chartjs chart. eg. ["2012-01-01", "2012-02-01", ... ]
		var original_metric = original_dataset[1]; // List of metrics  used in chartjs chart. eg. [266, 145.9, 183.1, 119.3, 180.3,...]
		freq = arr[2][1]; // frequency value is used in the Prophet Function to determine type of time data (ie. M, D, Y)
		// ** Let's render the Chart and Supporting metrics in Step 2: Review Data + Setup Model ** //
		// First, let's set the timeframe in the right hand nav question: How many {{timeframe}} do you want to forecast out?
		$('#timeframe').html(timeframe);
		//Here we are passing the timeframe for use in the comparison statistics section
		$('#timeframe-comp-sum-past').html(timeframe);
		$('#timeframe-comp-sum-percent').html(timeframe);
		$('#timeframe-comp-avg-past').html(timeframe);
		$('#timeframe-comp-avg-percent').html(timeframe);
		// Set the Title of the Chart
		$('#chart-title').html(titleOfChart);
		$('#original-data-chart-title').html(titleOfChart);
		// Build Pre-Forecast time series chart that allows the user to review the csv data that they uploaded
		var original_chart = document.getElementById("originalChart").getContext('2d');
		var myChart = new Chart(original_chart, {
			type: 'line',
			data: {
				labels: original_dimension,
				datasets: [{
					label: 'Actuals',
					data: original_metric,
					borderWidth: 2,
					fill: false,
					radius: 2,
					backgroundColor: "rgb(0,0,0,0.5)",
					orderColor: "rgb(0,0,0,0.9)",
					borderWidth: 2
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						},
						scales: {
							xAxes: [{
								gridLines: {
									color: "#FFF"
								}
							}],
							yAxes: [{
								gridLines: {
									color: "#FFF"
								}
							}]
						}
					}]
				},
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							var label = data.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += Math.round(tooltipItem.yLabel * 100) / 100;
							return label;
						}
					}
				}
			}
		});
		// Next, let's set and render the mean, std, min and max values about the original csv data that the user uploaded.
		$('#metrics-mean').html(metric_mean);
		$('#metrics-std').html(metric_std);
		$('#metrics-min').html(metric_min);
		$('#metrics-max').html(metric_max);
		// ****** GOOGLE ANALYTICS EVENT ****** //
		// Send this event to the data layer indicating that the original data has been successfully rendered on Step 2.
		window.dataLayer.push({'event': 'Pre-forecast chart rendered'});
		// TO DO: On click of the logistic option, unhide the upper and lower bounds or saturation points.
		// ****** On click of the Generate Forecast CTA on Step 2 ***** //
		$('#generate-forecast').unbind().click(function() {
			/*

			Background:

			When the user clicks on the 'Generate Forecast' CTA on Step 2, this function captures all of the forecast settings that were set in the
			right hand column called "SETUP BASIC FORECAST".

			This function then emits this forecast settings server side to be processed and subsequenty instantiate and fit the Prophet model.

			*/
			// Declare Variables based on the basic forecast settings in Step 2
			var selected = []; // An array of settings values. Output of selected = ["linear", "48", "23", "2"]
			var checkboxes = document.getElementsByName('selection');
			var time_units = $('#days-to-forecast').val(); // Eg. Number of days to forecast out
			var upper = $('#upper-limit').val(); // Upper Limit used in logistic forecast
			var lower = $('#lower-limit').val(); // Lower Limit used in logistic forecast
			// Let's push settings to the selected array
			// Determine what is checked and push to selected
			for (var i = 0; i < checkboxes.length; i++) {
				if (checkboxes[i].checked) {
					selected.push(checkboxes[i].value);
				}
			}
			// Push time_units, upper and lower values for logistic forecast (if any)
			selected.push(time_units);
			selected.push(upper);
			selected.push(lower);
			// ***** IMPORTANT: Given that we are only building a basic forecast, we are going to set some default values for additional hyper-parameters that are used when we instatiate and fit the Prophet model.  ***** //
			selected.push('auto'); // 'seasonality_mode: not selected yet'
			selected.push('auto'); // 'seasonality_prior_scale: not selected yet'
			selected.push([false, false, false]); // checkbox values for daily, weekly, yearly seasonality
			selected.push('auto'); // 'n_changepoints: not selected yet'
			selected.push('auto'); // 'changepoints_prior_scale: not selected yet'
			// Forecast Settings with Original Data and time frequency
			settings = [selected, msg, freq];
			// Capture time when user clicks generate forecast - to be used when calculating time to render forecast
			generate_forecast_time = Date.now();
			// Let's Emit all of the forecast settings and orignal data back to the server side
			socket.emit('forecast_settings', {
				data: settings
			});
			// ****** GOOGLE ANALYTICS EVENT ****** //
			// Send this event to the data layer signifying that the user has clicked the Forecast CTA
			window.dataLayer.push({'event': 'Generate forecast CTA'});
			// Send the user to the 3rd tab called Step 3: View Forecast, display loading gif and scroll the window to the top of the page.
			$('.nav-tabs a[href="#step3"]').tab('show'); // Send user to Step 3: View Forecast Tab
			$('#loading').css({
				display: "block"
			}); // Display a loading gif to signify that they model is being built
			window.scrollTo(0, 0);
			// Include Message to the User about estimated length of time
			$('#processing').css({
				display: "block"
			});
			// Clear any data that was set in step 2 - this will get refreshed upon update of step 3.
			original_dataset = '';
			original_dimension = '';
			original_metric = '';
			arr = '';
			// Clear the forecast chart if there, so it focuses the user on the loading gif
			$('#myChart').css({
				display: "none"
			});
			$('.nav-tabs a[href="#five"]').tab('show');
		}); // End of generate forecast function
	}); // End of render_uploaded_csv_data function
	// **** Step 3: View Forecast - Responses from Server Side **** //
	socket.on('render_forecast_chart', function(msg) {
		/*

		Background:

		This function is responsible for rendering the final forecast chart and any subsquent forecast charts triggered by users clicking on the
		Update forecast CTA on Step 3: View Forecast

		It listens for a web socket event called render_forecast_chart, and then parses all data that was transmitted after Prophet generated the forecast server side.

		This msg data contains an array of the following information:

		arr[0]: List of dimension data to be used in chart js as data_labels: ["2012-01-01", "2012-02-01", ...]
		arr[1]: List of the forecast data (y_hat): [127.21162711307922, 103.94364054937097, 94.64850203641471, ...]
		arr[2]: List of the original metric data (y): [266, 145.9, 183.1, ...]
		arr[3]: Forecast Settings: eg. ["linear", "24", "", "", "auto", "auto", Array(3), "auto", "auto"]\
		arr[4]: Timeframe of data, Metric Name: ["Month", "Sales of shampoo over a three year period"]
		arr[5]: Frequency used in Model: eg. "M", "D", "Y"
		arr[6]: Original Dataset Shape: [{Month: "2012-01-01", Sales of shampoo over a three year period: 266},...]
		arr[7]: Forecast Data for CSV Export: dimension,y, y_hat, y_upper_bounds, y_lower_bounds


		*/
		// First, let's hide the loading gif and then display the chart canvas
		$('img#loading').css({
			display: "none"
		});
		$('#myChart').css({
			display: "block"
		});
		$('#processing').css({
			display: "none"
		});
		// Store msg.data into a variable called arr
		arr = msg.data;
		console.log(arr);
		// Define some variables that are going to be used to render the data in Step 3: View Forecast
		data_labels = arr[0]; // date
		forecast = arr[1]; // y_hat
		original = arr[2]; // y
		var data_for_csv_export = arr[7]; // csv data for export button click.
		forecast_settings = arr[3] // forecast settings
		var model_type = forecast_settings[0] // model type: linear or logistic
		var forecast_length = forecast_settings[1] // length of forecast in days, months, years
		var capacity = forecast_settings[2] // Upper Limit (used with logistic model)
		var min_saturation = forecast_settings[3] // Lower Limit (used with logistic model)
		// We'll
		var forecasted_vals = arr[8]
		var forecasted_vals_mean = arr[9]
		//Here we are passing the sum of the previous and future forecasts for the comparison statistics
		var forecast_sum = forecasted_vals[0] // forecasted sum
		var actuals_sum = forecasted_vals[1] // actuals sum
		var difference = forecasted_vals[2] // difference
		//Here we are passing the mean of the previous and future forecasts for the comparison statistics
		var forecast_mean = forecasted_vals_mean[0] //forecast mean
		var actuals_mean = forecasted_vals_mean[1] //actual mean
		var difference_mean = forecasted_vals_mean[2] //difference mean
		// Let's pre-populate the right hand settings with the appropriate data used to build the basic forecast
		$('#forecast-length').val(forecast_length);
		//Below we are grabbing the forecast length for us in the comparison statistics section
		$('#forecast-length-comp-sum-past').text(forecast_length)
		$('#forecast-length-comp-sum-percent').text(forecast_length)
		$('#forecast-length-comp-avg-past').text(forecast_length)
		$('#forecast-length-comp-avg-percent').text(forecast_length)
		$('#update-capacity').val(capacity);
		$('#update-min-saturation').val(min_saturation);
		// Render the % difference between actuals and forecasted sums
		$('#metrics-diff').html(difference);
		$('#metrics-forecastsum').html(forecast_sum);
		$('#metrics-actualssum').html(actuals_sum);
		$('#metrics-diff_mean').html(difference_mean);
		$('#metrics-forecastsum_mean').html(forecast_mean);
		$('#metrics-actualssum_mean').html(actuals_mean);
		// Now let's render the forecast
		var ctx = document.getElementById("myChart").getContext('2d');
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data_labels,
				datasets: [{
					label: 'Forecast',
					data: forecast,
					borderWidth: 2,
					fill: false,
					pointRadius: 0,
					backgroundColor: "#F9AB00",
					borderColor: '#E37400',
					borderWidth: 2
				}, {
					label: 'Actuals',
					data: original,
					fill: false,
					pointRadius: 2,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					borderColor: "rgba(0, 0, 0, 0.0)",
					borderWidth: 2
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							suggestedMin: 1,
							suggestedMax: 20
						}
					}]
				},
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							var label = data.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += Math.round(tooltipItem.yLabel * 100) / 100;
							return label;
						}
					}
				}
			}
		});
		// Timestamp of forecast render
		var forecast_render_time = Date.now();
		var time_to_render_forecast = ((forecast_render_time - generate_forecast_time) / 1000).toFixed(2);
		console.log(time_to_render_forecast);
		// ****** GOOGLE ANALYTICS EVENT ****** //
		// Send an event to the data layer indicating that the forecast chart has been successfully rendered on Step 3: View Forecast
		window.dataLayer.push({'event': 'Render forecast',
		                      'dimension1': time_to_render_forecast
		                      });
		// ************ Original Dataset Shape ***************** //
		var original_dataset = arr[6]
		// ************ STEP 3: UPDATE CHART CTA CLICK - RIGHT SIDE-NAV BAR ***************** //
		$('#update-chart').unbind().click(function() {
			/*

			Background:

			When the user clicks on the Update Chart CTA, this function will grab all values from the right side nav and store them into forecast_settings.

			It then emits the updated forecast settings along with the original data server side.

			*/
			// Declare Updated Variables to be used in forecast settings: u_ stands for "updated" + setting
			var u_forecast_length = $('#forecast-length').val(); // forecast length in time units of days, months, years
			var u_model_type = $("#arg-forecast-model option:selected").val(); // Model Type: Linear or logistic
			var u_capacity = $('#update-capacity').val(); // Upper Limit (used in Logistic model)
			var u_min_saturation = $('#update-min-saturation').val(); // Lower Limit (used in Logistic model)
			var u_seasonality_mode = $("#arg-seasonality-mode option:selected").val(); // Seasonality mode: daily, monthly, yearly
			var u_seasonality_prior_scale = $('#seasonality-prior-scale').val(); // Seasonality prior scale
			var u_n_changepoints = $('#n-changepoints').val(); // Number of change points
			var changepoints_prior_scale = $('#changepoints-prior-scale').val(); // Change points prior scale
			// Get checked boxes in the seasonality section
			var u_checkboxes = document.getElementsByName('seasonality_type');
			var selected_seasonality = [];
			for (var i = 0; i < u_checkboxes.length; i++) {
				if (u_checkboxes[i].checked) {
					selected_seasonality.push(true);
				} else {
					selected_seasonality.push(false);
				}
			}
			// Build Settings to Update Forecast - to be emitted back to python
			var original_data = [data_labels, original];
			var column_headers = arr[4];
			var forecast_settings_list = [u_model_type, u_forecast_length, u_capacity, u_min_saturation, u_seasonality_mode, u_seasonality_prior_scale, selected_seasonality, u_n_changepoints, changepoints_prior_scale]
			updated_forecast_settings = [original_data, forecast_settings_list, column_headers, freq, original_dataset];
			console.log(updated_forecast_settings);
			console.log('Build settings');
			// Emit updated forecast settings and data back to be processed and fit another Prophet model
			socket.emit('update_chart_settings', {
				data: updated_forecast_settings
			});
			myChart.destroy();
			// ****** GOOGLE ANALYTICS EVENT ****** //
			// Send an event to the data layer signifying that the Update Chart CTA has been clicked.
			window.dataLayer.push({'event': 'Update forecast CTA'});
			// Hide chart when processing data and display loading gif

			$('#myChart').css({
				display: "none"
			});
			$('#loading').css({
				display: "block"
			});
			$('#processing').css({
				display: "block"
			});
			// IMPORTANT: Set data_for_csv_export to blank so not to store multiple csvs for download.
			data_for_csv_export = '';
		}); // end of update-chart function
		$('#reset').on('click', function() {
			/*

			Background:

			This function resets all data and charts back to the app's original state before any data was uploaded so that the user could try another forecast.

			*/
			// Delete Forecast Chart
			myChart.destroy();
			// Send user back to Step 1
			$('.nav-tabs a[href="#step1"]').tab('show');
			// clear all data
			data_labels = ''; // date
			forecast = ''; // y_hat
			original = '';
			arr = '';
			original_dataset = '';
			data_for_csv_export = '';
			updated_forecast_settings = '';
			forecast_settings = '';
			data = '';
			original_dimension = '';
			original_metric = '';
			myChart = '';
			// Destroy Chart on Step 2
			var original_chart = document.getElementById("originalChart").getContext('2d');
			var originalChart = new Chart(original_chart);
			originalChart.destroy();
			// ****** GOOGLE ANALYTICS EVENT ****** //
			// send an event to data layer signifying that the reset button has been clicked on step 3.
			window.dataLayer.push({'event': 'Reset CTA'});
			// Emit original data
			socket.emit('reset', {
				data: "reset button clicked"
			});
			// Refresh the webpage
			location.reload(true);
		}); // end of reset-button function
		$('#download-forecast-cta').on('click', function() {
			/*

			Background:

			This function downloads any forecast data you have generated through the app.

			The exported csv contains the following columns of data:

			date: dimension
			y: original data
			y_hat: forecasted data
			y_upper: upper limit to forecast
			y_lower: lower limit to forecast

			*/
			// Console log
			console.log('exporting forecasted data to csv');
			var data, filename, link;
			var csv = convertArrayOfObjectsToCSV({
				data: data_for_csv_export
			});
			if (csv == null) return;
			// Name of the csv file that is being downloaded
			filename = 'prophecise.csv';
			var blob = new Blob([csv], {
				type: "text/csv;charset=utf-8;"
			});
			if (navigator.msSaveBlob) { // IE 10+
				navigator.msSaveBlob(blob, filename)
			} else {
				var link = document.createElement("a");
				if (link.download !== undefined) {
					// feature detection, Browsers that support HTML5 download attribute
					var url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", filename);
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}
			// ****** GOOGLE ANALYTICS EVENT ****** //
			// send an event to the data layer signifying that the Export Forecast CSV button has been clicked.
			window.dataLayer.push({'event': 'Download forecast data CTA'});
		}); // end of the download-forecast-cta function
	}); // end of the render_forecast_chart
	// ******** THE CODE BELOW IS PLACEHOLDER CODE FOR MODEL VALIDATION AND WILL BE UPDATED IN A FUTURE RELEASE ******** //
	$('#reload-button').on('click', function() {
		// Refresh the app
		location.reload(true);
	});
	// Display updates to user when the data is processing
	socket.on('processing', function(msg) {
		// Update UI with steps processed on step 3: View Forecast
		console.log('model has been fit')
	});
	socket.on('error', function(msg) {
		// Store msg.data into a variable called arr
		var error_data = msg.data;
		// Update UI with error notice
		$('#user-messaging').css({
			display: "block"
		});
		$('#error-message').html('<b>Error: </b> Whoops! You may want to check the following rows in your csv for null values: <br/>' + 'Row #: ' + error_data)
	});
	socket.on('model_validation', function(msg) {
		var mape_data = msg.data;
		console.log(mape_data);
		$('#mape-score').html(mape_data);
	});
	$(function() {
		$('#summary-stats').change(function() {
			$('.helpful-stats').hide();
			$('#average').show();
		});
	});
	// var past_period = $("#forecast-length").val();
});