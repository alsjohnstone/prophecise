# Prophecise
A web app that leverages Facebook Prophet to create fast and robust time-series forecasts from your Google Analytics data using a simple UI.

<br>
<img src="https://alsjohnstone.com/assets/images/screely-1592742794169.png"/>
<br>

### What is Prophecise?

<a href='https://prophecise.com'>Prophecise</a> is an open source Flask web app that enables analysts and data scientists to quickly build accurate forecast models from their Google Analytics data. It builds upon the great work Gareth Cull has been doing with <a href="https://github.com/garethcull/forecastr">Forecastr</a>. It lets users sign in with their Google Analytics account and pull reports directly into the UI for forecasting. Here's an overview of the data flow:

<br>
<img src="https://alsjohnstone.com/assets/images/prophecise-data-flow.jpg"/>
<br>

### What is Facebook Prophet?

Prophet is open source software released by Facebook’s Core Data Science team. It is a procedure for forecasting time series data and works best with time series that have strong seasonal effects and several seasons of historical data. It is available for download on <a href="https://cran.r-project.org/package=prophet">CRAN</a> and <a href="https://pypi.python.org/pypi/fbprophet/">PyPI</a>.

### References

Here are some useful links:

- Facebook Prophet: https://facebook.github.io/prophet/docs/quick_start.html#python-api
- Forecastr: https://github.com/garethcull/forecastr
- Google Analytics Management API: https://developers.google.com/analytics/devguides/config/mgmt/v3
- Google Analytics Reporting API: https://developers.google.com/analytics/devguides/reporting/core/v4
- Flask: http://flask.pocoo.org/
- SocketIO: https://flask-socketio.readthedocs.io/en/latest/
- ChartJS: https://chartjs.org
- Implementing Facebook Prophet Efficiently: https://towardsdatascience.com/implementing-facebook-prophet-efficiently-c241305405a3
