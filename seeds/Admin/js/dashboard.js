$(document).ready(() => {
    $.ajax({
        type: "GET",
        url: "/api/v1/admin/getDashboardData",
        headers: {
            'Authorization': token
        },
        success: (result, status, xhr) => {
            console.log(result);
            $("#numberOfUsers").text(result.data.nTotalRegisterUsers);
            $("#numberOfNFTsOnSale").text(result.data.nFixedSaleNFTsCount);
            $("#numberOfNFTsOnAuction").text(result.data.nAuctionNFTsCount);
            $("#numberOfNFTsSold").text(result.data.nSoldNFTsCount);

            var dates = [];
            var count = [];
            for (let I = 0; I < result.data.data.length; I++) {
                var date = new Date(result.data.data[I].date).toUTCString();
                date = date.substr(5, 6)
                dates.push(date)
                count.push(result.data.data[I].count)
            }
            dates.reverse();
            count.reverse();

            console.log('====================================');
            console.log(dates, count);
            console.log('====================================');

            var lineChart = 'activityLine';
            if ($('#' + lineChart).length > 0) {
                var lineCh = document.getElementById(lineChart).getContext("2d");

                var chart = new Chart(lineCh, {
                    // The type of chart we want to create
                    type: 'line',

                    // The data for our dataset
                    data: {
                        labels: dates,
                        datasets: [{
                            label: "",
                            tension: 0.4,
                            backgroundColor: 'transparent',
                            borderColor: '#2c80ff',
                            pointBorderColor: "#2c80ff",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "#2c80ff",
                            pointHoverBorderWidth: 2,
                            pointRadius: 6,
                            pointHitRadius: 6,
                            data: count,
                        }]
                    },

                    // Configuration options go here
                    options: {
                        legend: {
                            display: false
                        },
                        maintainAspectRatio: false,
                        tooltips: {
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    return 'Date : ' + data['labels'][tooltipItem[0]['index']];
                                },
                                label: function (tooltipItem, data) {
                                    return data['datasets'][0]['data'][tooltipItem['index']] + ' Users';
                                }
                            },
                            backgroundColor: '#eff6ff',
                            titleFontSize: 13,
                            titleFontColor: '#6783b8',
                            titleMarginBottom: 10,
                            bodyFontColor: '#9eaecf',
                            bodyFontSize: 14,
                            bodySpacing: 4,
                            yPadding: 15,
                            xPadding: 15,
                            footerMarginTop: 5,
                            displayColors: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    fontSize: 12,
                                    fontColor: '#9eaecf',

                                },
                                gridLines: {
                                    color: "#e5ecf8",
                                    tickMarkLength: 0,
                                    zeroLineColor: '#e5ecf8'
                                },

                            }],
                            xAxes: [{
                                ticks: {
                                    fontSize: 12,
                                    fontColor: '#9eaecf',
                                    source: 'auto',
                                },
                                gridLines: {
                                    color: "transparent",
                                    tickMarkLength: 20,
                                    zeroLineColor: '#e5ecf8',
                                },
                            }]
                        }
                    }
                });
            }
        },
        error: (xhr, status, error) => {
            console.log(xhr);
            return false;
        }
    });
});