import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from 'reactstrap';
import ApexCharts from 'apexcharts';

const WebSocketExample = () => {
  const WS_ADDRESS = 'wss://socket.paratic.com/v2/?EIO=4&transport=websocket';
  const WS_USD_TRY_MESSAGE = '42["joinStream", {"codes": ["USD/TRL"]}]';
  const WS_EUR_TRY_MESSAGE = '42["joinStream", {"codes": ["EUR/TRL"]}]';
  const WS_RUB_TRY_MESSAGE = '42["joinStream", {"codes": ["RUB/TRL"]}]';
  const WS_CAD_TRY_MESSAGE = '42["joinStream", {"codes": ["CAD/TRL"]}]';

  const [spotPariteler, setSpotPariteler] = useState({
    'USD/TRL': { buyPrices: [], sellPrices: [] },
    'EUR/TRL': { buyPrices: [], sellPrices: [] },
    'RUB/TRL': { buyPrices: [], sellPrices: [] },
    'CAD/TRL': { buyPrices: [], sellPrices: [] },
  });
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [chart, setChart] = useState(null);
  const [priceChange, setPriceChange] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_ADDRESS);

    ws.onopen = () => {
      ws.send('40');
      ws.send(WS_USD_TRY_MESSAGE);
      ws.send(WS_EUR_TRY_MESSAGE);
      ws.send(WS_RUB_TRY_MESSAGE);
      ws.send(WS_CAD_TRY_MESSAGE);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data.substring(event.data.indexOf('[')));

      if (data[0] === 'spot_pariteler') {
        const spotData = JSON.parse(data[1].replace(/\\/g, ''));
        const [name, priceData] = Object.entries(spotData)[0];
        const [sellPrice, buyPrice] = priceData.split('|').slice(0, 2);

        if (sellPrice !== '' && buyPrice !== '') {
          setSpotPariteler((prevSpotPariteler) => {
            const prevBuyPrice = prevSpotPariteler[name].buyPrices[prevSpotPariteler[name].buyPrices.length - 1];
            const prevSellPrice = prevSpotPariteler[name].sellPrices[prevSpotPariteler[name].sellPrices.length - 1];

            const updatedSpotPariteler = {
              ...prevSpotPariteler,
              [name]: {
                buyPrices: [...prevSpotPariteler[name].buyPrices, parseFloat(buyPrice)],
                sellPrices: [...prevSpotPariteler[name].sellPrices, parseFloat(sellPrice)],
              },
            };

            if (parseFloat(buyPrice) > prevBuyPrice || parseFloat(sellPrice) > prevSellPrice) {
              setPriceChange(true);
              setTimeout(() => setPriceChange(false), 500);
            }

            return updatedSpotPariteler;
          });
        }
      }

      ws.send('3');
    };

    return () => {
      // ws.close();
    };
  }, []);

  const handleCurrencyClick = (currency) => {
    setSelectedCurrency(currency);
  };

  const getPriceChangeIndicator = (prices, direction) => {
    if (prices.length < 2) {
      return null;
    }

    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];

    if (currentPrice > previousPrice && direction === 'up') {
      return <span className="arrow up">&#8593;</span>;
    } else if (currentPrice < previousPrice && direction === 'down') {
      return <span className="arrow down">&#8595;</span>;
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (selectedCurrency) {
      const chartData = {
        series: [
          { name: 'Alış Fiyatı', data: spotPariteler[selectedCurrency].buyPrices },
          { name: 'Satış Fiyatı', data: spotPariteler[selectedCurrency].sellPrices },
        ],
        xaxis: {
          categories: spotPariteler[selectedCurrency].buyPrices.map((_, index) => index + 1),
        },
      };

      const options = {
        chart: {
          type: 'line',
          height: 390,
        },
        series: chartData.series,
        xaxis: chartData.xaxis,
        yaxis: {
          labels: {
            formatter: function (value) {
              return value.toFixed(2);
            },
          },
        },
        title: {
          text: `Parite: ${selectedCurrency}`,
          align: 'center',
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
          },
        },
      };

      if (chart) {
        chart.updateSeries(chartData.series);
        chart.updateOptions(options);
      } else {
        const chartElement = document.getElementById('chart');

        if (chartElement) {
          const newChart = new ApexCharts(chartElement, options);
          newChart.render();
          setChart(newChart);
        }
      }
    }
  }, [selectedCurrency, spotPariteler]);

  useEffect(() => {
    let interval;

    if (selectedCurrency) {
      interval = setInterval(() => {
        ws.send('3');
      }, 5000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [selectedCurrency]);

  return (
    <div>
      <h1>Spot Pariteler</h1>

      <div className="buttons">
        <button onClick={() => handleCurrencyClick('USD/TRL')}>USD/TRL</button>
        <button onClick={() => handleCurrencyClick('EUR/TRL')}>EUR/TRL</button>
        <button onClick={() => handleCurrencyClick('RUB/TRL')}>RUB/TRL</button>
        <button onClick={() => handleCurrencyClick('CAD/TRL')}>CAD/TRL</button>
      </div>

      <div className="spot-list">
        {Object.entries(spotPariteler).map(([name, item]) => (
          <div className="item" key={name}>
            <p>{name}</p>
            <p>
                Alış: <span className={`buy-price ${priceChange ? 'price-change' : ''}`}>{item.buyPrices[item.buyPrices.length - 1]}</span> <br />
               Satış: <span className={`sell-price ${priceChange ? 'price-change' : ''}`}>{item.sellPrices[item.sellPrices.length - 1]}</span>
            </p>






          </div>
        ))}
      </div>

      <div className="container_charts">
        {selectedCurrency && (
          <Card>
            <CardBody>
              <CardTitle tag="h5">Sales Summary</CardTitle>
              <CardSubtitle className="text-muted" tag="h6">
                Yearly Sales Report
              </CardSubtitle>
              <div id="chart"></div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WebSocketExample;
