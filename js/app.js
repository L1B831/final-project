// app.js — 扬帆手账 整合逻辑：三状态数据加载 + 双图表 + 明细联动筛选
// 模式复用：课堂五（事件委托筛选）、课堂六 my-dashboard（fetch 三状态 + ECharts/Chart.js 双图表）

const state = {
  data: null,
  currentMonth: 'all',     // all / 一月 ~ 六月
  currentCategory: 'all',  // all / 餐饮 / 学习 / 交通 / 娱乐
  barChart: null,
  lineChart: null
};

// ---------- 数据加载（三状态：加载中 / 暂无数据 / 加载失败） ----------
const showStatus = (msg) => {
  $('#status').text(msg).show();
};
const hideStatus = () => {
  $('#status').hide();
};

const loadData = async () => {
  showStatus('加载中…');
  try {
    const source = $('#data-source').val() || 'data/expenses.json';
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (!data.series || data.series.length === 0) {
      showStatus('暂无数据');
      $('#cards').empty();
      $('#record-body').empty();
      $('#record-foot').empty();
      return;
    }
    state.data = data;
    state.currentMonth = 'all';
    state.currentCategory = 'all';
    $('#sub-title').text(data.title + ' · 数据来源：' + data.source);
    hideStatus();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
    renderFilters(data);
    renderRecords();
  } catch (error) {
    showStatus('加载失败：' + error.message + '。请检查数据文件是否存在或网络是否正常。');
  }
};

// ---------- 汇总卡片：每类累计支出 ----------
const renderCards = (data) => {
  const months = data.months;
  const cardClass = {
    '餐饮': 'card-sum-food',
    '学习': 'card-sum-study',
    '交通': 'card-sum-travel',
    '娱乐': 'card-sum-fun'
  };
  $('#cards').empty();
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-3">
        <div class="card h-100 ${cardClass[s.category] || ''}">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4 mb-0">${total}</p>
            <p class="card-text small text-muted">共${months.length}个月累计支出（元）</p>
          </div>
        </div>
      </div>
    `);
  });
};

// ---------- 各月各类消费：ECharts 柱状图（复用课堂六） ----------
const renderBarChart = (data) => {
  if (state.barChart === null) {
    state.barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  state.barChart.setOption({
    title: { text: '各月各类消费支出', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { data: data.months },
    yAxis: { name: '元' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};

// ---------- 消费趋势：Chart.js 折线图（复用课堂六） ----------
const renderLineChart = (data) => {
  if (state.lineChart !== null) {
    state.lineChart.destroy(); // 防重复初始化
  }
  const ctx = document.querySelector('#line-chart');
  state.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.series.map(s => ({
        label: s.category,
        data: s.counts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '消费趋势 (单位: 元)' }
      }
    }
  });
};

// ---------- 明细筛选控件（课堂五模式：按钮 + data-* 属性） ----------
const renderFilters = (data) => {
  $('#record-filters').html(`
    <div class="d-flex flex-wrap gap-2 mb-2">
      <span class="text-muted align-self-center me-2">月份：</span>
      <button type="button" class="btn btn-outline-primary btn-sm filter-btn active" data-month="all">全部</button>
      ${data.months.map(m => `<button type="button" class="btn btn-outline-primary btn-sm filter-btn" data-month="${m}">${m}</button>`).join('')}
    </div>
    <div class="d-flex flex-wrap gap-2">
      <span class="text-muted align-self-center me-2">类别：</span>
      <button type="button" class="btn btn-outline-success btn-sm filter-btn active" data-category="all">全部</button>
      ${data.series.map(s => `<button type="button" class="btn btn-outline-success btn-sm filter-btn" data-category="${s.category}">${s.category}</button>`).join('')}
    </div>
  `);
};

// ---------- 筛选逻辑与明细渲染 ----------
const getFilteredRecords = () => {
  return state.data.records.filter(r => {
    const matchMonth = state.currentMonth === 'all' || r.month === state.currentMonth;
    const matchCategory = state.currentCategory === 'all' || r.category === state.currentCategory;
    return matchMonth && matchCategory;
  });
};

const renderRecords = () => {
  const records = getFilteredRecords();
  if (records.length === 0) {
    $('#record-body').html('<tr><td colspan="4" class="empty-tip">没有符合条件的明细记录</td></tr>');
    $('#record-foot').empty();
    return;
  }
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  $('#record-body').html(records.map(r => `
    <tr>
      <td>${r.month}</td>
      <td><span class="badge text-bg-light">${r.category}</span></td>
      <td>${r.item}</td>
      <td class="text-end">${r.amount}</td>
    </tr>
  `).join(''));
  $('#record-foot').html(`
    <tr>
      <td colspan="3">合计（${records.length} 笔）</td>
      <td class="text-end">${total}</td>
    </tr>
  `);
};

// ---------- 事件委托：明细筛选（复用课堂五模式） ----------
$('#record-filters').on('click', '.filter-btn', function () {
  const month = $(this).data('month');
  const category = $(this).data('category');
  if (month !== undefined) {
    $('#record-filters [data-month]').removeClass('active');
    $(this).addClass('active');
    state.currentMonth = month;
  }
  if (category !== undefined) {
    $('#record-filters [data-category]').removeClass('active');
    $(this).addClass('active');
    state.currentCategory = category;
  }
  renderRecords();
});

// ---------- 交互：切换数据源（正常数据 / 空数据），用于演示空数据状态 ----------
$('#data-source').on('change', () => {
  $('#cards').empty();
  if (state.barChart) state.barChart.clear();
  if (state.lineChart) {
    state.lineChart.destroy();
    state.lineChart = null;
  }
  loadData();
});

// ---------- 导航高亮：点击切换 active ----------
$('#nav-list').on('click', '.nav-link', function () {
  if ($(this).attr('href').startsWith('three-d')) return; // 三维页不处理
  $('#nav-list .nav-link').removeClass('active');
  $(this).addClass('active');
});

// ---------- 窗口适配：ECharts 响应式（Chart.js 默认自动处理） ----------
window.addEventListener('resize', () => {
  if (state.barChart) state.barChart.resize();
});

// 启动
loadData();
