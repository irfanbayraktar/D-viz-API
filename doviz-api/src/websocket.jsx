import React, { useEffect, useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import Graphcontent from './Graph'

const WebSocketExample = () => {
  const CanvasJSChart = CanvasJSReact.CanvasJSChart;

  const WS_ADDRESS = 'wss://socket.paratic.com/v2/?EIO=4&transport=websocket';
  const WS_USD_TRY_MESSAGE = '42["joinStream", {"codes": ["USD/TRL"]}]';
  const WS_EUR_TRY_MESSAGE = '42["joinStream", {"codes": ["EUR/TRL"]}]';
  const WS_RUB_TRY_MESSAGE = '42["joinStream", {"codes": ["RUB/TRL"]}]';
  const WS_CAD_TRY_MESSAGE = '42["joinStream", {"codes": ["CAD/TRL"]}]';

  const [spotPariteler, setSpotPariteler] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);

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
          setSpotPariteler(prevSpotPariteler => {
            const existingItem = prevSpotPariteler.find(item => item.name === name);

            if (existingItem) {
              return prevSpotPariteler.map(item => {
                if (item.name === name) {
                  return { ...item, sellPrice, buyPrice, show: true };
                }
                return item;
              });
            } else {
              return [...prevSpotPariteler, { name, sellPrice, buyPrice, show: true }];
            }
          });

          setDataPoints(prevDataPoints => {
            const newDataPoints = [...prevDataPoints];
            const newDataPoint = { x: name, y: parseFloat(buyPrice) };
            const existingDataPointIndex = newDataPoints.findIndex(dataPoint => dataPoint.x === name);

            if (existingDataPointIndex !== -1) {
              // Veri noktası zaten varsa güncelle
              newDataPoints[existingDataPointIndex] = newDataPoint;
            } else {
              // Yeni veri noktasını ekle
              newDataPoints.push(newDataPoint);
            }

            return newDataPoints;
          });
        }
      }

      ws.send('3');
    };

    return () => {
      // ws.close();
    };
  }, []);

  const chartData = [
    {
      name: 'Dolar',
      data: dataPoints,
    },
  ];

  const chartOptions = {
    // ... diğer grafik seçenekleri
  };

  return (
    <div>
      <h1>Spot Pariteler</h1>

      <div className="spot-list">
        {spotPariteler.map(item => (
          <div className="item" key={item.name}>
            <p>{item.name} - Alış: {item.buyPrice}, Satış: {item.sellPrice}</p>
          </div>
        ))}
      </div>

      <Graphcontent data={chartData} options={chartOptions} />
    </div>
  );
};

export default WebSocketExample;
