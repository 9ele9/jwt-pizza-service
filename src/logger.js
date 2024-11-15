const config = require('./config.js');
const metric = require('./metrics.js');
const { performance } = require("perf_hooks");

class Logger {
  httpLogger = (req, res, next) => {
    const t0 = performance.now();
    let send = res.send;
    res.send = (resBody) => {
      const logData = {
        authorized: !!req.headers.authorization,
        path: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        reqBody: JSON.stringify(req.body),
        resBody: JSON.stringify(resBody),
      };
      this.getMetrics(logData);
      const level = this.statusToLogLevel(res.statusCode);
      if(req.originalUrl == "/api/order" && req.method == "POST"){//Factory service call
        this.log(level, 'factory-service', logData)
      }else{this.log(level, 'http', logData);}
      res.send = send;
      return res.send(resBody);
    };
    const t1 = performance.now();
    this.logLatency(req.originalUrl,req.method,t1-t0)
    next();
  };

  logLatency(path,httpMethod,latency){
    metric.sendMetricToGrafana("latency","all","general",latency);
    if(path=="/api/order" && httpMethod == "POST") metric.sendMetricToGrafana("latency",httpMethod,"orders",latency);
  }

  getMetrics(logData) {
    metric.incrementRequests();
    if(logData.method == "PUT"){ // ALL PUT REQUESTS
      metric.incrementPutRequests();
      if(logData.path == "/api/auth"){//login
        if(logData.statusCode == 200){
          metric.incrementUsers();
          metric.incrementGoodAuths();
          console.log('[METRICS]: Added one user')
        }else metric.incrementBadAuths();
      }else if(logData.path == "/api/order/menu"){//new menu
        if(logData.statusCode == 200){
          metric.incrementGoodAuths();
        }else{
          metric.incrementBadAuths();
        }
      }
    }else if(logData.method == "POST"){ //ALL POST REQUEST METRICS
      metric.incrementPostRequests();
      if(logData.path == "/api/auth"){ // Registrations
        if(logData.statusCode == 200){
          metric.incrementUsers();
          console.log('[METRICS]: Added one user')
        }

      }else if(logData.path == "/api/order"){ //New orders
        if(logData.statusCode == 200){
          metric.incrementOrders();
          console.log('-------------------------------Metric ')
          let test = JSON.parse(logData.reqBody)
          console.log('------------------------------- :' + test.items)
          metric.calcRevenue(test.items);
          metric.incrementGoodAuths();
        }else{
          metric.incrementFailOrders();
          metric.incrementBadAuths();
        }
      
      }else if(logData.path == "/api/franchise"){ //New franchise
        if(logData.statusCode == 200){
          metric.incrementGoodAuths();
        }else{
          metric.incrementBadAuths();
        }
      }

    }else if(logData.method == "DELETE"){ //ALL DELETE REQUEST METRICS
      metric.incrementDeleteRequests();
      if(logData.path == "/api/auth"){ //Logouts
        if(logData.statusCode == 200){
          metric.decrementUsers();
          metric.incrementGoodAuths();
          console.log('[METRICS]: Removed one user')
        }else metric.incrementBadAuths();
      }else if(logData.path == "/api/franchise"){//delete franchises
        if(logData.statusCode == 200){
          metric.incrementGoodAuths();
        }else{
          metric.incrementBadAuths();
        }
      }
    }else if(logData.method == "GET"){ //ALL GET REQUEST METRICS
      metric.incrementGetRequests();

      if(logData.path == "/api/franchise/:userId"){//get user franchises
        if(logData.statusCode == 200){
          metric.incrementGoodAuths();
        }else{
          metric.incrementBadAuths();
        }
      }else if(logData.path == "/api/order"){//Get own orders
        if(logData.statusCode == 200){
          metric.incrementGoodAuths();
        }else{
          metric.incrementBadAuths();
        }
      }
    }
    //console.log('TOTAL HTTP REQUESTS: ' + metric.totalRequests)
  }

  testLogger = (req, res, next) => {
    console.log('Log sent semi successfully.')
    next();
  };

  log(level, type, logData) {
    const labels = { component: config.logging.source, level: level, type: type };
    const values = [this.nowString(), this.sanitize(logData)];
    const logEvent = { streams: [{ stream: labels, values: [values] }] };

    this.sendLogToGrafana(logEvent,type);
  }

  dbLog(level, type, logData, params) {
    const query = JSON.stringify({ query: logData })
    const labels = { component: config.logging.source, level: level, type: type };
    const values = [this.nowString(), query];
    const logEvent = { streams: [{ stream: labels, values: [values] }] };
    //console.log("Database event received: " + query)
    this.sendLogToGrafana(logEvent,type);
  }

  statusToLogLevel(statusCode) {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }

  nowString() {
    return (Math.floor(Date.now()) * 1000000).toString();
  }

  sanitize(logData) {
    logData = JSON.stringify(logData);
    return logData.replace(/\\"password\\":\s*\\"[^"]*\\"/g, '\\"password\\": \\"*****\\"');
  }

  sendLogToGrafana(event,type) {
    const body = JSON.stringify(event);
    fetch(`${config.logging.url}`, {
      method: 'post',
      body: body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.logging.userId}:${config.logging.apiKey}`,
      },
    }).then((res) => {
      if (!res.ok) console.log('[LOGS]: Failed to send ' + type + ' log to Grafana.');
      else console.log('[LOGS]: Log sent successfully.')
    });
  }
}
module.exports = new Logger();