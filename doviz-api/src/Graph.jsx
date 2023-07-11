import React, { useEffect } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from 'reactstrap';
import Chart from 'react-apexcharts';

const Graphcontent = ({ data, options, selectedCurrency, setDataPoints }) => {
  useEffect(() => {
    const filteredData = data.filter((currencyData) => currencyData.name === selectedCurrency);
    const selectedCurrencyData = filteredData.length > 0 ? filteredData[0] : null;

    if (selectedCurrencyData) {
      setDataPoints(selectedCurrencyData.data);
    } else {
      setDataPoints([]);
    }
  }, [selectedCurrency, setDataPoints]);

  const filteredData = data.filter((currencyData) => currencyData.name === selectedCurrency);
  const selectedCurrencyData = filteredData.length > 0 ? filteredData[0] : null;

  return (
    <div className="container_charts">
      <Card>
        <CardBody>
          <CardTitle tag="h5">Sales Summary</CardTitle>
          <CardSubtitle className="text-muted" tag="h6">
            Yearly Sales Report
          </CardSubtitle>
          {selectedCurrencyData ? (
            <Chart
              type="area"
              width="100%"
              height="390"
              options={options}
              series={selectedCurrencyData.data.length > 0 ? [selectedCurrencyData] : []}
            />
          ) : (
            <p>No data available for the selected currency.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Graphcontent;
