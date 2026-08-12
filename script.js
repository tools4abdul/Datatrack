const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

async function getDashboardData() {
  try {
    const response = await fetch('data/mockData.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load dashboard data');
    }

    return await response.json();
  } catch (error) {
    console.warn('Using fallback dashboard payload', error);

    return {
      kpis: [
        { title: 'Events tracked', value: 183270, unit: 'events', trend: '+12.9%', positive: true, icon: 'activity' },
        { title: 'Active sources', value: 18, unit: 'sources', trend: '+2', positive: true, icon: 'data' },
        { title: 'Pipeline latency', value: 2.4, unit: 'min avg', trend: '-8.1%', positive: false, icon: 'clock' },
        { title: 'Data health', value: 92, unit: '% match', trend: '+3.2%', positive: true, icon: 'check' }
      ],
      channels: [
        { name: 'Web', value: 44, color: '#136d79' },
        { name: 'Mobile', value: 29, color: '#22a4b3' },
        { name: 'API', value: 18, color: '#f0a34b' },
        { name: 'Partner', value: 9, color: '#7f6ab3' }
      ],
      ingest: {
        lastSync: '2026-08-11T10:16:00Z',
        runtime: 'live',
        totalSources: 18,
        protocols: [
          { name: 'GitHub REST API', status: 'online', sources: 7, latency: '1.2m', successRate: 98, endpoint: 'https://api.github.com' },
          { name: 'GitHub GraphQL API', status: 'online', sources: 3, latency: '0.9m', successRate: 96, endpoint: 'https://api.github.com/graphql' },
          { name: 'GitHub Webhook', status: 'online', sources: 6, latency: '0.4m', successRate: 99, endpoint: 'https://github.com/webhooks' }
        ]
      },
      health: [
        { label: 'Validation coverage', value: 88 },
        { label: 'Field completeness', value: 76 },
        { label: 'Sync freshness', value: 94 },
        { label: 'Alert routing', value: 68 }
      ],
      trend: {
        labels: ['Apr 01', 'Apr 03', 'Apr 04', 'Apr 06', 'Apr 08', 'Apr 10', 'Apr 12', 'Apr 14'],
        values: [123, 160, 142, 218, 200, 270, 304, 354]
      },
      activity: [
        { type: 'pipeline', title: 'API ingestion completed', meta: 'Revenue API · 2 min ago', icon: 'A' },
        { type: 'source', title: 'Mobile App source refreshed', meta: 'QA mobile bundle · 12 min ago', icon: 'M' },
        { type: 'alert', title: 'Data quality alert resolved', meta: 'Partner exports · 31 min ago', icon: '!' }
      ],
      sources: [
        { name: 'Revenue API', status: 'online', records: 251420, latency: '1.2m', quality: '98%', change: '+4.1%' },
        { name: 'QA Mobile Bundle', status: 'online', records: 80210, latency: '0.8m', quality: '96%', change: '+2.3%' },
        { name: 'Partner Risk Feed', status: 'warning', records: 47000, latency: '3.1m', quality: '84%', change: '-1.4%' },
        { name: 'Product Events', status: 'offline', records: 39000, latency: '—', quality: '68%', change: '-2.2%' }
      ]
    };
  }
}

function renderKpis(kpis) {
  const kpiGrid = document.getElementById('kpiGrid');
  kpiGrid.innerHTML = kpis.map((item) => {
    const iconMap = {
      activity: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h5l3-7 3 12 3-7h6" /></svg>`,
      data: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>`,
      clock: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></svg>`,
      check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 5 5L20 2" /></svg>`
    };

    const value = typeof item.value === 'number' && item.unit === 'events' ? formatNumber.format(item.value) : item.value;

    return `<article class="kpi-card">
      <div class="kpi-top">
        <div>
          <div class="kpi-title">${item.title}</div>
        </div>
        <span class="icon-badge">${iconMap[item.icon] || iconMap.activity}</span>
      </div>
      <div class="kpi-value">${value}<span> ${item.unit}</span></div>
      <div class="kpi-foot">
        <span class="change ${item.positive ? 'positive' : 'negative'}">${item.trend}</span>
        <span>vs previous</span>
      </div>
    </article>`;
  }).join('');
}

function renderChannels(channels) {
  const total = channels.reduce((sum, channel) => sum + channel.value, 0);
  const stops = [];
  let cursor = 0;

  channels.forEach((channel) => {
    const start = cursor;
    const end = cursor + (channel.value / total) * 100;
    stops.push(`${channel.color} ${start}% ${end}%`);
    cursor = end;
  });

  const donut = document.getElementById('channelDonut');
  donut.style.background = `conic-gradient(${stops.join(',')})`;

  const legend = document.getElementById('channelLegend');
  legend.innerHTML = channels.map((channel) => `
    <li>
      <span class="name"><span class="dot" style="background: ${channel.color};"></span>${channel.name}</span>
      <span>${channel.value}%</span>
    </li>
  `).join('');
}

