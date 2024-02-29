import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import Chart, { ChartOptions } from 'chart.js/auto';
import "chartjs-adapter-date-fns";
import gradient from "chartjs-plugin-gradient";
Chart.register(gradient);
import annotationPlugin from "chartjs-plugin-annotation";
import { ServiceChartType } from '../../chart_data/interface';
import { ChartTimescale, TimescaleOptions } from './chart_timescale';
Chart.register(annotationPlugin);

Chart.defaults.elements.point.pointStyle = false;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.line.borderWidth = 1.5;
Chart.defaults.elements.line.tension = 0;
Chart.defaults.scales.time.adapters.date = { "timezone": "UTC" };
// Chart.defaults.backgroundColor = "rgba(0,255,0,0.2)";
Chart.defaults.scale.ticks.color = "rgb(255,255,255)";
Chart.defaults.scale.grid.color = "rgba(199, 199, 199, 0.2)";

const titleColor = "rgb(211, 211, 211)";
const secondaryColor = "rgb(180, 180, 180)";
const fontFamily = "Courier New, monospace";

const verticalLinePlugin = {
    id: "verticalLine",
    afterDraw(chart, args, options) {
        const { ctx, tooltip } = chart;
        if (tooltip._active && tooltip._active.length) {
            const activePoint = tooltip._active[0];
            const x = activePoint.element.x;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;

            // Draw the vertical line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = options.lineWidth || 1;
            ctx.strokeStyle = options.lineColor || "#000";
            ctx.stroke();
            ctx.restore();
        }
    },
};

Chart.register(verticalLinePlugin);


//This is of type ChartOptions<"line"> but TS compiler confuses Types with this lib.
//INDEX CHART:
const getChartOptions = (chartType: ServiceChartType, timescaleOptions: TimescaleOptions, width: number) => {
    let yMin: number = 0;
    let yText: string;
    let xText: string = "time";
    let title: string;
    let subtitle: string;
    const titleFontSize: number = width < 768 ? 16 : 20;
    const subTitleFontSize: number = width < 768 ? 14 : 16;



    switch (chartType) {
        case ServiceChartType.index:
            yText = "current fee est / moving average";
            title = "Fee Estimate Index"
            subtitle = "current fee estimate/fee estimate moving average";
            break;
        case ServiceChartType.movingAverage:
            yText = "sats/B";
            title = "Fee Estimate Moving Average"
            subtitle = "sum(last n days fee estimates)/count(last n days fee estimates)";
            break;
        case ServiceChartType.feeEstimate:
            yText = "sats/B";
            title = "Fee Estimate History"
            subtitle = "mempool.space (fastest/1-2 blocks)";
            break;

    }

    return {
        responsive: true,
        maintainAspectRatio: false, //false=stretch to fit
        animation: false,
        layout: {
            padding: {
                top: 50,
                bottom: 20, // Adjust the value to meet your needs
            }
        },
        scales: {
            x: {
                min: timescaleOptions.xMin,
                max: timescaleOptions.xMax,
                type: "time",
                time: {
                    unit: timescaleOptions.unit,
                },
                title: {
                    display: true,
                    text: xText,
                    color: secondaryColor,
                    font: {
                        size: 14,
                        family: fontFamily,
                    },
                    padding: { top: 20 }
                },
                ticks: {
                    stepSize: timescaleOptions.stepSize,
                }
            },
            y: {
                min: yMin,
                max: timescaleOptions.yMax,
                title: {
                    display: true,
                    text: yText,
                    color: secondaryColor,
                    font: {
                        size: 14,
                        family: fontFamily,
                    },
                    padding: { bottom: 20 }
                },
            },

        },

        plugins: {

            title: {
                display: true,
                position: "top" as const,
                align: "start" as const,
                padding: { top: 10 },
                text: title,
                color: titleColor,
                font: {
                    family: fontFamily,
                    size: titleFontSize,
                },
            },
            subtitle: {
                display: true,
                position: "top" as const,
                align: "start" as const,
                padding: { top: 10, bottom: 30 },
                text: subtitle,
                color: secondaryColor,
                font: {
                    family: fontFamily,
                    size: subTitleFontSize,
                },
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false
            },
            legend: {

                align: "start" as const,
                position: "bottom" as const,

                labels: {
                    font: {
                        family: fontFamily,
                    },
                    color: secondaryColor,
                    pointStyleWidth: 30,
                    usePointStyle: true,
                    pointStyle: "rectRounded" as const,
                },
            },
            verticalLine: {
                lineWidth: 1.5 as const,
                lineColor: "rgba(255, 0, 0, 0.75)" as const,
            },
            annotation:
                chartType == ServiceChartType.index ?
                    {
                        annotations: {
                            line1: {
                                type: "line" as const,
                                yMin: 1,
                                yMax: 1,
                                borderColor: "rgba(255,255,255,0.75)",
                                borderWidth: 1,
                            },
                        },
                    } : {},
            filler: {},
            //gradient: {},
        }
    }
};

const timescales = ChartTimescale.getRangeOptions();
const defaultTimeScale = timescales[2];

// Type Errors are caused with react component because file is .tsx instead of .jsx 

const ChartView = ({ dataset, chartType }) => {
    const chartContainer = useRef(null);
    const [selectedScale, setSelectedScale] = useState(defaultTimeScale);
    const [chartInstance, setChartInstance] = useState(null);

    // //FOR RESPONSIVE VIEW:
    const [width, height] = useWindowSize();

    function useWindowSize() {
        const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

        useLayoutEffect(() => {
            function updateSize() {
                setSize([window.innerWidth, window.innerHeight]);
            }

            window.addEventListener('resize', updateSize);
            updateSize();

            return () => window.removeEventListener('resize', updateSize);
        }, []);

        return size;
    }

    useEffect(() => {
        const createOrUpdateChartInstance = () => {
            if (chartInstance) {
                chartInstance.destroy();
            }

            if (chartContainer.current && dataset) {
                const timescaleOptions = ChartTimescale.getTimescaleOptions(selectedScale, dataset.datasets);
                const options = getChartOptions(chartType, timescaleOptions, width) as ChartOptions<"line">;

                const newChartInstance = new Chart(chartContainer.current, {
                    type: 'line',
                    data: dataset,
                    options: options,

                });
                setChartInstance(newChartInstance);
            }
        };

        createOrUpdateChartInstance();

        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [dataset]); // Run this effect whenever data changes

    useEffect(() => {
        if (chartInstance) {
            const timescaleOptions = ChartTimescale.getTimescaleOptions(selectedScale, dataset.datasets);
            const updatedOptions = getChartOptions(chartType, timescaleOptions, width) as ChartOptions<"line">;
            chartInstance.options = updatedOptions;
            chartInstance.update();
        }
    }, [selectedScale, chartInstance, width]);

    const handleScaleChange = (e) => {
        setSelectedScale(e.target.value);
    };


    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <select value={selectedScale} onChange={handleScaleChange}>
                    {timescales.map((timescale, index) => (
                        <option key={index} value={timescale}>
                            {timescale}
                        </option>
                    ))}u
                </select>
                <canvas
                    ref={chartContainer}
                    style={{ width: '100%', height: '100%' }}
                ></canvas>

            </div>
        </div>
    );
};

export default ChartView;