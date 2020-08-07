const REFRESH = 2000

$(document).ready(() => {

  let totalQueries = null

  const $enable = $('.enable'),
    $unique_clients = $('#unique_clients'),
    $dns_queries_today = $('#dns_queries_today'),
    $ads_blocked_today = $('#ads_blocked_today'),
    $ads_percentage_today = $('#ads_percentage_today'),
    $domains_being_blocked = $('#domains_being_blocked'),
    $top_ads = $('#top_ads'),

    $table1 = $('#table1'),
    $table2 = $('#table2'),

    keymap = {
      'domains_being_blocked': 'Domains',
      'dns_queries_today': 'Queries',
      'ads_blocked_today': 'Blocked',
      'ads_percentage_today': 'Percent',
      'unique_domains': 'Unique Domains',
      'queries_forwarded': null,
      'queries_cached': null,
      'clients_ever_seen': null,
      'unique_clients': 'Clients',
      'dns_queries_all_types': 'Queries All',
      'reply_NODATA': null,
      'reply_NXDOMAIN': null,
      'reply_CNAME': null,
      'reply_IP': null,
      'privacy_level': null,
      'status': 'Status'
    }

  const endpoints = [
    {},
    {}
  ]

  const summarypoints = [
    './data/summary-1.json',
    './data/summary-2.json'
  ]

  const statusAction = 'status'

  $('button').on('click', function () {
    const action = this.getAttribute('data-action'),
          time = this.getAttribute('data-time')

    doAction(action, time);
  })

  function apiEnd(host, action, val) {
    let actionVal = val ? `=${val}` : ''
    return `http://${host.ip}/admin/api.php?auth=${host.auth}&${action}${actionVal}`
  }

  function doAction(action, time) {

    endpoints.forEach(host => {

      let url = apiEnd(host, action, time)

      fetch(url, {
        mode: 'no-cors'
      })

      if (action === 'disable') {
        enableOn()
      } else {
        enableOff()
      }

    })

  }

  function requestInterval(fn, delay) {
    let start = new Date().getTime(),
      handle = {}
    function loop() {
      handle.value = requestAnimationFrame(loop)
      const current = new Date().getTime(),
        delta = current - start
      if (delta >= delay) {
        fn.call()
        start = new Date().getTime()
      }
    }
    handle.value = requestAnimationFrame(loop)
    return handle
  }

  function updateStatus(host) {
    requestInterval(() => {
      getData()
    }, REFRESH)
  }

  async function getData() {

    pi1data = await fetch(`${summarypoints[0]}`)
    pi2data = await fetch(`${summarypoints[1]}`)
    pi1sum = await pi1data.json()
    pi2sum = await pi2data.json()

    let clients = cleanNumber(pi1sum.unique_clients).toLocaleString()
      + ' / ' +
      cleanNumber(pi2sum.unique_clients).toLocaleString()
    let dns = cleanNumber(pi1sum.dns_queries_today) + cleanNumber(pi2sum.dns_queries_today)
    let blocked = cleanNumber(pi1sum.ads_blocked_today) + cleanNumber(pi2sum.ads_blocked_today)

    let perc =
      ((cleanNumber(pi1sum.ads_blocked_today) + cleanNumber(pi2sum.ads_blocked_today)) /
        (cleanNumber(pi1sum.dns_queries_today) + cleanNumber(pi2sum.dns_queries_today))) * 100

    let domains = cleanNumber(pi1sum.domains_being_blocked).toLocaleString()
      + ' / ' +
      cleanNumber(pi2sum.domains_being_blocked).toLocaleString()

    if (pi1sum.status === 'disabled' || pi2sum.status === 'disabled') {
      enableOn()
    } else {
      enableOff()
    }

    totalQueries = dns

    $unique_clients.text(clients)
    $dns_queries_today.text(dns.toLocaleString())
    $ads_blocked_today.text(blocked.toLocaleString())
    $ads_percentage_today.text(Math.round(perc * 10) / 10 + "%")
    $domains_being_blocked.text(domains)

    $table1.bootstrapTable('load', summaryToKeyVal(pi1sum))
    $table2.bootstrapTable('load', summaryToKeyVal(pi2sum))

    loadTopList($top_ads, pi1sum.top_ads, pi2sum.top_ads)
  }

  function cleanNumber(n) {
    n = "" + n
    return parseFloat(n.replace(/,/g, ''))
  }

  function enableOff() {
    $enable.text('Enabled').attr('disabled', true).addClass('btn-default')
  }

  function enableOn() {
    $enable.text('ENABLE').attr('disabled', false).removeClass('btn-default')
  }

  function summaryToKeyVal(data) {

    let ret = []

    for (let i in data) {

      if (i in keymap && keymap[i] !== null) {

        ret.push({
          key: keymap[i],
          val: data[i]
        })

      }

    }

    return ret
  }

  function parseKeyVal(key, val) {
    switch (key) {
      case 'PI_ONE': endpoints[0].ip = val; break;
      case 'PI_TWO': endpoints[1].ip = val; break;
      case 'PI_ONE_AUTH': endpoints[0].auth = val; break;
      case 'PI_TWO_AUTH': endpoints[1].auth = val; break;
    }
  }

  function setAdminUrls() {
    let x = 0
    endpoints.forEach(host => {
      document.getElementById(`admin-link-${x++}`).href = `http://${host.ip}/admin/`
    })
  }

  function loadTopList($dest, top1, top2) {

    let topQueries = {}
    let topQueriesArray = []

    for (let domain in top1) {
      topQueries[domain] = top1[domain]
    }

    for (let domain in top2) {
      if (domain in topQueries) {
        topQueries[domain] += top2[domain]
      } else {
        topQueries[domain] = top2[domain]
      }
    }

    for (let domain in topQueries) {
      topQueriesArray.push([domain, topQueries[domain]])
    }

    topQueriesArray.sort(sortTop)
    
    $dest.empty()

    topQueriesArray.slice(0,5).forEach(domain => {

      const perc = Math.round((domain[1] / totalQueries) * 100, 1)

      $dest.append('<tr>'
                      + `<td>${domain[0]}</td>`
                      + `<td>${domain[1]}</td>`
                      + `<td> <div class="progress progress-sm" title="${perc}% of ${totalQueries}"> <div class="progress-bar queries-permitted" style="width: ${perc}%"></div> </div> </td>`
                    + '</tr>'
      )
    })

  }

  function sortTop(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
  }

  $table1.bootstrapTable({ data: [] })
  $table2.bootstrapTable({ data: [] })

  fetch('.env')
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status)
      }
      return response.text()
    })
    .then(env => {
      const lines = env.split('\n')
      for (let line = 0; line < lines.length; line++) {
        const keyval = lines[line].split('=')
        if (keyval.length === 2) {
          parseKeyVal(keyval[0], keyval[1])
        }

      }

      setAdminUrls()
      getData()
      updateStatus()
    })
    .catch(function () {
      alert('Something bad happened.')
    })

})