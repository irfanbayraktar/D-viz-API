import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const WebSocketExample = () => {
  const WS_ADDRESS = 'wss://socket.paratic.com/v2/?EIO=4&transport=websocket';
  const WS_USD_TRY_MESSAGE = '42["joinStream", {"codes": ["USD/TRL"]}]';
  const WS_EUR_TRY_MESSAGE = '42["joinStream", {"codes": ["EUR/TRL"]}]';

  const [spotPariteler, setSpotPariteler] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(WS_ADDRESS);

    ws.onopen = () => {
      ws.send('40');
      ws.send(WS_USD_TRY_MESSAGE);
      ws.send(WS_EUR_TRY_MESSAGE);
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
        }
      }

      ws.send('3');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSpotPariteler(prevSpotPariteler => {
        const updatedPariteler = prevSpotPariteler.map(item => {
          return { ...item, show: false };
        });

        return updatedPariteler;
      });
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [spotPariteler]);

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
      <LineChart width={800} height={400} data={spotPariteler} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="buyPrice" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="sellPrice" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
};

export default WebSocketExample;

