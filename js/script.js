google.charts.load('current', { 'packages': ['corechart'] });

document.querySelector('form').addEventListener('submit', async function (event) {
  event.preventDefault(); 

  const searchInput = document.querySelector('input[type="search"]').value.trim();

  if (searchInput === '') {
    alert('Digite o código de uma ação!');
    return;
  }

 
  const apiKey = 'SEU_Token'; 

  const url = `https://brapi.dev/api/quote/${searchInput}?token=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const acao = data.results[0];

      
      document.querySelector('.grafico-linhas').innerHTML = `
        <h2>${acao.longName} (${acao.symbol})</h2>
        <p>Preço Atual: R$ ${acao.regularMarketPrice}</p>
        <p>Variação: ${acao.regularMarketChangePercent.toFixed(2)}%</p>
        <div id="combochart" style="width: 100%; height: 500px;"></div>
      `;

      document.querySelector('.grafico-pizza').innerHTML = `
       <h2>${acao.longName} (${acao.symbol})</h2>
        <p>Preço Atual: R$ ${acao.regularMarketPrice}</p>
        <p>Variação: ${acao.regularMarketChangePercent.toFixed(2)}%</p>
        <div id="piechart" style="width: 100%; height: 500px;"></div>
      `;

      document.querySelector('.grafico-vela').innerHTML = `
      <h2>${acao.longName} (${acao.symbol}) </h2>
      <p>Preço De Abertura Do Dia: R$ ${acao.regularMarketOpen}</p>
      <p>Preço Máximo Do Dia: R$ ${acao.regularMarketDayHigh}</p>
      <p>Preço Minimo Do Dia: R$ ${acao.regularMarketDayLow}</p>
      <p>Preço Atual: R$ ${acao.regularMarketPrice}</p>
      <div id="candlestick_chart" style="width: 100%; height: 500px;"></div>
      `;

      document.querySelector('.grafico-curva').innerHTML = `
      <h2>${acao.longName} (${acao.symbol}) </h2>
      <p>Preço Anterior: R$ ${acao.regularMarketPreviousClose}</p>
      <p>Preço Atual: R$ ${acao.regularMarketPrice}</p>
      <div id="line_chart" style="width: 100%; height: 500px;"></div>
      `

 
      google.charts.setOnLoadCallback(() => {
        drawComboChart(acao);
        drawPieChart(acao);
        drawChart(acao);
        drawLine(acao);
      });

    } else {
      document.querySelector('.grafico-linhas').innerHTML = `<p>Ação não encontrada.</p>`;
      document.querySelector('.grafico-pizza').innerHTML = `<p>Ação não encontrada.</p>`;
      document.querySelector('.grafico-vela').innerHTML = `<p>Ação não encontrada.</p>`;
      document.querySelector('.grafico-curva').innerHTML = `<p>Ação não encontrada.</p>`;
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    document.querySelector('.grafico-linhas').innerHTML = `<p>Erro ao buscar dados.</p>`;
    document.querySelector('.grafico-pizza').innerHTML =  `<p>Erro ao buscar dados.</p>`;
    document.querySelector('.grafico-vela').innerHTML = `<p>Erro ao buscar dados.</p>`;
    document.querySelector('.grafico-curva').innerHTML = `<p>Erro ao buscar dados.</p>`;
  }
});


function drawComboChart(acao) {
  const data = google.visualization.arrayToDataTable([
    ['Tipo', 'Preço Atual', 'Preço Anterior', 'Média'],
    ['Preço', acao.regularMarketPrice, acao.regularMarketPreviousClose, (acao.regularMarketPrice + acao.regularMarketPreviousClose) / 2]
  ]);

  const options = {
    title: 'Preço Atual x Preço Anterior',
    vAxis: { title: 'Valor (R$)' },
    hAxis: { title: 'Categoria' },
    seriesType: 'bars',
    series: { 2: { type: 'line' } },
    colors: ['#3366CC', '#DC3912', '#FF9900'],
    
  };

  const chart = new google.visualization.ComboChart(document.getElementById('combochart'));
  chart.draw(data, options);
}


function drawPieChart(acao) {
  const data = google.visualization.arrayToDataTable([
    ['Categoria', 'Valor'],
    ['Preço Atual', acao.regularMarketPrice],
    ['Preço Anterior', acao.regularMarketPreviousClose]
  ]);

  const options = {
    title: 'Distribuição de Preço',
    is3D : true
  };

  const chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);
}

function drawChart(acao) {
  const data = google.visualization.arrayToDataTable([
      ['Dia', 'Baixo', 'Abertura', 'Fechamento', 'Alto'],
      [new Date(), acao.regularMarketDayLow, acao.regularMarketOpen, acao.regularMarketPrice, acao.regularMarketDayHigh]
    
  ]);

  const options = {
    title: `${acao.longName} (${acao.symbol})`,
    legend: 'none',
    bar: { groupWidth: '80%' }, 
    bold: true,
    candlestick: {
      fallingColor: { strokeWidth: 0, fill: '#a52714' }, 
      risingColor: { strokeWidth: 0, fill: '#0f9d58' }   
  
    }
  }

  const chart = new google.visualization.CandlestickChart(document.getElementById('candlestick_chart'));
  chart.draw(data, options);
}

function  drawLine(acao){
  const data = google.visualization.arrayToDataTable([
    ['Tipo', 'Valor'],
    ['Preço Anterior', acao.regularMarketPreviousClose],
    ['Preço Atual', acao.regularMarketPrice]
  ]);

  const options = {
    title: `${acao.longName} (${acao.symbol}) - Variação semanal`,
    curveType: 'function',
    legend: { position: 'bottom' },
    colors: ['#007bff'],
    lineWidth: 3,
    pointSize: 5
  };
  const chart = new google.visualization.LineChart(document.getElementById('line_chart'));
  chart.draw(data, options);
}