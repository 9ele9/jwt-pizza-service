const os = require('os');

const config = require('./config.js');

class Metrics {
  constructor() {
    this.totalRequests = 0;
    this.deleteRequests = 0;
    this.putRequests = 0;
    this.postRequests = 0;
    this.getRequests = 0;

    this.totalUsers = 0;

    this.goodAuths = 0;
    this.badAuths = 0;

    this.totalOrders = 0;
    this.orderFailure = 0;

    this.revenue = 0;
    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
      this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
      this.sendMetricToGrafana('request', 'delete', 'delete', this.deleteRequests);
      this.sendMetricToGrafana('request', 'put', 'put', this.putRequests);
      this.sendMetricToGrafana('request', 'post', 'post', this.postRequests);
      this.sendMetricToGrafana('request', 'get', 'get', this.getRequests);

      this.sendMetricToGrafana('user', 'none', 'total', this.getRequests);

      this.sendMetricToGrafana('system','none','CPU',this.getCpuUsagePercentage());
      this.sendMetricToGrafana('system','none','memory',this.getMemoryUsagePercentage());

      this.sendMetricToGrafana('auth','none','success',this.goodAuths);
      this.sendMetricToGrafana('auth','none','failure',this.badAuths);

      this.sendMetricToGrafana('order','none','success',this.totalOrders);
      this.sendMetricToGrafana('order','none','failure',this.orderFailure);

      this.sendMetricToGrafana('revenue','none','total',this.revenue);
      console.log('---------------------------------------')
    }, 10000);

    timer.unref();
  }
  //<measurement>[,<tag_key>=<tag_value>]* [<field_key>=<field_value>]*
  //request,source=jwt-pizza-service total=1000

  incrementRequests() {
    this.totalRequests++;
  }

  incrementDeleteRequests() {
    this.deleteRequests++;
  }

  incrementPutRequests() {
    this.putRequests++;
  }

  incrementPostRequests() {
    this.postRequests++;
  }

  incrementGetRequests() {
    this.getRequests++;
  }

  incrementUsers() {
    this.totalUsers++;
  }

  decrementUsers() {
    this.totalUsers--;
  }

  incrementGoodAuths() {
    this.goodAuths++;
  }

  incrementBadAuths() {
    this.badAuths++;
  }

  incrementOrders(  ){
    this.totalOrders++;
  }

  incrementFailOrders(){
    this.orderFailure++;
  }

  calcRevenue(orderReq){
    for(let i=0;i<orderReq.length;i++){
        this.revenue += orderReq[i].price
    }
  }

  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(`${config.metrics.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('[METRICS]: Failed to push metrics data to Grafana');
        } else {
          console.log(`[METRICS]: Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('[METRICS]: Error pushing metrics:', error);
      });
  }
  getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
  }
  getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
  }
}

const metrics = new Metrics();
module.exports = metrics;