function renderHealth(health) {
  const healthBars = document.getElementById('healthBars');
  healthBars.innerHTML = health.map((row) => `
    <div class="health-row">
      <div class="row-head">
        <span>${row.label}</span>
        <span>${row.value}%</span>
      </div>
      <div class="bar-bg">
        <div class="bar-fill" style="width: ${row.value}%;"></div>
      </div>
    </div>
  `).join('');
}

function renderTrendChart(canvasId, trend) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.scale(dpr, dpr);

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;

  const padding = { top: 20, right: 16, bottom: 34, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const min = Math.min(...trend.values) * 0.92;
  const max = Math.max(...trend.values) * 1.04;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#eefaff';
  ctx.fillRect(0, 0, width, height);

  const gridColor = '#aecbd2';
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  for (let i = 0; i < 4; i += 1) {
    const y = padding.top + (plotHeight / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const points = trend.values.map((value, index) => {
    const x = padding.left + (plotWidth / (trend.values.length - 1)) * index;
    const normalized = (value - min) / (max - min);
    const y = padding.top + plotHeight - normalized * plotHeight;
    return { x, y };
  });

  ctx.strokeStyle = '#136d79';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  const fillGradient = ctx.createLinearGradient(0, padding.top, 0, height);
  fillGradient.addColorStop(0, 'rgba(34,164,179,0.30)');
  fillGradient.addColorStop(1, 'rgba(34,164,179,0.02)');

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, height - padding.bottom);
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = fillGradient;
  ctx.fill();

  points.forEach((point, index) => {
    ctx.fillStyle = '#136d79';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();

    const label = trend.labels[index];
    ctx.fillStyle = '#758f95';
    ctx.font = '10px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, point.x, height - 8);
  });
}

function renderTrend(trend) {
  renderTrendChart('trendChart', trend);
}

function renderDonutChart(donutId, legendId, channels) {
  const total = channels.reduce((sum, channel) => sum + channel.value, 0);
  const stops = [];
  let cursor = 0;

  channels.forEach((channel) => {
    const start = cursor;
    const end = cursor + (channel.value / total) * 100;
    stops.push(`${channel.color} ${start}% ${end}%`);
    cursor = end;
  });

  const donut = document.getElementById(donutId);
  if (donut) {
    donut.style.background = `conic-gradient(${stops.join(',')})`;
  }

  const legend = document.getElementById(legendId);
  if (legend) {
    legend.innerHTML = channels.map((channel) => `
      <li>
        <span class="name"><span class="dot" style="background: ${channel.color};"></span>${channel.name}</span>
        <span>${channel.value}%</span>
      </li>
    `).join('');
  }
}

function renderChannels(channels) {
  renderDonutChart('channelDonut', 'channelLegend', channels);
}

function renderSources(sources, tableId = 'sourceTable') {
  const table = document.getElementById(tableId);
  if (!table) return;

  table.innerHTML = sources.map((source) => {
    const statusClass = {
      online: 'online',
      warning: 'warning',
      offline: 'offline'
    }[source.status] || 'online';

    const statusLabel = {
      online: 'Healthy',
      warning: 'Degraded',
      offline: 'Offline'
    }[source.status] || 'Healthy';

    const statusIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor" /></svg>`;

    return `<tr>
      <td class="source-name">${source.name}</td>
      <td><span class="status-pill ${statusClass}">${statusIcon}${statusLabel}</span></td>
      <td>${formatNumber.format(source.records)}</td>
      <td>${source.latency}</td>
      <td>${source.quality}</td>
      <td><span class="table-change ${source.change.startsWith('-') ? 'negative' : 'positive'}">${source.change}</span></td>
    </tr>`;
  }).join('');
}

function renderActivity(activity) {
  const feed = document.getElementById('activityFeed');
  feed.innerHTML = activity.map((item) => `
    <div class="activity-item">
      <span class="avatar">${item.icon}</span>
      <div>
        <div class="activity-title">${item.title}</div>
        <div class="activity-meta">${item.meta}</div>
      </div>
    </div>
  `).join('');
}

function renderSources(sources) {
  const table = document.getElementById('sourceTable');

  table.innerHTML = sources.map((source) => {
    const statusClass = {
      online: 'online',
      warning: 'warning',
      offline: 'offline'
    }[source.status] || 'online';

    const statusLabel = {
      online: 'Healthy',
      warning: 'Degraded',
      offline: 'Offline'
    }[source.status] || 'Healthy';

    const statusIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor" /></svg>`;

    return `<tr>
      <td class="source-name">${source.name}</td>
      <td><span class="status-pill ${statusClass}">${statusIcon}${statusLabel}</span></td>
      <td>${formatNumber.format(source.records)}</td>
      <td>${source.latency}</td>
      <td>${source.quality}</td>
      <td><span class="table-change ${source.change.startsWith('-') ? 'negative' : 'positive'}">${source.change}</span></td>
    </tr>`;
  }).join('');
}

function showNotification(message) {
  const notification = document.getElementById('dashboardNotification');
  if (!notification) return;

  notification.textContent = message;
  notification.hidden = false;
  notification.classList.add('visible');

  window.clearTimeout(showNotification.timeoutId);
  showNotification.timeoutId = window.setTimeout(() => {
    notification.classList.remove('visible');
    notification.hidden = true;
  }, 3200);
}

function bindDashboardActions() {
  const createReport = document.getElementById('createReportButton');
  const exportReport = document.getElementById('exportReportButton');
  const viewPeriod = document.getElementById('viewPeriodButton');
  const showAllEvents = document.getElementById('showAllEventsButton');
  const createAlert = document.getElementById('createAlertButton');
  const timeframeButtons = document.querySelectorAll('[data-timeframe]');

  createReport?.addEventListener('click', () => {
    showNotification('Create report flow initiated — this is a demo interaction.');
  });

  exportReport?.addEventListener('click', () => {
    showNotification('Export report started. Your file will be ready shortly.');
  });

  viewPeriod?.addEventListener('click', () => {
    const nextLabel = viewPeriod.textContent.trim() === 'This week' ? 'This month' : 'This week';
    viewPeriod.textContent = nextLabel;
    showNotification(`Switched dashboard to ${nextLabel.toLowerCase()}.`);
  });

  showAllEvents?.addEventListener('click', () => {
    showNotification('Showing full event stream.');
  });

  createAlert?.addEventListener('click', () => {
    showNotification('Alert successfully created. Monitoring your sources.');
  });

  timeframeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      timeframeButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      showNotification(`Trend view updated to ${button.textContent.trim()}.`);
    });
  });
}

