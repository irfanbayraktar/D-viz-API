import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from 'reactstrap';
import ApexCharts from 'apexcharts';

const HisseSenedi = () => {
  const WS_ADDRESS = 'wss://socket.paratic.com/v2/?EIO=4&transport=websocket';
  const WS_XU100_MESSAGE = '42["joinStream", {"codes": ["XU100"]}]';
  const WS_XU050_MESSAGE = '42["joinStream", {"codes": ["XU050"]}]';
  const WS_XU030_MESSAGE = '42["joinStream", {"codes": ["XU030"]}]';

  const [spotPariteler, setSpotPariteler] = useState({
    'XU100': { buyPrices: [], sellPrices: [] },
    'XU050': { buyPrices: [], sellPrices: [] },
    'XU030': { buyPrices: [], sellPrices: [] },
  });
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [chart, setChart] = useState(null);
  const [priceChange, setPriceChange] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_ADDRESS);

    ws.onopen = () => {
      ws.send('40');
      ws.send(WS_XU100_MESSAGE);
      ws.send(WS_XU050_MESSAGE);
      ws.send(WS_XU030_MESSAGE);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data.substring(event.data.indexOf('[')));

      if (data[0] === 'hisse_senetleri') {
        const spotData = JSON.parse(data[1].replace(/\\/g, ''));
        const [name, priceData] = Object.entries(spotData)[0];
        //const [sellPrice, buyPrice] = priceData.split('|').slice(0, 2);
        const [sellPrice, buyPrice] = priceData.split('|').find((price) => price.trim() !== '').split('||');



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
            console.log(name)
            console.log(buyPrice);
            console.log(sellPrice);

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

  const getBISTCode = (name) => {
    switch (name) {
      case 'XU100':
        return 'BIST100';
      case 'XU050':
        return 'BIST50';
      case 'XU030':
        return 'BIST30';
      default:
        return '';
    };
}

  return (
    <div>
      <h1>Hisse Senedi</h1>

      <div className="buttons">
        <button onClick={() => handleCurrencyClick('XU100')}>BIST100</button>
        <button onClick={() => handleCurrencyClick('XU050')}>BIST50</button>
        <button onClick={() => handleCurrencyClick('XU030')}>BIST30</button>
      </div>

      <div className="spot-list">
        {Object.entries(spotPariteler).map(([name, item]) => (
          <div className="item" key={name}>
            <p>{getBISTCode(name)}</p>
            <p>
            
               Değer: <span className={`sell-price ${priceChange ? 'price-change' : ''}`}>{item.sellPrices[item.sellPrices.length - 1]}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="container_charts">
        {selectedCurrency && (
          <Card>
            <CardBody>
              <CardTitle tag="h5"></CardTitle>
              <CardSubtitle className="text-muted" tag="h6">
                
              </CardSubtitle>
              <div id="chart"></div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HisseSenedi;
