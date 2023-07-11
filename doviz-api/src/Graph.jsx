import React from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from 'reactstrap';
import Chart from 'react-apexcharts';

const Graphcontent = ({ data, options }) => {
  return (
    <div className='container_charts'>
      <Card>
        <CardBody>
          <CardTitle tag='h5'>Paritelere Göre Çizgi Grafiği</CardTitle>
          <CardSubtitle className='text-muted' tag='h6'>
           
          </CardSubtitle>
          <Chart
            type='area'
            width='100%'
            height='390'
            options={options}
            series={data}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default Graphcontent;