function normalizeIngest(data) {
  const ingest = data.ingest || {
    lastSync: new Date().toISOString(),
    runtime: 'live',
    totalSources: 0,
    protocols: []
  };

  ingest.protocols = Array.isArray(ingest.protocols) ? ingest.protocols : [];

  return ingest;
}

function renderIngest(ingest, panelId = 'ingestPanel') {
  const ingestPanel = document.getElementById(panelId);
  if (!ingestPanel) {
    return;
  }

  const protocolRows = ingest.protocols.map((protocol) => `
    <div class="protocol-row">
      <span class="protocol-name">${protocol.name}</span>
      <span class="status-pill ${protocol.status || 'online'}">${protocol.status || 'online'}</span>
      <span>${protocol.sources} sources</span>
      <span>${protocol.latency}</span>
      <span>${protocol.successRate}% success</span>
    </div>
  `).join('');

  ingestPanel.innerHTML = `
    <div class="panel-header compact-header">
      <div>
        <div class="panel-kicker">Standard API protocols</div>
        <h2>Ingest coverage</h2>
      </div>
      <span class="badge ${ingest.runtime === 'live' ? 'success' : 'warning'}">${ingest.runtime || 'live'}</span>
    </div>
    <div class="ingest-meta">
      <span>Last sync: ${ingest.lastSync || '—'}</span>
      <span>Sources: ${ingest.totalSources || 0}</span>
    </div>
    <div class="protocol-list">${protocolRows}</div>
  `;
}

const dashboardState = {
  initialRender: new Set()
};

function bindSectionNavigation(data) {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('.dashboard-section');

  function showSection(sectionId) {
    sections.forEach((section) => {
      section.classList.toggle('hidden', section.id !== `section-${sectionId}`);
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === sectionId);
    });

    if (!dashboardState.initialRender.has(sectionId)) {
      if (sectionId === 'analytics') {
        renderTrendChart('trendChartAnalytics', data.trend);
        renderDonutChart('channelDonutAnalytics', 'channelLegendAnalytics', data.channels);
      }
      if (sectionId === 'sources') {
        renderIngest(data.ingest, 'ingestPanelSources');
        renderSources(data.sources, 'sourceTableSources');
      }
      dashboardState.initialRender.add(sectionId);
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const sectionId = link.dataset.section;
      if (sectionId) {
        showSection(sectionId);
        showNotification(`${link.textContent.trim()} section opened.`);
      }
    });
  });

  showSection('overview');
}

async function initDashboard() {
  const data = await getDashboardData();
  const ingest = normalizeIngest(data);

  renderKpis(data.kpis);
  renderChannels(data.channels);
  renderHealth(data.health);
  renderTrend(data.trend);
  renderActivity(data.activity);
  renderSources(data.sources);
  renderIngest(ingest);

  bindDashboardActions();

  window.addEventListener('resize', () => {
    renderTrend(data.trend);
  });
}

initDashboard();
