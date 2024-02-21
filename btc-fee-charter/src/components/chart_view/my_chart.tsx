// import React, { useRef, useEffect } from 'react';
// import Chart from 'chart.js/auto'; // Import Chart.js

// const MyChart = ({ data, options }) => {
//   const chartRef = useRef(null); // Create a ref to store the chart instance

//   useEffect(() => {
//     if (chartRef.current && data && options) {
//       const myChart = new Chart(chartRef.current, {
//         type: 'bar', // Set the chart type (e.g., bar, line, pie)
//         data: data, // Pass the chart data
//         options: options, // Pass the chart options
//       });

//       return () => {
//         // Cleanup function to destroy the chart instance
//         myChart.destroy();
//       };
//     }
//   }, [data, options]);

//   return <canvas ref={chartRef} />; // Render the canvas element
// };

// export default MyChart;
